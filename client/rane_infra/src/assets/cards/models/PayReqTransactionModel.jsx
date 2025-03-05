import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { backend_url } from '../../components/store/keyStore';

export default function PayReqTransactionModel({ show, onHide, id }) {
  const [amountRequested, setAmountRequested] = useState(0);
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${backend_url}/pay-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: id, upi: upiId, amount }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Payment failed');

      setSuccess('Payment successful!');
      setAmount('');
      setUpiId('');
      fetchTransactions();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  const amountRemaining = amountRequested - totalPaid;

  return (
    <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Make a Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="text-danger">{error}</div>}
        {success && <div className="text-success">{success}</div>}

        <h5>Payment Details</h5>
        <ul>
          <li>Amount Requested: ₹{amountRequested}</li>
          <li>Total Paid: ₹{totalPaid}</li>
          <li>Amount Remaining: ₹{amountRemaining}</li>
        </ul>

        {/* Payment Form */}
        <Form onSubmit={handlePayment}>
          <Form.Group controlId="amount">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </Form.Group>

          <Form.Group controlId="upiId" className="mt-3">
            <Form.Label>UPI ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter UPI ID"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              required
            />
          </Form.Group>

          <div className="mt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Pay Now'}
            </Button>
          </div>
        </Form>

        {/* Transaction History */}
        <h5 className="mt-4">Transaction History</h5>
        {loading ? (
          <div>Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div>No previous transactions.</div>
        ) : (
          <Table striped bordered hover className="mt-2">
            <thead>
              <tr>
                <th>Transaction ID</th>
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
