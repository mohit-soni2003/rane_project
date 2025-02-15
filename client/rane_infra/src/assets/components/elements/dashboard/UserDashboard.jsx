import React, { useState } from "react";
import "./UserDashboard.css";
import BillbookForm from "../BillbookForm";
import BillShowTable from "../../../cards/BillShowTable";
import Maintainence from "../../unique_component/Maintainence";
import { useAuthStore } from "../../store/authStore";
import UserDashboardProfile from "./UserDashboardProfile";
import LogoutModel from "../../../cards/models/LogoutModel";
import SettingUserDashboard from "./SettingUserDashboard";
import PaymentReqUserDash from "./PaymentReqUserDash";
import PaymentStatusTable from "../../../cards/PaymentStatusTable";

const UserDashboard = () => {
  const { user } = useAuthStore();
  const [activeLink, setActiveLink] = useState("Profile"); // Default to "Profile"
  const [show, setShow] = useState(false); // Control Logout Modal
  const [isOpen, setIsOpen] = useState(window.innerWidth > 500); // Sidebar toggle

  const links = [
    "Profile",
    "My Bills",
    "Upload Bill",
    "Payment Request",
    "Payment Status",
    "Settings",
    "Support",
    "Logout",
  ];

  // Function to render content dynamically
  const renderContent = () => {
    switch (activeLink) {
      case "Profile":
        return (
          <>
            <h1 className="upload-bill-heading">Profile</h1>
            <UserDashboardProfile />
          </>
        );
      case "My Bills":
        return (
          <>
            <div className="user-dashboard-table">
              <BillShowTable userid={user._id} />
            </div>
          </>
        );
      case "Upload Bill":
        return (
          <>
            <h1 className="upload-bill-heading">Upload Bill</h1>
            <BillbookForm />;
          </>
        )
        case "Payment Request":
          return(
            <>
            <h1 className="upload-bill-heading">Payment Request</h1>
         <PaymentReqUserDash />;
          </>
        )
        case "Payment Status":
          return(
            <>
            <h1 className="upload-bill-heading">Payment Status</h1>
            <PaymentStatusTable/>
          </>
        ) 
        
      case "Settings":
        return (
          <>
            <h1 className="upload-bill-heading">Update Your Profile :</h1>
            <SettingUserDashboard />
          </>
        );
      case "Support":
        return <Maintainence />;
      default:
        return (
          <>
            <h1 className="upload-bill-heading">Profile</h1>
            <UserDashboardProfile />
          </>
        );
    }
  };

  // Logout Click Handler
  const handleLogoutClick = () => {
    setShow(true); // Show logout modal
  };

  const handleclose = ()=>{
    if(window.innerWidth < 500){
      setIsOpen(false)
    }
  }

  return (
    <div className={`user-dashboard-container ${isOpen ? "sidebar-open" : ""}`}>

      {/* Hamburger Menu */}
      <button className="hamburger-menu" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      {/* Sidebar */}
      <div className={`user-dashboard-sidebar ${isOpen ? "open" : ""}`}>
        <div className="user-dashboard-profile-section">
          <img
            src={user.profile}
            alt="User Profile"
            className="user-dashboard-profile-image"
          />
          <h3 className="user-dashboard-username">{user.name}</h3>
        </div>
        <nav className="user-dashboard-nav-links">
          {links.map((link) =>
            link === "Logout" ? (
              <button
                key={link}
                className="user-dashboard-nav-link"
                onClick={handleLogoutClick}
              >
                {link}
              </button>
            ) : (
              <button
                key={link}
                className={`user-dashboard-nav-link ${activeLink === link ? "user-dashboard-active" : ""
                  }`}
                onClick={() => {setActiveLink(link);handleclose();}}
              >
                {link}
              </button>
            )
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="user-dashboard-content">{renderContent()}</div>

      {/* Logout Confirmation Modal */}
      {show && <LogoutModel show={show} onClose={() => setShow(false)} />}
    </div>
  );
};

export default UserDashboard;
