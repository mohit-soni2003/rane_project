const express = require('express');
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const mongoose = require("mongoose");

const RecentActivityModel = require("../models/RecentActivityModel");
const NotificationModel = require("../models/notificationModel");
const User = require("../models/usermodel");
const Payment = require("../models/paymentmodel");
const Bill = require("../models/billmodel");
const Transaction = require("../models/transaction");
const FileForward = require("../models/fileForwardingModel");
const Document = require("../models/documentmodel");
const Agreement = require("../models/agreementModel");
const Project = require("../models/projects.model");
const ProjectBill = require("../models/projectBill.model");
const Task = require("../models/task.model");
const PayNote = require("../models/paynoteModel");
const MonthlySalary = require("../models/MonthlySalaryModel");
const BaseSalary = require("../models/BaseSalaryModel");
const SorItem = require("../models/sorItem.model");

/* =====================================================================
   SHARED HELPERS
   ===================================================================== */

// normalize a status string for loose comparisons
const norm = (s) => (s ? String(s).trim().toLowerCase() : "");

// parse amount strings that may contain commas / ₹ / whitespace (Bill.amount, Payment.amount are String)
const parseAmount = (v) => {
    if (v == null) return 0;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    const cleaned = String(v).replace(/[^\d.-]/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
};

// integer-only variant (used for the older bill-overview route, kept for parity)
const toNumber = (value) => {
    if (!value) return 0;
    return parseInt(String(value).replace(/,/g, "").replace(/₹/g, ""), 10) || 0;
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);

/* =====================================================================
   CLIENT DASHBOARD ROUTES
   ===================================================================== */

router.get("/client/overview", verifyToken, async (req, res) => {
    console.log("Dashboard Overview Route hit");
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ error: "Invalid user token" });
        }

        // Fetch data in parallel
        const [bills, payments, agreementcnt, signedAgreement] = await Promise.all([
            Bill.find({ user: userId }),
            Payment.find({ user: userId }),
            Agreement.countDocuments({ client: userId }),
            Agreement.countDocuments({ client: userId, status: "signed" }),
        ]);

        // Bills: compute counts and amounts in single pass for accuracy
        let billcnt = 0;
        let paidBillCnt = 0;
        let paidBillAmount = 0;

        for (const b of bills) {
            billcnt += 1;
            // support both fields if DB inconsistent
            const status = norm(b.paymentStatus ?? b.status);
            if (status === "paid") {
                paidBillCnt += 1;
                paidBillAmount += parseAmount(b.amount);
            }
        }

        // Payments: count paid PRs (support status or paymentStatus field)
        let prcnt = payments.length;
        let paidPrCnt = 0;
        for (const p of payments) {
            const pstatus = norm(p.status ?? p.paymentStatus);
            if (pstatus === "paid") paidPrCnt += 1;
        }

        // Round amounts to 2 decimals
        paidBillAmount = Math.round(paidBillAmount * 100) / 100;

        return res.status(200).json({
            success: true,
            data: {
                billcnt,
                paidBillCnt,
                prcnt,
                paidPrCnt,
                signedAgreement,
                agreementcnt,
            },
        });
    } catch (error) {
        console.error("Error in /client/overview:", error);

        return res.status(500).json({
            success: false,
            error: "Server error. Please try again later.",
            details: error.message,
        });
    }
});

