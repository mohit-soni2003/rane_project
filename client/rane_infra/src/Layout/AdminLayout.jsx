import React, { useState, useEffect } from 'react';
import { FaBars } from 'react-icons/fa';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../component/sidebar/AdminSidebar';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      <div style={{ backgroundColor: "var(--client-dashboard-bg-color)", height: "100vh" }}>


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

        {/* Topbar on Small Screens */}
        <div className="d-md-none p-2 bg-light border-bottom">
          <button
            className="btn"
            style={{ fontWeight: 'bold' }}
            onClick={toggleSidebar}
          >
            <FaBars />
          </button>
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
