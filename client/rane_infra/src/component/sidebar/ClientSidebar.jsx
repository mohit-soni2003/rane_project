import React, { useState } from 'react';
import {
  FaHome, FaFileInvoiceDollar, FaHistory, FaFileAlt,
  FaUserCog, FaHeadset, FaSignOutAlt, FaChevronDown, FaChevronUp, FaArrowAltCircleRight, FaMoneyBillWave
} from 'react-icons/fa';
import { BsCardChecklist } from 'react-icons/bs';
import { MdPayment } from 'react-icons/md';
import dummyUser from "../../assets/images/dummyUser.jpeg";
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import LogoutModal from '../models/LogoutModal';





const ClientSidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuthStore();
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const submenuStyle = (isOpen) => ({
    maxHeight: isOpen ? '500px' : '0',
    overflow: 'hidden',
    transition: 'all 0.4s ease',
    marginLeft: '20px',
    fontSize: '0.9rem',
    color: '#d1d1d1',
    backgroundColor: "rgba(255, 255, 255, 0.1)"
  });

  const sidebarItemStyle = {
    padding: '8px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };


  return (
    <div
      className="text-white vh-100 p-3 position-fixed top-0 start-0 d-flex flex-column"
      style={{
        width: '260px',
        zIndex: 1045,
        backgroundColor: "var(--user-sidebar-color)",
        display: isOpen ? 'flex' : 'none',
      }}
    >
      {/* Close Button for Mobile */}
      <div className="d-md-none text-end mb-3">
        <button
          className="btn btn-sm"
          style={{ backgroundColor: 'gray', fontWeight: 'bold' }}
          onClick={toggleSidebar}
        >

        </button>
      </div>

      {/* Profile Section */}
      <div className="text-center mb-3">
        <img
          src={user?.profile || dummyUser}
          className="rounded-circle mb-3"
          alt="Profile"
          style={{ width: "80px", height: "80px", objectFit: "cover" }}
        />
        <div className='fs-6 fw-bolder mb-1' >{user.name}</div>
        <div className="fs-6 text-secondary fw-semibold">{user?.cid || "Not Assigned"}</div>
        <hr className="text-light" />
      </div>

      {/* Home */}
      <div className="d-flex align-items-center sidebar-item" style={sidebarItemStyle}>
        <FaHome className="me-2" />
        <Link to="/client" style={{ textDecoration: 'none', color: 'inherit' }}>
          Home
        </Link>

      </div>

      {/* Dropdown: Bill */}
      <div className="">
        <div
          onClick={() => toggleDropdown("bill")}
          className="d-flex justify-content-between align-items-center sidebar-item"
          style={sidebarItemStyle}
        >
          <span><FaFileInvoiceDollar className="me-2" /> Bill</span>
          {openDropdown === "bill" ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <div style={submenuStyle(openDropdown === "bill")}>
          <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}> <FaArrowAltCircleRight className="me-2" />
            <Link to="/client/my-bill" style={{ textDecoration: 'none', color: 'inherit' }}>
              My Bills
            </Link>
          </div>
          <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" />
            <Link to="/client/upload-bill" style={{ textDecoration: 'none', color: 'inherit' }}>
              Upload Bill
            </Link>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="">
        <div
          onClick={() => toggleDropdown("payment")}
          className="d-flex justify-content-between align-items-center sidebar-item"
          style={sidebarItemStyle}
        >
          <span><MdPayment className="me-2" /> Payment</span>
          {openDropdown === "payment" ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <div style={submenuStyle(openDropdown === "payment")}>
          <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" />
            <Link to="/client/payment-request" style={{ textDecoration: 'none', color: 'inherit' }}>
              Payment Request
            </Link>
          </div>
          <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" />
            <Link to="/client/my-payment-request" style={{ textDecoration: 'none', color: 'inherit' }}>
              Payment Request Status
            </Link>
          </div>        </div>
      </div>

      {/* Transactions */}
      <div className="">
        <div
          onClick={() => toggleDropdown("transaction")}
          className="d-flex justify-content-between align-items-center sidebar-item"
          style={sidebarItemStyle}
        >
          <span><FaHistory className="me-2" /> Transactions</span>
          {openDropdown === "transaction" ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <div style={submenuStyle(openDropdown === "transaction")}>
          <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" />
            <Link to="/client/transaction" style={{ textDecoration: 'none', color: 'inherit' }}>
              Bill/IP/IPR
            </Link>
          </div>
          <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" />Overview</div>
        </div>
      </div>

      {/* DFS */}
      <div className="">
        <div
          onClick={() => toggleDropdown("dfs")}
          className="d-flex justify-content-between align-items-center sidebar-item"
          style={sidebarItemStyle}
        >
          <span><BsCardChecklist className="me-2" /> Forward Files - DFS</span>
          {openDropdown === "dfs" ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <div style={submenuStyle(openDropdown === "dfs")}>
          <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" />
            <Link to="/client/upload-document" style={{ textDecoration: 'none', color: 'inherit' }}>
              Upload Document
            </Link>
          </div>
          <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" />
            <Link to="/client/track-dfs/all" style={{ textDecoration: 'none', color: 'inherit' }}>
              Track Document
            </Link>
          </div>
          <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" />
            <Link to="/client/dfsrequest" style={{ textDecoration: 'none', color: 'inherit' }}>
              Document for review
            </Link>
          </div>
        </div>
      </div>

      {/* Document */}
      <div className="d-flex align-items-center sidebar-item" style={sidebarItemStyle}>
        <FaFileAlt className="me-2" />
        <Link to="/client/document/category" style={{ textDecoration: 'none', color: 'inherit' }}>
          Document
        </Link>
      </div>

      {/* Salary */}

      <div className="d-flex align-items-center sidebar-item" style={sidebarItemStyle}>
        <FaMoneyBillWave className="me-2" />
        <Link to="/client/salary" style={{ textDecoration: 'none', color: 'inherit' }}>
          Salary
        </Link>
      </div>

      {/* Settings */}
      <div className="d-flex align-items-center sidebar-item" style={sidebarItemStyle}>
        <FaUserCog className="me-2" />
        <Link to="/client/setting" style={{ textDecoration: 'none', color: 'inherit' }}>
          Setting
        </Link>
      </div>

      {/* Support */}
      <div className="d-flex align-items-center sidebar-item" style={sidebarItemStyle}>
        <FaHeadset className="me-2" />
        <Link to="/client/support" style={{ textDecoration: 'none', color: 'inherit' }}>
          Support
        </Link>
      </div>

      {/* Logout */}
      <div className="mt-auto d-flex align-items-center sidebar-item " onClick={handleLogoutClick}>
        <FaSignOutAlt className="me-2" />
        Logout
      </div>

      <LogoutModal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

    </div>
  );
};

export default ClientSidebar;
