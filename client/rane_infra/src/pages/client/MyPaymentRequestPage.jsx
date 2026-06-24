import React, { useEffect, useState } from 'react';
import {
  FaSearch, FaFileExport, FaPlus, FaFileInvoice,
  FaWallet, FaRupeeSign, FaExternalLinkAlt, FaTimes,
} from 'react-icons/fa';
import { FiSearch, FiX } from 'react-icons/fi';
import ClientHeader from '../../component/header/ClientHeader';
import StaffHeader from '../../component/header/StaffHeader';
import { getPaymentsByUserId } from '../../services/paymentService';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = {
  primary: '#6b3e2b',
  accent: '#b95a52',
  success: '#225b31',
  destructive: '#c94a3a',
  muted: '#8b7b74',
  warning: '#4a1f18',
};

// ── Status badge meta ─────────────────────────────────────────────────────────
const statusMeta = (status) => {
  switch (status) {
    case 'Paid':
      return { bg: 'var(--success)', color: 'var(--success-foreground)' };
    case 'Pending':
      return { bg: 'var(--warning)', color: 'var(--warning-foreground)' };
    case 'Sanctioned':
      return { bg: '#dbeafe', color: '#1e40af' };
    case 'Rejected':
    case 'Overdue':
      return { bg: '#fde8e6', color: C.destructive };
    default:
      return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)' };
  }
};

const StatusBadge = ({ status }) => {
  const { bg, color } = statusMeta(status);
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      background: bg, color,
      letterSpacing: '0.03em',
    }}>
      {status}
    </span>
  );
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

const controlStyle = {
  border: '1px solid var(--border)', borderRadius: 8,
  padding: '8px 12px', fontSize: 13, color: 'var(--foreground)',
  background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
};

