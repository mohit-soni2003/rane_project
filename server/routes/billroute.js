const express = require("express")
const User= require("../models/usermodel")
const Bill= require("../models/billmodel")


const router = express.Router();

router.post("/post-bill", async (req, res) => {
    console.log("Post bill route hitted....")
    try {
        const { firmName, workArea, loaNo, pdfurl, user,invoiceNo  , workDescription } = req.body;
         // Log the fields
  console.log("Received Data:");
  console.log("Firm Name:", firmName);
  console.log("Work Area:", workArea);
  console.log("LOA No:", loaNo);
  console.log("PDF URL:", pdfurl);
  console.log("User ID:", user);
  console.log("Invoice No:", invoiceNo);
  console.log("Work Description:", workDescription);

        // Validate required fields
        if (!firmName || !workArea || !loaNo || !pdfurl || !user) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        // Check if the referenced user exists
        const existingUser = await User.findById(user);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create a new bill
        const newBill = new Bill({
            firmName,
            workArea,
            loaNo,
            pdfurl,
            invoiceNo,
            workDescription,
            user,
        });
        // Save the bill to the database
        const savedBill = await newBill.save();
        res.status(201).json({ message: "Bill created successfully", bill: savedBill });
    } catch (error) {
        // Handle duplicate LOA number
        if (error.code === 11000) {
            return res.status(409).json({ message: "Duplicate loaNo detected" });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports=router
