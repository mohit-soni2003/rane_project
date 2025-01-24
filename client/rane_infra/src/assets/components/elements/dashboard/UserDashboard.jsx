import React, { useState } from "react";
import "./UserDashboard.css";
import BillbookForm from "../BillbookForm";
import BillShowTable from "../../../cards/BillShowTable";
import Maintainence from "../../unique_component/Maintainence";
import { useAuthStore } from "../../store/authStore";

const UserDashboard = () => {
  const {user} = useAuthStore()
  const [activeLink, setActiveLink] = useState("Overview"); // Default to "Overview"
  const links = ["Profile","My Bills", "Upload Bill", "Payment Updates", "Settings", "Support"];

  // Function to render content dynamically
  const renderContent = () => {
    switch (activeLink) {
      case "Profile":
        return (
          <>
          <h1 className="upload-bill-heading"> Profile</h1>
            <div className="user-dashboard-table">Your Profile Data will Shown here</div>
          </>
        );
      case "My Bills":
        return (
          <>
          <h1 className="upload-bill-heading"> Bill Uploaded By You</h1>
            <div className="user-dashboard-table"><BillShowTable></BillShowTable></div>
          </>
        );
      case "Upload Bill":
        return <BillbookForm/>
      case "Payment Updates":
        return(
          <>
          <Maintainence></Maintainence>
          </>
        ) 
      case "Settings":
        return(
          <>
          <Maintainence></Maintainence>
          </>
        ) 
      case "Support":
        return(
          <>
          <Maintainence></Maintainence>
          </>
        ) 
      default:
        return <p>Select a page from the sidebar to get started.</p>;
    }
  };

  return (
    <div className="user-dashboard-container">
      {/* Sidebar */}
      <div className="user-dashboard-sidebar">
        <div className="user-dashboard-profile-section">
          <img
            src="/rane.webp"
            alt="User Profile"
            className="user-dashboard-profile-image"
          />
          <h3 className="user-dashboard-username">{user.name}</h3>
        </div>
        <nav className="user-dashboard-nav-links">
          {links.map((link) => (
            <button
              key={link}
              className={`user-dashboard-nav-link ${
                activeLink === link ? "user-dashboard-active" : ""
              }`}
              onClick={() => setActiveLink(link)}
            >
              {link}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="user-dashboard-content">
        {renderContent()} {/* Render content dynamically */}
      </div>
    </div>
  );
};

export default UserDashboard;
