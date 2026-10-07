import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import {
  FaClock, FaFileAlt, FaCalendarAlt, FaCommentDots, FaTimes,
  FaPaperPlane, FaExclamationTriangle,
} from "react-icons/fa";
import { requestAgreementExtension } from "../../services/agreement";

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = {
  primary: "#6b3e2b",
  accent: "#b95a52",
  destructive: "#c94a3a",
  muted: "#8b7b74",
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
  textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4,
  display: "flex", alignItems: "center", gap: 6,
};
const valueStyle = { fontSize: 13.5, fontWeight: 600, color: "var(--text-strong)", wordBreak: "break-word" };
const inputStyle = {
  width: "100%", boxSizing: "border-box",
  border: "1px solid var(--border)", borderRadius: 10,
  background: "var(--input)", color: "var(--foreground)",
  fontSize: 13.5, padding: "0 12px", outline: "none",
};
const btnBase = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
  padding: "9px 18px", borderRadius: 8, border: "none",
  fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
};

const MAX_REASON = 300;

// local YYYY-MM-DD for tomorrow (earliest selectable date)
const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

// `agreement` is optional — when passed, its title and current expiry are shown for context
export default function AgreementExtensionRequestModal({
  show,
  onClose,
  agreementId,
  agreement,
  onSuccess,
}) {
  const [requestedExpiryDate, setRequestedExpiryDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Clean form every time the modal opens
  useEffect(() => {
    if (show) {
      setRequestedExpiryDate("");
      setReason("");
      setError("");
    }
  }, [show]);

  const handleSubmit = async () => {
    if (!requestedExpiryDate) {
      setError("Please select a new expiry date.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await requestAgreementExtension(agreementId, {
        requestedExpiryDate,
        reason,
      });

      onSuccess(res.agreement);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to request extension.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={loading ? undefined : onClose} centered>
      {/* HEADER */}
      <Modal.Header
        closeButton={!loading}
        style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)", padding: "14px 20px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: "var(--warning)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <FaClock size={16} color={C.primary} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--secondary-foreground)", lineHeight: 1.2 }}>
              Request Extension
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
              Ask for more time to respond to this agreement
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

        {/* Agreement context (only when the parent passes the agreement) */}
        {agreement && (
          <div style={{
            background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
            boxShadow: "0 2px 8px var(--shadow-color)", padding: 14, marginBottom: 14,
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={labelStyle}><FaFileAlt size={11} color={C.accent} /> Agreement</div>
              <div style={valueStyle}>{agreement.title || "—"}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={labelStyle}><FaCalendarAlt size={11} color={C.muted} /> Current expiry</div>
              <div style={{ ...valueStyle, color: C.destructive }}>{formatDate(agreement.expiryDate)}</div>
            </div>
          </div>
        )}

        {/* New expiry date */}
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="ext-date" style={labelStyle}>
            <FaCalendarAlt size={11} color={C.muted} /> New expiry date <span style={{ color: C.destructive }}>*</span>
          </label>
          <input
            id="ext-date"
            type="date"
            value={requestedExpiryDate}
            min={tomorrowISO()}
            onChange={(e) => setRequestedExpiryDate(e.target.value)}
            disabled={loading}
            style={{ ...inputStyle, height: 40 }}
          />
        </div>

        {/* Reason */}
        <div>
          <label htmlFor="ext-reason" style={labelStyle}>
            <FaCommentDots size={11} color={C.muted} /> Reason{" "}
            <span style={{ textTransform: "none", fontWeight: 500 }}>(optional)</span>
          </label>
          <textarea
            id="ext-reason"
            rows={3}
            placeholder="Briefly explain the reason for the extension…"
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON))}
            disabled={loading}
            style={{ ...inputStyle, padding: "10px 12px", resize: "vertical", minHeight: 80 }}
          />
          <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            {reason.length}/{MAX_REASON}
          </div>
        </div>

        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
          Your request is sent to the admin for review.
        </div>
      </Modal.Body>

      {/* FOOTER */}
      <Modal.Footer style={{ background: "var(--secondary)", borderTop: "1px solid var(--border)", padding: "12px 20px" }}>
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            ...btnBase, background: "var(--card)", color: "var(--text-strong)",
            border: "1px solid var(--border)", opacity: loading ? 0.6 : 1,
          }}
        >
          <FaTimes size={12} color={C.muted} /> Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            ...btnBase, background: "var(--primary)", color: "var(--primary-foreground, #fff)",
            minWidth: 160, opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: 13, height: 13, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff",
                borderRadius: "50%", display: "inline-block", animation: "agExtSpin 1s linear infinite",
              }} />
              Submitting…
            </>
          ) : (
            <>
              <FaPaperPlane size={12} color="#fff" /> Submit Request
            </>
          )}
        </button>
      </Modal.Footer>

      <style>{`@keyframes agExtSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Modal>
  );
}
