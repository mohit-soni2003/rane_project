const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");

const TOKEN = "31e1e08bb14a9ce95e2e5d82f61d7616";

const mailTrapClient = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
  })
);

const sender = {
  email: "mailtrap@demomailtrap.com",
  name: "Mohit Soni",
};

module.exports = { mailTrapClient, sender }