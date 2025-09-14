import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Dropdown } from 'react-bootstrap';
import { FaBell, FaCheck, FaTrash, FaEye, FaFilter } from 'react-icons/fa';
import AdminHeader from '../../component/header/AdminHeader';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../../services/notificationService';

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all'); // all, bill, payment, dfs, user, system

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter, typeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const unreadOnly = filter === 'unread';
      const data = await getNotifications(1, 50, unreadOnly);

      let filteredNotifications = data.notifications || [];

      // Apply type filter
      if (typeFilter !== 'all') {
        filteredNotifications = filteredNotifications.filter(
          notification => notification.type === typeFilter
        );
      }

      setNotifications(filteredNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
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

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      // Update unread count if deleted notification was unread
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'bill': return 'primary';
      case 'payment': return 'success';
      case 'dfs': return 'info';
      case 'user': return 'warning';
      case 'system': return 'dark';
      case 'alert': return 'danger';
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

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  return (
    <>
      <AdminHeader />
      <Container fluid className="py-4">
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="mb-1" style={{ color: 'var(--admin-heading-color)' }}>
                  <FaBell className="me-2" />
                  Notifications
                </h2>
                <p className="text-muted mb-0">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>

              <div className="d-flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline-primary"
                    onClick={handleMarkAllAsRead}
                    className="d-flex align-items-center"
                  >
                    <FaCheck className="me-1" />
                    Mark All Read
                  </Button>
                )}

                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" id="filter-dropdown">
                    <FaFilter className="me-1" />
                    Filter: {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Read'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setFilter('all')}>
                      All Notifications
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setFilter('unread')}>
                      Unread Only
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setFilter('read')}>
                      Read Only
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" id="type-filter-dropdown">
                    Type: {typeFilter === 'all' ? 'All' : typeFilter.toUpperCase()}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setTypeFilter('all')}>All Types</Dropdown.Item>
                    <Dropdown.Item onClick={() => setTypeFilter('bill')}>Bills</Dropdown.Item>
                    <Dropdown.Item onClick={() => setTypeFilter('payment')}>Payments</Dropdown.Item>
                    <Dropdown.Item onClick={() => setTypeFilter('dfs')}>DFS</Dropdown.Item>
                    <Dropdown.Item onClick={() => setTypeFilter('user')}>Users</Dropdown.Item>
                    <Dropdown.Item onClick={() => setTypeFilter('system')}>System</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <div className="mt-2 text-muted">Loading notifications...</div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Alert variant="info" className="text-center py-5">
                <FaBell size={48} className="mb-3 opacity-50" />
                <h5>No notifications found</h5>
                <p className="mb-0">
                  {filter === 'unread'
                    ? 'You have no unread notifications.'
                    : 'No notifications match your current filters.'}
                </p>
              </Alert>
            ) : (
              <Row>
                {filteredNotifications.map((notification) => (
                  <Col md={12} key={notification._id} className="mb-3">
                    <Card
                      className={`shadow-sm ${!notification.isRead ? 'border-primary' : ''}`}
                      style={{
                        backgroundColor: 'var(--admin-component-bg-color)',
                        borderColor: !notification.isRead ? 'var(--admin-btn-primary-bg)' : 'var(--admin-border-color)'
                      }}
                    >
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <Badge bg={getTypeColor(notification.type)} className="text-white">
                                {notification.type.toUpperCase()}
                              </Badge>
                              <Badge bg={getPriorityColor(notification.priority)} className="text-white">
                                {notification.priority.toUpperCase()}
                              </Badge>
                              {!notification.isRead && (
                                <Badge bg="primary" className="text-white">
                                  UNREAD
                                </Badge>
                              )}
                              <small className="text-muted">
                                {formatTimeAgo(notification.createdAt)}
                              </small>
                            </div>

                            <h6 className="mb-2" style={{ color: 'var(--admin-text-color)' }}>
                              {notification.title}
                            </h6>

                            <p className="mb-2 text-muted">
                              {notification.message}
                            </p>

                            {notification.sender && (
                              <div className="small text-muted mb-2">
                                <strong>From:</strong> {notification.sender.name}
                              </div>
                            )}

                            {notification.actionUrl && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => window.location.href = notification.actionUrl}
                                className="me-2"
                              >
                                <FaEye className="me-1" />
                                View Details
                              </Button>
                            )}
                          </div>

                          <div className="d-flex gap-1">
                            {!notification.isRead && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification._id)}
                                title="Mark as read"
                              >
                                <FaCheck />
                              </Button>
                            )}

                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification._id)}
                              title="Delete notification"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AdminNotificationsPage;