export default function MyPaymentRequestPage() {
  const [payments, setPayments]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchText, setSearchText]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder]     = useState('asc');

  const { user } = useAuthStore();
  const userId   = user?._id;
  const navigate = useNavigate();

  const getHeaderComponent = () => {
    switch (user?.role) {
      case 'client': return <ClientHeader />;
      case 'staff':  return <StaffHeader />;
      default:       return <ClientHeader />;
    }
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const result = await getPaymentsByUserId(userId);
        setPayments(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Failed to fetch payments:', err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchPayments();
  }, [userId]);

  const filteredPayments = payments
    .filter(p =>
      (statusFilter === 'all' || p.status === statusFilter) &&
      (p.tender?.toLowerCase().includes(searchText.toLowerCase()) ||
       p.expenseNo?.toLowerCase().includes(searchText.toLowerCase()))
    )
    .sort((a, b) =>
      sortOrder === 'asc'
        ? a.expenseNo?.localeCompare(b.expenseNo)
        : b.expenseNo?.localeCompare(a.expenseNo)
    );

  // ── Stat counts ──────────────────────────────────────────────────────────
  const statCounts = ['Paid', 'Pending', 'Sanctioned', 'Rejected'].reduce((acc, s) => {
    acc[s] = payments.filter(p => p.status === s).length;
    return acc;
  }, {});

  return (
    <>
      {getHeaderComponent()}

      <div style={{
        padding: '0 2px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--foreground)',
        background: 'var(--background)',
        minHeight: '100vh',
      }}>

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
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'var(--warning)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FaWallet size={16} color={C.primary} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                  My Payment Requests
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  Track status and details of all your submitted payment requests
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/${user?.role}/payment-request`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, border: 'none',
                background: 'var(--primary)', color: '#fff',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <FaPlus size={11} color="#fff" /> New Request
            </button>
          </div>

          <div style={{ padding: '16px 20px' }}>

            {/* ── Stat cards ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 12, marginBottom: 16,
            }}>
              {[
                { label: 'Total', value: payments.length, color: C.primary, bg: 'var(--secondary)' },
                { label: 'Paid', value: statCounts.Paid, color: C.success, bg: 'var(--success)' },
                { label: 'Pending', value: statCounts.Pending, color: C.warning, bg: 'var(--warning)' },
                { label: 'Sanctioned', value: statCounts.Sanctioned, color: '#1e40af', bg: '#dbeafe' },
                { label: 'Rejected', value: statCounts.Rejected, color: C.destructive, bg: '#fde8e6' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{
                  background: bg, borderRadius: 10,
                  padding: '12px 14px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ ...labelStyle, color }}>{label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* ── Search / filter bar ── */}
            <div style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 16px',
              marginBottom: 14,
              boxShadow: '0 2px 8px var(--shadow-color)',
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>

                {/* Search */}
                <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 160 }}>
                  <FiSearch size={13} color={C.muted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search tender or expense no…"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ ...controlStyle, width: '100%', paddingLeft: 30, paddingRight: searchText ? 30 : 12 }}
                  />
                  {searchText && (
                    <FiX size={13} color={C.muted} onClick={() => setSearchText('')}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} />
                  )}
                </div>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{ ...controlStyle, flex: '0 1 140px', cursor: 'pointer' }}
                >
                  <option value="all">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Sanctioned">Sanctioned</option>
                  <option value="Overdue">Overdue</option>
                </select>

                {/* Sort */}
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value)}
                  style={{ ...controlStyle, flex: '0 1 140px', cursor: 'pointer' }}
                >
                  <option value="asc">▲ Ascending</option>
                  <option value="desc">▼ Descending</option>
                </select>

                {/* Reset */}
                <button
                  onClick={() => { setSearchText(''); setStatusFilter('all'); setSortOrder('asc'); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '8px 14px', borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  <FiX size={12} /> Reset
                </button>
              </div>

              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                Showing <strong style={{ color: 'var(--text-strong)' }}>{filteredPayments.length}</strong> of{' '}
                <strong style={{ color: 'var(--text-strong)' }}>{payments.length}</strong> payment requests
              </div>
            </div>

            {/* ── Loading spinner ── */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <span style={{
                  display: 'inline-block', width: 32, height: 32,
                  border: '3px solid var(--border)',
                  borderTopColor: C.accent, borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>Loading payments…</div>
              </div>
            )}

            {/* ── Empty state ── */}
            {!loading && filteredPayments.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '48px 20px',
                background: 'var(--muted)', borderRadius: 12,
                border: '1px solid var(--border)',
              }}>
                <FaWallet size={32} color={C.muted} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>No payment requests found</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {searchText || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : "You haven't submitted any payment requests yet."}
                </div>
              </div>
            )}

            {/* ── Desktop table ── */}
            {!loading && filteredPayments.length > 0 && (
              <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%', minWidth: 780, borderCollapse: 'collapse',
                  fontSize: 13,
                }}>
                  <thead>
                    <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                      {['#', 'Tender', 'Expense No.', 'Amount', 'Mode', 'Status', 'Submitted On', 'Document', 'Remark'].map(h => (
                        <th key={h} style={{
                          padding: '10px 14px', textAlign: 'left',
                          fontSize: 11, fontWeight: 700,
                          color: 'var(--text-muted)', textTransform: 'uppercase',
                          letterSpacing: '0.05em', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment, idx) => (
                      <tr key={payment._id || idx} style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'background .15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* # */}
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                            fontWeight: 700, fontSize: 11,
                          }}>{idx + 1}</span>
                        </td>
                        {/* Tender */}
                        <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--text-strong)', maxWidth: 150 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            title={payment.tender}>{payment.tender}</div>
                        </td>
                        {/* Expense No */}
                        <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: 12 }}>
                          {payment.expenseNo || '—'}
                        </td>
                        {/* Amount */}
                        <td style={{ padding: '11px 14px', fontWeight: 700, color: 'var(--text-strong)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <FaRupeeSign size={11} color={C.accent} />
                            {Number(payment.amount).toLocaleString('en-IN')}
                          </span>
                        </td>
                        {/* Mode */}
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 9px',
                            borderRadius: 20, fontSize: 11, fontWeight: 600,
                            background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                          }}>
                            {payment.paymentMode || '—'}
                          </span>
                        </td>
                        {/* Status */}
                        <td style={{ padding: '11px 14px' }}>
                          <StatusBadge status={payment.status} />
                        </td>
                        {/* Date */}
                        <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {payment.submittedAt
                            ? new Date(payment.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        {/* Document */}
                        <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                          {payment.image_url || payment.image ? (
                            <a
                              href={payment.image_url || payment.image}
                              target="_blank" rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                color: C.accent, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                              }}
                            >
                              <FaFileInvoice size={15} color={C.accent} /> View
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                          )}
                        </td>
                        {/* Remark */}
                        <td style={{ padding: '11px 14px', maxWidth: 180 }}>
                          <div style={{
                            fontSize: 12, color: 'var(--text-muted)',
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          }} title={payment.remark}>
                            {payment.remark || <span style={{ fontStyle: 'italic' }}>No remark</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Mobile cards ── */}
            {!loading && filteredPayments.length > 0 && (
              <div className="d-md-none">
                {filteredPayments.map((payment, idx) => (
                  <div key={payment._id || idx} style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12, padding: '14px 16px',
                    marginBottom: 12,
                    boxShadow: '0 2px 8px var(--shadow-color)',
                  }}>
                    {/* Card header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 26, height: 26, borderRadius: '50%',
                          background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                          fontWeight: 700, fontSize: 11, flexShrink: 0,
                        }}>{idx + 1}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                            {payment.tender}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                            {payment.expenseNo || '—'}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={payment.status} />
                    </div>

                    {/* Data grid */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr',
                      gap: '8px 12px', marginBottom: 10,
                    }}>
                      {[
                        {
                          label: 'Amount', value: (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <FaRupeeSign size={10} color={C.accent} />
                              {Number(payment.amount).toLocaleString('en-IN')}
                            </span>
                          )
                        },
                        {
                          label: 'Payment mode', value: (
                            <span style={{
                              display: 'inline-block', padding: '2px 8px',
                              borderRadius: 20, fontSize: 11, fontWeight: 600,
                              background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                            }}>
                              {payment.paymentMode || '—'}
                            </span>
                          )
                        },
                        {
                          label: 'Submitted on',
                          value: payment.submittedAt
                            ? new Date(payment.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'
                        },
                        {
                          label: 'Document', value: payment.image_url || payment.image ? (
                            <a href={payment.image_url || payment.image} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.accent, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                              <FaFileInvoice size={13} color={C.accent} /> View
                            </a>
                          ) : <span style={{ color: 'var(--text-muted)' }}>—</span>
                        },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={{ ...labelStyle, marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Remark */}
                    {payment.remark && (
                      <div style={{
                        borderTop: '1px solid var(--border)',
                        paddingTop: 8, marginTop: 4,
                      }}>
                        <div style={{ ...labelStyle, marginBottom: 3 }}>Remark</div>
                        <div style={{
                          fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5,
                          overflow: 'hidden', display: '-webkit-box',
                          WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                        }} title={payment.remark}>
                          {payment.remark}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Footer actions ── */}
            {!loading && (
              <div style={{
                display: 'flex', justifyContent: 'flex-end',
                gap: 10, flexWrap: 'wrap', marginTop: 6,
              }}>
                <button
                  onClick={() => navigate(`/${user?.role}/payment-request`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 8,
                    border: '1px solid var(--primary)',
                    background: 'transparent', color: C.primary,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <FaPlus size={11} color={C.primary} /> New Payment Request
                </button>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <FaFileExport size={11} color={C.muted} /> Export
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: var(--input); color: var(--foreground); }
      `}</style>
    </>
  );
}