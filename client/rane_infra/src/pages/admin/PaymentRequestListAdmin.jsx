import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Table, Button, Form,
  InputGroup, Dropdown, Pagination, Badge, Collapse, Card
} from 'react-bootstrap';
import {
  FaSearch, FaFilter, FaEllipsisV, FaEye,
  FaFileInvoice, FaRupeeSign, FaExclamationTriangle,
  FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import AdminHeader from '../../component/header/AdminHeader';
import StaffHeader from "../../component/header/StaffHeader";
import { getAllPayments } from '../../services/paymentService';
import { getTransactionsByPaymentId } from '../../services/transactionService';
import dummyuser from "../../assets/images/dummyUser.jpeg"
import { useNavigate } from 'react-router-dom';
import PayPrmodel from '../../component/models/PayPrModel';
import { useAuthStore } from '../../store/authStore';

const statusMap = {
  Pending: { color: '#f4b400', textColor: '#000' },
  Paid: { color: '#34a853', textColor: '#fff' },
  Overdue: { color: '#ea4335', textColor: '#fff' },
  Sanctioned: { color: '#4285f4', textColor: '#fff' },
  Rejected: { color: '#9e9e9e', textColor: '#000' },
};

export default function PaymentRequestListAdmin() {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const navigate = useNavigate();
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const {user} = useAuthStore()
  const [expandedPaymentId, setExpandedPaymentId] = useState(null);
  const [transactionData, setTransactionData] = useState({});

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getAllPayments();
        setPayments(data);
      } catch (err) {
        console.error('Failed to fetch payments:', err);
      }
    };
    fetchPayments();
  }, []);

  const getHeaderComponent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminHeader />;
      case 'staff':
        return <StaffHeader />;
      default:
        return <AdminHeader />; // fallback
    }
  };

  const toggleTrail = async (paymentId) => {
    if (expandedPaymentId === paymentId) {
      setExpandedPaymentId(null);
    } else {
      setExpandedPaymentId(paymentId);
      // Fetch transaction data if not already loaded
      if (!transactionData[paymentId]) {
        try {
          const transactions = await getTransactionsByPaymentId(paymentId);
          setTransactionData(prev => ({
            ...prev,
            [paymentId]: transactions
          }));
        } catch (error) {
          console.error('Error fetching transactions:', error);
          setTransactionData(prev => ({
            ...prev,
            [paymentId]: []
          }));
        }
      }
    }
  };

  // Filter payments based on search term
  const filteredPayments = payments.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.user?.name || "").toLowerCase().includes(term) ||
      (p.tender || "").toLowerCase().includes(term) ||
      (p.amount?.toString() || "").toLowerCase().includes(term) ||
      (p.expenseNo || "").toLowerCase().includes(term) ||
      (p.status || "").toLowerCase().includes(term) ||
      (p.submittedAt?.slice(0, 10) || "").toLowerCase().includes(term)
    );
  });

  // Sort by request date
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    const dateA = new Date(a.submittedAt);
    const dateB = new Date(b.submittedAt);
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  return (
    <>
      {getHeaderComponent()}
      <Container
        fluid
        style={{ backgroundColor: 'var(--admin-dashboard-bg-color)', minHeight: '100vh' }}
        className="py-4 px-4"
      >
        {/* Summary Cards */}
        <Row className="mb-4">
          {[
            { label: 'Total Requests', value: payments.length },
            { label: 'Pending', value: payments.filter(p => p.status === 'Pending').length },
            { label: 'Paid', value: payments.filter(p => p.status === 'Paid').length },
            { label: 'Overdue', value: payments.filter(p => p.status === 'Overdue').length },
          ].map((item, i) => (
            <Col key={i} md={3} sm={6} className="mb-2">
              <div
                className="p-3 rounded border"
                style={{
                  backgroundColor: 'var(--admin-component-bg-color)',
                  borderColor: 'var(--admin-border-color)'
                }}
              >
                <div className="text-muted small">{item.label}</div>
                <div className="fs-4 fw-semibold">{item.value}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Search and Filters */}
        <Row className="align-items-center mb-3">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text style={{ backgroundColor: 'white' }}>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by user, tender, amount, expense no, status, date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={6} className="text-end">
            <Button variant="light" className="me-2">
              <FaFilter className="me-1" /> Filter by Status
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => setSortAsc(!sortAsc)}
            >
              Sort by Date {sortAsc ? "↑" : "↓"}
            </Button>
          </Col>
        </Row>

        {/* Payment Table */}
        <div className="table-responsive">
          <Table
            responsive
            hover
            className="shadow-sm"
            style={{
              backgroundColor: 'var(--admin-component-bg-color)',
              border: '1px solid var(--admin-border-color)'
            }}
          >
            <thead style={{ backgroundColor: '#e7edf3' }}>
              <tr className="text-muted small text-uppercase">
                <th>S.NO</th>
                <th>User</th>
                <th>Uploaded By</th>
                <th>Tender</th>
                <th>Amount</th>
                <th>Expense No</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Reference Mode</th>
                <th>Trail</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPayments.map((d, i) => {
                const status = d.status || 'Pending';
                const icon = {
                  Pending: <FaExclamationTriangle className="me-1" />,
                  Paid: <FaCheckCircle className="me-1" />,
                  Overdue: <FaTimesCircle className="me-1" />,
                  Sanctioned: <FaCheckCircle className="me-1" />,
                  Rejected: <FaTimesCircle className="me-1" />
                }[status];

                const bgColor = i % 2 === 0 ? 'var(--admin-dashboard-bg-color)' : 'var(--admin-component-bg-color)';
                const payDisabled = status === 'Rejected';

                return (
                  <React.Fragment key={i}>
                    <tr style={{ backgroundColor: bgColor }}>
                      <td>
                        <div
                          className="rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{
                            backgroundColor: 'var(--staff-serial-number-bg)',
                            width: '30px',
                            height: '30px',
                            fontSize: '0.9rem'
                          }}
                        >
                          {i + 1}
                        </div>
                      </td>
                      <td>
                        <img
                          src={d.user?.profile || dummyuser}
                          alt=""
                          style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '50%' }}
                        />
                      </td>
                      <td>{d.user?.name || '—'}</td>
                      <td>{d.tender || '—'}</td>
                      <td>{d.amount ? `₹${d.amount}` : '—'}</td>
                      <td>{d.expenseNo || '—'}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: statusMap[status]?.color,
                            color: statusMap[status]?.textColor
                          }}
                        >
                          {icon} {status}
                        </span>
                      </td>
                      <td>{d.submittedAt?.slice(0, 10) || '—'}</td>
                      <td>{d.refMode || '—'}</td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => toggleTrail(d._id)}
                        >
                          {expandedPaymentId === d._id ? 'Hide Trail' : 'View Trail'}
                        </Button>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            href={d.image}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaFileInvoice />
                          </Button>
                          <Button
                            size="sm"
                            disabled={payDisabled}
                            style={{
                              backgroundColor: payDisabled ? 'var(--admin-btn-secondary-bg)' : 'var(--admin-btn-success-bg)',
                              color: 'var(--admin-btn-success-text)',
                              border: 'none'
                            }}
                            onClick={() => {
                              setSelectedPaymentId(d._id);
                              setShowPayModal(true);
                            }}
                          >
                            <FaRupeeSign className="me-1" /> Pay
                          </Button>
                          <FaEllipsisV onClick={() => navigate(`/${user.role}/payment-request/${d._id}`)} />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={11} style={{ padding: 0, border: 'none' }}>
                        <Collapse in={expandedPaymentId === d._id}>
                          <div>
                            <Card className="m-0 border-0 border-top">
                              <Card.Header className="bg-light py-2">
                                <h6 className="mb-0">Transaction Details for Payment Request</h6>
                              </Card.Header>
                              <Card.Body className="p-0">
                                {transactionData[d._id] && transactionData[d._id].length > 0 ? (
                                  <Table striped bordered hover responsive size="sm" className="mb-0">
                                    <thead className="table-light">
                                      <tr>
                                        <th>#</th>
                                        <th>Amount</th>
                                        <th>Bank</th>
                                        <th>Account No</th>
                                        <th>IFSC</th>
                                        <th>UPI</th>
                                        <th>Transaction Date</th>
                                        <th>Send To</th>
                                        <th>Done By</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {transactionData[d._id].map((txn, idx) => (
                                        <tr key={txn._id}>
                                          <td>{idx + 1}</td>
                                            <td>₹{txn.amount}</td>
                                            <td>{txn.bankName || '—'}</td>
                                            <td>{txn.accNo || '—'}</td>
                                            <td>{txn.ifscCode || '—'}</td>
                                            <td>{txn.upiId || '—'}</td>
                                            <td>{new Date(txn.transactionDate).toLocaleString()}</td>
                                            <td>{txn.userId?.name || '—'}</td>
                                            <td>{txn.created_by || '—'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                ) : (
                                  <div className="p-3 text-center text-muted">
                                    No transactions found for this payment request.
                                  </div>
                                )}
                              </Card.Body>
                            </Card>
                          </div>
                        </Collapse>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        <Row className="mt-2">
          <Col className="text-muted small">
            Showing {sortedPayments.length} of {payments.length} entries
          </Col>
          <Col className="text-end">
            <Pagination className="mb-0 justify-content-end">
              <Pagination.Prev />
              <Pagination.Item active>1</Pagination.Item>
              <Pagination.Next />
            </Pagination>
          </Col>
        </Row>
      </Container>

      <PayPrmodel
        show={showPayModal}
        onHide={() => setShowPayModal(false)}
        id={selectedPaymentId}
      />
    </>
  );
}