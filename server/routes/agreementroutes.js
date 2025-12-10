const express = require("express");
const Agreement = require("../models/agreementModel");
const verifyToken = require("../middleware/verifyToken");
const User = require("../models/usermodel")
const RecentActivityModel = require("../models/RecentActivityModel")
const Notification = require("../models/notificationModel")
const {createNotification} = require("../utils/createNotification")



const router = express.Router();

/**
 * @route   POST /agreements/create
 * @desc    Upload a new agreement
 * @access  Private (only verified users) only admin,staff user can post this agreement.
 * @pending only access to admin . staff is pending for sanitization.
 */
router.post("/create", verifyToken, async (req, res) => {
    console.log("Create Agreement route hit...");
    try {
        const { title, description, client, fileUrl, expiryDate } = req.body;

        // Basic validation
        if (!title || !client || !fileUrl) {
            return res.status(400).json({
                success: false,
                message: "Title, client, and fileUrl are required."
            });
        }

        // Create new agreement
        const newAgreement = new Agreement({
            title,
            description,
            client,
            fileUrl,
            uploadedBy: req.userId,
            expiryDate,
        });

        await newAgreement.save();

        /*
         * ------------------------------------------------------------
         * CREATE NOTIFICATION HERE
         * ------------------------------------------------------------
         */

        await createNotification({
            title: "New Agreement Created",
            message: `An agreement titled "${title}" has been created.`,
            type: "dfs",       // OR "system", "user", etc.
            priority: "medium",
            recipient: client, // client receives the notification
            sender: req.userId,
            relatedId: newAgreement._id,
            relatedModel: "Agreement",
            actionUrl: `/client/agreement/view${newAgreement._id}`,
            metadata: {
                agreementTitle: title,
                uploadedBy: req.userId
            }
        });

        return res.status(201).json({
            success: true,
            message: "Agreement created & notification sent.",
            agreement: newAgreement,
        });

    } catch (error) {
        console.error("Error creating agreement:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

/**
 * @route   GET /agreement/:id
 * @desc    Get details of a single agreement by ID
 * @access  Private (admin/staff can view any, client only their own)
 */
router.get("/view/:id", verifyToken, async (req, res) => {
    console.log("Get Agreement by ID route hit...");

    try {
        const agreementId = req.params.id;

        // Find logged in user
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found.",
            });
        }

        // Fetch the agreement
        const agreement = await Agreement.findById(agreementId)
            .populate("uploadedBy", "name email role profile")
            .populate("client", "name email role profile");

        if (!agreement) {
            return res.status(404).json({
                success: false,
                message: "Agreement not found.",
            });
        }

        // If user is a client → check ownership
        if (user.role === "client" && agreement.client._id.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not assigned this agreement.",
            });
        }

        // Admin & staff → full access
        // Client → allowed if agreement belongs to them

        res.status(200).json({
            success: true,
            agreement,
        });

    } catch (error) {
        console.error("Error fetching agreement by ID:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
});



/**
 * @route   GET /agreement/all
 * @desc    Fetch all agreements or only those uploaded by the current logged-in user.
 *          Use query parameter ?mine=true to fetch agreements created by the logged-in user only.
 * @access  Private (only verified users ie. admin and staff)
 * @note    Admin/Staff can view all agreements, while others can filter their own using the query.
 */
router.get("/all", verifyToken, async (req, res) => {
    console.log("Fetch agreements route hit...");

    try {
        // 🧩 Query param: ?mine=true → show only agreements uploaded by this user
        const { mine } = req.query;

        const filter = mine === "true"
            ? { uploadedBy: req.userId } // only user's own uploads
            : {}; // show all (admin/staff)

        const agreements = await Agreement.find(filter)
            .populate("uploadedBy", "name email role profile")
            .populate("client", "name email role profile")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: agreements.length,
            agreements,
        });
    } catch (error) {
        console.error("Error fetching agreements:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});


/**
 * @route   GET /agreement/client
 * @desc    Fetch all agreements for the logged-in client.
 *          By default, returns all agreements belonging to that client.
 *          You can filter agreements by status using a query parameter.
 *          Example → /agreement/client?status=pending
 * @access  Private (only verified client users)
 * @note    Ensures only the logged-in client can access their own agreements.
 */

router.get("/client", verifyToken, async (req, res) => {
    try {
        const { status } = req.query;

        const filter = { client: req.userId };

        // Handle multiple statuses
        if (status) {
            const statusArray = status.split(",");
            filter.status = { $in: statusArray };
        }

        const agreements = await Agreement.find(filter)
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 });

        if (!agreements.length) {
            return res.status(404).json({ success: false, message: "No agreements found." });
        }

        res.status(200).json({
            success: true,
            count: agreements.length,
            agreements,
        });

    } catch (error) {
        console.error("Error fetching client agreements:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

/**
 * @route   DELETE /agreement/:id
 * @desc    Delete an agreement by its MongoDB ObjectId.
 * @access  Private (only Admin or Staff users)
 * @note    Ensures only authorized users (admin/staff) can delete agreements.
 */

router.delete("/:id", verifyToken, async (req, res) => {
    console.log("Delete Agreement route hit...");

    try {
        const agreementId = req.params.id;

        // ✅ Check if the logged-in user is admin or staff
        const user = await User.findById(req.userId);
        if (!user || !["admin", "staff"].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only admin or staff can delete agreements.",
            });
        }

        // ✅ Check if the agreement exists
        const agreement = await Agreement.findById(agreementId);
        if (!agreement) {
            return res.status(404).json({
                success: false,
                message: "Agreement not found.",
            });
        }

        // ✅ Delete the agreement
        await Agreement.findByIdAndDelete(agreementId);

        res.status(200).json({
            success: true,
            message: "Agreement deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting agreement:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
});


/**
 * @route   PATCH /agreement/:id/reject
 * @desc    Allows the client to reject an assigned agreement.
 * @access  Private (only the client assigned to that agreement)
 * @note    Once rejected, the status will be updated to "rejected".
 */

router.patch("/:id/reject", verifyToken, async (req, res) => {
    console.log("Reject Agreement route hit...");

    try {
        const agreementId = req.params.id;
        const { reason } = req.body; // optional field (for storing rejection reason later if needed)

        // ✅ Get logged-in user
        const user = await User.findById(req.userId);
        if (!user || user.role !== "client") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only clients can reject agreements.",
            });
        }

        // ✅ Find agreement
        const agreement = await Agreement.findById(agreementId);
        if (!agreement) {
            return res.status(404).json({
                success: false,
                message: "Agreement not found.",
            });
        }

        // ✅ Ensure agreement belongs to this client
        if (agreement.client.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to reject this agreement.",
            });
        }

        // ✅ Update agreement status
        agreement.status = "rejected";
        await agreement.save();

        res.status(200).json({
            success: true,
            message: "Agreement has been rejected successfully.",
            agreement,
        });
    } catch (error) {
        console.error("Error rejecting agreement:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
});


/**
 * @route   PATCH /agreement/:id/view
 * @desc    Mark an agreement as viewed by the client
 * @access  Private (only client linked to the agreement)
 */
router.patch("/:id/view", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the agreement
        const agreement = await Agreement.findById(id);
        if (!agreement) {
            return res.status(404).json({ success: false, message: "Agreement not found" });
        }

        // Only the client assigned to this agreement can mark it as viewed
        if (agreement.client.toString() !== req.userId.toString()) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        // Update status if not already viewed
        if (agreement.status === "pending") {
            agreement.status = "viewed";
            agreement.viewedAt = new Date();
            await agreement.save();
        }

        res.status(200).json({
            success: true,
            message: "Agreement marked as viewed.",
            agreement,
        });
    } catch (error) {
        console.error("Error marking agreement as viewed:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

/**
 * @route   PATCH /agreement/:id/sign
 * @desc    Client signs the agreement, adds signature info and updates status to 'signed'
 * @access  Private (only client who owns this agreement)
 */
router.patch("/:id/sign", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).json({ success: false, message: "Name and Password is required." });
        }

        // Extract IP address
        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket.remoteAddress ||
            "unknown";

        const agreement = await Agreement.findOne({ _id: id, client: req.userId });
        if (!agreement)
            return res.status(404).json({
                success: false,
                message: "Agreement not found or not assigned to this client."
            });

        const user = await User.findOne({ _id: req.userId });
        if (password != user.password) {
            return res.status(400).json({ success: false, message: "Password is incorrect." });

        }

        // Update signature
        agreement.clientSignature = {
            name,
            date: new Date(),
            ip,
        };
        agreement.status = "signed";
        agreement.signedAt = new Date();

        await agreement.save();

        // ⭐ ADD RECENT ACTIVITY LOG
        try {
            await RecentActivityModel.create({
                user: req.userId,
                actionType: "agreement_signed",
                description: `You signed the agreement: ${agreement.title || "Agreement"}.`,
                relatedId: agreement._id,
                relatedModel: "Agreement",
                actionUrl: `/client/agreement/view/${agreement._id}`,
            });
        } catch (activityErr) {
            console.error("Error creating recent activity (agreement_signed):", activityErr);
        }

        res.status(200).json({
            success: true,
            message: "Agreement signed successfully.",
            agreement,
        });

    } catch (error) {
        console.error("Error signing agreement:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
});





router.get("/temp", (req, res) => {
    res.send("Hi i am  happy ..")
})

module.exports = router;
