const mongoose = require("mongoose");

/* ------------------------------------------------------------------ */
/*  MODEL: Item (materials associated with a project)                 */
/* ------------------------------------------------------------------ */
const itemSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        itemNo: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        description: {
            type: String
        },

        unit: {
            type: String,
                  // "Each", "Meter", "Set", "Rmt" "kg"

        },

        railwayRate: {
            type: Number,
            default: 0
        },

        ourRate: {
            type: Number,
            default: 0
        },

        marketRate: {
            type: Number,
            default: 0
        },

        quantity: {
            type: Number,
            default: 0
        },

        installation: {
            type: Number,
            default: 0
        },

        // auto-calculated in pre-save hook: (ourRate * quantity) + installation
        total: {
            type: Number,
            default: 0
        },

        // calculation to be added later
        profitLossPercent: {
            type: Number,
            default: 0
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

/* ------------------------------------------------------------------ */
/*  PRE-SAVE: auto-calculate total and profitLossPercent              */
/* ------------------------------------------------------------------ */
itemSchema.pre("save", function (next) {
    this.total = (this.ourRate * this.quantity) + this.installation;
    next();
});

module.exports = mongoose.model("Item", itemSchema);