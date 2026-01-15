import React, { useState } from "react";
import {
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlinePencilAlt,
  HiOutlineX,
  HiOutlinePaperAirplane,
} from "react-icons/hi";
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
    <div
      className="modal fade show d-block"
      style={{ background: "rgba(0,0,0,0.55)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content shadow"
          style={{ background: "var(--card)", borderRadius: "10px" }}
        >
          {/* HEADER */}
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-semibold d-flex align-items-center gap-2">
              <HiOutlineDocumentText size={20} />
              Request Agreement Extension
            </h5>
            <button className="btn btn-sm" onClick={onClose}>
              <HiOutlineX size={20} />
            </button>
          </div>

          {/* BODY */}
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger py-2 small">{error}</div>
            )}

            <div className="mb-3">
              <label className="form-label fw-semibold d-flex align-items-center gap-2">
                <HiOutlineCalendar size={18} />
                New Expiry Date
              </label>
              <input
                type="date"
                className="form-control"
                value={requestedExpiryDate}
                onChange={(e) => setRequestedExpiryDate(e.target.value)}
              />
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold d-flex align-items-center gap-2">
                <HiOutlinePencilAlt size={18} />
                Reason <span className="text-muted fw-normal">(optional)</span>
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Briefly explain the reason for extension"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer border-top">
            <button
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              className="btn text-white d-flex align-items-center gap-2"
              style={{ background: "var(--primary)" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              <HiOutlinePaperAirplane size={18} />
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
