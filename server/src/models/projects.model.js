const mongoose = require("mongoose");

/* ------------------------------------------------------------------ */
/*  SUB-SCHEMA: Document                                              */
/* ------------------------------------------------------------------ */
const documentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        url: { type: String, required: true },
        documentType: {
            type: String,
            enum: ["tender_document", "loa", "agreement", "boq", "drawings", "nit"],
            required: true
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true }
);

/* ------------------------------------------------------------------ */
/*  SUB-SCHEMA: Approval trail entry                                  */
/* ------------------------------------------------------------------ */
const approvalSchema = new mongoose.Schema(
    {
        stage: {
            type: String,
            enum: ["ADMIN", "CEO", "CTO", "CFO", "COO", "DIRECTOR","OTHER"],
            default: "ADMIN",
            required: true
        },
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        action: {
            type: String,
            enum: ["approved", "returned", "rejected", "pending"],
            required: true
        },
        remark: String,
        actedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true }
);

/* ------------------------------------------------------------------ */
/*  MAIN SCHEMA: Project                                              */
/* ------------------------------------------------------------------ */
const projectSchema = new mongoose.Schema(
    {
        /* ---------------------------------------------------------- */
        /* 1. BASIC DETAILS                                          */
        /* ---------------------------------------------------------- */

        projectId: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },
        projectName: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String
        },

        /* ---------------------------------------------------------- */
        /* 2. LOCATION OF PROJECT                                    */
        /* ---------------------------------------------------------- */
        location: {
            state: { type: String },
            city: { type: String },
            district: { type: String },
            pincode: { type: String },
            siteAddress: { type: String }
        },

        /* ---------------------------------------------------------- */
        /* 3. DOCUMENTS                                              */
        /* ---------------------------------------------------------- */
        documents: [documentSchema],

        /* ---------------------------------------------------------- */
        /* 4. ADVANCED PROJECT DETAILS                               */
        /* ---------------------------------------------------------- */
        projectType: {
            type: String,
            enum: ["government", "commercial", "industrial", "private", "amc_work"],
        },

        tenderType: {
            type: String,
            enum: ["open", "limited", "single", "nomination"],
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
        },

        contractType: {
            type: String,
            enum: ["work", "goods", "supply"],
        },

        biddingType: {
            type: String,
            enum: ["normal_tender", "special_tender", "limited_tender"],
        },

        expenditureType: {
            type: String,
            enum: ["capital", "revenue"],
        },

        rankingOrderForBid: {
            type: String,
            enum: ["low_to_high", "high_to_low"],
        },

        /* -- RAILWAY-ONLY -- */
        zone: {
            type: String,
            enum: [
                "cr", "wr", "wcr", "ncr", "nr", "nwr", "ner", "nfr",
                "er", "ecr", "ecor", "ser", "secr", "sr", "scr",
                "swr", "krcl", "mrk"
            ],
        },
        subDepartment: {
            type: String,
            enum: [
                "engineering",
                "electrical",
                "mechanical",
                "signal_and_telecom",
                "commercial",
                "medical",
                "personnel",
                "operating"
            ],
        },
        circle: {
            type: String,
            enum: ["circle", "zone", "division"],
        },
        division: {
            type: String,
        },

        /* -- PSU-ONLY -- */
        psuName: {
            type: String,
            enum: ["ntpc", "ongc", "iocl", "gail", "bhel", "sail", "nhpc"],
        },

        /* ---------------------------------------------------------- */
        /* 5. FINANCIAL DETAILS                                      */
        /* ---------------------------------------------------------- */
        financials: {
            pgAmount: { type: Number, default: 0 },
            actualPgAmount: { type: Number, default: 0 },

            tenderAmount: { type: Number, default: 0 },

            biddingPosition: {
                type: String,
                enum: ["below", "above", "at_par"]
            },
            biddingPercentage: { type: Number, default: 0 },

            // auto-calculated in pre-save hook from tenderAmount + biddingPosition + biddingPercentage
            actualBiddingAmount: { type: Number, default: 0 },

            pgMaturityDate: Date,
            pgMaturityInterest: { type: Number, default: 0 },
            rateOfInterest: { type: Number, default: 0 },
            durationInDays: { type: Number, default: 0 },

            depositAccountNo: String,
            depositStartDate: Date,

            penalty: { type: Number, default: 0 },
            penaltyTicketNo: String,

            recoveryAtContractEnd: {
                billAmount: { type: Number, default: 0 },
                recoveryAmount: { type: Number, default: 0 },
                recoveryDesc: String,
                billNumber: String
            }
        },

        /* ---------------------------------------------------------- */
        /* 6. PROJECT MANAGEMENT                                     */
        /* ---------------------------------------------------------- */
        currentAuthority: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        nextAuthority: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        status: {
            type: String,
            enum: [
                "in_progress",
                "draft",
                "completed",
                "not_allotted",
                "L2",
                "L3",
                "pending"
            ],
            default: "draft"
        },

        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        },
        estimatedCompletionDate: {
            type: Date
        },

        approvals: [approvalSchema],

        /* ---------------------------------------------------------- */
        /* AUDIT                                                     */
        /* ---------------------------------------------------------- */
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

/* ------------------------------------------------------------------ */
/*  PRE-SAVE: auto-calculate actualBiddingAmount                      */
/*  below  -> tenderAmount - (tenderAmount * pct / 100)                */
/*  above  -> tenderAmount + (tenderAmount * pct / 100)                */
/*  at_par -> tenderAmount                                             */
/* ------------------------------------------------------------------ */
projectSchema.pre("save", function (next) {
    const f = this.financials;
    if (f && f.tenderAmount != null && f.biddingPosition) {
        const pct = f.biddingPercentage || 0;
        const base = f.tenderAmount;

        if (f.biddingPosition === "below") {
            f.actualBiddingAmount = base - (base * pct) / 100;
        } else if (f.biddingPosition === "above") {
            f.actualBiddingAmount = base + (base * pct) / 100;
        } else if (f.biddingPosition === "at_par") {
            f.actualBiddingAmount = base;
        }
    }
    next();
});

module.exports = mongoose.model("Project", projectSchema);