router.get("/client/bill-overview", verifyToken, async (req, res) => {
    console.log("Bill Overview Route Hit");

    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ error: "Invalid user token" });
        }

        // Fetch all bills of the user
        const bills = await Bill.find({ user: userId });

        const totalBills = bills.length;

        // STATUS COUNTS
        const paidBills = bills.filter(b => b.paymentStatus === "Paid");
        const pendingBills = bills.filter(b => b.paymentStatus === "Pending");
        const unpaidBills = bills.filter(b => b.paymentStatus === "Unpaid");
        const sanctionedBills = bills.filter(b => b.paymentStatus === "Sanctioned");
        const rejectedBills = bills.filter(b => b.paymentStatus === "Reject");
        const overdueBills = bills.filter(b => b.paymentStatus === "Overdue");

        let paidAmount = 0;
        let pendingAmount = 0;
        let overdueAmount = 0;
        let otherAmount = 0;         //otherAmount = sanctionedAmount + rejectedAmount + overdueAmount;
        let totalAmount = 0;

        for (let bill of bills) {
            totalAmount += toNumber(bill.amount);

            if (bill.paymentStatus === "Paid") {
                paidAmount += toNumber(bill.amount);
            }
            else if (bill.paymentStatus === "Pending") {
                pendingAmount += toNumber(bill.amount);
            }
            else if (bill.paymentStatus === "Overdue") {
                overdueAmount += toNumber(bill.amount);
            }
            else {
                otherAmount += toNumber(bill.amount);
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                totalBills,
                paid: paidBills.length,
                pending: pendingBills.length,
                unpaid: unpaidBills.length,
                sanctioned: sanctionedBills.length,
                rejected: rejectedBills.length,
                overdue: overdueBills.length,
                paidAmount,
                pendingAmount,
                overdueAmount,
                otherAmount,
                totalAmount
            }
        });

    } catch (error) {
        console.error("Error in /client/bill-overview:", error);
        return res.status(500).json({
            success: false,
            error: "Server error. Please try again later.",
            details: error.message
        });
    }
});

/* =====================================================================
   ADMIN DASHBOARD ROUTES
   NOTE: verifyToken only confirms identity — if an "isAdmin"/role guard
   middleware exists elsewhere in the app, chain it in here too
   (e.g. verifyToken, requireRole("admin")). Left as verifyToken alone
   to match this file's existing convention.
   ===================================================================== */

// ── KPI strip: projects, pending approvals, outstanding bills, payouts, overdue tasks ──
router.get("/admin/overview", verifyToken, async (req, res) => {
    console.log("Admin Dashboard Overview Route hit");
    try {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const nextMonthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);

        const [
            totalProjects,
            activeProjects,
            pendingAgreementSignatures,
            pendingAgreementExtensions,
            pendingFileForwards,
            pendingWithdrawals,
            pendingDocuments,
            outstandingBills,
            monthTransactions,
            overdueTasks,
            totalTasks,
        ] = await Promise.all([
            Project.countDocuments({}),
            Project.countDocuments({ status: "in_progress" }),
            Agreement.countDocuments({ status: "pending" }),
            Agreement.countDocuments({ "extensionRequest.requested": true, "extensionRequest.status": "pending" }),
            FileForward.countDocuments({ status: "in-review" }),
            Bill.countDocuments({ withdrawStatus: "Requested" }),
            Document.countDocuments({ status: "pending" }),
            Bill.find({ paymentStatus: { $in: ["Unpaid", "Pending", "Overdue"] } }).select("amount"),
            Transaction.find({ transactionDate: { $gte: monthStart, $lt: nextMonthStart } }).select("amount"),
            Task.countDocuments({ deadline: { $lt: now }, status: { $nin: ["completed", "rejected"] } }),
            Task.countDocuments({}),
        ]);

        const outstandingBillAmount = outstandingBills.reduce((sum, b) => sum + parseAmount(b.amount), 0);
        const payoutsThisMonth = monthTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        const pendingApprovals = {
            agreementSignatures: pendingAgreementSignatures,
            agreementExtensions: pendingAgreementExtensions,
            fileForwards: pendingFileForwards,
            billWithdrawals: pendingWithdrawals,
            documents: pendingDocuments,
        };
        const pendingApprovalsTotal = Object.values(pendingApprovals).reduce((a, b) => a + b, 0);

        return res.status(200).json({
            success: true,
            data: {
                totalProjects,
                activeProjects,
                pendingApprovalsTotal,
                pendingApprovals,
                outstandingBillAmount: Math.round(outstandingBillAmount * 100) / 100,
                outstandingBillCount: outstandingBills.length,
                payoutsThisMonth: Math.round(payoutsThisMonth * 100) / 100,
                overdueTasks,
                totalTasks,
            },
        });
    } catch (error) {
        console.error("Error in /admin/overview:", error);
        return res.status(500).json({ success: false, error: "Server error. Please try again later.", details: error.message });
    }
});

