import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import { backend_url } from '../../components/store/keyStore';

export default function BillTransactionModal({ show, onHide, billId }) {
  const [bankName, setBankName] = useState('');
  const [accNo, setAccNo] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalRequested, setTotalRequested] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    if (billId && show) {
      fetchBillDetails();
      fetchTransactions();
    }
  }, [billId, show]);

  const fetchBillDetails = async () => {
    try {
      const response = await axios.get(`${backend_url}/bill/${billId}`);
      setTotalRequested(response.data.amount);
    } catch (err) {
      console.error("Error fetching bill details:", err);
      setTotalRequested(0);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${backend_url}/transactions/${billId}`);
      setTransactions(response.data.transactions);
      const paidAmount = response.data.transactions.reduce((sum, t) => sum + t.amount, 0);
      setTotalPaid(paidAmount);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
      setTotalPaid(0);
    }
  };

  const handlePayment = async () => {
    if (!billId) {
      setError("Bill ID is missing!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${backend_url}/pay-bill`, {
        billId,
        bankName,
        accNo,
        ifscCode,
        amount,
      });

      alert(response.data.message);
      fetchBillDetails();
      fetchTransactions();
      
      // Clear form fields on success
      setBankName('');
      setAccNo('');
      setIfscCode('');
      setAmount('');
      
      onHide();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Pay Bill</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="text-danger">Error: {error}</div>}
        <h5>Bill Summary</h5>
        <p><strong>Total Amount Requested:</strong> ₹{totalRequested}</p>
        <p><strong>Total Amount Paid:</strong> ₹{totalPaid}</p>
        <p><strong>Amount Left to Pay:</strong> ₹{totalRequested - totalPaid}</p>
        <hr />
        <h5>Previous Transactions</h5>
        {transactions.length === 0 ? (
          <p>No previous transactions found.</p>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>RS-FoS UTR</th>
                <th>Amount Paid (₹)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={transaction._id}>
                  <td>{index + 1}</td>
                  <td>{transaction._id}</td>
                  <td>{transaction.amount}</td>
                  <td>{new Date(transaction.transactionDate).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <h5>New Payment</h5>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Bank Name</Form.Label>
            <Form.Control type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Account Number</Form.Label>
            <Form.Control type="text" value={accNo} onChange={(e) => setAccNo(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>IFSC Code</Form.Label>
            <Form.Control type="text" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={handlePayment} disabled={loading}>
          {loading ? 'Processing...' : 'Pay Now'}
        </Button>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
