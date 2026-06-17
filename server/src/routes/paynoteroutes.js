const express  = require("express");
const router = express.Router();
const PayNote = require("../models/paynoteModel");
const Bill = require("../models/billmodel");
const User = require("../models/usermodel");
const verifyToken = require("../middleware/verifyToken");

router.post("/create-paynote",verifyToken,  async (req, res) => {
    try {
        const { payNoteNo, department, bankName, bankAccountNo, ifscCode, invoiceNo, invoiceDate, purpose, totalSanctionAmount, modeOfPayment, pdfUrl, user, bill } = req.body;

        // Validate required fields
        if (!payNoteNo || !department || !user) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        // Check user exists
        const existingUser = await User.findById(user);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // If bill provided, check exists
        if (bill) {
            const existingBill = await Bill.findById(bill);
            if (!existingBill) {
                return res.status(404).json({ message: "Bill not found" });
            }
        }

        const newPayNote = new PayNote({
            payNoteNo,
            department,
            bankName,
            bankAccountNo,
            ifscCode,
            invoiceNo,
            invoiceDate,
            purpose,
            totalSanctionAmount,
            modeOfPayment,
            pdfUrl,
            user,
            bill
        });

        const savedPayNote = await newPayNote.save();

        res.status(201).json({ message: "PayNote created successfully", payNote: savedPayNote });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.put("/update-status/:id",verifyToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["Draft", "Pending", "Approved", "Rejected", "Paid"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        const paynote = await PayNote.findByIdAndUpdate(id, { status }, { new: true });
        if (!paynote) {
            return res.status(404).json({ message: "PayNote not found" });
        }
        res.json({ message: "Status updated successfully", paynote });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get("/by-bill/:billId", verifyToken,async (req, res) => {
    const { billId } = req.params;
    try {
        const paynotes = await PayNote.find({ bill: billId }).populate('user').populate('bill');
        res.json({ paynotes });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get("/by-user/:userId",verifyToken, async (req, res) => {
    const { userId } = req.params;
    try {
        const paynotes = await PayNote.find({ user: userId }).populate('user').populate('bill');
        res.json({ paynotes });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
