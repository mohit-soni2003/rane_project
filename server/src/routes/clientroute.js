const express = require("express")
const User = require("../models/usermodel")
const Bill = require("../models/billmodel")
const FileForward = require("../models/fileForwardingModel");
const Document = require("../models/documentmodel");

const router = express.Router();

router.get('/allclient', async (req, res) => {
    console.log("show all Client route hitted")

    try {
        // Find bills that match the user's ID
        const client = await User.find({});
        console.log(client)
        if (client.length > 0) {
            res.status(200).json(client);
        } else {
            res.json({ error: 'No bills found for this user' });
        }
    } catch (error) {
        res.json({ error: 'Server error', details: error.message });
    }
});

router.put('/update-cid/:id', async (req, res) => {
    console.log("Update CID route hit...");
    const { id } = req.params;
    const { cid } = req.body;

    console.log("ID:", id, "New CID:", cid);

    try {
        // Check if the new CID is already in use by another user
        const existingUser = await User.findOne({ cid: cid, _id: { $ne: id } });
        if (existingUser) {
            return res.status(400).json({ error: 'CID must be unique' });
        }

        // Check if user exists before updating
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the user's CID
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { cid: cid },
            { new: true } // Return the updated document
        );

        console.log("User CID updated:", updatedUser);
        res.status(200).json({ message: 'CID updated successfully', user: updatedUser });
    } catch (error) {
        console.error("Error updating CID:", error.message);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});


