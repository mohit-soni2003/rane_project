import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { FaCalendarAlt } from 'react-icons/fa';

const ClientHeader = () => {
  const { user } = useAuthStore();

  return (
    <>
      {/* Welcome Header Section */}
      <div className="w-100 mb-4">
        <div className="card shadow-sm border-0 position-relative" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px',
          color: 'white'
        }}>
          {/* Profile Picture - Top Right */}
          <img
            src={user?.profile || '/assets/images/dummyUser.jpeg'}
            alt="Profile"
            className="rounded-circle position-absolute"
            style={{
              width: '50px',
              height: '50px',
              objectFit: 'cover',
              aspectRatio: '1 / 1',
              borderRadius: '50%',
              top: '15px',
              right: '15px',
              border: '3px solid rgba(255,255,255,0.8)',
              zIndex: '10'
            }}
          />

          <div className="card-body p-4">
            {/* Top Section - Company Info */}
            <div className="mb-3">
              <div className="d-flex align-items-center mb-2">
                <h6 className="fst-italic mb-0 me-3">E - OFFICE</h6>
                <div className="flex-grow-1 text-center">
                  <h5 className="fw-bold text-uppercase mb-0" style={{ fontSize: '1.3rem', letterSpacing: '0.5px', fontWeight: '900' }}>
                    RANE & SONS - WORK MANAGEMENT SYSTEM
                  </h5>
                </div>
              </div>
              <div className="text-center">
                <h6 className="mb-0">{user?.name || "User Name"}</h6>
              </div>
            </div>

            {/* Middle Section - User Info */}
            <div className="d-flex justify-content-end align-items-center">
              <div className="text-end">
                <h6 className="mb-1">Client ID: {user?.cid || "Not Assigned"}</h6>
                <small className="opacity-75">
                  <FaCalendarAlt className="me-1" />
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientHeader;
