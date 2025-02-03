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
    console.log("Update CID route hitted...");
    const { id } = req.params;
    const { cid } = req.body;

    console.log("ID:", id, "New CID:", cid);
    try {
        console.log("ID:", id, "New CID:", cid);

        // Check if user exists before updating
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the user's LOA
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { cid: cid },
            { new: true } // Return the updated document
        );

        console.log("User LOA updated:", updatedUser);
        res.status(200).json({ message: 'LOA updated successfully', user: updatedUser });
    } catch (error) {
        console.error("Error updating LOA:", error.message);
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
    try {
        const { name, email, phoneNo,id} = req.body;

        // Validate if the user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update only the provided fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNo) user.phoneNo = phoneNo;
        // Save the updated user
        await user.save();

        res.json({ message: "Profile Pic successfully", user });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
