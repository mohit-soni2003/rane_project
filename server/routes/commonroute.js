const express = require("express")
const User = require("../models/usermodel")
const Bill = require("../models/billmodel")
const Payment = require("../models/paymentmodel")
const MonthlySalary = require("../models/MonthlySalaryModel")
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const router = express.Router();

router.get("/count-client-bill", async (req, res) => {
    console.log("Count Client / Bill route hittedd")
    try {
        const userCount = await User.countDocuments();
        const billCount = await Bill.countDocuments();
        const sanctionedBillCount = await Bill.countDocuments({ paymentStatus: "Sanctioned" });

        res.json({
            totalUsers: userCount,
            totalBills: billCount,
            sanctionedBills: sanctionedBillCount
        });
    } catch (error) {
        console.error("Error fetching counts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});






router.get("/dashboard/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        let userObjectId;
        try {
            userObjectId = new ObjectId(userId);
        } catch {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // Current month string
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        // ---------- 1. Bills Stats ----------
        const bills = await Bill.aggregate([
            {
                $match: {
                    $or: [
                        { user: userObjectId }, // if stored as ObjectId
                        { user: userId }        // if stored as string
                    ]
                }
            },
            {
                $group: {
                    _id: "$paymentStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log("Bills aggregation result:", bills);

        const billStats = {
            total: bills.reduce((acc, b) => acc + b.count, 0),
            cleared: bills.find(b => b._id === "Paid")?.count || 0,
            rejected: bills.find(b => b._id === "Reject")?.count || 0
        };

        // ---------- 2. Payment Request Stats ----------
        const payments = await Payment.aggregate([
            {
                $match: {
                    $or: [
                        { user: userObjectId },
                        { user: userId }
                    ]
                }
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log("Payments aggregation result:", payments);

        const paymentStats = {
            total: payments.reduce((acc, p) => acc + p.count, 0),
            approved: payments.find(p => p._id === "Approved")?.count || 0,
            rejected: payments.find(p => p._id === "Rejected")?.count || 0
        };

        // ---------- 3. Salary for Current Month ----------
        const salary = await MonthlySalary.findOne({
            $or: [
                { user: userObjectId },
                { user: userId }
            ],
            month: monthStr
        });

        console.log("Salary result:", salary);

        const salaryStats = salary
            ? {
                bonus: salary.bonus,
                overtimeTotal: salary.overtime?.reduce((sum, o) => sum + o.amount, 0) || 0,
                finalized: salary.finalized
            }
            : { bonus: 0, overtimeTotal: 0, finalized: false };

        // ---------- Response ----------
        res.json({
            bills: billStats,
            payments: paymentStats,
            salary: salaryStats
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;



module.exports = router
