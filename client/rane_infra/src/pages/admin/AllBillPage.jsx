import React, { useEffect, useState } from 'react';
import {
    FaFileExport, FaFileAlt, FaFileInvoiceDollar, FaRupeeSign,
    FaUser, FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
} from 'react-icons/fa';
import { FiSearch, FiX, FiArrowRight } from 'react-icons/fi';
import AdminHeader from '../../component/header/AdminHeader';
import StaffHeader from '../../component/header/StaffHeader';
import { getAllBills } from '../../services/billServices';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import PayBillModal from '../../component/models/PayBillModel';

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

const controlStyle = {
    border: '1px solid var(--border)', borderRadius: 8,
    padding: '8px 12px', fontSize: 13, color: 'var(--foreground)',
    background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
};

export default function AllBillPage() {
    const [bills, setBills]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [searchText, setSearchText]     = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder]       = useState('desc'); // newest first

    const [showPayModal, setShowPayModal]     = useState(false);
    const [selectedBillId, setSelectedBillId] = useState(null);

    const { user } = useAuthStore();
    const navigate = useNavigate();

    const getHeaderComponent = () => {
        switch (user?.role) {
            case 'admin': return <AdminHeader />;
            case 'staff': return <StaffHeader />;
            default: return <AdminHeader />;
        }
    };

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const data = await getAllBills();
                setBills(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to load bills:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, []);

    const filteredBills = bills
        .filter(bill => {
            const term = searchText.toLowerCase();
            const matchesSearch =
                bill.user?.cid?.toLowerCase().includes(term) ||
                bill.user?.name?.toLowerCase().includes(term) ||
                bill.firmName?.toLowerCase().includes(term) ||
                bill.workArea?.toLowerCase().includes(term) ||
                bill.user?.phone?.toLowerCase().includes(term) ||
                bill.paymentStatus?.toLowerCase().includes(term) ||
                new Date(bill.submittedAt).toLocaleDateString().toLowerCase().includes(term);
            const matchesStatus = statusFilter === 'all' || bill.paymentStatus === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            const dateA = new Date(a.submittedAt);
            const dateB = new Date(b.submittedAt);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

    // ── Stat amounts & counts (computed from paymentStatus) ───────────────────
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
                                <FaFileInvoiceDollar size={16} color={C.primary} />
                            </div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                                    All Bills
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                    Review and process bills submitted by all clients
                                </div>
                            </div>
                        </div>
                        <span style={{
                            fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                            background: 'var(--muted)', padding: '4px 12px', borderRadius: 20,
                        }}>
                            {bills.length} total
                        </span>
                    </div>

                    <div style={{ padding: '16px 20px' }}>

                        {/* ── Stat cards (amount headline, count chip) ── */}
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
                        <div style={{
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: 12, padding: '14px 16px',
                            marginBottom: 14,
                            boxShadow: '0 2px 8px var(--shadow-color)',
                        }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>

                                {/* Search */}
                                <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
                                    <FiSearch size={13} color={C.muted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="text"
                                        placeholder="Search CID, name, firm, work area, status…"
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
                                    style={{ ...controlStyle, flex: '0 1 150px', cursor: 'pointer' }}
                                >
                                    <option value="all">All Status</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Partial">Partial</option>
                                    <option value="Sanctioned">Sanctioned</option>
                                </select>

                                {/* Sort */}
                                <select
                                    value={sortOrder}
                                    onChange={e => setSortOrder(e.target.value)}
                                    style={{ ...controlStyle, flex: '0 1 150px', cursor: 'pointer' }}
                                >
                                    <option value="desc">▼ Newest first</option>
                                    <option value="asc">▲ Oldest first</option>
                                </select>

                                {/* Reset */}
                                <button
                                    onClick={() => { setSearchText(''); setStatusFilter('all'); setSortOrder('desc'); }}
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
                                Showing <strong style={{ color: 'var(--text-strong)' }}>{filteredBills.length}</strong> of{' '}
                                <strong style={{ color: 'var(--text-strong)' }}>{bills.length}</strong> bills
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
                                        : 'No bills have been submitted yet.'}
                                </div>
                            </div>
                        )}

                        {/* ── Desktop table ── */}
                        {!loading && filteredBills.length > 0 && (
                            <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                                            {['#', 'CID', 'Uploaded By', 'Firm', 'Work Area', 'Amount', 'Status', 'Date', 'Document', 'Actions'].map(h => (
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
                                        {filteredBills.map((bill, idx) => {
                                            const isPayDisabled = bill.paymentStatus === 'Rejected';
                                            return (
                                                <tr key={bill._id || idx} style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
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

                                                    {/* CID */}
                                                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--text-strong)' }}>
                                                        {bill.user?.cid || 'N/A'}
                                                    </td>

                                                    {/* Uploaded By */}
                                                    <td style={{ padding: '11px 14px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            {bill.user?.profile ? (
                                                                <img src={bill.user.profile} alt={bill.user.name}
                                                                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
                                                            ) : (
                                                                <span style={{
                                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                    width: 28, height: 28, borderRadius: '50%',
                                                                    background: 'var(--muted)', color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0,
                                                                }}>
                                                                    <FaUser size={12} color={C.muted} />
                                                                </span>
                                                            )}
                                                            <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                                title={bill.user?.name}>
                                                                {bill.user?.name || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Firm */}
                                                    <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--text-strong)', maxWidth: 140 }}>
                                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={bill.firmName}>
                                                            {bill.firmName || '—'}
                                                        </div>
                                                    </td>

                                                    {/* Work Area */}
                                                    <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: 12, maxWidth: 150 }}>
                                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={bill.workArea}>
                                                            {bill.workArea || '—'}
                                                        </div>
                                                    </td>

                                                    {/* Amount */}
                                                    <td style={{ padding: '11px 14px', fontWeight: 700, color: 'var(--text-strong)' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <FaRupeeSign size={11} color={C.accent} />
                                                            {bill.amount ? Number(bill.amount).toLocaleString('en-IN') : 'N/A'}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td style={{ padding: '11px 14px' }}>
                                                        <StatusBadge status={bill.paymentStatus} />
                                                    </td>

                                                    {/* Date */}
                                                    <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                                                        {bill.submittedAt ? new Date(bill.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                    </td>

                                                    {/* Document */}
                                                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                                                        {bill.pdfurl ? (
                                                            <a href={bill.pdfurl} target="_blank" rel="noopener noreferrer"
                                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.accent, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                                                                <FaFileAlt size={15} color={C.accent} /> View
                                                            </a>
                                                        ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                                                    </td>

                                                    {/* Actions */}
                                                    <td style={{ padding: '11px 14px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <button
                                                                disabled={isPayDisabled}
                                                                onClick={() => { setSelectedBillId(bill._id); setShowPayModal(true); }}
                                                                style={{
                                                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                                                    padding: '6px 12px', borderRadius: 7, border: 'none',
                                                                    background: isPayDisabled ? 'var(--muted)' : 'var(--primary)',
                                                                    color: isPayDisabled ? 'var(--muted-foreground)' : '#fff',
                                                                    fontSize: 12, fontWeight: 600,
                                                                    cursor: isPayDisabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                <FaRupeeSign size={11} color={isPayDisabled ? C.muted : '#fff'} /> Pay
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/${user?.role}/bill/${bill._id}`)}
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
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ── Mobile cards ── */}
                        {!loading && filteredBills.length > 0 && (
                            <div className="d-md-none">
                                {filteredBills.map((bill, idx) => {
                                    const isPayDisabled = bill.paymentStatus === 'Rejected';
                                    return (
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
                                                    {bill.user?.profile ? (
                                                        <img src={bill.user.profile} alt={bill.user.name}
                                                            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
                                                    ) : (
                                                        <span style={{
                                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                            width: 32, height: 32, borderRadius: '50%',
                                                            background: 'var(--muted)', color: 'var(--text-muted)', flexShrink: 0,
                                                        }}>
                                                            <FaUser size={13} color={C.muted} />
                                                        </span>
                                                    )}
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                                                            {bill.user?.name || 'N/A'}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                                            CID: {bill.user?.cid || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <StatusBadge status={bill.paymentStatus} />
                                            </div>

                                            {/* Data grid */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: 10 }}>
                                                {[
                                                    { label: 'Firm', value: bill.firmName || '—' },
                                                    {
                                                        label: 'Amount', value: (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <FaRupeeSign size={10} color={C.accent} />
                                                                {bill.amount ? Number(bill.amount).toLocaleString('en-IN') : 'N/A'}
                                                            </span>
                                                        )
                                                    },
                                                    { label: 'Work area', value: bill.workArea || '—' },
                                                    { label: 'Date', value: bill.submittedAt ? new Date(bill.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
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

                                            {/* Action buttons */}
                                            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                                <button
                                                    disabled={isPayDisabled}
                                                    onClick={() => { setSelectedBillId(bill._id); setShowPayModal(true); }}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                        flex: 1, padding: '9px', borderRadius: 8, border: 'none',
                                                        background: isPayDisabled ? 'var(--muted)' : 'var(--primary)',
                                                        color: isPayDisabled ? 'var(--muted-foreground)' : '#fff',
                                                        fontSize: 13, fontWeight: 600,
                                                        cursor: isPayDisabled ? 'not-allowed' : 'pointer',
                                                    }}
                                                >
                                                    <FaRupeeSign size={12} color={isPayDisabled ? C.muted : '#fff'} /> Pay
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/${user?.role}/bill/${bill._id}`)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                        flex: 1, padding: '9px', borderRadius: 8,
                                                        border: '1px solid var(--primary)',
                                                        background: 'transparent', color: C.primary,
                                                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                                    }}
                                                >
                                                    Details <FiArrowRight size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
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

            <PayBillModal show={showPayModal} onHide={() => setShowPayModal(false)} billId={selectedBillId} />

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                select option { background: var(--input); color: var(--foreground); }
            `}</style>
        </>
    );
}