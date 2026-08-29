const express = require("express");
const router = express.Router();

const projectService = require("../services/project.service");
const verifyToken = require("../middleware/verifyToken");
const verifyRole = require("../middleware/verifyRole");
const Project = require("../models/projects.model");
const User = require("../models/usermodel");
const Task = require("../models/task.model");
const Item = require("../models/item.model");
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


router.patch("/v1/basic-details/:projectId", verifyToken, adminOnly, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { projectName, description, projectUnder, tenderClosingDate } = req.body;

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

        // Enum field: convert empty string to undefined so Mongoose treats
        // it as "clear the field" instead of trying to validate "" against
        // the enum list (which always fails).
        if (projectUnder !== undefined) project.projectUnder = projectUnder === '' ? undefined : projectUnder;

        // NEW: tender closing date — plain Date field, empty string clears it.
        if (tenderClosingDate !== undefined) project.tenderClosingDate = tenderClosingDate === '' ? undefined : tenderClosingDate;

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
// CREATE / UPDATE ADVANCED PROJECT DETAILS
// Body may include any of: projectType, tenderType, department, contractType,
// biddingType, expenditureType, rankingOrderForBid, biddingSystem,
// currentDateOfCompletion, zone, subDepartment, circle, division, psuName,
// clientName, tenderNo, loaNo, agreementNo, loaDate, tenderTotalAmount,
// loaAmount, contractorName, contractorCode, tca, taa, jointVentureMembers
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
            biddingSystem,
            currentDateOfCompletion,
            zone,
            subDepartment,
            circle,
            division,
            psuName,
            clientName,
            tenderNo,
            loaNo,
            agreementNo,
            loaDate,
            tenderTotalAmount,
            loaAmount,
            contractorName,
            contractorCode,
            tca,
            taa,
            jointVentureMembers
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

        // NEW: bidding system (enum — run through clean()) and current
        // date of completion (plain Date — empty string clears it).
        if (biddingSystem !== undefined) project.biddingSystem = clean(biddingSystem);
        if (currentDateOfCompletion !== undefined) project.currentDateOfCompletion = currentDateOfCompletion === '' ? undefined : currentDateOfCompletion;

        // NEW: Advance Details fields — all free text/number/date, no enum
        // validation, so no need to run them through clean().
        if (clientName !== undefined) project.clientName = clientName;
        if (tenderNo !== undefined) project.tenderNo = tenderNo;
        if (loaNo !== undefined) project.loaNo = loaNo;
        if (agreementNo !== undefined) project.agreementNo = agreementNo;
        if (loaDate !== undefined) project.loaDate = loaDate === '' ? undefined : loaDate;
        if (tenderTotalAmount !== undefined) project.tenderTotalAmount = tenderTotalAmount;
        if (loaAmount !== undefined) project.loaAmount = loaAmount;
        if (contractorName !== undefined) project.contractorName = contractorName;
        if (contractorCode !== undefined) project.contractorCode = contractorCode;
        if (tca !== undefined) project.tca = tca;
        if (taa !== undefined) project.taa = taa;

        // jointVentureMembers is an array of strings — accept the array as-is
        // when it's actually an array (replaces the whole list, same as how
        // a form would resubmit it).
        if (jointVentureMembers !== undefined) {
            project.jointVentureMembers = Array.isArray(jointVentureMembers)
                ? jointVentureMembers
                : [];
        }

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
            "pending",
            "L1",
            "alloted"
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
// Body: {
//   location: { state, city, district, pincode, siteAddress },
//   headquarterLocation: { state, city, district, pincode, siteAddress }
// }
// All fields optional — only provided keys are updated. Both objects are
// optional too; send either, both, or neither.
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/v1/location/:projectId", verifyToken, adminOnly, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { location, headquarterLocation } = req.body;

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

        // NEW: headquarterLocation — same shape and same update logic as
        // location above, just a separate field on the document.
        if (headquarterLocation && typeof headquarterLocation === 'object') {
            const { state, city, district, pincode, siteAddress } = headquarterLocation;
            if (!project.headquarterLocation) project.headquarterLocation = {};
            if (state !== undefined) project.headquarterLocation.state = state;
            if (city !== undefined) project.headquarterLocation.city = city;
            if (district !== undefined) project.headquarterLocation.district = district;
            if (pincode !== undefined) project.headquarterLocation.pincode = pincode;
            if (siteAddress !== undefined) project.headquarterLocation.siteAddress = siteAddress;
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


// ─────────────────────────────────────────────────────────────────────────────
// ADD ITEMS (BULK) FOR A PROJECT
// Body expected: { items: [ { itemNo, name, description, unit, railwayRate,
//                             ourRate, marketRate, quantity, installation,
//                             profitLossPercent }, ... ] }
// itemNo and name are required per item - everything else is optional.
// ─────────────────────────────────────────────────────────────────────────────

router.post("/:projectId/items", verifyToken, allUsers, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Items must be a non-empty array."
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }


        // Validate each item before inserting any
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (!item.itemNo) {
                return res.status(400).json({
                    success: false,
                    message: `Item at index ${i} is missing itemNo.`
                });
            }

            if (!item.name) {
                return res.status(400).json({
                    success: false,
                    message: `Item at index ${i} is missing name.`
                });
            }


        }

        const itemsToInsert = items.map((item) => ({
            project: projectId,
            itemNo: item.itemNo,
            name: item.name,
            description: item.description,
            unit: item.unit,
            railwayRate: item.railwayRate,
            ourRate: item.ourRate,
            marketRate: item.marketRate,
            quantity: item.quantity,
            installation: item.installation,
            profitLossPercent: item.profitLossPercent,
            createdBy: req.userId
        }));

        const createdItems = await Item.insertMany(itemsToInsert);

        return res.status(201).json({
            success: true,
            message: "Items added successfully.",
            data: createdItems
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});


// ─────────────────────────────────────────────────────────────────────────────
// GET ALL ITEMS FOR A PROJECT
// ─────────────────────────────────────────────────────────────────────────────

router.get("/:projectId/items", verifyToken, allUsers, async (req, res) => {
    try {

        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        const items = await Item.find({ project: projectId })
            .populate("createdBy", "name email profile")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            message: "Items retrieved successfully.",
            data: items
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE FINANCIALS.BIDDING DETAILS
// Body: { bidding: { emdAmount, advertisedValue, status, biddingPosition,
//         biddingPercentage } }
// All fields optional — only provided keys are updated. Does NOT touch
// financials.costEstimation — use the dedicated add-one-at-a-time route below.
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/v1/financials/bidding/:projectId", verifyToken, adminOnly, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { bidding } = req.body;

        const validStatuses = ["paid", "unpaid", "exempted"];
        const validPositions = ["below", "above", "at_par"];
        const clean = (v) => (v === '' ? undefined : v);

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        if (bidding && typeof bidding === 'object') {

            const {
                emdAmount,
                advertisedValue,
                status,
                biddingPosition,
                biddingPercentage
            } = bidding;

            if (status !== undefined && status !== '' && !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${validStatuses.join(", ")}.`
                });
            }

            if (biddingPosition !== undefined && biddingPosition !== '' && !validPositions.includes(biddingPosition)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid biddingPosition. Must be one of: ${validPositions.join(", ")}.`
                });
            }

            if (!project.financials) project.financials = {};
            if (!project.financials.bidding) project.financials.bidding = {};
            const b = project.financials.bidding;

            if (emdAmount !== undefined) b.emdAmount = emdAmount;
            if (advertisedValue !== undefined) b.advertisedValue = advertisedValue;
            if (status !== undefined) b.status = clean(status);
            if (biddingPosition !== undefined) b.biddingPosition = clean(biddingPosition);
            if (biddingPercentage !== undefined) b.biddingPercentage = biddingPercentage;
        }

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Bidding details updated successfully.",
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
// ADD ONE COST ESTIMATION ENTRY
// Body expected: { name, amount } — accepts exactly one entry per call,
// pushed onto financials.bidding.costEstimation[].
// ─────────────────────────────────────────────────────────────────────────────

router.post("/v1/financials/bidding/:projectId/cost-estimation", verifyToken, adminOnly, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { name, amount } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Cost name is required."
            });
        }

        if (amount === undefined || amount === null || amount === '') {
            return res.status(400).json({
                success: false,
                message: "Cost amount is required."
            });
        }

        if (Number.isNaN(Number(amount))) {
            return res.status(400).json({
                success: false,
                message: "Cost amount must be a number."
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        if (!project.financials) project.financials = {};
        if (!project.financials.bidding) project.financials.bidding = {};
        if (!project.financials.bidding.costEstimation) project.financials.bidding.costEstimation = [];

        const entry = { name, amount: Number(amount) };

        project.financials.bidding.costEstimation.push(entry);

        await project.save();

        return res.status(201).json({
            success: true,
            message: "Cost estimation entry added successfully.",
            data: project.financials.bidding.costEstimation
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE FINANCIALS.PG DETAILS
// Body: { pg: { amountRailway, amountSubmitted, createDate, maturityDate,
//         interest, maturityAmount, name, depositAccountNo, bankBranch } }
// All fields optional — only provided keys are updated.
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/v1/financials/pg/:projectId", verifyToken, adminOnly, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { pg } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        if (pg && typeof pg === 'object') {

            const {
                amountRailway,
                amountSubmitted,
                createDate,
                maturityDate,
                interest,
                maturityAmount,
                name,
                depositAccountNo,
                bankBranch
            } = pg;

            if (!project.financials) project.financials = {};
            if (!project.financials.pg) project.financials.pg = {};
            const p = project.financials.pg;

            if (amountRailway !== undefined) p.amountRailway = amountRailway;
            if (amountSubmitted !== undefined) p.amountSubmitted = amountSubmitted;
            if (createDate !== undefined) p.createDate = createDate;
            if (maturityDate !== undefined) p.maturityDate = maturityDate;
            if (interest !== undefined) p.interest = interest;
            if (maturityAmount !== undefined) p.maturityAmount = maturityAmount;
            if (name !== undefined) p.name = name;
            if (depositAccountNo !== undefined) p.depositAccountNo = depositAccountNo;
            if (bankBranch !== undefined) p.bankBranch = bankBranch;
        }

        await project.save();

        return res.status(200).json({
            success: true,
            message: "PG details updated successfully.",
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
// UPDATE FINANCIALS.PENALTYDETAILS
// Body: { penaltyDetails: { amount, ticketNo, ticketDate, delayDays } }
// All fields optional — only provided keys are updated. Does NOT touch the
// existing flat financials.penalty / financials.penaltyTicketNo fields.
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/v1/financials/penalty/:projectId", verifyToken, adminOnly, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { penaltyDetails } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        if (penaltyDetails && typeof penaltyDetails === 'object') {

            const { amount, ticketNo, ticketDate, delayDays } = penaltyDetails;

            if (!project.financials) project.financials = {};
            if (!project.financials.penaltyDetails) project.financials.penaltyDetails = {};
            const pd = project.financials.penaltyDetails;

            if (amount !== undefined) pd.amount = amount;
            if (ticketNo !== undefined) pd.ticketNo = ticketNo;
            if (ticketDate !== undefined) pd.ticketDate = ticketDate;
            if (delayDays !== undefined) pd.delayDays = delayDays;
        }

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Penalty details updated successfully.",
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
// UPDATE FINANCIALS.SECURITY_DEPOSIT (amount, percentage)
// Body: { securityDeposit: { amount, percentage } }
// All fields optional — only provided keys are updated. Does NOT touch
// security_deposit.cust — use the dedicated add-one-at-a-time route below.
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/v1/financials/security-deposit/:projectId", verifyToken, adminOnly, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { securityDeposit } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        if (securityDeposit && typeof securityDeposit === 'object') {

            const { amount, percentage } = securityDeposit;

            if (!project.financials) project.financials = {};
            if (!project.financials.security_deposit) project.financials.security_deposit = {};
            const sd = project.financials.security_deposit;

            if (amount !== undefined) sd.amount = amount;
            if (percentage !== undefined) sd.percentage = percentage;
        }

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Security deposit details updated successfully.",
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
// ADD ONE SECURITY DEPOSIT CUST ENTRY
// Body expected: { billNo, recoveryPercent, amount } — accepts exactly one
// entry per call, pushed onto financials.security_deposit.cust[].
// ─────────────────────────────────────────────────────────────────────────────

router.post("/v1/financials/security-deposit/:projectId/cust", verifyToken, adminOnly, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { billNo, recoveryPercent, amount } = req.body;

        if (!billNo) {
            return res.status(400).json({
                success: false,
                message: "Bill No. is required."
            });
        }

        if (recoveryPercent === undefined || recoveryPercent === null || recoveryPercent === '') {
            return res.status(400).json({
                success: false,
                message: "Recovery % is required."
            });
        }

        if (amount === undefined || amount === null || amount === '') {
            return res.status(400).json({
                success: false,
                message: "Amount is required."
            });
        }

        if (Number.isNaN(Number(recoveryPercent))) {
            return res.status(400).json({
                success: false,
                message: "Recovery % must be a number."
            });
        }

        if (Number.isNaN(Number(amount))) {
            return res.status(400).json({
                success: false,
                message: "Amount must be a number."
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        if (!project.financials) project.financials = {};
        if (!project.financials.security_deposit) project.financials.security_deposit = {};
        if (!project.financials.security_deposit.cust) project.financials.security_deposit.cust = [];

        const entry = {
            billNo,
            recoveryPercent: Number(recoveryPercent),
            amount: Number(amount)
        };

        project.financials.security_deposit.cust.push(entry);

        await project.save();

        return res.status(201).json({
            success: true,
            message: "Security deposit entry added successfully.",
            data: project.financials.security_deposit.cust
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE TIMELINE
// Body: { startDate, estimatedCompletionDate, endDate }
// All fields optional — only provided keys are updated.
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/v1/timeline/:projectId", verifyToken, adminOnly, async (req, res) => {
    try {

        const { projectId } = req.params;
        const { startDate, estimatedCompletionDate, endDate } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        if (startDate !== undefined) project.startDate = startDate || undefined;
        if (estimatedCompletionDate !== undefined) project.estimatedCompletionDate = estimatedCompletionDate || undefined;
        if (endDate !== undefined) project.endDate = endDate || undefined;

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Timeline updated successfully.",
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
// DELETE PROJECT DOCUMENT
// Removes a single document (identified by its own subdocument _id) from
// project.documents[].
// ─────────────────────────────────────────────────────────────────────────────

router.delete("/v1/:projectId/document/:documentId", verifyToken, adminOnly, async (req, res) => {
    try {
        const { projectId, documentId } = req.params;

        const documents = await projectService.deleteDocument(projectId, documentId);

        return res.status(200).json({
            success: true,
            message: "Document deleted successfully.",
            data: documents
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Project or document not found."
            });
        }

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
});
module.exports = router;




