import React, { useState, useEffect } from 'react';
import { FaBars } from 'react-icons/fa';
import { Outlet } from 'react-router-dom';
import StaffSidebar from '../component/sidebar/StaffSidebar';

const StaffLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ backgroundColor: "var(--client-dashboard-bg-color)", height: "100vh" }}>
      
      {/* Desktop Sidebar */}
      <div className="d-none d-md-block position-fixed">
        <StaffSidebar isOpen={true} />
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          <StaffSidebar isOpen={true} toggleSidebar={toggleSidebar} />
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1040 }}
            onClick={toggleSidebar}
          />
        </>
      )}

      {/* Mobile Topbar */}
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
      <div className="p-3" style={{ marginLeft: windowWidth >= 768 ? '260px' : '0px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default StaffLayout;
