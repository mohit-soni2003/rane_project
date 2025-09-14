import React, { useState, useEffect } from 'react';
import {
  FaTachometerAlt, FaFileInvoice, FaUserTie, FaChevronDown, FaChevronUp,
  FaTools, FaQuestionCircle, FaBell, FaSignOutAlt, FaLayerGroup, FaFileAlt, FaMoneyBillWave,
  FaBars, FaTimes
} from 'react-icons/fa';
import dummyUser from '../../assets/images/dummyUser.jpeg';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from "../../store/authStore"
import LogoutModal from '../models/LogoutModal';
const AdminSidebar = ({ onCollapse }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const { user } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Sync with parent component on mount and when navigation occurs
  useEffect(() => {
    // Ensure sidebar starts in expanded state on component mount
    setIsSidebarCollapsed(false);
    if (onCollapse) {
      onCollapse(false);
    }
  }, []); // Empty dependency array ensures this runs only on mount

  // Handle location changes to ensure proper state synchronization
  useEffect(() => {
    // When location changes, ensure sidebar is properly synchronized
    if (onCollapse) {
      onCollapse(isSidebarCollapsed);
    }
  }, [location.pathname]);


  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const toggleSidebar = () => {
    const newCollapseState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapseState);
    // Immediately notify parent component about sidebar state change
    if (onCollapse) {
      onCollapse(newCollapseState);
    }
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
    color: '#ccc',
  });

  const iconStyle = {
    fontSize: '1.2rem',
    width: '20px',
    height: '20px',
    flexShrink: 0
  };

  return (
    <div 
      className="d-flex flex-column vh-100 p-3 position-fixed top-0 start-0" 
      style={{ 
        width: isSidebarCollapsed ? '60px' : '260px', 
        backgroundColor: '#1e1e2f', 
        color: '#f1f1f1',
        transition: 'width 0.3s ease',
        zIndex: 1040,
        overflow: 'hidden'
      }}
    >

      {/* Toggle Button */}
      <div className="d-flex justify-content-end" style={{ marginTop: '5px', marginBottom: '5px' }}>
        <button
          onClick={toggleSidebar}
          className="btn btn-sm border-0"
          style={{
            backgroundColor: 'transparent',
            color: '#f1f1f1',
            fontSize: '1.2rem'
          }}
          title={isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
        >
          {isSidebarCollapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>      {/* Profile Section - Hidden when collapsed */}
      {!isSidebarCollapsed && (
        <div className="text-center mb-2 mt-2">
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
      )}

      {/* Home  */}
      <div className="mb-2 d-flex align-items-center cursor-pointer">
        <Link
          to="/admin"
          style={{ textDecoration: 'none', color: 'inherit' }}
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setTimeout(() => {}, 0);
            }
          }}
        >
          <FaTachometerAlt className="me-2" style={iconStyle} />
          {!isSidebarCollapsed && 'Home'}
        </Link>
      </div>      {/* Bills */}
      <div className="mb-2 d-flex align-items-center cursor-pointer">
        <Link
          to="/admin/bill"
          style={{ textDecoration: 'none', color: 'inherit' }}
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setTimeout(() => {}, 0);
            }
          }}
        >
          <FaFileInvoice className="me-2" style={iconStyle} />
          {!isSidebarCollapsed && 'Bills'}
        </Link>
      </div>
      {/* payment Request  */}
      <div className="mb-2 d-flex align-items-center cursor-pointer">
        <Link
          to="/admin/payment-request"
          style={{ textDecoration: 'none', color: 'inherit' }}
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setTimeout(() => {}, 0);
            }
          }}
        >
          <FaFileInvoice className="me-2" style={iconStyle} />
          {!isSidebarCollapsed && 'Payment Request'}
        </Link>
      </div>

      {/* Client */}
      <div className="mb-2" onClick={() => {
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          if (onCollapse) onCollapse(false);
          setTimeout(() => toggleMenu('client'), 300);
        } else {
          toggleMenu('client');
        }
      }}>
        <div className="d-flex justify-content-between align-items-center cursor-pointer">
          <span><FaUserTie className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Client'}</span>
          {!isSidebarCollapsed && (openMenu === 'client' ? <FaChevronUp /> : <FaChevronDown />)}
        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openMenu === 'client')}>
            <div className="py-1">
              <Link to="/admin/all-client" style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                All Client
              </Link>
            </div>
            <div className="py-1">
              <Link to="/admin/under-dev" style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                Add new Client
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* DFS Request */}
      <div className="mb-2" onClick={() => {
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          if (onCollapse) onCollapse(false);
          setTimeout(() => toggleMenu('dfs'), 300);
        } else {
          toggleMenu('dfs');
        }
      }}>
        <div className="d-flex justify-content-between align-items-center cursor-pointer">
          <span><FaFileAlt className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'DFS'}</span>
          {!isSidebarCollapsed && (openMenu === 'dfs' ? <FaChevronUp /> : <FaChevronDown />)}
        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openMenu === 'dfs')}>
            <div className="py-1"><Link to="/admin/dfsrequest" style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  if (onCollapse) onCollapse(false);
                }
              }}>
              Document assigned to me
            </Link></div>
            {/* <div className="py-1">My Forwarded Document</div> */}
          </div>
        )}
      </div>

      {/* Push Document */}
      <div className="mb-2" onClick={() => {
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          if (onCollapse) onCollapse(false);
          setTimeout(() => toggleMenu('push'), 300);
        } else {
          toggleMenu('push');
        }
      }}>
        <div className="d-flex justify-content-between align-items-center cursor-pointer">
          <span><FaFileAlt className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Push Document'}</span>
          {!isSidebarCollapsed && (openMenu === 'push' ? <FaChevronUp /> : <FaChevronDown />)}
        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openMenu === 'push')}>
            <div className="py-1"><Link to="/admin/push-document" style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  if (onCollapse) onCollapse(false);
                }
              }}>
              Push new Document
            </Link></div>
            <div className="py-1"><Link to="/admin/push-document/by-me" style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  if (onCollapse) onCollapse(false);
                }
              }}>
              See all document
            </Link></div>
          </div>
        )}
      </div>
      {/* salary */}
      <div className="mb-2" onClick={() => {
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          if (onCollapse) onCollapse(false);
          setTimeout(() => toggleMenu('salary'), 300);
        } else {
          toggleMenu('salary');
        }
      }}>
        <div className="d-flex justify-content-between align-items-center cursor-pointer">
          <span><FaMoneyBillWave className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Salary'}</span>
          {!isSidebarCollapsed && (openMenu === 'salary' ? <FaChevronDown /> : <FaChevronDown />)}
        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openMenu === 'salary')}>
            <div className="py-1">
              <Link to="/admin/salary/all-client-list" style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                Pay Salary
              </Link>
            </div>
            {/* <div className="py-1">
                        <Link to="/admin/under-dev" style={{ textDecoration: 'none', color: 'inherit' }}>
                            Overview
                        </Link>
                    </div> */}
          </div>
        )}
      </div>
      {/* Notification */}
      <div className="mb-2 d-flex align-items-center cursor-pointer">
        <Link
          to="/admin/notifications"
          style={{ textDecoration: 'none', color: 'inherit' }}
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setTimeout(() => {}, 0);
            }
          }}
        >
          <FaBell className="me-2" style={iconStyle} />
          {!isSidebarCollapsed && 'Notifications'}
        </Link>
      </div>
      {/* Important Routes */}
      <div className="mb-2" onClick={() => {
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          if (onCollapse) onCollapse(false);
          setTimeout(() => toggleMenu('important'), 300);
        } else {
          toggleMenu('important');
        }
      }}>
        <div className="d-flex justify-content-between align-items-center cursor-pointer">
          <span><FaLayerGroup className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Important Routes'}</span>
          {!isSidebarCollapsed && (openMenu === 'important' ? <FaChevronUp /> : <FaChevronDown />)}
        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openMenu === 'important')}>
            <div className="py-1">
              <Link to="/admin/danger/all-user" style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                All User Details
              </Link>
            </div>
            <div className="py-1">
              <Link to="/admin/danger/all-dfs" style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                All DFS Details
              </Link>
            </div>
            <div className="py-1">
              <Link to="/admin/danger/all-documents" style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                All Documents
              </Link>
            </div>
          </div>
        )}
      </div>
      {/* Settings */}
      <div className="mb-2 d-flex align-items-center cursor-pointer">
        <Link 
          to="/admin/setting" 
          style={{ textDecoration: 'none', color: 'inherit' }}
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setTimeout(() => {}, 0);
            }
          }}
        >
          <FaTools className="me-2" style={iconStyle} />
          {!isSidebarCollapsed && 'Setting'}
        </Link>
      </div>

      {/* Help */}
      <div className="mb-2 d-flex align-items-center cursor-pointer">
        <Link 
          to="/admin/under-dev" 
          style={{ textDecoration: 'none', color: 'inherit' }}
          onClick={() => isSidebarCollapsed && setIsSidebarCollapsed(false)}
        >
          <FaQuestionCircle className="me-2" style={iconStyle} />
          {!isSidebarCollapsed && 'Help'}
        </Link>
      </div>





      {/* Logout */}
      <div className="mt-auto d-flex align-items-center cursor-pointer" onClick={() => {
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          if (onCollapse) onCollapse(false);
          // Delay the logout modal to allow sidebar expansion animation
          setTimeout(() => setShowLogoutModal(true), 300);
        } else {
          handleLogoutClick();
        }
      }}>
        <FaSignOutAlt className="me-2" style={iconStyle} />
        {!isSidebarCollapsed && 'Logout'}
      </div>

      {/* Logout Modal  */}
      <LogoutModal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

    </div>
  );
};

export default AdminSidebar;