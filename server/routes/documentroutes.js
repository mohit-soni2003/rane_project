const express = require('express');
const Document = require('../models/documentmodel');
const User = require("../models/usermodel")
const verifyToken = require("../middleware/verifyToken")
const router = express.Router();

router.post('/admin/document/push',  verifyToken , async  (req, res) => {
    console.log("UPLOAD doc route hitted..........")
  try {
    const { cid, docType, documentCode, dateOfIssue, remark, documentLink } = req.body;

    // Validate required fields
    if (!cid || !docType || !documentCode || !dateOfIssue || !documentLink) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    // Find user by CID
    const user = await User.findOne({ cid });
    if (!user) {
      return res.status(404).json({ error: "User not found with provided CID." });
    }

    // Create the document
    const newDocument = new Document({
      docType,
      documentCode,
      dateOfIssue: new Date(dateOfIssue),
      documentLink,
      remark: remark || '',
      userId: user._id,
      uploadedBy: req.userId,
    });

    await newDocument.save();

    res.status(201).json({ message: "Document pushed successfully.", document: newDocument });

  } catch (error) {
    console.error("Error pushing document:", error);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
