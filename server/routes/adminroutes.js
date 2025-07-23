const express = require("express");
const User = require("../models/usermodel");
const Payment = require("../models/paymentmodel")
const Bill = require("../models/billmodel")
const Transaction = require("../models/transaction");
const FileForward = require("../models/fileForwardingModel");

const router = express.Router();

// Route to create a new user (Admin)
router.post("/admin-create-user", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        const newUser = new User({
            name,
            email,
            password,
            isverified: true, // Automatically set to true
        });

        // Save user to database
        await newUser.save();

        res.status(201).json({ message: "User created successfully", userId: newUser._id });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Route to fetch all users (Including Password)
router.get("/admin-get-users", async (req, res) => {
    try {
        const users = await User.find(); // Fetches all users including password
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
router.get("/admin-get-users-details/:id", async (req, res) => {
    console.log("Admin route to view client details hitted...")
    try {
        const userId = req.params.id;
        
        // Fetch user details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Fetch bills and payments for the user
        const bills = await Bill.find({ user: userId });
        const payments = await Payment.find({ user: userId });

        res.status(200).json({
            user,
            bills,
            payments
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Route to delete a user by ID
router.delete("/admin-delete-user/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

router.delete("/admin-delete-user/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete related Bills
        await Bill.deleteMany({ user: userId });

        // Delete related Payments
        await Payment.deleteMany({ user: userId });

        // Delete related Transactions
        await Transaction.deleteMany({ userId });

        // Delete FileForwards where user is uploader or current owner or in forwarding trail
        await FileForward.deleteMany({
            $or: [
                { uploadedBy: userId },
                { currentOwner: userId },
                { "forwardingTrail.forwardedBy": userId },
                { "forwardingTrail.forwardedTo": userId },
                { "comments.user": userId }
            ]
        });

        // Finally, delete the user
        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: "User and all related data deleted successfully" });
    } catch (error) {
        console.error("Error deleting user and data:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
module.exports = router;
