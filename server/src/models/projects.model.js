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
            enum: ["ADMIN", "CEO", "CTO", "CFO", "COO", "DIRECTOR", "OTHER"],
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
/*  SUB-SCHEMA: Cost estimation line item                             */
/*  Lives inside financials.bidding — a free-form list of estimated   */
/*  costs (name + amount).                                            */
/* ------------------------------------------------------------------ */
const costEstimationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        amount: { type: Number, required: true }
    },
    { _id: true }
);

/* ------------------------------------------------------------------ */
/*  SUB-SCHEMA: Security deposit recovery entry                       */
/*  Lives inside financials.security_deposit.cust — one recovery      */
/*  line per bill.                                                    */
/* ------------------------------------------------------------------ */
const securityDepositCustSchema = new mongoose.Schema(
    {
        billNo: { type: String, required: true },
        recoveryPercent: { type: Number, required: true },
        amount: { type: Number, required: true }
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
        /* NEW: which entity this project is being executed under.   */
        /* ---------------------------------------------------------- */
        projectUnder: {
            type: String,
            enum: ["company", "firm"]
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
        /* NEW: headquarter location — same shape as location above.  */
        /* ---------------------------------------------------------- */
        headquarterLocation: {
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

        /* ---------------------------------------------------------- */
        /* NEW: 11 fields requested for the Advance Details section.  */
        /* Grouped together right here so they're easy to find/edit.  */
        /* jointVentureMembers is an array — one or more members can  */
        /* be added from the form.                                    */
        /* ---------------------------------------------------------- */
        clientName: { type: String },
        tenderNo: { type: String, trim: true },
        loaNo: { type: String, trim: true },
        agreementNo: { type: String, trim: true },
        loaDate: { type: Date },
        tenderTotalAmount: { type: Number, default: 0 },
        loaAmount: { type: Number, default: 0 },
        contractorName: { type: String },
        contractorCode: { type: String, trim: true },
        tca: { type: String, trim: true },
        taa: { type: String, trim: true },
        jointVentureMembers: [{ type: String, trim: true }],

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

            /* ---------------------------------------------------- */
            /* NEW: financials.penalty — 4 fields requested,        */
            /* grouped together in their own nested object          */
            /* (existing flat penalty / penaltyTicketNo above are   */
            /* untouched).                                          */
            /* ---------------------------------------------------- */
            penaltyDetails: {
                amount: { type: Number, default: 0 },
                ticketNo: String,
                ticketDate: Date,
                delayDays: { type: Number, default: 0 }
            },

            /* ---------------------------------------------------- */
            /* NEW: financials.security_deposit — 3 fields          */
            /* requested; cust is an array of per-bill recoveries.  */
            /* ---------------------------------------------------- */
            security_deposit: {
                amount: { type: Number, default: 0 },
                percentage: { type: Number, default: 0 },
                cust: [securityDepositCustSchema]
            },

            /* ---------------------------------------------------- */
            /* NEW: financials.pg — all 9 fields requested, grouped */
            /* together in their own nested object (existing flat  */
            /* pgAmount / actualPgAmount / pgMaturityDate /         */
            /* pgMaturityInterest / depositAccountNo above are      */
            /* untouched).                                          */
            /* ---------------------------------------------------- */
            pg: {
                amountRailway: { type: Number, default: 0 },
                amountSubmitted: { type: Number, default: 0 },
                createDate: Date,
                maturityDate: Date,
                interest: { type: Number, default: 0 },
                maturityAmount: { type: Number, default: 0 },
                name: String,
                depositAccountNo: String,
                bankBranch: String
            },

            recoveryAtContractEnd: {
                billAmount: { type: Number, default: 0 },
                recoveryAmount: { type: Number, default: 0 },
                recoveryDesc: String,
                billNumber: String
            },

            /* ---------------------------------------------------- */
            /* NEW: financials.bidding — all 6 fields requested,    */
            /* grouped together in their own nested object.         */
            /* ---------------------------------------------------- */
            bidding: {
                emdAmount: { type: Number, default: 0 },
                advertisedValue: { type: Number, default: 0 },
                status: {
                    type: String,
                    enum: ["paid", "unpaid", "exempted"],
                    default: "unpaid"
                },
                biddingPosition: {
                    type: String,
                    enum: ["below", "above", "at_par"]
                },
                biddingPercentage: { type: Number, default: 0 },
                costEstimation: [costEstimationSchema]
            }
        },

        // taksk //-----
        tasks: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task"
        }],

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