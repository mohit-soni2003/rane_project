const express = require("express");
const router = express.Router();

const projectService = require("../services/project.service");
const verifyToken = require("../middleware/verifyToken");
const verifyRole = require("../middleware/verifyRole");
const Project = require("../models/projects.model");
const User = require("../models/usermodel");
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


// ─────────────────────────────────────────────────────────────────────────────
// CREATE PROJECT - V1 (BASIC DETAILS ONLY -> STATUS: DRAFT)
// Accepts: projectId, projectName, description
// Everything else (location, advanced details, financials, etc.) is added
// later via separate update routes once the project exists as a draft.
// ─────────────────────────────────────────────────────────────────────────────

router.post("/v1/create", verifyToken, adminOnly, async (req, res) => {
    try {
        const adminUserId = req.userId;
        const { projectId, projectName, description } = req.body;

        // Validate required fields
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Project ID is required."
            });
        }

        if (!projectName) {
            return res.status(400).json({
                success: false,
                message: "Project name is required."
            });
        }

        const project = await Project.create({
            projectId,
            projectName,
            description,
            status: "draft",
            createdBy: adminUserId,
            currentAuthority: adminUserId
        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully as draft.",
            data: project
        });

    } catch (error) {
        // Duplicate projectId (or any unique field)
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue || {})[0] || "field";
            return res.status(409).json({
                success: false,
                message: `${field} "${error.keyValue?.[field]}" already exists.`
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});


// ─────────────────────────────────────────────────────────────────────────────
// UPDATE BASIC PROJECT DETAILS
// Body may include: projectName, description
// projectId is intentionally NOT editable here — it's a unique identifier
// set at creation time. If you need to allow renaming it, add a dedicated
// check for uniqueness before applying it.
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/v1/basic-details/:projectId", verifyToken, adminOnly, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { projectName, description } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        if (projectName !== undefined) {
            if (!projectName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Project name cannot be empty."
                });
            }
            project.projectName = projectName;
        }

        if (description !== undefined) project.description = description;

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Basic project details updated successfully.",
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
// ADD PROJECT DOCUMENT (client sends the already-hosted URL directly)
// Body expected: name, url, documentType
// ─────────────────────────────────────────────────────────────────────────────

router.post("/v1/:projectId/document", verifyToken, allUsers, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, url, documentType } = req.body;

        const validDocumentTypes = [
            "tender_document",
            "loa",
            "agreement",
            "boq",
            "drawings",
            "nit"
        ];

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

        if (!validDocumentTypes.includes(documentType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid document type. Must be one of: ${validDocumentTypes.join(", ")}.`
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

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
            message: "Document added successfully.",
            data: document
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// CREATE / UPDATE ADVANCED PROJECT DETAILS
// Body may include any of: projectType, tenderType, department, contractType,
// biddingType, expenditureType, rankingOrderForBid, zone, subDepartment,
// circle, division, psuName
// Only the fields present in the request body are set - nothing required,
// works the first time (create) and on every subsequent call (update).
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/v1/advance-details/:projectId", verifyToken, adminOnly, async (req, res) => {
    try {

        const { projectId } = req.params;

        const {
            projectType,
            tenderType,
            department,
            contractType,
            biddingType,
            expenditureType,
            rankingOrderForBid,
            zone,
            subDepartment,
            circle,
            division,
            psuName
        } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        // Enum fields: convert empty string to undefined so Mongoose treats
        // it as "clear the field" instead of trying to validate "" against
        // the enum list (which always fails).
        const clean = (v) => (v === '' ? undefined : v);

        if (projectType !== undefined) project.projectType = clean(projectType);
        if (tenderType !== undefined) project.tenderType = clean(tenderType);
        if (department !== undefined) project.department = clean(department);
        if (contractType !== undefined) project.contractType = clean(contractType);
        if (biddingType !== undefined) project.biddingType = clean(biddingType);
        if (expenditureType !== undefined) project.expenditureType = clean(expenditureType);
        if (rankingOrderForBid !== undefined) project.rankingOrderForBid = clean(rankingOrderForBid);
        if (zone !== undefined) project.zone = clean(zone);
        if (subDepartment !== undefined) project.subDepartment = clean(subDepartment);
        if (circle !== undefined) project.circle = clean(circle);
        if (division !== undefined) project.division = division; // free text, no enum — fine as ""
        if (psuName !== undefined) project.psuName = clean(psuName);

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Advanced project details updated successfully.",
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
// GET PROJECTS (filter by status, scope to "mine" or "all")
// Query params:
//   status - optional, one of the Project.status enum values
//   scope  - optional, "mine" (projects created by the logged-in user) or
//            "all" (default - every project)
// Examples:
//   GET /list                        -> all projects
//   GET /list?status=draft           -> all draft projects
//   GET /list?scope=mine             -> projects created by the logged-in user
//   GET /list?status=pending&scope=mine
// ─────────────────────────────────────────────────────────────────────────────

router.get("/v1/list", verifyToken, allUsers, async (req, res) => {
    try {

        const { status, scope } = req.query;

        const validStatuses = [
            "in_progress",
            "draft",
            "completed",
            "not_allotted",
            "L2",
            "L3",
            "pending"
        ];

        const filter = {};

        if (status !== undefined) {
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${validStatuses.join(", ")}.`
                });
            }
            filter.status = status;
        }

        if (scope === "mine") {
            filter.createdBy = req.userId;
        }

        const projects = await Project.find(filter)
            .populate("createdBy", "name email profile")
            .populate("currentAuthority", "name email profile")
            .populate("nextAuthority", "name email profile")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Projects retrieved successfully.",
            data: projects
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});


