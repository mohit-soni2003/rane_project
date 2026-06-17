const mongoose = require("mongoose");

const agreementSchema = new mongoose.Schema(
  {
    // Unique readable ID like AGR-0001 Currently not in use.
    agreementId: {
      type: String,
      default: null,
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
agreementSchema.pre("save", async function (next) {
  if (!this.agreementId) {
    try {
      // Use MongoDB ObjectId timestamp (first 4 bytes) + random component for uniqueness
      const timestamp = Math.floor(Date.now() / 1000).toString(16);
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
      this.agreementId = `AGR-${timestamp}${random}`.substring(0, 20);
    } catch (err) {
      console.error("Error generating agreementId:", err);
      // Fallback: use current timestamp
      this.agreementId = `AGR-${Date.now()}`;
    }
  }

  if (this.isModified("status")) {
    if (this.status === "viewed") this.viewedAt = new Date();
    if (this.status === "signed") this.signedAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Agreement", agreementSchema);
