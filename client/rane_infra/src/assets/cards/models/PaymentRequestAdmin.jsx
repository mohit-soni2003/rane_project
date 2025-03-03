import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedStatus, refMode, expenseNo }),
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

  if (loading) {
    return <div></div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Payment Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {payment ? (
          <>
            <div><strong>Tender:</strong> {payment.tender || 'N/A'}</div>
            <div><strong>Amount:</strong> {payment.amount || 'N/A'}</div>
            <div>
              <strong>Reference Mode:</strong>
              <input
                type="text"
                value={refMode}
                onChange={(e) => setRefMode(e.target.value)}
              />
            </div>
            <div>
              <strong>Expense No:</strong>
              <input
                type="text"
                value={expenseNo}
                onChange={(e) => setExpenseNo(e.target.value)}
              />
            </div>
            <div><strong>Description:</strong> {payment.description || 'N/A'}</div>
            <div><strong>Remark:</strong> {payment.remark || 'N/A'}</div>
            <div><strong>Status:</strong> {payment.status || 'Pending'}</div>
            <div><strong>Submitted At:</strong> {payment.submittedAt ? new Date(payment.submittedAt).toLocaleDateString() : 'N/A'}</div>
            <div><strong>Payment Date:</strong> {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}</div>
            <div><strong>Payment Type:</strong> {payment.paymentType || 'N/A'}</div>
            {payment.image && (
              <div>
                <strong>Receipt Image:</strong>{' '}
                <a href={payment.image} target="_blank" rel="noopener noreferrer">View Image</a>
              </div>
            )}
            <div className="payment-detail">
              <h4>Update Payment Status</h4>
              {['Pending', 'Overdue', 'Paid', 'Sanctioned', 'Rejected'].map((status) => (
                <div key={status}>
                  <input
                    type="radio"
                    name="payment"
                    value={status}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    checked={selectedStatus === status}
                  />{' '}
                  {status}
                </div>
              ))}
              <Button onClick={updatePaymentStatus}>Update</Button>
            </div>
          </>
        ) : (
          <p>No payment details available</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant='danger' onClick={() => setShowDelete(true)}>Delete</Button>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
      {show && <DeletePaymentReqModal paymentId={payment._id} show={showDelete} onClose={() => setShowDelete(false)} />}
    </Modal>
  );
}