// ── Bill status breakdown (all bills, not scoped to a single user) ──
router.get("/admin/bill-overview", verifyToken, async (req, res) => {
    console.log("Admin Bill Overview Route Hit");
    try {
        const bills = await Bill.find({}).select("amount paymentStatus");

        const buckets = { Unpaid: 0, Pending: 0, Overdue: 0, Paid: 0, Sanctioned: 0, Reject: 0, Withdrawed: 0 };
        const amounts = { Unpaid: 0, Pending: 0, Overdue: 0, Paid: 0, Sanctioned: 0, Reject: 0, Withdrawed: 0 };

        for (const b of bills) {
            const status = Object.prototype.hasOwnProperty.call(buckets, b.paymentStatus) ? b.paymentStatus : "Unpaid";
            buckets[status] += 1;
            amounts[status] += toNumber(b.amount);
        }

        // status + count + amount together, so the frontend doesn't have to zip two objects
        const breakdown = Object.keys(buckets)
            .filter((status) => buckets[status] > 0)
            .map((status) => ({ status, count: buckets[status], amount: amounts[status] }));
        const totalAmount = breakdown.reduce((sum, row) => sum + row.amount, 0);

        return res.status(200).json({
            success: true,
            data: {
                totalBills: bills.length,
                totalAmount,
                counts: buckets,
                amounts,
                breakdown,
            },
        });
    } catch (error) {
        console.error("Error in /admin/bill-overview:", error);
        return res.status(500).json({ success: false, error: "Server error. Please try again later.", details: error.message });
    }
});

// ── Payment request status breakdown (counts + amounts) ──
// Payment.status has no fixed enum in the schema, so this groups by
// whatever string value is actually present instead of a hardcoded list.
router.get("/admin/payment-overview", verifyToken, async (req, res) => {
    console.log("Admin Payment Overview Route Hit");
    try {
        const payments = await Payment.find({}).select("amount status");

        const counts = {};
        const amounts = {};

        for (const p of payments) {
            const status = p.status ? String(p.status).trim() : "Pending";
            counts[status] = (counts[status] || 0) + 1;
            amounts[status] = (amounts[status] || 0) + parseAmount(p.amount);
        }

        const breakdown = Object.keys(counts).map((status) => ({
            status,
            count: counts[status],
            amount: Math.round((amounts[status] || 0) * 100) / 100,
        }));
        const totalAmount = breakdown.reduce((sum, row) => sum + row.amount, 0);

        return res.status(200).json({
            success: true,
            data: {
                totalPayments: payments.length,
                totalAmount: Math.round(totalAmount * 100) / 100,
                counts,
                amounts,
                breakdown,
            },
        });
    } catch (error) {
        console.error("Error in /admin/payment-overview:", error);
        return res.status(500).json({ success: false, error: "Server error. Please try again later.", details: error.message });
    }
});

