import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaExclamationTriangle } from 'react-icons/fa';

function DeleteConfirmationModal({ show, onClose, onConfirm, itemName, itemType = "item" }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Delete Error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} animation={false} centered>
      <Modal.Header closeButton style={{ backgroundColor: '#fff5f5', borderBottom: '1px solid #fed7d7' }}>
        <Modal.Title style={{ color: '#c53030', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaExclamationTriangle />
          Confirm Deletion
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: '#fff5f5' }}>
        <div className="text-center">
          <FaExclamationTriangle size={48} className="text-danger mb-3" />
          <h5 className="text-danger mb-3">Warning!</h5>
          <p className="mb-2">
            Are you sure you want to delete this <strong>{itemType}</strong>?
          </p>
          {itemName && (
            <p className="mb-0 text-muted">
              <strong>"{itemName}"</strong>
            </p>
          )}
          <p className="text-muted mt-3 small">
            This action cannot be undone. The file will be permanently removed from the system.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#fff5f5', borderTop: '1px solid #fed7d7' }}>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Deleting...
            </>
          ) : (
            <>
              <FaExclamationTriangle className="me-2" />
              Delete Permanently
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteConfirmationModal;
