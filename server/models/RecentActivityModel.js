const mongoose = require("mongoose");

const recentActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
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
      "agreement_signed",
    ],
    default: "other",
  },
  description: {
    type: String,
    required: true,
  },
  relatedModel: {
    type: String,
    enum: ["User", "Bill", "Payment", "Document", "FileForward", "Notification", "MonthlySalary", "BaseSalary","Agreement"],
    default: null,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  actionUrl: {
    type: String,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

recentActivitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("RecentActivity", recentActivitySchema);
