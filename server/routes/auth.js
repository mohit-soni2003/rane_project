const express = require("express")
const User= require("../models/usermodel")
const generateTokenAndSetCookie =require("../utils/generateTokenAndSetCookie")
const sendVerificationEmail = require("../mailtrap/email")

const router = express.Router();

router.post("/signup", async (req, res) => {
    const {email,name,password} = req.body
    if(!email||!name||!password){
       return res.json({msg:"please Enter all Fields"})
    }
    const userAlreadyExists = await User.findOne({email}); 
    
    if(userAlreadyExists){
        return res.json({error:"User Already Exists with same email"})
    }
    const VerificationToken = Math.floor(100000+Math.random()*900000).toString();
    const user = new User ({
        email,
        password,
        name,
        VerificationToken,
        VerificationTokenExpiresAt:Date.now()+24*60*60*1000,//24 hrs
    })
    //jwt
    generateTokenAndSetCookie(res,user._id);

    await user.save()

   await sendVerificationEmail(user.email,VerificationToken)
    res.status(201).json({
        success:true,
        msg:"user created successfully",
        user:{
            ...user._doc,
            password:undefined
        }
    })
    // res.send("Signup route");
});

router.get("/signin", (req, res) => {
    res.send("Signin route");
});

router.get("/logout", (req, res) => {
    res.send("logout route");
});

module.exports=router
