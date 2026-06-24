import React, { useState, useEffect } from 'react';
import {
  FaHome, FaFileInvoiceDollar, FaHistory, FaFileAlt, FaUserCog, FaHeadset,
  FaSignOutAlt, FaChevronDown, FaMoneyBillWave, FaBars, FaTimes,
  FaFileSignature, FaClipboardList,
} from 'react-icons/fa';
import { BsCardChecklist } from 'react-icons/bs';
import { MdPayment } from 'react-icons/md';
import dummyUser from "../../assets/images/dummyUser.jpeg";
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import LogoutModal from '../models/LogoutModal';

// ── Navigation config: single source of truth ───────────────────────────────
const NAV = [
  { type: 'link', label: 'Home', icon: FaHome, to: '/client' },
  {
    type: 'group', key: 'bill', label: 'Bill', icon: FaFileInvoiceDollar, items: [
      { label: 'My Bills', to: '/client/my-bill' },
      { label: 'Upload Bill', to: '/client/upload-bill' },
    ],
  },
  {
    type: 'group', key: 'payment', label: 'Payment', icon: MdPayment, items: [
      { label: 'Payment Request', to: '/client/payment-request' },
      { label: 'Payment Request Status', to: '/client/my-payment-request' },
    ],
  },
  {
    type: 'group', key: 'transaction', label: 'Transaction', icon: FaHistory, items: [
      { label: 'Bill / IP / IPR', to: '/client/transaction' },
    ],
  },
  {
    type: 'group', key: 'eagreement', label: 'E-Agreement', icon: FaFileSignature, items: [
      { label: 'Overview', to: '/client/agreement' },
      { label: 'Closed Agreement', to: '/client/agreement/closed' },
    ],
  },
  {
    type: 'group', key: 'dfs', label: 'Forward Files — DFS', icon: BsCardChecklist, items: [
      { label: 'Upload Document', to: '/client/upload-document' },
      { label: 'Track Document', to: '/client/track-dfs/all' },
      { label: 'Document for review', to: '/client/dfsrequest' },
    ],
  },
  {
    type: 'group', key: 'document', label: 'Document', icon: FaFileAlt, items: [
      { label: 'All Documents', to: '/client/document/category' },
    ],
  },
  { type: 'link', label: 'Salary', icon: FaMoneyBillWave, to: '/client/salary' },
  { type: 'link', label: 'Setting', icon: FaUserCog, to: '/client/setting' },
  { type: 'link', label: 'SOR', icon: FaClipboardList, to: '/client/sor' },
  { type: 'link', label: 'Support', icon: FaHeadset, to: '/client/support' },
];

