
const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const verifyRole = require("../middleware/verifyRole");
const Task = require("../models/task.model");
const Project = require("../models/projects.model");

// ─── role shorthands for this module ─────────────────────────────────────────
const allUsers = verifyRole("admin", "staff", "client");

// ─── CREATE TASK ──────────────────────────────────────────────────────────────
router.post("/create", verifyToken, allUsers, async (req, res) => {
    try {

        const {
            projectId,
            vertical,
            title,
            description,
            priority,
            allottedTo,
            startDate,
            deadline
        } = req.body;

        const allottedBy = req.userId;

        // ─── Validate required fields ────────────────────────────────────────
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Project ID is required."
            });
        }

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Task title is required."
            });
        }

        if (!allottedTo || !Array.isArray(allottedTo) || allottedTo.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one user must be allotted to the task."
            });
        }

        if (!deadline) {
            return res.status(400).json({
                success: false,
                message: "Deadline is required."
            });
        }

        // ─── Check project exists ────────────────────────────────────────────
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        // ─── Create task ─────────────────────────────────────────────────────
        const task = await Task.create({
            project: projectId,
            vertical,
            title,
            description,
            priority,
            allottedTo,
            allottedBy,
            startDate,
            deadline
        });

        // ─── Add task to project's tasks array ────────────────────────────────
        project.tasks.push(task._id);

        await project.save();

        return res.status(201).json({
            success: true,
            message: "Task created successfully.",
            data: task
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE / SUBMIT TASK AND MARK TASK AS SUBMITTED OR COMPLETED
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/submit/:taskId", verifyToken, allUsers, async (req, res) => {
    try {

        const { taskId } = req.params;

        const {
            remark,
            images,
            status
        } = req.body;

        // Find task
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        // Check whether logged-in user is allotted to this task
        const isAllottedUser = task.allottedTo.some(
            userId => userId.toString() === req.userId.toString()
        );

        if (!isAllottedUser) {
            return res.status(403).json({
                success: false,
                message: "You are not allotted to this task."
            });
        }

        // Validate status if provided
        const validStatuses = [
            "pending",
            "in_progress",
            "submitted",
            "completed",
            "overdue",
            "rejected"
        ];

        if (status !== undefined && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task status."
            });
        }

        // Validate images if provided
        if (images !== undefined && !Array.isArray(images)) {
            return res.status(400).json({
                success: false,
                message: "Images must be an array."
            });
        }

        // Update remark
        if (remark !== undefined) {
            task.latestRemark = remark;
        }

        // Update images
        if (images !== undefined) {

            task.completion.images = images.map(image => ({
                name: image.name,
                url: image.url,
                uploadedAt: new Date()
            }));

        }

        // Update completion information
        if (
            remark !== undefined ||
            images !== undefined ||
            status === "submitted" ||
            status === "completed"
        ) {
            task.completion.submittedBy = req.userId;
            task.completion.submittedAt = new Date();
        }

        // Update status if provided
        if (status !== undefined) {
            task.status = status;
        }

        // Set completed information
        if (status === "completed") {
            task.completedAt = new Date();
            task.verifiedBy = req.userId;
            task.verifiedAt = new Date();
        }

        await task.save();

        return res.status(200).json({
            success: true,
            message: "Task updated successfully.",
            data: task
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});




module.exports = router;
 