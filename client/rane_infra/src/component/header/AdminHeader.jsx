import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { FaCalendarAlt, FaBell, FaRegClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getUserNotifications } from '../../services/generalService';
import NotificationModal from '../models/NotificationModel';

const AdminHeader = () => {
  const { user } = useAuthStore();
  const [dateTime, setDateTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const navigate = useNavigate();

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const response = await getUserNotifications({ page: 1, limit: 20, unreadOnly: false });
    if (response) {
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    }
  };

  const dateStr = dateTime.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = dateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <div className="w-100 mb-3 d-none d-md-block">
        <div
          style={{
            background: 'var(--card)',
            borderRadius: '14px',
            border: '1px solid var(--border)',
            boxShadow: '0 2px 10px var(--shadow-color)',
            overflow: 'hidden',
          }}
        >
          <div
            className="d-flex align-items-center justify-content-between"
            style={{ padding: '14px 22px' }}
          >

            {/* LEFT — E-OFFICE label + live date/time */}
            <div className="d-flex flex-column" style={{ minWidth: 230 }}>
              <span
                style={{
                  fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 5,
                }}
              >
                E‑Office
              </span>
              <span
                className="d-flex align-items-center"
                style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}
              >
                <FaCalendarAlt size={11} style={{ color: 'var(--accent)', marginRight: 6 }} />
                {dateStr}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  marginLeft: 10, paddingLeft: 10, borderLeft: '1px solid var(--border)',
                }}>
                  <FaRegClock size={11} style={{ color: 'var(--accent)' }} />
                  {timeStr}
                </span>
              </span>
            </div>

            {/* CENTER — Brand title */}
            <div className="text-center flex-grow-1 px-3">
              <h5
                className="mb-0"
                style={{
                  fontSize: '1.12rem', fontWeight: 800, letterSpacing: '0.5px',
                  color: 'var(--primary)', textTransform: 'uppercase', lineHeight: 1.2,
                }}
              >
                Rane &amp; Sons
              </h5>
              <span style={{
                fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'var(--text-muted)',
              }}>
                Work Management System
              </span>
            </div>

            {/* RIGHT — Bell + Profile + Name */}
            <div className="d-flex align-items-center gap-3" style={{ minWidth: 230, justifyContent: 'flex-end' }}>

              {/* Bell */}
              <div
                className="position-relative d-flex align-items-center justify-content-center"
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'var(--secondary)', cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--secondary-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--secondary)')}
                onClick={() => setShowNotificationModal(true)}
              >
                <FaBell style={{ fontSize: '1.1rem', color: 'var(--primary)' }} />
                {unreadCount > 0 && (
                  <span
                    className="position-absolute"
                    style={{
                      top: -2, right: -2, minWidth: 18, height: 18, padding: '0 4px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--destructive)', color: 'var(--destructive-foreground)',
                      fontSize: '0.62rem', fontWeight: 700, borderRadius: '999px',
                      border: '2px solid var(--card)',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>

              {/* Divider */}
              <div style={{ width: 1, height: 30, background: 'var(--border)' }} />

              {/* Profile + identity */}
              <div
                className="d-flex align-items-center gap-2"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/admin')}
              >
                <img
                  src={user?.profile || '/assets/images/dummyUser.jpeg'}
                  alt="Profile"
                  className="rounded-circle"
                  style={{
                    width: 38, height: 38, objectFit: 'cover',
                    border: '2px solid var(--primary)', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                />
                <div className="d-flex flex-column" style={{ lineHeight: 1.2 }}>
                  <span
                    title={user?.name || 'User'}
                    style={{
                      fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-strong)',
                      maxWidth: 130, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                  >
                    {user?.name || 'Admin'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {user?.cid ? `ID • ${user.cid}` : 'Admin'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <NotificationModal
        show={showNotificationModal}
        onHide={() => setShowNotificationModal(false)}
        notifications={notifications}
        navigate={navigate}
      />
    </>
  );
};

export default AdminHeader;