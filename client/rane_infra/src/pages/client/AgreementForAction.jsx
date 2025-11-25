import React from "react";
import { useNavigate } from "react-router-dom";
import { FiClock } from "react-icons/fi";
import ClientHeader from "../../component/header/ClientHeader";

export default function AgreementForAction() {
  const navigate = useNavigate();

  // Filter only actionable agreements
  const actionable = sampleAgreements.filter(
    (a) => a.status === "Pending" || a.status === "Viewed"
  );

  return (
    <>
    <ClientHeader></ClientHeader>
    <div
      className="container py-4 mt-3"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <h3 className="fw-bold mb-2" style={{ color: "var(--text-strong)" }}>
        Agreements – Action Required
      </h3>
      <p style={{ color: "var(--text-muted)", marginTop: "-8px" }}>
        These agreements need your review or signature.
      </p>

      <div className="row gy-4 mt-3">
        {actionable.map((item, idx) => (
          <div className="col-12 col-md-6 col-lg-4" key={idx}>
            <div
              className="p-4 h-100"
              style={{
                background: "var(--card)",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 6px var(--shadow-color)",
              }}
            >
              {/* Title */}
              <h5
                className="fw-semibold mb-1"
                style={{ color: "var(--text-strong)" }}
              >
                {item.title}
              </h5>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  marginBottom: "10px",
                }}
              >
                {item.id}
              </div>

              {/* Uploaded */}
              <div className="mb-2">
                <strong>Uploaded By:</strong> {item.uploadedBy}
              </div>
              <div className="mb-2">
                <strong>Uploaded:</strong> {item.uploaded}
              </div>

              {/* Expiry */}
              <div className="mb-2 d-flex align-items-center">
                <FiClock className="me-1" />
                <strong>{item.expiry}</strong>
              </div>

              {/* Status Badge */}
              <span
                className="badge px-3 py-2 mb-3"
                style={{
                  background: item.statusBg,
                  color: item.statusColor,
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              >
                {item.status}
              </span>

              {/* Action Button */}
              <button
                className="btn w-100 mt-2"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  borderRadius: "8px",
                  fontWeight: "600",
                }}
                onClick={() =>
                  navigate("/agreement/action/view", { state: { agreement: item } })
                }
              >
                Review & Sign
              </button>
            </div>
          </div>
        ))}
      </div>

      {actionable.length === 0 && (
        <div
          className="text-center p-3 mt-4"
          style={{
            background: "var(--card)",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          No agreements require your action right now.
        </div>
      )}
    </div>
    </>
  );
}

// Import your agreements here (or fetch from API)
const sampleAgreements = [
  {
    title: "Master Service Agreement",
    id: "AGR-0007",
    uploadedBy: "Sarah Chen",
    uploaded: "2025-11-02",
    expiry: "3 days",
    status: "Pending",
    statusBg: "var(--warning)",
    statusColor: "var(--warning-foreground)",
    content: "Full agreement content here...",
  },
  {
    title: "Data Processing Addendum",
    id: "AGR-0008",
    uploadedBy: "Michael Patel",
    uploaded: "2025-11-01",
    expiry: "8 days",
    status: "Viewed",
    statusBg: "var(--muted)",
    statusColor: "var(--text-muted)",
    content: "Full content here...",
  },
  {
    title: "Security Compliance Policy",
    id: "AGR-0010",
    uploadedBy: "Daniel Ross",
    uploaded: "2025-10-18",
    expiry: "Expired",
    status: "Signed",
    statusBg: "var(--success)",
    statusColor: "var(--success-foreground)",
  },
];
