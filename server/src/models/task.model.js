const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema({
    // PARENT PROJECT

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },

    // OPTIONAL TEAM LINK (which vertical's team this task belongs to)

    vertical: {
        type: String,
        enum: ["COO", "CFO", "CEO"]
    },

    // BASIC TASK INFORMATION

    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    priority: {
        type: String,
        enum: [
            "low",
            "medium",
            "high",
            "urgent"
        ],
        default: "medium"
    },

    // ALLOTMENT

    allottedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],

    allottedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // DEADLINE

    startDate: {
        type: Date
    },

    deadline: {
        type: Date,
        required: true
    },

    // STATUS

    status: {
        type: String,
        enum: [
            "pending",
            "in_progress",
            "submitted",
            "completed",
            "overdue",
            "rejected"
        ],
        default: "pending"
    },

    // COMPLETION DETAILS (filled when the user finishes the task)

    completion: {
        remark: String,
        images: [{
            name: String,
            url: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        submittedAt: Date
    },

    // VERIFICATION (optional approval of the submitted work)

    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    verifiedAt: {
        type: Date
    },

    completedAt: {
        type: Date
    },

    // REMARKS

    latestRemark: {
        type: String
    },
},
    {
        timestamps: true
    });

module.exports = mongoose.model(
    "Task",
    taskSchema
);