import React, { useEffect, useState } from "react";
import { FiSearch, FiFilter, FiClock, FiChevronDown } from "react-icons/fi";
import ClientHeader from "../../component/header/ClientHeader";
import { getClientAgreements } from "../../services/agreement";
import { useNavigate } from "react-router-dom";
import AgreementExtensionRequestModal from "../../assets/cards/models/AgreementExtensionRequestModal";

export default function ClosedAgreement() {
  const navigate = useNavigate();
  const [closedAgreements, setClosedAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [currentAgreement, setCurrentAgreement] = useState(null);

  useEffect(() => {
    const fetchClosedAgreements = async () => {
      try {
        const response = await getClientAgreements("expired");
        const agreements = response.agreements || [];
        setClosedAgreements(agreements);
      } catch (error) {
        console.error("Error loading closed agreements", error);
        setClosedAgreements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClosedAgreements();
  }, []);

  const filteredAgreements = closedAgreements.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.agreementId.toLowerCase().includes(search.toLowerCase())
  );

  const handleRequestExtension = (id) => {
    const agreement = closedAgreements.find(a => a._id === id);
    setCurrentAgreement(agreement);
    setShowExtensionModal(true);
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const daysLeft = (expiry) => {
    if (!expiry) return "—";
    const diff = (new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff) + " days left";
  };

  const statusStyles = {
    pending: {
      background: "#FFF4CC",
      color: "#B58A00",
    },
    viewed: {
      background: "#E6F0FF",
      color: "#2A64D6",
    },
    signed: {
      background: "#D6F5D6",
      color: "#1C7C1C",
    },
    rejected: {
      background: "#FFE4E4",
      color: "#D64545",
    },
    expired: {
      background: "#EAEAEA",
      color: "#666",
    },
  };

  return (
    <>
      <ClientHeader />

      <div
        className="container-fluid py-4 my-3"
        style={{
          background: "var(--background)",
          borderRadius: "12px",
          color: "var(--card-foreground)",
        }}
      >
        {/* Page Title + Search + Filter + Sort */}
        <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
          <div className="mb-2">
            <h3 className="fw-bold" style={{ color: "var(--text-strong)" }}>
              Closed Agreements – Expired
            </h3>
            <p className="m-0" style={{ color: "var(--text-muted)" }}>
              Agreements that have expired and may require extension requests.
            </p>
          </div>

          {/* Search + actions */}
          <div className="d-flex gap-2 mt-2 mt-md-0 w-100 w-md-auto">
            <div
              className="input-group flex-grow-1"
              style={{ background: "var(--input)", borderRadius: "8px" }}
            >
              <div
                className="input-group mt-1"
                style={{
                  border: "2px solid var(--border)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  background: "var(--input)",
                }}
              >
                <span
                  className="input-group-text"
                  style={{
                    background: "var(--input)",
                    color: "var(--text-muted)",
                    border: "none",
                  }}
                >
                  <FiSearch />
                </span>

                <input
                  type="text"
                  className="form-control shadow-none border-0"
                  placeholder="Search: agreementId / title"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ background: "var(--input)", color: "var(--foreground)" }}
                />
              </div>
            </div>

            <button
              className="btn d-flex align-items-center px-3"
              style={{
                background: "var(--secondary)",
                color: "var(--secondary-foreground)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                whiteSpace: "nowrap",
              }}
            >
              <FiFilter className="me-2" />
              Filter
            </button>

            <button
              className="btn d-flex align-items-center px-3"
              style={{
                background: "var(--secondary)",
                color: "var(--secondary-foreground)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                whiteSpace: "nowrap",
              }}
            >
              Sort: Newest
              <FiChevronDown className="ms-2" />
            </button>
          </div>
        </div>

       
        {/* Loading State */}
        {loading && (
          <div className="text-center text-muted mt-4">Loading...</div>
        )}

        {/* Desktop Table View */}
        {!loading && closedAgreements.length > 0 && (
          <div
            className="table-responsive d-none d-md-block"
            style={{
              background: "var(--card)",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              boxShadow: "0 2px 4px var(--shadow-color)",
            }}
          >
            <table
              className="table align-middle mb-0"
              style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
            >
              <thead>
                <tr style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  <th style={{ width: "60px" }}>#</th>
                  <th>Title</th>
                  <th>Uploaded By</th>
                  <th>Uploaded</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAgreements.map((item, idx) =>{

                const isExtensionRequested = item.extensionRequest?.requested;
                return (
                  <tr key={idx} style={{ background: "var(--card)" }}>
                    <td>
                      <div
                        className="d-flex justify-content-center align-items-center"
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          background: "var(--muted)",
                          color: "var(--text-strong)",
                          fontWeight: 600,
                        }}
                      >
                        {idx + 1}
                      </div>
                    </td>

                    <td>
                      <div
                        className="fw-semibold"
                        style={{ color: "var(--text-strong)", fontSize: "15px" }}
                      >
                        {item.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {item.agreementId}
                      </div>
                    </td>

                    <td>
                      <div className="fw-semibold" style={{ fontSize: "14px" }}>
                        {item.uploadedBy?.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        Staff
                      </div>
                    </td>

                    <td style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                      {formatDate(item.uploadedAt)}
                    </td>

                    <td style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                      {formatDate(item.expiryDate)}
                    </td>

                    <td>
                      <span
                        className="badge px-3 py-2"
                        style={{
                          background: statusStyles[item.status]?.background,
                          color: statusStyles[item.status]?.color,
                          borderRadius: "6px",
                          fontSize: "12px",
                          textTransform: "capitalize",
                        }}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm"
                          style={{
                            background: "var(--secondary)",
                            color: "var(--secondary-foreground)",
                            borderRadius: "6px",
                            padding: "6px 14px",
                            fontSize: "13px",
                          }}
                          onClick={() => window.open(`/client/agreement/view/${item._id}`, "_blank")}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm"
                          disabled={isExtensionRequested}
                          style={{
                            background: isExtensionRequested
                              ? "var(--muted)"
                              : "var(--primary)",
                            color: isExtensionRequested
                              ? "var(--text-muted)"
                              : "var(--primary-foreground)",
                            borderRadius: "6px",
                            padding: "6px 14px",
                            fontSize: "13px",
                            cursor: isExtensionRequested ? "not-allowed" : "pointer",
                            opacity: isExtensionRequested ? 0.6 : 1,
                          }}
                          onClick={() => {
                            if (!isExtensionRequested) {
                              handleRequestExtension(item._id);
                            }
                          }}
                        >
                          {isExtensionRequested
                            ? "Extension Requested"
                            : "Request Extension"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* No Data */}
        {!loading && closedAgreements.length === 0 && (
          <div
            className="text-center p-3 mt-4"
            style={{
              background: "var(--card)",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            No closed agreements found.
          </div>
        )}

        {/* Mobile Cards View */}
        {!loading && closedAgreements.length > 0 && (
          <div className="d-block d-md-none mt-4">
            {filteredAgreements.map((item, idx) => (
              <div
                key={idx}
                className="p-3 mb-3"
                style={{
                  background: "var(--card)",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  boxShadow: "0 2px 4px var(--shadow-color)",
                }}
              >
                <div className="fw-semibold" style={{ color: "var(--text-strong)" }}>
                  {item.title}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    marginBottom: "6px",
                  }}
                >
                  {item.agreementId}
                </div>

                <div style={{ fontSize: "13px", marginBottom: "6px" }}>
                  <strong>Uploaded By:</strong> {item.uploadedBy?.name}
                </div>
                <div style={{ fontSize: "13px", marginBottom: "6px" }}>
                  <strong>Uploaded:</strong> {formatDate(item.uploadedAt)}
                </div>
                <div style={{ fontSize: "13px", marginBottom: "10px" }}>
                  <strong>Expired:</strong> {formatDate(item.expiryDate)}
                </div>

                <span
                  className="badge px-3 py-2 my-2 d-block"
                  style={{
                    background: statusStyles[item.status]?.background,
                    color: statusStyles[item.status]?.color,
                    borderRadius: "8px",
                    fontSize: "12px",
                    textTransform: "capitalize",
                    textAlign: "center",
                  }}
                >
                  {item.status}
                </span>

                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-sm flex-grow-1"
                    style={{
                      background: "var(--secondary)",
                      color: "var(--secondary-foreground)",
                      borderRadius: "6px",
                    }}
                    onClick={() => window.open(`/client/agreement/view/${item._id}`, "_blank")}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-sm flex-grow-1"
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      borderRadius: "6px",
                    }}
                    onClick={() => handleRequestExtension(item._id)}
                  >
                    Request Extension
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EXTENSION REQUEST MODAL */}
      <AgreementExtensionRequestModal
        show={showExtensionModal}
        onClose={() => setShowExtensionModal(false)}
        agreementId={currentAgreement?._id}
        onSuccess={() => {
          setShowExtensionModal(false);
        }}
      />
    </>
  );
}
