const mongoose = require("mongoose");

const baseSalarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // One base salary per user
  },
  amount: {
    type: Number,
    required: true,
  },
  effectiveFrom: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("BaseSalary", baseSalarySchema);
