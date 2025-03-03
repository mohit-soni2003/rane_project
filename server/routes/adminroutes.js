const express = require("express");
const User = require("../models/usermodel");
const Payment = require("../models/paymentmodel")
const Bill = require("../models/billmodel")


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


module.exports = router;
