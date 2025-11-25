// AgreementSignModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { signAgreement } from "../../../services/agreement";

export default function AgreementSignModal({ show, onHide, agreement }) {
    const [name, setName] = useState("");
    const [currentDateTime, setCurrentDateTime] = useState("");

    // Auto-fill current date & time
    useEffect(() => {
        const now = new Date().toLocaleString();
        setCurrentDateTime(now);
    }, []);

    const handleSign = async () => {
        if (!name.trim()) {
            alert("Please enter your full name");
            return;
        }

        try {
            const response = await signAgreement(agreement?._id, name);
            console.log("SIGNED:", response);
            onHide();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header
                closeButton
                style={{
                    background: "var(--card)",
                    borderBottom: "1px solid var(--divider)",
                }}
            >
                <Modal.Title style={{ color: "var(--primary)" }}>
                    Sign Agreement
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ background: "var(--background)" }}>
                {/* AGREEMENT SUMMARY */}
                <div
                    className="p-4 mb-4"
                    style={{
                        background: "var(--card)",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px var(--shadow-color)",
                        border: "1px solid var(--border)",
                    }}
                >
                    <h5 className="fw-bold" style={{ color: "var(--text-strong)" }}>
                        Agreement Summary
                    </h5>

                    <p>
                        <strong>Title:</strong> {agreement?.title}
                    </p>
                    <p>
                        <strong>Agreement ID:</strong> {agreement?.agreementId}
                    </p>
                    <p>
                        <strong>Uploaded By:</strong> {agreement?.uploadedBy?.name}
                    </p>
                    <p>
                        <strong>Description:</strong> {agreement?.description}
                    </p>

                    <p>
                        <strong>File:</strong>{" "}
                        <a
                            href={agreement?.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "var(--link)" }}
                        >
                            View Agreement PDF
                        </a>
                    </p>
                </div>

                {/* SIGNATURE FORM */}
                <div
                    className="p-4"
                    style={{
                        background: "var(--card)",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px var(--shadow-color)",
                        border: "1px solid var(--border)",
                    }}
                >
                    <h5 className="fw-bold mb-3" style={{ color: "var(--primary)" }}>
                        Provide Your Signature
                    </h5>

                    <Form>
                        {/* NAME */}
                        <Form.Group className="mb-3">
                            <Form.Label style={{ color: "var(--text-strong)" }}>
                                Your Full Name (Signature)
                            </Form.Label>
                            <Form.Control
                                style={{
                                    background: "var(--input)",
                                    border: "1px solid var(--border)",
                                }}
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>

                        {/* DATE & TIME */}
                        <Form.Group className="mb-3">
                            <Form.Label style={{ color: "var(--text-strong)" }}>
                                Current Date & Time
                            </Form.Label>
                            <Form.Control
                                style={{
                                    background: "var(--input)",
                                    border: "1px solid var(--border)",
                                }}
                                type="text"
                                value={currentDateTime}
                                readOnly
                            />
                        </Form.Group>
                    </Form>

                    {/* WARNING BOX */}
                    <Alert
                        variant="warning"
                        className="mt-4"
                        style={{
                            background: "var(--warning)",
                            color: "var(--warning-foreground)",
                            border: "1px solid var(--warning-foreground)",
                            borderRadius: "10px",
                        }}
                    >
                        <strong>Final Confirmation:</strong>
                        By signing this agreement, you confirm that you have read,
                        understood, and agree to all terms mentioned in the attached
                        agreement document.
                        <br />
                        Your digital signature will be recorded with the above timestamp.
                    </Alert>
                </div>
            </Modal.Body>

            <Modal.Footer style={{ background: "var(--card)" }}>
                <Button
                    variant="secondary"
                    onClick={onHide}
                    style={{
                        background: "var(--secondary)",
                        color: "var(--secondary-foreground)",
                        border: "none",
                    }}
                >
                    Cancel
                </Button>

                <Button
                    onClick={handleSign}
                    style={{
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                        padding: "10px 24px",
                        borderRadius: "8px",
                        border: "none",
                    }}
                >
                    Sign Agreement
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
