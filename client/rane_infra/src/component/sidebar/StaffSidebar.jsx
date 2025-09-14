import React, { useState, useEffect } from 'react';
import {
  FaTachometerAlt, FaFileInvoice, FaUserTie, FaChevronDown, FaChevronUp,
  FaTools, FaQuestionCircle, FaBell, FaSignOutAlt, FaFileAlt,
  FaBars, FaTimes
} from 'react-icons/fa';
import dummyUser from '../../assets/images/dummyUser.jpeg';
import { useAuthStore } from '../../store/authStore';
import { Link, useLocation } from 'react-router-dom';

const StaffSidebar = ({ onCollapse }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const { user } = useAuthStore();
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

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const toggleSidebar = () => {
    const newCollapseState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapseState);
    // Immediately notify parent component about sidebar state change
    if (onCollapse) {
      onCollapse(newCollapseState);
    }
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

  const iconStyle = {
    fontSize: '1.2rem',
    width: '20px',
    height: '20px',
    flexShrink: 0
  };

  return (
    <div className="d-flex flex-column p-3 staff-sidebar"
      style={{
        width: isSidebarCollapsed ? '60px' : '260px',
        backgroundColor: '#1e1e2f',
        color: '#f1f1f1',
        height: '100vh',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1040,
        transition: 'width 0.3s ease',
      }}>

      {/* Toggle Button */}
      <div className="d-flex justify-content-end" style={{ marginTop: '5px', marginBottom: '5px' }}>
        <button
          onClick={toggleSidebar}
          className="btn btn-sm border-0"
          style={iconStyle}
          title={isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
        >
          {isSidebarCollapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      {/* Profile Section - Hidden when collapsed */}
      {!isSidebarCollapsed && (
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
      )}

      {/* Sidebar Links */}
      <Link to="/staff/home" style={menuItemStyle}>
        <div className="d-flex align-items-center px-2 py-2 rounded hover-effect cursor-pointer" onClick={() => {
          if (isSidebarCollapsed) {
            setIsSidebarCollapsed(false);
            if (onCollapse) onCollapse(false);
            setTimeout(() => {}, 0);
          }
        }}>
          <FaTachometerAlt className="me-2" style={iconStyle} />
          {!isSidebarCollapsed && 'Home'}
        </div>
      </Link>

      <Link to="/staff/bill" style={menuItemStyle}>
        <div className="d-flex align-items-center px-2 py-2 rounded hover-effect cursor-pointer" onClick={() => {
          if (isSidebarCollapsed) {
            setIsSidebarCollapsed(false);
            if (onCollapse) onCollapse(false);
            setTimeout(() => {}, 0);
          }
        }}>
          <FaFileInvoice className="me-2" style={iconStyle} />
          {!isSidebarCollapsed && 'Bills'}
        </div>
      </Link>

      {/* Client Dropdown */}
      <div className="px-2 py-2 rounded cursor-pointer hover-effect" onClick={() => {
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          if (onCollapse) onCollapse(false);
          setTimeout(() => toggleMenu('client'), 300);
        } else {
          toggleMenu('client');
        }
      }}>
        <div className="d-flex justify-content-between align-items-center">
          <span><FaUserTie className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Client'}</span>
          {!isSidebarCollapsed && (openMenu === 'client' ? <FaChevronUp style={iconStyle} /> : <FaChevronDown style={iconStyle} />)}
        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openMenu === 'client')}>
            <Link to="/staff/all-client" style={menuItemStyle}>
              <div className="py-1" onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  if (onCollapse) onCollapse(false);
                }
              }}>All Client</div>
            </Link>
          </div>
        )}
      </div>

      {/* Payment Request Dropdown */}
      <div className="mb-2 px-2 py-2 rounded cursor-pointer hover-effect" onClick={() => {
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          if (onCollapse) onCollapse(false);
          setTimeout(() => toggleMenu('pr'), 300);
        } else {
          toggleMenu('pr');
        }
      }}>
        <div className="d-flex justify-content-between align-items-center">
          <span><FaFileAlt className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Payment Request'}</span>
          {!isSidebarCollapsed && (openMenu === 'pr' ? <FaChevronUp style={iconStyle} /> : <FaChevronDown style={iconStyle} />)}
        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openMenu === 'pr')}>
            <Link to="/staff/payment-request" style={menuItemStyle}>
              <div className="py-1" onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  if (onCollapse) onCollapse(false);
                }
              }}>Resolve Other PR</div>
            </Link>
            <Link to="/staff/request-payment" style={menuItemStyle}>
              <div className="py-1" onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  if (onCollapse) onCollapse(false);
                }
              }}>Make PR</div>
            </Link>
            <Link to="/staff/my-payment-request" style={menuItemStyle}>
              <div className="py-1" onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  if (onCollapse) onCollapse(false);
                }
              }}>Your Personal PR</div>
            </Link>
          </div>
        )}
      </div>

      {/* DFS Section Dropdown */}
      <div className="px-2 py-2 rounded cursor-pointer hover-effect" onClick={() => {
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          if (onCollapse) onCollapse(false);
          setTimeout(() => toggleMenu('dfs'), 300);
        } else {
          toggleMenu('dfs');
        }
      }}>
        <div className="d-flex justify-content-between align-items-center">
          <span><FaFileAlt className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'DFS Section'}</span>
          {!isSidebarCollapsed && (openMenu === 'dfs' ? <FaChevronUp style={iconStyle} /> : <FaChevronDown style={iconStyle} />)}
        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openMenu === 'dfs')}>
            <Link to="/staff/dfsrequest" style={menuItemStyle}>
              <div className="py-1" onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  if (onCollapse) onCollapse(false);
                }
              }}>Assigned Document</div>
            </Link>
            <Link to="/staff/upload-document" style={menuItemStyle}>
              <div className="py-1" onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  if (onCollapse) onCollapse(false);
                }
              }}>Upload Document</div>
            </Link>
            <Link to="/staff/track-dfs/all" style={menuItemStyle}>
              <div className="py-1" onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  if (onCollapse) onCollapse(false);
                }
              }}>Track Document</div>
            </Link>
          </div>
        )}
      </div>

      {/* Document Dropdown */}
      <div className="px-2 py-2 rounded cursor-pointer hover-effect" onClick={() => {
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          if (onCollapse) onCollapse(false);
          setTimeout(() => toggleMenu('document'), 300);
        } else {
          toggleMenu('document');
        }
      }}>
        <div className="d-flex justify-content-between align-items-center">
          <span><FaFileAlt className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Document'}</span>
          {!isSidebarCollapsed && (openMenu === 'document' ? <FaChevronUp style={iconStyle} /> : <FaChevronDown style={iconStyle} />)}
        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openMenu === 'document')}>
            <Link to="/staff/all-documents" style={menuItemStyle}>
              <div className="py-1" onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  if (onCollapse) onCollapse(false);
                }
              }}>All Documents</div>
            </Link>
          </div>
        )}
      </div>

      {/* Notification */}
      <Link to="/staff/under-dev" style={menuItemStyle}>
        <div className="d-flex align-items-center px-2 py-2 rounded hover-effect cursor-pointer" onClick={() => {
          if (isSidebarCollapsed) {
            setIsSidebarCollapsed(false);
            if (onCollapse) onCollapse(false);
            setTimeout(() => {}, 0);
          }
        }}>
          <FaBell className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Notification'}
        </div>
      </Link>

      {/* Salary */}
      <Link to="/staff/salary" style={menuItemStyle}>
        <div className="d-flex align-items-center px-2 py-2 rounded hover-effect cursor-pointer" onClick={() => {
          if (isSidebarCollapsed) {
            setIsSidebarCollapsed(false);
            if (onCollapse) onCollapse(false);
            setTimeout(() => {}, 0);
          }
        }}>
          <FaFileInvoice className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Salary'}
        </div>
      </Link>

      {/* Settings */}
      <Link to="/staff/setting" style={menuItemStyle}>
        <div className="d-flex align-items-center px-2 py-2 rounded hover-effect cursor-pointer" onClick={() => {
          if (isSidebarCollapsed) {
            setIsSidebarCollapsed(false);
            if (onCollapse) onCollapse(false);
            setTimeout(() => {}, 0);
          }
        }}>
          <FaTools className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Setting'}
        </div>
      </Link>

      {/* Help */}
      <Link to="/staff/under-dev" style={menuItemStyle}>
        <div className="d-flex align-items-center px-2 py-2 rounded hover-effect cursor-pointer" onClick={() => {
          if (isSidebarCollapsed) {
            setIsSidebarCollapsed(false);
            if (onCollapse) onCollapse(false);
            setTimeout(() => {}, 0);
          }
        }}>
          <FaQuestionCircle className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Help'}
        </div>
      </Link>

      {/* Logout */}
      <div className="mt-auto d-flex align-items-center px-2 py-2 rounded hover-effect cursor-pointer" onClick={() => {
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          if (onCollapse) onCollapse(false);
          setTimeout(() => {}, 0);
        }
      }}>
        <FaSignOutAlt className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Logout'}
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
