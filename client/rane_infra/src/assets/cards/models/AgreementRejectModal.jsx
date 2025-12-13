import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { rejectAgreement } from "../../../services/agreement"; // service

export default function AgreementRejectModal({ show, onHide, agreement, onRejectSuccess }) {

    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle Reject API
    const handleReject = async () => {
        if (!reason.trim()) {
            alert("Please provide a reason before rejecting.");
            return;
        }

        try {
            setLoading(true);
            await rejectAgreement(agreement._id, reason);

            // Show success
            alert("Agreement rejected successfully.");

            // Close modal
            onHide();

            // Refresh Parent Page
            if (onRejectSuccess) onRejectSuccess();

        } catch (error) {
            alert(error.message || "Failed to reject agreement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton style={{ background: "var(--warning)" }}>
                <Modal.Title style={{ color: "var(--warning-foreground)" }}>
                    ⚠️ Reject Agreement
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ background: "var(--card)" }}>
                {/* Warning Box */}
                <div
                    style={{
                        background: "var(--warning)",
                        color: "var(--warning-foreground)",
                        padding: "14px 16px",
                        borderRadius: "10px",
                        fontSize: "15px",
                        border: "1px solid var(--destructive)",
                        marginBottom: "15px"
                    }}
                >
                    <strong>Important:</strong> You are about to reject this agreement.  
                    This action <strong>cannot be undone</strong>.  
                    The document will be permanently marked as  
                    <strong style={{ color: "var(--destructive)" }}> Rejected</strong>.
                </div>

                <p style={{ color: "var(--foreground)" }}>
                    <strong>Agreement Title:</strong> {agreement?.title} <br />
                    <strong>Agreement ID:</strong> {agreement?.agreementId}
                </p>

                {/* Reason Input */}
                <label style={{ color: "var(--text-strong)", fontWeight: 600 }}>
                    Reason for Rejection:
                </label>
                <textarea
                    className="form-control"
                    style={{
                        background: "var(--input)",
                        border: "1px solid var(--border)",
                        color: "var(--foreground)",
                        marginTop: "6px",
                        minHeight: "90px",
                        borderRadius: "8px",
                    }}
                    placeholder="Explain why you are rejecting this agreement..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                ></textarea>
            </Modal.Body>

            <Modal.Footer style={{ background: "var(--muted)" }}>
                <button
                    className="btn"
                    onClick={onHide}
                    disabled={loading}
                    style={{
                        background: "var(--secondary)",
                        color: "var(--secondary-foreground)",
                        borderRadius: "8px",
                        padding: "8px 16px"
                    }}
                >
                    Cancel
                </button>

                <button
                    className="btn"
                    disabled={loading}
                    style={{
                        background: "var(--destructive)",
                        color: "var(--destructive-foreground)",
                        borderRadius: "8px",
                        padding: "8px 20px",
                        fontWeight: "600"
                    }}
                    onClick={handleReject}
                >
                    {loading ? "Rejecting..." : "Reject Agreement"}
                </button>
            </Modal.Footer>
        </Modal>
    );
}
