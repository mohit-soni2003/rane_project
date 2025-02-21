import React, { useState } from "react";
import "./UserDashboardProfile.css";
import { useAuthStore } from "../../store/authStore";

const UserDashboardProfile = () => {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const { user } = useAuthStore();

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
            <span className="info-value">{user.phoneNo || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">🔑 Your CID Code:</span>
            <span className="info-value">{user.cid}</span>
          </div>
          <div className="info-item">
            <span className="info-label">🏡 Address:</span>
            <span className="info-value">{user.address}</span>
          </div>
          <div className="info-item">
            <span className="info-label">💸 UPI ID:</span>
            <span className="info-value">{user.upi}</span>
          </div>

          {/* Conditional Rendering for GST No or ID Proof */}
          {user.clientType === "Firm" && (
            <div className="info-item">
              <span className="info-label">🪪 GST No:</span>
              <span className="info-value">{user.gstno}</span>
            </div>
          )}
          {user.clientType === "Individual" && (
            <div className="info-item">
              <span className="info-label">📄 ID Proof:</span>
              <span className="info-value">
                {user.idProofType}: {user.idproof}
              </span>
            </div>
          )}
        </div>
      </div> 

      {/* Fullscreen Modal */}
      {isImageOpen && (
        <div className="fullscreen-modal" onClick={() => setIsImageOpen(false)}>
          <img src={user.profile} alt="Full Profile" className="fullscreen-image" />
        </div>
      )}
    </div>
  );
};

export default UserDashboardProfile;
