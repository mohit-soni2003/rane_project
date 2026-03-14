const mongoose = require("mongoose");

const payNoteSchema = new mongoose.Schema({

    payNoteNo: {
        type: String,
        required: true
    },

    department: {
        type: String,
        enum: ["Finance", "Operations", "Executives"],
        required: true
    },

    bankName: {
        type: String
    },

    bankAccountNo: {
        type: String
    },

    ifscCode: {
        type: String
    },

    // Invoice Details
    invoiceNo: {
        type: String
    },

    invoiceDate: {
        type: Date
    },

    purpose: {
        type: String
    },

    totalSanctionAmount: {
        type: Number
    },

    // Payment
    modeOfPayment: {
        type: String,
        enum: ["NEFT", "RTGS", "IMPS", "UPI", "IBFT", "Cheque", "Cash"]
    },

    pdfUrl: {
        type: String
    },

    status: {
        type: String,
        enum: ["Draft", "Pending", "Approved", "Rejected", "Paid"],
        default: "Draft"
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    user: {                       // Reference to the user who created the pay note
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


    bill: {              // Reference to the associated bill
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bill"
    }

});

module.exports = mongoose.model("PayNote", payNoteSchema);