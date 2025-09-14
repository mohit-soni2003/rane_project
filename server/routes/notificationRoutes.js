const express = require("express");
const Notification = require("../models/notificationModel");
const User = require("../models/usermodel");
const Bill = require("../models/billmodel");
const Payment = require("../models/paymentmodel");
const FileForward = require("../models/fileForwardingModel");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Get all notifications for the logged-in user
router.get("/", verifyToken, async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        const skip = (page - 1) * limit;

        let query = { recipient: req.userId };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .populate('sender', 'name email cid')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            recipient: req.userId,
            isRead: false
        });

        res.status(200).json({
            notifications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalNotifications: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            unreadCount
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Get unread notification count
router.get("/unread-count", verifyToken, async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({
            recipient: req.userId,
            isRead: false
        });

        res.status(200).json({ unreadCount });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Mark notification as read
router.put("/:id/read", verifyToken, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.userId },
            { isRead: true, readAt: new Date() },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Mark all notifications as read
router.put("/mark-all-read", verifyToken, async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { recipient: req.userId, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.status(200).json({
            message: "All notifications marked as read",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Delete notification
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.userId
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Create notification helper function
const createNotification = async (notificationData) => {
    try {
        const notification = new Notification(notificationData);
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

// Export the helper function for use in other routes
module.exports = router;
module.exports.createNotification = createNotification;
