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
        ref: "User", // Reference to the User model
        required: true
    },
    amount: {
        type: Number,
        required: true
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