// ── Cash flow trend: Transaction totals grouped by month + type ──
router.get("/admin/cash-flow", verifyToken, async (req, res) => {
    console.log("Admin Cash Flow Route Hit");
    try {
        const months = Math.min(parseInt(req.query.months) || 6, 24);
        const start = startOfMonth(new Date());
        start.setMonth(start.getMonth() - (months - 1));

        const raw = await Transaction.aggregate([
            { $match: { transactionDate: { $gte: start } } },
            {
                $group: {
                    _id: { year: { $year: "$transactionDate" }, month: { $month: "$transactionDate" }, type: "$type" },
                    total: { $sum: "$amount" },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        // build an ordered scaffold of the last `months` months, zero-filled
        const series = [];
        const cursor = new Date(start);
        for (let i = 0; i < months; i++) {
            series.push({
                key: monthKey(cursor),
                month: MONTH_LABELS[cursor.getMonth()],
                bill: 0,
                payment_request: 0,
                salary: 0,
            });
            cursor.setMonth(cursor.getMonth() + 1);
        }

        raw.forEach((row) => {
            const key = `${row._id.year}-${String(row._id.month).padStart(2, "0")}`;
            const entry = series.find((s) => s.key === key);
            if (entry && row._id.type && Object.prototype.hasOwnProperty.call(entry, row._id.type)) {
                entry[row._id.type] = row.total;
            }
        });

        return res.status(200).json({
            success: true,
            data: series.map(({ key, ...rest }) => rest),
        });
    } catch (error) {
        console.error("Error in /admin/cash-flow:", error);
        return res.status(500).json({ success: false, error: "Server error. Please try again later.", details: error.message });
    }
});

// ── Project status distribution + top projects by billed amount ──
router.get("/admin/project-status", verifyToken, async (req, res) => {
    console.log("Admin Project Status Route Hit");
    try {
        const [statusAgg, topProjectsAgg] = await Promise.all([
            Project.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
            ProjectBill.aggregate([
                { $group: { _id: "$project", totalBilled: { $sum: "$grossAmount" } } },
                { $sort: { totalBilled: -1 } },
                { $limit: 5 },
                { $lookup: { from: "projects", localField: "_id", foreignField: "_id", as: "project" } },
                { $unwind: "$project" },
                {
                    $project: {
                        _id: 0,
                        projectId: "$project._id",
                        projectName: "$project.projectName",
                        totalBilled: 1,
                    },
                },
            ]),
        ]);

        const PROJECT_STAGES = ["draft", "pending", "not_allotted", "alloted", "in_progress", "L1", "L2", "L3", "completed"];
        const counts = PROJECT_STAGES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
        statusAgg.forEach((s) => {
            const key = s._id || "draft";
            if (Object.prototype.hasOwnProperty.call(counts, key)) counts[key] = s.count;
        });
        const statusBreakdown = PROJECT_STAGES.map((status) => ({ status, count: counts[status] }));

        return res.status(200).json({
            success: true,
            data: { statusBreakdown, topProjects: topProjectsAgg },
        });
    } catch (error) {
        console.error("Error in /admin/project-status:", error);
        return res.status(500).json({ success: false, error: "Server error. Please try again later.", details: error.message });
    }
});

// ── Task load per staff member (open/active tasks only) ──
router.get("/admin/task-load", verifyToken, async (req, res) => {
    console.log("Admin Task Load Route Hit");
    try {
        const limit = Math.min(parseInt(req.query.limit) || 8, 25);

        const loadAgg = await Task.aggregate([
            { $unwind: "$allottedTo" },
            { $match: { "allottedTo.status": { $nin: ["completed", "rejected"] } } },
            { $group: { _id: "$allottedTo.user", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $project: { _id: 0, userId: "$user._id", name: "$user.name", tag: "$user.tag", count: 1 } },
        ]);

        return res.status(200).json({ success: true, data: loadAgg });
    } catch (error) {
        console.error("Error in /admin/task-load:", error);
        return res.status(500).json({ success: false, error: "Server error. Please try again later.", details: error.message });
    }
});

// ── PayNote pipeline: counts per stage ──
router.get("/admin/paynote-pipeline", verifyToken, async (req, res) => {
    console.log("Admin PayNote Pipeline Route Hit");
    try {
        const STAGES = ["Draft", "Pending", "Approved", "Rejected", "Paid"];
        const agg = await PayNote.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

        const counts = STAGES.reduce((acc, stage) => ({ ...acc, [stage]: 0 }), {});
        agg.forEach((row) => {
            if (Object.prototype.hasOwnProperty.call(counts, row._id)) counts[row._id] = row.count;
        });

        return res.status(200).json({
            success: true,
            data: STAGES.map((stage) => ({ stage, count: counts[stage] })),
        });
    } catch (error) {
        console.error("Error in /admin/paynote-pipeline:", error);
        return res.status(500).json({ success: false, error: "Server error. Please try again later.", details: error.message });
    }
});

// ── Approvals queue: everything currently waiting on an admin decision ──
router.get("/admin/approvals-queue", verifyToken, async (req, res) => {
    console.log("Admin Approvals Queue Route Hit");
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);

        const [pendingSignatures, pendingExtensions, inReviewForwards, withdrawRequests, pendingDocs] = await Promise.all([
            Agreement.find({ status: "pending" })
                .select("title client uploadedAt")
                .populate("client", "name")
                .sort({ uploadedAt: -1 })
                .limit(limit)
                .lean(),
            Agreement.find({ "extensionRequest.requested": true, "extensionRequest.status": "pending" })
                .select("title extensionRequest")
                .populate("extensionRequest.requestedBy", "name")
                .sort({ "extensionRequest.requestedAt": -1 })
                .limit(limit)
                .lean(),
            FileForward.find({ status: "in-review" })
                .select("fileTitle currentOwner createdAt")
                .populate("currentOwner", "name")
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean(),
            Bill.find({ withdrawStatus: "Requested" })
                .select("loaNo amount user withdrawRequestedAt")
                .populate("user", "name")
                .sort({ withdrawRequestedAt: -1 })
                .limit(limit)
                .lean(),
            Document.find({ status: "pending" })
                .select("documentCode uploadedBy uploadDate")
                .populate("uploadedBy", "name")
                .sort({ uploadDate: -1 })
                .limit(limit)
                .lean(),
        ]);

        const items = [
            ...pendingSignatures.map((a) => ({
                type: "agreement_signature",
                refId: a._id,
                label: `Agreement "${a.title}" awaiting client signature`,
                who: a.client?.name ? `Client: ${a.client.name}` : "Client: —",
                date: a.uploadedAt,
            })),
            ...pendingExtensions.map((a) => ({
                type: "agreement_extension",
                refId: a._id,
                label: `Extension requested on "${a.title}"`,
                who: a.extensionRequest?.requestedBy?.name ? `Requested by ${a.extensionRequest.requestedBy.name}` : "Requested by —",
                date: a.extensionRequest?.requestedAt,
            })),
            ...inReviewForwards.map((f) => ({
                type: "file_forward",
                refId: f._id,
                label: `"${f.fileTitle}" pending review`,
                who: f.currentOwner?.name ? `With: ${f.currentOwner.name}` : "With: —",
                date: f.createdAt,
            })),
            ...withdrawRequests.map((b) => ({
                type: "bill_withdrawal",
                refId: b._id,
                label: `Withdraw requested — LOA ${b.loaNo || "N/A"}`,
                who: `${b.user?.name || "—"} · ₹${toNumber(b.amount).toLocaleString("en-IN")}`,
                date: b.withdrawRequestedAt,
            })),
            ...pendingDocs.map((d) => ({
                type: "document",
                refId: d._id,
                label: `Document "${d.documentCode}" pending approval`,
                who: d.uploadedBy?.name ? `Uploaded by ${d.uploadedBy.name}` : "Uploaded by —",
                date: d.uploadDate,
            })),
        ]
            .filter((item) => item.date)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);

        return res.status(200).json({ success: true, data: items });
    } catch (error) {
        console.error("Error in /admin/approvals-queue:", error);
        return res.status(500).json({ success: false, error: "Server error. Please try again later.", details: error.message });
    }
});

// ── Recent activity feed ──
router.get("/admin/recent-activity", verifyToken, async (req, res) => {
    console.log("Admin Recent Activity Route Hit");
    try {
        const limit = Math.min(parseInt(req.query.limit) || 15, 100);

        const activities = await RecentActivityModel.find({})
            .populate("user", "name")
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return res.status(200).json({
            success: true,
            data: activities.map((a) => ({
                actionType: a.actionType,
                description: a.description,
                who: a.user?.name || "System",
                relatedModel: a.relatedModel,
                relatedId: a.relatedId,
                actionUrl: a.actionUrl,
                createdAt: a.createdAt,
            })),
        });
    } catch (error) {
        console.error("Error in /admin/recent-activity:", error);
        return res.status(500).json({ success: false, error: "Server error. Please try again later.", details: error.message });
    }
});

// ── Staff & payroll snapshot ──
router.get("/admin/payroll-snapshot", verifyToken, async (req, res) => {
    console.log("Admin Payroll Snapshot Route Hit");
    try {
        const currentMonth = monthKey(new Date());

        const [totalStaff, tagBreakdownAgg, notFinalizedCount, baseSalaryCount] = await Promise.all([
            User.countDocuments({ role: { $ne: "client" } }),
            User.aggregate([
                { $match: { role: { $ne: "client" } } },
                { $group: { _id: "$tag", count: { $sum: 1 } } },
            ]),
            MonthlySalary.countDocuments({ month: currentMonth, finalized: false }),
            BaseSalary.countDocuments({}),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalStaff,
                tagBreakdown: tagBreakdownAgg.map((t) => ({ tag: t._id || "unassigned", count: t.count })),
                currentMonth,
                monthlySalaryPendingFinalization: notFinalizedCount,
                staffWithBaseSalarySet: baseSalaryCount,
            },
        });
    } catch (error) {
        console.error("Error in /admin/payroll-snapshot:", error);
        return res.status(500).json({ success: false, error: "Server error. Please try again later.", details: error.message });
    }
});

// ── Top-tile system counts: one lightweight count per collection ──
router.get("/admin/system-counts", verifyToken, async (req, res) => {
    console.log("Admin System Counts Route Hit");
    try {
        const [
            clientStaffCount, totalBills, totalPayments, totalProjects,
            totalTasks, totalDfs, totalAgreements, totalSorItems, totalDocuments,
        ] = await Promise.all([
            User.countDocuments({ role: { $in: ["client", "staff"] } }),
            Bill.countDocuments({}),
            Payment.countDocuments({}),
            Project.countDocuments({}),
            Task.countDocuments({}),
            FileForward.countDocuments({}),
            Agreement.countDocuments({}),
            SorItem.countDocuments({}),
            Document.countDocuments({}),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                clientStaffCount,
                totalBills,
                totalPayments,
                totalProjects,
                totalTasks,
                totalDfs,
                totalAgreements,
                totalSorItems,
                totalDocuments,
            },
        });
    } catch (error) {
        console.error("Error in /admin/system-counts:", error);
        return res.status(500).json({ success: false, error: "Server error. Please try again later.", details: error.message });
    }
});

