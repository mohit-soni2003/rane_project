import React, { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Spinner, Row, Col } from 'react-bootstrap';
import { FaFileAlt, FaEye, FaClock, FaCheckCircle, FaTimesCircle, FaUsers, FaCog, FaChartLine } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/adminService';

const PendingDocumentsTableAdmin = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [allPendingItems, setAllPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPending: 0,
    pendingBills: 0,
    pendingPayments: 0,
    pendingDfs: 0,
    pendingUsers: 0
  });

  useEffect(() => {
    const fetchAllPendingData = async () => {
      try {
        setLoading(true);
        
        // For now, we'll use the dashboard stats to get basic pending counts
        // In a real implementation, this would fetch all pending items across all users
        try {
          const dashboardResponse = await adminService.getDashboardStats();
          if (dashboardResponse.success) {
            const data = dashboardResponse.stats;
            
            // Create mock pending items based on dashboard stats for demonstration
            const mockItems = [];
            
            // Add some mock pending bills
            for (let i = 0; i < Math.min(data.pendingBills || 0, 5); i++) {
              mockItems.push({
                _id: `bill-${i}`,
                source: 'bills',
                type: 'Bill',
                title: `Bill Request #${1000 + i}`,
                category: 'Bill Submission',
                clientInfo: { name: `Client ${i + 1}`, cid: `CID${100 + i}` },
                dateField: new Date(Date.now() - i * 86400000),
                status: 'pending',
                priority: i === 0 ? 'high' : 'medium',
                amount: 50000 + (i * 25000)
              });
            }
            
            // Add some mock pending payments
            for (let i = 0; i < Math.min(data.pendingPayments || 0, 3); i++) {
              mockItems.push({
                _id: `payment-${i}`,
                source: 'payments',
                type: 'Payment',
                title: `Payment Request #${2000 + i}`,
                category: 'Payment Request',
                clientInfo: { name: `Client ${i + 3}`, cid: `CID${200 + i}` },
                dateField: new Date(Date.now() - (i + 1) * 43200000),
                status: 'pending',
                priority: 'high',
                amount: 100000 + (i * 50000)
              });
            }
            
            // Add some mock DFS requests
            for (let i = 0; i < Math.min(data.totalDfsRequests || 0, 4); i++) {
              mockItems.push({
                _id: `dfs-${i}`,
                source: 'dfs',
                type: 'DFS',
                title: `Document Request #${3000 + i}`,
                category: 'Document Forwarding',
                clientInfo: { name: `Client ${i + 6}`, cid: `CID${300 + i}` },
                dateField: new Date(Date.now() - (i + 2) * 21600000),
                status: 'in-review',
                priority: 'medium'
              });
            }
            
            // Sort by priority and date
            mockItems.sort((a, b) => {
              const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
              const aPriority = priorityOrder[a.priority] || 1;
              const bPriority = priorityOrder[b.priority] || 1;
              
              if (aPriority !== bPriority) {
                return bPriority - aPriority;
              }
              return new Date(b.dateField) - new Date(a.dateField);
            });

            setAllPendingItems(mockItems);
            setStats({
              totalPending: mockItems.length,
              pendingBills: mockItems.filter(item => item.source === 'bills').length,
              pendingPayments: mockItems.filter(item => item.source === 'payments').length,
              pendingDfs: mockItems.filter(item => item.source === 'dfs').length,
              pendingUsers: 0
            });
          }
        } catch (err) {
          console.error('Error fetching dashboard stats:', err);
          // Set empty state on error
          setAllPendingItems([]);
          setStats({
            totalPending: 0,
            pendingBills: 0,
            pendingPayments: 0,
            pendingDfs: 0,
            pendingUsers: 0
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPendingData();
  }, [user]);

  const handleItemClick = (item) => {
    if (item.source === 'bills') {
      navigate('/admin/bill');
    } else if (item.source === 'payments') {
      navigate('/admin/payment-request');
    } else if (item.source === 'dfs') {
      navigate('/admin/danger/all-dfs');
    } else if (item.source === 'users') {
      navigate('/admin/danger/all-user');
    }
  };

  const handleApprove = async (item) => {
    try {
      // For demonstration, we'll simulate approval
      console.log(`Admin approving ${item.type}: ${item.title}`);
      
      // Remove item from list and update stats
      setAllPendingItems(prev => prev.filter(i => i._id !== item._id));
      setStats(prev => ({
        ...prev,
        totalPending: prev.totalPending - 1,
        [`pending${item.source.charAt(0).toUpperCase() + item.source.slice(1)}`]: 
          prev[`pending${item.source.charAt(0).toUpperCase() + item.source.slice(1)}`] - 1
      }));
      
      // In a real implementation, this would call the appropriate API endpoint
      alert(`${item.type} "${item.title}" has been approved`);
    } catch (err) {
      console.error('Error approving item:', err);
    }
  };

  const handleReject = async (item) => {
    try {
      // For demonstration, we'll simulate rejection
      console.log(`Admin rejecting ${item.type}: ${item.title}`);
      
      // Remove item from list and update stats
      setAllPendingItems(prev => prev.filter(i => i._id !== item._id));
      setStats(prev => ({
        ...prev,
        totalPending: prev.totalPending - 1,
        [`pending${item.source.charAt(0).toUpperCase() + item.source.slice(1)}`]: 
          prev[`pending${item.source.charAt(0).toUpperCase() + item.source.slice(1)}`] - 1
      }));
      
      // In a real implementation, this would call the appropriate API endpoint
      alert(`${item.type} "${item.title}" has been rejected`);
    } catch (err) {
      console.error('Error rejecting item:', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = (status || 'pending').toLowerCase();
    switch (statusLower) {
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      case 'in-review':
        return <Badge bg="info">In Review</Badge>;
      case 'pending':
      default:
        return <Badge bg="warning" text="dark">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge bg="danger" className="ms-1">High</Badge>;
      case 'medium':
        return <Badge bg="warning" text="dark" className="ms-1">Medium</Badge>;
      case 'low':
        return <Badge bg="success" className="ms-1">Low</Badge>;
      default:
        return null;
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'bills':
        return <Badge bg="primary">Bills</Badge>;
      case 'payments':
        return <Badge bg="success">Payments</Badge>;
      case 'dfs':
        return <Badge bg="info">DFS</Badge>;
      case 'users':
        return <Badge bg="secondary">Users</Badge>;
      default:
        return <Badge bg="dark">{source}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: 'var(--admin-component-bg-color)' }}>
        <Card.Body className="text-center py-4">
          <Spinner animation="border" variant="primary" size="sm" />
          <p className="text-muted mt-2 mb-0">Loading administrative pending items...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: 'var(--admin-component-bg-color)' }}>
        <Card.Body className="text-center py-4">
          <p className="text-danger mb-0">Error loading data: {error}</p>
        </Card.Body>
      </Card>
    );
  }

  if (allPendingItems.length === 0) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: 'var(--admin-component-bg-color)' }}>
        <Card.Header className="border-0" style={{ backgroundColor: 'var(--admin-component-bg-color)', borderRadius: '15px 15px 0 0' }}>
          <h6 className="card-title mb-0 fw-bold" style={{ color: 'var(--admin-heading-color)' }}>
            <FaCheckCircle className="me-2 text-success" />
            Administrative Pending Items
          </h6>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <FaCheckCircle size={48} className="text-success mb-3" />
          <h6 className="text-muted mb-1">System All Clear!</h6>
          <p className="text-muted mb-0">No pending administrative actions required</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: 'var(--admin-component-bg-color)' }}>
      <Card.Header className="border-0" style={{ backgroundColor: 'var(--admin-component-bg-color)', borderRadius: '15px 15px 0 0' }}>
        <Row className="align-items-center">
          <Col>
            <h6 className="card-title mb-0 fw-bold" style={{ color: 'var(--admin-heading-color)' }}>
              <FaCog className="me-2 text-primary" />
              Administrative Pending Items ({stats.totalPending})
            </h6>
            <small className="text-muted">
              Bills: {stats.pendingBills} • Payments: {stats.pendingPayments} • DFS: {stats.pendingDfs} 
              {stats.pendingUsers > 0 && ` • Users: ${stats.pendingUsers}`}
            </small>
          </Col>
          <Col xs="auto">
            <Badge bg="danger" className="fs-6">
              {stats.totalPending} urgent
            </Badge>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="border-0 ps-3">Type</th>
                <th className="border-0">Title/Code</th>
                <th className="border-0">Client/User</th>
                <th className="border-0">Category</th>
                <th className="border-0">Date</th>
                <th className="border-0">Priority</th>
                <th className="border-0">Status</th>
                <th className="border-0">Source</th>
                <th className="border-0 text-center pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allPendingItems.slice(0, 20).map((item, index) => (
                <tr
                  key={`${item.source}-${item._id}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleItemClick(item)}
                  className="table-row-hover"
                >
                  <td className="ps-3">
                    <FaFileAlt className="text-primary me-2" />
                    {item.type}
                  </td>
                  <td>
                    <div className="fw-semibold">{item.title}</div>
                    {item.billCode && <small className="text-muted">#{item.billCode}</small>}
                    {item.amount && (
                      <div>
                        <small className="text-success fw-bold">₹{item.amount.toLocaleString()}</small>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <FaUsers className="text-muted me-2" size={12} />
                      <div>
                        <div className="fw-semibold small">
                          {item.clientInfo?.name || 'Unknown User'}
                        </div>
                        <small className="text-muted">
                          {item.clientInfo?.cid ? `CID: ${item.clientInfo.cid}` : 
                           item.clientInfo?.email || 'No identifier'}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>
                    <div>
                      {new Date(item.dateField).toLocaleDateString()}
                    </div>
                    <small className="text-muted">
                      {new Date(item.dateField).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </small>
                  </td>
                  <td>
                    {getPriorityBadge(item.priority)}
                  </td>
                  <td>
                    {getStatusBadge(item.status)}
                  </td>
                  <td>
                    {getSourceBadge(item.source)}
                  </td>
                  <td className="text-center pe-3">
                    <div className="d-flex justify-content-center gap-1">
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(item);
                        }}
                        title="Approve"
                      >
                        <FaCheckCircle size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(item);
                        }}
                        title="Reject"
                      >
                        <FaTimesCircle size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                        title="View Details"
                      >
                        <FaEye size={12} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {allPendingItems.length > 20 && (
          <div className="p-3 text-center border-top">
            <Row>
              <Col>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigate('/admin/dashboard')}
                  className="me-2"
                >
                  <FaChartLine className="me-1" />
                  View All Items ({allPendingItems.length})
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => navigate('/admin/bill')}
                >
                  <FaCog className="me-1" />
                  Bulk Actions
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PendingDocumentsTableAdmin;