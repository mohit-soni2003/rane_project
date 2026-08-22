const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const verifyRole = require("../middleware/verifyRole");
const Task = require("../models/task.model");
const Project = require("../models/projects.model");

// ─── role shorthands ──────────────────────────────────────────────────────────
const allUsers = verifyRole("admin", "staff", "client");

// Only admin/staff can manage allotments & documents on a task — adjust if
// clients should also be allowed to do this.
const canManageTask = verifyRole("admin", "staff");

// ─────────────────────────────────────────────────────────────────────────────
// CREATE TASK
// ─────────────────────────────────────────────────────────────────────────────
router.post("/create", verifyToken, allUsers, async (req, res) => {
    try {

        const {
            projectId,
            relatedDocuments,   // array of document _ids from project.documents[]
            vertical,
            title,
            description,
            priority,
            allottedTo,         // array of user ids
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

        // ─── Validate relatedDocuments (if provided) against the project ────
        if (relatedDocuments !== undefined) {

            if (!Array.isArray(relatedDocuments)) {
                return res.status(400).json({
                    success: false,
                    message: "relatedDocuments must be an array of document IDs."
                });
            }

            const invalidDocId = relatedDocuments.find(
                docId => !project.documents.id(docId)
            );

            if (invalidDocId) {
                return res.status(400).json({
                    success: false,
                    message: `Document ${invalidDocId} does not exist on this project.`
                });
            }
        }

        // ─── Build allottedTo sub-documents ──────────────────────────────────
        const allottedToEntries = allottedTo.map(userId => ({
            user: userId,
            status: "pending"
        }));

        // ─── Create task ─────────────────────────────────────────────────────
        const task = await Task.create({
            project: projectId,
            relatedDocuments,
            vertical,
            title,
            description,
            priority,
            allottedTo: allottedToEntries,
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
// ADD USER TO TASK
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/add-user/:id/:userId", verifyToken, canManageTask, async (req, res) => {
    try {

        const { id, userId } = req.params;

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        const alreadyAllotted = task.allottedTo.some(
            entry => entry.user.toString() === userId.toString()
        );

        if (alreadyAllotted) {
            return res.status(409).json({
                success: false,
                message: "User is already allotted to this task."
            });
        }

        task.allottedTo.push({
            user: userId,
            status: "pending"
        });

        await task.save();

        return res.status(200).json({
            success: true,
            message: "User added to task successfully.",
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
// REMOVE USER FROM TASK
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/remove-user/:id/:userId", verifyToken, canManageTask, async (req, res) => {
    try {

        const { id, userId } = req.params;

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        const wasAllotted = task.allottedTo.some(
            entry => entry.user.toString() === userId.toString()
        );

        if (!wasAllotted) {
            return res.status(404).json({
                success: false,
                message: "User is not allotted to this task."
            });
        }

        if (task.allottedTo.length === 1) {
            return res.status(400).json({
                success: false,
                message: "Cannot remove the only user allotted to this task."
            });
        }

        task.allottedTo = task.allottedTo.filter(
            entry => entry.user.toString() !== userId.toString()
        );

        await task.save();

        return res.status(200).json({
            success: true,
            message: "User removed from task successfully.",
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
// ADD DOCUMENT TO TASK
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/add-document/:id/:documentId", verifyToken, canManageTask, async (req, res) => {
    try {

        const { id, documentId } = req.params;

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project linked to this task was not found."
            });
        }

        const documentExists = project.documents.id(documentId);

        if (!documentExists) {
            return res.status(400).json({
                success: false,
                message: "Document does not exist on this project."
            });
        }

        const alreadyLinked = task.relatedDocuments.some(
            docId => docId.toString() === documentId.toString()
        );

        if (alreadyLinked) {
            return res.status(409).json({
                success: false,
                message: "Document is already linked to this task."
            });
        }

        task.relatedDocuments.push(documentId);

        await task.save();

        return res.status(200).json({
            success: true,
            message: "Document added to task successfully.",
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
// REMOVE DOCUMENT FROM TASK
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/remove-document/:id/:documentId", verifyToken, canManageTask, async (req, res) => {
    try {

        const { id, documentId } = req.params;

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        const wasLinked = task.relatedDocuments.some(
            docId => docId.toString() === documentId.toString()
        );

        if (!wasLinked) {
            return res.status(404).json({
                success: false,
                message: "Document is not linked to this task."
            });
        }

        task.relatedDocuments = task.relatedDocuments.filter(
            docId => docId.toString() !== documentId.toString()
        );

        await task.save();

        return res.status(200).json({
            success: true,
            message: "Document removed from task successfully.",
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
// UPDATE ALLOTTED USER'S OWN STATUS & REMARK
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/update-status/:id/:userId", verifyToken, async (req, res) => {
    try {

        const { id, userId } = req.params;
        const { status, remark } = req.body;

        const validStatuses = [
            "pending",
            "in_progress",
            "submitted",
            "completed",
            "rejected"
        ];

        if (status !== undefined && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status."
            });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        const entry = task.allottedTo.find(
            a => a.user.toString() === userId.toString()
        );

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "User is not allotted to this task."
            });
        }

        if (status !== undefined) {
            entry.status = status;

            if (status === "submitted") {
                entry.submittedAt = new Date();
            }
        }

        if (remark !== undefined) {
            entry.remark = remark;
            task.latestRemark = remark;
        }

        // entry.completedAt is auto-stamped/cleared by the Task pre-save hook

        await task.save();

        return res.status(200).json({
            success: true,
            message: "Status updated successfully.",
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
// ADD IMAGE(S) TO ALLOTTED USER'S SUBMISSION
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/add-image/:id/:userId", verifyToken, async (req, res) => {
    try {

        const { id, userId } = req.params;
        const { images } = req.body;   // [{ name, url }]

        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({
                success: false,
                message: "images must be a non-empty array."
            });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        const entry = task.allottedTo.find(
            a => a.user.toString() === userId.toString()
        );

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "User is not allotted to this task."
            });
        }

        const newImages = images.map(image => ({
            name: image.name,
            url: image.url,
            uploadedAt: new Date()
        }));

        entry.images.push(...newImages);

        await task.save();

        return res.status(200).json({
            success: true,
            message: "Image(s) added successfully.",
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
// VERIFY / UPDATE OVERALL TASK STATUS
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/verify/:id", verifyToken, async (req, res) => {
    try {

        const { id } = req.params;
        const { status, remark } = req.body;

        const validStatuses = [
            "pending",
            "in_progress",
            "submitted",
            "completed",
            "overdue",
            "rejected"
        ];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "A valid status is required."
            });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        // ─── Update overall status ────────────────────────────────────────────
        task.status = status;

        if (remark !== undefined) {
            task.latestRemark = remark;
        }

        // ─── If marked completed, stamp completion + verification details ────
        if (status === "completed") {
            task.completedAt = new Date();
            task.verifiedBy = req.userId;
            task.verifiedAt = new Date();
        }

        // ─── Log the change in the status history trail ──────────────────────
        task.statusHistory.push({
            status,
            updatedBy: req.userId,
            remark
        });

        await task.save();

        return res.status(200).json({
            success: true,
            message: "Task status updated successfully.",
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
// GET ALL TASKS FOR A PROJECT
// ─────────────────────────────────────────────────────────────────────────────
router.get("/project/:projectId", verifyToken, async (req, res) => {
    try {

        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        const tasks = await Task.find({ project: projectId })
            .populate("allottedTo.user", "name email")
            .populate("allottedBy", "name email")
            .populate("verifiedBy", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Tasks fetched successfully.",
            data: tasks
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL TASKS ALLOTTED TO A PARTICULAR USER
// ─────────────────────────────────────────────────────────────────────────────
router.get("/user/:userId", verifyToken, async (req, res) => {
    try {

        const { userId } = req.params;

        const tasks = await Task.find({ "allottedTo.user": userId })
            .populate("allottedTo.user", "name email")
            .populate("allottedBy", "name email")
            .populate("verifiedBy", "name email")
            .populate("project", "projectId projectName")
            .sort({ deadline: 1 });

        return res.status(200).json({
            success: true,
            message: "Tasks fetched successfully.",
            data: tasks
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET SINGLE TASK
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", verifyToken, async (req, res) => {
    try {

        const { id } = req.params;

        const task = await Task.findById(id)
            .populate("allottedTo.user", "name email")
            .populate("allottedBy", "name email")
            .populate("verifiedBy", "name email")
            .populate("statusHistory.updatedBy", "name email")
            .populate("project", "projectId projectName");

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task fetched successfully.",
            data: task
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
});

module.exports = router;