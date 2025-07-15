import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import { backend_url } from "../../../store/keyStore";

function DeleteBillModal({ show, onClose, billId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDeleteBill = async () => {
    if (!billId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${backend_url}/bill/${billId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Bill deleted successfully!");
        onClose(); // Close the modal
        navigate(0); // Refresh the page
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete bill.");
      }
    } catch (error) {
      console.error("Error deleting bill:", error);
      alert("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} animation={false} centered       style={{backgroundColor:"rgba(50, 50, 50, 0.8)"}}
>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this bill?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeleteBill} disabled={loading}>
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteBillModal;
