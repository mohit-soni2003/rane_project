const express = require('express');
const router = express.Router();
const FileForward = require("../models/fileForwardingModel")
const verifyToken = require("../middleware/verifyToken")
const User = require("../models/usermodel")
const RecentActivity = require("../models/RecentActivityModel")
const Notification = require("../models/notificationModel")


// ─── Helper: extract sub-fields from req.body based on docType ───────────────
const extractSubFields = (docType, body) => {
  switch (docType) {
    case "Invoices":
      return {
        invoiceSubFields: {
          invoiceType: body.invoiceType || undefined,
        },
      };

    case "Contract":
      return {
        contractSubFields: {
          eAgreement: body.eAgreement || undefined,
          generalContractAndLabour: body.generalContractAndLabour || undefined,
        },
      };

    case "Proposal":
      return {
        proposalSubFields: {
          proposalType: body.proposalType || undefined,
        },
      };

    case "Report":
      return {
        reportSubFields: {
          employeeMeasurementBook: body.employeeMeasurementBook || undefined,
          employeeReport: body.employeeReport || undefined,
        },
      };

    // Quotation/Estimate and Others have no sub-fields
    default:
      return {};
  }
};


// ─── POST /upload-document ────────────────────────────────────────────────────
router.post('/upload-document', verifyToken, async (req, res) => {
  console.log("DOCUMENT UPLOAD ROUTE HIT...");

  try {
    const {
      fileTitle,
      fileUrl,
      docType,
      Department,
      description,
    } = req.body;

    /* ── BASIC VALIDATION ── */
    if (!fileTitle || !fileUrl || !docType || !description) {
      return res.status(400).json({
        error: "fileTitle, fileUrl, docType, and description are required."
      });
    }

    /* ── FIND ADMIN (INITIAL OWNER) ── */
    const currentOwner = await User.findOne({ cid: "ADMIN" });
    if (!currentOwner) {
      return res.status(404).json({ error: "Admin not found" });
    }

    /* ── EXTRACT SUB-FIELDS BASED ON DOCTYPE ── */
    const subFields = extractSubFields(docType, req.body);

    /* ── CREATE DOCUMENT ── */
    const newFile = new FileForward({
      fileTitle,
      fileUrl,
      docType,
      Department,
      description,
      ...subFields,                   // ✅ spreads only the relevant sub-field object
      uploadedBy: req.userId,
      currentOwner: currentOwner._id,
      status: "pending",
      forwardingTrail: [
        {
          forwardedBy: req.userId,
          forwardedTo: currentOwner._id,
          note: "Initial submission by client",
          action: "forwarded",
        }
      ]
    });

    await newFile.save();

    /* ── POPULATE FOR RESPONSE ── */
    const populatedFile = await FileForward.findById(newFile._id)
      .populate('uploadedBy', 'name email')
      .populate('currentOwner', 'name email')
      .populate('forwardingTrail.forwardedBy', 'name email')
      .populate('forwardingTrail.forwardedTo', 'name email');

    const uploadedByUser = await User.findById(req.userId);

    /* ── RECENT ACTIVITY (CLIENT) ── */
    try {
      await RecentActivity.create({
        user: uploadedByUser._id,
        actionType: "document_uploaded",
        description: `Uploaded DFS document: ${fileTitle}`,
        relatedModel: "FileForward",
        relatedId: newFile._id,
        actionUrl: `/client/track-dfs/all`,
        metadata: {
          fileTitle,
          docType,
          Department,
        }
      });
    } catch (activityErr) {
      console.error("RecentActivity error:", activityErr);
    }

    /* ── NOTIFICATIONS (ADMINS) ── */
    try {
      const admins = await User.find({ role: 'admin' });

      for (const admin of admins) {
        await Notification.create({
          title: "New DFS Document Submitted",
          message: `${uploadedByUser.name} submitted a document: ${fileTitle}`,
          type: "dfs",
          priority: "medium",
          recipient: admin._id,
          sender: uploadedByUser._id,
          relatedId: newFile._id,
          relatedModel: "FileForward",
          actionUrl: `/admin/dfsrequest/${newFile._id}`,
          metadata: {
            fileTitle,
            docType,
            Department,
            uploadedBy: uploadedByUser.name,
          }
        });
      }
    } catch (notificationError) {
      console.error("DFS notification error:", notificationError);
    }

    /* ── RESPONSE ── */
    return res.status(201).json({
      message: "Document uploaded successfully.",
      file: populatedFile
    });

  } catch (error) {
    console.error("File upload error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});


// ─── GET /my-files ────────────────────────────────────────────────────────────
// Get all files uploaded by the current user
router.get('/my-files', verifyToken, async (req, res) => {
  try {
    const myFiles = await FileForward.find({ uploadedBy: req.userId })
      .populate('currentOwner', 'name')
      .populate('uploadedBy', 'name')
      .populate('forwardingTrail.forwardedBy', 'name')
      .populate('forwardingTrail.forwardedTo', 'name')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ files: myFiles });
  } catch (error) {
    console.error("Error fetching user files:", error);
    res.status(500).json({ error: "Server error while fetching your files." });
  }
});


// ─── PUT /forward/:fileId ─────────────────────────────────────────────────────
router.put("/forward/:fileId", verifyToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.userId;

    const { note, action, forwardedTo, status, attachment } = req.body;

    if (!note || !action || !forwardedTo || !status) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const file = await FileForward.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (file.currentOwner.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to forward this file." });
    }

    file.status = status;
    file.currentOwner = forwardedTo;

    file.forwardingTrail.push({
      forwardedBy: userId,
      forwardedTo,
      note,
      action,
      attachment: attachment || null,
      timestamp: new Date(),
    });

    await file.save();

    res.status(200).json({ message: "✅ File forwarded successfully", file });
  } catch (error) {
    console.error("❌ Error forwarding file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ─── GET /my-requests ─────────────────────────────────────────────────────────
// Documents currently assigned to the logged-in user
router.get("/my-requests", verifyToken, async (req, res) => {
  try {
    const myUserId = req.userId;

    console.log("🔐 Authenticated userId:", myUserId);

    const files = await FileForward.find({ currentOwner: myUserId })
      .populate("uploadedBy", "name email cid profile")
      .populate("currentOwner", "name email cid profile")
      .populate("forwardingTrail.forwardedBy", "name profile")
      .populate("forwardingTrail.forwardedTo", "name profile")
      .sort({ createdAt: -1 });

    res.status(200).json({ files });
  } catch (error) {
    console.error("❌ Error fetching assigned files:", error);
    res.status(500).json({ error: "Failed to fetch assigned files" });
  }
});


// ─── GET /all-users ───────────────────────────────────────────────────────────
// All users available for forwarding selection
router.get('/all-users', verifyToken, async (req, res) => {
  try {
    const users = await User.find(
      { role: { $in: ['admin', 'staff', 'client'] } },
      '_id name cid role'
    );

    const roleOrder = { admin: 1, staff: 2, client: 3 };
    users.sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);

    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});


// ─── GET /files ───────────────────────────────────────────────────────────────
// All files — for Super Admin view
router.get('/files', verifyToken, async (req, res) => {
  try {
    const files = await FileForward.find()
      .populate('uploadedBy', 'name email cid')
      .populate('currentOwner', 'name email cid')
      .populate('forwardingTrail.forwardedBy', 'name email cid')
      .populate('forwardingTrail.forwardedTo', 'name email cid')
      .populate('comments.user', 'name email cid')
      .sort({ createdAt: -1 });

    res.status(200).json(files);
  } catch (error) {
    console.error("Error fetching all files:", error);
    res.status(500).json({ error: "Server error while fetching all file records." });
  }
});


// ─── GET /file/:id ────────────────────────────────────────────────────────────
// Full details of a single file
router.get('/file/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const file = await FileForward.findById(id)
      .populate('uploadedBy')
      .populate('currentOwner')
      .populate('forwardingTrail.forwardedBy')
      .populate('forwardingTrail.forwardedTo')
      .populate('comments.user');

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.status(200).json({ file });
  } catch (error) {
    console.error('Error fetching file by ID:', error);
    res.status(500).json({ error: 'Server error while fetching file details' });
  }
});


// ─── DELETE /file/:id ─────────────────────────────────────────────────────────
router.delete('/file/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const file = await FileForward.findById(id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const user = await User.findById(userId);
    if (file.currentOwner.toString() !== userId && user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this file' });
    }

    await FileForward.findByIdAndDelete(id);

    res.status(200).json({
      message: 'File deleted successfully',
      deletedFileId: id
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Server error while deleting file' });
  }
});


module.exports = router;