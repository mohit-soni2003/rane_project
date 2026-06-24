import React, { useEffect, useState } from "react";
import ClientHeader from "../../component/header/ClientHeader";
import { useAuthStore } from "../../store/authStore";
import { getAllTransactionsByUserId } from "../../services/transactionService";
import { useNavigate } from "react-router-dom";
import {
  FaClipboardList, FaFileInvoice, FaRupeeSign,
  FaUserTie, FaExchangeAlt, FaUniversity, FaWallet,
  FaExternalLinkAlt, FaTimes,
} from "react-icons/fa";

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = {
  primary: '#6b3e2b',
  accent: '#b95a52',
  success: '#225b31',
  destructive: '#c94a3a',
  muted: '#8b7b74',
  warning: '#4a1f18',
};

// ── Type badge meta ───────────────────────────────────────────────────────────
const typeMeta = (type) => {
  switch (type) {
    case 'Bill':            return { bg: 'var(--warning)', color: 'var(--warning-foreground)' };
    case 'Salary':          return { bg: 'var(--success)', color: 'var(--success-foreground)' };
    case 'Payment Request': return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)' };
    default:                return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)' };
  }
};

const getType = (txn) => txn.billId ? 'Bill' : txn.paymentId ? 'Payment Request' : 'Salary';

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2,
};

const cardStyle = {
  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
  marginBottom: 14, boxShadow: '0 2px 8px var(--shadow-color)', overflow: 'hidden',
};

