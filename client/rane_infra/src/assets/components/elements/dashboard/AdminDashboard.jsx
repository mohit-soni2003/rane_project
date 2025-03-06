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
import AllUser from "./Admin/AllUser";
import CreateUser from "./Admin/CreateUser";
import ChangePass from "../ChangePass"


const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [activeLink, setActiveLink] = useState("Home"); // Default to "Home"
  const [show, setShow] = useState(false); // Control Logout Modal
  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown for "Important Routes"
  const [selectedRoute, setSelectedRoute] = useState(""); // Track selected route

  const links = ["Profile", "Bills", "Clients", "Payment Requests", "Important Routes", "Settings", "Notifications", "Help", "Logout" , "Change Password"];
  const routeLinks = [ "Create New User", "All user"]; // Dropdown Links

  // Function to render content dynamically
  const renderContent = () => {
    if (activeLink === "Important Routes" && selectedRoute) {
      switch (selectedRoute) {
        
        case "All user":
          return (
            <>
              <h1 className="admin-dashboard-heading">All User</h1>
              <AllUser />;
            </>
          )
        case "Create New User":
          return (
            <>
              <h1 className="admin-dashboard-heading">Create New User</h1>
              <CreateUser />;
            </>
          )
      }
    }

    switch (activeLink) {
      case "Profile":
        return (
          <>
            <h1 className="admin-dashboard-heading">Admin Panel</h1>
            <AdminProfile />
          </>
        );
      case "Bills":
        return (
          <>
            <h1 className="admin-dashboard-heading">All Bills</h1>
            <div className="admin-dashboard-table-container">
              <AdminTable />
            </div>
          </>
        );
      case "Clients":
        return (
          <>
            <h1 className="admin-dashboard-heading">All Clients</h1>
            <ClientList />
          </>
        );
      case "Payment Requests":
        return (
          <>
            <h1 className="admin-dashboard-heading">All Payment Requests</h1>
            <PaymentRequestTable />
          </>
        );
      case "Settings":
        return (
          <>
            <h1 className="admin-dashboard-heading">Update your Profile :</h1>
            <SettingUserDashboard />
          </>
        );
      case "Change Password":
        return (
          <>
          <h1 className="admin-dashboard-heading">Change Password:</h1>
          <ChangePass />
          </>
        )
      case "Help":
        return <Maintainence />;
      default:
        return (
          <>
            <h1 className="admin-dashboard-heading">Admin Panel</h1>
            <AdminProfile />
          </>
        );
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
            ) : link === "Important Routes" ? (
              <div key={link} className="admin-dashboard-dropdown">
                <button
                  className={`admin-dashboard-nav-link ${dropdownOpen ? "admin-dashboard-active" : ""}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {link} ▼
                </button>
                {dropdownOpen && (
                  <div className="admin-dashboard-dropdown-menu">
                    {routeLinks.map((route) => (
                      <button
                        key={route}
                        className="admin-dashboard-dropdown-item"
                        onClick={() => {
                          setSelectedRoute(route);
                          setActiveLink("Important Routes");
                          setDropdownOpen(false);
                        }}
                      >
                        {route}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                key={link}
                className={`admin-dashboard-nav-link ${activeLink === link ? "admin-dashboard-active" : ""}`}
                onClick={() => {
                  setActiveLink(link);
                  setDropdownOpen(false); // Close dropdown if another link is clicked
                }}
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
