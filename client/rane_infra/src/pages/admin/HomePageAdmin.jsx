import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Button, Table, Badge, Spinner,
  ProgressBar, Alert, Modal
} from 'react-bootstrap';
import {
  FaUsers, FaFileInvoiceDollar, FaClipboardList, FaChartLine,
  FaEye, FaCheckCircle, FaClock, FaExclamationTriangle,
  FaRupeeSign, FaFileAlt, FaBell, FaCog, FaPlus
} from 'react-icons/fa';
import AdminHeader from '../../component/header/AdminHeader';
import { getAllBills } from '../../services/billServices';
import { getAllUsers } from '../../services/userServices';
import { getAllDfsRequests } from '../../services/dfsService';
import { getAllPayments } from '../../services/paymentService';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function HomePageAdmin() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBills: 0,
    totalDfsRequests: 0,
    totalPayments: 0,
    pendingBills: 0,
    recentBills: [],
    recentRequests: [],
    recentUsers: [],
    recentPayments: []
  });
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [billsData, usersData, dfsData, paymentsData] = await Promise.all([
        getAllBills(),
        getAllUsers(),
        getAllDfsRequests(),
        getAllPayments()
      ]);

      // Process bills data
      const bills = billsData || [];
      const pendingBills = bills.filter(bill => bill.paymentStatus === 'Pending').length;
      
      // Sort bills by submittedAt date (newest first) and get recent 3
      const sortedBills = bills.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      const recentBills = sortedBills.slice(0, 3);

      // Process users data
      const users = usersData || [];
      // Sort users by _id (newest first) and get recent 3
      const sortedUsers = users.sort((a, b) => {
        // MongoDB ObjectId contains timestamp, so we can extract it for sorting
        const aTime = a._id ? new Date(parseInt(a._id.toString().slice(0, 8), 16) * 1000) : new Date(0);
        const bTime = b._id ? new Date(parseInt(b._id.toString().slice(0, 8), 16) * 1000) : new Date(0);
        return bTime - aTime;
      });
      const recentUsers = sortedUsers.slice(0, 3);

      // Process DFS requests
      const dfsRequests = Array.isArray(dfsData) ? dfsData : [];
      // Sort DFS requests by creation date (newest first) and get recent 3
      const sortedRequests = dfsRequests
        .filter(request => request && request._id) // Filter out invalid entries
        .sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt) : 
                       (a._id ? new Date(parseInt(a._id.toString().slice(0, 8), 16) * 1000) : new Date(0));
          const bDate = b.createdAt ? new Date(b.createdAt) : 
                       (b._id ? new Date(parseInt(b._id.toString().slice(0, 8), 16) * 1000) : new Date(0));
          return bDate - aDate;
        });
      const recentRequests = sortedRequests.slice(0, 3);

      // Process payments
      const payments = Array.isArray(paymentsData) ? paymentsData : [];
      // Sort payments by submittedAt date (newest first) and get recent 3
      const sortedPayments = payments
        .filter(payment => payment && payment._id) // Filter out invalid entries
        .sort((a, b) => {
          const aDate = a.submittedAt ? new Date(a.submittedAt) : 
                       (a._id ? new Date(parseInt(a._id.toString().slice(0, 8), 16) * 1000) : new Date(0));
          const bDate = b.submittedAt ? new Date(b.submittedAt) : 
                       (b._id ? new Date(parseInt(b._id.toString().slice(0, 8), 16) * 1000) : new Date(0));
          return bDate - aDate;
        });
      const recentPayments = sortedPayments.slice(0, 3);

      setStats({
        totalUsers: users.length,
        totalBills: bills.length,
        totalDfsRequests: dfsRequests.length,
        totalPayments: payments.length,
        pendingBills,
        recentBills,
        recentRequests,
        recentUsers,
        recentPayments
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend }) => (
    <Card className="h-100 shadow-sm border-0" style={{
      backgroundColor: 'var(--admin-component-bg-color)',
      border: '1px solid var(--admin-border-color)'
    }}>
      <Card.Body className="d-flex align-items-center">
        <div className="flex-grow-1">
          <div className="text-muted small mb-1">{title}</div>
          <div className="h4 mb-0 fw-bold" style={{ color: 'var(--admin-heading-color)' }}>
            {loading ? <Spinner size="sm" /> : value}
          </div>
          {trend && (
            <div className="small text-success mt-1">
              <FaChartLine className="me-1" />
              {trend}
            </div>
          )}
        </div>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: '50px',
            height: '50px',
            backgroundColor: color,
            color: 'white'
          }}
        >
          {icon}
        </div>
      </Card.Body>
    </Card>
  );

  const RecentItemCard = ({ title, items, onViewAll, renderItem, emptyMessage }) => (
    <Card className="h-100 shadow-sm border-0" style={{
      backgroundColor: 'var(--admin-component-bg-color)',
      border: '1px solid var(--admin-border-color)'
    }}>
      <Card.Header className="d-flex justify-content-between align-items-center border-0" style={{
        backgroundColor: 'var(--admin-component-bg-color)',
        color: 'var(--admin-heading-color)'
      }}>
        <h6 className="mb-0 fw-bold">{title}</h6>
        <Button
          variant="link"
          size="sm"
          className="p-0 text-decoration-none"
          onClick={onViewAll}
          style={{ color: 'var(--admin-btn-primary-bg)' }}
        >
          View All <FaEye className="ms-1" />
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" size="sm" />
          </div>
        ) : items.length > 0 ? (
          <div className="list-group list-group-flush">
            {items.map((item, index) => renderItem(item, index))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted small">
            {emptyMessage}
          </div>
        )}
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <>
        <AdminHeader />
        <Container fluid className="py-4 text-center" style={{ backgroundColor: 'var(--admin-dashboard-bg-color)', minHeight: '100vh' }}>
          <Spinner animation="border" variant="primary" size="lg" />
          <div className="mt-2 text-muted">Loading dashboard...</div>
        </Container>
      </>
    );
  }

  return (
    <>
      <AdminHeader />

      <Container fluid className="py-4" style={{ backgroundColor: 'var(--admin-dashboard-bg-color)', minHeight: '100vh' }}>

        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1 fw-bold" style={{ color: 'var(--admin-heading-color)' }}>
                  Welcome back, {user?.name || 'Admin'}! 👋
                </h2>
                <p className="text-muted mb-0">Here's what's happening with your business today.</p>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowNotification(true)}
                  style={{
                    borderColor: 'var(--admin-btn-primary-bg)',
                    color: 'var(--admin-btn-primary-bg)'
                  }}
                >
                  <FaBell className="me-1" />
                  Notifications
                </Button>
                <Button
                  style={{
                    backgroundColor: 'var(--admin-btn-primary-bg)',
                    borderColor: 'var(--admin-btn-primary-bg)',
                    color: 'var(--admin-btn-primary-text)'
                  }}
                >
                  <FaPlus className="me-1" />
                  Quick Actions
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<FaUsers />}
              color="var(--admin-btn-primary-bg)"
              trend="+12% this month"
            />
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <StatCard
              title="Total Bills"
              value={stats.totalBills}
              icon={<FaFileInvoiceDollar />}
              color="var(--admin-info-color)"
              trend="+8% this month"
            />
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <StatCard
              title="DFS Requests"
              value={stats.totalDfsRequests}
              icon={<FaClipboardList />}
              color="var(--admin-warning-color)"
              trend="+15% this month"
            />
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <StatCard
              title="Total Payments"
              value={stats.totalPayments}
              icon={<FaRupeeSign />}
              color="var(--admin-success-color)"
              trend="+20% this month"
            />
          </Col>
        </Row>

        {/* Progress Overview */}
        <Row className="mb-4">
          <Col lg={8}>
            <Card className="shadow-sm border-0" style={{
              backgroundColor: 'var(--admin-component-bg-color)',
              border: '1px solid var(--admin-border-color)'
            }}>
              <Card.Header className="border-0" style={{
                backgroundColor: 'var(--admin-component-bg-color)',
                color: 'var(--admin-heading-color)'
              }}>
                <h6 className="mb-0 fw-bold">Monthly Overview</h6>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col sm={6}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Bill Processing</span>
                      <span className="small fw-bold">75%</span>
                    </div>
                    <ProgressBar
                      now={75}
                      style={{ height: '6px' }}
                      variant="success"
                    />
                  </Col>
                  <Col sm={6}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Payment Collection</span>
                      <span className="small fw-bold">60%</span>
                    </div>
                    <ProgressBar
                      now={60}
                      style={{ height: '6px' }}
                      variant="info"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col sm={6}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">User Onboarding</span>
                      <span className="small fw-bold">85%</span>
                    </div>
                    <ProgressBar
                      now={85}
                      style={{ height: '6px' }}
                      variant="primary"
                    />
                  </Col>
                  <Col sm={6}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Document Processing</span>
                      <span className="small fw-bold">45%</span>
                    </div>
                    <ProgressBar
                      now={45}
                      style={{ height: '6px' }}
                      variant="warning"
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="shadow-sm border-0 h-100" style={{
              backgroundColor: 'var(--admin-component-bg-color)',
              border: '1px solid var(--admin-border-color)'
            }}>
              <Card.Header className="border-0" style={{
                backgroundColor: 'var(--admin-component-bg-color)',
                color: 'var(--admin-heading-color)'
              }}>
                <h6 className="mb-0 fw-bold">Quick Actions</h6>
              </Card.Header>
              <Card.Body className="d-grid gap-2">
                <Button
                  variant="outline-primary"
                  className="text-start"
                  onClick={() => navigate('/admin/bill')}
                  style={{
                    borderColor: 'var(--admin-btn-primary-bg)',
                    color: 'var(--admin-btn-primary-bg)'
                  }}
                >
                  <FaFileInvoiceDollar className="me-2" />
                  View All Bills
                </Button>
                <Button
                  variant="outline-success"
                  className="text-start"
                  onClick={() => navigate('/admin/payment-request')}
                  style={{
                    borderColor: 'var(--admin-btn-success-bg)',
                    color: 'var(--admin-btn-success-bg)'
                  }}
                >
                  <FaRupeeSign className="me-2" />
                  Payment Requests
                </Button>
                <Button
                  variant="outline-info"
                  className="text-start"
                  onClick={() => navigate('/admin/danger/all-dfs')}
                  style={{
                    borderColor: 'var(--admin-info-color)',
                    color: 'var(--admin-info-color)'
                  }}
                >
                  <FaClipboardList className="me-2" />
                  DFS Requests
                </Button>
                <Button
                  variant="outline-warning"
                  className="text-start"
                  onClick={() => navigate('/admin/danger/all-user')}
                  style={{
                    borderColor: 'var(--admin-warning-color)',
                    color: 'var(--admin-warning-color)'
                  }}
                >
                  <FaUsers className="me-2" />
                  Manage Users
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Items */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <RecentItemCard
              title="Recent Bills"
              items={stats.recentBills}
              onViewAll={() => navigate('/admin/bill')}
              emptyMessage="No recent bills"
              renderItem={(bill, index) => (
                <div
                  key={bill._id}
                  className="list-group-item border-0 px-3 py-3"
                  style={{ backgroundColor: 'transparent', cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/bill/${bill._id}`)}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="fw-semibold small mb-1" style={{ color: 'var(--admin-text-color)' }}>
                        {bill.firmName || 'N/A'}
                      </div>
                      <div className="small text-muted">
                        {bill.user?.name || 'N/A'} • {new Date(bill.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge
                      bg={
                        bill.paymentStatus === 'Paid' ? 'success' :
                        bill.paymentStatus === 'Pending' ? 'warning' : 'secondary'
                      }
                      className="ms-2"
                    >
                      {bill.paymentStatus || 'Pending'}
                    </Badge>
                  </div>
                </div>
              )}
            />
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <RecentItemCard
              title="Recent Payment Requests"
              items={stats.recentPayments}
              onViewAll={() => navigate('/admin/payment-request')}
              emptyMessage="No recent payment requests"
              renderItem={(payment, index) => (
                <div
                  key={payment._id || index}
                  className="list-group-item border-0 px-3 py-3"
                  style={{ backgroundColor: 'transparent', cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/payment-request/${payment._id}`)}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="fw-semibold small mb-1" style={{ color: 'var(--admin-text-color)' }}>
                        ₹{payment.amount || 'N/A'}
                      </div>
                      <div className="small text-muted">
                        {payment.user?.name || payment.requestedBy || 'Unknown'} • {payment.paymentType || 'N/A'}
                      </div>
                    </div>
                    <Badge
                      bg={
                        payment.status === 'Paid' ? 'success' :
                        payment.status === 'Pending' ? 'warning' :
                        payment.status === 'Rejected' ? 'danger' : 'secondary'
                      }
                      className="ms-2"
                    >
                      {payment.status || 'Pending'}
                    </Badge>
                  </div>
                </div>
              )}
            />
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <RecentItemCard
              title="Recent DFS Requests"
              items={stats.recentRequests}
              onViewAll={() => navigate('/admin/danger/all-dfs')}
              emptyMessage="No recent DFS requests"
              renderItem={(request, index) => (
                <div
                  key={request._id || index}
                  className="list-group-item border-0 px-3 py-3"
                  style={{ backgroundColor: 'transparent', cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/dfsrequest/${request._id}`)}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="fw-semibold small mb-1" style={{ color: 'var(--admin-text-color)' }}>
                        {request.fileTitle || request.title || 'Untitled Document'}
                      </div>
                      <div className="small text-muted">
                        {request.uploadedBy?.name || request.uploader || 'Unknown'} • {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <Badge bg="info" className="ms-2">
                      {request.status || 'Active'}
                    </Badge>
                  </div>
                </div>
              )}
            />
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <RecentItemCard
              title="Recent Users"
              items={stats.recentUsers}
              onViewAll={() => navigate('/admin/danger/all-user')}
              emptyMessage="No recent users"
              renderItem={(user, index) => (
                <div
                  key={user._id}
                  className="list-group-item border-0 px-3 py-3"
                  style={{ backgroundColor: 'transparent', cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/client-detail/${user._id}`)}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="fw-semibold small mb-1" style={{ color: 'var(--admin-text-color)' }}>
                        {user.name || 'N/A'}
                      </div>
                      <div className="small text-muted">
                        {user.email || 'N/A'} • CID: {user.cid || 'N/A'}
                      </div>
                    </div>
                    <Badge bg="secondary" className="ms-2">
                      {user.role || 'User'}
                    </Badge>
                  </div>
                </div>
              )}
            />
          </Col>
        </Row>

        {/* Alerts Section */}
        {stats.pendingBills > 0 && (
          <Row className="mb-4">
            <Col>
              <Alert variant="warning" className="border-0 shadow-sm">
                <div className="d-flex align-items-center">
                  <FaExclamationTriangle className="me-2" />
                  <div>
                    <strong>Attention Required:</strong> You have {stats.pendingBills} pending bill{stats.pendingBills > 1 ? 's' : ''} that need{stats.pendingBills > 1 ? '' : 's'} your attention.
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 ms-2 text-decoration-none fw-bold"
                      onClick={() => navigate('/admin/bill')}
                    >
                      View Bills →
                    </Button>
                  </div>
                </div>
              </Alert>
            </Col>
          </Row>
        )}

      </Container>

      {/* Notification Modal */}
      <Modal show={showNotification} onHide={() => setShowNotification(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--admin-component-bg-color)' }}>
          <Modal.Title style={{ color: 'var(--admin-heading-color)' }}>
            <FaBell className="me-2" />
            Notifications
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--admin-component-bg-color)' }}>
          <div className="text-center py-4 text-muted">
            <FaBell size={48} className="mb-3 opacity-50" />
            <p>No new notifications</p>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
