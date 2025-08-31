import React, { useState } from 'react';
import {
  FaTachometerAlt, FaFileInvoice, FaUserTie, FaChevronDown, FaChevronUp,
  FaTools, FaQuestionCircle, FaBell, FaSignOutAlt, FaFileAlt
} from 'react-icons/fa';
import dummyUser from '../../assets/images/dummyUser.jpeg';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

const StaffSidebar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const { user } = useAuthStore();

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const submenuStyle = (isOpen) => ({
    maxHeight: isOpen ? '500px' : '0',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    marginLeft: '20px',
    fontSize: '0.9rem',
    color: '#ccc',
  });

  const menuItemStyle = {
    textDecoration: 'none',
    color: 'inherit',
  };

  return (
    <div className="d-flex flex-column p-3 staff-sidebar"
      style={{
        width: '260px',
        backgroundColor: '#1e1e2f',
        color: '#f1f1f1',
        height: '100vh',
        overflowY: 'auto',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1040,
      }}>


      {/* Profile Section */}
      <div className="text-center mb-3">
        <img
          src={user.profile || dummyUser}
          alt="Staff"
          className="rounded-circle mb-2"
          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
        />
        <div className='fs-6 fw-bold'>{user.name}</div>
        <div className="fs-6 text-secondary fw-semibold">{user?.cid || "Not Assigned"}</div>
        <hr className="text-light" />
      </div>

      {/* Sidebar Links */}
      <Link to="/staff/home" style={menuItemStyle}>
        <div className="d-flex align-items-center px-2 py-2 rounded hover-effect cursor-pointer">
          <FaTachometerAlt className="me-2" /> Home
        </div>
      </Link>

      <Link to="/staff/bill" style={menuItemStyle}>
        <div className="d-flex align-items-center px-2 py-2 rounded hover-effect cursor-pointer">
          <FaFileInvoice className="me-2" /> Bills
        </div>
      </Link>

      {/* Client Dropdown */}
      <div className="px-2 py-2 rounded cursor-pointer hover-effect" onClick={() => toggleMenu('client')}>
        <div className="d-flex justify-content-between align-items-center">
          <span><FaUserTie className="me-2" /> Client</span>
          {openMenu === 'client' ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <div style={submenuStyle(openMenu === 'client')}>
          <Link to="/staff/all-client" style={menuItemStyle}>
            <div className="py-1">All Client</div>
          </Link>
        </div>
      </div>

      {/* Payment Request Dropdown */}
      <div className="mb-2 px-2 py-2 rounded cursor-pointer hover-effect" onClick={() => toggleMenu('pr')}>
        <div className="d-flex justify-content-between align-items-center">
          <span><FaFileAlt className="me-2" /> Payment Request</span>
          {openMenu === 'pr' ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <div style={submenuStyle(openMenu === 'pr')}>
          <Link to="/staff/payment-request" style={menuItemStyle}>
            <div className="py-1">Resolve Other PR</div>
          </Link>
          <Link to="/staff/request-payment" style={menuItemStyle}>
            <div className="py-1">Make PR</div>
          </Link>
          <Link to="/staff/my-payment-request" style={menuItemStyle}>
            <div className="py-1">Your Personal PR</div>
          </Link>
        </div>
      </div>

      {/* DFS Section Dropdown */}
      <div className="px-2 py-2 rounded cursor-pointer hover-effect" onClick={() => toggleMenu('dfs')}>
        <div className="d-flex justify-content-between align-items-center">
          <span><FaFileAlt className="me-2" /> DFS Section</span>
          {openMenu === 'dfs' ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <div style={submenuStyle(openMenu === 'dfs')}>
          <Link to="/staff/dfsrequest" style={menuItemStyle}>
            <div className="py-1">Assigned Document</div>
          </Link>
          <Link to="/staff/upload-document" style={menuItemStyle}>
            <div className="py-1">Upload Document</div>
          </Link>
          <Link to="/staff/track-dfs/all" style={menuItemStyle}>
            <div className="py-1">Track Document</div>
          </Link>
        </div>
      </div>

      {/* Notification */}
      <Link to="/staff/under-dev" style={menuItemStyle}>
        <div className="d-flex align-items-center px-2 py-2 rounded hover-effect cursor-pointer">
          <FaBell className="me-2" /> Notification
        </div>
      </Link>

      {/* Salary */}
      <Link to="/staff/salary" style={menuItemStyle}>
        <div className="d-flex align-items-center px-2 py-2 rounded hover-effect cursor-pointer">
          <FaFileInvoice className="me-2" /> Salary
        </div>
      </Link>

      {/* Settings */}
      <Link to="/staff/setting" style={menuItemStyle}>
        <div className="d-flex align-items-center px-2 py-2 rounded hover-effect cursor-pointer">
          <FaTools className="me-2" /> Setting
        </div>
      </Link>

      {/* Help */}
      <Link to="/staff/under-dev" style={menuItemStyle}>
        <div className="d-flex align-items-center px-2 py-2 rounded hover-effect cursor-pointer">
          <FaQuestionCircle className="me-2" /> Help
        </div>
      </Link>

      {/* Logout */}
      <div className="mt-auto d-flex align-items-center px-2 py-2 rounded hover-effect cursor-pointer">
        <FaSignOutAlt className="me-2" /> Logout
      </div>

      {/* Hover Effect Style */}
      <style>{`
  .hover-effect:hover {
    background-color: #2e2e4f;
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .staff-sidebar::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
  .staff-sidebar {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
  }
`}</style>

    </div>
  );
};

export default StaffSidebar;
