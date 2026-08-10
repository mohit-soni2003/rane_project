const express = require("express");
const router = express.Router();

const projectService = require("../services/project.service");
const verifyToken = require("../middleware/verifyToken");
const verifyRole = require("../middleware/verifyRole");
const Project = require("../models/projects.model");
const Task = require("../models/task.model");
const {
    ADMIN,
    COO,
    CFO,
    CEO,
    DIRECTOR
} = require("../../keys");

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


// ─────────────────────────────────────────────────────────────────────────────
// GET PROJECT DETAILS BY PROJECT ID
// ─────────────────────────────────────────────────────────────────────────────

router.get("/details/:projectId", verifyToken, allUsers, async (req, res) => {
    try {

        const { projectId } = req.params;

        const project = await Project.findById(projectId)
            .populate("createdBy", "name email profile")
            .populate("projectManager", "name email profile")
            .populate("siteEngineer", "name email profile")
            .populate("safetyEngineer", "name email profile")
            .populate("currentAuthority", "name email profile")
            .populate("tasks")
            .populate("documents.uploadedBy", "name email profile")
            .populate("approvals.actor", "name email profile")
            .populate("teams.lead", "name email profile")
            .populate("teams.members", "name email profile")
            .populate("teams.createdBy", "name email profile");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project details retrieved successfully.",
            data: project
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

router.get("/all", verifyToken, allUsers, async (req, res) => {
    try {
        const projects = await projectService.getAllProjects();

        return res.status(200).json({
            success: true,
            message: "Projects retrieved successfully.",
            data: projects,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});
// list the project pending for approval by authority
router.get("/pending", verifyToken, async (req, res) => {
    try {
        const projects = await projectService.getPendingForAuthority(req.userId);
        return res.status(200).json({ success: true, data: projects });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});


// Forward / Approve / Return / Reject Project
router.patch("/forward/:projectId", verifyToken, async (req, res) => {
    try {

        const { projectId } = req.params;
        const {action,status, remark,nextAuthority } = req.body;
        const userId = req.userId;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        // Only current authority can take action
        if (
            project.currentAuthority &&
            project.currentAuthority.toString() !== req.userId
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to take action on this project."
            });
        }

        // Find current actor stage from logged in user
        let actorStage = "";

        if (req.userId === ADMIN) {
            actorStage = "ADMIN";
        } else if (req.userId === COO) {
            actorStage = "COO";
        } else if (req.userId === CFO) {
            actorStage = "CFO";
        } else if (req.userId === CEO) {
            actorStage = "CEO";
        } else if (req.userId === DIRECTOR) {
            actorStage = "DIRECTOR";
        } else {
            actorStage = "UNKNOWN";
        }



        // Save approval history
        project.approvals.push({
            stage: actorStage,
            actor: req.userId,
            action: action,
            remark,
            actedAt: new Date()
        });

        project.latestRemark = remark;
        project.status = status;
        // Update current authority
        project.currentAuthority = nextAuthority;

        const approvalStage =
            req.userId === COO ? "COO" :
                req.userId === CFO ? "CFO" :
                    req.userId === CEO ? "CEO" :
                        "OTHER";

        await project.save();

        return res.status(200).json({
            success: true,
            message: `Project ${action} successfully.`,
            data: project
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PROJECT MANAGER
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/update-project-manager/:projectId", verifyToken, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { projectManager } = req.body;

        if (!projectManager) {
            return res.status(400).json({
                success: false,
                message: "Project manager userId is required."
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        project.projectManager = projectManager;

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Project manager updated successfully.",
            data: project
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});


// ─────────────────────────────────────────────────────────────────────────────
// UPDATE SITE ENGINEER
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/update-site-engineer/:projectId", verifyToken, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { siteEngineer } = req.body;

        if (!siteEngineer) {
            return res.status(400).json({
                success: false,
                message: "Site engineer userId is required."
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        project.siteEngineer = siteEngineer;

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Site engineer updated successfully.",
            data: project
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});


// ─────────────────────────────────────────────────────────────────────────────
// UPDATE SAFETY ENGINEER
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/update-safety-engineer/:projectId", verifyToken, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { safetyEngineer } = req.body;

        if (!safetyEngineer) {
            return res.status(400).json({
                success: false,
                message: "Safety engineer userId is required."
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        project.safetyEngineer = safetyEngineer;

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Safety engineer updated successfully.",
            data: project
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});


// ─────────────────────────────────────────────────────────────────────────────
// UPDATE COO OPERATION
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/coo-operation/:projectId", verifyToken, async (req, res) => {
    try {

        const { projectId } = req.params;

        const {
            operation,
            status,
            date,
            remark
        } = req.body;

        // Valid COO operations
        const validOperations = [
            "siteInspection",
            "resourceAssessment",
            "manpowerAssessment",
            "execution",
            "riskAssessment"
        ];

        // Check operation
        if (!operation) {
            return res.status(400).json({
                success: false,
                message: "Operation is required."
            });
        }

        if (!validOperations.includes(operation)) {
            return res.status(400).json({
                success: false,
                message: "Invalid COO operation."
            });
        }

        // Check project
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        // Check COO operations object
        if (!project.cooOperations) {
            project.cooOperations = {};
        }

        // Check particular operation
        if (!project.cooOperations[operation]) {
            project.cooOperations[operation] = {};
        }

        // Update only provided fields
        if (status !== undefined) {
            project.cooOperations[operation].status = status;
        }

        if (date !== undefined) {
            project.cooOperations[operation].date = date;
        }

        if (remark !== undefined) {
            project.cooOperations[operation].remark = remark;
        }

        // Current logged-in user
        project.cooOperations[operation].completedBy = req.userId;

        await project.save();

        return res.status(200).json({
            success: true,
            message: `${operation} updated successfully.`,
            data: project.cooOperations[operation]
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});


// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PROJECT FINANCIAL DETAILS
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/financial-details/:projectId", verifyToken, async (req, res) => {
    try {

        const { projectId } = req.params;

        const {
            estimatedCost,
            projectCost,
            paidAmount
        } = req.body;

        // Find project
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        // Update estimated cost if provided
        if (estimatedCost !== undefined) {
            project.estimatedCost = estimatedCost;
        }

        // Update project cost if provided
        if (projectCost !== undefined) {
            project.projectCost = projectCost;
        }

        // Update paid amount if provided
        if (paidAmount !== undefined) {
            project.paidAmount = paidAmount;
        }

        // Automatically calculate pending amount
        project.pendingAmount =
            project.projectCost - project.paidAmount;

        // Prevent negative pending amount
        if (project.pendingAmount < 0) {
            return res.status(400).json({
                success: false,
                message: "Paid amount cannot be greater than project cost."
            });
        }

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Project financial details updated successfully.",
            data: {
                estimatedCost: project.estimatedCost,
                projectCost: project.projectCost,
                paidAmount: project.paidAmount,
                pendingAmount: project.pendingAmount
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});
 


// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD / ADD SINGLE PROJECT DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/document/:projectId", verifyToken, allUsers, async (req, res) => {
    try {

        const { projectId } = req.params;

        const {
            name,
            url,
            documentType
        } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Document name is required."
            });
        }

        if (!url) {
            return res.status(400).json({
                success: false,
                message: "Document URL is required."
            });
        }

        if (!documentType) {
            return res.status(400).json({
                success: false,
                message: "Document type is required."
            });
        }

        // Validate document type
        const validDocumentTypes = [
            "tender_document",
            "loa",
            "agreement",
            "boq",
            "drawings",
            "nit"
        ];

        if (!validDocumentTypes.includes(documentType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid document type."
            });
        }

        // Find project
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        // Add single document
        const document = {
            name,
            url,
            documentType,
            uploadedBy: req.userId,
            uploadedAt: new Date()
        };

        project.documents.push(document);

        await project.save();

        return res.status(201).json({
            success: true,
            message: "Document uploaded successfully.",
            data: document
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

module.exports = router;





