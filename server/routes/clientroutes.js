const express = require("express");
const User = require("../models/usermodel");
const Payment = require("../models/paymentmodel");
const Bill = require("../models/billmodel");
const Transaction = require("../models/transaction");
const FileForward = require("../models/fileForwardingModel");
const Document = require("../models/documentmodel");
const verifyToken = require("../middleware/verifyToken");
const mongoose = require("mongoose");

const router = express.Router();

// Middleware to verify client authentication
const verifyClient = async (req, res, next) => {
  try {
    // Get user from session/token (you'll need to implement this based on your auth system)
    const userId = req.user?.id || req.body.userId; // Adjust based on your auth implementation

    if (!userId) {
      return res.status(401).json({ message: "Client authentication required" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'client') {
      return res.status(403).json({ message: "Client access required" });
    }

    req.clientUser = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Authentication error", error: error.message });
  }
};

// Get client dashboard statistics
router.get("/dashboard/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Use authenticated user ID from token instead of params for security
    const authenticatedUserId = req.userId;

    if (!authenticatedUserId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Convert to ObjectId (token value is source of truth)
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(authenticatedUserId);
    } catch (e) {
      return res.status(400).json({ success:false, message:"Invalid authenticated user id" });
    }

    // If param mismatch, just log and proceed (front-end may have stale id in route)
    if (userId.toString() !== authenticatedUserId.toString()) {
      console.warn(`[CLIENT DASHBOARD] Route param userId (${userId}) mismatches token userId (${authenticatedUserId}). Using token id data.`);
    }

    // Get user-specific data
    const [userBills, userPayments, userDocuments, userDfsRequests] = await Promise.all([
      Bill.find({ user: userObjectId }).sort({ submittedAt: -1 }),
      Payment.find({ user: userObjectId }).sort({ submittedAt: -1 }),
      Document.find({ userId: userObjectId }).sort({ createdAt: -1 }),  // Documents for this user
      FileForward.find({ uploadedBy: userObjectId }).sort({ createdAt: -1 })  // DFS uploaded by this user
    ]);

    console.log(`Client Dashboard Debug for user ${userObjectId}:`, {
      success:true,
      totalBills: userBills.length,
      totalPayments: userPayments.length,
      totalDocuments: userDocuments.length,
      totalDfsRequests: userDfsRequests.length,
      billStatuses: (userBills||[]).map(b => b.paymentStatus),
      paymentStatuses: (userPayments||[]).map(p => p.status)
    });

    // Calculate stats
    const totalBills = userBills.length;
    const totalPayments = userPayments.length;
    const totalDocuments = userDocuments.length;
    const totalDfsRequests = userDfsRequests.length;

    // Bill status counts - check for various status values
    const pendingBills = userBills.filter(bill =>
      ['Unpaid', 'Pending', 'pending'].includes(bill.paymentStatus)
    ).length;
    const approvedBills = userBills.filter(bill =>
      ['Paid', 'Sanctioned', 'paid', 'sanctioned', 'approved', 'Approved'].includes(bill.paymentStatus)
    ).length;
    const rejectedBills = userBills.filter(bill =>
      ['Reject', 'Rejected', 'reject', 'rejected'].includes(bill.paymentStatus)
    ).length;

    // Payment status counts
    const pendingPayments = userPayments.filter(payment =>
      ['Pending', 'pending'].includes(payment.status)
    ).length;
    const approvedPayments = userPayments.filter(payment =>
      ['Approved', 'approved', 'Paid', 'paid'].includes(payment.status)
    ).length;

    // Recent activity
    const recentActivity = [
      ...userBills.slice(0, 3).map(bill => ({
        title: `Bill ${bill.loaNo || bill._id?.toString().slice(-6) || 'ID'} submitted`,
        description: `${bill.firmName || 'Company'} - ₹${bill.amount || '0'}`,
        status: bill.paymentStatus || 'pending',
        time: bill.submittedAt || new Date(),
        type: 'bill'
      })),
      ...userPayments.slice(0, 2).map(payment => ({
        title: `Payment request ₹${payment.amount || '0'}`,
        description: `${payment.paymentType || payment.description || 'Payment'}`,
        status: payment.status || 'pending',
        time: payment.submittedAt || new Date(),
        type: 'payment'
      })),
      ...userDfsRequests.slice(0, 2).map(dfs => ({
        title: `DFS: ${dfs.fileTitle || 'Document'}`,
        description: `Document forwarding request`,
        status: dfs.status || 'pending',
        time: dfs.createdAt || new Date(),
        type: 'dfs'
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 7);

    // Monthly trends for the last 6 months
    const monthlyTrends = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);

      const monthBills = userBills.filter(bill => {
        const billDate = new Date(bill.submittedAt);
        return billDate >= monthDate && billDate < nextMonth;
      }).length;

      const monthPayments = userPayments.filter(payment => {
        const paymentDate = new Date(payment.submittedAt);
        return paymentDate >= monthDate && paymentDate < nextMonth;
      }).length;

      monthlyTrends.push({
        month: monthDate.toLocaleString('default', { month: 'short' }),
        bills: monthBills,
        payments: monthPayments
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalBills,
        totalPayments,
        totalDocuments,
        totalDfsRequests,
        pendingBills,
        approvedBills,
        rejectedBills,
        pendingPayments,
        approvedPayments,
        recentActivity,
        monthlyTrends
      }
    });
  } catch (error) {
    console.error("Error fetching client dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Get client-specific bills
router.get("/my-bills/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.userId;

    if (!authenticatedUserId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Convert userId to ObjectId for database queries
    const userObjectId = new mongoose.Types.ObjectId(authenticatedUserId);

    if (userId.toString() !== userObjectId.toString()) {
      return res.status(403).json({ message: "Access denied - can only view own bills" });
    }

    const bills = await Bill.find({ user: userObjectId })
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      bills
    });
  } catch (error) {
    console.error("Error fetching client bills:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Get client-specific payments
router.get("/my-payments/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.userId;

    if (!authenticatedUserId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Convert userId to ObjectId for database queries
    const userObjectId = new mongoose.Types.ObjectId(authenticatedUserId);

    if (userId.toString() !== userObjectId.toString()) {
      return res.status(403).json({ message: "Access denied - can only view own payments" });
    }

    const payments = await Payment.find({ user: userObjectId })
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      payments
    });
  } catch (error) {
    console.error("Error fetching client payments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Get client-specific DFS requests
router.get("/my-dfs-requests/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.userId;

    if (!authenticatedUserId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Convert userId to ObjectId for database queries
    const userObjectId = new mongoose.Types.ObjectId(authenticatedUserId);

    if (userId.toString() !== userObjectId.toString()) {
      return res.status(403).json({ message: "Access denied - can only view own DFS requests" });
    }

    const dfsRequests = await FileForward.find({ uploadedBy: userObjectId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      dfsRequests
    });
  } catch (error) {
    console.error("Error fetching client DFS requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

module.exports = router;
