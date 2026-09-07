// Path in project: src/component/header/ClientHeader.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { FaCalendarAlt, FaBell, FaRegClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getUserNotifications } from '../../services/generalService';
import NotificationModal from '../models/NotificationModel';

const ROLE_ACCENT = '#225b31';
const NOTIFICATIONS_POLL_MS = 120000; // refresh unread count every 2 minutes

const getInitials = (name) => {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
};

const ClientHeader = () => {
  const { user } = useAuthStore();
  const [dateTime, setDateTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    const response = await getUserNotifications({ page: 1, limit: 20, unreadOnly: false });
    if (response) {
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    }
  }, []);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Notifications: fetch on mount, then keep the unread badge fresh
  useEffect(() => {
    loadNotifications();
    const poll = setInterval(loadNotifications, NOTIFICATIONS_POLL_MS);
    return () => clearInterval(poll);
  }, [loadNotifications]);

  const dateStr = useMemo(() => dateTime.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }), [dateTime]);
  const timeStr = useMemo(() => dateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), [dateTime]);

  const displayName = user?.name || 'User';
  const showFallbackAvatar = !user?.profile || imgFailed;

  return (
    <>
      {/* ── Desktop / tablet header ───────────────────────────────────── */}
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
          {/* Role-colored accent line */}
          <div style={{ height: '3px', background: ROLE_ACCENT }} />

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
              {/* Bell — a real button, for keyboard/focus/aria support */}
              <button
                type="button"
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                className="position-relative d-flex align-items-center justify-content-center"
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'var(--secondary)', cursor: 'pointer',
                  transition: 'background 0.2s ease', border: 'none', padding: 0,
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
              </button>

              {/* Divider */}
              <div style={{ width: 1, height: 30, background: 'var(--border)' }} />

              {/* Profile + identity */}
              <div
                className="d-flex align-items-center gap-2"
                style={{ cursor: 'pointer', borderRadius: 10, padding: '4px 6px', transition: 'background 0.15s ease' }}
                onClick={() => navigate('/client')}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {showFallbackAvatar ? (
                  <div
                    style={{
                      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: ROLE_ACCENT, color: '#fff', fontSize: '0.8rem', fontWeight: 700,
                      border: '2px solid var(--primary)',
                    }}
                  >
                    {getInitials(displayName)}
                  </div>
                ) : (
                  <img
                    src={user.profile}
                    alt="Profile"
                    className="rounded-circle"
                    style={{
                      width: 38, height: 38, objectFit: 'cover',
                      border: '2px solid var(--primary)', transition: 'all 0.2s ease',
                    }}
                    onError={() => setImgFailed(true)}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  />
                )}
                <div className="d-flex flex-column" style={{ lineHeight: 1.25 }}>
                  <span
                    title={displayName}
                    style={{
                      fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-strong)',
                      maxWidth: 130, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                  >
                    {displayName}
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                      color: ROLE_ACCENT, background: `${ROLE_ACCENT}1a`, padding: '1px 6px', borderRadius: 999,
                    }}>
                      Client
                    </span>
                    {user?.cid && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {user.cid}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Compact mobile header (previously: nothing shown below md) ── */}
      <div
        className="w-100 mb-2 d-flex d-md-none align-items-center justify-content-between"
        style={{
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
          padding: '10px 14px', boxShadow: '0 2px 8px var(--shadow-color)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', lineHeight: 1 }}>
            Rane &amp; Sons
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Client
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            className="position-relative d-flex align-items-center justify-content-center"
            style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--secondary)', border: 'none' }}
            onClick={() => setShowNotificationModal(true)}
          >
            <FaBell style={{ fontSize: '1rem', color: 'var(--primary)' }} />
            {unreadCount > 0 && (
              <span
                className="position-absolute"
                style={{
                  top: -2, right: -2, minWidth: 16, height: 16, padding: '0 4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--destructive)', color: 'var(--destructive-foreground)',
                  fontSize: '0.58rem', fontWeight: 700, borderRadius: '999px',
                  border: '2px solid var(--card)',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <div onClick={() => navigate('/client')}>
            {showFallbackAvatar ? (
              <div style={{
                width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: ROLE_ACCENT, color: '#fff', fontSize: '0.72rem', fontWeight: 700,
              }}>
                {getInitials(displayName)}
              </div>
            ) : (
              <img
                src={user.profile}
                alt="Profile"
                className="rounded-circle"
                style={{ width: 34, height: 34, objectFit: 'cover', border: `2px solid ${ROLE_ACCENT}` }}
                onError={() => setImgFailed(true)}
              />
            )}
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

export default ClientHeader;