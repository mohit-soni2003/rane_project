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
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Make a Payment</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Summary Card */}
        <Card className="mb-4">
          <Card.Header className="fw-bold">Payment Summary</Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="text-muted small">Amount Requested</div>
                <div className="fs-5 fw-semibold text-dark">₹{amountRequested}</div>
              </Col>
              <Col md={4}>
                <div className="text-muted small">Total Paid</div>
                <div className="fs-5 fw-semibold text-success">₹{totalPaid}</div>
              </Col>
              <Col md={4}>
                <div className="text-muted small">Amount Remaining</div>
                <div className="fs-5 fw-semibold text-danger">₹{amountRemaining}</div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Payment Form Card */}
        <Card className="mb-4">
          <Card.Header className="fw-bold">Send Payment</Card.Header>
          <Card.Body>
            <Form onSubmit={handlePayment}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="amount">
                    <Form.Label>Amount</Form.Label>
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
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="upiId">
                    <Form.Label>UPI ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter UPI ID"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="mt-4 text-end">
                <Button
                  type="submit"
                  disabled={submitting || !amount || !upiId}
                >
                  {submitting ? 'Processing...' : 'Pay Now'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Transactions Card */}
        <Card>
          <Card.Header className="fw-bold">Transaction History</Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center py-3">
                <Spinner animation="border" variant="primary" />
                <div>Loading transactions...</div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-muted">No previous transactions.</div>
            ) : (
              <Table striped bordered hover responsive className="mt-2 mb-0">
                <thead>
                  <tr>
                    <th>Txn ID</th>
                    <th>UPI ID</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn._id}>
                      <td>{txn._id}</td>
                      <td>{txn.upiId}</td>
                      <td>₹{txn.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={submitting}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
