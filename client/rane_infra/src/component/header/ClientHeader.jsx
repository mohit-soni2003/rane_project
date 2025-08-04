import React from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';

const ClientHeader = () => {
  const { user } = useAuthStore();

  return (
    <header  className="w-100 px-3 py-2 d-none d-md-flex justify-content-between align-items-center"
      style={{ backgroundColor: 'var(--client-component-bg-color)', fontSize: '14px' }}
    >
      {/* Left: E-OFFICE */}
      <span className="fst-italic text-nowrap" >
        E - OFFICE
      </span>

      {/* Center Title */}
      <div className="text-center flex-grow-1 fw-bold text-uppercase"
        style={{
          marginLeft: '-150px',
          fontSize: '1.2rem',
          letterSpacing: '0.5px'
        }}
      >
        RANE & SONS - WORK MANAGEMENT SYSTEM
      </div>

      {/* Right Section */}
      <div className="d-flex align-items-center gap-3 text-nowrap">
        {/* RS-WMS Label */}
        <span className="d-none d-md-block medium fw-semibold text-uppercase ">
          Welcome: {user?.name || 'CLIENT NAME'}
        </span>

      

        {/* User Icon */}
        <img
          src={user?.profile || '/assets/images/dummyUser.jpeg'}
          alt="Profile"
          className="rounded-circle"
          style={{ width: '32px', height: '32px', objectFit: 'cover' }}
        />

        {/* Bell Icon with Notification Dot */}
        <div className="position-relative">
          <FaBell size={23} />
          <span
            className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
            style={{ width: '12px', height: '12px' }}
          ></span>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;
