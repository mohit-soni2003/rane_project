import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { BsCheckCircleFill } from 'react-icons/bs';

export default function WarningModal({ show, onClose }) {
    return (
        <Modal
            show={show} onHide={onClose}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton />

            <Modal.Body className="text-center">
                <BsCheckCircleFill size={50} color="#0d6efd" className="mb-3" />
                <h4 className="fw-bold">Thank you for Uploading Bills! Your Bills Will Be Clear 7-10 Days.</h4>
                <ol className="text-start mt-3">
                    <li>If your bill is not cleared in 7 to 10 days, then you can contact our office and also submit a hard copy of the bill.</li>
                    <li>If the company does not have funds available for some time, then the bills may get delayed.</li>
                </ol>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={onClose} variant="primary">Close</Button>
            </Modal.Footer>
        </Modal>
    );
}
