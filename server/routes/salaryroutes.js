const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const MonthlySalary = require("../models/MonthlySalaryModel");
const BaseSalary = require("../models/BaseSalaryModel");

const verifyToken = require("../middleware/verifyToken")
// upload base salary 
router.post("/base/upload", verifyToken, async (req, res) => {
    try {
        const { user, amount } = req.body;
        const existing = await BaseSalary.findOne({ user });

        if (existing) {
            existing.amount = amount;
            await existing.save();
            return res.json({ message: "Base salary updated", baseSalary: existing });
        }

        const baseSalary = new BaseSalary({ user, amount });
        await baseSalary.save();

        res.json({ message: "Base salary uploaded", baseSalary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get base salary for a specific user
router.get("/base/:userId", verifyToken, async (req, res) => {
    try {
        const baseSalary = await BaseSalary.findOne({ user: req.params.userId });
        if (!baseSalary) return res.status(404).json({ error: "Base salary not found" });

        res.json(baseSalary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Initialize monthly salary
router.post("/monthly/init", verifyToken, async (req, res) => {
    try {
        const { user, month } = req.body;

        const existing = await MonthlySalary.findOne({ user, month });
        if (existing) return res.status(400).json({ error: "Already initialized" });

        const salary = new MonthlySalary({ user, month });
        await salary.save();

        res.json({ message: "Monthly salary initialized", salary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Add OVERTIME
router.post("/monthly/:month/overtime/:userId", verifyToken, async (req, res) => {
    try {
        const { userId, month } = req.params;
        const { amount, date } = req.body;

        const salary = await MonthlySalary.findOneAndUpdate(
            { user: userId, month },
            { $push: { overtimeEntries: { amount, date } } },
            { new: true, upsert: true }
        );
        res.json({ message: "Overtime added", salary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Add ADVANCE
router.post("/monthly/:month/advance/:userId", verifyToken, async (req, res) => {
    try {
        const { userId, month } = req.params;
        const { amount, date } = req.body;

        const salary = await MonthlySalary.findOneAndUpdate(
            { user: userId, month },
            { $push: { advancePayEntries: { amount, date } } },
            { new: true, upsert: true }
        );
        res.json({ message: "Advance added", salary });
    } catch (err) { 
        res.status(500).json({ error: err.message });
    }
});

// 📌 Add LEAVE deduction
router.post("/monthly/:month/leave/:userId", verifyToken, async (req, res) => {
    try {
        const { userId, month } = req.params;
        const { amount, date, reason } = req.body;

        const salary = await MonthlySalary.findOneAndUpdate(
            { user: userId, month },
            { $push: { leaveDeductions: { amount, date, reason } } },
            { new: true, upsert: true }
        );
        res.json({ message: "Leave deduction added", salary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Update Allowances + Bonus
router.put("/monthly/:month/update/:userId", verifyToken, async (req, res) => {
    try {
        const { userId, month } = req.params;
        const { allowances, bonus, overtime, advancePay, leaveCuts } = req.body;

        const update = {};
        if (allowances !== undefined) update.allowances = allowances;
        if (bonus !== undefined) update.bonus = bonus;
        if (overtime) update.overtime = overtime;        // replace full array
        if (advancePay) update.advancePay = advancePay;  // replace full array
        if (leaveCuts) update.leaveCuts = leaveCuts;     // replace full array

        const salary = await MonthlySalary.findOneAndUpdate(
            { user: userId, month },
            { $set: update },
            { new: true }
        );

        if (!salary) {
            return res.status(404).json({ error: "Salary record not found." });
        }

        res.json({ message: "Updated", salary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 📌 Finalize salary
router.post("/monthly/:month/finalize/:userId", verifyToken, async (req, res) => {
    try {
        const { userId, month } = req.params;

        const salary = await MonthlySalary.findOneAndUpdate(
            { user: userId, month },
            { $set: { finalized: true, paidOn: new Date() } },
            { new: true }
        );
        res.json({ message: "Salary finalized", salary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Get Monthly Salary (for single user)
router.get("/monthly/:month/:userId", verifyToken, async (req, res) => {
    try {
        const { userId, month } = req.params;
        const salary = await MonthlySalary.findOne({ user: userId, month }).populate("user");
        if (!salary) return res.status(404).json({ error: "No record found" });

        res.json(salary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Summary for All Users (for admin dashboard)
router.get("/monthly/:month/summary", verifyToken, async (req, res) => {
    try {
        const { month } = req.params;
        const salaries = await MonthlySalary.find({ month }).populate("user");
        res.json(salaries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
