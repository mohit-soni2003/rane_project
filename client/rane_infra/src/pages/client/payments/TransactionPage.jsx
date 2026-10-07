import React, { useEffect, useMemo, useState } from "react";
import ClientHeader from "../../../components/layout/header/ClientHeader";
import { useAuthStore } from "../../../store/authStore";
import { getAllTransactionsByUserId } from "../../../services/transactionService";
import { useNavigate } from "react-router-dom";
import {
  FaClipboardList, FaFileInvoice, FaRupeeSign, FaUserTie, FaExchangeAlt, FaUniversity,
  FaWallet, FaExternalLinkAlt, FaTimes, FaHandHoldingUsd,
} from "react-icons/fa";
import {
  FiSearch, FiX, FiFilter, FiChevronDown, FiArrowUp, FiArrowDown, FiRotateCcw, FiCalendar, FiArrowRight,
} from "react-icons/fi";

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = {
  primary: '#6b3e2b',
  accent: '#b95a52',
  success: '#225b31',
  destructive: '#c94a3a',
  muted: '#8b7b74',
  warning: '#4a1f18',
};

// ── Type helpers ──────────────────────────────────────────────────────────────
const getType = (txn) => (txn.billId ? 'Bill' : txn.paymentId ? 'Payment Request' : 'Salary');
const paymentIdOf = (txn) => txn.paymentId?._id || txn.paymentId;

const typeMeta = (type) => {
  switch (type) {
    case 'Bill':            return { bg: 'var(--warning)', color: 'var(--warning-foreground)', accent: '#d9a441' };
    case 'Salary':          return { bg: 'var(--success)', color: 'var(--success-foreground)', accent: C.success };
    case 'Payment Request': return { bg: '#dbeafe', color: '#1e40af', accent: '#3b6fd6' };
    default:                return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)', accent: C.muted };
  }
};

const PERIODS = [
  { id: 'all', label: 'All time', days: null },
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
  { id: 'year', label: 'This year', days: 'year' },
];

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2,
};
const thStyle = {
  padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
};
const secondaryBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
  padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)',
  background: 'var(--secondary)', color: 'var(--secondary-foreground)',
  fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
};
const outlineBtn = { ...secondaryBtn, border: '1px solid var(--primary)', color: C.primary };

