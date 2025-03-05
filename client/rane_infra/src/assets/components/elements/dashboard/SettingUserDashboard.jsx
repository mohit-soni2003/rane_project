import React, { useState, useEffect } from "react";
import "./SettingUserDashboard.css";
import Button from "react-bootstrap/Button";
import { useAuthStore } from "../../store/authStore";
import { UPLOAD_PRESET, CLOUD_NAME, CLOUDINARY_URL_IMAGE, backend_url } from "../../store/keyStore";

export default function SettingUserDashboard() {
    const { user, setUser } = useAuthStore();

    // State to manage user input fields
    const [userData, setUserData] = useState({
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
        address: user.address,
        clientType: user.clientType, // Default selection
        gstno: user.gstno,
        idproof: user.idproof,
        idProofType: user.idProofType,
        upi: user.upi,
        ifscCode: user.ifscCode,
        bankName: user.bankName,
        accountNo: user.accountNo
    });

    // State to manage profile picture preview
    const [profilePic, setProfilePic] = useState(user.profile);
    const [profilefile, setProfileFile] = useState(null);

    // State to handle loading indicator
    const [loading, setLoading] = useState(false);

    // Handle text input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    // Handle client type selection
    const handleUserTypeChange = (e) => {
        setUserData({ ...userData, clientType: e.target.value, gstno: "", idproof: "" });
    };

    // Handle profile picture change
    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileFile(file);
            const imageUrl = URL.createObjectURL(file);
            setProfilePic(imageUrl);
        }
    };

    // Upload profile picture
    const handleProfileUpdate = async () => {
        if (!profilefile) {
            alert("Please select a file before uploading.");
            return;
        }

        const data = new FormData();
        data.append("file", profilefile);
        data.append("upload_preset", UPLOAD_PRESET);
        data.append("cloud_name", CLOUD_NAME);

        try {
            const response = await fetch(CLOUDINARY_URL_IMAGE, { method: "POST", body: data });

            if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);

            const result = await response.json();
            setProfilePic(result.url);
            handleProfileUpdateOnServer(result.url);
        } catch (err) {
            console.error("Error uploading file:", err);
        }
    };

    const handleProfileUpdateOnServer = async (newProfilePic) => {
        try {
            const response = await fetch(`${backend_url}/update-profile-pic`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: user._id, profile: newProfilePic }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Failed to update profile");

            setUser((prev) => ({ ...prev, profile: newProfilePic })); // Update global state
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
    };

    // Handle form submission
    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setLoading(true);

        const updatedUserData = {
            ...userData,
            gstno: userData.clientType === "Firm" ? userData.gstno : null,
            idproof: userData.clientType === "Individual" ? userData.idproof : null,
            id: user._id,
        };

        try {
            const response = await fetch(`${backend_url}/update-profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUserData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Failed to update profile");

            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const isFirm = userData.clientType === "Firm";
    const isIndividual = userData.clientType === "Individual";

    // Revoke object URL on component unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            if (profilePic) URL.revokeObjectURL(profilePic);
        };
    }, [profilePic]);

    return (
        <div className="user-setting-dashboard">
            {/* Profile Picture Update Section */}
            <div className="profile-update-user">
                <div className="user-setting-profile-image">
                    <img src={profilePic} alt="User Profile" />
                </div>
                <div className="profile-update-container">
                    <input type="file" accept="image/*" onChange={handleProfilePicChange} />
                    <Button variant="primary" onClick={handleProfileUpdate}>Upload</Button>
                </div>
            </div>

            {/* User Profile Update Form */}
            <div className="user-setting-form">
                <h2>Update Profile</h2>
                <table>
                    <tbody>
                        <tr>
                            <td><label>Name</label></td>
                            <td><input type="text" name="name" value={userData.name} onChange={handleInputChange} /></td>
                        </tr>
                        <tr>
                            <td><label>Email</label></td>
                            <td><input type="email" name="email" value={userData.email} onChange={handleInputChange} /></td>
                        </tr>
                        <tr>
                            <td><label>Phone No</label></td>
                            <td><input type="text" name="phoneNo" value={userData.phoneNo} onChange={handleInputChange} /></td>
                        </tr>
                        <tr>
                            <td><label>Address</label></td>
                            <td><input type="text" name="address" value={userData.address} onChange={handleInputChange} /></td>
                        </tr>
                        <tr>
                            <td><label>UPI Id : </label></td>
                            <td><input type="text" name="upi" value={userData.upi} onChange={handleInputChange} /></td>
                        </tr>
                        <tr>
                            <td><label>Client Type</label></td>
                            <td>
                                <select name="clientType" value={userData.clientType} onChange={handleUserTypeChange}>
                                    <option value="">Select</option>
                                    <option value="Individual">Individual</option>
                                    <option value="Firm">Firm</option>
                                </select>
                            </td>
                        </tr>

                        {/* Conditionally render GST No for Firms */}
                        {isFirm && (
                            <>
                                <tr>
                                    <td><label>GST No</label></td>
                                    <td><input type="text" name="gstno" value={userData.gstno} onChange={handleInputChange} /></td>
                                </tr>
                                <tr>
                                    <td><label>Bank Name</label></td>
                                    <td><input type="text" name="bankName" value={userData.bankName} onChange={handleInputChange} /></td>
                                </tr>
                                <tr>
                                    <td><label>IFSC Code</label></td>
                                    <td><input type="text" name="ifscCode" value={userData.ifscCode} onChange={handleInputChange} /></td>
                                </tr>
                                <tr>
                                    <td><label>Account Number</label></td>
                                    <td><input type="text" name="accountNo" value={userData.accountNo} onChange={handleInputChange} /></td>

                                </tr>
                            </>
                        )}

                        {/* Conditionally render ID Proof for Individuals */}
                        {isIndividual && (
                            <>
                                <tr>
                                    <td><label>ID Type</label></td>
                                    <td>
                                        <select name="idProofType" value={userData.idProofType} onChange={handleInputChange}>
                                            <option value="">Select</option>
                                            <option value="Aadhar">Aadhar</option>
                                            <option value="PAN">PAN</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td><label>ID Proof</label></td>
                                    <td><input type="text" name="idproof" value={userData.idproof} onChange={handleInputChange} /></td>
                                </tr>
                            </>
                        )}

                    </tbody>
                </table>
                <Button variant="primary" onClick={handleSaveChanges} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}
