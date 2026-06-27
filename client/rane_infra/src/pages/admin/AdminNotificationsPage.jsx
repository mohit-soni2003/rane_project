import React, { useState, useEffect } from 'react';
import {
  FiBell, FiCheck, FiTrash2, FiSearch, FiX, FiRefreshCw, FiInbox,
  FiExternalLink, FiFileText, FiDollarSign, FiLayers, FiUser,
  FiSettings, FiAlertCircle,
} from 'react-icons/fi';
import AdminHeader from '../../component/header/AdminHeader';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../../services/notificationService';

// ── Type meta (palette tokens only) ──────────────────────────────────────────
const typeMeta = (type) => {
  switch (type) {
    case 'bill':    return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)', Icon: FiFileText,   label: 'Bill' };
    case 'payment': return { bg: 'var(--success)',   color: 'var(--success-foreground)',   Icon: FiDollarSign, label: 'Payment' };
    case 'dfs':     return { bg: 'var(--info)',      color: 'var(--info-foreground)',      Icon: FiLayers,     label: 'DFS' };
    case 'user':    return { bg: 'var(--warning)',   color: 'var(--warning-foreground)',   Icon: FiUser,       label: 'User' };
    case 'system':  return { bg: 'var(--muted)',     color: 'var(--text-muted)',           Icon: FiSettings,   label: 'System' };
    case 'alert':   return { bg: 'var(--destructive)', color: 'var(--destructive-foreground)', Icon: FiAlertCircle, label: 'Alert' };
    default:        return { bg: 'var(--muted)',     color: 'var(--text-muted)',           Icon: FiBell,       label: type || '—' };
  }
};

const priorityMeta = (priority) => {
  switch (priority) {
    case 'urgent': return { color: 'var(--destructive)',      label: 'Urgent' };
    case 'high':   return { color: 'var(--gold)',             label: 'High' };
    case 'medium': return { color: 'var(--info-foreground)',  label: 'Medium' };
    case 'low':    return { color: 'var(--text-muted)',       label: 'Low' };
    default:       return { color: 'var(--text-muted)',       label: priority || '—' };
  }
};

const TypePill = ({ type }) => {
  const m = typeMeta(type);
  return (
    <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
};

const PriorityTag = ({ priority }) => {
  const m = priorityMeta(priority);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
      {m.label}
    </span>
  );
};

const formatTimeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');       // all | unread | read
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter, typeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications(1, 50, filter === 'unread');
      let list = data.notifications || [];
      if (typeFilter !== 'all') list = list.filter(n => n.type === typeFilter);
      setNotifications(list);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      setUnreadCount(await getUnreadNotificationCount());
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const target = notifications.find(n => n._id === id);
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (target && !target.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const resetFilters = () => { setSearchText(''); setFilter('all'); setTypeFilter('all'); };

  const counts = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    urgent: notifications.filter(n => n.priority === 'urgent').length,
  };

  const visible = notifications.filter(n => {
    const term = searchText.toLowerCase();
    const matchesSearch = !term ||
      n.title?.toLowerCase().includes(term) ||
      n.message?.toLowerCase().includes(term) ||
      n.sender?.name?.toLowerCase().includes(term);
    const matchesRead = filter === 'unread' ? !n.isRead : filter === 'read' ? n.isRead : true;
    return matchesSearch && matchesRead;
  });

  // ── Shared styles ──
  const btnStyle = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 7,
    border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
  };
  const ctrlStyle = {
    width: '100%', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 12px',
    fontSize: 13, color: 'var(--foreground)', background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
  };
  const iconBtn = (color, borderColor) => ({
    ...btnStyle, padding: '7px', color, borderColor: borderColor || 'var(--border)',
  });

  return (
    <>
      <AdminHeader />

      <div style={{ background: 'var(--background)', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: 'var(--foreground)', padding: '0 2px' }}>

        {/* ── Lifted page card ── */}
        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', boxShadow: '0 2px 10px var(--shadow-color)', overflow: 'hidden', marginBottom: 16 }}>

          {/* ── Title bar ── */}
          <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiBell size={16} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>Notifications</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
                </div>
              </div>
            </div>
            {counts.unread > 0 && (
              <button style={{ ...btnStyle, background: 'var(--primary)', color: '#fff', border: 'none' }} onClick={handleMarkAllAsRead}>
                <FiCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* ── Body ── */}
          <div style={{ padding: '16px 20px' }}>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Loaded', value: counts.total, sub: 'In current view', icon: <FiBell size={15} /> },
                { label: 'Unread', value: counts.unread, sub: 'Need attention', icon: <FiInbox size={15} /> },
                { label: 'Urgent', value: counts.urgent, sub: 'Highest priority', icon: <FiAlertCircle size={15} /> },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
                    <span style={{ color: 'var(--accent)' }}>{s.icon}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 3 }}>{loading ? '—' : s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Search & filter */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-strong)', marginBottom: 2 }}>Filter notifications</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Search the text, then narrow by read status and type.</div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search</label>
                  <div style={{ position: 'relative' }}>
                    <FiSearch size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text" placeholder="Search title, message or sender…"
                      value={searchText} onChange={e => setSearchText(e.target.value)}
                      style={{ ...ctrlStyle, padding: '8px 30px 8px 32px' }}
                    />
                    {searchText && <FiX size={14} onClick={() => setSearchText('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer' }} />}
                  </div>
                </div>

                <div style={{ minWidth: 140 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                  <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...ctrlStyle, cursor: 'pointer' }}>
                    <option value="all">All</option>
                    <option value="unread">Unread only</option>
                    <option value="read">Read only</option>
                  </select>
                </div>

                <div style={{ minWidth: 140 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</label>
                  <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...ctrlStyle, cursor: 'pointer' }}>
                    <option value="all">All types</option>
                    <option value="bill">Bills</option>
                    <option value="payment">Payments</option>
                    <option value="dfs">DFS</option>
                    <option value="user">Users</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <button style={{ ...btnStyle, padding: '8px 12px' }} onClick={resetFilters}>
                  <FiRefreshCw size={13} /> Reset
                </button>
              </div>
            </div>

            {/* States */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <FiRefreshCw size={22} color="var(--accent)" style={{ marginBottom: 12, animation: 'spin 1s linear infinite' }} />
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading notifications…</div>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--card)', border: '1px solid var(--destructive-border)', borderRadius: 10 }}>
                <FiAlertCircle size={24} color="var(--destructive)" style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-strong)', marginBottom: 6 }}>Couldn't load notifications</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>{error}</div>
                <button style={{ ...btnStyle, margin: '0 auto' }} onClick={fetchNotifications}>
                  <FiRefreshCw size={13} /> Try again
                </button>
              </div>
            ) : visible.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <FiInbox size={24} color="var(--muted-foreground)" style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-strong)', marginBottom: 4 }}>No notifications found</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {filter === 'unread' ? 'You have no unread notifications.' : 'No notifications match your current filters.'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {visible.map((n) => {
                  const m = typeMeta(n.type);
                  return (
                    <div key={n._id} style={{ display: 'flex', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                      {/* Unread accent strip */}
                      <div style={{ width: 3, flexShrink: 0, background: n.isRead ? 'transparent' : 'var(--accent)' }} />

                      <div style={{ flex: 1, minWidth: 0, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          {/* Type icon chip */}
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <m.Icon size={16} color={m.color} />
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 5 }}>
                              <TypePill type={n.type} />
                              <PriorityTag priority={n.priority} />
                              {!n.isRead && (
                                <span style={{ background: 'var(--secondary)', color: 'var(--primary)', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, letterSpacing: '0.04em' }}>
                                  UNREAD
                                </span>
                              )}
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                                {formatTimeAgo(n.createdAt)}
                              </span>
                            </div>

                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.3, marginBottom: 3 }}>
                              {n.title}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                              {n.message}
                            </div>

                            {n.sender?.name && (
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                                From <span style={{ color: 'var(--text-strong)', fontWeight: 600 }}>{n.sender.name}</span>
                              </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                              {n.actionUrl && (
                                <a href={n.actionUrl} style={{ ...btnStyle, padding: '5px 10px', fontSize: 11.5, color: 'var(--accent)', borderColor: 'var(--accent)', textDecoration: 'none' }}>
                                  <FiExternalLink size={12} /> View details
                                </a>
                              )}
                              {!n.isRead && (
                                <button style={{ ...btnStyle, padding: '5px 10px', fontSize: 11.5, color: 'var(--success-foreground)', borderColor: 'var(--success-border)' }} onClick={() => handleMarkAsRead(n._id)}>
                                  <FiCheck size={12} /> Mark read
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteNotification(n._id)}
                            title="Delete notification"
                            style={iconBtn('var(--destructive)', 'var(--destructive-border)')}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--destructive-bg)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--card)'; }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Footer count */}
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Showing {visible.length} notification{visible.length === 1 ? '' : 's'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default AdminNotificationsPage;