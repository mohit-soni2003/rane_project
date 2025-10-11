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
        <Modal show={show} onHide={onHide} size="lg" aria-labelledby="pay-bill-modal" centered>
            <Modal.Header closeButton>
                <Modal.Title id="pay-bill-modal">Pay Bill</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                {/* Bill Summary */}
                <Card className="mb-4 shadow-sm">
                    <Card.Header className="fw-semibold">Bill Summary</Card.Header>
                    <Card.Body>
                        <Row className="mb-2">
                            <Col md={4}><strong>Total Requested:</strong> ₹{totalRequested}</Col>
                            <Col md={4}><strong>Total Paid:</strong> ₹{totalPaid}</Col>
                            <Col md={4}><strong>Remaining:</strong> ₹{totalRequested - totalPaid}</Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Previous Transactions */}
                <Card className="mb-4 shadow-sm">
                    <Card.Header className="fw-semibold">Previous Transactions</Card.Header>
                    <Card.Body>
                        {transactions.length === 0 ? (
                            <p className="text-muted">No previous transactions found.</p>
                        ) : (
                            <Table striped bordered hover responsive size="sm">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Transaction ID</th>
                                        <th>Amount (₹)</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((txn, idx) => (
                                        <tr key={txn._id}>
                                            <td>{idx + 1}</td>
                                            <td>{txn._id}</td>
                                            <td>{txn.amount}</td>
                                            <td>{new Date(txn.transactionDate).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>

                {/* New Payment Form */}
                <Card className="mb-4 shadow-sm">
                    <Card.Header className="fw-semibold">New Payment</Card.Header>
                    <Card.Body>
                        <Form>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Label>Bank Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label>Account Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={accNo}
                                        onChange={(e) => setAccNo(e.target.value)}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Label>IFSC Code</Form.Label>
                                    <Form.Control
                                        type="text"
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

                {/* Update Payment Status */}
                <Card className="shadow-sm">
                    <Card.Header className="fw-semibold">Update Payment Status</Card.Header>
                    <Card.Body>
                        <Form>
                            <Row className="align-items-end">
                                <Col md={8}>
                                    <Form.Group controlId="paymentStatus">
                                        <Form.Label>Select Payment Status</Form.Label>
                                        <Form.Select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                        >
                                            <option value="">-- Select Status --</option>
                                            {["Pending", "Overdue", "Paid", "Sanctioned", "Reject"].map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={4}>
                                    <Button
                                        variant="primary"
                                        className="w-100"
                                        onClick={updatePaymentStatus}
                                        style={{ marginTop: '32px' }}
                                    >
                                        Update Status
                                    </Button>
                                </Col>
                            </Row>
                        </Form>

                    </Card.Body>
                </Card>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={handlePayment} disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : 'Pay Now'}
                </Button>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
