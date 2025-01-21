const express = require("express")
const User= require("../models/usermodel")
const generateTokenAndSetCookie =require("../utils/generateTokenAndSetCookie")
const {sendVerificationEmail , sendWelcomeEmail , sendPasswordResetEmail,sendResetSuccessEmail} = require("../mailtrap/email")
const verifyToken = require("../middleware/verifyToken")
const crypto = require("crypto")


const router = express.Router();

router.post("/signup", async (req, res) => {
	console.log("signup post request hi..")
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
	console.log("Verify email route hitted..")
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
router.post("/forgot-password",async(req,res) =>{
    const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `http://localhost:3000/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
})
router.post("/reset-password/:token",async(req,res)=>{
    try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// update password

		user.password = password;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
})

router.get("/check-auth",verifyToken,async(req,res)=>{
	console.log("check auth routed hitted...")

    try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
})

router.get("/logout", (req, res) => {
    res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports=router
