import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { backend_url } from '../../components/store/keyStore';

export default function BillShowModal({ show, onHide, id }) {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(""); // To track selected payment status

  useEffect(() => {
    if (!id) return;

    const fetchBill = async () => {
      try {
        const response = await fetch(`${backend_url}/bill/${id}`);
        const data = await response.json();

        if (response.ok) {
          setBill(data); // Assuming `data` is the bill object
        } else {
          setError(data.error || 'Failed to fetch bill details');
        }
      } catch (err) {
        setError('Server error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [id]);

  const updatePaymentStatus = async () => {
    if (!selectedStatus) {
      alert("Please select a payment status!");
      return;
    }

    try {
      const response = await fetch(`${backend_url}/bill/update-payment/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Payment status updated successfully!");
        setBill(data); // Update the bill state with the updated data
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
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Bill Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {bill ? (
          <>
            <h5>Firm Name: {bill.firmName || 'N/A'}</h5>
            <div>
              <strong>Uploaded By:</strong> {bill.user?.name || 'N/A'}
            </div>
            <div>
              <strong>Client Id:</strong> {bill.user?.cid || 'N/A'}
            </div>
            <div>
              <strong>Email:</strong> {bill.user?.email || 'N/A'}
            </div>
            <div>
              <strong>Phone:</strong> {bill.user?.phone || 'N/A'}
            </div>
            <div>
              <strong>Work Area:</strong> {bill.workArea || 'N/A'}
            </div>
            <div>
              <strong>Invoice No:</strong> {bill.invoiceNo || 'N/A'}
            </div>
            <div>
              <strong>Payment Status:</strong>{' '}
              {bill.paymentStatus || 'Pending'}
            </div>
            <div>
              <strong>LOA No:</strong> {bill.loaNo || 'N/A'}
            </div>
            <div>
              <strong>Work Description:</strong> {bill.workDescription || 'N/A'}
            </div>
            <div>
              <strong>Uploaded Date:</strong>{' '}
              {bill.submittedAt
                ? new Date(bill.submittedAt).toLocaleDateString()
                : 'N/A'}
            </div>
            {bill.pdfurl && (
              <div>
                <strong>Bill PDF:</strong>{' '}
                <a
                  href={bill.pdfurl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View PDF
                </a>
              </div>
            )}

            {/* Update Payment Section */}
            <div className="payment-detail">
              <h4>Update Payment Status</h4>
              <div>
                <input
                  type="radio"
                  name="payment"
                  value="Pending"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  checked={selectedStatus === "Pending"}
                />{" "}
                Pending
              </div>
              <div>
                <input
                  type="radio"
                  name="payment"
                  value="Overdue"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  checked={selectedStatus === "Overdue"}
                />{" "}
                Overdue
              </div>
              <div>
                <input
                  type="radio"
                  name="payment"
                  value="Completed"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  checked={selectedStatus === "Completed"}
                />{" "}
                Completed
              </div>
              <div>
                <input
                  type="radio"
                  name="payment"
                  value="Reject"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  checked={selectedStatus === "Reject"}
                />{" "}
                Reject
              </div>
              <Button onClick={updatePaymentStatus}>Update</Button>
            </div>
          </>
        ) : (
          <p>No bill details available</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
