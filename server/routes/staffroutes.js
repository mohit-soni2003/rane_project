const express = require("express");
const User = require("../models/usermodel");
const Payment = require("../models/paymentmodel");
const Bill = require("../models/billmodel");
const Transaction = require("../models/transaction");
const FileForward = require("../models/fileForwardingModel");
const Document = require("../models/documentmodel");

const router = express.Router();

// Middleware to verify staff authentication
const verifyStaff = async (req, res, next) => {
  try {
    // Get user from session/token (you'll need to implement this based on your auth system)
    const userId = req.user?.id || req.body.userId; // Adjust based on your auth implementation

    if (!userId) {
      return res.status(401).json({ message: "Staff authentication required" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'staff') {
      return res.status(403).json({ message: "Staff access required" });
    }

    req.staffUser = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Authentication error", error: error.message });
  }
};

// Get staff dashboard statistics
router.get("/dashboard-stats", async (req, res) => {
  try {
    // Get all data (staff can see all data for their work)
    const [totalBills, totalUsers, totalPayments, totalDocuments, totalDfsRequests] = await Promise.all([
      Bill.countDocuments(),
      User.countDocuments({ role: 'client' }),
      Payment.countDocuments(),
      Document.countDocuments(),
      FileForward.countDocuments()
    ]);

    // Get pending items
    const [pendingPayments, pendingDfs] = await Promise.all([
      Payment.countDocuments({ status: { $in: ['pending', 'Pending'] } }),
      FileForward.countDocuments({ status: { $in: ['pending', 'Pending'] } })
    ]);

    // Get recent activity (last 10 items)
    const [recentBills, recentPayments, recentDfs] = await Promise.all([
      Bill.find()
        .populate('user', 'name cid')
        .sort({ submittedAt: -1 })
        .limit(5)
        .select('firmName loaNo amount paymentStatus submittedAt user'),
      Payment.find()
        .populate('user', 'name cid')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('amount paymentType status createdAt user'),
      FileForward.find()
        .populate('uploadedBy', 'name cid')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fileTitle status createdAt uploadedBy')
    ]);

    // Combine recent activity
    const recentActivity = [
      ...recentBills.map(bill => ({
        type: 'bill',
        title: `Bill ${bill.loaNo || bill._id?.slice(-6) || 'ID'} submitted`,
        description: `${bill.firmName || 'Company'} - ₹${bill.amount || '0'}`,
        status: bill.paymentStatus || 'pending',
        time: bill.submittedAt || bill.createdAt || new Date(),
        user: bill.user?.name || 'System'
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
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

    // Generate monthly data for the last 6 months
    const monthlyData = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);

      const [monthBills, monthPayments, monthDocuments] = await Promise.all([
        Bill.countDocuments({
          submittedAt: { $gte: monthDate, $lt: nextMonth }
        }),
        Payment.countDocuments({
          createdAt: { $gte: monthDate, $lt: nextMonth }
        }),
        Document.countDocuments({
          createdAt: { $gte: monthDate, $lt: nextMonth }
        })
      ]);

      monthlyData.push({
        month: monthDate.toLocaleString('default', { month: 'short' }),
        bills: monthBills,
        payments: monthPayments,
        documents: monthDocuments
      });
    }

    // Get status distribution
    const [billStatuses, paymentStatuses, dfsStatuses] = await Promise.all([
      Bill.aggregate([
        { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
      ]),
      Payment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      FileForward.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalBills,
        totalClients: totalUsers,
        pendingPayments,
        totalDocuments,
        pendingDfs,
        recentActivity,
        monthlyData,
        statusData: {
          billStatuses: billStatuses.reduce((acc, item) => {
            acc[item._id || 'unknown'] = item.count;
            return acc;
          }, {}),
          paymentStatuses: paymentStatuses.reduce((acc, item) => {
            acc[item._id || 'unknown'] = item.count;
            return acc;
          }, {}),
          dfsStatuses: dfsStatuses.reduce((acc, item) => {
            acc[item._id || 'unknown'] = item.count;
            return acc;
          }, {})
        }
      }
    });
  } catch (error) {
    console.error("Error fetching staff dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Get staff-specific bills (bills assigned to staff or created by staff)
router.get("/my-bills", async (req, res) => {
  try {
    const staffId = req.staffUser?._id;

    if (!staffId) {
      return res.status(401).json({ message: "Staff authentication required" });
    }

    // For now, return all bills since staff might need to see all bills
    // You can modify this based on your business logic
    const bills = await Bill.find()
      .populate('user', 'name cid email')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      bills
    });
  } catch (error) {
    console.error("Error fetching staff bills:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Get staff-specific payments
router.get("/my-payments", async (req, res) => {
  try {
    const staffId = req.staffUser?._id;

    if (!staffId) {
      return res.status(401).json({ message: "Staff authentication required" });
    }

    // Return all payments for staff to manage
    const payments = await Payment.find()
      .populate('user', 'name cid email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      payments
    });
  } catch (error) {
    console.error("Error fetching staff payments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Get staff-specific DFS requests
router.get("/my-dfs-requests", async (req, res) => {
  try {
    const staffId = req.staffUser?._id;

    if (!staffId) {
      return res.status(401).json({ message: "Staff authentication required" });
    }

    // Return all DFS requests for staff to manage
    const dfsRequests = await FileForward.find()
      .populate('uploadedBy', 'name cid email')
      .populate('currentOwner', 'name cid email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      dfsRequests
    });
  } catch (error) {
    console.error("Error fetching staff DFS requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

module.exports = router;
