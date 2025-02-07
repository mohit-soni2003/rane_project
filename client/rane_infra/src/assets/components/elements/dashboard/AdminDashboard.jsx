import React, { useState } from "react";
import "./AdminDashboard.css";
import AdminTable from "../../../cards/AdminTable";
import Maintainence from "../../unique_component/Maintainence";
import ClientList from "./ClientList";
import { useAuthStore } from "../../store/authStore";
import AdminProfile from "./AdminProfile";
import LogoutModel from "../../../cards/models/LogoutModel";
import SettingUserDashboard from "./SettingUserDashboard";
import PaymentRequestTable from "../../../cards/tables/PaymentRequestTable";
const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [activeLink, setActiveLink] = useState("Home"); // Default to "Home"
  const [show, setShow] = useState(false); // Control Logout Modal

  const links = ["Home", "Profile", "Bills", "Clients","Payment Requests", "Settings", "Notifications", "Help", "Logout"];

  // Function to render content dynamically
  const renderContent = () => {
    switch (activeLink) {
      case "Home":
        return <Maintainence />;
      case "Profile":
        return (
          <>
            <h1 className="admin-dashboard-heading">Admin Pannel</h1>
             <AdminProfile />;
              
          </>
        );
      case "Bills":
        return (
          <>
            <h1 className="admin-dashboard-heading">All bills will be shown here</h1>
            <div className="admin-dashboard-table-container">
              <AdminTable />
            </div>
          </>
        );
      case "Clients":
        return (
          <>
            <h1 className="admin-dashboard-heading">All Your Clients will be shown here.</h1>
            <ClientList />
          </>
        );
        
      case "Payment Requests":
        return (
          <>
            <h1 className="admin-dashboard-heading">All Your Clients will be shown here.</h1>
            <PaymentRequestTable/>
            </>
        );
        
      case "Settings":
        return (
          <>
            <h1 className="admin-dashboard-heading">Update your Profile :</h1>
            <SettingUserDashboard/>
          </>
        );
      case "Notifications":
      case "Help":
        return <Maintainence />;
      default:
        return <p>Select a page from the sidebar to get started.</p>;
    }
  };

  // Logout Click Handler
  const handleLogoutClick = () => {
    setShow(true); // Show logout modal
  };

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <div className="admin-dashboard-sidebar">
        <div className="admin-dashboard-profile-section">
          <img
            src={user.profile}
            alt="Profile"
            className="admin-dashboard-profile-image"
          />
          <h3 className="admin-dashboard-username">{user.name}</h3>
        </div>
        <nav className="admin-dashboard-nav-links">
          {links.map((link) =>
            link === "Logout" ? (
              <button key={link} className="admin-dashboard-nav-link" onClick={handleLogoutClick}>
                {link}
              </button>
            ) : (
              <button
                key={link}
                className={`admin-dashboard-nav-link ${activeLink === link ? "admin-dashboard-active" : ""}`}
                onClick={() => setActiveLink(link)}
              >
                {link}
              </button>
            )
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="admin-dashboard-content">{renderContent()}</div>

      {/* Logout Confirmation Modal */}
      {show && <LogoutModel show={show} onClose={() => setShow(false)} />}
    </div>
  );
};

export default AdminDashboard;
