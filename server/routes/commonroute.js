const express = require("express")
const User = require("../models/usermodel")
const Bill = require("../models/billmodel")
const Payment = require("../models/paymentmodel")

const router = express.Router();

router.get("/count-client-bill", async (req, res) => {
    console.log("Count Client / Bill route hittedd")
    try {
        const userCount = await User.countDocuments();
        const billCount = await Bill.countDocuments();
        const sanctionedBillCount = await Bill.countDocuments({ paymentStatus: "Sanctioned" });

        res.json({
            totalUsers: userCount,
            totalBills: billCount,
            sanctionedBills: sanctionedBillCount
        });
    } catch (error) {
        console.error("Error fetching counts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});






// Removed conflicting dashboard route - now handled by clientroutes.js with proper authentication

module.exports = router;



module.exports = router
