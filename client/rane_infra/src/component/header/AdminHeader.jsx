import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaTrash, FaEye } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../../services/notificationService';
import { Dropdown, Badge, Button, Spinner } from 'react-bootstrap';

const AdminHeader = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Fetch unread count on component mount
  useEffect(() => {
    fetchUnreadCount();

    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async (showUnreadOnly = true) => {
    if (loading) return;

    setLoading(true);
    try {
      const data = await getNotifications(1, showAll ? 50 : 10, showUnreadOnly && !showAll);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to the action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

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
        {/* Notification Dropdown */}
        <Dropdown onToggle={(isOpen) => isOpen && fetchNotifications()}>
          <Dropdown.Toggle
            variant="link"
            className="p-0 position-relative"
            style={{ color: 'var(--admin-text-color)' }}
          >
            <FaBell size={18} />
            {unreadCount > 0 && (
              <Badge
                bg="danger"
                className="position-absolute top-0 start-100 translate-middle rounded-circle"
                style={{ fontSize: '0.7rem', minWidth: '18px', height: '18px' }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu
            align="end"
            className="mt-2"
            style={{
              width: '400px',
              maxHeight: '500px',
              overflowY: 'auto',
              backgroundColor: 'var(--admin-component-bg-color)',
              border: '1px solid var(--admin-border-color)'
            }}
          >
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h6 className="mb-0 fw-bold" style={{ color: 'var(--admin-heading-color)' }}>
                Notifications
              </h6>
              <div className="d-flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-none"
                    onClick={handleMarkAllAsRead}
                    style={{ color: 'var(--admin-btn-primary-bg)' }}
                  >
                    <FaCheck className="me-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-decoration-none"
                  onClick={() => setShowAll(!showAll)}
                  style={{ color: 'var(--admin-text-color)' }}
                >
                  {showAll ? 'Show recent' : 'Show all'}
                </Button>
              </div>
            </div>

            <div className="p-0">
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" size="sm" />
                  <div className="small text-muted mt-2">Loading...</div>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Dropdown.Item
                    key={notification._id}
                    className={`px-3 py-3 border-bottom ${!notification.isRead ? 'bg-light' : ''}`}
                    style={{
                      backgroundColor: !notification.isRead ? 'rgba(26, 188, 156, 0.1)' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <Badge bg={getPriorityColor(notification.priority)} className="text-white">
                            {notification.type.toUpperCase()}
                          </Badge>
                          <small className="text-muted">
                            {formatTimeAgo(notification.createdAt)}
                          </small>
                        </div>
                        <div className="fw-semibold small mb-1" style={{ color: 'var(--admin-text-color)' }}>
                          {notification.title}
                        </div>
                        <div className="small text-muted mb-2">
                          {notification.message}
                        </div>
                        {notification.sender && (
                          <div className="small text-muted">
                            From: {notification.sender.name}
                          </div>
                        )}
                      </div>
                      <div className="d-flex gap-1">
                        {!notification.isRead && (
                          <div
                            className="rounded-circle bg-primary"
                            style={{ width: '8px', height: '8px', marginTop: '6px' }}
                          ></div>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-danger"
                          onClick={(e) => handleDeleteNotification(notification._id, e)}
                        >
                          <FaTrash size={12} />
                        </Button>
                      </div>
                    </div>
                  </Dropdown.Item>
                ))
              ) : (
                <div className="text-center py-4 text-muted">
                  <FaBell size={32} className="mb-2 opacity-50" />
                  <div>No notifications</div>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-2 border-top text-center">
                <Button
                  variant="link"
                  size="sm"
                  className="text-decoration-none"
                  onClick={() => window.location.href = '/admin/notifications'}
                  style={{ color: 'var(--admin-btn-primary-bg)' }}
                >
                  <FaEye className="me-1" />
                  View All Notifications
                </Button>
              </div>
            )}
          </Dropdown.Menu>
        </Dropdown>

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
