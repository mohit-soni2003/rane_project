import React, { useState } from "react";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [activeLink, setActiveLink] = useState("Overview"); // Default to "Overview"
  const links = ["Overview", "Account", "Messages", "Settings", "Support"];

  // Function to render content dynamically
  const renderContent = () => {
    switch (activeLink) {
      case "Overview":
        return <p>Welcome to your Overview! Here, you can see a summary of your activities.</p>;
      case "Account":
        return <p>Manage your account details and update your information here.</p>;
      case "Messages":
        return <p>Check all your messages and communication in one place.</p>;
      case "Settings":
        return <p>Adjust your preferences and system settings on this page.</p>;
      case "Support":
        return <p>Need help? Visit the Support page for assistance and resources.</p>;
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
            src="https://via.placeholder.com/100"
            alt="User Profile"
            className="user-dashboard-profile-image"
          />
          <h3 className="user-dashboard-username">Jane Smith</h3>
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
        <h1>{activeLink} Page</h1>
        {renderContent()} {/* Render content dynamically */}
      </div>
    </div>
  );
};

export default UserDashboard;
