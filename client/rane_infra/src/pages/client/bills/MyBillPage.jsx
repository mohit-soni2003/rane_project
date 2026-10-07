import React, { useEffect, useState } from 'react';
import { FaFileExport, FaPlus, FaFileAlt, FaFileInvoiceDollar, FaRupeeSign } from 'react-icons/fa';
import { FiSearch, FiX, FiArrowRight, FiFilter, FiChevronDown, FiArrowUp, FiArrowDown, FiRotateCcw } from 'react-icons/fi';
import ClientHeader from '../../../components/layout/header/ClientHeader';
import { getBillsByUserId } from '../../../services/billServices';
import { useAuthStore } from '../../../store/authStore';
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
        case 'Completed':
            return { bg: 'var(--success)', color: 'var(--success-foreground)', label: status };
        case 'Pending':
            return { bg: 'var(--warning)', color: 'var(--warning-foreground)', label: 'Pending' };
        case 'Sanctioned':
            return { bg: '#dbeafe', color: '#1e40af', label: 'Sanctioned' };
        case 'Partial':
            return { bg: '#fef3c7', color: '#92400e', label: 'Partial' };
        case 'Reject':
        case 'Rejected':
        case 'Overdue':
            return { bg: '#fde8e6', color: C.destructive, label: status === 'Reject' ? 'Rejected' : status };
        case 'Unpaid':
            return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)', label: 'Unpaid' };
        default:
            return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)', label: status || '—' };
    }
};

const StatusBadge = ({ status }) => {
    const { bg, color, label } = statusMeta(status);
    return (
        <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 20,
            fontSize: 11, fontWeight: 700, background: bg, color, letterSpacing: '0.03em',
        }}>
            {label}
        </span>
    );
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.05em',
};

