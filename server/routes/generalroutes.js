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
const mongoose = require("mongoose");

//This is used to fetch recent activities where userID is provided in params
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all activities of that user
    const activities = await RecentActivityModel.find({ user: userId })
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });

  } catch (err) {
    console.error("Error fetching recent activity:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;
