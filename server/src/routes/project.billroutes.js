const express = require("express");
const router = express.Router();

const Project = require("../models/projects.model");       // adjust path to match your models folder
const ProjectBill = require("../models/projectBill.model"); // adjust path to match your models folder
const verifyToken = require("../middleware/verifyToken"); // adjust to your actual middleware path
const verifyRole = require("../middleware/verifyRole");   // adjust to your actual middleware path

// ─────────────────────────────────────────────────────────────────────────────
// CREATE BILL FOR A PROJECT
// POST /v1/:projectId/bill
// Body may include: billNo, loaNo, agrNo, loaDate, bnsAmt, adsAmt, totalAmt,
// rebate, billAmtInclusiveGST, tax, grossAmount, tdsAmt, items, recovery
// billNo is required.
// items: [{ item, qty, rate }]  — item is the Item _id
// recovery: [{ recoveryType, code, desc, recoveryAmt }]
// Restricted to admin — creating a bill isn't something staff/client should do.
// ─────────────────────────────────────────────────────────────────────────────

router.post("/v1/:projectId/bill", verifyToken, verifyRole("admin"), async (req, res) => {
    try {

        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found."
            });
        }

        const {
            billNo,
            loaNo,
            agrNo,
            loaDate,
            bnsAmt,
            adsAmt,
            totalAmt,
            rebate,
            billAmtInclusiveGST,
            tax,
            grossAmount,
            tdsAmt,
            items,
            recovery
        } = req.body;

        if (!billNo || !billNo.trim()) {
            return res.status(400).json({
                success: false,
                message: "Bill No. is required."
            });
        }

        const bill = await ProjectBill.create({
            project: projectId,
            billNo,
            loaNo,
            agrNo,
            loaDate,
            bnsAmt,
            adsAmt,
            totalAmt,
            rebate,
            billAmtInclusiveGST,
            tax,
            grossAmount,
            tdsAmt,
            items,
            recovery
        });

        return res.status(201).json({
            success: true,
            message: "Bill created successfully.",
            data: bill
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL BILLS FOR A PROJECT
// GET /v1/:projectId/bill
// Any authenticated user can view — same as your other GET routes.
// ─────────────────────────────────────────────────────────────────────────────

router.get("/v1/:projectId/bill", verifyToken, async (req, res) => {
    try {

        const { projectId } = req.params;

        const bills = await ProjectBill.find({ project: projectId })
            .populate("items.item")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Bills fetched successfully.",
            data: bills
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET A SINGLE BILL BY ITS ID
// GET /v1/bill/:billId
// ─────────────────────────────────────────────────────────────────────────────

router.get("/v1/bill/:billId", verifyToken, async (req, res) => {
    try {

        const { billId } = req.params;

        const bill = await ProjectBill.findById(billId)
            .populate("items.item")
            .populate("project");

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Bill not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Bill fetched successfully.",
            data: bill
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
});

module.exports = router;