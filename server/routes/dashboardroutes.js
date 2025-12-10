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
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ error: "Invalid user token" });
        }

        // Fetch all required data in parallel for performance
        const [
            bills,
            payments,
            agreementcnt,
            signedAgreement
        ] = await Promise.all([
            Bill.find({ user: userId }),
            Payment.find({ user: userId }),
            Agreement.countDocuments({ client: userId }),
            Agreement.countDocuments({ client: userId, status: "signed" })
        ]);

        // Count calculations
        const billcnt = bills.length;
        const paidBillCnt = bills.filter(b => b.status === "Paid").length;

        const prcnt = payments.length;
        const paidPrCnt = payments.filter(p => p.status === "Paid").length;

        return res.status(200).json({
            success: true,
            data: {
                billcnt,
                paidBillCnt,
                prcnt,
                paidPrCnt,
                signedAgreement,
                agreementcnt
            }
        });

    } catch (error) {
        console.error("Error in /client/overview:", error);

        return res.status(500).json({
            success: false,
            error: "Server error. Please try again later.",
            details: error.message
        });
    }
});

module.exports = router;