const fmtAmount = (n) =>
  (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const maskAcc = (acc) => {
  if (!acc) return null;
  const str = acc.toString();
  if (str.length <= 4) return str;
  return `${str.slice(0, 2)}****${str.slice(-2)}`;
};

export default function TransactionPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTxn, setSelectedTxn] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [period, setPeriod] = useState('all');
  const [sortKey, setSortKey] = useState('date-desc');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getAllTransactionsByUserId(user._id);
        setTransactions(data || []);
      } catch (err) {
        setError(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchTransactions();
  }, [user?._id]);

  // ── Navigation to the source record (bill / payment request) ──
  const openBill = (txn) => navigate(`/client/bill/${txn.billId}`);
  const openPaymentRequest = (txn) => navigate(`/${user?.role || 'client'}/my-payment-request/${paymentIdOf(txn)}`);

  // ── Per-type counts and amounts (all transactions) ──
  const stats = useMemo(() => {
    const acc = {
      All: { count: 0, amount: 0 }, Bill: { count: 0, amount: 0 },
      'Payment Request': { count: 0, amount: 0 }, Salary: { count: 0, amount: 0 },
    };
    transactions.forEach((t) => {
      const type = getType(t);
      const amt = Number(t.amount) || 0;
      acc.All.count += 1; acc.All.amount += amt;
      acc[type].count += 1; acc[type].amount += amt;
    });
    return acc;
  }, [transactions]);

  // ── Filter + sort ──
  const filteredTransactions = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const p = PERIODS.find(x => x.id === period);
    let since = null;
    if (p?.days === 'year') since = new Date(new Date().getFullYear(), 0, 1);
    else if (p?.days) since = new Date(Date.now() - p.days * 24 * 60 * 60 * 1000);

    return transactions
      .filter((t) => {
        if (filterType !== 'All' && getType(t) !== filterType) return false;
        if (since && new Date(t.transactionDate) < since) return false;
        if (q) {
          const hay = [t._id, t.bankName, t.upiId, t.accNo, t.ifscCode, String(t.amount), getType(t)]
            .filter(Boolean).join(' ').toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortKey) {
          case 'date-asc':    return new Date(a.transactionDate) - new Date(b.transactionDate);
          case 'amount-desc': return (Number(b.amount) || 0) - (Number(a.amount) || 0);
          case 'amount-asc':  return (Number(a.amount) || 0) - (Number(b.amount) || 0);
          default:            return new Date(b.transactionDate) - new Date(a.transactionDate);
        }
      });
  }, [transactions, searchText, filterType, period, sortKey]);

  const filteredTotal = filteredTransactions.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const hasActiveFilters = searchText !== '' || filterType !== 'All' || period !== 'all' || sortKey !== 'date-desc';
  const resetFilters = () => { setSearchText(''); setFilterType('All'); setPeriod('all'); setSortKey('date-desc'); };

  const wrapStyle = {
    padding: '0 2px', fontFamily: 'system-ui, -apple-system, sans-serif',
    color: 'var(--foreground)', background: 'var(--background)', minHeight: '100vh',
  };

  // ── Reusable renderers ──
  const renderTypeBadge = (type) => {
    const meta = typeMeta(type);
    return (
      <span style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: 20,
        fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color, letterSpacing: '0.03em',
      }}>{type}</span>
    );
  };

  const renderAmount = (txn, big) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontWeight: 700, fontSize: big ? 16 : 13.5, color: 'var(--text-strong)' }}>
      <FaRupeeSign size={big ? 12 : 11} color={C.accent} />{fmtAmount(txn.amount)}
    </span>
  );

  const renderBankUpi = (txn) => {
    const acc = maskAcc(txn.accNo);
    if (!txn.bankName && !txn.upiId) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--text-strong)', fontSize: 13 }}>
          {txn.bankName
            ? <FaUniversity size={12} color={C.muted} />
            : <FaWallet size={12} color={C.muted} />}
          <span style={{ wordBreak: 'break-all' }}>{txn.bankName || txn.upiId}</span>
        </div>
        {txn.bankName && (acc || txn.upiId) && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>
            {acc ? `A/C ${acc}` : txn.upiId}
          </div>
        )}
      </div>
    );
  };

  // Source link: bill → View Bill, payment request → View Request, salary → none
  const renderSourceButton = (txn, { full } = {}) => {
    const base = full ? { ...secondaryBtn, flex: 1, padding: '9px' } : secondaryBtn;
    if (txn.billId) {
      return (
        <button onClick={() => openBill(txn)} style={base}>
          View Bill <FaExternalLinkAlt size={9} color={C.accent} />
        </button>
      );
    }
    if (txn.paymentId) {
      return (
        <button onClick={() => openPaymentRequest(txn)} style={base}>
          View Request <FaExternalLinkAlt size={9} color={C.accent} />
        </button>
      );
    }
    return full ? null : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
  };

  return (
    <>
      <ClientHeader />

      <div style={wrapStyle}>

        {/* ── Page card ── */}
        <div style={{
          background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)',
          boxShadow: '0 2px 10px var(--shadow-color)', overflow: 'hidden', marginBottom: 16,
        }}>

          {/* ── Title bar ── */}
          <div style={{
            borderBottom: '1px solid var(--border)', padding: '14px 20px',
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
                All your bill, payment request and salary transactions
              </div>
            </div>
          </div>

          <div style={{ padding: '16px 20px' }}>

            {/* ── Stat cards (amount headline, count chip) ── */}
            {!loading && stats.All.count > 0 && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: 12, marginBottom: 16,
              }}>
                {[
                  { key: 'All', label: 'All transactions', Icon: FaClipboardList, color: C.primary, bg: 'var(--secondary)' },
                  { key: 'Bill', label: 'Bills', Icon: FaFileInvoice, color: C.warning, bg: 'var(--warning)' },
                  { key: 'Payment Request', label: 'Payment requests', Icon: FaHandHoldingUsd, color: '#1e40af', bg: '#dbeafe' },
                  { key: 'Salary', label: 'Salary', Icon: FaUserTie, color: C.success, bg: 'var(--success)' },
                ].map(({ key, label, Icon, color, bg }) => (
                  <div key={key} style={{
                    background: bg, borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <div style={{ ...labelStyle, color, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon size={11} color={color} /> {label}
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color, background: 'rgba(255,255,255,0.55)',
                        padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap',
                      }}>{stats[key].count}</span>
                    </div>
                    <div style={{ fontSize: 19, fontWeight: 700, color, marginTop: 6, display: 'flex', alignItems: 'center', gap: 1, wordBreak: 'break-word' }}>
                      <FaRupeeSign size={13} color={color} />{(stats[key].amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Search / filter / sort bar ── */}
            {!loading && stats.All.count > 0 && (
              <div className="tx-toolbar">
                {/* Search */}
                <div className="tx-search">
                  <FiSearch size={15} color={C.muted} className="tx-icon-left" />
                  <input
                    type="text"
                    placeholder="Search by ID, bank, UPI or amount…"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="tx-ctl"
                    style={{ paddingLeft: 36, paddingRight: searchText ? 34 : 12 }}
                  />
                  {searchText && (
                    <button type="button" aria-label="Clear search" className="tx-clear" onClick={() => setSearchText('')}>
                      <FiX size={14} color={C.muted} />
                    </button>
                  )}
                </div>

                {/* Type */}
                <div className="tx-select">
                  <FiFilter size={14} color={C.muted} className="tx-icon-left" />
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="tx-ctl" aria-label="Filter by type">
                    <option value="All">All types</option>
                    <option value="Bill">Bill</option>
                    <option value="Payment Request">Payment Request</option>
                    <option value="Salary">Salary</option>
                  </select>
                  <FiChevronDown size={14} color={C.muted} className="tx-icon-right" />
                </div>

                {/* Period */}
                <div className="tx-select">
                  <FiCalendar size={14} color={C.muted} className="tx-icon-left" />
                  <select value={period} onChange={(e) => setPeriod(e.target.value)} className="tx-ctl" aria-label="Filter by period">
                    {PERIODS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                  <FiChevronDown size={14} color={C.muted} className="tx-icon-right" />
                </div>

                {/* Sort */}
                <div className="tx-select">
                  {sortKey.endsWith('asc')
                    ? <FiArrowUp size={14} color={C.muted} className="tx-icon-left" />
                    : <FiArrowDown size={14} color={C.muted} className="tx-icon-left" />}
                  <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="tx-ctl" aria-label="Sort transactions">
                    <option value="date-desc">Date: Newest</option>
                    <option value="date-asc">Date: Oldest</option>
                    <option value="amount-desc">Amount: High to low</option>
                    <option value="amount-asc">Amount: Low to high</option>
                  </select>
                  <FiChevronDown size={14} color={C.muted} className="tx-icon-right" />
                </div>

                {hasActiveFilters && (
                  <button type="button" className="tx-reset" onClick={resetFilters}>
                    <FiRotateCcw size={13} /> Reset
                  </button>
                )}

                <div className="tx-count">
                  Showing <strong>{filteredTransactions.length}</strong> of <strong>{transactions.length}</strong> ·
                  total <strong>₹{filteredTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                </div>
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
                  {hasActiveFilters ? 'Try adjusting your search or filters.' : "You don't have any transactions yet."}
                </div>
              </div>
            )}

            {/* ── Desktop table ── */}
            {!loading && filteredTransactions.length > 0 && (
              <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                      {['#', 'Type', 'Amount', 'Date', 'Bank / UPI', 'Source', 'Details'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((txn, i) => (
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
                        <td style={{ padding: '11px 14px' }}>{renderTypeBadge(getType(txn))}</td>
                        <td style={{ padding: '11px 14px' }}>{renderAmount(txn)}</td>
                        <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {fmtDate(txn.transactionDate)}
                        </td>
                        <td style={{ padding: '11px 14px', maxWidth: 230 }}>{renderBankUpi(txn)}</td>
                        <td style={{ padding: '11px 14px' }}>{renderSourceButton(txn)}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <button onClick={() => setSelectedTxn(txn)} style={outlineBtn}>
                            Details <FiArrowRight size={11} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Mobile cards ── */}
            {!loading && filteredTransactions.length > 0 && (
              <div className="d-md-none">
                {filteredTransactions.map((txn, i) => {
                  const type = getType(txn);
                  return (
                    <div key={txn._id} style={{
                      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
                      boxShadow: '0 2px 8px var(--shadow-color)', padding: '14px 16px', marginBottom: 12,
                      borderLeft: `4px solid ${typeMeta(type).accent}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                            fontWeight: 700, fontSize: 11, flexShrink: 0,
                          }}>{i + 1}</span>
                          {renderTypeBadge(type)}
                        </div>
                        {renderAmount(txn, true)}
                      </div>

                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{fmtDate(txn.transactionDate)}</div>

                      {(txn.bankName || txn.upiId) && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={labelStyle}>Bank / UPI</div>
                          {renderBankUpi(txn)}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8 }}>
                        {renderSourceButton(txn, { full: true })}
                        <button onClick={() => setSelectedTxn(txn)} style={{ ...outlineBtn, flex: 1, padding: '9px' }}>
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
      {selectedTxn && (
        <div
          onClick={() => setSelectedTxn(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1060,
            background: 'rgba(0,0,0,0.45)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--card)', borderRadius: 14, width: '100%', maxWidth: 480, overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.25)', fontFamily: 'system-ui, -apple-system, sans-serif',
              maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              padding: '14px 18px', background: 'var(--secondary)', borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: 'var(--warning)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <FaExchangeAlt size={15} color={C.primary} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--secondary-foreground)', lineHeight: 1.2 }}>Transaction Details</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{fmtDate(selectedTxn.transactionDate)}</div>
                </div>
              </div>
              <button aria-label="Close" onClick={() => setSelectedTxn(null)} style={{
                width: 30, height: 30, border: 'none', borderRadius: 8, background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FaTimes size={15} color={C.muted} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 18, overflowY: 'auto' }}>
              {/* Amount hero */}
              <div style={{
                background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 12,
                padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              }}>
                <div>
                  <div style={labelStyle}>Amount</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 24, fontWeight: 800, color: C.primary, lineHeight: 1.15 }}>
                    <FaRupeeSign size={18} />{fmtAmount(selectedTxn.amount)}
                  </div>
                </div>
                {renderTypeBadge(getType(selectedTxn))}
              </div>

              {(() => {
                const rows = [
                  { label: 'Transaction ID', value: selectedTxn._id, mono: true },
                  selectedTxn.bankName && { label: 'Bank', value: selectedTxn.bankName },
                  selectedTxn.accNo && { label: 'Account No.', value: maskAcc(selectedTxn.accNo), mono: true },
                  selectedTxn.ifscCode && { label: 'IFSC', value: selectedTxn.ifscCode },
                  selectedTxn.upiId && { label: 'UPI', value: selectedTxn.upiId, mono: true },
                  selectedTxn.billId && { label: 'Bill ID', value: selectedTxn.billId, mono: true },
                  selectedTxn.paymentId && { label: 'Payment request ID', value: paymentIdOf(selectedTxn), mono: true },
                  selectedTxn.payNote && { label: 'Pay Note', value: selectedTxn.payNote },
                ].filter(Boolean);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {rows.map(({ label, value, mono }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'baseline' }}>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>{label}</span>
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
              display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap',
              padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--secondary)',
            }}>
              {selectedTxn.billId && (
                <button
                  onClick={() => { const t = selectedTxn; setSelectedTxn(null); openBill(t); }}
                  style={{ ...secondaryBtn, padding: '9px 16px', fontSize: 13, background: 'var(--card)' }}
                >
                  <FaExternalLinkAlt size={11} color={C.accent} /> Open Bill
                </button>
              )}
              {selectedTxn.paymentId && (
                <button
                  onClick={() => { const t = selectedTxn; setSelectedTxn(null); openPaymentRequest(t); }}
                  style={{ ...secondaryBtn, padding: '9px 16px', fontSize: 13, background: 'var(--card)' }}
                >
                  <FaExternalLinkAlt size={11} color={C.accent} /> Open Payment Request
                </button>
              )}
              <button
                onClick={() => setSelectedTxn(null)}
                style={{
                  padding: '9px 18px', borderRadius: 8, border: 'none',
                  background: 'var(--primary)', color: 'var(--primary-foreground, #fff)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: var(--input); color: var(--foreground); }
        .tx-toolbar {
          display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
          padding: 10px 0 14px; margin-bottom: 6px; border-bottom: 1px solid var(--border);
        }
        .tx-search { position: relative; flex: 1 1 250px; min-width: 200px; }
        .tx-select { position: relative; flex: 0 1 180px; min-width: 160px; }
        .tx-ctl {
          width: 100%; height: 38px; box-sizing: border-box;
          border: 1px solid var(--border); border-radius: 10px;
          background: var(--input); color: var(--foreground);
          font-size: 13px; outline: none; transition: border-color .15s, box-shadow .15s;
        }
        .tx-select .tx-ctl { appearance: none; -webkit-appearance: none; cursor: pointer; padding: 0 32px 0 34px; }
        .tx-ctl:hover { border-color: var(--muted-foreground, #8b7b74); }
        .tx-ctl:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(107, 62, 43, 0.14); }
        .tx-icon-left, .tx-icon-right { position: absolute; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .tx-icon-left { left: 12px; }
        .tx-icon-right { right: 11px; }
        .tx-clear {
          position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
          width: 24px; height: 24px; border: none; border-radius: 50%; background: transparent;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .tx-clear:hover { background: var(--muted); }
        .tx-reset {
          display: inline-flex; align-items: center; gap: 6px;
          height: 38px; padding: 0 12px; border-radius: 10px;
          border: 1px dashed var(--border); background: transparent;
          color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap;
          transition: background .15s, color .15s;
        }
        .tx-reset:hover { background: var(--secondary); color: var(--secondary-foreground); }
        .tx-count { margin-left: auto; font-size: 12px; color: var(--text-muted); white-space: nowrap; }
        .tx-count strong { color: var(--text-strong); }
        @media (max-width: 640px) {
          .tx-search, .tx-select { flex: 1 1 100%; }
          .tx-count { margin-left: 0; width: 100%; white-space: normal; }
        }
      `}</style>
    </>
  );
}
