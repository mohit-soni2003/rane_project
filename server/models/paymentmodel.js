const mongoose = require("mongoose");


const paymentSchema = new mongoose.Schema({
    tender: {
        type: String,
        // required: true,
    },
    amount: {
        type: String,
        required: true,
    },
    refMode: {
        type: String,
    },
    expenseNo: {
        type: String,
        default:"Unpaid"
    },
    description:{
        type:String,
    },
    remark:{
        type  : String,
    },
    status:{
        type: String,
        default:"Pending"
    },
    image:{
        type:String,
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
    paymentDate:{
        type:Date,
    },
    remark:{
        type:String,
    }
});

module.exports = mongoose.model("Payment", paymentSchema);
