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
    const timer = setInterval(() => setDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-100 mb-2 d-none d-md-block">
      <div
        className="card shadow-sm border-0"
        style={{
          background: 'var(--card)',
          borderRadius: '12px',
          color: 'var(--card-foreground)',
          border: '1px solid var(--border)',
          boxShadow: '0 3px 8px var(--muted-foreground)',
        }}
      >
        <div className="card-body px-4 py-3 d-flex align-items-center justify-content-between">

          {/* LEFT SECTION - E-OFFICE + Date */}
          <div className="d-flex flex-column">
            <h6
              className="fst-italic mb-1"
              style={{ fontSize: '0.75rem', color: 'var(--primary)' }}
            >
              E - OFFICE
            </h6>
            <small
              className="d-flex align-items-center"
              style={{
                fontSize: '0.75rem',
                color: 'var(--muted-foreground)',
              }}
            >
              <FaCalendarAlt className="me-1" style={{ color: 'var(--accent)' }} />
              {dateTime.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} &nbsp; | &nbsp;
              {dateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </small>

           
          </div>

          {/* CENTER SECTION - Title */}
          <div className="text-center flex-grow-1">
            <h5
              className="fw-bold text-uppercase mb-0"
              style={{
                fontSize: '1.1rem',
                letterSpacing: '0.4px',
                fontWeight: '800',
                color: 'var(--primary)',
              }}
            >
              RANE & SONS - WORK MANAGEMENT SYSTEM
            </h5>
          </div>

          {/* RIGHT SECTION - Bell + Profile + Name */}
          <div className="d-flex flex-column align-items-center">
            <div className="d-flex align-items-center gap-3 mb-1">
              <FaBell
                style={{
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: 'var(--accent)',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = 'var(--primary)')}
                onMouseLeave={(e) => (e.target.style.color = 'var(--accent)')}
              />

              <img
                src={user?.profile || '/assets/images/dummyUser.jpeg'}
                alt="Profile"
                className="rounded-circle"
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'cover',
                  border: '2px solid var(--primary)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate('/client')}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 4px 12px var(--muted-foreground)';
                  e.target.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = 'var(--primary)';
                }}
              />
            </div>

            <small
              title={user?.name || 'User'}
              style={{
                fontSize: '0.7rem',
                fontWeight: '500',
                color: 'var(--secondary-foreground)',
                maxWidth: '100px',
                textAlign: 'center',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
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
