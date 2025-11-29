import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock } from "react-icons/fi";
import ClientHeader from "../../component/header/ClientHeader";

// import service
import { getClientActionAgreements } from "../../services/agreement";

export default function AgreementForAction() {
  const navigate = useNavigate();
  const [actionable, setActionable] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH AGREEMENTS ----------------
  useEffect(() => {
    const loadAgreements = async () => {
      try {
        const res = await getClientActionAgreements();
        setActionable(res.agreements || []);
      } catch (error) {
        setActionable([]);
      } finally {
        setLoading(false);
      }
    };

    loadAgreements();
  }, []);

  return (
    <>
      <ClientHeader />

      <div
        className="container py-4 mt-3"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        <h3 className="fw-bold mb-2" style={{ color: "var(--text-strong)" }}>
          Agreements – Action Required
        </h3>
        <p style={{ color: "var(--text-muted)", marginTop: "-8px" }}>
          These agreements need your review or signature.
        </p>

        {/* --------------------- LOADING STATE --------------------- */}
        {loading && (
          <div className="text-center mt-4 text-muted">
            Loading agreements...
          </div>
        )}

        {/* --------------------- DESKTOP TABLE VIEW --------------------- */}
        {!loading && (
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
                {actionable.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{ background: "var(--card)", borderRadius: "10px" }}
                  >
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
                        style={{
                          color: "var(--text-strong)",
                          fontSize: "15px",
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{ fontSize: "12px", color: "var(--text-muted)" }}
                      >
                        {item._id}
                      </div>
                    </td>

                    <td>
                      <div className="fw-semibold" style={{ fontSize: "14px" }}>
                        {item.uploadedBy?.name || "Staff"}
                      </div>
                      <div
                        style={{ fontSize: "12px", color: "var(--text-muted)" }}
                      >
                        Staff
                      </div>
                    </td>

                    <td style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                      {item.createdAt?.split("T")[0]}
                    </td>

                    <td style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                      {item.expiry || "—"}
                    </td>

                    <td>
                      <span
                        className="badge px-3 py-2"
                        style={{
                          background: "var(--warning)",
                          color: "black",
                          borderRadius: "6px",
                          fontSize: "12px",
                          textTransform: "capitalize",
                        }}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div
                        className="d-flex justify-content-end gap-2"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        <button
                          className="btn btn-sm"
                          style={{
                            background: "var(--secondary)",
                            color: "var(--secondary-foreground)",
                            borderRadius: "6px",
                            padding: "6px 14px",
                            fontSize: "13px",
                          }}
                          onClick={() =>
                            navigate("/agreement/action/view", {
                              state: { agreement: item },
                            })
                          }
                        >
                          View
                        </button>

                        {(item.status === "pending" ||
                          item.status === "viewed") && (
                          <>
                            <button
                              className="btn btn-sm"
                              style={{
                                background: "var(--primary)",
                                color: "var(--primary-foreground)",
                                borderRadius: "6px",
                                padding: "6px 14px",
                                fontSize: "13px",
                              }}
                              onClick={() =>
                                navigate("/agreement/action/view", {
                                  state: { agreement: item },
                                })
                              }
                            >
                              Sign
                            </button>

                            <button
                              className="btn btn-sm"
                              style={{
                                background: "var(--primary)",
                                color: "var(--primary-foreground)",
                                borderRadius: "6px",
                                padding: "6px 14px",
                                fontSize: "13px",
                              }}
                              onClick={() =>
                                navigate("/agreement/action/view", {
                                  state: { agreement: item },
                                })
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- Desktop No Data ---------------- */}
        {!loading && actionable.length === 0 && (
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

        {/* --------------------- MOBILE CARD VIEW --------------------- */}
        <div className="d-block d-md-none mt-4">
          {!loading && actionable.length === 0 ? (
            <div className="text-center text-muted">No Agreements Found</div>
          ) : (
            actionable.map((item, idx) => (
              <div
                key={idx}
                className="p-3 mb-3"
                style={{
                  background: "var(--card)",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  boxShadow: "0 2px 6px var(--shadow-color)",
                }}
              >
                <div
                  className="fw-semibold mb-1"
                  style={{ color: "var(--text-strong)", fontSize: "16px" }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    marginBottom: "6px",
                  }}
                >
                  {item._id}
                </div>

                <div className="mb-1">
                  <strong>Uploaded By:</strong>{" "}
                  {item.uploadedBy?.name || "Staff"}
                </div>

                <div className="mb-1">
                  <strong>Uploaded:</strong>{" "}
                  {item.createdAt?.split("T")[0]}
                </div>

                <div className="mb-2 d-flex align-items-center">
                  <FiClock className="me-1" />{" "}
                  <strong>{item.expiry || "—"}</strong>
                </div>

                <span
                  className="badge px-3 py-2 mb-3"
                  style={{
                    background: "var(--warning)",
                    color: "black",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                >
                  {item.status}
                </span>

                <div className="d-flex gap-2 mt-2">
                  <button
                    className="btn w-100"
                    style={{
                      background: "var(--secondary)",
                      color: "var(--secondary-foreground)",
                      borderRadius: "8px",
                      fontWeight: 600,
                    }}
                    onClick={() =>
                      navigate("/agreement/action/view", {
                        state: { agreement: item },
                      })
                    }
                  >
                    View
                  </button>

                  {(item.status === "pending" || item.status === "viewed") && (
                    <button
                      className="btn w-100"
                      style={{
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                        borderRadius: "8px",
                        fontWeight: 600,
                      }}
                      onClick={() =>
                        navigate("/agreement/action/view", {
                          state: { agreement: item },
                        })
                      }
                    >
                      Sign
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
