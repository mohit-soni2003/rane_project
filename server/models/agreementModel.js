const mongoose = require("mongoose");

const agreementSchema = new mongoose.Schema(
  {
    // Unique readable ID like AGR-0001 Currently not in use.
    agreementId: {
      type: String,
      unique: true,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    // client signature info (when client signs)
    clientSignature: {
      name: { type: String, default: "" },
      date: { type: Date },
      ip: { type: String, default: "" }, // 🆕 stores the IP address used for signing
    },

    status: {
      type: String,
      enum: ["pending", "viewed", "signed", "rejected", "expired"],
      default: "pending",
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    viewedAt: {
      type: Date,
    },
    signedAt: {
      type: Date,
    },

    expiryDate: {
      type: Date,
    },
    message: {
      type: String
    },
    extensions: [
      {
        extendedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", 
          required: true,
        },
        oldExpiryDate: {
          type: Date,
          required: true,
        },
        newExpiryDate: {
          type: Date,
          required: true,
        },
        reason: {
          type: String,
          trim: true,
        },
        extendedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    extensionRequest: {
      requested: {
        type: Boolean,
        default: false,
      },
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      requestedAt: {
        type: Date,
      },
      requestedExpiryDate: {
        type: Date,
      },
      reason: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reviewedAt: {
        type: Date,
      },
    },


  },
  { timestamps: true }
);

//
// 🧠 Auto-generate readable Agreement ID before saving
//
agreementSchema.pre("validate", async function (next) {
  if (!this.agreementId) {
    const Agreement = mongoose.model("Agreement");
    const count = await Agreement.countDocuments();
    // e.g., AGR-0001, AGR-0002, ...
    this.agreementId = `AGR-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

agreementSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "viewed") this.viewedAt = new Date();
    if (this.status === "signed") this.signedAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Agreement", agreementSchema);
