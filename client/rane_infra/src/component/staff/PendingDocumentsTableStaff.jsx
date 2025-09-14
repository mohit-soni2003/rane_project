import React, { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Spinner, Row, Col } from 'react-bootstrap';
import { FaFileAlt, FaEye, FaClock, FaCheckCircle, FaTimesCircle, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { staffService } from '../../services/staffService';

const PendingDocumentsTableStaff = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [allPendingItems, setAllPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllPendingData = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        const allItems = [];

        // Fetch staff's own bills that are pending
        try {
          const billsResponse = await staffService.getMyBills();
          if (billsResponse.success && Array.isArray(billsResponse.bills)) {
            const pendingBills = billsResponse.bills.filter(bill => 
              bill.status === 'pending' || bill.status === 'submitted'
            );
            const billItems = pendingBills.map(bill => ({
              ...bill,
              source: 'bills',
              type: 'Bill',
              clientInfo: bill.clientInfo || bill.uploadedBy || {},
              dateField: bill.uploadDate || bill.createdAt,
              title: bill.billCode || bill.billNumber || 'Bill Request',
              category: 'Bill Submission'
            }));
            allItems.push(...billItems);
          }
        } catch (err) {
          console.error('Error fetching bills:', err);
        }

        // Fetch staff's own payment requests
        try {
          const paymentsResponse = await staffService.getMyPayments();
          if (paymentsResponse.success && Array.isArray(paymentsResponse.payments)) {
            const pendingPayments = paymentsResponse.payments.filter(payment => 
              payment.status === 'pending' || payment.status === 'submitted'
            );
            const paymentItems = pendingPayments.map(payment => ({
              ...payment,
              source: 'payments',
              type: 'Payment',
              clientInfo: payment.clientInfo || payment.requestedBy || {},
              dateField: payment.requestDate || payment.createdAt,
              title: payment.description || payment.paymentCode || 'Payment Request',
              category: 'Payment Request'
            }));
            allItems.push(...paymentItems);
          }
        } catch (err) {
          console.error('Error fetching payments:', err);
        }

        // Fetch staff's own DFS requests
        try {
          const dfsResponse = await staffService.getMyDfsRequests();
          if (dfsResponse.success && Array.isArray(dfsResponse.dfsRequests)) {
            const pendingDfs = dfsResponse.dfsRequests.filter(dfs => 
              dfs.status === 'pending' || dfs.status === 'in-review'
            );
            const dfsItems = pendingDfs.map(dfs => ({
              ...dfs,
              source: 'dfs',
              type: 'DFS',
              clientInfo: dfs.uploadedBy || {},
              dateField: dfs.createdAt,
              title: dfs.fileTitle || 'DFS Request',
              category: 'Document Forwarding'
            }));
            allItems.push(...dfsItems);
          }
        } catch (err) {
          console.error('Error fetching DFS:', err);
        }

        // Sort by date (newest first)
        allItems.sort((a, b) => new Date(b.dateField) - new Date(a.dateField));
        setAllPendingItems(allItems);
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
      navigate('/staff/bill');
    } else if (item.source === 'payments') {
      navigate('/staff/payment-request');
    } else if (item.source === 'dfs') {
      navigate('/staff/dfs-request');
    }
  };

  const handleApprove = async (item) => {
    try {
      // Staff members might not have approval permissions for their own items
      // This would typically be handled by admins or higher authority
      console.log('Staff approval not implemented - redirect to appropriate workflow');
      alert('Please contact admin for approval workflow');
    } catch (err) {
      console.error('Error approving item:', err);
    }
  };

  const handleReject = async (item) => {
    try {
      // Staff members might not have rejection permissions for their own items
      console.log('Staff rejection not implemented - redirect to appropriate workflow');
      alert('Please contact admin for rejection workflow');
    } catch (err) {
      console.error('Error rejecting item:', err);
    }
  };

  const getStatusBadge = (status, source) => {
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

  const getSourceBadge = (source) => {
    switch (source) {
      case 'bills':
        return <Badge bg="primary">Bills</Badge>;
      case 'payments':
        return <Badge bg="success">Payments</Badge>;
      case 'dfs':
        return <Badge bg="info">DFS</Badge>;
      default:
        return <Badge bg="secondary">{source}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
        <Card.Body className="text-center py-4">
          <Spinner animation="border" variant="primary" size="sm" />
          <p className="text-muted mt-2 mb-0">Loading pending items...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
        <Card.Body className="text-center py-4">
          <p className="text-danger mb-0">Error loading data: {error}</p>
        </Card.Body>
      </Card>
    );
  }

  if (allPendingItems.length === 0) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
        <Card.Header className="border-0 bg-white" style={{ borderRadius: '15px 15px 0 0' }}>
          <h6 className="card-title mb-0 text-dark fw-bold">
            <FaCheckCircle className="me-2 text-success" />
            Pending Reviews & Approvals
          </h6>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <FaCheckCircle size={48} className="text-success mb-3" />
          <h6 className="text-muted mb-1">All Caught Up!</h6>
          <p className="text-muted mb-0">No pending bills, payments, or DFS requests</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
      <Card.Header className="border-0 bg-white" style={{ borderRadius: '15px 15px 0 0' }}>
        <Row className="align-items-center">
          <Col>
            <h6 className="card-title mb-0 text-dark fw-bold">
              <FaClock className="me-2 text-warning" />
              My Pending Submissions ({allPendingItems.length})
            </h6>
          </Col>
          <Col xs="auto">
            <Badge bg="warning" text="dark" className="fs-6">
              {allPendingItems.length} pending
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
                <th className="border-0">Client</th>
                <th className="border-0">Category</th>
                <th className="border-0">Date</th>
                <th className="border-0">Status</th>
                <th className="border-0">Source</th>
                <th className="border-0 text-center pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allPendingItems.slice(0, 15).map((item, index) => (
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
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <FaUsers className="text-muted me-2" size={12} />
                      <div>
                        <div className="fw-semibold small">
                          {item.clientInfo?.name || 'Unknown Client'}
                        </div>
                        <small className="text-muted">
                          CID: {item.clientInfo?.cid || 'N/A'}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>
                    {new Date(item.dateField).toLocaleDateString()}
                  </td>
                  <td>
                    {getStatusBadge(item.status, item.source)}
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

        {allPendingItems.length > 15 && (
          <div className="p-3 text-center border-top">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate('/staff/dashboard')}
            >
              View All Pending Items ({allPendingItems.length})
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PendingDocumentsTableStaff;