// ── Task status breakdown (bar chart) ──
router.get("/admin/task-status", verifyToken, async (req, res) => {
    console.log("Admin Task Status Route Hit");
    try {
        const STAGES = ["pending", "in_progress", "submitted", "completed", "overdue", "rejected"];
        const agg = await Task.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

        const counts = STAGES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
        agg.forEach((row) => {
            if (Object.prototype.hasOwnProperty.call(counts, row._id)) counts[row._id] = row.count;
        });

        return res.status(200).json({
            success: true,
            data: STAGES.map((status) => ({ status, count: counts[status] })),
        });
    } catch (error) {
        console.error("Error in /admin/task-status:", error);
        return res.status(500).json({ success: false, error: "Server error. Please try again later.", details: error.message });
    }
});

// ── DFS (FileForward) status breakdown ──
router.get("/admin/dfs-status", verifyToken, async (req, res) => {
    console.log("Admin DFS Status Route Hit");
    try {
        const STAGES = ["pending", "in-review", "approved", "rejected"];
        const agg = await FileForward.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

        const counts = STAGES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
        agg.forEach((row) => {
            if (Object.prototype.hasOwnProperty.call(counts, row._id)) counts[row._id] = row.count;
        });

        return res.status(200).json({
            success: true,
            data: STAGES.map((status) => ({ status, count: counts[status] })),
        });
    } catch (error) {
        console.error("Error in /admin/dfs-status:", error);
        return res.status(500).json({ success: false, error: "Server error. Please try again later.", details: error.message });
    }
});

