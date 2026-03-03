import React, { useEffect, useState } from "react";
import ClientHeader from "../../component/header/ClientHeader";
import { useAuthStore } from "../../store/authStore";
import { getAllTransactionsByUserId } from "../../services/transactionService";
import { useNavigate } from "react-router-dom";
import {
  Container, Row, Col, Table, Form, Button,
  InputGroup, Pagination, Spinner, Tooltip, OverlayTrigger
} from 'react-bootstrap';
import { FaEye, FaClipboardList, FaFileInvoice, FaRupeeSign, FaUserTie } from 'react-icons/fa';

export default function TransactionPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [filterType, setFilterType] = useState('All');

  const navigate = useNavigate();

  // helper to mask account numbers: show first 2 and last 2 digits with stars
  const maskAcc = (acc) => {
    if (!acc) return "N/A";
    const str = acc.toString();
    if (str.length <= 4) return str;
    return `${str.slice(0, 2)}****${str.slice(-2)}`;
  };

  // format date as "3 Aug 2025"
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const openDetails = (txn) => {
    setSelectedTxn(txn);
    setShowModal(true);
  };

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

  // compute counts and filtered list
  const totalCount = transactions.length;
  const billCount = transactions.filter(t => t.billId).length;
  const paymentCount = transactions.filter(t => t.paymentId).length;
  const salaryCount = transactions.filter(t => !t.billId && !t.paymentId).length;
  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'All') return true;
    if (filterType === 'Bill') return !!t.billId;
    if (filterType === 'Payment Request') return !!t.paymentId;
    if (filterType === 'Salary') return !t.billId && !t.paymentId;
    return true;
  });

  return (
    <>
      <ClientHeader />

      <div className="container mt-4"  style={{ backgroundColor: "var(--client-component-bg-color)" }}>
        <h3
          className="mb-3 fw-bold"
          style={{ color: "var(--client-heading-color)" }}
        >
          Transaction History
        </h3>
        {/* summary cards - hidden on mobile */}
        {!loading && totalCount > 0 && (
          <div className="row mb-3 d-none d-md-flex g-3">
            {[
              { label: 'Total', value: totalCount, icon: <FaClipboardList /> },
              { label: 'Bill', value: billCount, icon: <FaFileInvoice /> },
              { label: 'Payment', value: paymentCount, icon: <FaRupeeSign /> },
              { label: 'Salary', value: salaryCount, icon: <FaUserTie /> },
            ].map((item, idx) => (
              <div key={idx} className="col-md-3">
                <div
                  className="p-3 rounded shadow-sm d-flex align-items-center justify-content-between"
                  style={{ backgroundColor: 'var(--card)' }}
                >
                  <div>
                    <div className="small text-muted">{item.label}</div>
                    <div className="fw-semibold h4">{item.value}</div>
                  </div>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      color: 'var(--primary)'
                    }}
                  >
                    {item.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* filter buttons styled to match theme */}
        {!loading && totalCount > 0 && (
          <div className="mb-3 d-flex gap-2 flex-wrap">
            {['All', 'Bill', 'Payment Request', 'Salary'].map(type => {
              const active = filterType === type;
              return (
                <Button
                  key={type}
                  size="sm"
                  variant="light"
                  style={{
                    backgroundColor: active ? 'var(--primary)' : 'var(--card)',
                    color: active ? 'var(--primary-foreground)' : 'var(--primary)',
                    border: `1px solid var(--primary)`,
                    borderRadius: '999px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 10px var(--shadow-color)'
                  }}
                  onClick={() => setFilterType(type)}
                >
                  {type}
                </Button>
              );
            })}
          </div>
        )}

        {loading && <p>Loading transactions...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && filteredTransactions.length === 0 && (
          <p className="text-muted">No transactions found.</p>
        )}

        {/* ================= DESKTOP TABLE VIEW ================= */}
        {!loading && filteredTransactions.length > 0 && (
          <div className="d-none d-md-block">
            <div className="card shadow-sm border-0" >
              <div className="card-body table-responsive">
                <Table
                  hover
                  className="shadow-sm small"
                  style={{
                    backgroundColor: "var(--card)",
                    border: "0px solid var(--border)",
                    borderRadius: "18px",
                    minWidth: "1000px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <thead
                    style={{
                      backgroundColor: "var(--card)",
                      color: "var(--text-strong)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <tr className="small text-uppercase">
                      <th>S.No</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Bank / UPI</th>
                      <th>Acc. No</th>
                      <th>IFSC</th>
                      <th>Actions</th>
                      <th>More</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((txn, i) => {
                        const type =
                          txn.billId
                            ? "Bill"
                            : txn.paymentId
                              ? "Payment Request"
                              : "Salary";

                        const badgeColor =
                          type === "Bill"
                            ? "var(--warning)"
                            : type === "Salary"
                              ? "var(--success)"
                              : "var(--accent)";

                        const badgeTextColor =
                          type === "Bill"
                            ? "var(--warning-foreground)"
                            : "white";

                        return (
                          <tr key={txn._id}>
                            {/* Serial Number */}
                            <td>
                              <div
                                className="rounded-circle d-inline-flex align-items-center justify-content-center"
                                style={{
                                  backgroundColor: "var(--muted)",
                                  color: "var(--text-strong)",
                                  width: "30px",
                                  height: "30px",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {i + 1}
                              </div>
                            </td>

                            {/* Type Badge */}
                            <td>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: badgeColor,
                                  color: badgeTextColor,
                                }}
                              >
                                {type}
                              </span>
                            </td>

                            {/* Amount */}
                            <td className="fw-bold" style={{ color: "var(--text-strong)" }}>
                              ₹{txn.amount?.toFixed(2) || "0.00"}
                            </td>

                            {/* Date */}
                            <td style={{ color: "var(--text-muted)" }}>
                              {formatDate(txn.transactionDate)}
                            </td>

                            {/* Bank / UPI */}
                            <td>
                              {txn.bankName && <span>{txn.bankName}</span>}
                              {txn.upiId && <span>{txn.upiId}</span>}
                              {!txn.bankName && !txn.upiId && "—"}
                            </td>
                            <td>{maskAcc(txn.accNo)}</td>
                            <td>{txn.ifscCode || "N/A"}</td>

                            {/* Actions */}
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <Button
                                  size="sm"
                                  style={{
                                    backgroundColor: "var(--primary)",
                                    color: "var(--primary-foreground)",
                                    border: "none",
                                  }}
                                  onClick={() =>
                                    txn.billId
                                      ? navigate(`/client/bill/${txn.billId}`)
                                      : setShowModal(true)
                                  }
                                >
                                   View
                                </Button>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <Button
                                  size="sm"
                                  style={{
                                    backgroundColor: "var(--primary)",
                                    color: "var(--primary-foreground)",
                                    border: "none",
                                  }}
                                  onClick={() => openDetails(txn)}
                                >
                                  <FaEye className="m-1" />
                                </Button>
                              </div>
                            </td>

                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-3"
                          style={{ color: "var(--text-muted)" }}
                        >
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* ================= MOBILE CARD VIEW (YOUR ORIGINAL DESIGN UNTOUCHED) ================= */}
        {!loading && filteredTransactions.length > 0 && (
          <div className="d-block d-md-none ">
            {filteredTransactions.map((txn) => (
              <div
                key={txn._id}
                className="card shadow-sm mb-3"
                style={{
                  borderLeft: "6px solid var(--client-btn-bg)",
                  backgroundColor:
                    "var(--client-component-bg-color)",
                }}
              >
                <div className="card-body">
                  <h5
                    className="card-title fw-bold"
                    style={{
                      color:
                        "var(--client-heading-color)",
                    }}
                  >
                    {txn.billId
                      ? `Bill Transaction (Invoice: ${txn.billId || "N/A"
                      })`
                      : txn.paymentId
                        ? `Payment Request Transaction (ID: ${txn.paymentId?._id || "N/A"
                        })`
                        : "Transaction"}
                  </h5>

                  <p
                    className="card-text fw-bold"
                    style={{
                      color:
                        "var(--primary-orange)",
                      fontSize: "1.1rem",
                    }}
                  >
                    ₹
                    {txn.amount?.toFixed(2) ||
                      "0.00"}
                  </p>

                  <p className="card-text text-muted mb-2">
                    {formatDate(txn.transactionDate)}
                  </p>

                  <ul
                    className="list-unstyled mb-2"
                    style={{
                      color:
                        "var(--client-text-color)",
                    }}
                  >
                    {txn.bankName && (
                      <li>
                        <strong>Bank:</strong>{" "}
                        {txn.bankName}
                      </li>
                    )}
                    {txn.accNo && (
                      <li>
                        <strong>Account No:</strong>{" "}
                        {maskAcc(txn.accNo)}
                      </li>
                    )}
                    {txn.ifscCode && (
                      <li>
                        <strong>IFSC:</strong>{" "}
                        {txn.ifscCode}
                      </li>
                    )}
                    {txn.upiId && (
                      <li>
                        <strong>UPI:</strong>{" "}
                        {txn.upiId}
                      </li>
                    )}
                  </ul>

                  <button
                    className="btn btn-sm"
                    style={{
                      backgroundColor:
                        "var(--client-btn-bg)",
                      color:
                        "var(--client-btn-text)",
                    }}
                    onMouseOver={(e) =>
                    (e.target.style.backgroundColor =
                      "var(--client-btn-hover)")
                    }
                    onMouseOut={(e) =>
                    (e.target.style.backgroundColor =
                      "var(--client-btn-bg)")
                    }
                    onClick={() => openDetails(txn)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {showModal && selectedTxn && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5
                  className="modal-title"
                  style={{
                    color: "var(--client-heading-color)",
                  }}
                >
                  Transaction Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div
                className="modal-body"
                style={{
                  color: "var(--client-text-color)",
                }}
              >
                <p><strong>Transaction ID:</strong> {selectedTxn._id}</p>
                <p><strong>Type:</strong> {selectedTxn.billId ? 'Bill' : selectedTxn.paymentId ? 'Payment Request' : 'Salary'}</p>
                <p><strong>Amount:</strong> ₹{selectedTxn.amount?.toFixed(2) || '0.00'}</p>
                <p><strong>Date:</strong> {formatDate(selectedTxn.transactionDate)}</p>
                {selectedTxn.bankName && <p><strong>Bank:</strong> {selectedTxn.bankName}</p>}
                {selectedTxn.accNo && <p><strong>Account No:</strong> {maskAcc(selectedTxn.accNo)}</p>}
                {selectedTxn.ifscCode && <p><strong>IFSC:</strong> {selectedTxn.ifscCode}</p>}
                {selectedTxn.upiId && <p><strong>UPI:</strong> {selectedTxn.upiId}</p>}
                {selectedTxn.billId && <p><strong>Bill ID:</strong> {selectedTxn.billId}</p>}
                {selectedTxn.paymentId && <p><strong>Payment ID:</strong> {selectedTxn.paymentId?._id || selectedTxn.paymentId}</p>}
                {selectedTxn.payNote && <p><strong>Pay Note:</strong> {selectedTxn.payNote}</p>}
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