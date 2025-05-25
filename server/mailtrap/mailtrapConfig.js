const Nodemailer = require("nodemailer");
const {MAIL_PASS , SENDER_MAIL} = require("../keys")


const mailTrapClient = Nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_MAIL, 
    pass: MAIL_PASS 
  },
  tls: {
    rejectUnauthorized: false, 
  },
});


const sender = {
  email: "your-email@gmail.com", 
  name: "RANE & SONS, WORKS & MANAGEMENT SYSTEM.(RS-WMS)",
};

module.exports = { mailTrapClient, sender };
