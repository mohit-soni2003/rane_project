import React, { useState, useEffect } from 'react';
import { FaBars, FaBell } from 'react-icons/fa';
import { Outlet } from 'react-router-dom';
import ClientSidebar from '../component/sidebar/ClientSidebar';
import { useAuthStore } from '../store/authStore';

const EXPANDED_WIDTH = '260px';
const COLLAPSED_WIDTH = '72px'; // ✅ matches the sidebar's collapsed width

const ClientLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { user } = useAuthStore();

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const handleSidebarCollapse = (collapsed) => setIsSidebarCollapsed(collapsed);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsSidebarCollapsed(false);
  }, []);

  const isDesktop = windowWidth >= 768;
  const sidebarWidth = isSidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>

      {/* ── Desktop sidebar (fixed) ── */}
      <div className="d-none d-md-block position-fixed top-0 start-0" style={{ zIndex: 1050 }}>
        <ClientSidebar key="desktop-sidebar" isOpen={true} onCollapse={handleSidebarCollapse} />
      </div>

      {/* ── Mobile sidebar drawer (fixed overlay) ── */}
      {isSidebarOpen && (
        <>
          <div className="d-md-none position-fixed top-0 start-0" style={{ zIndex: 1050 }}>
            <ClientSidebar key="mobile-sidebar" isOpen={true} toggleSidebar={toggleSidebar} />
          </div>
          <div
            className="d-md-none position-fixed top-0 start-0 w-100 h-100"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1040 }}
            onClick={toggleSidebar}
          />
        </>
      )}

      {/* ── Mobile topbar ── */}
      <div
        className="d-md-none px-3 py-2 d-flex justify-content-between align-items-center"
        style={{
          backgroundColor: 'var(--sidebar)',
          color: 'var(--sidebar-foreground)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 1030,
        }}
      >
        <button
          className="d-flex align-items-center justify-content-center"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar menu"
          aria-expanded={isSidebarOpen}
          style={{
            color: 'var(--secondary-foreground, #5a463f)',
            border: '1px solid var(--border)', borderRadius: 8,
            width: 36, height: 36, minWidth: 36, padding: 0, lineHeight: 0,
            backgroundColor: 'var(--secondary)',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--secondary-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--secondary)')}
        >
          <FaBars size={18} color="var(--primary)" />
        </button>

        <span className="fw-semibold text-uppercase small" style={{ color: 'var(--primary)', letterSpacing: '0.5px' }}>
          RS-WMS
        </span>

        <div className="d-flex align-items-center gap-3">
          <div className="position-relative" style={{ cursor: 'pointer' }}>
            <FaBell size={19} style={{ color: 'var(--accent)' }} />
            <span
              className="position-absolute translate-middle rounded-circle"
              style={{
                top: 2, left: '100%', width: 9, height: 9,
                backgroundColor: 'var(--destructive)', border: '2px solid var(--sidebar)',
              }}
            />
          </div>
          <img
            src={user?.profile || '/assets/images/dummyUser.jpeg'}
            alt="Profile"
            className="rounded-circle"
            style={{ width: 32, height: 32, objectFit: 'cover', border: '2px solid var(--primary)' }}
          />
        </div>
      </div>

      {/* ── Main content ── */}
      <div
        className="p-2 p-md-3"
        style={{
          marginLeft: isDesktop ? sidebarWidth : '0px',
          width: isDesktop ? `calc(100% - ${sidebarWidth})` : '100%',
          transition: 'margin-left 0.3s ease, width 0.3s ease',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'var(--background)',
          color: 'var(--card-foreground)',
          overflowX: 'hidden',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default ClientLayout;