// AgreementSignModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import {
    HiOutlinePencilAlt,
    HiOutlineDocumentText,
    HiOutlineUser,
    HiOutlineLockClosed,
    HiOutlineClock,
    HiOutlineExclamation,
    HiOutlineCheckCircle,
    HiOutlineX,
} from "react-icons/hi";
import { signAgreement } from "../../../services/agreement";
import { Row, Col } from "react-bootstrap";


export default function AgreementSignModal({ show, onHide, agreement, onSignSuccess }) {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [currentDateTime, setCurrentDateTime] = useState("");

    useEffect(() => {
        const now = new Date().toLocaleString();
        setCurrentDateTime(now);
    }, []);

    const handleSign = async () => {
        if (!name.trim()) {
            alert("Please enter your full name");
            return;
        }

        if (!password.trim()) {
            alert("Please enter your password to verify identity");
            return;
        }

        try {
            const response = await signAgreement(agreement?._id, name, password);
            console.log("SIGNED:", response);
            setName("");
            setPassword("");
            onHide();
            if (onSignSuccess) onSignSuccess();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            {/* HEADER */}
            <Modal.Header
                closeButton
                style={{
                    background: "var(--card)",
                    borderBottom: "1px solid var(--divider)",
                }}
            >
                <Modal.Title
                    className="d-flex align-items-center gap-2 fw-semibold"
                    style={{ color: "var(--primary)" }}
                >
                    <HiOutlinePencilAlt size={22} />
                    Sign Agreement
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ background: "var(--background)" }}>
                {/* AGREEMENT SUMMARY */}
                {/* AGREEMENT SUMMARY */}
                <div
                    className="p-4 mb-4"
                    style={{
                        background: "var(--card)",
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
                        boxShadow: "0 2px 8px var(--shadow-color)",
                    }}
                >
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                        <HiOutlineDocumentText size={20} />
                        Agreement Summary
                    </h6>

                    <Row className="mb-2">
                        <Col md={6}>
                            <p className="mb-1"><strong>Title:</strong> {agreement?.title}</p>
                        </Col>
                        <Col md={6}>
                            <p className="mb-1"><strong>Agreement ID:</strong> {agreement?.agreementId}</p>
                        </Col>
                    </Row>

                    <Row className="mb-2">
                        <Col md={6}>
                            <p className="mb-1"><strong>Uploaded By:</strong> {agreement?.uploadedBy?.name}</p>
                        </Col>
                        <Col md={6}>
                            <p className="mb-1">
                                <strong>File:</strong>{" "}
                                <a
                                    href={agreement?.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: "var(--link)", fontWeight: 500 }}
                                >
                                    View PDF
                                </a>
                            </p>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <p className="mb-0">
                                <strong>Description:</strong> {agreement?.description}
                            </p>
                        </Col>
                    </Row>
                </div>


                {/* SIGNATURE FORM */}
                {/* SIGNATURE FORM */}
                <div
                    className="p-4"
                    style={{
                        background: "var(--card)",
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
                        boxShadow: "0 2px 8px var(--shadow-color)",
                    }}
                >
                    <h6
                        className="fw-bold mb-3 d-flex align-items-center gap-2"
                        style={{ color: "var(--primary)" }}
                    >
                        <HiOutlineCheckCircle size={20} />
                        Signature Details
                    </h6>

                    <Form>
                        {/* NAME + PASSWORD ROW */}
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                                        <HiOutlineUser size={18} />
                                        Full Name
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter full legal name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        style={{
                                            background: "var(--input)",
                                            border: "1px solid var(--border)",
                                        }}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                                        <HiOutlineLockClosed size={18} />
                                        Password
                                    </Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Account password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{
                                            background: "var(--input)",
                                            border: "1px solid var(--border)",
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* DATE & TIME */}
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                                        <HiOutlineClock size={18} />
                                        Date & Time of Signature
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={currentDateTime}
                                        readOnly
                                        style={{
                                            background: "var(--muted)",
                                            border: "1px solid var(--border)",
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>

                    {/* WARNING */}
                    <Alert
                        className="mt-4 d-flex gap-2 align-items-start"
                        style={{
                            background: "var(--warning)",
                            color: "var(--warning-foreground)",
                            border: "1px solid var(--warning-foreground)",
                            borderRadius: "10px",
                        }}
                    >
                        <HiOutlineExclamation size={22} className="mt-1" />
                        <div>
                            <strong>Final Confirmation</strong>
                            <br />
                            By signing this agreement, you confirm that all details are accurate
                            and you legally agree to the stated terms.
                            <br />
                            This action is recorded with the above timestamp.
                        </div>
                    </Alert>
                </div>
            </Modal.Body>

            {/* FOOTER */}
            <Modal.Footer style={{ background: "var(--card)" }}>
                <Button
                    onClick={onHide}
                    variant="outline-secondary"
                    className="d-flex align-items-center gap-2"
                >
                    <HiOutlineX />
                    Cancel
                </Button>

                <Button
                    onClick={handleSign}
                    className="d-flex align-items-center gap-2"
                    style={{
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                        border: "none",
                        padding: "10px 26px",
                        borderRadius: "8px",
                    }}
                >
                    <HiOutlineCheckCircle size={18} />
                    Sign Agreement
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
