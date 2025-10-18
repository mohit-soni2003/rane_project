import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, Table, Badge, Button, Spinner, Row, Col } from 'react-bootstrap';
import { FaFileAlt, FaEye, FaClock, FaCheckCircle, FaTimesCircle, FaSync, FaRupeeSign, FaFile } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getAllBills } from '../../services/billServices';
import { getAllPayments } from '../../services/paymentService';
import { getAllDocuments } from '../../services/documentService';

const PendingDocumentsTableStaff = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      await Promise.all([fetchBills(), fetchPayments(), fetchDocuments()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const fetchBills = useCallback(async () => {
    try {
      const allBills = await getAllBills();

      // Filter for only pending or sanctioned bills
      const pendingOrSanctionedBills = allBills.filter(bill =>
        bill.paymentStatus === 'Pending' || bill.paymentStatus === 'Sanctioned'
      );

      setBills(pendingOrSanctionedBills);
    } catch (err) {
      console.error('Error fetching bills:', err);
      // Don't throw error, just set empty array
      setBills([]);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      const allPayments = await getAllPayments();
      // Filter for only pending or sanctioned payments
      const pendingOrSanctionedPayments = allPayments.filter(payment =>
        payment.status === 'Pending' || payment.status === 'Sanctioned'
      );
      setPayments(pendingOrSanctionedPayments);
    } catch (err) {
      console.error('Error fetching payments:', err);
      // Don't throw error, just set empty array
      setPayments([]);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const allDocuments = await getAllDocuments();
      // Filter for only pending or in-review documents
      const pendingOrInReviewDocuments = allDocuments.filter(document =>
        document.status === 'pending' || document.status === 'in-review'
      );
      setDocuments(pendingOrInReviewDocuments);
    } catch (err) {
      console.error('Error fetching documents:', err);
      // Don't throw error, just set empty array
      setDocuments([]);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([fetchBills(), fetchPayments(), fetchDocuments()]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchBills, fetchPayments, fetchDocuments]);

  const handleItemClick = useCallback((item) => {
    if (item.source === 'bill') {
      navigate(`/staff/bill/${item._id}`);
    } else if (item.source === 'payment') {
      navigate(`/staff/payment-request/${item._id}`);
    } else if (item.source === 'document') {
      // Navigate to document details or DFS request page
      if (item.type === 'dfs') {
        navigate(`/staff/dfsrequest/${item._id}`);
      } else {
        // For regular documents, you might want to open the document link
        window.open(item.documentLink, '_blank');
      }
    }
  }, [navigate]);

  const getStatusBadge = (status) => {
    const statusLower = (status || 'pending').toLowerCase();
    switch (statusLower) {
      case 'approved':
      case 'paid':
      case 'accepted':
        return <Badge bg="success">Approved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      case 'sanctioned':
        return <Badge bg="primary">Sanctioned</Badge>;
      case 'in-review':
        return <Badge bg="info">In Review</Badge>;
      case 'pending':
      default:
        return <Badge bg="warning" text="dark">Pending</Badge>;
    }
  };
  const allItems = useMemo(() => {
    try {
      const billItems = Array.isArray(bills) ? bills.map(bill => ({ ...bill, source: 'bill' })) : [];
      const paymentItems = Array.isArray(payments) ? payments.map(payment => ({ ...payment, source: 'payment' })) : [];
      const documentItems = Array.isArray(documents) ? documents.map(document => ({ ...document, source: 'document' })) : [];
      const combined = [...billItems, ...paymentItems, ...documentItems];
      return combined.sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.createdAt || a.uploadDate || 0);
        const dateB = new Date(b.submittedAt || b.createdAt || b.uploadDate || 0);
        return dateB - dateA; // Most recent first
      });
    } catch (err) {
      console.error('Error combining items:', err);
      return [];
    }
  }, [bills, payments, documents]);

  if (loading && !refreshing) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
        <Card.Body className="text-center py-4">
          <Spinner animation="border" variant="primary" size="sm" />
          <p className="text-muted mt-2 mb-2">Loading bills, payments, and documents...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
        <Card.Body className="text-center py-4">
          <p className="text-danger mb-3">Error loading data: {error}</p>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
          >
            <FaSync className={`me-1 ${refreshing ? 'fa-spin' : ''}`} />
            {refreshing ? 'Retrying...' : 'Retry'}
          </Button>
        </Card.Body>
      </Card>
    );
  }

  if (allItems.length === 0) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
        <Card.Header className="border-0 bg-white" style={{ borderRadius: '15px 15px 0 0' }}>
          <h6 className="card-title mb-0 text-dark fw-bold">
            <FaCheckCircle className="me-2 text-success" />
            Pending Bills & Payments
          </h6>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <FaCheckCircle size={48} className="text-success mb-3" />
          <h6 className="text-muted mb-1">All Caught Up!</h6>
          <p className="text-muted mb-0">No pending or sanctioned bills, payment requests, or documents</p>
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
              Pending Bills & Payments ({allItems.length})
            </h6>
          </Col>
          <Col xs="auto" className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={refreshData}
              disabled={refreshing || loading}
              title="Refresh data"
            >
              <FaSync className={`me-1 ${refreshing ? 'fa-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Badge bg="warning" text="dark" className="fs-6">
              {allItems.length} pending
            </Badge>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="border-0 ps-3">S.No</th>
                <th className="border-0">Type</th>
                <th className="border-0">ID/Name</th>
                <th className="border-0">Details</th>
                <th className="border-0">Category</th>
                <th className="border-0">Amount</th>
                <th className="border-0">Status</th>
                <th className="border-0">Date</th>
                <th className="border-0 text-center pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allItems.slice(0, 10).map((item, index) => (
                <tr
                  key={`${item.source}-${item._id}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleItemClick(item)}
                  className="table-row-hover"
                >
                  <td className="ps-3">
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{
                        backgroundColor: 'var(--staff-serial-number-bg)',
                        width: '30px',
                        height: '30px',
                        fontSize: '0.9rem'
                      }}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td>
                    {item.source === 'bill' ? (
                      <Badge bg="primary">
                        <FaFileAlt className="me-1" />
                        Bill
                      </Badge>
                    ) : item.source === 'payment' ? (
                      <Badge bg="success">
                        <FaRupeeSign className="me-1" />
                        Payment
                      </Badge>
                    ) : (
                      <Badge bg="info">
                        <FaFile className="me-1" />
                        {item.type === 'dfs' ? 'DFS' : 'Document'}
                      </Badge>
                    )}
                  </td>
                  <td>
                    {item.source === 'bill'
                      ? (item.user?.cid || 'N/A')
                      : item.source === 'payment'
                      ? (item.user?.name || 'N/A')
                      : (item.uploadedBy?.name || 'N/A')
                    }
                  </td>
                  <td>
                    {item.source === 'bill'
                      ? (item.user?.name || 'N/A')
                      : item.source === 'payment'
                      ? (item.tender || 'N/A')
                      : (item.title || 'N/A')
                    }
                  </td>
                  <td>
                    {item.source === 'bill'
                      ? (item.firmName || 'N/A')
                      : item.source === 'payment'
                      ? (item.expenseNo || 'N/A')
                      : (item.documentType || 'N/A')
                    }
                  </td>
                  <td>
                    {item.amount ? `₹${item.amount}` : 'N/A'}
                  </td>
                  <td>
                    {item.source === 'bill'
                      ? getStatusBadge(item.paymentStatus)
                      : item.source === 'payment'
                      ? getStatusBadge(item.status)
                      : getStatusBadge(item.status)
                    }
                  </td>
                  <td>
                    {new Date(item.submittedAt || item.createdAt || item.uploadDate || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="text-center pe-3">
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(item);
                      }}
                      title="Open"
                    >
                      <FaCheckCircle size={12} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {allItems.length > 10 && (
          <div className="p-3 text-center border-top">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate('/staff/bill')}
            >
              View All Items ({allItems.length})
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PendingDocumentsTableStaff;