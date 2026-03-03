const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    billId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bill", // Reference to the Bill model
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment", // Reference to the Payment model
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the user for whom trasaction is made 
        required: true
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the admin who pay the bill or payment request amount because there are multiple admin on site
        // required: true
    },
     type: {
        type: String,
        enum: ["bill", "payment_request", "salary"],
    },
    amount: {
        type: Number,
        required: true
    },
    payNote: {
        type: String,      //addded in version 4.0 for payment note while sanctioning bill
    },
    bankName: {
        type: String
    },
    accNo: {
        type: String
    },
    ifscCode: {
        type: String
    },
    upiId: {
        type: String
    },
    transactionDate: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("Transaction", transactionSchema);
