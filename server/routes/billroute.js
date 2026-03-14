const express = require("express")
const User = require("../models/usermodel")
const Bill = require("../models/billmodel")
const Agreement = require("../models/agreementModel")
const Document = require("../models/documentmodel")
const RecentActivity = require("../models/RecentActivityModel")
const Notification = require("../models/notificationModel")
const verifyToken = require("../middleware/verifyToken")
// const { createNotification } = require("./notificationRoutes")



const router = express.Router();

router.post("/post-bill", async (req, res) => {
  try {
    const { firmName, workArea, loaNo, agreement, pdfurl, user, invoiceNo, workDescription, amount } = req.body;

    // Validate required fields
    if (!firmName || !workArea || !loaNo || !agreement || !pdfurl || !user || !amount) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Check if the referenced user exists
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingAgreement = await Agreement.findById(agreement);
    if (!existingAgreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    if (existingAgreement.status !== "signed") {
      return res.status(400).json({ message: "Only signed agreements can be selected" });
    }

    if (existingAgreement.client.toString() !== existingUser._id.toString()) {
      return res.status(403).json({ message: "Selected agreement does not belong to this user" });
    }

    // Create a new bill
    const newBill = new Bill({
      firmName,
      workArea,
      loaNo,
      agreement,
      pdfurl,
      invoiceNo,
      workDescription,
      user,
      amount
    });

    // Save the bill to the database
    const savedBill = await newBill.save();

    // ⭐ CREATE RECENT ACTIVITY ENTRY
    try {
      await RecentActivity.create({
        user: existingUser._id,
        actionType: "bill_submitted",
        description: `Submitted a bill for ₹${amount} (${firmName})`,
        relatedModel: "Bill",
        relatedId: savedBill._id,
        actionUrl: `/client/bill/${savedBill._id}`,
        metadata: {
          firmName,
          workArea,
          loaNo,
          amount,
          invoiceNo
        }
      });
    } catch (activityErr) {
      console.error("Error creating recent activity:", activityErr);
    }

    // ⭐ Create notifications for admins
    try {
      const admins = await User.find({ role: 'admin' });


      for (const admin of admins) {
        await Notification.create({
          title: 'New Bill Submitted',
          message: `${existingUser.name} submitted a bill for ₹${amount} (${firmName})`,
          type: 'bill',
          priority: 'medium',
          recipient: admin._id,
          sender: existingUser._id,
          relatedId: savedBill._id,
          relatedModel: 'Bill',
          actionUrl: `/admin/bill/${savedBill._id}`,
          metadata: {
            firmName,
            amount,
            workArea,
            submittedAt: savedBill.submittedAt
          }
        });
      }
    } catch (notificationError) {
      console.error('Error creating bill notification:', notificationError);
      // Do not stop bill creation
    }

    res.status(201).json({ message: "Bill created successfully", bill: savedBill });

  } catch (error) {
    // Handle duplicate LOA number
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate loaNo detected" });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// all bills on particual id 
router.get('/mybill/:id', async (req, res) => {
  // console.log("Show my bill route hit");

  const { id } = req.params;
  // console.log("User ID:", id);

  try {
    // Find bills for the given user ID
    const bills = await Bill.find({ user: id });

    // console.log("Fetched Bills:", bills);

    if (bills.length > 0) {
      return res.status(200).json(bills);
    } else {
      return res.status(200).json({ error: 'No bills found for this user' });
    }
  } catch (error) {
    console.error("Error fetching bills:", error.message);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});


router.get('/allbill', async (req, res) => {
  // console.log("show all bill route hitted")

  try {
    // Find bills that match the user's ID
    const bills = await Bill.find({}).populate("user");
    // console.log(bills)
    if (bills.length > 0) {
      res.status(200).json(bills);
    } else {
      res.json({ error: 'No bills found for this user' });
    }
  } catch (error) {
    res.json({ error: 'Server error', details: error.message });
  }
});

// Get bills for a specific user
router.get('/mybill/:userId', async (req, res) => {
  // console.log("Get bills for user route hit")
  const { userId } = req.params;

  try {
    // Find bills that match the user's ID
    const bills = await Bill.find({ user: userId }).populate("user");
    // console.log(bills)
    if (bills.length > 0) {
      res.status(200).json(bills);
    } else {
      res.status(200).json([]); // Return empty array instead of error for no bills
    }
  } catch (error) {
    console.error("Error fetching user bills:", error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});
//particular signle bill details
router.get('/bill/:id', async (req, res) => {
  // console.log("show particular id bill route hitted")
  const { id } = req.params

  try {
    // Find bills that match the user's ID
    const bill = await Bill.findById(id).populate("user paidby agreement");
    // console.log(bill)
    if (bill) {
      res.status(200).json(bill);
    } else {
      res.json({ error: 'No bills found for this user' });
    }
  } catch (error) {
    res.json({ error: 'Server error', details: error.message });
  }
});
//this is of no use same as above
router.get('/bill/update-payment/:id', async (req, res) => {
  // console.log("Update bill Zpayment stasus route hitted")
  const { status } = req.body
  const { id } = req.params

  try {
    // Find bills that match the user's ID
    const bill = await Bill.findById(id).populate("user");
    // console.log(bill)
    if (bill) {
      res.status(200).json(bill);
    } else {
      res.json({ error: 'No bills found for this user' });
    }
  } catch (error) {
    res.json({ error: 'Server error', details: error.message });
  }
});


// this route is used by admin to change status 
router.put('/bill/update-payment/:id', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    const updatedBill = await Bill.findByIdAndUpdate(
      id,
      { paymentStatus: status },
      { new: true }
    ).populate("user");

    if (!updatedBill) {
      return res.status(404).json({ error: 'No bill found with this ID' });
    }

    /* ----------------------------------
       🔔 NOTIFICATION (CLIENT)
    ---------------------------------- */
    await Notification.create({
      title: "Bill Payment Status Updated",
      message: `Your bill for "${updatedBill.firmName}" has been marked as "${status}".`,
      type: "bill",
      priority: status === "Paid" ? "high" : "medium",
      recipient: updatedBill.user._id,
      sender: req.userId || null,
      relatedId: updatedBill._id,
      relatedModel: "Bill",
      actionUrl: `/client/bill/${updatedBill._id}`,
      metadata: {
        firmName: updatedBill.firmName,
        invoiceNo: updatedBill.invoiceNo,
        loaNo: updatedBill.loaNo,
        amount: updatedBill.amount,
        paymentStatus: status,
      },
    });

    /* ----------------------------------
       🕒 RECENT ACTIVITY
    ---------------------------------- */
    await RecentActivity.create({
      user: updatedBill.user._id,
      actionType: "payment_approved",
      description: `Payment status updated to "${status}" for bill (${updatedBill.firmName})`,
      relatedModel: "Bill",
      relatedId: updatedBill._id,
      actionUrl: `/client/bill/${updatedBill._id}`,
      metadata: {
        firmName: updatedBill.firmName,
        amount: updatedBill.amount,
        status,
      },
    });

    res.status(200).json(updatedBill);

  } catch (error) {
    console.error("Error updating bill payment status:", error);
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
});


router.delete("/bill/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if bill exists
    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Delete the bill
    await Bill.findByIdAndDelete(id);
    res.json({ message: "Bill deleted successfully" });

  } catch (error) {
    console.error("Error deleting bill:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/recent-bills", async (req, res) => {
  try {
    const recentBills = await Bill.find()
      .sort({ submittedAt: -1 }) // Sort by most recent
      .limit(3) // Get only 3 documents
      .populate("user"); // Populate user details (fetching only name & email)

    res.json(recentBills);
  } catch (error) {
    console.error("Error fetching recent bills:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Fetch the loa of the particula user id 


// Fetch LOA document(s) for a specific user
router.get("/loa/:id", async (req, res) => {
  // console.log("Fetch LOA route hit...");
  const { id } = req.params;

  try {
    // Find LOA documents for that user, latest first
    const loaDocs = await Document.find({ userId: id, docType: "LOA" })
      .sort({ createdAt: -1 })
      .populate("userId uploadedBy", "name email"); // Optional: populate user details

    if (!loaDocs || loaDocs.length === 0) {
      return res.status(404).json({ message: "No LOA documents found for this user" });
    }

    res.status(200).json(loaDocs);
  } catch (error) {
    console.error("Error fetching LOA documents:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// CLIENT REQUEST WITHDRAW BILL
router.put("/bill/withdraw/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Find bill
    const bill = await Bill.findById(id).populate("user");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // 🔒 Check if already paid
    if (bill.paymentStatus === "Paid") {
      return res.status(400).json({ message: "Paid bills cannot be withdrawn" });
    }

    // 🔁 Prevent duplicate request
    if (bill.withdrawStatus === "Requested") {
      return res.status(400).json({ message: "Withdraw already requested" });
    }

    // Update withdraw fields
    bill.withdrawStatus = "Requested";
    bill.withdrawRequestedAt = new Date();
    bill.withdrawReason = reason || "No reason provided";

    await bill.save();

    /* ----------------------------------
       🔔 NOTIFY ADMINS
    ---------------------------------- */
    const admins = await User.find({ role: "admin" });

    for (const admin of admins) {
      await Notification.create({
        title: "Withdraw Request Submitted",
        message: `${bill.user.name} requested to withdraw bill (${bill.firmName})`,
        type: "bill",
        priority: "high",
        recipient: admin._id,
        sender: bill.user._id,
        relatedId: bill._id,
        relatedModel: "Bill",
        actionUrl: `/admin/bill/${bill._id}`,
        metadata: {
          firmName: bill.firmName,
          amount: bill.amount,
          withdrawReason: bill.withdrawReason,
        },
      });
    }

    /* ----------------------------------
       🕒 RECENT ACTIVITY
    ---------------------------------- */
    await RecentActivity.create({
      user: bill.user._id,
      actionType: "withdraw_requested",
      description: `Requested withdraw for bill (${bill.firmName})`,
      relatedModel: "Bill", 
      relatedId: bill._id,
      actionUrl: `/client/bill/${bill._id}`,
      metadata: {
        firmName: bill.firmName,
        amount: bill.amount,
      },
    });

    res.status(200).json({
      message: "Withdraw request sent to admin",
      bill,
    });

  } catch (error) {
    console.error("Withdraw request error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// ADMIN: Approve or Reject withdraw request
router.put('/bill/withdraw-action/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body; // action should be 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const bill = await Bill.findById(id).populate('user');
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    if (bill.withdrawStatus !== 'Requested') {
      return res.status(400).json({ message: 'No pending withdraw request for this bill' });
    }

    bill.withdrawStatus = action;
    if (action === 'Approved') {
      bill.paymentStatus = 'Withdrawed';
      bill.withdrawApprovedAt = new Date();
      bill.withdrawReason = note || bill.withdrawReason || 'Withdraw approved by admin';
    }

    // Optional admin note can be stored in withdrawReason by appending
    if (action !== 'Approved' && note) {
      bill.withdrawReason = `${bill.withdrawReason || ''} \nAdmin Note: ${note}`;
    }

    await bill.save();

    // Notify the user about the decision
    await Notification.create({
      title: `Withdraw request ${action.toLowerCase()}`,
      message: `Your withdraw request for bill (${bill.firmName}) has been ${action.toLowerCase()}.`,
      type: 'bill',
      priority: action === 'Approved' ? 'high' : 'medium',
      recipient: bill.user._id,
      sender: req.userId || null,
      relatedId: bill._id,
      relatedModel: 'Bill',
      actionUrl: `/client/bill/${bill._id}`,
      metadata: {
        firmName: bill.firmName,
        amount: bill.amount,
        withdrawStatus: bill.withdrawStatus,
      },
    });

    await RecentActivity.create({
      user: bill.user._id,
      actionType: action === 'Approved' ? 'withdraw_approved' : 'withdraw_rejected',
      description: `${action} withdraw request for bill (${bill.firmName})`,
      relatedModel: 'Bill',
      relatedId: bill._id,
      actionUrl: `/client/bill/${bill._id}`,
    });

    return res.status(200).json({
      message: action === 'Approved' ? 'Withdraw approved and bill updated' : `Withdraw ${action.toLowerCase()}`,
      bill,
      deleted: false,
    });
  } catch (error) {
    console.error('Error processing withdraw action:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET all remarks for a bill
router.get('/bill/:id/remarks', verifyToken,async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findById(id).populate('remarks.createdBy', 'name email profile role');
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const remarks = [...(bill.remarks || [])].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    return res.status(200).json({
      message: 'Remarks fetched successfully',
      remarks,
    });
  } catch (error) {
    console.error('Error fetching bill remarks:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST add a remark to a bill
router.post('/bill/:id/remarks', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, createdBy } = req.body;

    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: 'Remark text is required' });
    }

    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    let remarkCreator = createdBy || req.userId || null;
    if (remarkCreator) {
      const userExists = await User.findById(remarkCreator);
      if (!userExists) {
        return res.status(404).json({ message: 'Remark creator not found' });
      }
    }

    bill.remarks.push({
      text: String(text).trim(),
      createdBy: remarkCreator,
    });

    await bill.save();

    const updatedBill = await Bill.findById(id).populate('remarks.createdBy', 'name email profile role');
    const latestRemark = updatedBill?.remarks?.[updatedBill.remarks.length - 1] || null;

    return res.status(201).json({
      message: 'Remark added successfully',
      remark: latestRemark,
      remarks: updatedBill?.remarks || [],
    });
  } catch (error) {
    console.error('Error adding bill remark:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router
