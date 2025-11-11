const mongoose = require("mongoose");

const recentActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // user who performed the action
  },
  actionType: {
    type: String,
    required: true,
    enum: [
      "login",
      "logout",
      "file_uploaded",
      "file_forwarded",
      "bill_submitted",
      "payment_requested",
      "payment_approved",
      "salary_updated",
      "document_uploaded",
      "status_changed",
      "system_action",
      "other",
    ],
    default: "other",
  },
  description: {
    type: String,
    required: true, // short readable info like "Uploaded Bill #123"
  },
  relatedModel: {
    type: String,
    enum: ["User", "Bill", "Payment", "Document", "FileForward", "Notification", "MonthlySalary", "BaseSalary"],
    default: null,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null, // optional reference to related record
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // store extra data (flexible)
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

recentActivitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("RecentActivity", recentActivitySchema);
