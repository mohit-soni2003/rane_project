const express = require("express")
const User= require("../models/usermodel")
const generateTokenAndSetCookie =require("../utils/generateTokenAndSetCookie")
const {sendVerificationEmail , sendWelcomeEmail} = require("../mailtrap/email")

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

router.post("/verify-email",async(req,res)=>{
    const { code } = req.body;
	try {
        console.log(code)
		const user = await User.findOne({
            VerificationToken: code,
			// verificationTokenExpiresAt: { $gt: Date.now() },
		});
//         const allUsers = await User.find({});
// console.log(allUsers);
        console.log(user)
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		user.isverified= true;
		user.VerificationToken = undefined;
		user.VerificationTokenExpiresAt = undefined;
		await user.save();

		await sendWelcomeEmail(user.email, user.name);

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
})
router.post("/signin",async (req, res) => {
    const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}
		const isPasswordValid = password==user.password;
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		generateTokenAndSetCookie(res, user._id);

		user.lastlogin = new Date();
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("Error in login ", error);
		res.status(400).json({ success: false, message: error.message });
	}
});

router.get("/logout", (req, res) => {
    res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports=router
