import React, { useEffect, useState } from "react";
import ClientHeader from "../../component/header/ClientHeader";
import { useAuthStore } from "../../store/authStore";
import { getAllTransactionsByUserId } from "../../services/transactionService";
import { useNavigate } from "react-router-dom";

export default function TransactionPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getAllTransactionsByUserId(user._id);
        setTransactions(data);
      } catch (err) {
        setError(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchTransactions();
    }
  }, [user?._id]);

  return (
    <>
      <ClientHeader />

      <div className="container mt-4">
        <h3
          className="mb-3 fw-bold"
          style={{ color: "var(--client-heading-color)" }}
        >
          Transaction History
        </h3>

        {loading && <p>Loading transactions...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && transactions.length === 0 && (
          <p className="text-muted">No transactions found.</p>
        )}

        {!loading &&
          transactions.length > 0 &&
          transactions.map((txn) => (
            <div
              key={txn._id}
              className="card shadow-sm mb-3"
              style={{
                borderLeft: "6px solid var(--client-btn-bg)",
                backgroundColor: "var(--client-component-bg-color)",
              }}
            >
              <div className="card-body">
                <h5
                  className="card-title fw-bold"
                  style={{ color: "var(--client-heading-color)" }}
                >
                  {txn.billId
                    ? `Bill Transaction (Invoice: ${txn.billId || "N/A"})`
                    : txn.paymentId
                    ? `Payment Request Transaction (ID: ${
                        txn.paymentId?._id || "N/A"
                      })`
                    : "Transaction"}
                </h5>

                <p
                  className="card-text fw-bold"
                  style={{ color: "var(--primary-orange)", fontSize: "1.1rem" }}
                >
                  ₹{txn.amount?.toFixed(2) || "0.00"}
                </p>
                <p className="card-text text-muted mb-2">
                  {new Date(txn.transactionDate).toLocaleString()}
                </p>

                <ul
                  className="list-unstyled mb-2"
                  style={{ color: "var(--client-text-color)" }}
                >
                  {txn.bankName && (
                    <li>
                      <strong>Bank:</strong> {txn.bankName}
                    </li>
                  )}
                  {txn.accNo && (
                    <li>
                      <strong>Account No:</strong> {txn.accNo}
                    </li>
                  )}
                  {txn.ifscCode && (
                    <li>
                      <strong>IFSC:</strong> {txn.ifscCode}
                    </li>
                  )}
                  {txn.upiId && (
                    <li>
                      <strong>UPI:</strong> {txn.upiId}
                    </li>
                  )}
                </ul>

                <button
                  className="btn btn-sm"
                  style={{
                    backgroundColor: "var(--client-btn-bg)",
                    color: "var(--client-btn-text)",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "var(--client-btn-hover)")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "var(--client-btn-bg)")
                  }
                  onClick={() =>
                    txn.billId
                      ? navigate(`/client/bill/${txn.billId}`)
                      : setShowModal(true)
                  }
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Bootstrap Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5
                  className="modal-title"
                  style={{ color: "var(--client-heading-color)" }}
                >
                  Service Unavailable
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div
                className="modal-body"
                style={{ color: "var(--client-text-color)" }}
              >
                Currently service not available for this transaction.
              </div>
              <div className="modal-footer">
                <button
                  className="btn"
                  style={{
                    backgroundColor: "var(--client-btn-bg)",
                    color: "var(--client-btn-text)",
                  }}
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
