const express = require('express');
const router = express.Router();
const verifyToken = require("../middleware/verifyToken")
const RecentActivityModel = require("../models/RecentActivityModel")
const User = require("../models/usermodel");
const Payment = require("../models/paymentmodel");
const Bill = require("../models/billmodel");
const Transaction = require("../models/transaction");
const FileForward = require("../models/fileForwardingModel");
const Document = require("../models/documentmodel");
const Agreement = require("../models/agreementModel")
const mongoose = require("mongoose");

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

        // helper: normalize status value
        const norm = (s) => (s ? String(s).trim().toLowerCase() : "");

        // helper: parse amount strings safely
        const parseAmount = (v) => {
            if (v == null) return 0;
            if (typeof v === "number" && Number.isFinite(v)) return v;
            // remove commas, currency symbols and whitespace
            const cleaned = String(v).replace(/[^\d.-]/g, "");
            const n = parseFloat(cleaned);
            return Number.isFinite(n) ? n : 0;
        };

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

        // Helper: convert amount string → number safely
        const toNumber = (value) => {
            if (!value) return 0;

            return parseInt(
                String(value)
                    .replace(/,/g, "")
                    .replace(/₹/g, ""),
                10
            ) || 0;
        };

        // STATUS COUNTS
        const paidBills = bills.filter(b => b.paymentStatus === "Paid");
        const pendingBills = bills.filter(b => b.paymentStatus === "Pending");
        const unpaidBills = bills.filter(b => b.paymentStatus === "Unpaid");
        const sanctionedBills = bills.filter(b => b.paymentStatus === "Sanctioned");
        const rejectedBills = bills.filter(b => b.paymentStatus === "Reject");
        const overdueBills = bills.filter(b => b.paymentStatus === "Overdue");


        console.log("----------------------------------The all bills are ------------------------");
        console.log(bills)
        console.log("----------------------------------The all bills are ------------------------");
        let paidAmount = 0;
        let pendingAmount = 0;
        let overdueAmount = 0;
        let otherAmount = 0;         //otherAmount = sanctionedAmount + rejectedAmount + overdueAmount;
        let totalAmount = 0;

        for (let bill of bills) {
            totalAmount+=toNumber(bill.amount)

            if (bill.paymentStatus === "Paid") {
                paidAmount += toNumber(bill.amount);
            }
            else if (bill.paymentStatus === "Pending") {
                pendingAmount += toNumber(bill.amount);
            }
            else if (bill.paymentStatus === "Overdue") {
                overdueAmount += toNumber(bill.amount);
            }
            else{
                otherAmount += toNumber(bill.amount);
            }
        }


        return res.status(200).json({
            success: true,
            data: {
                totalBills,

                // Count
                paid: paidBills.length,
                pending: pendingBills.length,
                unpaid: unpaidBills.length,
                sanctioned: sanctionedBills.length,
                rejected: rejectedBills.length,
                overdue: overdueBills.length,

                // Amounts
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


module.exports = router;

