import React from 'react';
import { FaBell } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';

const StaffHeader = () => {
  const { user } = useAuthStore();

  return (
    <div
      className="d-md-flex d-none justify-content-between align-items-center px-3 py-2 border-bottom"
      style={{ backgroundColor: 'var(--staff-component-bg-color)' }}
    >
      {/* Greeting */}
      <div className="fw-medium fs-6">
        Good Evening, <span className="fw-semibold">{user?.name || 'Staff'}</span>! 👋 Welcome back.
      </div>

      {/* Right Side */}
      <div className="d-flex align-items-center gap-3">
        {/* Notification Bell */}
        <div className="position-relative">
          <FaBell size={18} className="text-dark" />
          <span
            className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
            style={{ width: '8px', height: '8px' }}
          ></span>
        </div>

        {/* Company Logo and Name */}
        <div className="d-flex align-items-center gap-2">
          <div
            className="bg-primary text-white fw-bold rounded d-flex justify-content-center align-items-center"
            style={{ width: '30px', height: '30px' }}
          >
            IE
          </div>
          <div
            className="text-uppercase fw-semibold small"
            style={{ fontSize: '0.8rem' }}
          >
            Indore Engineering Works
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffHeader;
