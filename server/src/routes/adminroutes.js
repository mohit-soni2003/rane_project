const express = require("express");
const User = require("../models/usermodel");
const Payment = require("../models/paymentmodel")
const Bill = require("../models/billmodel")
const Transaction = require("../models/transaction");
const FileForward = require("../models/fileForwardingModel");
const Document = require("../models/documentmodel");

const router = express.Router();

// Route to create a new user (Admin)
router.post("/admin-create-user", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        const newUser = new User({
            name,
            email,
            password,
            isverified: true, // Automatically set to true
        });

        // Save user to database
        await newUser.save();

        res.status(201).json({ message: "User created successfully", userId: newUser._id });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Route to fetch all users (Including Password)
router.get("/admin-get-users", async (req, res) => {
    try {
        const users = await User.find(); // Fetches all users including password
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
router.get("/admin-get-users-details/:id", async (req, res) => {
    console.log("Admin route to view client details hitted...")
    try {
        const userId = req.params.id;
        
        // Fetch user details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Fetch bills and payments for the user
        const bills = await Bill.find({ user: userId });
        const payments = await Payment.find({ user: userId });

        res.status(200).json({
            user,
            bills,
            payments
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Route to delete a user by ID
router.delete("/admin-delete-user/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

router.delete("/admin-delete-user/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete related Bills
        await Bill.deleteMany({ user: userId });

        // Delete related Payments
        await Payment.deleteMany({ user: userId });

        // Delete related Transactions
        await Transaction.deleteMany({ userId });

        // Delete FileForwards where user is uploader or current owner or in forwarding trail
        await FileForward.deleteMany({
            $or: [
                { uploadedBy: userId },
                { currentOwner: userId },
                { "forwardingTrail.forwardedBy": userId },
                { "forwardingTrail.forwardedTo": userId },
                { "comments.user": userId }
            ]
        });

        // Finally, delete the user
        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: "User and all related data deleted successfully" });
    } catch (error) {
        console.error("Error deleting user and data:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Route to get all documents from both Document and FileForward models
router.get("/admin-get-all-documents", async (req, res) => {
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

// Route to get all documents from both Document and FileForward models for Staff users
router.get("/staff-get-all-documents", async (req, res) => {
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

// Get admin dashboard statistics
router.get("/admin-dashboard-stats", async (req, res) => {
    try {
        // Get all data for admin overview
        const [totalBills, totalUsers, totalPayments, totalDocuments, totalDfsRequests, totalStaff, totalClients] = await Promise.all([
            Bill.countDocuments(),
            User.countDocuments(),
            Payment.countDocuments(),
            Document.countDocuments(),
            FileForward.countDocuments(),
            User.countDocuments({ role: 'staff' }),
            User.countDocuments({ role: 'client' })
        ]);

        // Get pending items
        const [pendingPayments, pendingDfs, pendingBills] = await Promise.all([
            Payment.countDocuments({ status: { $in: ['pending', 'Pending'] } }),
            FileForward.countDocuments({ status: { $in: ['pending', 'Pending'] } }),
            Bill.countDocuments({ paymentStatus: { $in: ['pending', 'Pending'] } })
        ]);

        // Get recent activity (last 10 items)
        const [recentBills, recentPayments, recentDfs, recentUsers] = await Promise.all([
            Bill.find()
                .populate('user', 'name cid')
                .sort({ submittedAt: -1 })
                .limit(3)
                .select('firmName loaNo amount paymentStatus submittedAt user'),
            Payment.find()
                .populate('user', 'name cid')
                .sort({ createdAt: -1 })
                .limit(3)
                .select('amount paymentType status createdAt user'),
            FileForward.find()
                .populate('uploadedBy', 'name cid')
                .sort({ createdAt: -1 })
                .limit(3)
                .select('fileTitle status createdAt uploadedBy'),
            User.find()
                .sort({ createdAt: -1 })
                .limit(3)
                .select('name email role createdAt')
        ]);

        // Combine recent activity
        const recentActivity = [
            ...recentBills.map(bill => ({
                type: 'bill',
                title: `Bill ${bill.loaNo || bill._id?.slice(-6) || 'ID'} submitted`,
                description: `${bill.firmName || 'Company'} - ₹${bill.amount || '0'}`,
                status: bill.paymentStatus || 'pending',
                time: bill.submittedAt || bill.createdAt || new Date(),
                user: bill.user?.name || 'Client'
            })),
            ...recentPayments.map(payment => ({
                type: 'payment',
                title: `Payment request ₹${payment.amount || '0'}`,
                description: `${payment.paymentType || 'Payment'} - ${payment.user?.name || 'Client'}`,
                status: payment.status || 'pending',
                time: payment.createdAt || new Date(),
                user: payment.user?.name || 'Client'
            })),
            ...recentDfs.map(dfs => ({
                type: 'dfs',
                title: `DFS: ${dfs.fileTitle || 'Document'}`,
                description: `Uploaded by ${dfs.uploadedBy?.name || 'User'}`,
                status: dfs.status || 'pending',
                time: dfs.createdAt || new Date(),
                user: dfs.uploadedBy?.name || 'User'
            })),
            ...recentUsers.map(user => ({
                type: 'user',
                title: `New ${user.role || 'user'} registered`,
                description: `${user.name || 'User'} - ${user.email || 'email@example.com'}`,
                status: 'active',
                time: user.createdAt || new Date(),
                user: user.name || 'User'
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

        // Generate monthly data for the last 6 months
        const monthlyData = [];
        const currentDate = new Date();

        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);

            const [monthBills, monthPayments, monthDocuments, monthUsers] = await Promise.all([
                Bill.countDocuments({
                    submittedAt: { $gte: monthDate, $lt: nextMonth }
                }),
                Payment.countDocuments({
                    createdAt: { $gte: monthDate, $lt: nextMonth }
                }),
                Document.countDocuments({
                    createdAt: { $gte: monthDate, $lt: nextMonth }
                }),
                User.countDocuments({
                    createdAt: { $gte: monthDate, $lt: nextMonth }
                })
            ]);

            monthlyData.push({
                month: monthDate.toLocaleString('default', { month: 'short' }),
                bills: monthBills,
                payments: monthPayments,
                documents: monthDocuments,
                users: monthUsers
            });
        }

        res.status(200).json({
            success: true,
            stats: {
                totalBills,
                totalUsers,
                totalPayments,
                totalDocuments,
                totalDfsRequests,
                totalStaff,
                totalClients,
                pendingPayments,
                pendingDfs,
                pendingBills,
                recentActivity,
                recentBills,
                recentPayments,
                recentDfs,
                recentUsers,
                monthlyData
            }
        });
    } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

module.exports = router;
