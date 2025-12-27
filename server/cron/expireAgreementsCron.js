// cron/expireAgreements.cron.js
const cron = require("node-cron");
const Agreement = require("../models/agreementModel");

const expireAgreements = async (source = "MANUAL") => {
  try {
    const now = new Date();

    const result = await Agreement.updateMany(
      {
        expiryDate: { $lt: now },
        status: { $ne: "expired" },
      },
      {
        $set: {
          status: "expired",
          expiredAt: now, // optional but recommended
        },
      }
    );

    console.log(
      `[${source}] Agreements expired: ${result.modifiedCount} at ${now.toISOString()}`
    );
  } catch (error) {
    console.error(`[${source}] Expiry job failed:`, error);
  }
};

const startExpiryJob = () => {
  // 🔥 RUN ONCE WHEN SERVER STARTS
  expireAgreements("SERVER_START");

  // ⏰ RUN EVERY DAY AT 12:00 AM IST
  cron.schedule(
    "0 0 * * *",
    () => expireAgreements("CRON"),
    {
      timezone: "Asia/Kolkata",
    }
  );
};

module.exports = startExpiryJob;
