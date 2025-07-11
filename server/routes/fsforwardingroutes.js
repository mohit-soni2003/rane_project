const express = require('express');
const router = express.Router();
const FileForward = require("../models/fileForwardingModel")
const verifyToken = require("../middleware/verifyToken")
const User = require("../models/usermodel")


// client will upload document
router.post('/upload-document', verifyToken, async (req, res) => {
    try {
        const { fileTitle, fileUrl } = req.body;

        if (!fileTitle || !fileUrl) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Find current admin user
        const currentOwner = await User.findOne({ cid: "ADMIN" });
        if (!currentOwner) {
            return res.status(404).json({ error: "Admin not found" });
        }

        // Create new file entry
        const newFile = new FileForward({
            fileTitle,
            fileUrl,
            uploadedBy: req.userId,
            currentOwner: currentOwner._id,
            forwardingTrail: [
                {
                    forwardedBy: req.userId,
                    forwardedTo: currentOwner._id,
                    note: "Initial submission by client",
                    action: "forwarded",
                }
            ]
        });

        // Save and populate fields
        await newFile.save();

        const populatedFile = await FileForward.findById(newFile._id)
            .populate('uploadedBy', 'name') // only populate name
            .populate('currentOwner', 'name')
            .populate('forwardingTrail.forwardedBy', 'name')
            .populate('forwardingTrail.forwardedTo', 'name');

        return res.status(201).json({ message: "File uploaded successfully", file: populatedFile });

    } catch (error) {
        console.error("File upload error:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

// Get all files uploaded by the current user
router.get('/my-files', verifyToken, async (req, res) => {
    try {
        const myFiles = await FileForward.find({ uploadedBy: req.userId })
            .populate('currentOwner', 'name')
            .populate('uploadedBy', 'name')
            .populate('forwardingTrail.forwardedBy', 'name')
            .populate('forwardingTrail.forwardedTo', 'name')
            .populate('comments.user', 'name')
            .sort({ createdAt: -1 }); // optional: latest first

        res.status(200).json({ files: myFiles });
    } catch (error) {
        console.error("Error fetching user files:", error);
        res.status(500).json({ error: "Server error while fetching your files." });
    }
});

router.put("/forward/:fileId", verifyToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.userId; // current logged-in user

    const { note, action, forwardedTo, status } = req.body;

    if (!note || !action || !forwardedTo || !status) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Fetch the file
    const file = await FileForward.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Ensure only current owner can forward
    if (file.currentOwner.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to forward this file." });
    }

    // Update status and current owner
    file.status = status;
    file.currentOwner = forwardedTo;

    // Add communication trail
    file.forwardingTrail.push({
      forwardedBy: userId,
      forwardedTo,
      note,
      action,
      timestamp: new Date(),
    });

    await file.save();

    res.status(200).json({ message: "File forwarded successfully", file });
  } catch (error) {
    console.error("Error forwarding file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// @route   GET /my-requests
// @desc    Get documents assigned to the current logged-in user
// @access  Protected
// GET /my-requests - documents assigned to the logged-in user
router.get("/my-requests", verifyToken, async (req, res) => {
  try {
    const myUserId = req.userId; // ✅ corrected from req.user_Id

    console.log("🔐 Authenticated userId:", myUserId);

    const files = await FileForward.find({ currentOwner: myUserId })
      .populate("uploadedBy", "name email cid")
      .populate("currentOwner", "name email cid")
      .populate("forwardingTrail.forwardedBy", "name")
      .populate("forwardingTrail.forwardedTo", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ files });
  } catch (error) {
    console.error("❌ Error fetching assigned files:", error);
    res.status(500).json({ error: "Failed to fetch assigned files" });
  }
});

// @route    GET /api/all-users
// @desc     Get all users with role 'admin' or 'staff'
// @access   Protected
router.get('/all-users',verifyToken, async (req, res) => {
  try {
    const users = await User.find(
      { role: { $in: ['admin', 'staff'] } },
      '_id name cid role'
    );
    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});
// @route    GET /api/files
// @desc     Get all files with complete details for Super Admin
// @access   Protected (superadmin only, optional)
router.get('/files',verifyToken, async (req, res) => {
  try {
    const files = await FileForward.find()
      .populate('uploadedBy', 'name email cid')
      .populate('currentOwner', 'name email cid')
      .populate('forwardingTrail.forwardedBy', 'name email cid')
      .populate('forwardingTrail.forwardedTo', 'name email cid')
      .populate('comments.user', 'name email cid')
      .sort({ createdAt: -1 }); // optional: latest first

    res.status(200).json(files);
  } catch (error) {
    console.error("Error fetching all files:", error);
    res.status(500).json({ error: "Server error while fetching all file records." });
  }
});

module.exports = router;
