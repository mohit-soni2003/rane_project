const express = require('express');
const router = express.Router();
const FileForward = require("../models/fileForwardingModel")
const verifyToken = require("../middleware/verifyToken")
const User = require("../models/usermodel")
const { createNotification } = require("./notificationRoutes")
 

// client will upload document
router.post('/upload-document', verifyToken, async (req, res) => {
  console.log("DOCUMENT UPLOAD ROUTE HITTED...")
  try {
    const {
      fileTitle,
      fileUrl,
      docType,
      Department,
      description
    } = req.body;

    // Basic validation
    if (!fileTitle || !fileUrl || !docType || !description) {
      return res.status(400).json({ error: "fileTitle, fileUrl, docType, and description are required." });
    }

    // Find admin user (who will initially review/own the file)
    const currentOwner = await User.findOne({ cid: "ADMIN" });
    if (!currentOwner) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Create document
    const newFile = new FileForward({
      fileTitle,
      fileUrl,
      docType,
      Department,
      description,
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

    // Populate references for response
    const populatedFile = await FileForward.findById(newFile._id)
      .populate('uploadedBy', 'name email')
      .populate('currentOwner', 'name email')
      .populate('forwardingTrail.forwardedBy', 'name email')
      .populate('forwardingTrail.forwardedTo', 'name email');

    // Get uploader details for notification
    const uploadedByUser = await User.findById(req.userId);

    // Create notification for admins
    try {
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await createNotification({
                title: 'New DFS Document Submitted',
                message: `${uploadedByUser.name} submitted a document: ${fileTitle}`,
                type: 'dfs',
                priority: 'medium',
                recipient: admin._id,
                sender: req.userId,
                relatedId: newFile._id,
                relatedModel: 'FileForward',
                actionUrl: `/admin/dfsrequest/${newFile._id}`,
                metadata: {
                    fileTitle,
                    docType,
                    Department,
                    uploadedBy: uploadedByUser.name
                }
            });
        }
    } catch (notificationError) {
        console.error('Error creating DFS notification:', notificationError);
        // Don't fail the document upload if notification fails
    }

    return res.status(201).json({
      message: "Document uploaded successfully.",
      file: populatedFile
    });

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

    // Update current owner and status
    file.status = status;
    file.currentOwner = forwardedTo;

    // Push to forwarding trail with attachment
    file.forwardingTrail.push({
      forwardedBy: userId,
      forwardedTo,
      note,
      action,
      attachment: attachment || null, // ✅ now added to the trail
      timestamp: new Date(),
    });

    await file.save();

    res.status(200).json({ message: "✅ File forwarded successfully", file });
  } catch (error) {
    console.error("❌ Error forwarding file:", error);
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

// @route    GET /api/all-users
// @desc     Get all users with role 'admin' or 'staff' to show for forwarding selection 
// @access   Protected
router.get('/all-users', verifyToken, async (req, res) => {
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
router.get('/files', verifyToken, async (req, res) => {
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
// @route   GET /dfs/file/:id
// @desc    Get full details of a file by its ID
// @access  Protected
router.get('/file/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const file = await FileForward.findById(id)
      .populate('uploadedBy')
      .populate('currentOwner')
      .populate('forwardingTrail.forwardedBy')
      .populate('forwardingTrail.forwardedTo')
      .populate('comments.user')

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.status(200).json({ file });
  } catch (error) {
    console.error('Error fetching file by ID:', error);
    res.status(500).json({ error: 'Server error while fetching file details' });
  }
});

// @route   DELETE /dfs/file/:id
// @desc    Delete a DFS file by its ID
// @access  Protected
router.delete('/file/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Find the file first to check ownership
    const file = await FileForward.findById(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if the current user is the owner of the file or an admin
    const user = await User.findById(userId);
    if (file.currentOwner.toString() !== userId && user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this file' });
    }

    // Delete the file
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
