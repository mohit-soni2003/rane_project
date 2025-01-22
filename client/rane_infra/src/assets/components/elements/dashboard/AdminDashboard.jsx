import React, { useState } from "react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeLink, setActiveLink] = useState("Home"); // Default to "Home"
  const links = ["Home", "Profile", "Settings", "Notifications", "Help"];

  // Function to render content dynamically
  const renderContent = () => {
    switch (activeLink) {
      case "Home":
        return <p>Welcome to the Home page! Here is an overview of your dashboard.</p>;
      case "Profile":
        return <p>This is the Profile page. You can update your personal information here.</p>;
      case "Settings":
        return <p>Manage your preferences and application settings on this page.</p>;
      case "Notifications":
        return <p>View all your notifications and alerts in one place.</p>;
      case "Help":
        return <p>Need assistance? This is the Help page where you can find support resources.</p>;
      default:
        return <p>Select a page from the sidebar to get started.</p>;
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <div className="admin-dashboard-sidebar">
        <div className="admin-dashboard-profile-section">
          <img
            src="/rane.webp"
            alt="Profile"
            className="admin-dashboard-profile-image"
          />
          <h3 className="admin-dashboard-username">Harshvardhan Rane</h3>
        </div>
        <nav className="admin-dashboard-nav-links">
          {links.map((link) => (
            <button
              key={link}
              className={`admin-dashboard-nav-link ${
                activeLink === link ? "admin-dashboard-active" : ""
              }`}
              onClick={() => setActiveLink(link)}
            >
              {link}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="admin-dashboard-content">
        <h1>{activeLink} Page</h1>
        {renderContent()} {/* Render content dynamically */}
      </div>
    </div>
  );
};

export default AdminDashboard;
