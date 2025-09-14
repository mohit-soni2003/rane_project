import React, { useState, useEffect } from 'react';
import { FaBars, FaBell } from 'react-icons/fa';
import { Outlet } from 'react-router-dom';
import ClientSidebar from '../component/sidebar/ClientSidebar';
import { useAuthStore } from '../store/authStore';

const ClientLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const {user} = useAuthStore();

  // Function to be passed to ClientSidebar to sync sidebar collapse state
  const handleSidebarCollapse = (isCollapsed) => {
    setIsSidebarCollapsed(isCollapsed);
  };

  // Ensure immediate state synchronization
  useEffect(() => {
    // Force a re-render to ensure layout adjusts immediately
    const timer = setTimeout(() => {}, 0);
    return () => clearTimeout(timer);
  }, [isSidebarCollapsed]);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ensure sidebar state is properly initialized
  useEffect(() => {
    // Reset collapsed state on component mount if needed
    setIsSidebarCollapsed(false);
  }, []);


  return (
    <>
      {/* Sidebar on Desktop */}
      <div style={{ backgroundColor: "var(--client-dashboard-bg-color)", height: "100vh" }}>


        <div className="d-none d-md-block position-fixed">
          <ClientSidebar 
            key="desktop-sidebar" 
            isOpen={true} 
            onCollapse={handleSidebarCollapse} 
          />
        </div>

        {/* Sidebar on Mobile */}
        {isSidebarOpen && (
          <>
            <ClientSidebar 
              key="mobile-sidebar" 
              isOpen={true} 
              toggleSidebar={toggleSidebar} 
            />
            <div
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1040 }}
              onClick={toggleSidebar}
            />
          </>
        )}

        {/* Topbar on Small Screens */}
        <div
          className="d-md-none px-3 py-2  d-flex justify-content-between align-items-center"
          style={{
            backgroundColor: "var(--client-dashboard-bg-color)",
            color: "var(--client-text-color)",
          }}
        >
          {/* Left: Sidebar Toggle */}
          <button
            className="btn p-0 m-0"
            onClick={toggleSidebar}
            style={{
              color: "var(--client-text-color)",
              fontWeight: "bold",
              fontSize: "1.2rem",
            }}
          >
            <FaBars />
          </button>

          {/* Center: Title */}
          <span className="fw-semibold text-uppercase small">RS-WMS</span>

          {/* Right: Bell + Profile */}
          <div className="d-flex align-items-center gap-3">
            {/* Notification Bell */}
            <div className="position-relative">
              <FaBell size={20} style={{ color: "var(--client-text-color)" }} />
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
        <div className="p-0 p-md-3" style={{ 
          marginLeft: windowWidth >= 768 ? (isSidebarCollapsed ? '60px' : '260px') : '0px',
          transition: 'margin-left 0.3s ease, width 0.3s ease',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
          width: windowWidth >= 768 ? `calc(100% - ${isSidebarCollapsed ? '60px' : '260px'})` : '100%',
          overflowX: 'hidden'
        }}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default ClientLayout;
