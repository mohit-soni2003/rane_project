import React, { useState } from "react";
import "./UserDashboard.css";
import "../../../utility/syle.css"
import BillbookForm from "../BillbookForm";
import BillShowTable from "../../../cards/BillShowTable";
import Maintainence from "../../unique_component/Maintainence";
import { useAuthStore } from "../../store/authStore";
import UserDashboardProfile from "./UserDashboardProfile";
import LogoutModel from "../../../cards/models/LogoutModel";
import SettingUserDashboard from "./SettingUserDashboard";
import PaymentReqUserDash from "./PaymentReqUserDash";
import PaymentStatusTable from "../../../cards/PaymentStatusTable";
import Support from "../Support";
import ChangePass from "../ChangePass";
import TransactionHistoryUser from "./TransactionHistoryUser";

const UserDashboard = () => {
  const { user } = useAuthStore();
  const [activeLink, setActiveLink] = useState("Profile");
  const [show, setShow] = useState(false);
  const [isOpen, setIsOpen] = useState(window.innerWidth > 500);
  const [paymentDropdown, setPaymentDropdown] = useState(false); // Controls dropdown

  const links = [
    "Profile",
    "My Bills",
    "Upload Bill",
    "Payment",
    "Transactions History",
    "Settings",
    "Support",
    "Change Password",
    "Logout",
  ];

  // Function to render content dynamically
  const renderContent = () => {
    switch (activeLink) {
      case "Profile":
        return (
          <>
            <div className="hamburger-container"> </div>
            <div className="user-dashboard-sidebar-heading">Profile</div>
            <UserDashboardProfile />
          </>
        );
      case "My Bills":
        return (
          <>
                      <div className="hamburger-container"> </div>

            <div className="user-dashboard-sidebar-heading">My Bills</div>
            <div className="user-dashboard-table">
              <BillShowTable userid={user._id} />
            </div>
          </>
        );
      case "Upload Bill":
        return (
          <>
                      <div className="hamburger-container"> </div>

            <div className="user-dashboard-sidebar-heading">Upload Bill</div>
            <BillbookForm />
          </>
        );
      case "Payment History":
        return (
          <>
            <Maintainence />
          </>
        );
      case "Payment Request":
        return (
          <>
                      <div className="hamburger-container"> </div>

            <div className="user-dashboard-sidebar-heading">Request Payment</div>
            <PaymentReqUserDash />
          </>
        );
      case "Payment Status":
        return (
          <>
                      <div className="hamburger-container"> </div>

            <div className="user-dashboard-sidebar-heading">Payment Status</div>
            <PaymentStatusTable />
          </>
        );
      case "Transactions History":
        return (
          <>
                      <div className="hamburger-container"> </div>

            <div className="user-dashboard-sidebar-heading">Transactions History</div>
            <TransactionHistoryUser />
          </>
        );
      case "Settings":
        return (
          <>
                      <div className="hamburger-container"> </div>

            <div className="user-dashboard-sidebar-heading">Update Your Profile</div>
            <SettingUserDashboard />
          </>
        );
      case "Change Password":
        return (
          <>
                      <div className="hamburger-container"> </div>

            <div className="user-dashboard-sidebar-heading">Change Your Password</div>
            <ChangePass/>
          </>
        );
      case "Support":
        return (
          <>
                      <div className="hamburger-container"> </div>

                      <div className="user-dashboard-sidebar-heading">Contact Rane And Rane's Sons</div>

            <div className="hamburger-container"> </div>
            <Support />;
          </>
        )
      default:
        return (
          <>
                      <div className="user-dashboard-sidebar-heading">Profile</div>

            <h1 className="upload-bill-heading">Profile</h1>
            <UserDashboardProfile />
          </>
        );
    }
  };

  // Logout Click Handler
  const handleLogoutClick = () => {
    setShow(true);
  };

  const handleclose = () => {
    if (window.innerWidth < 500) {
      setIsOpen(false);
    }
  };

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
            ) : link === "Payment" ? (
              <div key={link} className={`payment-section ${paymentDropdown ? "expanded" : ""}`}>
                <button
                  className="user-dashboard-nav-link"
                  onClick={() => setPaymentDropdown(!paymentDropdown)}
                >
                  {link} {paymentDropdown ? "▲" : "▼"}
                </button>
                {paymentDropdown && (
                  <div className="dropdown-container">
                    {["Payment Request", "Payment Status", "Payment History"].map(
                      (subLink) => (
                        <button
                          key={subLink}
                          className={`dropdown-item ${activeLink === subLink ? "user-dashboard-active" : ""
                            }`}
                          onClick={() => {
                            setActiveLink(subLink);
                            setPaymentDropdown(false);
                            handleclose();
                          }}
                        >
                          {subLink}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                key={link}
                className={`user-dashboard-nav-link ${activeLink === link ? "user-dashboard-active" : ""
                  }`}
                onClick={() => {
                  setActiveLink(link);
                  handleclose();
                }}
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