export default function TransactionPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [filterType, setFilterType] = useState('All');

  const navigate = useNavigate();

  const maskAcc = (acc) => {
    if (!acc) return "N/A";
    const str = acc.toString();
    if (str.length <= 4) return str;
    return `${str.slice(0, 2)}****${str.slice(-2)}`;
  };

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
    if (user?._id) fetchTransactions();
  }, [user?._id]);

  // counts and filtered list
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

  const wrapStyle = {
    padding: '0 2px', fontFamily: 'system-ui, -apple-system, sans-serif',
    color: 'var(--foreground)', background: 'var(--background)', minHeight: '100vh',
  };

  // Bank/UPI display helper
  const bankUpi = (txn) => {
    if (txn.bankName) return txn.bankName;
    if (txn.upiId) return txn.upiId;
    return '—';
  };

  return (
    <>
      <ClientHeader />

      <div style={wrapStyle}>

        {/* ── Page card ── */}
        <div style={{
          background: 'var(--card)',
          borderRadius: 14,
          border: '1px solid var(--border)',
          boxShadow: '0 2px 10px var(--shadow-color)',
          overflow: 'hidden',
          marginBottom: 16,
        }}>

          {/* ── Title bar ── */}
          <div style={{
            borderBottom: '1px solid var(--border)',
            padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FaExchangeAlt size={15} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                Transaction History
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                All your bill, payment request, and salary transactions
              </div>
            </div>
          </div>

          <div style={{ padding: '16px 20px' }}>

            {/* ── Stat cards ── */}
            {!loading && totalCount > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: 12, marginBottom: 16,
              }}>
                {[
                  { label: 'Total', value: totalCount, icon: FaClipboardList, color: C.primary, bg: 'var(--secondary)' },
                  { label: 'Bill', value: billCount, icon: FaFileInvoice, color: C.warning, bg: 'var(--warning)' },
                  { label: 'Payment', value: paymentCount, icon: FaRupeeSign, color: C.accent, bg: 'var(--muted)' },
                  { label: 'Salary', value: salaryCount, icon: FaUserTie, color: C.success, bg: 'var(--success)' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} style={{
                    background: bg, borderRadius: 10, padding: '12px 14px',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  }}>
                    <div>
                      <div style={{ ...labelStyle, color }}>{label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
                    </div>
                    <Icon size={20} color={color} style={{ opacity: 0.85, flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            )}

            {/* ── Filter chips ── */}
            {!loading && totalCount > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                  { type: 'All', count: totalCount },
                  { type: 'Bill', count: billCount },
                  { type: 'Payment Request', count: paymentCount },
                  { type: 'Salary', count: salaryCount },
                ].map(({ type, count }) => {
                  const active = filterType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        padding: '7px 14px', borderRadius: 999,
                        border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                        background: active ? 'var(--primary)' : 'var(--card)',
                        color: active ? '#fff' : 'var(--foreground)',
                        fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                        transition: 'all .15s ease',
                      }}
                    >
                      {type}
                      <span style={{
                        fontSize: 10.5, fontWeight: 700,
                        padding: '1px 7px', borderRadius: 20,
                        background: active ? 'rgba(255,255,255,0.22)' : 'var(--muted)',
                        color: active ? '#fff' : 'var(--text-muted)',
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Loading ── */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <span style={{
                  display: 'inline-block', width: 32, height: 32,
                  border: '3px solid var(--border)', borderTopColor: C.accent,
                  borderRadius: '50%', animation: 'spin 1s linear infinite',
                }} />
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>Loading transactions…</div>
              </div>
            )}

            {/* ── Error ── */}
            {error && !loading && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 14,
                background: '#fde8e6', border: '1px solid #f5b8b2',
                fontSize: 13, color: C.destructive,
              }}>
                {error}
              </div>
            )}

            {/* ── Empty ── */}
            {!loading && filteredTransactions.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '48px 20px',
                background: 'var(--muted)', borderRadius: 12, border: '1px solid var(--border)',
              }}>
                <FaExchangeAlt size={32} color={C.muted} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>No transactions found</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {filterType !== 'All' ? `No ${filterType.toLowerCase()} transactions to show.` : "You don't have any transactions yet."}
                </div>
              </div>
            )}

            {/* ── Desktop table ── */}
            {!loading && filteredTransactions.length > 0 && (
              <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 920, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                      {['#', 'Type', 'Amount', 'Date', 'Bank / UPI', 'Acc. No', 'IFSC', 'Source', 'Details'].map(h => (
                        <th key={h} style={{
                          padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                          color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((txn, i) => {
                      const type = getType(txn);
                      const meta = typeMeta(type);
                      return (
                        <tr key={txn._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '11px 14px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 26, height: 26, borderRadius: '50%',
                              background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                              fontWeight: 700, fontSize: 11,
                            }}>{i + 1}</span>
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <span style={{
                              display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                              fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color,
                            }}>{type}</span>
                          </td>
                          <td style={{ padding: '11px 14px', fontWeight: 700, color: 'var(--text-strong)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FaRupeeSign size={11} color={C.accent} />
                              {txn.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </span>
                          </td>
                          <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                            {formatDate(txn.transactionDate)}
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              {txn.bankName
                                ? <FaUniversity size={12} color={C.muted} />
                                : txn.upiId ? <FaWallet size={12} color={C.muted} /> : null}
                              <span style={{ color: 'var(--foreground)' }}>{bankUpi(txn)}</span>
                            </span>
                          </td>
                          <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 12 }}>{maskAcc(txn.accNo)}</td>
                          <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: 12 }}>{txn.ifscCode || 'N/A'}</td>
                          <td style={{ padding: '11px 14px' }}>
                            {txn.billId ? (
                              <button
                                onClick={() => navigate(`/client/bill/${txn.billId}`)}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 5,
                                  padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)',
                                  background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                                  fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                                }}
                              >
                                View Bill <FaExternalLinkAlt size={9} color="var(--secondary-foreground)" />
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <button
                              onClick={() => openDetails(txn)}
                              title="View details"
                              style={{
                                padding: '6px 14px', borderRadius: 7,
                                border: '1px solid var(--primary)',
                                background: 'var(--secondary)', color: C.primary,
                                fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Mobile cards ── */}
            {!loading && filteredTransactions.length > 0 && (
              <div className="d-md-none">
                {filteredTransactions.map((txn, i) => {
                  const type = getType(txn);
                  const meta = typeMeta(type);
                  return (
                    <div key={txn._id} style={{
                      ...cardStyle, padding: '14px 16px',
                      borderLeft: `4px solid ${type === 'Bill' ? '#d9a441' : type === 'Salary' ? C.success : C.accent}`,
                    }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                            fontWeight: 700, fontSize: 11, flexShrink: 0,
                          }}>{i + 1}</span>
                          <span style={{
                            display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                            fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color,
                          }}>{type}</span>
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, fontSize: 16, color: 'var(--text-strong)' }}>
                          <FaRupeeSign size={12} color={C.accent} />
                          {txn.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </span>
                      </div>

                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                        {formatDate(txn.transactionDate)}
                      </div>

                      {/* Detail grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: 12 }}>
                        {txn.bankName && (
                          <div><div style={labelStyle}>Bank</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{txn.bankName}</div></div>
                        )}
                        {txn.accNo && (
                          <div><div style={labelStyle}>Account No.</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', fontFamily: 'monospace' }}>{maskAcc(txn.accNo)}</div></div>
                        )}
                        {txn.ifscCode && (
                          <div><div style={labelStyle}>IFSC</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{txn.ifscCode}</div></div>
                        )}
                        {txn.upiId && (
                          <div><div style={labelStyle}>UPI</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', wordBreak: 'break-all' }}>{txn.upiId}</div></div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        {txn.billId && (
                          <button
                            onClick={() => navigate(`/client/bill/${txn.billId}`)}
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              padding: '9px', borderRadius: 8, border: '1px solid var(--border)',
                              background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                              fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            <FaExternalLinkAlt size={11} color={C.accent} /> View Bill
                          </button>
                        )}
                        <button
                          onClick={() => openDetails(txn)}
                          style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '9px', borderRadius: 8, border: '1px solid var(--primary)',
                            background: 'var(--secondary)', color: C.primary,
                            fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Details modal ── */}
      {showModal && selectedTxn && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1060,
            background: 'rgba(0,0,0,0.45)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--card)', borderRadius: 14,
              width: '100%', maxWidth: 460, overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', background: 'var(--primary)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 700, fontSize: 15 }}>
                <FaExchangeAlt size={14} color="#fff" /> Transaction Details
              </span>
              <FaTimes size={16} color="#fff" style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
            </div>

            {/* Body */}
            <div style={{ padding: '18px' }}>
              {(() => {
                const type = getType(selectedTxn);
                const rows = [
                  { label: 'Transaction ID', value: selectedTxn._id, mono: true },
                  { label: 'Type', value: type },
                  { label: 'Amount', value: `₹${selectedTxn.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}` },
                  { label: 'Date', value: formatDate(selectedTxn.transactionDate) },
                  selectedTxn.bankName && { label: 'Bank', value: selectedTxn.bankName },
                  selectedTxn.accNo && { label: 'Account No.', value: maskAcc(selectedTxn.accNo), mono: true },
                  selectedTxn.ifscCode && { label: 'IFSC', value: selectedTxn.ifscCode },
                  selectedTxn.upiId && { label: 'UPI', value: selectedTxn.upiId, mono: true },
                  selectedTxn.billId && { label: 'Bill ID', value: selectedTxn.billId, mono: true },
                  selectedTxn.paymentId && { label: 'Payment ID', value: selectedTxn.paymentId?._id || selectedTxn.paymentId, mono: true },
                  selectedTxn.payNote && { label: 'Pay Note', value: selectedTxn.payNote },
                ].filter(Boolean);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {rows.map(({ label, value, mono }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'baseline' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>{label}</span>
                        <span style={{
                          fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', textAlign: 'right',
                          fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all',
                        }}>{value}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              padding: '14px 18px', borderTop: '1px solid var(--border)',
            }}>
              {selectedTxn.billId && (
                <button
                  onClick={() => { setShowModal(false); navigate(`/client/bill/${selectedTxn.billId}`); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)',
                    background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <FaExternalLinkAlt size={11} color={C.accent} /> Open Bill
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '9px 18px', borderRadius: 8, border: 'none',
                  background: 'var(--primary)', color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}