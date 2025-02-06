import React from "react";
import "./UserDashboardProfile.css";
import { useAuthStore } from "../../store/authStore";
import  { useState } from "react";

const UserDashboardProfile = () => {
    const [isImageOpen, setIsImageOpen] = useState(false);
      const {user } = useAuthStore();
    
      return (
        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-header">
              <img
                src={user.profile}
                alt="User Profile"
                className="profile-image"
                onClick={() => setIsImageOpen(true)} // Open fullscreen on click
              />
              <div className="profile-details">
                <h2>{user.name}</h2>
                <p className="profile-email">{user.email}</p>
              </div>
            </div>
            <div className="profile-info">
              <div className="info-item">
                <span className="info-label">📞 Contact No:</span>
                <span className="info-value">{user.phoneno ? user.phoneno : "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">🔑 Your CID Code:</span>
                <span className="info-value">{user.cid}</span>
              </div>
            </div>
          </div>
    
      
          {isImageOpen && (
            <div className="fullscreen-modal" onClick={() => setIsImageOpen(false)}>
              <img src={user.profile} alt="Full Profile" className="fullscreen-image" />
            </div>
          )}
        </div>
      );
      
};

export default UserDashboardProfile;
