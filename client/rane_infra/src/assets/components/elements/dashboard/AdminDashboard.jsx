import React, { useState } from "react";
import "./AdminDashboard.css";
import AdminTable from "../../../cards/AdminTable";
import Maintainence from "../../unique_component/Maintainence";

const AdminDashboard = () => {
  const [activeLink, setActiveLink] = useState("Home"); // Default to "Home"
  const links = ["Home", "Profile", , "Bills", "Settings", "Notifications", "Help"];

  // Function to render content dynamically
  const renderContent = () => {
    switch (activeLink) {
      case "Home":
        return (
          <>
            <Maintainence></Maintainence>
          </>
        )
      case "Profile":
        return (
          <>
            <Maintainence></Maintainence>
          </>
        )
      case "Bills":
        return (
          <>
            <h1 className="admin-dashboard-heading">All bills will shown here</h1>
            <div className="admin-dashboard-table-container">
              <AdminTable></AdminTable>
            </div>
          </>
        )
      case "Settings":
        return (
          <>
            <Maintainence></Maintainence>
          </>
        )
      case "Notifications":
        return(
          <>
          <Maintainence></Maintainence>
          </>
        ) 
      case "Help":
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
              className={`admin-dashboard-nav-link ${activeLink === link ? "admin-dashboard-active" : ""
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
        {renderContent()} {/* Render content dynamically */}
      </div>
    </div>
  );
};

export default AdminDashboard;
