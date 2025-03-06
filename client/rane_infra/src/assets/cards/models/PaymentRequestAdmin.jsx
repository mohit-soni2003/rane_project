import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { backend_url } from '../../components/store/keyStore';
import DeletePaymentReqModal from './DeletePaymentReqModal';

export default function PaymentRequestAdmin({ show, onHide, id }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [refMode, setRefMode] = useState("");
  const [expenseNo, setExpenseNo] = useState("");
  const [remark, setRemark] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchPayment = async () => {
      try {
        const response = await fetch(`${backend_url}/payment/${id}`);
        const data = await response.json();

        if (response.ok) {
          setPayment(data);
          setRefMode(data.refMode || "");
          setExpenseNo(data.expenseNo || "Unpaid");
          setRemark(data.remark || "N/A");
        } else {
          setError(data.error || 'Failed to fetch payment details');
        }
      } catch (err) {
        setError('Server error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [id]);

  const updatePaymentStatus = async () => {
    if (!selectedStatus) {
      alert("Please select a payment status!");
      return;
    }

    try {
      const response = await fetch(`${backend_url}/payment/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus, refMode, expenseNo, remark }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Payment status updated successfully!");
        setPayment(data);
      } else {
        alert(data.error || "Failed to update payment status");
      }
    } catch (err) {
      alert("Server error: " + err.message);
    }
  };

  if (loading) return <div className="text-center p-3">Loading...</div>;
  if (error) return <div className="text-danger text-center">{error}</div>;

  return (
    <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Payment Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {payment ? (
          <Card className="p-3 shadow-sm">
            <Row className="mb-3">
              <Col><strong>Tender:</strong> {payment.tender || 'N/A'}</Col>
              <Col><strong>Amount:</strong> ₹{payment.amount || 'N/A'}</Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label><strong>Reference Mode:</strong></Form.Label>
              <Form.Control type="text" value={refMode} onChange={(e) => setRefMode(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label><strong>Expense No:</strong></Form.Label>
              <Form.Control type="text" value={expenseNo} onChange={(e) => setExpenseNo(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label><strong>Remark:</strong></Form.Label>
              <Form.Control type="text" value={remark} onChange={(e) => setRemark(e.target.value)} />
            </Form.Group>
            <Row>
              <Col><strong>Description:</strong> {payment.description || 'N/A'}</Col>
              <Col><strong>Status:</strong> <span className="badge bg-info">{payment.status || 'Pending'}</span></Col>
            </Row>
            <Row className="mt-2">
              <Col><strong>Submitted At:</strong> {payment.submittedAt ? new Date(payment.submittedAt).toLocaleDateString() : 'N/A'}</Col>
              <Col><strong>Payment Date:</strong> {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}</Col>
            </Row>
            <div className="mt-2"><strong>Payment Type:</strong> {payment.paymentType || 'N/A'}</div>
            {payment.image && (
              <div className="mt-2">
                <strong>Receipt Image:</strong>{' '}
                <a href={payment.image} target="_blank" rel="noopener noreferrer" className="text-decoration-none">View Image</a>
              </div>
            )}
          </Card>
        ) : (
          <p className="text-center text-muted">No payment details available</p>
        )}

        {/* Update Payment Status Section */}
        <Card className="p-3 mt-4 shadow-sm">
          <h5>Update Payment Status</h5>
          <Form>
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
            <Button variant="success" className="mt-2 w-100" onClick={updatePaymentStatus}>
              Update Status
            </Button>
          </Form>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={() => setShowDelete(true)}>Delete</Button>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
      {show && <DeletePaymentReqModal paymentId={payment._id} show={showDelete} onClose={() => setShowDelete(false)} />}
    </Modal>
  );
}