// ── Notifications for the logged-in admin (bell + panel) ──
router.get("/admin/notifications", verifyToken, async (req, res) => {
    console.log("Admin Notifications Route Hit");
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ error: "Invalid user token" });
        }

        const limit = Math.min(parseInt(req.query.limit) || 10, 50);

        const [notifications, unreadCount] = await Promise.all([
            NotificationModel.find({ recipient: userId }).sort({ createdAt: -1 }).limit(limit).lean(),
            NotificationModel.countDocuments({ recipient: userId, isRead: false }),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                unreadCount,
                notifications: notifications.map((n) => ({
                    id: n._id,
                    title: n.title,
                    message: n.message,
                    type: n.type,
                    priority: n.priority,
                    isRead: n.isRead,
                    actionUrl: n.actionUrl,
                    createdAt: n.createdAt,
                })),
            },
        });
    } catch (error) {
        console.error("Error in /admin/notifications:", error);
        return res.status(500).json({ success: false, error: "Server error. Please try again later.", details: error.message });
    }
});

// ── Document status breakdown ──
router.get("/admin/document-status", verifyToken, async (req, res) => {
    console.log("Admin Document Status Route Hit");
    try {
        const STAGES = ["pending", "accepted", "rejected"];
        const agg = await Document.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

        const counts = STAGES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
        agg.forEach((row) => {
            if (Object.prototype.hasOwnProperty.call(counts, row._id)) counts[row._id] = row.count;
        });

        return res.status(200).json({
            success: true,
            data: STAGES.map((status) => ({ status, count: counts[status] })),
        });
    } catch (error) {
        console.error("Error in /admin/document-status:", error);
        return res.status(500).json({ success: false, error: "Server error. Please try again later.", details: error.message });
    }
});

module.exports = router;