const Nodemailer = require("nodemailer");
const {MAIL_PASS , SENDER_MAIL} = require("../keys")

// Create a Nodemailer transporter using Gmail's SMTP
const mailTrapClient = Nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_MAIL, // Replace with your Gmail address
    pass: MAIL_PASS // Replace with your Gmail App Password
  },
  tls: {
    rejectUnauthorized: false, // Bypass self-signed certificate error
  },
});

// Define the sender details
const sender = {
  email: "your-email@gmail.com", // Replace with your Gmail address
  name: "Mohit Soni",
};

module.exports = { mailTrapClient, sender };
