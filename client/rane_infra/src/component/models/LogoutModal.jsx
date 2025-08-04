import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

function LogoutModal({ show, onClose }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response) {
        alert("Logged out successfully!");
        navigate("/", { replace: true });   
        onClose();
      } else {
        alert("Failed to log out. Please try again.");
      }
    } catch (error) {
      alert("An error occurred during logout. Please try again.");
      console.error("Logout Error:", error);
    }
  };

  return (
    <Modal show={show} onHide={onClose} animation={false} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Logout</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to log out?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LogoutModal;
