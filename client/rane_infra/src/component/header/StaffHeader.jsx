import React from 'react';
import { FaCalendarAlt, FaBell } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';

const StaffHeader = () => {
  const { user } = useAuthStore();

  return (
    <div className="row mb-4 d-none d-md-block">
      <div className="col-12">
        <div className="card shadow-sm border-0" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px',
          color: 'white'
        }}>
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-2">Hi , {user.name}! </h2>
                <p className="mb-0 opacity-75">Here's your comprehensive dashboard overview</p>
                <small className="opacity-75 d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                  Last Login: {user.lastlogin ? new Date(user.lastlogin).toLocaleString() : '-'}
                </small>
              </div>
              <div className="d-flex flex-column align-items-center">
                <div className="d-flex align-items-center gap-3 mb-1">
                  <FaBell style={{ fontSize: '1.2rem', cursor: 'pointer' }} />
                  <img
                    src={user?.profile || '/assets/images/dummyUser.jpeg'}
                    alt="Profile"
                    className="rounded-circle"
                    style={{
                      width: '42px',
                      height: '42px',
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
                    // textOverflow: 'ellipsis'
                    whiteSpace: 'normal',
                    wordWrap: 'break-word'
                  }}
                >
                  Client ID: {user?.cid || 'User'}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffHeader;