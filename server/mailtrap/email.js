const { mailTrapClient, sender } = require("./mailtrapConfig");
const { VERIFICATION_EMAIL_TEMPLATE , PASSWORD_RESET_REQUEST_TEMPLATE,PASSWORD_RESET_SUCCESS_TEMPLATE} = require("./emailTemplates");

const sendVerificationEmail = async(email,verificationToken)=>{
    console.log(email)
    const recipient = [{email}]
    try {
		const response = await mailTrapClient.sendMail({
            from: `"${sender.name}" <${sender.email}>`, // Correct 'from' format
			to: email,
			subject: "Verify your email",
			html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
			category: "Email Verification",
		});

		console.log("Email sent successfully", response);
	} catch (error) {
		console.error(`Error sending verification`, error);

		throw new Error(`Error sending verification email: ${error}`);
	}
}
const sendWelcomeEmail = async(email,name)=>{
    console.log(email)
    const recipient = [{email}]
    try {
		const response = await mailTrapClient.sendMail({
            from: `"${sender.name}" <${sender.email}>`, // Correct 'from' format
			to: email,
			subject: "Verify your email",
            text: "Your Account created successful",
			category: "Welcome email",
		});

		console.log("Email sent successfully", response);
	} catch (error) {
		console.error(`Error sending verification`, error);

		throw new Error(`Error sending verification email: ${error}`);
	}
}


const sendPasswordResetEmail = async (email, resetURL) => {
	const recipient = [{ email }];

	try {
		const response = await mailTrapClient.sendMail({
			from: `"${sender.name}" <${sender.email}>`, // Correct 'from' format
			to: email,
			subject: "Reset your password",
			html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
			category: "Password Reset",
		});
	} catch (error) {
		console.error(`Error sending password reset email`, error);

		throw new Error(`Error sending password reset email: ${error}`);
	}
};

const sendResetSuccessEmail = async (email) => {
	const recipient = [{ email }];

	try {
		const response = await mailTrapClient.sendMail({
			from: `"${sender.name}" <${sender.email}>`,
			to: email,
			subject: "Password Reset Successful",
			html: PASSWORD_RESET_SUCCESS_TEMPLATE,
			category: "Password Reset",
		});

		console.log("Password reset email sent successfully", response);
	} catch (error) {
		console.error(`Error sending password reset success email`, error);

		throw new Error(`Error sending password reset success email: ${error}`);
	}
}
module.exports = {sendVerificationEmail , sendWelcomeEmail , sendPasswordResetEmail , sendResetSuccessEmail}