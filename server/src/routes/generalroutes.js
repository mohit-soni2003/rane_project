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
router.get("/recent-activity/:userId", async (req, res) => {
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

// Keep this in sync with the `tag` enum on the User schema.
const VALID_TAGS = [
    "admin", "ceo", "cto", "cfo", "coo", "director", "site_incharge",
    "chief_finance_head", "finance_head", "accountant", "supervisor",
    "client", "staff"
];
 
// ─────────────────────────────────────────────────────────────────────────────
// UPDATE A USER'S TAG
// PATCH /users/:userId/tag
// Body: { tag } — required, must be one of VALID_TAGS.
// Admin only — tag drives project-permission resolution, so only an
// admin should be able to change it.
// ─────────────────────────────────────────────────────────────────────────────
// router.patch("/users/:userId/tag", verifyToken, verifyRole("admin"), async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const { tag } = req.body;
 
//         if (!tag || !VALID_TAGS.includes(tag)) {
//             return res.status(400).json({
//                 success: false,
//                 message: `tag is required and must be one of: ${VALID_TAGS.join(", ")}`
//             });
//         }
 
//         const user = await User.findByIdAndUpdate(
//             userId,
//             { tag },
//             { new: true, runValidators: true }
//         ).select("name email cid role tag");
 
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found."
//             });
//         }
 
//         return res.status(200).json({
//             success: true,
//             message: "User tag updated successfully.",
//             data: user
//         });
 
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// });

module.exports = router;
