const express = require("express")
const User = require("../models/usermodel")
const Bill = require("../models/billmodel")


const router = express.Router();

router.post("/post-bill", async (req, res) => {
  console.log("Post bill route hitted....")
  try {
    const { firmName, workArea, loaNo, pdfurl, user, invoiceNo, workDescription } = req.body;
    // Log the fields
    console.log("Received Data:");
    console.log("Firm Name:", firmName);
    console.log("Work Area:", workArea);
    console.log("LOA No:", loaNo);
    console.log("PDF URL:", pdfurl);
    console.log("User ID:", user);
    console.log("Invoice No:", invoiceNo);
    console.log("Work Description:", workDescription);

    // Validate required fields
    if (!firmName || !workArea || !loaNo || !pdfurl || !user) {
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
    });
    // Save the bill to the database
    const savedBill = await newBill.save();
    res.status(201).json({ message: "Bill created successfully", bill: savedBill });
  } catch (error) {
    // Handle duplicate LOA number
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate loaNo detected" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get('/mybill/:id', async (req, res) => {
  console.log("Show my bill route hit");

  const { id } = req.params;
  console.log("User ID:", id);

  try {
    // Find bills for the given user ID
    const bills = await Bill.find({ user: id });

    console.log("Fetched Bills:", bills);

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
  console.log("show my bill route hitted")

  try {
    // Find bills that match the user's ID
    const bills = await Bill.find({}).populate("user");
    console.log(bills)
    if (bills.length > 0) {
      res.status(200).json(bills);
    } else {
      res.json({ error: 'No bills found for this user' });
    }
  } catch (error) {
    res.json({ error: 'Server error', details: error.message });
  }
});

router.get('/bill/:id', async (req, res) => {
  console.log("show particular id bill route hitted")
  const {id} = req.params

  try {
    // Find bills that match the user's ID
    const bill = await Bill.findById(id).populate("user");
    console.log(bill)
    if (bill) {
      res.status(200).json(bill);
    } else {
      res.json({ error: 'No bills found for this user' });
    }
  } catch (error) {
    res.json({ error: 'Server error', details: error.message });
  }
});

router.get('/bill/update-payment/:id', async (req, res) => {
  console.log("Update bill payment stasus route hitted")
  const {status} = req.body
  const {id} = req.params

  try {
    // Find bills that match the user's ID
    const bill = await Bill.findById(id).populate("user");
    console.log(bill)
    if (bill) {
      res.status(200).json(bill);
    } else {
      res.json({ error: 'No bills found for this user' });
    }
  } catch (error) {
    res.json({ error: 'Server error', details: error.message });
  }
});

router.put('/bill/update-payment/:id', async (req, res) => {
  console.log("Update bill payment status route hit");
  const { status } = req.body; // Extract the paymentStatus value from the request body
  const { id } = req.params; // Extract the bill ID from the request parameters

  try {
    // Find and update the bill with the new payment status
    const updatedBill = await Bill.findByIdAndUpdate(
      id, 
      { paymentStatus: status }, // Update the paymentStatus field
      { new: true } // Return the updated document
    ).populate("user"); // Populate the "user" field if needed

    if (updatedBill) {
      console.log("Bill updated:", updatedBill);
      res.status(200).json(updatedBill); // Respond with the updated bill
    } else {
      res.status(404).json({ error: 'No bill found with this ID' }); // If no bill is found, return a 404 error
    }
  } catch (error) {
    console.error("Error updating bill:", error);
    res.status(500).json({ error: 'Server error', details: error.message }); // Handle server errors
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


module.exports = router