// UNIVERSAL PROFILE/BANK/DETAILS UPDATE --------Added in Version 3.O
router.put("/update-user", async (req, res) => {
    console.log("Universal user update route hit");

    try {
        const { id, ...updates } = req.body;

        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // List of fields allowed to be updated
        const allowedFields = [
            "name", "email", "phoneNo", "address", "clientType", "firmName",
            "idproof", "idProofType", "gstno", "upi", "bankName", "ifscCode",
            "accountNo", "usertype", "profile"
        ];

        // Loop through allowed fields and update if present
        for (const field of allowedFields) {
            if (updates.hasOwnProperty(field)) {
                user[field] = updates[field];
            }
        }

        await user.save();

        res.json({ message: "User details updated successfully", user });
    } catch (error) {
        console.error("Error in universal user update:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// UPDATE ID PROOF (nothing except id is required; updates only what you send)
// UPDATE ONLY IDPROOF (Aadhar & PAN)
// UPDATE ONLY IDPROOF (Aadhar & PAN) - defensive and normalizes bad shapes
// Robust update-idproof route — normalizes bad DB shapes before updating
router.put("/update-idproof", async (req, res) => {
  try {
    console.log("[update-idproof] request body:", JSON.stringify(req.body));
    const { id, aadhar, pan } = req.body;
    if (!id) return res.status(400).json({ error: "User ID is required" });

    // 1) Fetch current user doc (lean: false so we get a Mongoose document)
    let user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    console.log("[update-idproof] existing idproof type:", typeof user.idproof, "value:", JSON.stringify(user.idproof));

    // 2) If idproof is not an object, build a safe normalized object and replace it in DB
    let needsNormalize = false;
    if (typeof user.idproof !== "object" || user.idproof === null) {
      needsNormalize = true;
    } else {
      // if aadhar or pan are primitives (string/number) mark for normalize
      if (typeof user.idproof.aadhar !== "object" || user.idproof.aadhar === null) needsNormalize = true;
      if (typeof user.idproof.pan !== "object"   || user.idproof.pan === null)   needsNormalize = true;
    }

    if (needsNormalize) {
      // Build normalized idproof preserving any primitive values found
      const normalized = { aadhar: {}, pan: {} };

      if (typeof user.idproof === "string") {
        normalized.aadhar.number = user.idproof;
        normalized.aadhar.lastUpdate = new Date();
      } else {
        // if idproof exists but subfields are primitive, copy them safely
        if (user.idproof && typeof user.idproof.aadhar === "string") {
          normalized.aadhar.number = user.idproof.aadhar;
          normalized.aadhar.lastUpdate = new Date();
        } else if (user.idproof && typeof user.idproof.aadhar === "object") {
          normalized.aadhar = { ...user.idproof.aadhar };
        }

        if (user.idproof && typeof user.idproof.pan === "string") {
          normalized.pan.number = user.idproof.pan;
          normalized.pan.lastUpdate = new Date();
        } else if (user.idproof && typeof user.idproof.pan === "object") {
          normalized.pan = { ...user.idproof.pan };
        }
      }

      // Replace the whole idproof field in DB (atomic)
      await User.updateOne({ _id: id }, { $set: { idproof: normalized } });
      // re-fetch user document after normalization
      user = await User.findById(id);
      console.log("[update-idproof] normalized idproof:", JSON.stringify(user.idproof));
    }

    // 3) Now `user.idproof`, `user.idproof.aadhar`, `user.idproof.pan` are objects — safe to update
    if (aadhar) {
      if (typeof aadhar !== "object") {
        return res.status(400).json({ error: "aadhar must be an object like { number, link }" });
      }
      if (aadhar.number !== undefined) user.idproof.aadhar.number = aadhar.number;
      if (aadhar.link   !== undefined) user.idproof.aadhar.link   = aadhar.link;
      user.idproof.aadhar.lastUpdate = new Date();
    }

    if (pan) {
      if (typeof pan !== "object") {
        return res.status(400).json({ error: "pan must be an object like { number, link }" });
      }
      if (pan.number !== undefined) user.idproof.pan.number = pan.number;
      if (pan.link   !== undefined) user.idproof.pan.link   = pan.link;
      user.idproof.pan.lastUpdate = new Date();
    }

    await user.save();

    return res.json({
      message: "ID proof updated successfully",
      idproof: user.idproof,
    });
  } catch (err) {
    console.error("[update-idproof] server error:", err && err.stack ? err.stack : err);
  }
});

// Route to get all documents from both Document and FileForward models for Client users
router.get("/client-get-all-documents", async (req, res) => {
    try {
        // Get all regular documents
        const regularDocuments = await Document.find()
            .populate("userId", "name email cid profile role")
            .populate("uploadedBy", "name email cid profile role")
            .sort({ createdAt: -1 });

        // Get all DFS documents
        const dfsDocuments = await FileForward.find()
            .populate("uploadedBy", "name email cid profile role")
            .populate("currentOwner", "name email cid profile role")
            .populate("forwardingTrail.forwardedBy", "name email cid profile role")
            .populate("forwardingTrail.forwardedTo", "name email cid profile role")
            .sort({ createdAt: -1 });

        // Combine and format the documents
        const allDocuments = [
            ...regularDocuments.map(doc => ({
                _id: doc._id,
                type: 'regular',
                title: `${doc.docType} - ${doc.documentCode}`,
                documentType: doc.docType,
                documentCode: doc.documentCode,
                description: doc.remark || 'No description',
                status: doc.status,
                uploadedBy: doc.uploadedBy,
                userId: doc.userId,
                dateOfIssue: doc.dateOfIssue,
                uploadDate: doc.uploadDate,
                documentLink: doc.documentLink,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
            })),
            ...dfsDocuments.map(doc => ({
                _id: doc._id,
                type: 'dfs',
                title: doc.fileTitle,
                documentType: doc.docType,
                documentCode: null,
                description: doc.description,
                status: doc.status,
                uploadedBy: doc.uploadedBy,
                userId: doc.currentOwner,
                dateOfIssue: null,
                uploadDate: doc.createdAt,
                documentLink: doc.fileUrl,
                createdAt: doc.createdAt,
                updatedAt: doc.createdAt
            }))
        ];

        // Sort by creation date (newest first)
        allDocuments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({ 
            success: true,
            documents: allDocuments,
            total: allDocuments.length,
            regularCount: regularDocuments.length,
            dfsCount: dfsDocuments.length
        });
    } catch (error) {
        console.error("Error fetching all documents:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error", 
            error: error.message 
        });
    }
});


// ─────────────────────────────────────────────────────────────────────────────
// UPDATE USER TAG
// PUT /admin-update-user-tag
// Body: { id, tag } — matches the same "id in the body" convention your
// updateUser and updateIdProof routes already use.
// Admin only. Add your existing admin-check middleware here the same
// way it's applied to your other /admin-... routes.
// ─────────────────────────────────────────────────────────────────────────────

// Keep this in sync with the `tag` enum on the User schema.
const VALID_TAGS = [
    "admin", "ceo", "cto", "cfo", "coo", "director", "site_incharge",
    "chief_finance_head", "finance_head", "accountant", "supervisor",
    "client", "staff"
];

router.put("/admin-update-user-tag", async (req, res) => {
    try {
        const { id, tag } = req.body;

        if (!id) {
            return res.status(400).json({ error: "User id is required." });
        }

        if (!tag || !VALID_TAGS.includes(tag)) {
            return res.status(400).json({
                error: `tag is required and must be one of: ${VALID_TAGS.join(", ")}`
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { tag },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json({
            message: "User tag updated successfully.",
            user
        });

    } catch (error) {
        console.error("Update user tag error:", error.message);
        return res.status(500).json({ error: error.message });
    }
});
module.exports = router;
 