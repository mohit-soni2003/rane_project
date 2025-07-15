import React, { useState, useEffect } from "react";
import { Modal, Button, Card, Row, Col, Form } from "react-bootstrap";
import { backend_url } from "../../../store/keyStore";
import DeleteBillModal from "./DeleteBillModal";

export default function BillShowModal({ show, onHide, id }) {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(""); // Payment Status
  const [showDelete, setShowDelete] = useState(false); // Delete Modal

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const fetchBill = async () => {
      try {
        const response = await fetch(`${backend_url}/bill/${id}`);
        const data = await response.json();

        if (response.ok) {
          setBill(data);
        } else {
          setError(data.error || "Failed to fetch bill details");
        }
      } catch (err) {
        setError("Server error: " + err.message);
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
        setBill(data);
      } else {
        alert(data.error || "Failed to update payment status");
      }
    } catch (err) {
      alert("Server error: " + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">Error: {error}</div>;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Bill Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {bill ? (
          <Card className="p-3 shadow-sm">
            <Card.Body>
              <Row className="mb-3">
                <Col>
                  <h5 className="fw-bold">Firm Name: {bill.firmName || "N/A"}</h5>
                  <p><strong>Uploaded By:</strong> {bill.user?.name || "N/A"}</p>
                  <p><strong>Client ID:</strong> {bill.user?.cid || "N/A"}</p>
                  <p><strong>Email:</strong> {bill.user?.email || "N/A"}</p>
                  <p><strong>Phone:</strong> {bill.user?.phone || "N/A"}</p>
                </Col>
                <Col>
                  <p><strong>Work Area:</strong> {bill.workArea || "N/A"}</p>
                  <p><strong>Invoice No:</strong> {bill.invoiceNo || "N/A"}</p>
                  <p><strong>Payment Status:</strong> <span className="text-primary">{bill.paymentStatus || "Pending"}</span></p>
                  <p><strong>LOA No:</strong> {bill.loaNo || "N/A"}</p>
                  <p><strong>Uploaded Date:</strong> {bill.submittedAt ? new Date(bill.submittedAt).toLocaleDateString() : "N/A"}</p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <p><strong>Work Description:</strong> {bill.workDescription || "N/A"}</p>
                  {bill.pdfurl && (
                    <p>
                      <strong>Bill PDF:</strong> 
                      <a href={bill.pdfurl} target="_blank" rel="noopener noreferrer" className="ms-2 text-decoration-none">
                        View PDF
                      </a>
                    </p>
                  )}
                </Col>
              </Row>

              {/* Update Payment Status */}
              <div className="border p-3 rounded">
                <h5 className="fw-bold">Update Payment Status</h5>
                <Form>
                  <Form.Check 
                    type="radio"
                    label="Pending For Sanction"
                    name="payment"
                    value="Pending For Sanction"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    checked={selectedStatus === "Pending For Sanction"}
                    className="mb-2"
                  />
                  <Form.Check 
                    type="radio"
                    label="Overdue"
                    name="payment"
                    value="Overdue"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    checked={selectedStatus === "Overdue"}
                    className="mb-2"
                  />
                  <Form.Check 
                    type="radio"
                    label="Paid"
                    name="payment"
                    value="Paid"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    checked={selectedStatus === "Paid"}
                    className="mb-2"
                  />
                  <Form.Check 
                    type="radio"
                    label="Sanctioned"
                    name="payment"
                    value="Sanctioned"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    checked={selectedStatus === "Sanctioned"}
                    className="mb-2"
                  />
                  <Form.Check 
                    type="radio"
                    label="Reject"
                    name="payment"
                    value="Reject"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    checked={selectedStatus === "Reject"}
                    className="mb-3"
                  />
                  <Button variant="primary" onClick={updatePaymentStatus} className="w-100">
                    Update Payment Status
                  </Button>
                </Form>
              </div>
            </Card.Body>
          </Card>
        ) : (
          <p className="text-center text-muted">No bill details available</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={() => setShowDelete(true)}>
          Delete
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>

      {/* Delete Confirmation Modal */}
      {show && <DeleteBillModal billId={bill._id} show={showDelete} onClose={() => setShowDelete(false)} />}
    </Modal>
  );
}
