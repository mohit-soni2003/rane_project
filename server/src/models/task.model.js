const mongoose = require("mongoose");

/* ------------------------------------------------------------------ */
/*  SUB-SCHEMA: Completion image                                      */
/* ------------------------------------------------------------------ */
const completionImageSchema = new mongoose.Schema(
    {
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true }
);

/* ------------------------------------------------------------------ */
/*  SUB-SCHEMA: Per-user allotment                                    */
/*  Each user a task is allotted to owns their OWN status, remark,    */
/*  proof images, submission time, and completion timestamp.          */
/*  A user may only update the entry where entry.user === themself    */
/*  (enforce that in your controller/middleware, not here).           */
/* ------------------------------------------------------------------ */
const allottedToSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "in_progress", "submitted", "completed", "rejected"],
            default: "pending",
            required: true
        },

        remark: {
            type: String
        },

        images: [completionImageSchema],

        submittedAt: {
            type: Date
        },

        // auto-stamped in pre-save the moment this user's status becomes "completed"
        completedAt: {
            type: Date
        }
    },
    { _id: true }
);

/* ------------------------------------------------------------------ */
/*  SUB-SCHEMA: Overall-status audit trail                            */
/*  Overall status is set only by the authority id your middleware    */
/*  resolves — never directly by an assignee.                         */
/* ------------------------------------------------------------------ */
const statusHistorySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: ["pending", "in_progress", "submitted", "completed", "overdue", "rejected"],
            required: true
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        remark: String,
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

/* ------------------------------------------------------------------ */
/*  MAIN SCHEMA: Task                                                 */
/* ------------------------------------------------------------------ */
const taskSchema = new mongoose.Schema(
    {
        /* ---------------------------------------------------------- */
        /* PARENT PROJECT                                             */
        /* ---------------------------------------------------------- */
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        /*
         * Points to the _ids of one or more entries inside project.documents[].
         * That array is embedded on Project (not its own collection),
         * so Mongoose can't $ref/populate it directly — resolve it
         * with getRelatedDocuments() below.
         */
        relatedDocuments: {
            type: [mongoose.Schema.Types.ObjectId],
            default: []
        },

        // OPTIONAL TEAM LINK (which vertical's team this task belongs to)
        vertical: {
            type: String,
            enum: ["COO", "CFO", "CEO"]
        },

        /* ---------------------------------------------------------- */
        /* BASIC TASK INFORMATION                                     */
        /* ---------------------------------------------------------- */
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        },

        /* ---------------------------------------------------------- */
        /* ALLOTMENT — multiple users, each tracked individually      */
        /* ---------------------------------------------------------- */
        allottedTo: {
            type: [allottedToSchema],
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length > 0,
                message: "A task must be allotted to at least one user."
            }
        },
        allottedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        /* ---------------------------------------------------------- */
        /* DEADLINE                                                   */
        /* ---------------------------------------------------------- */
        startDate: {
            type: Date
        },
        deadline: {
            type: Date,
            required: true
        },

        /* ---------------------------------------------------------- */
        /* OVERALL STATUS — settable only by the authority id your    */
        /* middleware resolves, independent of each user's own status */
        /* ---------------------------------------------------------- */
        status: {
            type: String,
            enum: ["pending", "in_progress", "submitted", "completed", "overdue", "rejected"],
            default: "pending"
        },
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
        statusHistory: [statusHistorySchema],

        // Convenience mirror of the most recent remark across all assignees/authority actions
        latestRemark: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

/* ------------------------------------------------------------------ */
/*  PRE-SAVE: stamp each assignee's completedAt the moment their      */
/*  status becomes "completed" (clears it if reopened)                */
/* ------------------------------------------------------------------ */
taskSchema.pre("save", function (next) {
    if (Array.isArray(this.allottedTo)) {
        this.allottedTo.forEach((a) => {
            if (a.status === "completed" && !a.completedAt) {
                a.completedAt = new Date();
            }
            if (a.status !== "completed" && a.completedAt) {
                a.completedAt = undefined;
            }
        });
    }
    next();
});

/* ------------------------------------------------------------------ */
/*  INSTANCE METHOD: a user updates their OWN allotment entry         */
/*  (guard req.user.id === userId in the controller before calling)   */
/* ------------------------------------------------------------------ */
taskSchema.methods.updateOwnStatus = function (userId, { status, remark, images, submittedAt } = {}) {
    const entry = this.allottedTo.find((a) => a.user.toString() === userId.toString());
    if (!entry) {
        throw new Error("User is not allotted this task.");
    }
    if (status !== undefined) entry.status = status;
    if (remark !== undefined) {
        entry.remark = remark;
        this.latestRemark = remark;
    }
    if (images !== undefined) entry.images = images;
    if (submittedAt !== undefined) entry.submittedAt = submittedAt;
    else if (status === "submitted") entry.submittedAt = new Date();

    return this.save();
};

/* ------------------------------------------------------------------ */
/*  INSTANCE METHOD: set overall status                               */
/*  Call only after your middleware confirms the caller is the        */
/*  designated authority id for this task/project.                    */
/* ------------------------------------------------------------------ */
taskSchema.methods.setOverallStatus = function (status, authorityUserId, remark) {
    this.status = status;
    if (remark !== undefined) this.latestRemark = remark;
    if (status === "completed") this.completedAt = new Date();

    this.statusHistory.push({
        status,
        updatedBy: authorityUserId,
        remark
    });
    return this.save();
};

/* ------------------------------------------------------------------ */
/*  INSTANCE METHOD: authority verifies the submitted work            */
/* ------------------------------------------------------------------ */
taskSchema.methods.verify = function (authorityUserId) {
    this.verifiedBy = authorityUserId;
    this.verifiedAt = new Date();
    return this.save();
};

/* ------------------------------------------------------------------ */
/*  INSTANCE METHOD: resolve the linked documents from the Project    */
/* ------------------------------------------------------------------ */
taskSchema.methods.getRelatedDocuments = async function () {
    if (!this.relatedDocuments || this.relatedDocuments.length === 0) return [];
    const Project = mongoose.model("Project");
    const project = await Project.findById(this.project).select("documents");
    if (!project) return [];
    return this.relatedDocuments
        .map(docId => project.documents.id(docId))
        .filter(Boolean);
};

/* ------------------------------------------------------------------ */
/*  INDEXES                                                            */
/* ------------------------------------------------------------------ */
taskSchema.index({ project: 1 });
taskSchema.index({ "allottedTo.user": 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ deadline: 1 });

module.exports = mongoose.model("Task", taskSchema);