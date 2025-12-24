import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminHeader from '../../component/header/AdminHeader';
import { getPaymentRequestById } from '../../services/paymentService';
import { getTransactionsByPaymentId } from '../../services/transactionService';
import { backend_url } from '../../store/keyStore';
import { Container, Row, Col, Card, Spinner, Table, Form, Button, Image } from 'react-bootstrap';

export default function SinglePRdetailAdminPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [refMode, setRefMode] = useState('');
  const [expenseNo, setExpenseNo] = useState('');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [payment, txn] = await Promise.all([
          getPaymentRequestById(id),
          getTransactionsByPaymentId(id)
        ]);
        setPaymentData(payment);
        setTransactions(txn);
        setRefMode(payment.refMode || '');
        setExpenseNo(payment.expenseNo || 'Unpaid');
        setRemark(payment.remark || '');
      } catch (error) {
        console.error(error);
        setErr('Failed to load payment request or transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  const updatePaymentStatus = async () => {
    if (!selectedStatus) {
      alert('Please select a payment status!');
      return;
    }

    try {
      const response = await fetch(`${backend_url}/payment/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus, refMode, expenseNo, remark }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Payment status updated successfully!');
        setPaymentData(data);
      } else {
        alert(data.error || 'Failed to update payment status');
      }
    } catch (err) {
      alert('Server error: ' + err.message);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
          <p>Loading payment request details...</p>
        </div>
      </>
    );
  }

  if (err || !paymentData) {
    return (
      <>
        <AdminHeader />
        <div className="text-center mt-5 text-danger">
          <p>{err || 'Payment Request not found'}</p>
        </div>
      </>
    );
  }

  const {
    reason,
    amount,
    submittedAt,
    status,
    sanctionedAmount,
    note,
    sanctionDate,
    user = {}
  } = paymentData;

  const totalPaid = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const remaining = Math.max((sanctionedAmount || amount || 0) - totalPaid, 0);

  return (
    <>
      <AdminHeader />
      <Container fluid className="py-4 my-3"
        style={{
          minHeight: '100vh',
          background: 'var(--background)',
          borderRadius:"13px"
        }}>

        {/* Header */}


        {/* Request Info */}
        {/* Payment / Request Information */}
        <Card
          className="mb-4 shadow-sm border-0"
          style={{
            background: "var(--card)",
            color: "var(--card-foreground)",
            borderRadius: "12px",
          }}
        >
          {/* Header */}
          <Card.Header
            className="d-flex align-items-center gap-2 fw-semibold"
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <i className="bi bi-receipt fs-5" style={{ color: "var(--accent)" }} />
            Request Information
          </Card.Header>

          {/* Body */}
          <Card.Body>
            <Row className="gy-3">
              <Col md={6}>
                <small className="text-muted">Expense No</small>
                <div className="fw-semibold">{expenseNo || "—"}</div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Reference Mode</small>
                <div className="fw-semibold">{refMode || "—"}</div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Request Type</small>
                <div className="fw-semibold">{paymentData.paymentType || "—"}</div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Client Payment Preference</small>
                <div className="fw-semibold">{paymentData.paymentMOde || "—"}</div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Status</small>
                <div className="fw-semibold">{paymentData.status || "—"}</div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Requested Amount</small>
                <div className="fw-bold" style={{ color: "var(--destructive)" }}>
                  ₹{amount || 0}
                </div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Request Date</small>
                <div className="fw-semibold">
                  {submittedAt ? new Date(submittedAt).toLocaleString() : "—"}
                </div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Sanction Date</small>
                <div className="fw-semibold">
                  {sanctionDate ? new Date(sanctionDate).toLocaleString() : "—"}
                </div>
              </Col>

              <Col md={12} className="mt-3">
                <a
                  href={paymentData.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm d-inline-flex align-items-center gap-2"
                  style={{
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                    borderRadius: "8px",
                  }}
                >
                  <i className="bi bi-file-earmark-pdf" />
                  View PDF
                </a>
              </Col>

              <Col md={12}>
                <small className="text-muted">Reason</small>
                <div className="mt-1" style={{ color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>
                  {reason || "—"}
                </div>
              </Col>

              <Col md={12}>
                <small className="text-muted">Remark (by admin)</small>
                <div className="mt-1" style={{ color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>
                  {remark || "—"}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>


        {/* Update / Payment Info */}
        <Card
          className="mb-4 shadow-sm border-0"
          style={{
            background: "var(--card)",
            color: "var(--card-foreground)",
            borderRadius: "12px",
          }}
        >
          {/* Header */}
          <Card.Header
            className="d-flex align-items-center gap-2 fw-semibold"
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <i className="bi bi-pencil-square fs-5" style={{ color: "var(--accent)" }} />
            Update Information
          </Card.Header>

          {/* Body */}
          <Card.Body>
            <Form>
              <Row className="gy-3">
                <Col md={6}>
                  <Form.Label className="text-muted">Reference Mode</Form.Label>
                  <Form.Control
                    type="text"
                    value={refMode}
                    onChange={(e) => setRefMode(e.target.value)}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label className="text-muted">Expense No</Form.Label>
                  <Form.Control
                    type="text"
                    value={expenseNo}
                    onChange={(e) => setExpenseNo(e.target.value)}
                  />
                </Col>
              </Row>

              <Form.Group className="mt-3">
                <Form.Label className="text-muted">Remark</Form.Label>
                <Form.Control
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </Form.Group>

              <div className="mt-3 fw-semibold text-muted">Status</div>
              {['Pending', 'Overdue', 'Paid', 'Sanctioned', 'Rejected'].map((s) => (
                <Form.Check
                  key={s}
                  type="radio"
                  label={s}
                  name="paymentStatus"
                  value={s}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  checked={selectedStatus === s}
                  className="mb-2"
                />
              ))}

              <Button
                variant="success"
                className="mt-3"
                onClick={updatePaymentStatus}
              >
                Update Payment Info
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {/* Transactions Card */}
        <Card
          className="mb-4 shadow-sm border-0"
          style={{
            background: "var(--card)",
            color: "var(--card-foreground)",
            borderRadius: "12px",
          }}
        >
          {/* Header */}
          <Card.Header
            className="d-flex align-items-center gap-2 fw-semibold"
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <i className="bi bi-credit-card-2-front fs-5" style={{ color: "var(--accent)" }} />
            Transaction Details
          </Card.Header>

          {/* Body */}
          <Card.Body>
            {transactions.length === 0 ? (
              <div
                className="text-center py-4"
                style={{ color: "var(--muted-foreground)" }}
              >
                <i className="bi bi-info-circle fs-4 mb-2 d-block" />
                No transactions found for this request.
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0" style={{ borderColor: "var(--border)" }}>
                  <thead style={{ background: "var(--muted)", color: "var(--text-strong)" }}>
                    <tr>
                      <th>#</th>
                      <th>Amount</th>
                      <th>Bank</th>
                      <th>Account No</th>
                      <th>IFSC</th>
                      <th>UPI</th>
                      <th>Transaction Date</th>
                      <th>Sent To</th>
                      <th>Done By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn, idx) => (
                      <tr key={txn._id}>
                        <td>{idx + 1}</td>
                        <td className="fw-semibold" style={{ color: "var(--success-foreground)" }}>
                          ₹{txn.amount}
                        </td>
                        <td>{txn.bankName || "—"}</td>
                        <td>{txn.accNo || "—"}</td>
                        <td>{txn.ifscCode || "—"}</td>
                        <td>{txn.upiId || "—"}</td>
                        <td>{txn.transactionDate ? new Date(txn.transactionDate).toLocaleString() : "—"}</td>
                        <td className="fw-semibold">{txn.userId?.name || "—"}</td>
                        <td>{txn.created_by || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Summary Card */}
        <Card
          className="mb-4 shadow-sm border-0"
          style={{
            background: "var(--card)",
            color: "var(--card-foreground)",
            borderRadius: "12px",
          }}
        >
          {/* Header */}
          <Card.Header
            className="d-flex align-items-center gap-2 fw-semibold"
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <i className="bi bi-bar-chart-fill fs-5" style={{ color: "var(--accent)" }} />
            Summary
          </Card.Header>

          {/* Body */}
          <Card.Body>
            <Row className="gy-3 text-center">
              {/* Total Requested */}
              <Col md={4}>
                <small className="text-muted">Total Amount Requested</small>
                <div className="fw-bold fs-5 mt-1" style={{ color: "var(--text-strong)" }}>
                  ₹{amount || 0}
                </div>
              </Col>

              {/* Total Paid */}
              <Col md={4}>
                <small className="text-muted">Total Amount Paid</small>
                <div className="fw-bold fs-5 mt-1" style={{ color: "var(--success-foreground)" }}>
                  ₹{transactions.reduce((total, txn) => total + (txn.amount || 0), 0)}
                </div>
              </Col>

              {/* Remaining */}
              <Col md={4}>
                <small className="text-muted">Amount Remaining</small>
                <div className="fw-bold fs-5 mt-1" style={{ color: "var(--destructive)" }}>
                  ₹{Math.max((Number(amount) || 0) - transactions.reduce((total, txn) => total + (txn.amount || 0), 0), 0)}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>


        {/* User Info */}
        <Card
          className="mb-4 shadow-sm border-0"
          style={{
            background: "var(--card)",
            color: "var(--card-foreground)",
            borderRadius: "12px",
          }}
        >
          {/* Header */}
          <Card.Header
            className="d-flex align-items-center gap-2 fw-semibold"
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <i className="bi bi-person-badge fs-5" style={{ color: "var(--accent)" }} />
            User Information
          </Card.Header>

          {/* Body */}
          <Card.Body>
            <Row className="gy-4 align-items-start">
              {/* Profile */}
              <Col md={3} className="text-center">
                <Image
                  src={user?.profile || "https://via.placeholder.com/150"}
                  roundedCircle
                  width={120}
                  height={120}
                  alt="User Profile"
                  style={{
                    border: "3px solid var(--secondary)",
                    background: "var(--muted)",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/admin/client-detail/${user._id}`)}
                />
                <div
                  className="mt-2 fw-semibold"
                  style={{ color: "var(--text-strong)" }}
                >
                  {user?.name || "—"}
                </div>
              </Col>

              {/* Details */}
              <Col md={9}>
                <Row className="gy-3">
                  <Col md={6}>
                    <small className="text-muted">Email</small>
                    <div className="fw-semibold">{user?.email || "—"}</div>
                  </Col>

                  <Col md={6}>
                    <small className="text-muted">Client ID (CID)</small>
                    <div className="fw-semibold">{user?.cid || "—"}</div>
                  </Col>

                  <Col md={6}>
                    <small className="text-muted">Phone</small>
                    <div className="fw-semibold">{user?.phoneNo || "—"}</div>
                  </Col>

                  <Col md={6}>
                    <small className="text-muted">Firm Name</small>
                    <div className="fw-semibold">{user?.firmName || "—"}</div>
                  </Col>

                  <Col md={12}>
                    <small className="text-muted">Address</small>
                    <div className="fw-semibold" style={{ color: "var(--text-muted)" }}>
                      {user?.address || "—"}
                    </div>
                  </Col>

                  <Col md={6}>
                    <small className="text-muted">Bank Name</small>
                    <div className="fw-semibold">{user?.bankName || "—"}</div>
                  </Col>

                  <Col md={6}>
                    <small className="text-muted">Account No</small>
                    <div className="fw-semibold">{user?.accountNo || "—"}</div>
                  </Col>

                  <Col md={6}>
                    <small className="text-muted">IFSC Code</small>
                    <div className="fw-semibold">{user?.ifscCode || "—"}</div>
                  </Col>

                  <Col md={6}>
                    <small className="text-muted">UPI</small>
                    <div className="fw-semibold">{user?.upi || "—"}</div>
                  </Col>

                  <Col md={6}>
                    <small className="text-muted">GST No</small>
                    <div className="fw-semibold">{user?.gstno || "—"}</div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>

      </Container>
    </>
  );
}
