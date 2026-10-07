// components/DeleteUserModal.jsx
import React from "react";
import { Modal } from "react-bootstrap";
import { FaTrash, FaTimes, FaExclamationTriangle } from "react-icons/fa";

export default function DeleteUserModal({ show, onClose, onConfirm, user }) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Body style={{ background: "var(--card)", padding: "26px 24px 8px", textAlign: "center", borderRadius: "10px 10px 0 0" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%", background: "#fde8e6", margin: "0 auto 14px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <FaExclamationTriangle size={22} color="#c94a3a" />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-strong)", marginBottom: 8 }}>Delete this user?</div>
        <div style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.55 }}>
          You are about to permanently delete{" "}
          <strong style={{ color: "var(--text-strong)" }}>{user?.name}</strong>
          {user?.email ? <> ({user.email})</> : null}. This cannot be undone.
        </div>
      </Modal.Body>
      <Modal.Footer style={{ background: "var(--card)", borderTop: "none", padding: "16px 24px 24px", display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 16px",
            borderRadius: 8, border: "1px solid var(--border)", background: "var(--secondary)", color: "var(--secondary-foreground)",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          <FaTimes size={12} /> Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          style={{
            flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 16px",
            borderRadius: 8, border: "none", background: "#c94a3a", color: "#fff",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          <FaTrash size={12} /> Delete user
        </button>
      </Modal.Footer>
    </Modal>
  );
}
