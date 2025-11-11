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
import { right } from '@popperjs/core';
import "../../assets/utility/color_codes.css"





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
    transition: 'all 0.6s ease',
    marginLeft: '22px',
    fontSize: '0.9rem',
    color: '#d1d1d1',
    // backgroundColor: "rgba(255, 255, 255, 0.1)"
  });



  const handleHoverIn = (e) => {
    e.currentTarget.style.backgroundColor = 'var(--client-btn-bg)';
    e.currentTarget.style.color = 'var(--client-btn-text)';
  };

  const handleHoverOut = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.color = 'var(--client-header-text)';
  };
  const iconStyle = {
    fontSize: '1.1rem',
    flexShrink: 0,
    minWidth: '22px', // ensures uniform width for all icons
    textAlign: 'center',
    color: 'var(--sidebar-foreground)',
    marginRight: '8px',
  };

  const sidebarItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, color 0.3s ease',
    color: 'var(--sidebar-foreground)',
  };

  const ArrowIconStyle = {
    color: "var(--sidebar-foreground)",
    fontSize: '1rem',
    width: '15px',
    height: '15px',
    // border:"2px solid red ",
    padding: "2px",
    flexShrink: 0,
    marginLeft: "5px"
  };


  return (
    <div
      className="text-white vh-100 p-3 position-fixed top-0 start-0 d-flex flex-column"
      style={{
        width: isSidebarCollapsed ? '70px' : '260px',
        zIndex: 1050,
        backgroundColor: "var(--sidebar)",     // Sidebar background
        display: isOpen ? 'flex' : 'none',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        minHeight: '100vh',
        color: "var(--sidebar-foreground)",               // Text color from theme
      }}
    >



      {/* Toggle Button */}
      <div className={`d-flex ${isSidebarCollapsed ? 'justify-content-center' : 'justify-content-end'}`} style={{ marginTop: '0px', marginBottom: '5px' }}>
        <button
          onClick={toggleSidebarCollapse}
          className="btn p-0 d-flex align-items-center justify-content-center"
          aria-label={isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
          title={isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
          style={{
            color: 'var(--client-btn-text)',
            backgroundColor: 'var(--client-btn-bg)',
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--client-btn-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--client-btn-bg)'}
        >
          {isSidebarCollapsed ? <FaBars size={18} /> : <FaTimes size={18} />}
        </button>

      </div>

      {/* Profile Section - Hidden when collapsed */}
      {!isSidebarCollapsed && (
        <div className="text-center mb-3">
          {/* Profile Image */}
          <img
            src={user?.profile || dummyUser}
            alt="Profile"
            className="rounded-circle mb-2"
            style={{
              width: "80px",
              height: "80px",
              objectFit: "cover",
              cursor: "pointer",
              border: "2px solid var(--primary)",
              transition: "all 0.3s ease",
            }}
            onClick={() => navigate('/client')}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          />

          {/* Name */}
          <div
            className="fw-semibold"
            style={{
              fontSize: '1rem',
              color: 'var(--foreground)',
            }}
          >
            {user?.name || 'Client Name'}
          </div>

          {/* Client ID */}
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--muted-foreground)',
            }}
          >
            Client ID • {user?.cid || 'CL-0000'}
          </div>

          {/* Divider */}
          <hr
            style={{
              borderTop: '1px solid var(--border)',
              opacity: 0.5,
              margin: '0.8rem 1rem 0 1rem',
            }}
          />
        </div>
      )}

      {/* Home */}
      <div
        onMouseEnter={handleHoverIn}
        onMouseLeave={handleHoverOut}
        className={`d-flex align-items-center sidebar-item ${isSidebarCollapsed ? 'justify-content-center' : ''}`}
        style={sidebarItemStyle}
      >

        <Link
          to="/client"
          style={{ textDecoration: 'none', color: 'var(--sidebar-foreground)' }}
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              // Small delay to ensure state update before navigation
              setTimeout(() => { }, 0);
            }
          }}
        >
          <FaHome className={`me-2 ${isSidebarCollapsed ? 'me-0' : ''}`} style={iconStyle} />
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
          className={`d-flex align-items-center sidebar-item ${isSidebarCollapsed ? 'justify-content-center' : ''}`}
          style={sidebarItemStyle}
          onMouseEnter={handleHoverIn}
          onMouseLeave={handleHoverOut}
        >
          <div className="d-flex align-items-center w-100"
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'space-between' }}>
            <div className="d-flex align-items-center" style={{ color: 'var(--sidebar-foreground)' }}>
              <FaFileInvoiceDollar className={`me-2 ${isSidebarCollapsed ? 'me-0' : ''}`} style={iconStyle} />
              {!isSidebarCollapsed && <span >Bill</span>}
            </div>

            {!isSidebarCollapsed && (
              openDropdown === "bill"
                ? <FaChevronUp style={ArrowIconStyle} />
                : <FaChevronDown style={ArrowIconStyle} />
            )}
          </div>

        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openDropdown === "bill")}>
            <div className="py-1  sidebar-item"
              onMouseEnter={handleHoverIn}
              onMouseLeave={handleHoverOut}
              style={sidebarItemStyle}>
              <FaArrowAltCircleRight className="me-2 " style={iconStyle} />
              <Link to="/client/my-bill" style={{ textDecoration: 'none', color: 'var(--sidebar-foreground)' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                My Bills
              </Link>
            </div>
            <div className="py-1 sidebar-item"
              style={sidebarItemStyle}
              onMouseEnter={handleHoverIn}
              onMouseLeave={handleHoverOut}
            >
              <FaArrowAltCircleRight className="me-2" style={iconStyle} />
              <Link to="/client/upload-bill" style={{ textDecoration: 'none', color: 'var(--sidebar-foreground)' }}
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

          className={`d-flex align-items-center sidebar-item ${isSidebarCollapsed ? 'justify-content-center' : ''}`}
          style={sidebarItemStyle}
          onMouseEnter={handleHoverIn}
          onMouseLeave={handleHoverOut}
        >
          <div className="d-flex align-items-center w-100"
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'space-between' }}>
            <div className="d-flex align-items-center" style={{ color: 'var(--sidebar-foreground)' }}>
              <MdPayment className={`me-2 ${isSidebarCollapsed ? 'me-0' : ''}`} style={iconStyle} />
              {!isSidebarCollapsed && <span>Payment</span>}
            </div>

            {!isSidebarCollapsed && (
              openDropdown === "payment"
                ? <FaChevronUp style={ArrowIconStyle} />
                : <FaChevronDown style={ArrowIconStyle} />
            )}
          </div>

        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openDropdown === "payment")}>
            <div className="py-1 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" style={iconStyle} />
              <Link to="/client/payment-request" style={{ textDecoration: 'none', color: 'var(--sidebar-foreground)' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                Payment Request
              </Link>
            </div>
            <div className="py-1 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" style={iconStyle} />
              <Link to="/client/my-payment-request" style={{ textDecoration: 'none', color: 'var(--sidebar-foreground)' }}
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
          className={`d-flex align-items-center sidebar-item ${isSidebarCollapsed ? 'justify-content-center' : ''}`}
          style={sidebarItemStyle}
          onMouseEnter={handleHoverIn}
          onMouseLeave={handleHoverOut}
        >
          <div className="d-flex align-items-center w-100"
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'space-between' }}>
            <div className="d-flex align-items-center" style={{ color: 'var(--sidebar-foreground)' }}>
              <FaHistory className={`me-2 ${isSidebarCollapsed ? 'me-0' : ''}`} style={iconStyle} />
              {!isSidebarCollapsed && <span>Transaction</span>}
            </div>

            {!isSidebarCollapsed && (
              openDropdown === "transaction"
                ? <FaChevronUp style={ArrowIconStyle} />
                : <FaChevronDown style={ArrowIconStyle} />
            )}
          </div>

        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openDropdown === "transaction")}>
            <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" style={iconStyle} />
              <Link to="/client/transaction" style={{ textDecoration: 'none', color: 'var(--sidebar-foreground)' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                Bill/IP/IPR
              </Link>
            </div>
            <div
              className="py-1 ps-3 sidebar-item"
              style={{ ...sidebarItemStyle, color: 'var(--sidebar-foreground)' }}
            >
              <FaArrowAltCircleRight className="me-2" style={iconStyle} />Overview
            </div>

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
          className={`d-flex align-items-center sidebar-item ${isSidebarCollapsed ? 'justify-content-center' : ''}`}
          style={sidebarItemStyle}
          onMouseEnter={handleHoverIn}
          onMouseLeave={handleHoverOut}
        >
          <div className="d-flex align-items-center w-100"
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'space-between' }}>
            <div className="d-flex align-items-center" style={{ color: 'var(--sidebar-foreground)' }}>
              <BsCardChecklist className={`me-2 ${isSidebarCollapsed ? 'me-0' : ''}`} style={iconStyle} />
              {!isSidebarCollapsed && <span>Forward Files - DFS</span>}
            </div>

            {!isSidebarCollapsed && (
              openDropdown === "dfs"
                ? <FaChevronUp style={ArrowIconStyle} />
                : <FaChevronDown style={ArrowIconStyle} />
            )}
          </div>

        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openDropdown === "dfs")}>
            <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" style={iconStyle} />
              <Link to="/client/upload-document" style={{ textDecoration: 'none', color: 'var(--sidebar-foreground)' }}
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
              <Link to="/client/track-dfs/all" style={{ textDecoration: 'none', color: 'var(--sidebar-foreground)' }}
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    if (onCollapse) onCollapse(false);
                  }
                }}>
                Track Document
              </Link>
            </div>
            <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" />
              <Link to="/client/dfsrequest" style={{ textDecoration: 'none', color: 'var(--sidebar-foreground)' }}>
                Document for review
              </Link>
            </div>
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
          className={`d-flex align-items-center sidebar-item ${isSidebarCollapsed ? 'justify-content-center' : ''}`}
          style={sidebarItemStyle}
          onMouseEnter={handleHoverIn}
          onMouseLeave={handleHoverOut}
        >
          <div className="d-flex align-items-center w-100"
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'space-between' }}>
            <div className="d-flex align-items-center" style={{ color: 'var(--sidebar-foreground)' }}>
              <FaFileAlt className={`me-2 ${isSidebarCollapsed ? 'me-0' : ''}`} style={iconStyle} />
              {!isSidebarCollapsed && <span>Document</span>}
            </div>

            {!isSidebarCollapsed && (
              openDropdown === "document"
                ? <FaChevronUp style={ArrowIconStyle} />
                : <FaChevronDown style={ArrowIconStyle} />
            )}
          </div>

        </div>
        {!isSidebarCollapsed && (
          <div style={submenuStyle(openDropdown === "document")}>
            <div className="py-1 ps-3 sidebar-item" style={sidebarItemStyle}><FaArrowAltCircleRight className="me-2" style={iconStyle} />
              <Link to="/client/document/category" style={{ textDecoration: 'none', color: "var(--sidebar-foreground)" }}
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
      <div className={`d-flex align-items-center sidebar-item ${isSidebarCollapsed ? 'justify-content-center' : ''}`}
        style={sidebarItemStyle}
        onMouseEnter={handleHoverIn}
        onMouseLeave={handleHoverOut}
      >
        <Link
          to="/client/salary"
          style={{ textDecoration: 'none', color: 'var(--sidebar-foreground)' }}
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setTimeout(() => { }, 0);
            }
          }}
        >
          <FaMoneyBillWave className={`me-2 ${isSidebarCollapsed ? 'me-0' : ''}`} style={iconStyle} />
          {!isSidebarCollapsed && 'Salary'}
        </Link>
      </div>

      {/* Settings */}
      <div className={`d-flex align-items-center sidebar-item ${isSidebarCollapsed ? 'justify-content-center' : ''}`}
        style={sidebarItemStyle}
        onMouseEnter={handleHoverIn}
        onMouseLeave={handleHoverOut}
      >
        <Link
          to="/client/setting"
          style={{ textDecoration: 'none', color: 'var(--sidebar-foreground)' }}
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setTimeout(() => { }, 0);
            }
          }}
        >
          <FaUserCog className={`me-2 ${isSidebarCollapsed ? 'me-0' : ''}`} style={iconStyle} />
          {!isSidebarCollapsed && 'Setting'}
        </Link>
      </div>

      {/* Support */}
      <div className={`d-flex align-items-center sidebar-item ${isSidebarCollapsed ? 'justify-content-center' : ''}`} style={sidebarItemStyle}
        onMouseEnter={handleHoverIn}
        onMouseLeave={handleHoverOut}
      >
        <Link
          to="/client/support"
          style={{ textDecoration: 'none', color: 'var(--sidebar-foreground)' }}
          onClick={() => {
            if (isSidebarCollapsed) {
              setIsSidebarCollapsed(false);
              if (onCollapse) onCollapse(false);
              setTimeout(() => { }, 0);
            }
          }}

        >
          <FaHeadset className={`me-2 ${isSidebarCollapsed ? 'me-0' : ''}`} style={iconStyle} />
          {!isSidebarCollapsed && 'Support'}
        </Link>
      </div>

      {/* Logout */}
      <div className={`mt-auto p-2 d-flex align-items-center sidebar-item  ${isSidebarCollapsed ? 'justify-content-center' : ''}`} onClick={() => {
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          if (onCollapse) onCollapse(false);
          // Delay the logout modal to allow sidebar expansion animation
          setTimeout(() => setShowLogoutModal(true), 300);
        } else {
          handleLogoutClick();
        }
      }}
        onMouseEnter={handleHoverIn}
        onMouseLeave={handleHoverOut}
      >
        <FaSignOutAlt className={`me-2 ${isSidebarCollapsed ? 'me-0' : ''}`} style={iconStyle} />
        <span style={{ color: 'var(--sidebar-foreground)' }}>
          {!isSidebarCollapsed && 'Logout'}
        </span>
      </div>

      <LogoutModal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

    </div >
  );
};

export default ClientSidebar;
