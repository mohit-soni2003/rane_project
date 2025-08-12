const express = require('express');
const Document = require('../models/documentmodel');
const User = require("../models/usermodel")
const verifyToken = require("../middleware/verifyToken")
const router = express.Router();

// This route is used by Admin to push the document
router.post('/admin/document/push', verifyToken, async (req, res) => {
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

//This route is used by the user and admin to get the all document of particular user with its ID
router.get('/admin/document/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { docType } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required in params." });
    }

    const query = { userId };

    // only filter by docType if it's a valid enum
    const validTypes = [
      'LOA',
      'SalesOrder',
      'PurchaseOrder',
      'PayIn',
      'PayOut',
      'Estimate',
      'DeliveryChallan',
      'Expense',
      'BankReference',
      'Other'
    ];

    if (docType && validTypes.includes(docType)) {
      query.docType = docType;
    }

    const documents = await Document.find(query)
    .populate("uploadedBy").sort({ createdAt: -1 });

    res.status(200).json({ documents });

  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Server error while fetching documents." });
  }
});

//this route is to update the document status . This is used by client
router.put('/client/document/update-status/:documentId', verifyToken, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { status } = req.body;
    const userId = req.userId; // ✅ Retrieved from verifyToken

    const allowedStatuses = ['accepted', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Only 'accepted' or 'rejected' are allowed." });
    }

    // Ensure the document belongs to the logged-in user
    const document = await Document.findOne({ _id: documentId, userId });

    if (!document) {
      return res.status(404).json({ error: "Document not found or not authorized to update." });
    }

    // Update status and timestamp
    document.status = status;
    document.statusUpdatedAt = new Date();
    await document.save();

    res.status(200).json({ message: "Document status updated successfully.", document });

  } catch (error) {
    console.error("Error updating document status:", error);
    res.status(500).json({ error: "Server error while updating document status." });
  }
});

module.exports = router;
