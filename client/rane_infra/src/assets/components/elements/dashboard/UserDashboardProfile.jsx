import React, { useState } from "react";
import "./UserDashboardProfile.css";
import { useAuthStore } from "../../../../store/authStore";
import { 
  FaPhoneAlt, FaKey, FaHome, FaUniversity, FaFileInvoice, FaIdCard, FaCreditCard, FaBuilding, FaMoneyCheckAlt 
} from "react-icons/fa";
import { MdAccountBalance } from "react-icons/md";

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
            <span className="info-label"><FaPhoneAlt color="green" /> Contact No:</span>
            <span className="info-value">{user.phoneNo || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FaKey color="goldenrod" /> Your CID Code:</span>
            <span className="info-value">{user.cid}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FaHome color="blue" /> Address:</span>
            <span className="info-value">{user.address}</span>
          </div>
          <div className="info-item">
            <span className="info-label"><FaCreditCard color="purple" /> UPI ID:</span>
            <span className="info-value">{user.upi}</span>
          </div>

          {/* Conditional Rendering for Firm or Individual */}
          {user.clientType === "Firm" && (
            <>
              <div className="info-item">
                <span className="info-label"><FaFileInvoice color="orange" /> GST No:</span>
                <span className="info-value">{user.gstno}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><MdAccountBalance color="teal" /> Bank Name:</span>
                <span className="info-value">{user.bankName}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><FaBuilding color="brown" /> Account Number:</span>
                <span className="info-value">{user.accountNo}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><FaMoneyCheckAlt color="darkgreen" /> IFSC Code:</span>
                <span className="info-value">{user.ifscCode}</span>
              </div>
            </>
          )}
          {user.clientType === "Individual" && (
            <div className="info-item">
              <span className="info-label"><FaIdCard color="red" /> ID Proof:</span>
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
