const express = require("express");
const router = express.Router();

const Project = require("../models/projects.model");
const User = require("../models/usermodel");
const ProjectPermission = require("../models/projectPermissionModel");
const { getEffectivePermissions } = require("../utils/permission.utils");
const verifyToken = require("../middleware/verifyToken");
const verifyRole = require("../middleware/verifyRole");

// ─────────────────────────────────────────────────────────────────────────────
// GET MY EFFECTIVE PERMISSIONS FOR A PROJECT
// GET /v1/:projectId/permissions/me
// Called by both SingleProjectDetail and EditProjectDetail on load, once,
// to decide what to render. Every logged-in user can call this for
// themselves — no admin check needed, since it only ever returns the
// caller's own access.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/v1/:projectId/permissions/me", verifyToken, async (req, res) => {
    try {
        const { projectId } = req.params;
        const user = await User.findById(req.userId).select("tag");

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized." });
        }

        // admin bypass — full access everywhere, not derived from a tag
        // default table (there isn't one anymore).
        if (user.tag === "admin") {
            const fullAccess = {};
            ProjectPermission.SECTIONS.forEach((section) => {
                fullAccess[section] = { view: true, edit: true };
            });
            return res.status(200).json({
                success: true,
                message: "Permissions fetched successfully.",
                data: fullAccess
            });
        }

        const permissions = await getEffectivePermissions(projectId, req.userId);

        return res.status(200).json({
            success: true,
            message: "Permissions fetched successfully.",
            data: permissions
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// LIST ALL PROJECT-SPECIFIC PERMISSION ASSIGNMENTS FOR A PROJECT
// GET /v1/:projectId/permissions
// Admin only. Returns every user who has been explicitly granted access
// on this project. Users with no entry here have NO access — there are
// no tag-based defaults to fall back to.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/v1/:projectId/permissions", verifyToken, verifyRole("admin"), async (req, res) => {
    try {
        const { projectId } = req.params;

        const assignments = await ProjectPermission.find({ project: projectId })
            .populate("user", "name email cid tag")
            .populate("grantedBy", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Project permissions fetched successfully.",
            data: assignments
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// ASSIGN / UPDATE A USER'S PROJECT-SPECIFIC PERMISSIONS
// PUT /v1/:projectId/permissions/:userId
// Admin only. Body: { permissions: { basic: {view,edit}, location: {...}, ... } }
// Upserts — creates the override if it doesn't exist yet, otherwise
// replaces the whole permissions matrix (send the full 12-section object
// each time, not a partial patch).
// ─────────────────────────────────────────────────────────────────────────────
router.put("/v1/:projectId/permissions/:userId", verifyToken, verifyRole("admin"), async (req, res) => {
    try {
        const { projectId, userId } = req.params;
        const { permissions } = req.body;

        if (!permissions || typeof permissions !== "object") {
            return res.status(400).json({ success: false, message: "permissions object is required." });
        }

        const [project, targetUser] = await Promise.all([
            Project.findById(projectId),
            User.findById(userId).select("tag")
        ]);

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found." });
        }
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const updated = await ProjectPermission.findOneAndUpdate(
            { project: projectId, user: userId },
            {
                project: projectId,
                user: userId,
                tag: targetUser.tag,
                permissions,
                grantedBy: req.userId
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).populate("user", "name email cid tag");

        return res.status(200).json({
            success: true,
            message: "Permissions updated successfully.",
            data: updated
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// REMOVE A USER'S PROJECT-SPECIFIC GRANT
// DELETE /v1/:projectId/permissions/:userId
// Admin only. Deletes the grant. Since there are no tag-based defaults,
// this leaves the user with NO access to any section of this project
// until an admin grants access again.
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/v1/:projectId/permissions/:userId", verifyToken, verifyRole("admin"), async (req, res) => {
    try {
        const { projectId, userId } = req.params;

        await ProjectPermission.findOneAndDelete({ project: projectId, user: userId });

        return res.status(200).json({
            success: true,
            message: "Access removed — this user now has no access to any section of this project."
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;