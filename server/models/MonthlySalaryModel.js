const mongoose = require("mongoose");

const monthlySalarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  month: {
    type: String,
    required: true, // format: "YYYY-MM"
  },

  // ✅ Multiple overtime entries
  overtime: [
    {
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
      note: { type: String, default: "" },
    },
  ],

  // ✅ Multiple advance pays
  advancePay: [
    {
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
      note: { type: String, default: "" },
    },
  ],

  // ✅ Multiple leave-related salary cuts
  leaveCuts: [
    {
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
      note: { type: String, default: "" }, // e.g. "Unpaid leave on 12th July"
    },
  ],

  allowances: {
    house: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    travel: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    conveyance: { type: Number, default: 0 },
    special: { type: Number, default: 0 },
    dearness: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },

  bonus: { type: Number, default: 0 },

  finalized: { type: Boolean, default: false },
  paidOn: { type: Date },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

monthlySalarySchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("MonthlySalary", monthlySalarySchema);
