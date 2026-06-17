const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['bill', 'payment', 'dfs', 'user', 'system', 'alert','agreement'],
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Admin OR  user who should receive this notification
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null, // User who triggered the notification (client/staff)
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null, // ID of related document (bill, payment, dfs, etc.)
    },
    relatedModel: {
        type: String,
        enum: ["User", "Bill", "Payment", "Document", "FileForward", "Notification", "MonthlySalary", "BaseSalary", "Agreement"],
        default: null,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    readAt: {
        type: Date,
        default: null,
    }, 
    actionUrl: {
        type: String,
        default: null, // URL to navigate to when clicked
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
