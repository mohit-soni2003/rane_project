// components/DeleteUserModal.jsx
import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function DeleteUserModal({ show, onClose, onConfirm, user }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm User Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete user <strong>{user?.name}</strong>?
        <br />
        This will permanently remove all associated data.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
