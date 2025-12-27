const express = require("express")
const User = require("../models/usermodel")
const Bill = require("../models/billmodel")
const Document = require("../models/documentmodel")
const RecentActivity = require("../models/RecentActivityModel")
const Notification = require("../models/notificationModel")
// const { createNotification } = require("./notificationRoutes")



const router = express.Router();

router.post("/post-bill", async (req, res) => {
  try {
    const { firmName, workArea, loaNo, pdfurl, user, invoiceNo, workDescription, amount } = req.body;

    // Validate required fields
    if (!firmName || !workArea || !loaNo || !pdfurl || !user || !amount) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Check if the referenced user exists
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new bill
    const newBill = new Bill({
      firmName,
      workArea,
      loaNo,
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
    const bill = await Bill.findById(id).populate("user paidby");
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

module.exports = router
