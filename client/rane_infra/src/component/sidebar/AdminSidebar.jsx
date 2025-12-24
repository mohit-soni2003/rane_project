// AdminSidebar.jsx
// Styled exactly like ClientSidebar but with ALL Admin routes

import React, { useState, useEffect } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaLayerGroup,
  FaBars,
  FaTimes,
  FaArrowAltCircleRight,
} from "react-icons/fa";
import {
  FiHome,
  FiFileText,
  FiUsers,
  FiBell,
  FiSettings,
  FiHelpCircle,
  FiSend,
  FiDollarSign,
  FiFolder,
  FiClipboard

} from "react-icons/fi";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import LogoutModal from "../models/LogoutModal";
import dummyUser from "../../assets/images/dummyUser.jpeg";
import "../../assets/utility/color_codes.css";

const AdminSidebar = ({ isOpen = true, onCollapse }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  /* ---------- Sync with parent ---------- */
  useEffect(() => {
    setIsSidebarCollapsed(false);
    onCollapse?.(false);
  }, []);

  useEffect(() => {
    onCollapse?.(isSidebarCollapsed);
  }, [location.pathname]);

  const toggleSidebar = () => {
    const val = !isSidebarCollapsed;
    setIsSidebarCollapsed(val);
    onCollapse?.(val);
  };

  const toggleDropdown = (key) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      onCollapse?.(false);
      setTimeout(() => {
        setOpenDropdown(key);
      }, 300);
    } else {
      setOpenDropdown((prev) => (prev === key ? null : key));
    }
  };


  /* ---------- Styles (same as ClientSidebar) ---------- */
  const iconStyle = {
    fontSize: "1.1rem",
    minWidth: "22px",
    textAlign: "center",
    marginRight: "8px",
  };

  const sidebarItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 12px",
    textDecoration: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background-color 0.3s ease, color 0.3s ease",
    color: "var(--sidebar-foreground)",
  };

  const submenuStyle = (open) => ({
    maxHeight: open ? "500px" : "0",
    overflow: "hidden",
    transition: "all 0.4s ease",
    marginLeft: "22px",
    fontSize: "0.9rem",
  });

  const hoverIn = (e) => {
    e.currentTarget.style.backgroundColor = "var(--client-btn-bg)";
    e.currentTarget.style.color = "var(--client-btn-text)";
  };

  const hoverOut = (e) => {
    e.currentTarget.style.backgroundColor = "transparent";
    e.currentTarget.style.color = "var(--sidebar-foreground)";
  };

  return (
    <div
      className=" p-3 d-flex flex-column"
      style={{
        width: isSidebarCollapsed ? "70px" : "260px",
        minHeight: "100vh",
        backgroundColor: "var(--sidebar)",
        transition: "width 0.3s ease",
        overflowY: "auto",
        overflowX: "hidden",
        borderRadius: "15px",
        zIndex: 1050,
        display: isOpen ? "flex" : "none",
      }}
    >


      {/* Toggle */}
      <div
        className={`d-flex ${isSidebarCollapsed ? "justify-content-center" : "justify-content-end"
          }`}
      >
        <button
          onClick={toggleSidebar}
          className="btn p-0"
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "var(--client-btn-bg)",
            color: "#fff",
          }}
        >
          {isSidebarCollapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      {/* Profile */}
      {!isSidebarCollapsed && (
        <div className="text-center mb-3">
          <img
            src={user?.profile || dummyUser}
            alt="Admin"
            className="rounded-circle mb-2"
            style={{ width: 80, height: 80, objectFit: "cover" }}
            onClick={() => navigate("/admin")}
          />
          <div className="fw-semibold">{user?.name}</div>
          <div className="text-muted">CID • {user?.cid}</div>
          <hr />
        </div>
      )}

      {/* ----------- MAIN LINKS ----------- */}

      <Link to="/admin" style={{ textDecoration: "none" }}>
        <div
          style={sidebarItemStyle}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
          className={`d-flex ${isSidebarCollapsed ? "justify-content-center" : ""
            }`}
        >
          <FiHome style={iconStyle} />
          {!isSidebarCollapsed && "Home"}
        </div>
      </Link>

      <Link to="/admin/bill" style={{ textDecoration: "none" }}>
        <div
          style={sidebarItemStyle}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
          className={`d-flex ${isSidebarCollapsed ? "justify-content-center" : ""
            }`}
        >
          <FiFileText style={iconStyle} />
          {!isSidebarCollapsed && "Bills"}
        </div>
      </Link>

      <Link to="/admin/payment-request" style={{ textDecoration: "none" }}>
        <div
          style={sidebarItemStyle}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
          className={`d-flex ${isSidebarCollapsed ? "justify-content-center" : ""
            }`}
        >
          <FiDollarSign style={iconStyle} />
          {!isSidebarCollapsed && "Payment Request"}
        </div>
      </Link>

      {/* ----------- CLIENT ----------- */}
      <div
        style={sidebarItemStyle}
        onClick={() => toggleDropdown("client")}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        className={`d-flex ${isSidebarCollapsed ? "justify-content-center" : "justify-content-between"
          }`}
      >
        <div>
          <FiUsers style={iconStyle} />
          {!isSidebarCollapsed && "Client"}
        </div>
        {!isSidebarCollapsed &&
          (openDropdown === "client" ? <FaChevronUp /> : <FaChevronDown />)}
      </div>
      <div style={submenuStyle(openDropdown === "client")}>
        {!isSidebarCollapsed && (
          <>
            <Link to="/admin/all-client" style={{ textDecoration: "none" }}>
              <div style={sidebarItemStyle}>All Client</div>
            </Link>
            <Link to="/admin/under-dev" style={{ textDecoration: "none" }}>
              <div style={sidebarItemStyle}>Add new Client</div>
            </Link>
          </>
        )}
      </div>
      {/* ----------- Agreement ----------- */}
      <div
        style={sidebarItemStyle}
        onClick={() => toggleDropdown("agreement")}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        className={`d-flex ${isSidebarCollapsed ? "justify-content-center" : "justify-content-between"
          }`}
      >
        <div>
          <FiClipboard style={iconStyle} />
          {!isSidebarCollapsed && "agreement"}
        </div>
        {!isSidebarCollapsed &&
          (openDropdown === "agreement" ? <FaChevronUp /> : <FaChevronDown />)}
      </div>
      <div style={submenuStyle(openDropdown === "agreement")}>
        {!isSidebarCollapsed && (
          <>
            <Link to="/admin/agreement/push" style={{ textDecoration: "none" }}>
              <div style={sidebarItemStyle} >Push  Agreement</div>
            </Link>
            <Link to="/admin/under-dev" style={{ textDecoration: "none" }}>
              <div style={sidebarItemStyle}>Track agreements</div>
            </Link>
          </>
        )}
      </div>



      {/* ----------- DFS ----------- */}
      <div
        style={sidebarItemStyle}
        onClick={() => toggleDropdown("dfs")}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        className={`d-flex ${isSidebarCollapsed
          ? "justify-content-center"
          : "justify-content-between"
          }`}
      >
        <div>
          <FiFolder style={iconStyle} />
          {!isSidebarCollapsed && "DFS"}
        </div>

        {!isSidebarCollapsed &&
          (openDropdown === "dfs" ? <FaChevronUp /> : <FaChevronDown />)}
      </div>

      <div style={submenuStyle(openDropdown === "dfs")}>
        {!isSidebarCollapsed && (
          <>
            <Link to="/admin/dfsrequest" style={{ textDecoration: "none" }}>
              <div style={sidebarItemStyle}>
                Document assigned to me
              </div>
            </Link>
          </>
        )}
      </div>


      {!isSidebarCollapsed && (
        <div style={submenuStyle(openDropdown === "dfs")}>
          <Link to="/admin/dfsrequest" style={{ textDecoration: "none" }}>
            <div style={sidebarItemStyle}>
              Document assigned to me
            </div>
          </Link>
        </div>
      )}



      {/* ----------- PUSH DOCUMENT ----------- */}
      <div
        style={sidebarItemStyle}
        onClick={() => toggleDropdown("push")}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        className={`d-flex ${isSidebarCollapsed ? "justify-content-center" : "justify-content-between"
          }`}
      >
        <div>
          <FiSend style={iconStyle} />
          {!isSidebarCollapsed && "Push Document"}
        </div>
        {!isSidebarCollapsed &&
          (openDropdown === "push" ? <FaChevronUp /> : <FaChevronDown />)}
      </div>
      {!isSidebarCollapsed && (
        <div style={submenuStyle(openDropdown === "push")}>
          <Link to="/admin/push-document">
            <div style={sidebarItemStyle}>
              <FaArrowAltCircleRight style={iconStyle} /> Push New
            </div>
          </Link>
          <Link to="/admin/push-document/by-me">
            <div style={sidebarItemStyle}>
              <FaArrowAltCircleRight style={iconStyle} /> By Me
            </div>
          </Link>
        </div>
      )}

      {/* ----------- SALARY ----------- */}
      <div
        style={sidebarItemStyle}
        onClick={() => toggleDropdown("salary")}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        className={`d-flex ${isSidebarCollapsed
          ? "justify-content-center"
          : "justify-content-between"
          }`}
      >
        <div>
          <FiDollarSign style={iconStyle} />
          {!isSidebarCollapsed && "Salary"}
        </div>

        {!isSidebarCollapsed &&
          (openDropdown === "salary" ? <FaChevronUp /> : <FaChevronDown />)}
      </div>

      <div style={submenuStyle(openDropdown === "salary")}>
        {!isSidebarCollapsed && (
          <>
            <Link
              to="/admin/salary/all-client-list"
              style={{ textDecoration: "none" }}
            >
              <div style={sidebarItemStyle}>
                Pay Salary
              </div>
            </Link>
          </>
        )}
      </div>


      {/* ----------- NOTIFICATIONS ----------- */}
      <Link to="/admin/notifications" style={{ textDecoration: "none" }}>
        <div
          style={sidebarItemStyle}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
          className={`d-flex ${isSidebarCollapsed ? "justify-content-center" : ""
            }`}
        >
          <FiBell style={iconStyle} />
          {!isSidebarCollapsed && "Notifications"}
        </div>
      </Link>

      {/* ----------- IMPORTANT ROUTES ----------- */}
      <div
        style={sidebarItemStyle}
        onClick={() => toggleDropdown("important")}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        className={`d-flex ${isSidebarCollapsed
            ? "justify-content-center"
            : "justify-content-between"
          }`}
      >
        <div>
          <FaLayerGroup style={iconStyle} />
          {!isSidebarCollapsed && "Important Routes"}
        </div>

        {!isSidebarCollapsed &&
          (openDropdown === "important" ? <FaChevronUp /> : <FaChevronDown />)}
      </div>

      <div style={submenuStyle(openDropdown === "important")}>
        {!isSidebarCollapsed && (
          <>
            <Link to="/admin/danger/all-user" style={{ textDecoration: "none" }}>
              <div style={sidebarItemStyle}>All User Details</div>
            </Link>

            <Link to="/admin/danger/all-dfs" style={{ textDecoration: "none" }}>
              <div style={sidebarItemStyle}>All DFS Details</div>
            </Link>

            <Link to="/admin/danger/all-documents" style={{ textDecoration: "none" }}>
              <div style={sidebarItemStyle}>All Documents</div>
            </Link>
          </>
        )}
      </div>



      {/* ----------- SETTINGS ----------- */}
      <Link to="/admin/setting" style={{ textDecoration: "none" }}>
        <div
          style={sidebarItemStyle}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
          className={`d-flex ${isSidebarCollapsed ? "justify-content-center" : ""
            }`}
        >
          <FiSettings style={iconStyle} />
          {!isSidebarCollapsed && "Setting"}
        </div>
      </Link>

      {/* ----------- HELP ----------- */}
      <Link to="/admin/under-dev" style={{ textDecoration: "none" }}>
        <div
          style={sidebarItemStyle}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
          className={`d-flex ${isSidebarCollapsed ? "justify-content-center" : ""
            }`}
        >
          <FiHelpCircle style={iconStyle} />
          {!isSidebarCollapsed && "Help"}
        </div>
      </Link>

      {/* ----------- LOGOUT ----------- */}
      <div
        className="mt-auto"
        style={sidebarItemStyle}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        onClick={() => setShowLogoutModal(true)}
      >
        <FaSignOutAlt style={iconStyle} />
        {!isSidebarCollapsed && "Logout"}
      </div>

      <LogoutModal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
};

export default AdminSidebar;

