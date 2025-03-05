const express = require("express")
const User = require("../models/usermodel")
const Bill = require("../models/billmodel")


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


router.put("/update-profile-pic", async (req, res) => {
    try {
        const { profile,id} = req.body;

        // Validate if the user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (profile) user.profile = profile;
        // Save the updated user
        await user.save();

        res.json({ message: "Profile Pic successfully", user });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.put("/update-profile", async (req, res) => {
    console.log("Update profile details route hitted .......")
    try {
        const { name, email, phoneNo,id,address,clientType,idproof,gstno,idProofType,upi,bankName,ifscCode,accountNo} = req.body;
        console.log("userType: " + clientType)
        console.log("IDPROOF: " + idproof)
        console.log("idProofType: " + idProofType)
        console.log("Bank Name:" +bankName);
        console.log("IFSC Code:"+ ifscCode);
        console.log("Account No:"+ accountNo);

        // Validate if the user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update only the provided fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNo) user.phoneNo = phoneNo;
        if (address) user.address = address;
        if (clientType) user.clientType = clientType;
        if (idproof) user.idproof = idproof;
        if (gstno) user.gstno = gstno;
        if (idProofType) user.idProofType = idProofType;
        if (upi) user.upi = upi;
        if (accountNo) user.accountNo = accountNo;
        if (ifscCode) user.ifscCode = ifscCode;
        if (bankName) user.bankName = bankName;
        // Save the updated user
        await user.save();

        res.json({ message: "Profile Data updated successfully", user });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