const ClientSidebar = ({ isOpen, toggleSidebar, onCollapse }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(false);
    if (onCollapse) onCollapse(false);
  }, []);

  // Auto-open the group that contains the active route
  useEffect(() => {
    const active = NAV.find(n => n.type === 'group' && n.items.some(i => i.to === location.pathname));
    if (active) setOpenDropdown(active.key);
  }, [location.pathname]);

  const setCollapseState = (val) => {
    setCollapsed(val);
    if (onCollapse) onCollapse(val);
  };

  const toggleDropdown = (key) => setOpenDropdown(prev => (prev === key ? null : key));

  const isActive = (to) => location.pathname === to;
  const isGroupActive = (items) => items.some(i => location.pathname === i.to);

  // Expand sidebar first if collapsed, then run the action
  const expandThen = (fn) => {
    if (collapsed) {
      setCollapseState(false);
      setTimeout(fn, 280);
    } else {
      fn();
    }
  };

  return (
    <>
      <style>{`
        .cl-sidebar { font-family: system-ui, -apple-system, sans-serif; }
        .cl-sidebar .nav-item-btn {
          display:flex; align-items:center; gap:10px; width:100%;
          padding:9px 12px; border:none; background:transparent; border-radius:10px;
          cursor:pointer; text-align:left; text-decoration:none;
          color:var(--sidebar-foreground); font-size:0.92rem; font-weight:500;
          transition:background .2s ease, color .2s ease;
        }
        .cl-sidebar .nav-item-btn:hover:not(.active){ background:var(--secondary); color:var(--primary); }
        .cl-sidebar .nav-item-btn:hover:not(.active) .nav-ico{ color:var(--primary); }
        .cl-sidebar .nav-item-btn.active{ background:var(--primary); color:var(--primary-foreground); font-weight:600; }
        .cl-sidebar .nav-item-btn.active .nav-ico{ color:var(--primary-foreground); }
        .cl-sidebar .nav-item-btn.parent-active{ color:var(--primary); }
        .cl-sidebar .nav-item-btn.parent-active .nav-ico{ color:var(--primary); }
        .cl-sidebar .nav-ico{ font-size:1.05rem; min-width:22px; text-align:center; color:var(--accent); flex-shrink:0; transition:color .2s ease; }
        .cl-sidebar .lbl{ white-space:nowrap; overflow:hidden; flex:1; }
        .cl-sidebar .chev{ font-size:.72rem; flex-shrink:0; opacity:.65; transition:transform .3s ease; }
        .cl-sidebar .chev.open{ transform:rotate(180deg); }
        .cl-sidebar .submenu{ overflow:hidden; transition:max-height .35s ease; margin:2px 0 4px 18px; border-left:1.5px solid var(--border); padding-left:8px; display:flex; flex-direction:column; gap:2px; }
        .cl-sidebar .sub-item{ display:flex; align-items:center; gap:9px; padding:7px 10px; border-radius:8px; font-size:0.84rem; font-weight:500; color:var(--secondary-foreground); text-decoration:none; transition:background .2s ease, color .2s ease; }
        .cl-sidebar .sub-item:hover:not(.active){ background:var(--secondary); color:var(--primary); }
        .cl-sidebar .sub-item.active{ background:var(--secondary); color:var(--primary); font-weight:600; }
        .cl-sidebar .sub-dot{ width:6px; height:6px; border-radius:50%; background:var(--muted-foreground); flex-shrink:0; transition:background .2s ease; }
        .cl-sidebar .sub-item:hover .sub-dot, .cl-sidebar .sub-item.active .sub-dot{ background:var(--accent); }
        .cl-sidebar .nav-scroll{ flex:1; overflow-y:auto; overflow-x:hidden; padding-right:3px; display:flex; flex-direction:column; gap:3px; }
        .cl-sidebar .nav-scroll::-webkit-scrollbar{ width:6px; }
        .cl-sidebar .nav-scroll::-webkit-scrollbar-thumb{ background:var(--border); border-radius:3px; }
        .cl-sidebar .nav-scroll::-webkit-scrollbar-track{ background:transparent; }
        .cl-sidebar.collapsed .nav-item-btn{ justify-content:center; padding:11px 0; }
        .cl-sidebar.collapsed .lbl, .cl-sidebar.collapsed .chev{ display:none; }
        .cl-sidebar .logout-btn:hover{ background:var(--warning); color:var(--warning-foreground); }
        .cl-sidebar .logout-btn:hover .nav-ico{ color:var(--destructive); }
      `}</style>

      <div
        className={`cl-sidebar vh-100 d-flex flex-column ${collapsed ? 'collapsed' : ''}`}
        style={{
          width: collapsed ? '72px' : '260px',
          zIndex: 1050,
          backgroundColor: 'var(--card)',
          // backgroundColor: 'black',
          borderRight: '1px solid var(--border)',
          boxShadow: '2px 0 12px var(--shadow-color)',
          display: isOpen ? 'flex' : 'none',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          minHeight: '100vh',
          padding: '14px 12px',
          color: 'var(--sidebar-foreground)',
        }}
      >

        {/* ── Toggle ── */}
        {/* ── Toggle ── */}
        <div className={`d-flex ${collapsed ? 'justify-content-center' : 'justify-content-end'} mb-2`}>
          <button
            onClick={() => setCollapseState(!collapsed)}
            aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
            title={collapsed ? 'Show sidebar' : 'Hide sidebar'}
            className="d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground, #ffffff)',  // ✅ white fallback
              width: 34, height: 34, minWidth: 34, padding: 0,
              borderRadius: 8, border: 'none', cursor: 'pointer', lineHeight: 0,
              transition: 'background-color 0.25s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
          >
            {collapsed
              ? <FaBars size={16} color="#ffffff" />
              : <FaTimes size={16} color="#ffffff" />}
          </button>
        </div>
        {/* ── Profile ── */}
        {!collapsed && (
          <div className="text-center mb-3">
            <img
              src={user?.profile || dummyUser}
              alt="Profile"
              className="rounded-circle mb-2"
              style={{
                width: 76, height: 76, objectFit: 'cover', cursor: 'pointer',
                border: '2px solid var(--primary)', transition: 'transform 0.25s ease',
              }}
              onClick={() => navigate('/client')}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
            <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-strong)' }}>
              {user?.name || 'Client Name'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginTop: 1 }}>
              Client ID • {user?.cid || 'CL-0000'}
            </div>
            <hr style={{ borderTop: '1px solid var(--border)', opacity: 0.7, margin: '0.9rem 0.5rem 0' }} />
          </div>
        )}

        {/* ── Scrollable nav ── */}
        <div className="nav-scroll">
          {NAV.map((item) => {
            const Icon = item.icon;

            // Single link
            if (item.type === 'link') {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={`nav-item-btn ${isActive(item.to) ? 'active' : ''}`}
                  onClick={(e) => { if (collapsed) { e.preventDefault(); expandThen(() => navigate(item.to)); } }}
                >
                  <Icon className="nav-ico" />
                  <span className="lbl">{item.label}</span>
                </Link>
              );
            }

            // Dropdown group
            const groupActive = isGroupActive(item.items);
            const open = openDropdown === item.key && !collapsed;
            return (
              <div key={item.key}>
                <button
                  type="button"
                  title={collapsed ? item.label : undefined}
                  className={`nav-item-btn ${groupActive && !open ? 'parent-active' : ''}`}
                  onClick={() => expandThen(() => toggleDropdown(item.key))}
                >
                  <Icon className="nav-ico" />
                  <span className="lbl">{item.label}</span>
                  <FaChevronDown className={`chev ${open ? 'open' : ''}`} />
                </button>

                <div className="submenu" style={{ maxHeight: open ? `${item.items.length * 44 + 8}px` : 0 }}>
                  {item.items.map((sub) => (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      className={`sub-item ${isActive(sub.to) ? 'active' : ''}`}
                    >
                      <span className="sub-dot" />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Logout (pinned) ── */}
        <div style={{ paddingTop: 8, marginTop: 6, borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            title={collapsed ? 'Logout' : undefined}
            className="nav-item-btn logout-btn"
            onClick={() => expandThen(() => setShowLogoutModal(true))}
          >
            <FaSignOutAlt className="nav-ico" />
            <span className="lbl">Logout</span>
          </button>
        </div>
      </div>

      <LogoutModal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
};

export default ClientSidebar;