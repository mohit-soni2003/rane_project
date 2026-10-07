// AgreementSignModal.jsx
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import {
    FaFileSignature, FaFileAlt, FaUser, FaLock, FaClock, FaCheck, FaTimes,
    FaExclamationTriangle, FaEye, FaEyeSlash, FaCalendarAlt,
} from "react-icons/fa";
import { signAgreement } from "../../services/agreement";

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = {
    primary: "#6b3e2b",
    accent: "#b95a52",
    success: "#225b31",
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

const cardStyle = {
    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
    marginBottom: 14, boxShadow: "0 2px 8px var(--shadow-color)", overflow: "hidden",
};
const cardHeaderStyle = {
    display: "flex", alignItems: "center", gap: 8,
    padding: "11px 16px", borderBottom: "1px solid var(--border)",
    fontWeight: 700, fontSize: 13.5, color: "var(--text-strong)",
};
const inputStyle = {
    width: "100%", height: 40, boxSizing: "border-box",
    border: "1px solid var(--border)", borderRadius: 10,
    background: "var(--input)", color: "var(--foreground)",
    fontSize: 13.5, padding: "0 12px", outline: "none",
};
const btnBase = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "9px 18px", borderRadius: 8, border: "none",
    fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
};

const Field = ({ label, children }) => (
    <div style={{ minWidth: 0 }}>
        <div style={labelStyle}>{label}</div>
        <div style={valueStyle}>{children}</div>
    </div>
);

