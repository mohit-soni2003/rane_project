const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const User = require("../models/usermodel");
const Bill = require("../models/billmodel");
const Payment = require("../models/paymentmodel");

const router = express.Router();

// Pay Bill Route
router.post("/pay-bill", async (req, res) => {
    console.log("Received payment request:");
    try {
        const { billId, bankName, accNo, ifscCode, amount } = req.body;
        console.log("Received payment request:", { billId, bankName, accNo, ifscCode, amount });

        // Validate required fields
        if (!billId || !bankName || !accNo || !ifscCode || !amount) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if the bill exists and get the userId
        const bill = await Bill.findById(billId);
        if (!bill) {
            return res.status(404).json({ message: "Bill not found." });
        }

        const userId = bill.user._id; // Assuming `user` is stored as an ObjectId reference in Bill
        console.log(userId+ "user iD")
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Create a transaction record
        const transaction = new Transaction({
            billId,
            userId,  // Save userId found from the bill
            amount,
            bankName,
            accNo,
            ifscCode,
        });

        await transaction.save();

        res.status(201).json({ message: "Bill paid successfully", transaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Pay Payment Route
router.post("/pay-payment", async (req, res) => {
    try {
        const { paymentId, upi,amount } = req.body;
        console.log("Received payment request:", { paymentId, upi });

        // Validate required fields
        if (!paymentId || !upi ||!amount ) {
            return res.status(400).json({ message: "Payment ID and UPI are required." });
        }

        // Check if the payment exists and get the userId
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: "Payment record not found." });
        }

        const userId = payment.user._id; // Assuming `user` is stored as an ObjectId reference in Payment
        console.log("User ID:", userId);

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Create a transaction record
        const transaction = new Transaction({
            paymentId,
            userId,
            amount, // Assuming `amount` exists in Payment model
            upiId:upi,
        });

        await transaction.save();

        res.status(201).json({ message: "Payment processed successfully", transaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//Route five transaction corresponding to the bill for admin use only
router.get("/transactions/:billId", async (req, res) => {
    try {
        const { billId } = req.params;

        // Check if the bill exists
        const bill = await Bill.findById(billId);
        if (!bill) {
            return res.status(404).json({ message: "Bill not found." });
        }

        // Find all transactions for the bill
        const transactions = await Transaction.find({ billId }).populate("userId", "name email");

        res.status(200).json({ transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/transactions/payreq/:paymentId", async (req, res) => {
    try {
        const { paymentId } = req.params;

        // Check if the bill exists
        const payreq = await Payment.findById(paymentId);
        if (!payreq) {
            return res.status(404).json({ message: "Bill not found." });
        }

        // Find all transactions for the bill
        const transactions = await Transaction.find({ paymentId }).populate("userId", "name email");

        res.status(200).json({ transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/transaction-of-bill/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Find all transactions for the user that have a billId and sort by latest
        const transactions = await Transaction.find({ userId, billId: { $exists: true } })
            .populate("billId")
            .sort({ transactionDate: -1 });  // Sorting in descending order (latest first)

        res.status(200).json({ transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/transaction-of-payreq/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Find all transactions for the user that have a paymentId and sort by latest
        const transactions = await Transaction.find({ userId, paymentId: { $exists: true } })
            .populate("paymentId")
            .sort({ transactionDate: -1 });  // Sorting in descending order (latest first)

        res.status(200).json({ transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
