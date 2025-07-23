// models/FileForward.js
const mongoose = require("mongoose");

const fileForwardSchema = new mongoose.Schema({
  fileTitle: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true, // Original document
  },
  docType:{
    type:String
  }, 
  Department:{
    type:String 
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
  description : {
    type:String,
    required:true
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

  // ✅ New Feature: Attachments by the current owner
  attachments: [
    {
      fileUrl: {
        type: String,
        required: true, // URL of the new file (uploaded to cloud)
      },
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // Usually currentOwner at the time
      },
      remark: {
        type: String,
      },
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
