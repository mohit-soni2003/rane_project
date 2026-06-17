const mongoose = require("mongoose");
 
const sorItemSchema = new mongoose.Schema(
  {
    item_number: {
      type: String,
      required: true,
      // Supports "1", "15.A", "31.6", "28.B", "22.A"
    },
    schedule: {
      type: String,
      required: true,
      enum: [
        "Fire Extinguishers",
        "Fire Pipes",
        "Sprinkler System",
        "Fire Alarm System",
        "Pumps & Accessories",
        "Valves & Accessories",
        "Hydrant System",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      // "Each", "Meter", "Set", "Rmt"
    },
    rate_low: {
      type: Number,
      required: true,
      min: 0,
    },
    rate_high: {
      type: Number,
      default: null,
      min: 0,
      // null = fixed rate, else display as "₹rate_low–rate_high"
    },
    version: {
      type: Number,
      default: 1,
      // Per-item version, increments on each update
    },
    is_latest: {
      type: Boolean,
      default: true,
      // Only one doc per item_number has is_latest: true at any time
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // refs your existing User model
      required: true,
      // User.role must be "admin" — enforce this in your route middleware,
      // not in the model itself
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
 
// Fast query: all current rates (what client/staff/user see)
sorItemSchema.index({ item_number: 1, is_latest: 1 });
 
// Admin: full history of a single item, newest first
sorItemSchema.index({ item_number: 1, version: -1 });
 
// Admin: all latest items filtered by schedule
sorItemSchema.index({ schedule: 1, is_latest: 1 });
 
// Virtual: display-ready rate string e.g. "₹100" or "₹100–120"
sorItemSchema.virtual("rate_display").get(function () {
  if (!this.rate_high || this.rate_high === this.rate_low) {
    return `₹${this.rate_low}`;
  }
  return `₹${this.rate_low}–${this.rate_high}`;
});
 
sorItemSchema.set("toJSON", { virtuals: true });
sorItemSchema.set("toObject", { virtuals: true });
 
module.exports = mongoose.model("SorItem", sorItemSchema);