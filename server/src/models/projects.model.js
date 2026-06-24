const mongoose = require("mongoose");
const projectSchema = new mongoose.Schema({
    // BASIC PROJECT INFORMATION
    projectId: {
        type: String,
        unique: true,
        required: true
    },
    projectName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },

    // Government / Commercial / Industrial

    projectType: {
        type: String,
        enum: [
            "government",
            "commercial",
            "industrial",
            "private",
            "amc_work"
        ],
        required: true
    },
    category: {
        type: String
    },

    // CLIENT / DEPARTMENT DETAILS

    clientName: {
        type: String
    },

    department: {
        type: String,
        enum: [
            "indian_railway",
            "municipal_corporation",
            "central_government",
            "state_government",
            "smart_city",
            "psu",
            "defence",
            "airport_authority",
            "private_sector",
            "others"
        ],
        required: true
    },

    // RAILWAY-ONLY DETAILS (used when department = indian_railway)

    subDepartment: {
        type: String,
        enum: [
            "engineering",               // eng
            "electrical",                // elec
            "mechanical",                // mech
            "signal_and_telecom",        // snt (S&T)
            "commercial",                // com
            "medical",                   // med
            "personnel",                 // pers
            "operating"                  // ops
        ]
    },

    zone: {
        type: String,
        enum: [
            "cr", "wr", "wcr", "ncr", "nr", "nwr", "ner", "nfr",
            "er", "ecr", "ecor", "ser", "secr", "sr", "scr",
            "swr", "krcl", "mrk"
        ]
    },

    circle: {
        type: String,
        enum: [
            "circle",        // Circle HQ level
            "zone",          // Zonal level
            "division"       // District/Division Office level
        ]
    },

    division: {
        type: String,
    },

    // PSU-ONLY DETAILS (used when department = psu)

    psuName: {
        type: String,
        enum: [
            "ntpc",
            "ongc",
            "iocl",
            "gail",
            "bhel",
            "sail",
            "nhpc"
        ]
    },

    location: {
        state: String,
        city: String,
        siteAddress: String,
        district: String,
        pincode: String
    },

    // TENDER DETAILS

    tenderNo: {
        type: String
    },

    loaNo: {
        type: String
    },

    agreementNo: {
        type: String
    },

    // FINANCIAL DETAILS

    estimatedCost: {
        type: Number,
        default: 0
    },

    projectCost: {
        type: Number,
        default: 0
    },

    paidAmount: {
        type: Number,
        default: 0
    },

    pendingAmount: {
        type: Number,
        default: 0
    },

    // APPROVAL WORKFLOW

    approvalStage: {
        type: String,
        enum: [
            "ADMIN",
            "COO",
            "CFO",
            "CEO",
            "DIRECTOR",
            "COMPLETED"
        ],
        default: "ADMIN"
    },

    currentAuthority: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    status: {
        type: String,
        enum: [
            "draft",
            "pending",
            "approved",
            "returned",
            "rejected",
            "completed"
        ],
        default: "draft"
    },

    // APPROVAL TRAIL (one entry per sign-off / return / rejection)

    approvals: [{
        stage: {
            type: String,
            enum: ["ADMIN", "COO", "CFO", "CEO", "DIRECTOR"]
        },
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        action: {
            type: String,
            enum: ["approved", "returned", "rejected"]
        },
        remark: String,
        signatureUrl: String,        // digital signature artifact
        signatureHash: String,       // optional integrity hash
        signedAt: Date,
        actedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // CREATED BY

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // TEAM REFERENCE

    projectManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    // TEAMS (created per vertical: COO / CFO / CEO)

    teams: [{
        vertical: {
            type: String,
            enum: ["COO", "CFO", "CEO"]
        },
        purpose: {
            type: String,
            enum: [
                "site_inspection",   // COO
                "execution",         // COO
                "labor",             // COO
                "billing",           // CFO
                "office"             // CEO – paperwork / liaison
            ]
        },
        name: String,
        lead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        members: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // TASKS (created under this project, assigned to users with deadlines)

    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    }],

    // DOCUMENTS

    documents: [{
        name: String,
        url: String,
        documentType: {
            type: String,
            enum: [
                "tender_document",
                "loa",
                "agreement",
                "boq",
                "drawings",
                "nit"
            ]
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // REMARKS

    latestRemark: {
        type: String
    },

    // DEADLINE

    startDate: {
        type: Date
    },

    estimatedCompletionDate: {
        type: Date
    },

    completionDate: {
        type: Date
    },
},
    {
        timestamps: true
    });

module.exports = mongoose.model(
    "Project",
    projectSchema
);