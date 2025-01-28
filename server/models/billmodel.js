const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
    firmName: {
        type: String,
        required: true,
    },
    workArea: {
        type: String,
        required: true,
    },
    loaNo: {
        type: String,
        required: true,
    },
    pdfurl: {
        type: String,
    },
    paymentStatus: {
        type: String,
        default:"Unpaid"
    },
    invoiceNo:{
        type:String,
    },
    workDescription:{
        type  : String,
    },
    paymentDate: {
        type: Date,
    },
    submittedAt: {
        type: Date,
        default: Date.now(),
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, // Reference to ObjectId
        ref: "User", // Name of the user model
        required: true, // Ensure user is always provided
    },
});

module.exports = mongoose.model("Bill", billSchema);
