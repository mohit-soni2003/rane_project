const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const verifyRole = require("../middleware/verifyRole");
const { runAdminChat } = require("../chatbot/geminiChat.orchestrator");

// Reuses your existing RecentActivity model as the audit trail for this
// feature, rather than inventing a new collection — every question asked
// and every tool call it triggered gets logged here. Adjust the field
// names below if RecentActivity's actual schema differs from this guess.
const RecentActivity = require("../models/RecentActivityModel");

// In-memory per-admin conversation buffer. Fine for a single-instance
// deployment; move to Redis (keyed by adminId) if you ever run multiple
// server instances behind a load balancer, since this won't be shared
// across them.
const conversations = new Map(); // adminId -> Gemini `contents` history array
const MAX_HISTORY_TURNS = 20;

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DB CHATBOT
// POST /admin/chat
// Body: { message, reset } — reset:true clears this admin's conversation
// buffer and starts fresh (useful for a "New chat" button in the UI).
// Admin only.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", verifyToken, verifyRole("admin"), async (req, res) => {
    try {
        const { message, reset } = req.body;
        const adminId = req.userId;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: "message is required." });
        }

        if (reset) {
            conversations.delete(adminId);
        }

        const history = conversations.get(adminId) || [];

        const { answer, toolCallLog } = await runAdminChat(message, history);

        // Update this admin's stored history for the next turn.
        const updatedHistory = [
            ...history,
            { role: "user", parts: [{ text: message }] },
            { role: "model", parts: [{ text: answer }] },
        ].slice(-MAX_HISTORY_TURNS * 2);
        conversations.set(adminId, updatedHistory);

        // Audit log — fire-and-forget, don't block the response on it.
        RecentActivity.create({
            user: adminId,
            action: "admin_chatbot_query",
            details: { question: message, toolCalls: toolCallLog },
        }).catch((err) => console.error("Failed to log chatbot query:", err.message));

        return res.status(200).json({
            success: true,
            message: "OK",
            data: { answer, toolCallLog },
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;