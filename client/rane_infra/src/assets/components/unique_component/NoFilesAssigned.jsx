import React from "react";
import { FiFolder } from "react-icons/fi";

export default function NoFilesAssigned() {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "300px",
        background: "var(--background)",
      }}
    >
      <div
        className="text-center p-4"
        style={{
          background: "var(--card)",
          border: "1px dashed var(--border)",
          borderRadius: "14px",
          boxShadow: "0 6px 18px var(--shadow-color)",
          maxWidth: "420px",
        }}
      >
        <FiFolder
          style={{
            fontSize: "48px",
            color: "var(--accent)",
            marginBottom: "14px",
          }}
        />

        <h5
          className="fw-semibold"
          style={{ color: "var(--text-strong)" }}
        >
          No files assigned to you currently
        </h5>

        <p
          className="mb-0"
          style={{
            color: "var(--text-muted)",
            fontSize: "0.95rem",
          }}
        >
          You don’t have any files assigned at the moment.
          Please check back later.
        </p>
      </div>
    </div>
  );
}
