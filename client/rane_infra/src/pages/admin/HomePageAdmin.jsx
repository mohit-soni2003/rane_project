import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Button, Table, Badge, Spinner,
  ProgressBar, Modal
} from 'react-bootstrap';
import {
  FaUsers, FaFileInvoiceDollar, FaClipboardList, FaChartLine,
  FaEye, FaCheckCircle, FaClock, FaExclamationTriangle,
  FaRupeeSign, FaFileAlt, FaBell, FaCog, FaPlus
} from 'react-icons/fa';
import AdminHeader from '../../component/header/AdminHeader';
import { adminService } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import PendingDocumentsTableAdmin from '../../component/admin/PendingDocumentsTableAdmin';

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
      const response = await adminService.getDashboardStats();

      if (response.success) {
        const data = response.stats;

        setStats({
          totalUsers: data.totalUsers || 0,
          totalBills: data.totalBills || 0,
          totalDfsRequests: data.totalDfsRequests || 0,
          totalPayments: data.totalPayments || 0,
          pendingBills: data.pendingBills || 0,
          recentBills: data.recentBills || [],
          recentRequests: data.recentDfs || [],
          recentUsers: data.recentUsers || [],
          recentPayments: data.recentPayments || []
        });
      } else {
        console.error('Failed to fetch dashboard stats:', response.message);
      }
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

      <Container fluid className="py-4 mt-3" 
      style={{ backgroundColor: 'var(--background)', minHeight: '100vh' , borderRadius:"15px" }}>

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
            />
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <StatCard
              title="Total Bills"
              value={stats.totalBills}
              icon={<FaFileInvoiceDollar />}
              color="var(--admin-info-color)"
            />
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <StatCard
              title="DFS Requests"
              value={stats.totalDfsRequests}
              icon={<FaClipboardList />}
              color="var(--admin-warning-color)"
            />
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <StatCard
              title="Total Payments"
              value={stats.totalPayments}
              icon={<FaRupeeSign />}
              color="var(--admin-success-color)"
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
                      <span className="small fw-bold">
                        {stats.totalBills > 0 ? Math.round(((stats.totalBills - stats.pendingBills) / stats.totalBills) * 100) : 0}%
                      </span>
                    </div>
                    <ProgressBar
                      now={stats.totalBills > 0 ? ((stats.totalBills - stats.pendingBills) / stats.totalBills) * 100 : 0}
                      style={{ height: '6px' }}
                      variant="success"
                    />
                  </Col>
                  <Col sm={6}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Payment Collection</span>
                      <span className="small fw-bold">
                        {stats.totalPayments > 0 ? Math.round(((stats.totalPayments - (stats.pendingPayments || 0)) / stats.totalPayments) * 100) : 0}%
                      </span>
                    </div>
                    <ProgressBar
                      now={stats.totalPayments > 0 ? ((stats.totalPayments - (stats.pendingPayments || 0)) / stats.totalPayments) * 100 : 0}
                      style={{ height: '6px' }}
                      variant="info"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col sm={6}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">User Onboarding</span>
                      <span className="small fw-bold">
                        {stats.totalStaff && stats.totalClients ? Math.round(((stats.totalStaff + stats.totalClients) / stats.totalUsers) * 100) : 0}%
                      </span>
                    </div>
                    <ProgressBar
                      now={stats.totalStaff && stats.totalClients ? ((stats.totalStaff + stats.totalClients) / stats.totalUsers) * 100 : 0}
                      style={{ height: '6px' }}
                      variant="primary"
                    />
                  </Col>
                  <Col sm={6}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Document Processing</span>
                      <span className="small fw-bold">
                        {stats.totalDfsRequests > 0 ? Math.round(((stats.totalDfsRequests - (stats.pendingDfs || 0)) / stats.totalDfsRequests) * 100) : 0}%
                      </span>
                    </div>
                    <ProgressBar
                      now={stats.totalDfsRequests > 0 ? ((stats.totalDfsRequests - (stats.pendingDfs || 0)) / stats.totalDfsRequests) * 100 : 0}
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
                        {bill.firmName || 'Company Name'}
                      </div>
                      <div className="small text-muted">
                        {bill.user?.name || 'Client'} • {bill.submittedAt ? new Date(bill.submittedAt).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                    <Badge
                      bg={
                        bill.paymentStatus === 'Paid' || bill.paymentStatus === 'approved' ? 'success' :
                        bill.paymentStatus === 'Pending' || bill.paymentStatus === 'pending' ? 'warning' : 'secondary'
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
                        ₹{payment.amount ? payment.amount.toLocaleString('en-IN') : '0'}
                      </div>
                      <div className="small text-muted">
                        {payment.user?.name || payment.requestedBy || 'Client'} • {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                    <Badge
                      bg={
                        payment.status === 'Paid' || payment.status === 'approved' ? 'success' :
                        payment.status === 'Pending' || payment.status === 'pending' ? 'warning' :
                        payment.status === 'Rejected' || payment.status === 'rejected' ? 'danger' : 'secondary'
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
                        {request.fileTitle || request.title || 'Document Request'}
                      </div>
                      <div className="small text-muted">
                        {request.uploadedBy?.name || request.uploader || 'User'} • {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                    <Badge 
                      bg={
                        request.status === 'approved' ? 'success' :
                        request.status === 'pending' ? 'warning' :
                        request.status === 'rejected' ? 'danger' : 'info'
                      } 
                      className="ms-2"
                    >
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
                        {user.name || 'New User'}
                      </div>
                      <div className="small text-muted">
                        {user.email || 'email@example.com'} • CID: {user.cid || 'Not assigned'}
                      </div>
                    </div>
                    <Badge 
                      bg={
                        user.role === 'admin' ? 'primary' :
                        user.role === 'staff' ? 'success' :
                        user.role === 'client' ? 'info' : 'secondary'
                      } 
                      className="ms-2"
                    >
                      {user.role || 'User'}
                    </Badge>
                  </div>
                </div>
              )}
            />
          </Col>
        </Row>

        {/* Pending Documents Table */}
        <Row className="mb-4">
          <Col>
            <PendingDocumentsTableAdmin />
          </Col>
        </Row>

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
