const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true 
    },
    password:{
        type:String,
        required:true,
    },
    lastlogin:{
        type:Date,
        default:Date.now()
    },
    isverified:{
        type:Boolean,
        default:false
    },
    resetPasswordToken : String,
    resetPasswordExpiresAt: Date,
    VerificationToken:String,
    VerificationTokenExpiresAt:String,

    
})
module.exports = mongoose.model("User",userSchema);