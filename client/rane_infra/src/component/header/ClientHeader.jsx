import React from 'react';
import { useAuthStore } from '../../store/authStore';

const ClientHeader = () => {
  const { user } = useAuthStore();

  return (
    <header
      className="w-100 px-3 py-2 d-none d-md-flex align-items-center"
      style={{
        backgroundColor: 'var(--client-component-bg-color)',
        fontSize: '14px',
      }}
    >
      {/* Left Section */}
      <div className="d-flex align-items-center justify-content-start flex-shrink-0" style={{ width: '200px' }}>
        <span className="fst-italic text-nowrap">E - OFFICE</span>
      </div>

      {/* Center Section */}
      <div className="text-center flex-grow-1 fw-bold text-uppercase" style={{ fontSize: '1.2rem', letterSpacing: '0.5px' }}>
        RANE & SONS - WORK MANAGEMENT SYSTEM
      </div>

      {/* Right Section */}
      <div
        className="d-flex align-items-center justify-content-end gap-3 text-nowrap flex-shrink-0"
        style={{ width: '200px' }}
      >
        <span className="d-none d-md-block medium fw-semibold text-uppercase">
          Welcome: {user?.name || 'CLIENT NAME'}
        </span>

        <img
          src={user?.profile || '/assets/images/dummyUser.jpeg'}
          alt="Profile"
          className="rounded-circle"
          style={{
            width: '32px',
            height: '32px',
            objectFit: 'cover',
            aspectRatio: '1 / 1', // ensures equal width and height
            borderRadius: '50%', // keeps it circular
            display: 'block'
          }}
        />



      </div>
    </header>
  );
};

export default ClientHeader;