export default function AgreementSignModal({ show, onHide, agreement, onSignSuccess }) {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Fresh timestamp and clean form every time the modal opens
    useEffect(() => {
        if (show) {
            setCurrentDateTime(new Date().toLocaleString("en-IN"));
            setName("");
            setPassword("");
            setShowPassword(false);
            setError("");
        }
    }, [show]);

    const handleSign = async () => {
        if (!name.trim()) {
            setError("Please enter your full name.");
            return;
        }
        if (!password.trim()) {
            setError("Please enter your password to verify your identity.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            const response = await signAgreement(agreement?._id, name, password);
            console.log("SIGNED:", response);
            setName("");
            setPassword("");
            onHide();
            if (onSignSuccess) onSignSuccess();
        } catch (err) {
            setError(err.message || "Failed to sign the agreement.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !submitting) handleSign();
    };

    return (
        <Modal show={show} onHide={submitting ? undefined : onHide} size="lg" centered scrollable>
            {/* HEADER */}
            <Modal.Header
                closeButton={!submitting}
                style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)", padding: "14px 20px" }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10, background: "var(--warning)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                        <FaFileSignature size={17} color={C.primary} />
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--secondary-foreground)", lineHeight: 1.2 }}>
                            Sign Agreement
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
                            Review the details and confirm with your signature
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

                {/* AGREEMENT SUMMARY */}
                <div style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <FaFileAlt size={14} color={C.accent} /> Agreement Summary
                    </div>
                    <div style={{ padding: 16 }}>
                        <div style={{
                            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14,
                        }}>
                            <Field label="Title">{agreement?.title || "—"}</Field>
                            <Field label="Agreement ID">{agreement?.agreementId || "—"}</Field>
                            <Field label="Uploaded by">{agreement?.uploadedBy?.name || "—"}</Field>
                            <Field label="Expiry">
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                    <FaCalendarAlt size={11} color={C.muted} />
                                    {agreement?.expiryDate
                                        ? new Date(agreement.expiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                        : "—"}
                                </span>
                            </Field>
                        </div>

                        {agreement?.description && (
                            <div style={{ marginTop: 14 }}>
                                <div style={labelStyle}>Description</div>
                                <div style={{
                                    fontSize: 13, color: "var(--foreground)", lineHeight: 1.55,
                                    background: "var(--muted)", borderRadius: 8, padding: "10px 12px",
                                    border: "1px solid var(--border)", wordBreak: "break-word",
                                }}>
                                    {agreement.description}
                                </div>
                            </div>
                        )}

                        {agreement?.fileUrl && (
                            <div style={{ textAlign: "right", marginTop: 14 }}>
                                <a
                                    href={agreement.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        ...btnBase, background: "var(--secondary)", color: "var(--secondary-foreground)",
                                        border: "1px solid var(--border)", textDecoration: "none", padding: "7px 14px", fontSize: 12.5,
                                    }}
                                >
                                    <FaFileAlt size={12} color={C.accent} /> View PDF
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* SIGNATURE DETAILS */}
                <div style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <FaCheck size={13} color={C.success} /> Signature Details
                    </div>
                    <div style={{ padding: 16 }}>
                        <div style={{
                            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14,
                        }}>
                            <div>
                                <label htmlFor="sign-name" style={labelStyle}>
                                    <FaUser size={11} color={C.muted} /> Full name
                                </label>
                                <input
                                    id="sign-name"
                                    type="text"
                                    placeholder="Enter your full legal name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={submitting}
                                    autoComplete="name"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label htmlFor="sign-password" style={labelStyle}>
                                    <FaLock size={11} color={C.muted} /> Password
                                </label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        id="sign-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Your account password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        disabled={submitting}
                                        autoComplete="current-password"
                                        style={{ ...inputStyle, paddingRight: 40 }}
                                    />
                                    <button
                                        type="button"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowPassword(v => !v)}
                                        style={{
                                            position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                                            width: 28, height: 28, border: "none", borderRadius: 6,
                                            background: "transparent", cursor: "pointer",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}
                                    >
                                        {showPassword ? <FaEyeSlash size={14} color={C.muted} /> : <FaEye size={14} color={C.muted} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 14 }}>
                            <div style={labelStyle}>
                                <FaClock size={11} color={C.muted} /> Date &amp; time of signature
                            </div>
                            <input
                                type="text"
                                value={currentDateTime}
                                readOnly
                                style={{ ...inputStyle, background: "var(--muted)", cursor: "default" }}
                            />
                        </div>

                        {/* WARNING */}
                        <div style={{
                            marginTop: 16, display: "flex", gap: 10, alignItems: "flex-start",
                            background: "var(--warning)", color: "var(--warning-foreground)",
                            border: "1px solid var(--border)", borderLeft: `4px solid ${C.warning}`,
                            borderRadius: 10, padding: "12px 14px",
                        }}>
                            <FaExclamationTriangle size={15} color={C.warning} style={{ marginTop: 2, flexShrink: 0 }} />
                            <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
                                <strong>Final confirmation.</strong> By signing this agreement you confirm that all
                                details are accurate and you legally agree to the stated terms. This action is
                                recorded with the timestamp above.
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>

            {/* FOOTER */}
            <Modal.Footer style={{ background: "var(--secondary)", borderTop: "1px solid var(--border)", padding: "12px 20px" }}>
                <button
                    onClick={onHide}
                    disabled={submitting}
                    style={{
                        ...btnBase, background: "var(--card)", color: "var(--text-strong)",
                        border: "1px solid var(--border)", opacity: submitting ? 0.6 : 1,
                    }}
                >
                    <FaTimes size={12} color={C.muted} /> Cancel
                </button>

                <button
                    onClick={handleSign}
                    disabled={submitting}
                    style={{
                        ...btnBase, background: "var(--primary)", color: "var(--primary-foreground, #fff)",
                        minWidth: 160, opacity: submitting ? 0.75 : 1, cursor: submitting ? "not-allowed" : "pointer",
                    }}
                >
                    {submitting ? (
                        <>
                            <span style={{
                                width: 13, height: 13, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff",
                                borderRadius: "50%", display: "inline-block", animation: "agSignSpin 1s linear infinite",
                            }} />
                            Signing…
                        </>
                    ) : (
                        <>
                            <FaCheck size={12} color="#fff" /> Sign Agreement
                        </>
                    )}
                </button>
            </Modal.Footer>

            <style>{`@keyframes agSignSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </Modal>
    );
}
