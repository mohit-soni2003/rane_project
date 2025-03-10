const express = require("express")
const User = require("../models/usermodel")
const Bill = require("../models/billmodel")
const Payment = require("../models/paymentmodel")


const router = express.Router();

router.post("/post-payment", async (req, res) => {
  console.log("Post Payment route hitted....")
  try {
    const { tender, user, amount,  description, image_url,paymentType  } = req.body;
    console.log("Tender:", tender);
    console.log("User:", user);
    console.log("Amount:", amount);
    console.log("Description:", description);
    console.log("Image:", image_url)
    // Validate required fields
    if (!tender || !amount || !image_url || !user || !paymentType) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Check if the referenced user exists
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (paymentType=="IP" && amount>50000) {
      return res.status(404).json({ message: "Payment Request Failed : You can request only Upto 50,000 Rs. in IP " });
    }
    if (paymentType=="IPR" && amount>10000) {
      return res.status(404).json({ message: "Payment Request Failed : You can request only Upto 10,000 Rs. in IPR " });
    }

    // Create a new Payment
    const newPayment = new Payment({
      tender,
      user,
      amount,
      description,
      paymentType,
      image:image_url
    });
    // Save the bill to the database
    const savedPayment = await newPayment.save();
    res.status(201).json({ message: "Payment created successfully", payment: savedPayment });
  } catch (error) {
    // Handle duplicate LOA number
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate  detected" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get('/my-payment-request/:id', async (req, res) => {
  console.log("show all my payment route hitted ..")
  const { id } = req.params;
  console.log(id)

  try {
    // Find bills that match the user's ID
    const payments = await Payment.find({user:id})
    console.log(payments)
    if (payments.length > 0) {
      res.status(200).json(payments);
    } else {
      res.json({ error: 'No bills found for this user' });
    }
  } catch (error) {
    res.json({ error: 'Server error', details: error.message });
  }
});

router.get('/allpayment', async (req, res) => {
  console.log("show my all payment route hitted")

  try {
    // Find bills that match the user's ID
    const payments = await Payment.find({}).populate("user")
    console.log(payments)
    if (payments.length > 0) {
      res.status(200).json(payments);
    } else {
      res.json({ error: 'No bills found for this user' });
    }
  } catch (error) {
    res.json({ error: 'Server error', details: error.message });
  }
});

router.get('/payment/:id', async (req, res) => {
  console.log("show particular id payment route hitted")
  const {id} = req.params

  try {
    // Find bills that match the user's ID
    const paymenyReq = await Payment.findById(id).populate("user");
    console.log(paymenyReq)
    if (paymenyReq) {
      res.status(200).json(paymenyReq);
    } else {
      res.json({ error: 'No bills found for this user' });
    }
  } catch (error) {
    res.json({ error: 'Server error', details: error.message });
  }
});


router.put("/payment/update/:id", async (req, res) => {
  const { status, refMode, expenseNo ,remark } = req.body;
  let updateFields = { status, refMode, expenseNo , remark};

  // If status is "Paid", add paymentDate field with the current date
  if (status === "Paid") {
    updateFields.paymentDate = new Date();
  }

  try {
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment record not found" });
    }

    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});




// router.put('/bill/update-payment/:id', async (req, res) => {
//   console.log("Update bill payment status route hit");
//   const { status } = req.body; // Extract the paymentStatus value from the request body
//   const { id } = req.params; // Extract the bill ID from the request parameters

//   try {
//     // Find and update the bill with the new payment status
//     const updatedBill = await Bill.findByIdAndUpdate(
//       id, 
//       { paymentStatus: status }, // Update the paymentStatus field
//       { new: true } // Return the updated document
//     ).populate("user"); // Populate the "user" field if needed

//     if (updatedBill) {
//       console.log("Bill updated:", updatedBill);
//       res.status(200).json(updatedBill); // Respond with the updated bill
//     } else {
//       res.status(404).json({ error: 'No bill found with this ID' }); // If no bill is found, return a 404 error
//     }
//   } catch (error) {
//     console.error("Error updating bill:", error);
//     res.status(500).json({ error: 'Server error', details: error.message }); // Handle server errors
//   }
// });

router.delete("/payment/:id", async (req, res) => {

  console.log("DELETE PAYMENT ROUTE HITTED...")
  console.log(req.params)

  try {
    const { id } = req.params;

    // Check if payment exists
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Delete the payment
    await Payment.findByIdAndDelete(id);
    res.json({ message: "Payment deleted successfully" });

  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



module.exports = router
