import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { backend_url } from '../../store/keyStore';

export default function PayPrmodel({ show, onHide, id }) {
  const [amountRequested, setAmountRequested] = useState(0);
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (show) {
      fetchPaymentDetails();
      fetchTransactions();
    }
  }, [show]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`${backend_url}/payment/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch payment details');
      setAmountRequested(data.amount);
      setUpiId(data.user.upi)
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${backend_url}/transactions/payreq/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch transactions');
      setTransactions(data.transactions);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${backend_url}/transactionroutes/pay-payment`, {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: id, upi: upiId, amount }),

      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Payment failed');

      setSuccess('✅ Payment successful!');
      setAmount('');
      setUpiId('');
      fetchTransactions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPaid = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  const amountRemaining = amountRequested - totalPaid;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      scrollable
      backdrop="static"
    >
      {/* Header */}
      <Modal.Header
        closeButton
        style={{
          background: "var(--secondary)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Modal.Title
          className="fw-semibold d-flex align-items-center gap-2"
          style={{ color: "var(--secondary-foreground)" }}
        >
          <i className="bi bi-send-check" style={{ color: "var(--accent)" }} />
          Make a Payment
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ background: "var(--background)" }}>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Summary */}
        <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
          <Card.Header
            className="fw-semibold d-flex align-items-center gap-2"
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
            }}
          >
            <i className="bi bi-clipboard-data" style={{ color: "var(--accent)" }} />
            Payment Summary
          </Card.Header>

          <Card.Body>
            <Row className="text-center gy-2">
              <Col md={4}>
                <small className="text-muted">Amount Requested</small>
                <div className="fw-bold fs-5">₹{amountRequested}</div>
              </Col>

              <Col md={4}>
                <small className="text-muted">Total Paid</small>
                <div
                  className="fw-bold fs-5"
                  style={{ color: "var(--success-foreground)" }}
                >
                  ₹{totalPaid}
                </div>
              </Col>

              <Col md={4}>
                <small className="text-muted">Amount Remaining</small>
                <div
                  className="fw-bold fs-5"
                  style={{ color: "var(--destructive)" }}
                >
                  ₹{amountRemaining}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Payment Form */}
        <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
          <Card.Header
            className="fw-semibold d-flex align-items-center gap-2"
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
            }}
          >
            <i className="bi bi-cash-coin" style={{ color: "var(--accent)" }} />
            Send Payment
          </Card.Header>

          <Card.Body>
            <Form onSubmit={handlePayment}>
              <Row className="gy-3">
                <Col md={6}>
                  <Form.Label>Amount (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={amountRemaining}
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    disabled={submitting}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>UPI ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter UPI ID"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </Col>
              </Row>

              <div className="mt-4 text-end">
                <Button
                  type="submit"
                  disabled={submitting || !amount || !upiId}
                  style={{
                    background: "var(--primary)",
                    border: "none",
                  }}
                >
                  {submitting ? <Spinner size="sm" /> : "Pay Now"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Transactions */}
        <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
          <Card.Header
            className="fw-semibold d-flex align-items-center gap-2"
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
            }}
          >
            <i className="bi bi-clock-history" style={{ color: "var(--accent)" }} />
            Transaction History
          </Card.Header>

          <Card.Body>
            {loading ? (
              <div className="text-center py-3">
                <Spinner animation="border" />
                <div className="text-muted mt-1">Loading transactions...</div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-muted text-center py-2">
                No previous transactions.
              </div>
            ) : (
              <Table hover responsive className="mb-0 align-middle">
                <thead style={{ background: "var(--muted)" }}>
                  <tr>
                    <th>Txn ID</th>
                    <th>UPI ID</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn._id}>
                      <td className="text-muted">{txn._id}</td>
                      <td>{txn.upiId}</td>
                      <td
                        className="fw-semibold"
                        style={{ color: "var(--success-foreground)" }}
                      >
                        ₹{txn.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>

      {/* Footer */}
      <Modal.Footer
        style={{
          background: "var(--secondary)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <Button
          variant="outline-secondary"
          onClick={onHide}
          disabled={submitting}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );


}