// ─────────────────────────────────────────────────────────────────────────────
// GET PROJECTS WHERE LOGGED-IN USER IS THE CURRENT AUTHORITY
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// GET PROJECTS WHERE LOGGED-IN USER IS THE CURRENT AUTHORITY
// ─────────────────────────────────────────────────────────────────────────────

router.get("/v1/current-authority", verifyToken, allUsers, async (req, res) => {
    try {

        const projects = await Project.find({ currentAuthority: req.userId })
            .populate("createdBy", "name email profile")
            .populate("currentAuthority", "name email profile")
            .populate("nextAuthority", "name email profile")
            .populate("approvals.actor", "name email profile")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Projects retrieved successfully.",
            data: projects
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});




// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PROJECT STATUS
// Body expected: status
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/v1/status/:projectId", verifyToken, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { status } = req.body;

        const validStatuses = [
            "in_progress",
            "draft",
            "completed",
            "not_allotted",
            "L2",
            "L3",
            "pending"
        ];

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required."
            });
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(", ")}.`
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        project.status = status;

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Project status updated successfully.",
            data: project
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

// Requires the User model to look up the actor's stage tag
// const User = require("../models/user.model");

// ─────────────────────────────────────────────────────────────────────────────
// FORWARD PROJECT (approve / return / reject / pending)
// Body expected: action, remark, nextAuthority
// Actor is the logged-in user (req.userId).
// Stage is derived from the actor's own "tag" field (cto, cfo, director,
// coo, ceo, admin) instead of being passed in by the client.
// nextAuthority becomes the project's new currentAuthority, forwarding it.
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/v1/forward/:projectId", verifyToken, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { action, remark, nextAuthority } = req.body;

        const validActions = ["approved", "returned", "rejected", "pending"];
        const validStages = ["ADMIN", "CEO", "CTO", "CFO", "COO", "DIRECTOR"];

        const actorId = req.userId; // The actor is the logged-in user

        if (!action) {
            return res.status(400).json({
                success: false,
                message: "Action is required."
            });
        }

        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                message: `Invalid action. Must be one of: ${validActions.join(", ")}.`
            });
        }

        if (!actorId) {
            return res.status(400).json({
                success: false,
                message: "Actor id is required."
            });
        }

        if (!nextAuthority) {
            return res.status(400).json({
                success: false,
                message: "Next authority is required."
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        // Only the current authority can take action on the project
        if (
            project.currentAuthority &&
            project.currentAuthority.toString() !== actorId
        ) {
            return res.status(403).json({
                success: false,
                message: "This user is not authorized to take action on this project."
            });
        }

        const actor = await User.findById(actorId);

        if (!actor) {
            return res.status(404).json({
                success: false,
                message: "Actor not found."
            });
        }

        const stage = actor.tag ? actor.tag.toUpperCase() : undefined;

        if (!stage || !validStages.includes(stage)) {
            return res.status(400).json({
                success: false,
                message: "Actor does not have a valid stage tag."
            });
        }

        // Save approval trail entry
        project.approvals.push({
            stage,
            actor: actorId,
            action,
            remark,
            actedAt: new Date()
        });

        // Forward the project to the next authority
        project.currentAuthority = nextAuthority;

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
// GET SINGLE PROJECT BY ID
// ─────────────────────────────────────────────────────────────────────────────

router.get("/v1/:projectId", verifyToken, allUsers, async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId)
            .populate("createdBy", "name email profile")
            .populate("currentAuthority", "name email profile")
            .populate("nextAuthority", "name email profile")
            .populate("documents.uploadedBy", "name email profile")
            .populate("approvals.actor", "name email profile");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project retrieved successfully.",
            data: project
        });

    } catch (error) {
        // Invalid ObjectId format throws a CastError — treat as not found
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE LOCATION
// Body: { location: { state, city, district, pincode, siteAddress } }
// All fields optional — only provided keys are updated.
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/v1/location/:projectId", verifyToken, adminOnly, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { location } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        if (location && typeof location === 'object') {
            const { state, city, district, pincode, siteAddress } = location;
            if (!project.location) project.location = {};
            if (state !== undefined) project.location.state = state;
            if (city !== undefined) project.location.city = city;
            if (district !== undefined) project.location.district = district;
            if (pincode !== undefined) project.location.pincode = pincode;
            if (siteAddress !== undefined) project.location.siteAddress = siteAddress;
        }

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Location updated successfully.",
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
// UPDATE FINANCIAL DETAILS
// Body: { financials: { tenderAmount, biddingPosition, biddingPercentage,
//         pgAmount, actualPgAmount, pgMaturityDate, pgMaturityInterest,
//         rateOfInterest, durationInDays, depositAccountNo, depositStartDate,
//         penalty, penaltyTicketNo,
//         recoveryAtContractEnd: { billAmount, recoveryAmount, billNumber, recoveryDesc } } }
// All fields optional — only provided keys are updated.
// actualBiddingAmount is auto-recalculated by the schema's pre("save") hook
// whenever tenderAmount/biddingPosition/biddingPercentage change.
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/v1/financials/:projectId", verifyToken, adminOnly, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { financials } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        if (financials && typeof financials === 'object') {
            if (!project.financials) project.financials = {};
            const f = project.financials;
            const clean = (v) => (v === '' ? undefined : v); // enum field: biddingPosition

            const {
                tenderAmount, biddingPosition, biddingPercentage,
                pgAmount, actualPgAmount, pgMaturityDate, pgMaturityInterest,
                rateOfInterest, durationInDays, depositAccountNo, depositStartDate,
                penalty, penaltyTicketNo, recoveryAtContractEnd
            } = financials;

            if (tenderAmount !== undefined) f.tenderAmount = tenderAmount;
            if (biddingPosition !== undefined) f.biddingPosition = clean(biddingPosition);
            if (biddingPercentage !== undefined) f.biddingPercentage = biddingPercentage;
            if (pgAmount !== undefined) f.pgAmount = pgAmount;
            if (actualPgAmount !== undefined) f.actualPgAmount = actualPgAmount;
            if (pgMaturityDate !== undefined) f.pgMaturityDate = pgMaturityDate;
            if (pgMaturityInterest !== undefined) f.pgMaturityInterest = pgMaturityInterest;
            if (rateOfInterest !== undefined) f.rateOfInterest = rateOfInterest;
            if (durationInDays !== undefined) f.durationInDays = durationInDays;
            if (depositAccountNo !== undefined) f.depositAccountNo = depositAccountNo;
            if (depositStartDate !== undefined) f.depositStartDate = depositStartDate;
            if (penalty !== undefined) f.penalty = penalty;
            if (penaltyTicketNo !== undefined) f.penaltyTicketNo = penaltyTicketNo;

            if (recoveryAtContractEnd && typeof recoveryAtContractEnd === 'object') {
                if (!f.recoveryAtContractEnd) f.recoveryAtContractEnd = {};
                const { billAmount, recoveryAmount, billNumber, recoveryDesc } = recoveryAtContractEnd;
                if (billAmount !== undefined) f.recoveryAtContractEnd.billAmount = billAmount;
                if (recoveryAmount !== undefined) f.recoveryAtContractEnd.recoveryAmount = recoveryAmount;
                if (billNumber !== undefined) f.recoveryAtContractEnd.billNumber = billNumber;
                if (recoveryDesc !== undefined) f.recoveryAtContractEnd.recoveryDesc = recoveryDesc;
            }
        }

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Financial details updated successfully.",
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
// GET ALL USERS (id, cid, profile, tag, role, name only)
// Useful for populating a "next authority" picker dropdown.
// ─────────────────────────────────────────────────────────────────────────────

router.get("/users/list", verifyToken, async (req, res) => {
    try {

        const users = await User.find({})
            .select("name cid profile tag role")
            .sort({ name: 1 });

        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully.",
            data: users
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});
module.exports = router;




