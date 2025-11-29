import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientHeader from "../../component/header/ClientHeader";
import { getClientAgreements } from "../../services/agreement";  // <-- use your service

export default function ClosedAgreement() {
  const navigate = useNavigate();
  const [closedAgreements, setClosedAgreements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClosedAgreements = async () => {
      try {
        // fetch all agreements (empty status = no filter)
        const response = await getClientAgreements("");

        const agreements = response.agreements;

        const today = new Date(); 

        // filter: rejected AND expired
        const filtered = agreements.filter((ag) => {
          const expiryDate = new Date(ag.expiry);
          return ag.status === "rejected" || expiryDate > today;
        });

        setClosedAgreements(filtered);
      } catch (error) {
        console.error("Error loading closed agreements", error);
        setClosedAgreements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClosedAgreements();
  }, []);

  const handleRequestExtension = (id) => {
    console.log("Requesting extension for:", id);
  };
  const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

  return (
    <>
      <ClientHeader />

      <div
        className="container py-4 mt-3"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        <h3 className="fw-bold mb-2" style={{ color: "var(--text-strong)" }}>
          Closed Agreements
        </h3>
        <p style={{ color: "var(--text-muted)", marginTop: "-8px" }}>
          These agreements were rejected and have crossed the expiry date.
        </p>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-muted mt-4">Loading...</div>
        )}

        {/* Desktop Table View */}
        {!loading && (
          <>
            <div
              className="table-responsive d-none d-md-block mt-4"
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
                    <th>#</th>
                    <th>Title</th>
                    <th>Uploaded By</th>
                    <th>Uploaded</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {closedAgreements.map((item, idx) => (
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
                          style={{ color: "var(--text-strong)" }}
                        >
                          {item.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {item._id}
                        </div>
                      </td>

                      <td>{item.uploadedBy?.name}</td>

                      <td style={{ color: "var(--text-muted)" }}>
                        {item.createdAt?.split("T")[0]}
                      </td>

                      <td style={{ color: "var(--text-muted)" }}>
                        {formatDate(item.createdAt)}
                      </td>

                      <td>
                        <span
                          className="badge px-3 py-2"
                          style={{
                            background: "#dc3545",
                            color: "white",
                            borderRadius: "6px",
                            fontSize: "12px",
                          }}
                          >
                          {item.status}

                        </span>
                      </td>

                      <td className="text-end">
                        <button
                          className="btn btn-sm"
                          style={{
                            background: "var(--primary)",
                            color: "var(--primary-foreground)",
                            borderRadius: "6px",
                          }}
                          onClick={() => handleRequestExtension(item._id)}
                        >
                          Request Extension
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* No Data */}
            {closedAgreements.length === 0 && !loading && (
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
          </>
        )}

        {/* Mobile Cards View */}
        {!loading && (
          <div className="d-block d-md-none mt-4">
            {closedAgreements.length === 0 ? (
              <div className="text-center text-muted">
                No Closed Agreements
              </div>
            ) : (
              closedAgreements.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 mb-3"
                  style={{
                    background: "var(--card)",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="fw-semibold">{item.title}</div>

                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      marginBottom: "6px",
                    }}
                  >
                    {item._id}
                  </div>

                  <div>Uploaded By: {item.uploadedBy?.name}</div>
                  <div>Uploaded: {item.createdAt?.split("T")[0]}</div>
                  <div>Expired On: {item.expiry}</div>

                  <span
                    className="badge px-3 py-2 my-2"
                    style={{
                      background: "#dc3545",
                      color: "white",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  >
                    Rejected & Expired
                  </span>

                  <button
                    className="btn w-100 mt-2"
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }}
                    onClick={() => handleRequestExtension(item._id)}
                  >
                    Request Extension
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>


);

}
