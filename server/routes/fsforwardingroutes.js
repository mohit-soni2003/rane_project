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
module.exports = router;
