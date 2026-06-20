// models/FileForward.js
const mongoose = require("mongoose");

const fileForwardSchema = new mongoose.Schema({
  fileTitle: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  docType: {
    type: String,
    enum: [
      "Proposal",
      "Report",
      "Quotation/Estimate",
      "Contract",
      "Invoices",
      "Others",
    ],
  },
  Department: {
    type: String,
  },

  // ── Invoice sub-fields (populated when docType === "Invoices") ──
  invoiceSubFields: {
    invoiceType: {
      type: String,
      enum: ["IR Invoice", "Commercial Invoice", "Return Invoice", "Labour Invoice"],
    },
  },

  // ── Contract sub-fields (populated when docType === "Contract") ──
  contractSubFields: {
    eAgreement: {
      type: String,
      enum: ["Agreement Acceptance", "Agreement Modification", "Other"],
    },
    generalContractAndLabour: {
      type: String,
      enum: ["Labour", "Goods and Supply"],
    },
  },

  // ── Proposal sub-fields (populated when docType === "Proposal") ──
  proposalSubFields: {
    proposalType: {
      type: String,
      enum: [
        "New NS Item Proposal",
        "Vetted NS Item Proposal",
        "NS Under SORS",
        "Previous NS Query",
      ],
    },
  },

  // ── Report sub-fields (populated when docType === "Report") ──
  reportSubFields: {
    employeeMeasurementBook: {
      type: String,
      enum: ["Recorded MB", "Finalised MB", "Pending MB"],
    },
    employeeReport: {
      type: String,
      enum: ["Document Report", "Tender Report", "Work Report", "Other"],
    },
  },

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  currentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in-review", "approved", "rejected"],
    default: "pending",
  },
  forwardingTrail: [
    {
      forwardedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      forwardedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      note: String,
      action: {
        type: String,
        enum: ["forwarded", "viewed", "commented", "approved", "rejected"],
      },
      attachment: String, // ✅ attachment support
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("FileForward", fileForwardSchema);
















// // models/FileForward.js
// const mongoose = require("mongoose");

// const fileForwardSchema = new mongoose.Schema({
//   fileTitle: {
//     type: String,
//     required: true,
//   },
//   fileUrl: {
//     type: String,
//     required: true, // Original document
//   },
//   docType:{
//     type:String
//   }, 
//   Department:{
//     type:String 
//   },
//   uploadedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   currentOwner: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   description : {
//     type:String,
//     required:true
//   },
//   status: {
//     type: String,
//     enum: ["pending", "in-review", "approved", "rejected"],
//     default: "pending",
//   },
//   forwardingTrail: [
//     {
//       forwardedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//       forwardedTo: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//       note: String,
//       action: {
//         type: String,
//         enum: ["forwarded", "viewed", "commented", "approved", "rejected"],
//       },
//       timestamp: {
//         type: Date,
//         default: Date.now,
//       },
//     },
//   ],
//   comments: [
//     {
//       user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//       comment: String,
//       timestamp: {
//         type: Date,
//         default: Date.now,
//       },
//     },
//   ],

//   // ✅ New Feature: Attachments by the current owner
//   forwardingTrail: [
//   {
//     forwardedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     forwardedTo: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     note: String,
//     action: {
//       type: String,
//       enum: ["forwarded", "viewed", "commented", "approved", "rejected"],
//     },
//     attachment: String, // ✅ ADD THIS LINE
//     timestamp: {
//       type: Date,
//       default: Date.now,
//     },
//   },
// ],

//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("FileForward", fileForwardSchema);
