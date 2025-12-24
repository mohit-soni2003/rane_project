import React, { useState, useEffect } from 'react';
import { FaBars, FaBell } from 'react-icons/fa';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../component/sidebar/AdminSidebar';
import { useAuthStore } from '../store/authStore';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user } = useAuthStore();

  // Function to be passed to AdminSidebar to sync sidebar collapse state
  const handleSidebarCollapse = (isCollapsed) => {
    setIsSidebarCollapsed(isCollapsed);
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <>
      {/* Sidebar on Desktop */}
      <div style={{ backgroundColor: "white", height: "100vh" }}>


        <div className="d-none d-md-block position-fixed">
          <AdminSidebar onCollapse={handleSidebarCollapse} />
        </div>

        {/* Sidebar on Mobile */}
        {isSidebarOpen && (
          <>
            <AdminSidebar toggleSidebar={toggleSidebar} onCollapse={handleSidebarCollapse} />
            <div
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1040 }}
              onClick={toggleSidebar}
            />
          </>
        )}

        {/* Topbar on Small Screens only visible on mobile phones*/}
        <div
          className="d-md-none px-3 py-2  d-flex justify-content-between align-items-center"
          style={{
            backgroundColor: "var(--admin-dashboard-bg-color)",
            color: "var(--admin-text-color)",
          }}
        >
          {/* Left: Sidebar Toggle */}
          <button
            className="btn p-0 m-0 d-flex align-items-center justify-content-center"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar menu"
            aria-expanded={isSidebarOpen}
            style={{
              color: "#ffffff",
              fontWeight: "normal",
              fontSize: "1.2rem",
              border: "1px solid rgba(0,0,0,0.10)",
              borderRadius: "8px",
              width: "36px",
              height: "36px",
              lineHeight: "0",
              backgroundColor: "rgba(0,0,0,0.06)",
              transition: "color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.color = "rgba(255, 255, 255, 0.6)";
              el.style.backgroundColor = "rgba(0,0,0,0.10)";
              el.style.borderColor = "rgba(0,0,0,0.18)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.color = "#ffffff";
              el.style.backgroundColor = "rgba(0,0,0,0.06)";
              el.style.borderColor = "rgba(0,0,0,0.10)";
            }}
            onPointerDown={(e) => {
              const el = e.currentTarget;
              el.style.color = "rgba(255, 255, 255, 0.4)";
              el.style.backgroundColor = "rgba(0,0,0,0.12)";
              el.style.borderColor = "rgba(0,0,0,0.22)";
            }}
            onPointerUp={(e) => {
              const el = e.currentTarget;
              el.style.color = "#ffffff";
              el.style.backgroundColor = "rgba(0,0,0,0.06)";
              el.style.borderColor = "rgba(0,0,0,0.10)";
            }}
            onPointerCancel={(e) => {
              const el = e.currentTarget;
              el.style.color = "#ffffff";
              el.style.backgroundColor = "rgba(0,0,0,0.06)";
              el.style.borderColor = "rgba(0,0,0,0.10)";
            }}
          >
            <FaBars size={20} />
          </button>

          {/* Center: Title */}
          <span className="fw-semibold text-uppercase small">RS-WMS</span>

          {/* Right: Bell + Profile */}
          <div className="d-flex align-items-center gap-3">
            {/* Notification Bell */}
            <div className="position-relative">
              <FaBell size={20} style={{ color: "var(--admin-text-color)" }} />
              <span
                className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
                style={{ width: "10px", height: "10px" }}
              ></span>
            </div>

            {/* Profile Image */}
            <img
              src={user?.profile || '/assets/images/dummyUser.jpeg'}
              alt="Profile"
              className="rounded-circle"
              style={{ width: "32px", height: "32px", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Page Content */}
        <div className="p-3" style={{ 
          marginLeft: windowWidth >= 768 ? (isSidebarCollapsed ? '60px' : '260px') : '0px',
          transition: 'margin-left 0.3s ease'
        }}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
