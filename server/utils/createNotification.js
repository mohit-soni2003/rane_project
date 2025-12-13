const Notification = require("../models/notificationModel");

/**
 * Create a new notification
 * @param {Object} data - Notification details
 * @returns {Promise<Object>} - Created notification document
 */
const createNotification = async (data) => {
    try {
        const notification = new Notification({
            title: data.title,
            message: data.message,
            type: data.type,              // 'bill', 'payment', 'dfs', 'user', etc.
            priority: data.priority || "medium",
            recipient: data.recipient,    // MUST: ObjectId of user who receives notification
            sender: data.sender || null,
            relatedId: data.relatedId || null,
            relatedModel: data.relatedModel || null,
            actionUrl: data.actionUrl || null,
            metadata: data.metadata || {},
        });

        await notification.save();
        return notification;

    } catch (error) {
        console.error("❌ Error creating notification:", error);
        throw error;
    }
};

module.exports.createNotification = createNotification;
