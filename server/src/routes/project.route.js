const express = require("express");
const router = express.Router();

const projectService = require("../services/project.service");
const verifyToken = require("../middleware/verifyToken");
const verifyRole = require("../middleware/verifyRole");

// ─── role shorthands for this module ─────────────────────────────────────────
const allUsers = verifyRole("admin", "staff", "client");
const adminOnly = verifyRole("admin");

router.post("/create", verifyToken, adminOnly, async (req, res) => {
    try {
        const adminUserId = req.userId;
        const payload = req.body;

        const project = await projectService.createProject(adminUserId, payload);

        return res.status(201).json({
            success: true,
            message: "Project created successfully.",
            data: project,
        });
    } catch (error) {
        // Duplicate projectId (or any unique field)
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue || {})[0] || "field";
            return res.status(409).json({
                success: false,
                message: `${field} "${error.keyValue?.[field]}" already exists.`,
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});
module.exports = router;