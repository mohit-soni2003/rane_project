import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminHeader from '../../component/header/AdminHeader';
import { getPaymentRequestById } from '../../services/paymentService';
import { getTransactionsByPaymentId } from '../../services/transactionService';
import { backend_url } from '../../store/keyStore';
import { Container, Row, Col, Card, Spinner, Table, Form, Button, Image } from 'react-bootstrap';

export default function SinglePRdetailAdminPage() {
  const { id } = useParams();
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
    createdAt,
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
      <Container className="py-4">
        <h4 className="mb-4">Payment Request Details</h4>

        {/* Payment Info */}
        <Card className="mb-4">
          <Card.Header className="fw-semibold">Request Information</Card.Header>
          <Card.Body>
            <Row className="mb-2">
              <Col md={6}><strong>Expense No:</strong> {expenseNo}</Col>
              <Col md={6}><strong>Ref Mode:</strong> {refMode}</Col>
            </Row>

            <Row className="mb-2">
              <Col md={6}><strong>Request Type:</strong> {paymentData.paymentType || '—'}</Col>
              <Col md={6}><strong>Client Payment Preference:</strong> {paymentData.paymentMOde || '—'}</Col>
            </Row>

            <Row className="mb-2">
              <Col md={6}><strong>Status:</strong> {paymentData.status || '—'}</Col>
              <Col md={6}><strong>Requested Amount:</strong> ₹{paymentData.amount || 0}</Col>
            </Row>

            <Row className="mb-2">
              <Col md={6}>
                <strong>Request Date:</strong>{' '}
                {paymentData.submittedAt ? new Date(paymentData.submittedAt).toLocaleString() : '—'}
              </Col>
              <Col md={6}>
                <strong>Sanction Date:</strong>{' '}
                {paymentData.paymentDate ? new Date(paymentData.paymentDate).toLocaleString() : '—'}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <strong>Attachment:</strong>{' '}
                {paymentData.image ? (
                  <a href={paymentData.image} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary ms-2">
                    View Image
                  </a>
                ) : (
                  '—'
                )}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <strong>Reason:</strong>
                <div className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>
                  {paymentData.description || '—'}
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <strong>Remark (by admin):</strong>
                <div className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>
                  {remark || '—'}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Update Section */}
        <Card className="mb-4">
          <Card.Header className="fw-semibold">Update Information</Card.Header>
          <Card.Body>
            <Form>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label><strong>Reference Mode:</strong></Form.Label>
                  <Form.Control type="text" value={refMode} onChange={(e) => setRefMode(e.target.value)} />
                </Col>
                <Col md={6}>
                  <Form.Label><strong>Expense No:</strong></Form.Label>
                  <Form.Control type="text" value={expenseNo} onChange={(e) => setExpenseNo(e.target.value)} />
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label><strong>Remark:</strong></Form.Label>
                <Form.Control type="text" value={remark} onChange={(e) => setRemark(e.target.value)} />
              </Form.Group>

              <div className="mb-2"><strong>Status:</strong></div>
              {['Pending', 'Overdue', 'Paid', 'Sanctioned', 'Rejected'].map((status) => (
                <Form.Check
                  key={status}
                  type="radio"
                  label={status}
                  name="paymentStatus"
                  value={status}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  checked={selectedStatus === status}
                  className="mb-2"
                />
              ))}

              <Button variant="success" className="mt-3 w-100" onClick={updatePaymentStatus}>
                Update Payment Info
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {/* Transactions */}
        <Card className="mb-4">
          <Card.Header className="fw-semibold">Transaction Details</Card.Header>
          <Card.Body>
            {transactions.length === 0 ? (
              <p>No transactions found for this request.</p>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
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
                  {transactions.map((txn, idx) => (
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
            )}
          </Card.Body>
        </Card>

        {/* Summary */}
        <Card className="mb-4">
          <Card.Header className="fw-semibold">Summary</Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}><strong>Total Requested:</strong> ₹{amount || 0}</Col>
              <Col md={4}><strong>Total Paid:</strong> ₹{totalPaid}</Col>
              <Col md={4}><strong>Remaining Amount:</strong> ₹{remaining}</Col>
            </Row>
          </Card.Body>
        </Card>

        {/* User Info */}
        <Card className="mb-4">
          <Card.Header className="fw-semibold">User Information</Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <Image
                  src={user?.profile || 'https://via.placeholder.com/150'}
                  roundedCircle
                  width={120}
                  height={120}
                  alt="User Profile"
                />
              </Col>
              <Col md={9}>
                <Row>
                  <Col md={6}><strong>Name:</strong> {user.name || '—'}</Col>
                  <Col md={6}><strong>Email:</strong> {user.email || '—'}</Col>
                  <Col md={6}><strong>Phone:</strong> {user.phoneNo || '—'}</Col>
                  <Col md={6}><strong>Client ID (CID):</strong> {user.cid || '—'}</Col>
                  <Col md={6}><strong>Firm Name:</strong> {user.firmName || '—'}</Col>
                  <Col md={6}><strong>Address:</strong> {user.address || '—'}</Col>
                  <Col md={6}><strong>Bank Name:</strong> {user.bankName || '—'}</Col>
                  <Col md={6}><strong>Account No:</strong> {user.accountNo || '—'}</Col>
                  <Col md={6}><strong>IFSC Code:</strong> {user.ifscCode || '—'}</Col>
                  <Col md={6}><strong>UPI:</strong> {user.upi || '—'}</Col>
                  <Col md={6}><strong>GST No:</strong> {user.gstno || '—'}</Col>
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
