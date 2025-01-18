const Nodemailer = require("nodemailer");

// Create a Nodemailer transporter using Gmail's SMTP
const mailTrapClient = Nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mohitsonip1847@gmail.com", // Replace with your Gmail address
    pass: "hlyq uoeg rcyr sxtd" // Replace with your Gmail App Password
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
