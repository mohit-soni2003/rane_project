import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { FaBan, FaFileAlt, FaTimes, FaExclamationTriangle, FaCommentDots } from "react-icons/fa";
import { rejectAgreement } from "../../services/agreement"; // service

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = {
    primary: "#6b3e2b",
    accent: "#b95a52",
    destructive: "#c94a3a",
    muted: "#8b7b74",
    warning: "#4a1f18",
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
    fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
    textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4,
    display: "flex", alignItems: "center", gap: 6,
};
const valueStyle = { fontSize: 13.5, fontWeight: 600, color: "var(--text-strong)", wordBreak: "break-word" };
const btnBase = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "9px 18px", borderRadius: 8, border: "none",
    fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
};

const MAX_REASON = 500;

export default function AgreementRejectModal({ show, onHide, agreement, onRejectSuccess }) {

    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Clean form every time the modal opens
    useEffect(() => {
        if (show) {
            setReason("");
            setError("");
        }
    }, [show]);

    // Handle Reject API
    const handleReject = async () => {
        if (!reason.trim()) {
            setError("Please provide a reason before rejecting.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            await rejectAgreement(agreement._id, reason);

            // Show success
            alert("Agreement rejected successfully.");

            // Close modal
            onHide();

            // Refresh Parent Page
            if (onRejectSuccess) onRejectSuccess();

        } catch (err) {
            setError(err.message || "Failed to reject agreement.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={loading ? undefined : onHide} centered>
            {/* HEADER */}
            <Modal.Header
                closeButton={!loading}
                style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)", padding: "14px 20px" }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10, background: "#fde8e6",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                        <FaBan size={16} color={C.destructive} />
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--secondary-foreground)", lineHeight: 1.2 }}>
                            Reject Agreement
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
                            Tell us why you are declining this agreement
                        </div>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body style={{ background: "var(--background)", padding: 18 }}>
                {error && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "#fde8e6", color: C.destructive, border: "1px solid #f5b8b2",
                        borderRadius: 10, padding: "10px 14px", fontSize: 13, fontWeight: 600, marginBottom: 14,
                    }}>
                        <FaExclamationTriangle size={13} color={C.destructive} /> {error}
                    </div>
                )}

                {/* Warning */}
                <div style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    background: "var(--warning)", color: "var(--warning-foreground)",
                    border: "1px solid var(--border)", borderLeft: `4px solid ${C.destructive}`,
                    borderRadius: 10, padding: "12px 14px", marginBottom: 14,
                }}>
                    <FaExclamationTriangle size={15} color={C.destructive} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
                        <strong>This cannot be undone.</strong> The agreement will be permanently marked as{" "}
                        <strong style={{ color: C.destructive }}>Rejected</strong>.
                    </div>
                </div>

                {/* Agreement info */}
                <div style={{
                    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
                    boxShadow: "0 2px 8px var(--shadow-color)", padding: 14, marginBottom: 14,
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12,
                }}>
                    <div style={{ minWidth: 0 }}>
                        <div style={labelStyle}><FaFileAlt size={11} color={C.accent} /> Agreement</div>
                        <div style={valueStyle}>{agreement?.title || "—"}</div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={labelStyle}>Agreement ID</div>
                        <div style={valueStyle}>{agreement?.agreementId || "—"}</div>
                    </div>
                </div>

                {/* Reason Input */}
                <label htmlFor="reject-reason" style={labelStyle}>
                    <FaCommentDots size={11} color={C.muted} /> Reason for rejection <span style={{ color: C.destructive }}>*</span>
                </label>
                <textarea
                    id="reject-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON))}
                    disabled={loading}
                    placeholder="Explain why you are rejecting this agreement…"
                    rows={4}
                    style={{
                        width: "100%", boxSizing: "border-box", resize: "vertical",
                        background: "var(--input)", color: "var(--foreground)",
                        border: "1px solid var(--border)", borderRadius: 10,
                        padding: "10px 12px", fontSize: 13.5, outline: "none", minHeight: 96,
                    }}
                />
                <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    {reason.length}/{MAX_REASON}
                </div>
            </Modal.Body>

            {/* FOOTER */}
            <Modal.Footer style={{ background: "var(--secondary)", borderTop: "1px solid var(--border)", padding: "12px 20px" }}>
                <button
                    onClick={onHide}
                    disabled={loading}
                    style={{
                        ...btnBase, background: "var(--card)", color: "var(--text-strong)",
                        border: "1px solid var(--border)", opacity: loading ? 0.6 : 1,
                    }}
                >
                    <FaTimes size={12} color={C.muted} /> Cancel
                </button>

                <button
                    onClick={handleReject}
                    disabled={loading}
                    style={{
                        ...btnBase, background: C.destructive, color: "#fff",
                        minWidth: 160, opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? (
                        <>
                            <span style={{
                                width: 13, height: 13, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff",
                                borderRadius: "50%", display: "inline-block", animation: "agRejectSpin 1s linear infinite",
                            }} />
                            Rejecting…
                        </>
                    ) : (
                        <>
                            <FaBan size={12} color="#fff" /> Reject Agreement
                        </>
                    )}
                </button>
            </Modal.Footer>

            <style>{`@keyframes agRejectSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </Modal>
    );
}
