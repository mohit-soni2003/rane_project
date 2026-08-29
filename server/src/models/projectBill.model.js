const mongoose = require("mongoose");

/* ------------------------------------------------------------------ */
/*  SUB-SCHEMA: Bill line item                                        */
/*  References an Item document (from the Item/materials model) and   */
/*  carries the qty/rate actually billed for it on this Project_bill  */
/*  — kept separate from the Item's own railwayRate/ourRate/marketRate */
/*  since a bill can invoice at a different rate/qty than the item's   */
/*  master record.                                                    */
/* ------------------------------------------------------------------ */
const billItemSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },
        qty: {
            type: Number,
            required: true
        },
        rate: {
            type: Number,
            required: true
        }
    },
    { _id: true }
);

/* ------------------------------------------------------------------ */
/*  SUB-SCHEMA: Recovery entry                                        */
/*  A free-form list of deductions/recoveries applied to the bill      */
/*  (e.g. security deposit recovery, material recovery, penalty       */
/*  recovery), each identified by a type + code with its own amount.  */
/* ------------------------------------------------------------------ */
const recoverySchema = new mongoose.Schema(
    {
        recoveryType: {
            type: String,
            required: true
        },
        code: {
            type: String
        },
        desc: {
            type: String
        },
        recoveryAmt: {
            type: Number,
            required: true
        }
    },
    { _id: true }
);

/* ------------------------------------------------------------------ */
/*  SUB-SCHEMA: Security deposit entry                                */
/*  A list of security-deposit recovery lines applied to this bill,   */
/*  each capturing the recovery percentage, the amount recovered, and */
/*  an optional remark.                                               */
/* ------------------------------------------------------------------ */
const securityDepositSchema = new mongoose.Schema(
    {
        recoveryPercent: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        remark: {
            type: String
        }
    },
    { _id: true }
);

/* ------------------------------------------------------------------ */
/*  MAIN SCHEMA: Project_bill                                          */
/* ------------------------------------------------------------------ */
const projectBillSchema = new mongoose.Schema(
    {
        /* ---------------------------------------------------------- */
        /* PARENT PROJECT                                             */
        /* ---------------------------------------------------------- */
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        /* ---------------------------------------------------------- */
        /* BILL IDENTIFIER                                            */
        /* ---------------------------------------------------------- */
        billNo: {
            type: String,
            required: true,
            trim: true
        },

        /* ---------------------------------------------------------- */
        /* LOA / AGREEMENT REFERENCE                                  */
        /* ---------------------------------------------------------- */
        loaNo: {
            type: String,
            trim: true
        },
        agrNo: {
            type: String,
            trim: true
        },
        loaDate: {
            type: Date
        },

        /* ---------------------------------------------------------- */
        /* AMOUNTS                                                    */
        /* ---------------------------------------------------------- */
        bnsAmt: {
            type: Number,
            default: 0
        },
        adsAmt: {
            type: Number,
            default: 0
        },
        totalAmt: {
            type: Number,
            default: 0
        },
        rebate: {
            type: Number,
            default: 0
        },
        billAmtInclusiveGST: {
            type: Number,
            default: 0
        },
        tax: {
            type: Number,
            default: 0
        },
        grossAmount: {
            type: Number,
            default: 0
        },
        tdsAmt: {
            type: Number,
            default: 0
        },

        /* ---------------------------------------------------------- */
        /* ITEMS — billed items, each pointing back to the Item model */
        /* ---------------------------------------------------------- */
        items: [billItemSchema],

        /* ---------------------------------------------------------- */
        /* RECOVERY — deductions applied to this bill                */
        /* ---------------------------------------------------------- */
        recovery: [recoverySchema],

        /* ---------------------------------------------------------- */
        /* SECURITY DEPOSIT — recovery lines applied to this bill     */
        /* ---------------------------------------------------------- */
        securityDeposit: [securityDepositSchema]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Project_bill", projectBillSchema);