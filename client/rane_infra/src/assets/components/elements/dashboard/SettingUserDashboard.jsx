import React, { useState } from 'react';
import "./SettingUserDashboard.css";
import Button from 'react-bootstrap/Button';
import { useAuthStore } from '../../store/authStore';
import { UPLOAD_PRESET , CLOUD_NAME ,CLOUDINARY_URL_IMAGE } from '../../store/keyStore';

export default function SettingUserDashboard() {
    const { user } = useAuthStore();

    // State to manage user input fields
    const [userData, setUserData] = useState({
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
    });

    // State to manage profile picture preview
    const [profilePic, setProfilePic] = useState(user.profile);
    const [profilefile, setprofilefile] = useState()

    // Handle text input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };
 

    const handleSaveChanges = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
    
        // Prepare the form data
        const { name, email, phoneNo } = userData; // Get the data from state
        const updatedUserData = {
            name,
            email,
            phoneNo,
            id: user._id,
        };
    
        try {
            // Make the API call to the backend
            const response = await fetch("http://localhost:3000/update-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedUserData),
            });
    
            // Handle response
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Failed to update profile");
            }
            
            // Update UI and show success message
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
    };
    
    // Handle profile picture change
    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        setprofilefile(file)
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfilePic(imageUrl);
        }
    };

    
    const handleProfileUpdate = async (e) => {
        const data = new FormData();
        data.append("file", profilefile); // Attach the selected file
        data.append("upload_preset", UPLOAD_PRESET); // Your Cloudinary upload preset
        data.append("cloud_name", CLOUD_NAME); // Your Cloudinary cloud name
    
        try {
            const response = await fetch(CLOUDINARY_URL_IMAGE, {
                method: "POST",
                body: data,
            });
    
            if (!response.ok) {
                throw new Error("Error: " + response.status + " " + response.statusText);
            }
    
            const result = await response.json();
            console.log("Uploaded image URL:", result.url);
            setProfilePic(result.url);  // Set the new profile pic URL
    
            // Update profile picture on the server immediately after state update
            handleProfileUpdateOnServer(result.url);
    
        } catch (err) {
            console.error("Error uploading file:", err);
        }
    };
    
    const handleProfileUpdateOnServer = async (newProfilePic) => {
        try {
            const response = await fetch("http://localhost:3000/update-profile-pic", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: user._id, // Assuming user._id is available
                    profile: newProfilePic, // Send Cloudinary URL
                }),
            });
    
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Failed to update profile");
            }
            console.log(result);
            alert("Profile updated successfully!");
    
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
    };
    
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
                    </tbody>
                </table>
                <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
            </div>
        </div>
    );
}
