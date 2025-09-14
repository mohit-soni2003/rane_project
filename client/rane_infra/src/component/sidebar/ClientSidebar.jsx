import React, { useState, useEffect } from 'react';
import {
  FaHome, FaFileInvoiceDollar, FaHistory, FaFileAlt,
  FaUserCog, FaHeadset, FaSignOutAlt, FaChevronDown, FaChevronUp, FaArrowAltCircleRight, FaMoneyBillWave,
  FaBars, FaTimes
} from 'react-icons/fa';
import { BsCardChecklist } from 'react-icons/bs';
import { MdPayment } from 'react-icons/md';
import dummyUser from "../../assets/images/dummyUser.jpeg";
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import LogoutModal from '../models/LogoutModal';





const ClientSidebar = ({ isOpen, toggleSidebar, onCollapse }) => {
  const { user } = useAuthStore();
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const toggleSidebarCollapse = () => {
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

  const iconStyle = {
    fontSize: '1.2rem',
    width: '20px',
    height: '20px',
    flexShrink: 0
  };


  return (
    <div
      className="text-white vh-100 p-3 position-fixed top-0 start-0 d-flex flex-column"
      style={{
        width: isSidebarCollapsed ? '60px' : '260px',
        zIndex: 1050,
        backgroundColor: "var(--user-sidebar-color)",
        display: isOpen ? 'flex' : 'none',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        minHeight: '100vh'
      }}
    >

      {/* Toggle Button */}
      <div className="d-flex justify-content-end" style={{ marginTop: '5px', marginBottom: '5px' }}>
        <button
          onClick={toggleSidebarCollapse}
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
            src={user?.profile || dummyUser}
            className="rounded-circle mb-3"
            alt="Profile"
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
          />
          <div className='fs-6 fw-bolder mb-1' >{user.name}</div>
          <div className="fs-6 text-secondary fw-semibold">{user?.cid || "Not Assigned"}</div>
          <hr className="text-light" />
        </div>
      )}      {/* Home */}
      <div className="d-flex align-items-center sidebar-item" style={sidebarItemStyle}>
        <Link 
          to="/client" 
          style={{ textDecoration: 'none', color: 'inherit' }}
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              // Small delay to ensure state update before navigation
              setTimeout(() => {}, 0);
            }
          }}
        >
          <FaHome className="me-2" style={iconStyle} />
          {!isSidebarCollapsed && 'Home'}
        </Link>
      </div>

      {/* Dropdown: Bill */}
      <div className="">
        <div
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setTimeout(() => toggleDropdown("bill"), 300);
            } else {
              toggleDropdown("bill");
            }
          }}
          className="d-flex justify-content-between align-items-center sidebar-item"
          style={sidebarItemStyle}
        >
          <span><FaFileInvoiceDollar className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Bill'}</span>
          {!isSidebarCollapsed && (openDropdown === "bill" ? <FaChevronUp style={iconStyle} /> : <FaChevronDown style={iconStyle} />)}
        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openDropdown === "bill")}>
            <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}> <FaArrowAltCircleRight className="me-2" style={iconStyle} />
              <Link to="/client/my-bill" style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                My Bills
              </Link>
            </div>
            <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" style={iconStyle} />
              <Link to="/client/upload-bill" style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                Upload Bill
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Payment */}
      <div className="">
        <div
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setTimeout(() => toggleDropdown("payment"), 300);
            } else {
              toggleDropdown("payment");
            }
          }}
          className="d-flex justify-content-between align-items-center sidebar-item"
          style={sidebarItemStyle}
        >
          <span><MdPayment className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Payment'}</span>
          {!isSidebarCollapsed && (openDropdown === "payment" ? <FaChevronUp style={iconStyle} /> : <FaChevronDown style={iconStyle} />)}
        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openDropdown === "payment")}>
            <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" style={iconStyle} />
              <Link to="/client/payment-request" style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                Payment Request
              </Link>
            </div>
            <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" style={iconStyle} />
              <Link to="/client/my-payment-request" style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                Payment Request Status
              </Link>
            </div>        </div>
        )}
      </div>

      {/* Transactions */}
      <div className="">
        <div
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setTimeout(() => toggleDropdown("transaction"), 300);
            } else {
              toggleDropdown("transaction");
            }
          }}
          className="d-flex justify-content-between align-items-center sidebar-item"
          style={sidebarItemStyle}
        >
          <span><FaHistory className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Transactions'}</span>
          {!isSidebarCollapsed && (openDropdown === "transaction" ? <FaChevronUp style={iconStyle} /> : <FaChevronDown style={iconStyle} />)}
        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openDropdown === "transaction")}>
            <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" style={iconStyle} />
              <Link to="/client/transaction" style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                Bill/IP/IPR
              </Link>
            </div>
            <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" style={iconStyle} />Overview</div>
          </div>
        )}
      </div>

      {/* DFS */}
      <div className="">
        <div
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setTimeout(() => toggleDropdown("dfs"), 300);
            } else {
              toggleDropdown("dfs");
            }
          }}
          className="d-flex justify-content-between align-items-center sidebar-item"
          style={sidebarItemStyle}
        >
          <span><BsCardChecklist className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Forward Files - DFS'}</span>
          {!isSidebarCollapsed && (openDropdown === "dfs" ? <FaChevronUp style={iconStyle} /> : <FaChevronDown style={iconStyle} />)}
        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openDropdown === "dfs")}>
            <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" style={iconStyle} />
              <Link to="/client/upload-document" style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                Upload Document
              </Link>
            </div>
            <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" style={iconStyle} />
              <Link to="/client/track-dfs/all" style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                Track Document
              </Link>
            </div>
            {/* <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" />
              <Link to="/client/under-dev" style={{ textDecoration: 'none', color: 'inherit' }}>
                Closed Files
              </Link>
            </div> */}
          </div>
        )}
      </div>

      {/* Document */}
      <div className="">
        <div
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setOpenDropdown("document");
            } else {
              toggleDropdown("document");
            }
          }}
          className="d-flex justify-content-between align-items-center sidebar-item"
          style={sidebarItemStyle}
        >
          <span><FaFileAlt className="me-2" style={iconStyle} /> {!isSidebarCollapsed && 'Document'}</span>
          {!isSidebarCollapsed && (openDropdown === "document" ? <FaChevronUp style={iconStyle} /> : <FaChevronDown style={iconStyle} />)}
        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openDropdown === "document")}>
            <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" style={iconStyle} />
              <Link to="/client/document/category" style={{ textDecoration: 'none', color: 'inherit' }}
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

      {/* Salary */}
      <div className="d-flex align-items-center sidebar-item" style={sidebarItemStyle}>
        <Link 
          to="/client/salary" 
          style={{ textDecoration: 'none', color: 'inherit' }}
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setTimeout(() => {}, 0);
            }
          }}
        >
          <FaMoneyBillWave className="me-2" style={iconStyle} />
          {!isSidebarCollapsed && 'Salary'}
        </Link>
      </div>

      {/* Settings */}
      <div className="d-flex align-items-center sidebar-item" style={sidebarItemStyle}>
        <Link 
          to="/client/setting" 
          style={{ textDecoration: 'none', color: 'inherit' }}
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setTimeout(() => {}, 0);
            }
          }}
        >
          <FaUserCog className="me-2" style={iconStyle} />
          {!isSidebarCollapsed && 'Setting'}
        </Link>
      </div>

      {/* Support */}
      <div className="d-flex align-items-center sidebar-item" style={sidebarItemStyle}>
        <Link 
          to="/client/support" 
          style={{ textDecoration: 'none', color: 'inherit' }}
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setTimeout(() => {}, 0);
            }
          }}
        >
          <FaHeadset className="me-2" style={iconStyle} />
          {!isSidebarCollapsed && 'Support'}
        </Link>
      </div>

      {/* Logout */}
      <div className="mt-auto d-flex align-items-center sidebar-item " onClick={() => {
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

      <LogoutModal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

    </div>
  );
};

export default ClientSidebar;
