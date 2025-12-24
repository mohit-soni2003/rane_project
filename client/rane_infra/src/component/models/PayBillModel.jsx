import React, { useState, useEffect } from 'react';
import {
    Button,
    Modal,
    Form,
    Table,
    Card,
    Row,
    Col,
    Spinner,
    Alert
} from 'react-bootstrap';
import axios from 'axios';
import { backend_url } from '../../store/keyStore';

export default function PayBillModal({ show, onHide, billId }) {
    const [bankName, setBankName] = useState('');
    const [accNo, setAccNo] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [totalRequested, setTotalRequested] = useState(0);
    const [totalPaid, setTotalPaid] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [billDetails, setBillDetails] = useState(null);

    useEffect(() => {
        if (billId && show) {
            fetchBillDetails();
            fetchTransactions();
        }
    }, [billId, show]);

    const fetchBillDetails = async () => {
        try {
            const response = await axios.get(`${backend_url}/bill/${billId}`);
            const bill = response.data;
            setTotalRequested(bill.amount);
            setBankName(bill.user?.bankName || '');
            setAccNo(bill.user?.accountNo || '');
            setIfscCode(bill.user?.ifscCode || '');
            setSelectedStatus(bill.paymentStatus || '');
            setBillDetails(bill);
        } catch (err) {
            console.error('Error fetching bill details:', err);
            setTotalRequested(0);
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(`${backend_url}/transactions/${billId}`);
            const txns = response.data.transactions;
            setTransactions(txns);
            const paid = txns.reduce((sum, t) => sum + t.amount, 0);
            setTotalPaid(paid);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setTransactions([]);
            setTotalPaid(0);
        }
    };

    const handlePayment = async () => {
        if (!billId) {
            setError('Bill ID is missing!');
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
            setAmount('');
            onHide();
        } catch (err) {
            setError(err.response?.data?.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };
 
    const updatePaymentStatus = async () => { 
        if (!selectedStatus) {
            alert('Please select a payment status!');
            return;
        }

        try {
            const response = await fetch(`${backend_url}/bill/update-payment/${billId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: selectedStatus }),
                credentials: "include", 
            });

            const data = await response.json();

            if (response.ok) {
                alert('Payment status updated successfully!');
                fetchBillDetails();
                onHide(); // hide modal first

                setTimeout(() => {
                    window.location.reload(); // refresh page after a short delay
                }, 300); // optional delay to ensure modal closes first
            }
            else {
                alert(data.error || 'Failed to update payment status');
            }
        } catch (err) {
            alert('Server error: ' + err.message);
        }
    };

    return (
  <Modal
    show={show}
    onHide={onHide}
    size="lg"
    centered
    backdrop="static"
  >
    {/* Modal Header */}
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
        <i className="bi bi-wallet2" style={{ color: "var(--accent)" }} />
        Pay Bill
      </Modal.Title>
    </Modal.Header>

    <Modal.Body style={{ background: "var(--background)" }}>
      {error && (
        <Alert variant="danger" className="rounded-3">
          {error}
        </Alert>
      )}

      {/* Bill Summary */}
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <Card.Header
          className="fw-semibold d-flex align-items-center gap-2"
          style={{
            background: "var(--secondary)",
            color: "var(--secondary-foreground)",
          }}
        >
          <i className="bi bi-receipt" style={{ color: "var(--accent)" }} />
          Bill Summary
        </Card.Header>

        <Card.Body>
          <Row className="text-center gy-2">
            <Col md={4}>
              <small className="text-muted">Total Requested</small>
              <div className="fw-bold fs-5">₹{totalRequested}</div>
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
              <small className="text-muted">Remaining</small>
              <div
                className="fw-bold fs-5"
                style={{ color: "var(--destructive)" }}
              >
                ₹{Math.max(totalRequested - totalPaid, 0)}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Previous Transactions */}
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <Card.Header
          className="fw-semibold d-flex align-items-center gap-2"
          style={{
            background: "var(--secondary)",
            color: "var(--secondary-foreground)",
          }}
        >
          <i className="bi bi-clock-history" style={{ color: "var(--accent)" }} />
          Previous Transactions
        </Card.Header>

        <Card.Body>
          {transactions.length === 0 ? (
            <div className="text-center text-muted py-3">
              <i className="bi bi-info-circle fs-4 d-block mb-1" />
              No previous transactions found.
            </div>
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead style={{ background: "var(--muted)" }}>
                <tr>
                  <th>#</th>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, idx) => (
                  <tr key={txn._id}>
                    <td>{idx + 1}</td>
                    <td className="text-muted">{txn._id}</td>
                    <td
                      className="fw-semibold"
                      style={{ color: "var(--success-foreground)" }}
                    >
                      ₹{txn.amount}
                    </td>
                    <td>{new Date(txn.transactionDate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* New Payment */}
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <Card.Header
          className="fw-semibold d-flex align-items-center gap-2"
          style={{
            background: "var(--secondary)",
            color: "var(--secondary-foreground)",
          }}
        >
          <i className="bi bi-cash-stack" style={{ color: "var(--accent)" }} />
          New Payment
        </Card.Header>

        <Card.Body>
          <Form>
            <Row className="gy-3">
              <Col md={6}>
                <Form.Label>Bank Name</Form.Label>
                <Form.Control
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </Col>

              <Col md={6}>
                <Form.Label>Account Number</Form.Label>
                <Form.Control
                  value={accNo}
                  onChange={(e) => setAccNo(e.target.value)}
                />
              </Col>

              <Col md={6}>
                <Form.Label>IFSC Code</Form.Label>
                <Form.Control
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                />
              </Col>

              <Col md={6}>
                <Form.Label>Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Update Status */}
      <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <Card.Header
          className="fw-semibold d-flex align-items-center gap-2"
          style={{
            background: "var(--secondary)",
            color: "var(--secondary-foreground)",
          }}
        >
          <i className="bi bi-arrow-repeat" style={{ color: "var(--accent)" }} />
          Update Payment Status
        </Card.Header>

        <Card.Body>
          <Row className="align-items-end gy-3">
            <Col md={8}>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">-- Select Status --</option>
                {["Pending", "Overdue", "Paid", "Sanctioned", "Reject"].map(
                  (status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  )
                )}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Button
                className="w-100"
                style={{
                  background: "var(--primary)",
                  border: "none",
                }}
                onClick={updatePaymentStatus}
              >
                Update Status
              </Button>
            </Col>
          </Row>
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
        onClick={handlePayment}
        disabled={loading}
        style={{
          background: "var(--success-foreground)",
          border: "none",
        }}
      >
        {loading ? <Spinner size="sm" /> : "Pay Now"}
      </Button>

      <Button
        variant="outline-secondary"
        onClick={onHide}
      >
        Close
      </Button>
    </Modal.Footer>
  </Modal>
);

}
