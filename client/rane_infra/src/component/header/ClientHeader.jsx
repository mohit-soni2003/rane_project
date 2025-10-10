import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { FaCalendarAlt, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ClientHeader = () => {
  const { user } = useAuthStore();
  const [dateTime, setDateTime] = useState(new Date());
  const navigate = useNavigate();

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-100 mb-2">
      <div
        className="card shadow-sm border-0"
        style={{
          background: 'linear-gradient(135deg, var(--client-header-gradient-start), var(--client-header-gradient-end))',
          borderRadius: '12px',
          color: 'var(--client-header-text)',
          boxShadow: `0 3px 8px var(--client-header-shadow)`
        }}
      >
        <div className="card-body px-4 py-3 d-flex align-items-center justify-content-between">

          {/* LEFT SECTION - E-OFFICE + Date */}
          <div className="d-flex flex-column">
            <h6 className="fst-italic mb-1" style={{ fontSize: '0.75rem' }}>E - OFFICE</h6>
            <small className="opacity-75 d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
              <FaCalendarAlt className="me-1" />
              {dateTime.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} &nbsp; | &nbsp;
              {dateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </small>
            <small className="opacity-75 d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
               Last Login: {user.lastlogin ? new Date(user.lastlogin).toLocaleString() : '-'}
            </small>
          </div>

          {/* CENTER SECTION - Title */}
          <div className="text-center flex-grow-1">
            <h5
              className="fw-bold text-uppercase mb-0"
              style={{
                fontSize: '1.1rem',
                letterSpacing: '0.4px',
                fontWeight: '800'
              }}
            >
              RANE & SONS - WORK MANAGEMENT SYSTEM
            </h5>
          </div>

          {/* RIGHT SECTION - Bell + Profile + Name */}
          <div className="d-flex flex-column align-items-center">
            <div className="d-flex align-items-center gap-3 mb-1">
              <FaBell style={{ fontSize: '1.2rem', cursor: 'pointer' }} />
              <img
                src={user?.profile || '/assets/images/dummyUser.jpeg'}
                alt="Profile"
                className="rounded-circle"
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'cover',
                  border: '2px solid var(--client-profile-border)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => navigate('/client')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                  e.target.style.borderColor = 'var(--client-primary-color, #007bff)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = 'var(--client-profile-border)';
                }}
              />
            </div>
            <small
              title={user?.name || 'User'}
              style={{
                fontSize: '0.7rem',
                fontWeight: '500',
                maxWidth: '100px',
                textAlign: 'center',
                // overflow: 'hidden',
                whiteSpace: 'nowrap',
                // textOverflow: 'ellipsis'
              }}
            >
              Client ID: {user?.cid || 'User'}
            </small>
          </div>


        </div>
      </div>
    </div>
  );
};

export default ClientHeader;
