const express = require("express")
const User = require("../models/usermodel")
const generateTokenAndSetCookie = require("../utils/generateTokenAndSetCookie")
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } = require("../mailtrap/email")
const verifyToken = require("../middleware/verifyToken")
const crypto = require("crypto")
const { FRONTEND_ORIGIN_URL } = require("../keys")
const { sendWhatsAppMessage } = require("../utils/whatsappMessageSender")


const router = express.Router();

router.post("/signup", async (req, res) => {
	console.log("Signup post request received...");

	const { email, name, password, usertype, clientType, cid, phoneNo, address, firmName, gstno, idproof, idProofType, upi, bankName, ifscCode, accountNo } = req.body;
	if (!email || !name || !password) {
		return res.status(400).json({ error: "Please enter all required fields" });
	}

	try {
		let user = await User.findOne({ email });

		if (user) {
			if (user.isverified) {
				return res.status(400).json({ error: "User already exists with the same email" });
			} else {
				// User exists but is not verified, update token and resend email
				user.VerificationToken = Math.floor(100000 + Math.random() * 900000).toString();
				user.name = name;
				user.password = password;

				user.VerificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hrs
				await user.save();
				await sendVerificationEmail(user.email, user.VerificationToken);
				return res.status(200).json({ success: true, message: "Verification email resent." });
			}
		}

		// Create a new user
		const VerificationToken = Math.floor(100000 + Math.random() * 900000).toString();
		user = new User({
			email,
			password,
			name,
			usertype,
			clientType,
			cid: cid || "N/A",
			phoneNo,
			address,
			firmName,
			gstno,
			idproof,
			idProofType,
			upi,
			bankName,
			ifscCode,
			accountNo,
			isverified: false,
			VerificationToken,
			VerificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hrs
		});

		await user.save();
		await sendVerificationEmail(user.email, VerificationToken);

		// Generate JWT token
		generateTokenAndSetCookie(res, user._id);

		res.status(201).json({
			success: true,
			message: "User created successfully. Please verify your email.",
			user: {
				...user._doc,
				password: undefined, // Do not send the password back
			},
		});
	} catch (error) {
		console.error("Signup Error:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});


router.post("/verify-email", async (req, res) => {
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
			return res.json({ success: false, error: "Invalid or expired verification code" });
		}

		user.isverified = true;
		user.VerificationToken = undefined;
		user.VerificationTokenExpiresAt = undefined;
		await user.save();

		await sendWelcomeEmail(user.name, user.email, user.password,);

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
		res.status(500).json({ success: false, error: "Server error" });
	}
})
router.post("/signin", async (req, res) => {
	console.log("Signin Route Hitted/.");
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.json({ success: false, error: "Invalid credentials" });
		}

		const isPasswordValid = password == user.password;
		if (!isPasswordValid) {
			return res.json({ success: false, error: "Invalid credentials" });
		}

		// Generate token and set cookie
		generateTokenAndSetCookie(res, user._id);

		// Update last login 
		user.lastlogin = new Date();
		await user.save();

		// Send WhatsApp message but ignore errors
		
			const dateTime = new Date().toLocaleString();
			const message = `Hello ${user.name}, you just logged in to RSWMS work management system successfully on ${dateTime}.`;
			// await sendWhatsAppMessage("919589571577", message);

		
		// Respond to client
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

router.post("/forgot-password", async (req, res) => {
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
		await sendPasswordResetEmail(user.email, `${FRONTEND_ORIGIN_URL}/reset-password-page/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
})
router.post("/reset-password/:token", async (req, res) => {
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

router.get("/check-auth", verifyToken, async (req, res) => {
	console.log("check auth routed hitted...")

	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, error: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
})


router.post("/logout", async (req, res) => {
	res.clearCookie("testToken", {
		httpOnly: true,
		secure: true,
		sameSite: "None",
		path: "/",
	});


	res.clearCookie("token", {
		httpOnly: true,
		secure: true,
		sameSite: "None",
		path: "/",  // Important for clearing
	});

	res.status(200).json({ success: true, message: "Logged out successfully" });
});



router.post("/change-password", verifyToken, async (req, res) => {
	console.log("Change password route hit...");

	try {
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({ success: false, message: "Please provide both current and new password" });
		}

		const user = await User.findById(req.userId);
		console.log("chagePassord : " + req.userId + " This is req.userId")

		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		// Validate current password
		if (user.password !== currentPassword) {
			return res.status(400).json({ success: false, message: "Current password is incorrect" });
		}

		// Update the password
		user.password = newPassword;
		await user.save();

		res.status(200).json({ success: true, message: "Password changed successfully" });

	} catch (error) {
		console.log("Error in change-password", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
});


module.exports = router
