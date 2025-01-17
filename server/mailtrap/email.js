const { mailTrapClient, sender } = require("./mailtrapConfig");
const { VERIFICATION_EMAIL_TEMPLATE } = require("./emailTemplates");

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
module.exports = sendVerificationEmail