import React, { useState } from "react";
import { requestAgreementExtension } from "../../../services/agreement";

export default function AgreementExtensionRequestModal({
  show,
  onClose,
  agreementId,
  onSuccess,
}) {
  const [requestedExpiryDate, setRequestedExpiryDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!show) return null;

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
      setError(err?.response?.data?.message || "Failed to request extension.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ background: "var(--card)" }}>
          
          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Request Agreement Extension</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          {/* BODY */}
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2">{error}</div>}

            <div className="mb-3">
              <label className="form-label fw-semibold">New Expiry Date</label>
              <input
                type="date"
                className="form-control"
                value={requestedExpiryDate}
                onChange={(e) => setRequestedExpiryDate(e.target.value)}
              />
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold">Reason (optional)</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Explain why you need more time"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div> 
          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              className="btn text-white"
              style={{ background: "var(--primary)" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
