import React from 'react';
import { FaBell } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';

const AdminHeader = () => {
  const { user } = useAuthStore();

  return (
    <div
      className="d-md-flex d-none justify-content-between align-items-center px-3 py-2 border-bottom"
      style={{
        backgroundColor: 'var(--admin-component-bg-color)',
        color: 'var(--admin-text-color)',
        borderBottom: '1px solid var(--admin-border-color)',
      }}
    >
      {/* Greeting */}
      <div className="fw-medium fs-6">
        Good Evening,{' '}
        <span className="fw-semibold">{user?.name || 'Admin'}</span>! 👋 Welcome back.
      </div>

      {/* Right side */}
      <div className="d-flex align-items-center gap-3">
        {/* Notification Icon */}
        <div className="position-relative">
          <FaBell size={18} style={{ color: 'var(--admin-text-color)' }} />
          <span
            className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
            style={{ width: '8px', height: '8px' }}
          ></span>
        </div>

        {/* Company Logo and Name */}
        <div className="d-flex align-items-center gap-2">
          <div
            className="fw-bold rounded d-flex justify-content-center align-items-center"
            style={{
              width: '30px',
              height: '30px',
              backgroundColor: 'var(--admin-btn-bg)',
              color: 'var(--admin-btn-text-color)',
            }}
          >
            RS
          </div>
          <div
            className="text-uppercase fw-semibold small"
            style={{
              fontSize: '0.8rem',
              color: 'var(--admin-muted-color)',
            }}
          >
            Rane and Sons
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
