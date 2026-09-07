// Path in project: src/component/models/NotificationModel.jsx
import React from 'react';
import { Modal } from 'react-bootstrap';
import {
  FaBell, FaFileInvoiceDollar, FaMoneyCheckAlt, FaShareSquare,
  FaUserFriends, FaCog, FaExclamationTriangle, FaFileSignature,
} from 'react-icons/fa';

// Matches the Notification model's `type` enum: bill, payment, dfs, user, system, alert, agreement
const TYPE_META = {
  bill: { icon: FaFileInvoiceDollar, bg: '#3b7dd8' },
  payment: { icon: FaMoneyCheckAlt, bg: '#b95a52' },
  dfs: { icon: FaShareSquare, bg: '#6b3e2b' },
  user: { icon: FaUserFriends, bg: '#225b31' },
  system: { icon: FaCog, bg: '#8b7b74' },
  alert: { icon: FaExclamationTriangle, bg: '#d8a13a' },
  agreement: { icon: FaFileSignature, bg: '#c94a3a' },
};

const PRIORITY_ACCENT = {
  urgent: '#c94a3a',
  high: '#d8a13a',
  medium: 'transparent',
  low: 'transparent',
};

const timeAgo = (d) => {
  if (!d) return '';
  const diffMs = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export default function NotificationModal({ show, onHide, notifications = [], navigate }) {
  const handleItemClick = (n) => {
    if (n.actionUrl && navigate) {
      navigate(n.actionUrl);
    }
    onHide?.();
  };

  return (
    <Modal show={show} onHide={onHide} centered scrollable>
      <Modal.Header
        closeButton
        style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
      >
        <Modal.Title
          style={{
            fontSize: '1rem', fontWeight: 700, color: 'var(--text-strong)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <FaBell size={15} style={{ color: 'var(--accent)' }} />
          Notifications
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ background: 'var(--card)', padding: 0, maxHeight: '62vh' }}>
        {notifications.length > 0 ? (
          <div>
            {notifications.map((n, i) => {
              const meta = TYPE_META[n.type] || { icon: FaBell, bg: 'var(--secondary)' };
              const Icon = meta.icon;
              const isLast = i === notifications.length - 1;
              const accent = n.isRead ? 'transparent' : (PRIORITY_ACCENT[n.priority] || 'var(--accent)');

              return (
                <div
                  key={n._id || n.id || i}
                  onClick={() => handleItemClick(n)}
                  style={{
                    display: 'flex', gap: 12, padding: '14px 20px', alignItems: 'flex-start',
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    borderLeft: `3px solid ${accent}`,
                    background: n.isRead ? 'transparent' : 'var(--secondary)',
                    cursor: n.actionUrl ? 'pointer' : 'default',
                  }}
                >
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 10, background: meta.bg, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Icon size={14} color="#fff" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span
                        style={{
                          fontSize: '0.85rem', fontWeight: n.isRead ? 500 : 700,
                          color: 'var(--text-strong)',
                        }}
                      >
                        {n.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem', color: 'var(--text-muted)',
                          whiteSpace: 'nowrap', flexShrink: 0, marginTop: 2,
                        }}
                      >
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                      {n.message}
                    </div>
                    {n.priority === 'urgent' && (
                      <span
                        style={{
                          display: 'inline-block', marginTop: 6, fontSize: '0.62rem', fontWeight: 700,
                          letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff',
                          background: PRIORITY_ACCENT.urgent, padding: '2px 8px', borderRadius: 999,
                        }}
                      >
                        Urgent
                      </span>
                    )}
                  </div>

                  {!n.isRead && (
                    <span
                      style={{
                        width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
                        flexShrink: 0, marginTop: 6,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '52px 20px', color: 'var(--text-muted)' }}>
            <FaBell size={34} style={{ opacity: 0.35, marginBottom: 12 }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-strong)' }}>
              You're all caught up
            </div>
            <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
              No new notifications right now.
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}