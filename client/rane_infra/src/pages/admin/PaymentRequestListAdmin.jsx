import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Table, Button, Form,
  InputGroup, Dropdown, Pagination, Badge, Collapse, Card
} from 'react-bootstrap';
import {
  FaSearch, FaFilter, FaEllipsisV, FaEye,
  FaFileInvoice, FaRupeeSign, FaExclamationTriangle,
  FaCheckCircle, FaTimesCircle, FaUser, FaSortAmountDownAlt, FaClipboardList,
  FaClock,
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
  const { user } = useAuthStore()
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
        style={{ backgroundColor: 'var(--background)', minHeight: '100vh', borderRadius: "15px" }}
        className="py-4 px-4 my-3"
      >
        {/* Summary Cards */}
        <Row className="mb-4 g-3">
          {[
            {
              label: 'Total Requests',
              value: payments.length,
              icon: <FaClipboardList />
            },
            {
              label: 'Pending',
              value: payments.filter(p => p.status === 'Pending').length,
              icon: <FaClock />
            },
            {
              label: 'Paid',
              value: payments.filter(p => p.status === 'Paid').length,
              icon: <FaCheckCircle />
            },
            {
              label: 'Overdue',
              value: payments.filter(p => p.status === 'Overdue').length,
              icon: <FaExclamationTriangle />
            }
          ].map((item, i) => (
            <Col key={i} md={3} sm={6}>
              <div
                className="h-100 d-flex align-items-center justify-content-between"
                style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '18px',
                  padding: '16px 18px',
                  boxShadow: '0 6px 14px var(--shadow-color)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Left Content */}
                <div>
                  <div
                    className="small"
                    style={{
                      color: 'var(--text-muted)',
                      marginBottom: '6px'
                    }}
                  >
                    {item.label}
                  </div>

                  <div
                    className="fw-semibold"
                    style={{
                      fontSize: '1.8rem',
                      color: 'var(--primary)'
                    }}
                  >
                    {item.value}
                  </div>
                </div>

                {/* Icon */}
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    fontSize: '1.2rem'
                  }}
                >
                  {item.icon}
                </div>
              </div>
            </Col>
          ))}
        </Row>




        {/* Search and Filters */}
        <Row className="mb-3 align-items-center">
          {/* Search */}
          <Col md={6}>
            <InputGroup
              style={{
                borderRadius: '999px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px var(--shadow-color)'
              }}
            >
              <InputGroup.Text
                style={{
                  backgroundColor: 'var(--card)',
                  color: 'var(--accent)',
                  border: '1px solid var(--border)',
                  borderRight: 'none',
                  paddingLeft: '16px'
                }}
              >
                <FaSearch />
              </InputGroup.Text>

              <Form.Control
                placeholder="Search by user, tender, amount, expense no, status, date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: 'var(--input)',
                  border: '1px solid var(--border)',
                  borderLeft: 'none',
                  color: 'var(--foreground)',
                  padding: '10px 14px',
                  fontSize: '0.9rem'
                }}
              />
            </InputGroup>
          </Col>

          {/* Actions */}
          <Col md={6} className="d-flex justify-content-end gap-2">

            {/* Filter */}
            <Button
              variant="light"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--primary)',
                borderRadius: '999px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                boxShadow: '0 4px 10px var(--shadow-color)'
              }}
            >
              <FaFilter className="me-2" />
              Status
            </Button>

            {/* Sort */}
            <Button
              onClick={() => setSortAsc(!sortAsc)}
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--primary)',
                borderRadius: '999px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                boxShadow: '0 4px 10px var(--shadow-color)'
              }}
            >
              <FaSortAmountDownAlt className="me-2" />
              Date
              <span style={{ marginLeft: '6px', fontSize: '0.75rem' }}>
                {sortAsc ? '↑' : '↓'}
              </span>
            </Button>

          </Col>
        </Row>


        {/* Payment Table */}
        <div className="table-responsive">
          <Table
            hover
            responsive
            className="shadow-sm small"
            style={{
              backgroundColor: 'var(--card)',
              border: '0px solid var(--border)',
              borderRadius: '18px',
              minWidth: '1300px',
              whiteSpace: 'nowrap'
            }}
          >
            {/* TABLE HEAD */}
            <thead
              style={{
                backgroundColor: 'var(--card)',
                color: 'var(--text-strong)',
                whiteSpace: 'nowrap'
              }}
            >
              <tr className="small text-uppercase">
                <th>S.No</th>
                <th>User</th>
                {/* <th>Uploaded By</th> */}
                <th>Tender</th>
                <th>Amount</th>
                <th>Expense No</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Reference Mode</th>
                <th>Actions</th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {sortedPayments.length > 0 ? (
                sortedPayments.map((d, i) => {
                  const status = d.status || 'Pending';

                  const statusIcon =
                    status === 'Paid' || status === 'Sanctioned'
                      ? <FaCheckCircle className="me-1" />
                      : status === 'Rejected' || status === 'Overdue'
                        ? <FaTimesCircle className="me-1" />
                        : <FaExclamationTriangle className="me-1" />;

                  const statusColor =
                    status === 'Paid' || status === 'Sanctioned'
                      ? 'var(--success)'
                      : status === 'Rejected' || status === 'Overdue'
                        ? 'var(--destructive)'
                        : 'var(--warning)';

                  const statusTextColor =
                    status === 'Paid' || status === 'Sanctioned'
                      ? 'var(--success-foreground)'
                      : status === 'Rejected' || status === 'Overdue'
                        ? 'var(--destructive-foreground)'
                        : 'var(--warning-foreground)';

                  const payDisabled = status === 'Rejected';

                  return (
                    <tr key={d._id || i}>
                      {/* S.NO */}
                      <td>
                        <div
                          className="rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{
                            backgroundColor: 'var(--muted)',
                            color: 'var(--text-strong)',
                            width: '30px',
                            height: '30px',
                            fontSize: '0.9rem'
                          }}
                        >
                          {i + 1}
                        </div>
                      </td>

                      {/* USER (PROFILE + NAME) */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {d.user?.profile ? (
                            <img
                              src={d.user.profile}
                              alt={d.user.name}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '1px solid var(--border)'
                              }}
                            />
                          ) : (
                            <div
                              className="d-flex align-items-center justify-content-center"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--muted)',
                                color: 'var(--text-muted)',
                                fontSize: '0.8rem'
                              }}
                            >
                              <FaUser />
                            </div>
                          )}
                          <span>{d.user?.name || '—'}</span>
                        </div>
                      </td>

                      {/* UPLOADED BY */}
                      {/* <td>{d.user?.name || '—'}</td> */}

                      {/* TENDER */}
                      <td>{d.tender || '—'}</td>

                      {/* AMOUNT */}
                      <td style={{ fontWeight: 500 }}>
                        {d.amount ? `₹${d.amount}` : '—'}
                      </td>

                      {/* EXPENSE NO */}
                      <td>{d.expenseNo || '—'}</td>

                      {/* STATUS */}
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: statusColor,
                            color: statusTextColor
                          }}
                        >
                          {statusIcon} {status}
                        </span>
                      </td>

                      {/* DATE */}
                      <td>{d.submittedAt?.slice(0, 10) || '—'}</td>

                      {/* REF MODE */}
                      <td>{d.refMode || '—'}</td>

                      {/* ACTIONS */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {/* View Invoice */}
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            href={d.image}
                            target="_blank"
                            title="View Invoice"
                            style={{
                              borderColor: 'var(--border)',
                              color: 'var(--secondary-foreground)'
                            }}
                          >
                            <FaFileInvoice />
                          </Button>

                          {/* Pay */}
                          <Button
                            size="sm"
                            disabled={payDisabled}
                            style={{
                              backgroundColor: payDisabled
                                ? 'var(--muted)'
                                : 'var(--primary)',
                              color: payDisabled
                                ? 'var(--muted-foreground)'
                                : 'var(--primary-foreground)',
                              border: 'none'
                            }}
                            onClick={() => {
                              setSelectedPaymentId(d._id);
                              setShowPayModal(true);
                            }}
                          >
                            <FaRupeeSign className="me-1" /> Pay
                          </Button>

                          {/* More */}
                          <FaEllipsisV
                            title="More options"
                            style={{
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                              fontSize: '0.9rem'
                            }}
                            onClick={() =>
                              navigate(`/${user.role}/payment-request/${d._id}`)
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No results found
                  </td>
                </tr>
              )}
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