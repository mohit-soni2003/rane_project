import React, { useState } from 'react';
import {
  FaTachometerAlt, FaFileInvoice, FaUserTie, FaChevronDown, FaChevronUp,
  FaTools, FaQuestionCircle, FaBell, FaSignOutAlt, FaLayerGroup, FaFileAlt, FaMoneyBillWave
} from 'react-icons/fa';
import dummyUser from '../../assets/images/dummyUser.jpeg';
import { Link } from 'react-router-dom';
import { useAuthStore } from "../../store/authStore"
import LogoutModal from '../models/LogoutModal';
const AdminSidebar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const { user } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };


  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const submenuStyle = (isOpen) => ({
    maxHeight: isOpen ? '500px' : '0',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    marginLeft: '20px',
    fontSize: '0.9rem',
    color: '#ccc'
  });

  return (
    <div className="d-flex flex-column vh-100 p-3" style={{ width: '260px', backgroundColor: '#1e1e2f', color: '#f1f1f1' }}>

      {/* Profile Section */}
      <div className="text-center mb-3 mt-2">
        <img
          src={user.profile || dummyUser}
          alt="Admin"
          className="rounded-circle mb-2"
          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
        />
        <div className='fs-6 fw-bolder mb-1' >{user.name}</div>
        <div className="fs-6 text-secondary fw-semibold">{user?.cid || "Not Assigned"}</div>
        <hr className="text-light" />
      </div>

      {/* Home  */}
      <div className="mb-3 d-flex align-items-center cursor-pointer">
        <FaTachometerAlt className="me-2" />
        <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
          Home
        </Link>
      </div>

      {/* Bills */}
      <div className="mb-3 d-flex align-items-center cursor-pointer">
        <FaFileInvoice className="me-2" />
        <Link to="/admin/bill" style={{ textDecoration: 'none', color: 'inherit' }}>
          Bills
        </Link>
      </div>
      {/* payment Request  */}
      <div className="mb-3 d-flex align-items-center cursor-pointer">
        <FaFileInvoice className="me-2" />
        <Link to="/admin/payment-request" style={{ textDecoration: 'none', color: 'inherit' }}>
          Payment Request
        </Link>
      </div>

      {/* Client */}
      <div className="mb-3" onClick={() => toggleMenu('client')}>
        <div className="d-flex justify-content-between align-items-center cursor-pointer">
          <span><FaUserTie className="me-2" /> Client</span>
          {openMenu === 'client' ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <div style={submenuStyle(openMenu === 'client')}>
          <div className="py-1">
            <Link to="/admin/all-client" style={{ textDecoration: 'none', color: 'inherit' }}>
              All Client
            </Link>
          </div>
          <div className="py-1">
            <Link to="/admin/under-dev" style={{ textDecoration: 'none', color: 'inherit' }}>
              Add new Client
            </Link>
          </div>
        </div>
      </div>

      {/* DFS Request */}
      <div className="mb-3" onClick={() => toggleMenu('dfs')}>
        <div className="d-flex justify-content-between align-items-center cursor-pointer">
          <span><FaFileAlt className="me-2" /> DFS</span>
          {openMenu === 'dfs' ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <div style={submenuStyle(openMenu === 'dfs')}>
          <div className="py-1"><Link to="/admin/dfsrequest" style={{ textDecoration: 'none', color: 'inherit' }}>
            Document assigned to me
          </Link></div>
          {/* <div className="py-1">My Forwarded Document</div> */}
        </div>
      </div>

      {/* Push Document */}
      <div className="mb-3" onClick={() => toggleMenu('push')}>
        <div className="d-flex justify-content-between align-items-center cursor-pointer">
          <span><FaFileAlt className="me-2" /> Push Document</span>
          {openMenu === 'push' ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <div style={submenuStyle(openMenu === 'push')}>
          <div className="py-1"><Link to="/admin/push-document" style={{ textDecoration: 'none', color: 'inherit' }}>
            Push new Document
          </Link></div>
        </div>
      </div>
      {/* salary */}
      <div className="mb-3" onClick={() => toggleMenu('salary')}>
        <div className="d-flex justify-content-between align-items-center cursor-pointer">
          <span><FaMoneyBillWave className="me-2" /> Salary</span>
          {openMenu === 'salary' ? <FaChevronDown /> : <FaChevronDown />}
        </div>
        <div style={submenuStyle(openMenu === 'salary')}>
          <div className="py-1">
            <Link to="/admin/salary/all-client-list" style={{ textDecoration: 'none', color: 'inherit' }}>
              Pay Salary
            </Link>
          </div>
          {/* <div className="py-1">
                        <Link to="/admin/under-dev" style={{ textDecoration: 'none', color: 'inherit' }}>
                            Overview
                        </Link>
                    </div> */}
        </div>
      </div>
      {/* Notification */}
      <div className="mb-3 d-flex align-items-center cursor-pointer">
        <FaBell className="me-2" />
        <div className="">
          <Link to="/admin/under-dev" style={{ textDecoration: 'none', color: 'inherit' }}>
            Notifications
          </Link>
        </div>
      </div>
      {/* Important Routes */}
      <div className="mb-3" onClick={() => toggleMenu('important')}>
        <div className="d-flex justify-content-between align-items-center cursor-pointer">
          <span><FaLayerGroup className="me-2" /> Important Routes</span>
          {openMenu === 'important' ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <div style={submenuStyle(openMenu === 'important')}>
          <div className="py-1">
            <Link to="/admin/danger/all-user" style={{ textDecoration: 'none', color: 'inherit' }}>
              All User Details
            </Link>
          </div>
          <div className="py-1">
            <Link to="/admin/danger/all-dfs" style={{ textDecoration: 'none', color: 'inherit' }}>
              All DFS Details
            </Link>
          </div>                </div>
      </div>
      {/* Settings */}
      <div className="mb-3 d-flex align-items-center cursor-pointer">
        <FaTools className="me-2" />
        <Link to="/admin/setting" style={{ textDecoration: 'none', color: 'inherit' }}>
          Setting
        </Link>
      </div>

      {/* Help */}
      <div className="mb-3 d-flex align-items-center cursor-pointer">
        <FaQuestionCircle className="me-2" />
        <Link to="/admin/under-dev" style={{ textDecoration: 'none', color: 'inherit' }}>
          Help
        </Link>

      </div>





      {/* Logout */}
      <div className="mt-auto d-flex align-items-center cursor-pointer" onClick={handleLogoutClick}>
        <FaSignOutAlt className="me-2" />
        Logout
      </div>

      {/* Logout Modal  */}
      <LogoutModal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

    </div>
  );
};

export default AdminSidebar;