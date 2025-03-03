import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import { backend_url } from "../../components/store/keyStore";

function DeletePaymentReqModal({ show, onClose, paymentId }) {
    console.log(paymentId)
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDeletePayment = async () => {
    if (!paymentId) return;

    try {
      setLoading(true);
      const response = await fetch(`${backend_url}/payment/${paymentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Payment deleted successfully!");
        onClose(); // Close the modal
        navigate(0); // Refresh the page
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete payment.");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      animation={false}
      centered
      style={{ backgroundColor: "rgba(50, 50, 50, 0.8)" }}
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this payment?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeletePayment} disabled={loading}>
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeletePaymentReqModal;