export default function MyBillPage() {
    const [bills, setBills]             = useState([]);
    const [loading, setLoading]         = useState(true);
    const [searchText, setSearchText]   = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder]     = useState('asc');

    const user   = useAuthStore((state) => state.user);
    const userId = user?._id;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const result = await getBillsByUserId(userId);
                setBills(Array.isArray(result) ? result : []);
            } catch (error) {
                console.error('Failed to fetch bills:', error);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchBills();
    }, [userId]);

    const filteredBills = bills
        .filter(bill =>
            (statusFilter === 'all' || bill.status === statusFilter) &&
            (bill.firm?.toLowerCase().includes(searchText.toLowerCase()) ||
             bill.invoiceNo?.toLowerCase().includes(searchText.toLowerCase()))
        )
        .sort((a, b) =>
            sortOrder === 'asc'
                ? a.invoiceNo?.localeCompare(b.invoiceNo)
                : b.invoiceNo?.localeCompare(a.invoiceNo)
        );

    const hasActiveFilters = searchText !== '' || statusFilter !== 'all' || sortOrder !== 'asc';
    const resetFilters = () => { setSearchText(''); setStatusFilter('all'); setSortOrder('asc'); };

    // ── Stat counts & amounts (computed from paymentStatus) ───────────────────
    const amt = (b) => Number(b.amount) || 0;
    const paidBills   = bills.filter(b => ['Paid', 'Completed'].includes(b.paymentStatus));
    const unpaidBills = bills.filter(b => !['Paid', 'Completed'].includes(b.paymentStatus));

    const totalAmount  = bills.reduce((sum, b) => sum + amt(b), 0);
    const paidAmount   = paidBills.reduce((sum, b) => sum + amt(b), 0);
    const unpaidAmount = unpaidBills.reduce((sum, b) => sum + amt(b), 0);

    const paidCount   = paidBills.length;
    const unpaidCount = unpaidBills.length;

    return (
        <>
            <ClientHeader />

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
                                <FaFileInvoiceDollar size={16} color={C.primary} />
                            </div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                                    My Bills
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                    View and track the status of all your submitted bills
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/client/upload-bill')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '8px 14px', borderRadius: 8, border: 'none',
                                background: 'var(--primary)', color: '#fff',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            }}
                        >
                            <FaPlus size={11} color="#fff" /> Upload Bill
                        </button>
                    </div>

                    <div style={{ padding: '16px 20px' }}>

                        {/* ── Stat cards (amount as headline, count as chip) ── */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                            gap: 12, marginBottom: 16,
                        }}>
                            {[
                                { label: 'Total amount', amount: totalAmount, count: bills.length, color: C.primary, bg: 'var(--secondary)' },
                                { label: 'Paid amount', amount: paidAmount, count: paidCount, color: C.success, bg: 'var(--success)' },
                                { label: 'Unpaid amount', amount: unpaidAmount, count: unpaidCount, color: C.destructive, bg: '#fde8e6' },
                            ].map(({ label, amount, count, color, bg }) => (
                                <div key={label} style={{
                                    background: bg, borderRadius: 10,
                                    padding: '12px 14px', border: '1px solid var(--border)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                        <div style={{ ...labelStyle, color }}>{label}</div>
                                        <span style={{
                                            fontSize: 10, fontWeight: 700, color,
                                            background: 'rgba(255,255,255,0.55)',
                                            padding: '2px 8px', borderRadius: 20,
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {count} {count === 1 ? 'bill' : 'bills'}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: 20, fontWeight: 700, color, marginTop: 6,
                                        display: 'flex', alignItems: 'center', gap: 1, wordBreak: 'break-word',
                                    }}>
                                        <FaRupeeSign size={14} color={color} />
                                        {amount.toLocaleString('en-IN')}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Search / filter bar ── */}
                        <div className="mb-toolbar">
                            {/* Search */}
                            <div className="mb-search">
                                <FiSearch size={15} color={C.muted} className="mb-icon-left" />
                                <input
                                    type="text"
                                    placeholder="Search by firm or invoice no…"
                                    value={searchText}
                                    onChange={e => setSearchText(e.target.value)}
                                    className="mb-ctl"
                                    style={{ paddingLeft: 36, paddingRight: searchText ? 34 : 12 }}
                                />
                                {searchText && (
                                    <button type="button" aria-label="Clear search" className="mb-clear" onClick={() => setSearchText('')}>
                                        <FiX size={14} color={C.muted} />
                                    </button>
                                )}
                            </div>

                            {/* Status filter */}
                            <div className="mb-select">
                                <FiFilter size={14} color={C.muted} className="mb-icon-left" />
                                <select
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className="mb-ctl"
                                    aria-label="Filter by status"
                                >
                                    <option value="all">All Status</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Partial">Partial</option>
                                </select>
                                <FiChevronDown size={14} color={C.muted} className="mb-icon-right" />
                            </div>

                            {/* Sort */}
                            <div className="mb-select">
                                {sortOrder === 'asc'
                                    ? <FiArrowUp size={14} color={C.muted} className="mb-icon-left" />
                                    : <FiArrowDown size={14} color={C.muted} className="mb-icon-left" />}
                                <select
                                    value={sortOrder}
                                    onChange={e => setSortOrder(e.target.value)}
                                    className="mb-ctl"
                                    aria-label="Sort by invoice number"
                                >
                                    <option value="asc">Invoice: Ascending</option>
                                    <option value="desc">Invoice: Descending</option>
                                </select>
                                <FiChevronDown size={14} color={C.muted} className="mb-icon-right" />
                            </div>

                            {/* Reset (only when something is applied) */}
                            {hasActiveFilters && (
                                <button type="button" className="mb-reset" onClick={resetFilters}>
                                    <FiRotateCcw size={13} /> Reset
                                </button>
                            )}

                            {/* Result count */}
                            <div className="mb-count">
                                Showing <strong>{filteredBills.length}</strong> of <strong>{bills.length}</strong> bills
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
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>Loading bills…</div>
                            </div>
                        )}

                        {/* ── Empty state ── */}
                        {!loading && filteredBills.length === 0 && (
                            <div style={{
                                textAlign: 'center', padding: '48px 20px',
                                background: 'var(--muted)', borderRadius: 12,
                                border: '1px solid var(--border)',
                            }}>
                                <FaFileInvoiceDollar size={32} color={C.muted} style={{ marginBottom: 12 }} />
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>No bills found</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {searchText || statusFilter !== 'all'
                                        ? 'Try adjusting your search or filters.'
                                        : "You haven't uploaded any bills yet."}
                                </div>
                            </div>
                        )}

                        {/* ── Desktop table ── */}
                        {!loading && filteredBills.length > 0 && (
                            <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', minWidth: 880, borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                                            {['#', 'Firm', 'Work Area', 'LOA No.', 'Invoice No.', 'Amount', 'Status', 'Document', 'Action'].map(h => (
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
                                        {filteredBills.map((bill, idx) => (
                                            <tr key={bill._id || idx} style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={{ padding: '11px 14px' }}>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        width: 26, height: 26, borderRadius: '50%',
                                                        background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                                                        fontWeight: 700, fontSize: 11,
                                                    }}>{idx + 1}</span>
                                                </td>
                                                <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--text-strong)', maxWidth: 150 }}>
                                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={bill.firmName}>
                                                        {bill.firmName || '—'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: 12, maxWidth: 130 }}>
                                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={bill.workArea}>
                                                        {bill.workArea || '—'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: 12 }}>
                                                    {bill.loaNo || '—'}
                                                </td>
                                                <td style={{ padding: '11px 14px', color: 'var(--text-strong)', fontSize: 12, fontWeight: 600 }}>
                                                    {bill.invoiceNo || '—'}
                                                </td>
                                                <td style={{ padding: '11px 14px', fontWeight: 700, color: 'var(--text-strong)' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <FaRupeeSign size={11} color={C.accent} />
                                                        {bill.amount ? Number(bill.amount).toLocaleString('en-IN') : 'N/A'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '11px 14px' }}>
                                                    <StatusBadge status={bill.paymentStatus} />
                                                </td>
                                                <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                                                    {bill.pdfurl ? (
                                                        <a href={bill.pdfurl} target="_blank" rel="noopener noreferrer"
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.accent, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                                                            <FaFileAlt size={15} color={C.accent} /> View
                                                        </a>
                                                    ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                                                </td>
                                                <td style={{ padding: '11px 14px' }}>
                                                    <button
                                                        onClick={() => navigate(`/client/bill/${bill._id}`)}
                                                        style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: 5,
                                                            padding: '6px 12px', borderRadius: 7,
                                                            border: '1px solid var(--border)',
                                                            background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                                                            fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        Details <FiArrowRight size={12} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ── Mobile cards ── */}
                        {!loading && filteredBills.length > 0 && (
                            <div className="d-md-none">
                                {filteredBills.map((bill, idx) => (
                                    <div key={bill._id || idx} style={{
                                        background: 'var(--card)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 12, padding: '14px 16px',
                                        marginBottom: 12,
                                        boxShadow: '0 2px 8px var(--shadow-color)',
                                    }}>
                                        {/* Header row */}
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
                                                        {bill.firmName || '—'}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                                        Invoice: {bill.invoiceNo || '—'}
                                                    </div>
                                                </div>
                                            </div>
                                            <StatusBadge status={bill.paymentStatus} />
                                        </div>

                                        {/* Data grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: 10 }}>
                                            {[
                                                {
                                                    label: 'Amount', value: (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <FaRupeeSign size={10} color={C.accent} />
                                                            {bill.amount ? Number(bill.amount).toLocaleString('en-IN') : 'N/A'}
                                                        </span>
                                                    )
                                                },
                                                { label: 'LOA No.', value: bill.loaNo || '—' },
                                                { label: 'Work area', value: bill.workArea || '—' },
                                                {
                                                    label: 'Document', value: bill.pdfurl ? (
                                                        <a href={bill.pdfurl} target="_blank" rel="noopener noreferrer"
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.accent, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                                                            <FaFileAlt size={13} color={C.accent} /> View
                                                        </a>
                                                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>
                                                },
                                            ].map(({ label, value }) => (
                                                <div key={label}>
                                                    <div style={{ ...labelStyle, marginBottom: 2 }}>{label}</div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', wordBreak: 'break-word' }}>{value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Details button */}
                                        <button
                                            onClick={() => navigate(`/client/bill/${bill._id}`)}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                width: '100%', padding: '9px', borderRadius: 8,
                                                border: '1px solid var(--primary)',
                                                background: 'transparent', color: C.primary,
                                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                                marginTop: 4,
                                            }}
                                        >
                                            View details <FiArrowRight size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── Footer actions ── */}
                        {!loading && (
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10,
                            }}>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    Showing 1 to {filteredBills.length} of {bills.length} entries
                                </span>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => navigate('/client/upload-bill')}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '8px 14px', borderRadius: 8, border: 'none',
                                            background: 'var(--primary)', color: '#fff',
                                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                        }}
                                    >
                                        <FaPlus size={11} color="#fff" /> Upload Bill
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
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                select option { background: var(--input); color: var(--foreground); }
                .mb-toolbar {
                    display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
                    padding: 10px 0 14px; margin-bottom: 6px;
                    border-bottom: 1px solid var(--border);
                }
                .mb-search { position: relative; flex: 1 1 260px; min-width: 200px; }
                .mb-select { position: relative; flex: 0 1 190px; min-width: 160px; }
                .mb-ctl {
                    width: 100%; height: 38px; box-sizing: border-box;
                    border: 1px solid var(--border); border-radius: 10px;
                    background: var(--input); color: var(--foreground);
                    font-size: 13px; outline: none;
                    transition: border-color .15s, box-shadow .15s;
                }
                .mb-select .mb-ctl {
                    appearance: none; -webkit-appearance: none; cursor: pointer;
                    padding: 0 32px 0 34px;
                }
                .mb-ctl:hover { border-color: var(--muted-foreground, #8b7b74); }
                .mb-ctl:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(107, 62, 43, 0.14); }
                .mb-icon-left, .mb-icon-right {
                    position: absolute; top: 50%; transform: translateY(-50%); pointer-events: none;
                }
                .mb-icon-left { left: 12px; }
                .mb-icon-right { right: 11px; }
                .mb-clear {
                    position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
                    width: 24px; height: 24px; border: none; border-radius: 50%;
                    background: transparent; display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                }
                .mb-clear:hover { background: var(--muted); }
                .mb-reset {
                    display: inline-flex; align-items: center; gap: 6px;
                    height: 38px; padding: 0 12px; border-radius: 10px;
                    border: 1px dashed var(--border); background: transparent;
                    color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer;
                    white-space: nowrap; transition: background .15s, color .15s;
                }
                .mb-reset:hover { background: var(--secondary); color: var(--secondary-foreground); }
                .mb-count { margin-left: auto; font-size: 12px; color: var(--text-muted); white-space: nowrap; }
                .mb-count strong { color: var(--text-strong); }
                @media (max-width: 640px) {
                    .mb-search, .mb-select { flex: 1 1 100%; }
                    .mb-count { margin-left: 0; width: 100%; }
                }
            `}</style>
        </>
    );
}