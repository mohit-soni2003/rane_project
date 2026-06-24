import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getBillById, getBillRemarks, getBillTransactions, requestBillWithdraw,
} from '../../services/billServices';
import { getPayNotesByBill } from '../../services/paynoteServices';
import ClientHeader from '../../component/header/ClientHeader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaFileInvoice, FaFileSignature, FaUserTie, FaFilePdf,
    FaCalendarAlt, FaArrowLeft, FaCreditCard, FaMoneyBillWave,
    FaWallet, FaRupeeSign, FaCalculator, FaUserCircle,
    FaCommentDots, FaUndoAlt, FaTimes, FaExternalLinkAlt,
} from 'react-icons/fa';

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = {
    primary: '#6b3e2b',
    accent: '#b95a52',
    success: '#225b31',
    destructive: '#c94a3a',
    muted: '#8b7b74',
    warning: '#4a1f18',
    info: '#1e40af',
};

// ── Status badge meta ─────────────────────────────────────────────────────────
const billStatusMeta = (status) => {
    switch (status) {
        case 'Paid':      return { bg: 'var(--success)', color: 'var(--success-foreground)', label: 'Paid' };
        case 'Pending':   return { bg: 'var(--warning)', color: 'var(--warning-foreground)', label: 'Pending' };
        case 'Reject':    return { bg: '#fde8e6', color: C.destructive, label: 'Rejected' };
        default:          return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)', label: status || '—' };
    }
};
const agreementStatusMeta = (status) => {
    switch (status) {
        case 'signed':   return { bg: 'var(--success)', color: 'var(--success-foreground)', label: 'Signed' };
        case 'pending':  return { bg: 'var(--warning)', color: 'var(--warning-foreground)', label: 'Pending' };
        case 'viewed':   return { bg: '#dbeafe', color: C.info, label: 'Viewed' };
        case 'rejected': return { bg: '#fde8e6', color: C.destructive, label: 'Rejected' };
        case 'expired':  return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)', label: 'Expired' };
        default:         return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)', label: status || 'N/A' };
    }
};
const paynoteStatusMeta = (status) => {
    switch (status) {
        case 'Paid':     return { bg: 'var(--success)', color: 'var(--success-foreground)', label: 'Paid' };
        case 'Approved': return { bg: '#dbeafe', color: C.info, label: 'Approved' };
        case 'Pending':  return { bg: 'var(--warning)', color: 'var(--warning-foreground)', label: 'Pending' };
        case 'Rejected': return { bg: '#fde8e6', color: C.destructive, label: 'Rejected' };
        default:         return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)', label: status || 'Draft' };
    }
};
const withdrawStatusMeta = (status) => {
    switch (status) {
        case 'Requested': return { bg: 'var(--warning)', color: 'var(--warning-foreground)', accent: '#d9a441', label: 'Requested' };
        case 'Approved':  return { bg: 'var(--success)', color: 'var(--success-foreground)', accent: C.success, label: 'Approved' };
        default:          return { bg: '#fde8e6', color: C.destructive, accent: C.destructive, label: status || 'Rejected' };
    }
};

const Badge = ({ meta }) => (
    <span style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: 20,
        fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color, letterSpacing: '0.03em',
    }}>
        {meta.label}
    </span>
);

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3,
};
const valueStyle = { fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)', wordBreak: 'break-word' };

const cardStyle = {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
    marginBottom: 16, boxShadow: '0 2px 8px var(--shadow-color)', overflow: 'hidden',
};
const cardHeaderStyle = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 16px', borderBottom: '1px solid var(--border)',
};
const cardHeaderTitleStyle = { fontWeight: 700, fontSize: 13.5, color: 'var(--text-strong)' };
const cardBodyStyle = { padding: '16px' };

const pdfBtnStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '8px 16px', borderRadius: 8, border: 'none',
    background: 'var(--primary)', color: '#fff',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
};

// Field block
const Field = ({ label, children }) => (
    <div>
        <div style={labelStyle}>{label}</div>
        <div style={valueStyle}>{children}</div>
    </div>
);

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ src, name, size = 28 }) => {
    const [err, setErr] = useState(false);
    const initials = typeof name === 'string' && name.trim()
        ? name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : null;
    if (src && !err && !src.includes('placeholder')) {
        return <img src={src} onError={() => setErr(true)} alt={name || 'user'}
            style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
    }
    return (
        <span style={{
            width: size, height: size, borderRadius: '50%',
            background: 'var(--secondary)', color: 'var(--secondary-foreground)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.4, fontWeight: 700, flexShrink: 0,
        }}>
            {initials || <FaUserCircle size={size} color={C.muted} />}
        </span>
    );
};

export default function SingleBillDetailsClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [paynotes, setPaynotes] = useState([]);
    const [remarks, setRemarks] = useState([]);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawError, setWithdrawError] = useState('');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawReason, setWithdrawReason] = useState('');

    useEffect(() => {
        const fetchBillAndTransactions = async () => {
            try {
                const billResult = await getBillById(id);
                setBill(billResult);
                try {
                    const transactionResult = await getBillTransactions(id);
                    setTransactions(transactionResult || []);
                } catch (transactionError) {
                    console.warn('Could not fetch transactions:', transactionError.message);
                    setTransactions([]);
                }
                try {
                    const paynoteResult = await getPayNotesByBill(id);
                    setPaynotes(paynoteResult?.paynotes || []);
                } catch (paynoteError) {
                    console.warn('Could not fetch paynotes:', paynoteError.message);
                    setPaynotes([]);
                }
                try {
                    const remarksResult = await getBillRemarks(id);
                    setRemarks(remarksResult || []);
                } catch (remarkError) {
                    console.warn('Could not fetch remarks:', remarkError.message);
                    setRemarks([]);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch bill.');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchBillAndTransactions();
    }, [id]);

    const handleWithdrawRequest = async () => setShowWithdrawModal(true);

    const handleSubmitWithdraw = async () => {
        try {
            setWithdrawError('');
            setWithdrawLoading(true);
            const updatedBill = await requestBillWithdraw(id, withdrawReason);
            setBill(updatedBill);
            setShowWithdrawModal(false);
            setWithdrawReason('');
            toast.success('Withdrawal request submitted successfully! Admin will review it shortly.');
        } catch (err) {
            console.error(err);
            setWithdrawError(err.message || 'Failed to request withdrawal');
        } finally {
            setWithdrawLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowWithdrawModal(false);
        setWithdrawReason('');
        setWithdrawError('');
    };

    const agreement = bill?.agreement && typeof bill.agreement === 'object' ? bill.agreement : null;
    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b?.transactionDate || 0) - new Date(a?.transactionDate || 0)
    );
    const latestTransaction = sortedTransactions.length > 0 ? sortedTransactions[0] : null;
    const totalPaidAmount = sortedTransactions.reduce((sum, txn) => sum + (Number(txn?.amount) || 0), 0);
    const remainingAmount = Math.max((Number(bill?.amount) || 0) - totalPaidAmount, 0);

    const getTransactionTypeLabel = (type) => {
        switch (type) {
            case 'bill': return 'Bill';
            case 'payment_request': return 'Payment Request';
            case 'salary': return 'Salary';
            default: return '—';
        }
    };

    const wrapStyle = {
        padding: '0 2px', fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--foreground)', background: 'var(--background)', minHeight: '100vh',
    };

    // ── Loading / error / empty states ────────────────────────────────────────
    if (loading) {
        return (
            <>
                <ClientHeader />
                <div style={wrapStyle}>
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <span style={{
                            display: 'inline-block', width: 36, height: 36,
                            border: '3px solid var(--border)', borderTopColor: C.accent,
                            borderRadius: '50%', animation: 'spin 1s linear infinite',
                        }} />
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>Loading bill details…</div>
                    </div>
                    <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                </div>
            </>
        );
    }
    if (error) {
        return (
            <>
                <ClientHeader />
                <div style={wrapStyle}>
                    <div style={{ ...cardStyle, padding: '16px', color: C.destructive, background: '#fde8e6', border: '1px solid #f5b8b2' }}>
                        {error}
                    </div>
                </div>
            </>
        );
    }
    if (!bill) {
        return (
            <>
                <ClientHeader />
                <div style={wrapStyle}>
                    <div style={{ ...cardStyle, padding: '16px', color: C.warning, background: 'var(--warning)' }}>
                        No bill data found.
                    </div>
                </div>
            </>
        );
    }

    const billMeta = billStatusMeta(bill.paymentStatus);

    return (
        <>
            <ClientHeader />
            <ToastContainer position="top-right" />

            <div style={wrapStyle}>

                {/* ── Header / back ── */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 4px 16px', flexWrap: 'wrap',
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 14px', borderRadius: 8,
                            border: '1px solid var(--border)', background: 'var(--card)',
                            color: C.primary, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        <FaArrowLeft size={12} color={C.primary} /> Back
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <FaFileInvoice size={16} color={C.primary} />
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                                Bill Details
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                Invoice {bill.invoiceNo || '—'} · {bill.firmName || '—'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Bill info + Transaction summary ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 0 }}>

                    {/* Bill Details (wide) */}
                    <div style={{ ...cardStyle, gridColumn: 'span 2', minWidth: 0 }}>
                        <div style={cardHeaderStyle}>
                            <FaFileInvoice size={15} color={C.accent} />
                            <span style={cardHeaderTitleStyle}>Bill Information</span>
                        </div>
                        <div style={cardBodyStyle}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                                <Field label="Invoice No.">{bill.invoiceNo || '—'}</Field>
                                <Field label="Firm Name">{bill.firmName || '—'}</Field>
                                <Field label="Work Area">{bill.workArea || '—'}</Field>
                                <Field label="LOA No.">{bill.loaNo || '—'}</Field>
                                <Field label="Amount">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: C.primary }}>
                                        <FaRupeeSign size={12} color={C.accent} />
                                        {(Number(bill.amount) || 0).toLocaleString('en-IN')}
                                    </span>
                                </Field>
                                <Field label="Status"><Badge meta={billMeta} /></Field>
                                <Field label="Submitted On">
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                        <FaCalendarAlt size={11} color={C.muted} />
                                        {bill.submittedAt ? new Date(bill.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                    </span>
                                </Field>
                            </div>

                            <div style={{ marginTop: 14 }}>
                                <div style={labelStyle}>Work Description</div>
                                <div style={{
                                    fontSize: 13, color: 'var(--foreground)', lineHeight: 1.55,
                                    background: 'var(--muted)', borderRadius: 8, padding: '10px 12px',
                                    border: '1px solid var(--border)',
                                }}>
                                    {bill.workDescription || 'No description provided.'}
                                </div>
                            </div>

                            {bill.pdfurl && (
                                <div style={{ textAlign: 'right', marginTop: 14 }}>
                                    <a href={bill.pdfurl} target="_blank" rel="noopener noreferrer" style={pdfBtnStyle}>
                                        <FaFilePdf size={13} color="#fff" /> View Bill PDF
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transaction summary (narrow) */}
                    <div style={{ ...cardStyle, minWidth: 0 }}>
                        <div style={cardHeaderStyle}>
                            <FaCreditCard size={15} color={C.accent} />
                            <span style={cardHeaderTitleStyle}>Payment Summary</span>
                        </div>
                        <div style={cardBodyStyle}>
                            {(() => {
                                const paidByName = latestTransaction?.paidBy?.name
                                    || latestTransaction?.userId?.name
                                    || latestTransaction?.paidBy
                                    || latestTransaction?.userId || '—';
                                const paidByProfile = latestTransaction?.paidBy?.profile
                                    || latestTransaction?.userId?.profile || '';
                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        <div>
                                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <FaFileInvoice size={11} color={C.accent} /> Bill amount
                                            </div>
                                            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-strong)' }}>
                                                ₹{(Number(bill?.amount) || 0).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <div style={{ height: 1, background: 'var(--border)' }} />
                                        <div>
                                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <FaRupeeSign size={11} color={C.success} /> Amount paid
                                            </div>
                                            <div style={{ fontSize: 20, fontWeight: 700, color: C.success }}>
                                                ₹{totalPaidAmount.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <FaCalculator size={11} color={C.accent} /> Total remaining
                                            </div>
                                            <div style={{ fontSize: 18, fontWeight: 700, color: C.destructive }}>
                                                ₹{remainingAmount.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <div style={{ height: 1, background: 'var(--border)' }} />
                                        <div>
                                            <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <FaUserTie size={11} color={C.muted} /> Paid by
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                                <Avatar src={paidByProfile} name={typeof paidByName === 'string' ? paidByName : 'User'} />
                                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{paidByName}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* ── Attached Agreement ── */}
                <div style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <FaFileSignature size={15} color={C.accent} />
                        <span style={cardHeaderTitleStyle}>Attached Agreement</span>
                    </div>
                    <div style={cardBodyStyle}>
                        {agreement ? (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                                    <Field label="Agreement Title">{agreement.title || '—'}</Field>
                                    <Field label="Agreement ID">{agreement.agreementId || agreement._id || '—'}</Field>
                                    <Field label="Status"><Badge meta={agreementStatusMeta(agreement.status)} /></Field>
                                    <Field label="Signed On">{agreement.signedAt ? new Date(agreement.signedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</Field>
                                    <Field label="Expiry Date">{agreement.expiryDate ? new Date(agreement.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</Field>
                                </div>
                                {agreement.description && (
                                    <div style={{ marginTop: 14 }}>
                                        <div style={labelStyle}>Description</div>
                                        <div style={{
                                            fontSize: 13, color: 'var(--foreground)', lineHeight: 1.55,
                                            background: 'var(--muted)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)',
                                        }}>
                                            {agreement.description}
                                        </div>
                                    </div>
                                )}
                                {(agreement.fileUrl || agreement._id) && (
                                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 14 }}>
                                        {agreement._id && (
                                            <button onClick={() => navigate(`/client/agreement/view/${agreement._id}`)} style={pdfBtnStyle}>
                                                <FaFileSignature size={13} color="#fff" /> Open Agreement Page
                                            </button>
                                        )}
                                        {agreement.fileUrl && (
                                            <a href={agreement.fileUrl} target="_blank" rel="noopener noreferrer"
                                                style={{ ...pdfBtnStyle, background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
                                                <FaFilePdf size={13} color={C.accent} /> View Agreement PDF
                                            </a>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                                No agreement is attached to this bill.
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Paynote Details ── */}
                <div style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <FaFileInvoice size={15} color={C.accent} />
                        <span style={cardHeaderTitleStyle}>Paynote Details</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--muted)', padding: '2px 9px', borderRadius: 20 }}>
                            {paynotes.length}
                        </span>
                    </div>
                    {paynotes.length > 0 ? (
                        <>
                            {/* Desktop table */}
                            <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                                            {['#', 'Pay Note No', 'Department', 'Amount', 'Mode', 'Status', 'Created On', 'PDF'].map(h => (
                                                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paynotes.map((p, i) => (
                                            <tr key={p._id || i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '11px 14px', fontWeight: 700 }}>{i + 1}</td>
                                                <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--text-strong)' }}>{p.payNoteNo || '—'}</td>
                                                <td style={{ padding: '11px 14px', color: 'var(--text-muted)' }}>{p.department || '—'}</td>
                                                <td style={{ padding: '11px 14px', fontWeight: 700, color: 'var(--text-strong)' }}>₹{p.totalSanctionAmount ? Number(p.totalSanctionAmount).toLocaleString('en-IN') : '0'}</td>
                                                <td style={{ padding: '11px 14px', color: 'var(--text-muted)' }}>{p.modeOfPayment || '—'}</td>
                                                <td style={{ padding: '11px 14px' }}><Badge meta={paynoteStatusMeta(p.status)} /></td>
                                                <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                                                <td style={{ padding: '11px 14px' }}>
                                                    {p.pdfUrl ? (
                                                        <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.accent, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                                                            <FaFilePdf size={13} color={C.accent} /> View
                                                        </a>
                                                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Mobile cards */}
                            <div className="d-md-none" style={{ padding: '12px 14px' }}>
                                {paynotes.map((p, i) => (
                                    <div key={p._id || i} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 10, background: 'var(--card)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-strong)' }}>{p.payNoteNo || `Paynote #${i + 1}`}</div>
                                            <Badge meta={paynoteStatusMeta(p.status)} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                                            <Field label="Department">{p.department || '—'}</Field>
                                            <Field label="Amount">₹{p.totalSanctionAmount ? Number(p.totalSanctionAmount).toLocaleString('en-IN') : '0'}</Field>
                                            <Field label="Mode">{p.modeOfPayment || '—'}</Field>
                                            <Field label="Created On">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</Field>
                                        </div>
                                        {p.pdfUrl && (
                                            <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.accent, fontSize: 12, fontWeight: 600, textDecoration: 'none', marginTop: 10 }}>
                                                <FaFilePdf size={13} color={C.accent} /> View PDF
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                            No paynotes found for this bill.
                        </div>
                    )}
                </div>

                {/* ── Remarks ── */}
                <div style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <FaCommentDots size={15} color={C.accent} />
                        <span style={cardHeaderTitleStyle}>Remarks</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--muted)', padding: '2px 9px', borderRadius: 20 }}>
                            {remarks.length}
                        </span>
                    </div>
                    <div style={cardBodyStyle}>
                        {remarks.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {remarks.map((remark, i) => (
                                    <div key={remark._id || i} style={{ background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)', marginBottom: 8, lineHeight: 1.5 }}>{remark.text || '—'}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                <Avatar src={remark.createdBy?.profile} name={remark.createdBy?.name} size={26} />
                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{remark.createdBy?.name || 'Unknown'}</span>
                                            </div>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                {remark.createdAt ? new Date(remark.createdAt).toLocaleString('en-IN') : '—'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                                No remarks available for this bill.
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Withdraw status ── */}
                {bill.withdrawStatus && (() => {
                    const meta = withdrawStatusMeta(bill.withdrawStatus);
                    return (
                        <div style={{ ...cardStyle, borderLeft: `4px solid ${meta.accent}` }}>
                            <div style={cardHeaderStyle}>
                                <FaUndoAlt size={14} color={C.accent} />
                                <span style={cardHeaderTitleStyle}>Withdrawal Request Status</span>
                            </div>
                            <div style={cardBodyStyle}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                                    <Field label="Status"><Badge meta={meta} /></Field>
                                    <Field label="Requested On">{bill.withdrawRequestedAt ? new Date(bill.withdrawRequestedAt).toLocaleString('en-IN') : '—'}</Field>
                                    {bill.withdrawApprovedAt && (
                                        <Field label="Decision Made On">{new Date(bill.withdrawApprovedAt).toLocaleString('en-IN')}</Field>
                                    )}
                                </div>
                                <div style={{ marginTop: 14 }}>
                                    <div style={labelStyle}>Reason</div>
                                    <div style={{ fontSize: 13, color: 'var(--foreground)', background: 'var(--muted)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)' }}>
                                        {bill.withdrawReason || '—'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* ── Withdraw request CTA ── */}
                {(bill.withdrawStatus === 'None' || bill.withdrawStatus === 'Rejected' || !bill.withdrawStatus) && bill.paymentStatus !== 'Paid' && (
                    <div style={{
                        ...cardStyle, borderTop: '2px dashed var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 14, flexWrap: 'wrap', padding: '16px',
                    }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 3 }}>Request Withdrawal</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {bill.withdrawStatus === 'Rejected'
                                    ? 'Your previous withdrawal request was rejected. You can submit a new one.'
                                    : 'Submit a request to withdraw this bill from the system.'}
                            </div>
                            {withdrawError && (
                                <div style={{ marginTop: 8, fontSize: 12, color: C.destructive, background: '#fde8e6', borderRadius: 6, padding: '6px 10px' }}>
                                    {withdrawError}
                                </div>
                            )}
                        </div>
                        <button onClick={handleWithdrawRequest} disabled={withdrawLoading} style={{ ...pdfBtnStyle, minWidth: 130, justifyContent: 'center', opacity: withdrawLoading ? 0.7 : 1, cursor: withdrawLoading ? 'not-allowed' : 'pointer' }}>
                            {withdrawLoading
                                ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} /> Loading…</>
                                : <><FaUndoAlt size={12} color="#fff" /> Request Withdrawal</>}
                        </button>
                    </div>
                )}

                {/* ── Transaction Summary ── */}
                <div style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <FaCreditCard size={15} color={C.accent} />
                        <span style={cardHeaderTitleStyle}>Transaction Summary</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--muted)', padding: '2px 9px', borderRadius: 20 }}>
                            {sortedTransactions.length}
                        </span>
                    </div>
                    {sortedTransactions.length > 0 ? (
                        <>
                            {/* Desktop table */}
                            <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', minWidth: 940, borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                                            {['#', 'Amount', 'Type', 'Paid By', 'For User', 'UPI', 'Bank', 'Transaction ID', 'Date'].map(h => (
                                                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedTransactions.map((t, i) => (
                                            <tr key={t._id || i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '11px 14px', fontWeight: 700 }}>{i + 1}</td>
                                                <td style={{ padding: '11px 14px' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 700, color: C.success }}>
                                                        <FaRupeeSign size={11} color={C.success} />{t.amount?.toLocaleString('en-IN') || '0'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '11px 14px', color: 'var(--text-muted)' }}>{getTransactionTypeLabel(t.type)}</td>
                                                <td style={{ padding: '11px 14px', color: 'var(--text-strong)' }}>{t.paidBy?.name || t.paidBy || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                                <td style={{ padding: '11px 14px', color: 'var(--text-strong)' }}>{t.userId?.name || t.userId || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                                <td style={{ padding: '11px 14px' }}>
                                                    {t.upiId ? (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'monospace' }}>
                                                            <FaWallet size={11} color={C.info} />{t.upiId}
                                                        </span>
                                                    ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>-</span>}
                                                </td>
                                                <td style={{ padding: '11px 14px' }}>
                                                    {t.bankName ? (
                                                        <div style={{ fontSize: 12 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: 'var(--text-strong)' }}>
                                                                <FaMoneyBillWave size={11} color={C.success} />{t.bankName}
                                                            </div>
                                                            {t.accNo && <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>A/C: ****{t.accNo.slice(-4)}</div>}
                                                            {t.ifscCode && <div style={{ color: 'var(--text-muted)' }}>IFSC: {t.ifscCode}</div>}
                                                        </div>
                                                    ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>-</span>}
                                                </td>
                                                <td style={{ padding: '11px 14px' }}>
                                                    <span style={{ display: 'inline-block', fontSize: 11, fontFamily: 'monospace', background: 'var(--muted)', borderRadius: 6, padding: '4px 8px', color: 'var(--text-muted)' }}>
                                                        {t._id || '—'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                    {t.transactionDate ? new Date(t.transactionDate).toLocaleString('en-IN') : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Mobile cards */}
                            <div className="d-md-none" style={{ padding: '12px 14px' }}>
                                {sortedTransactions.map((t, i) => (
                                    <div key={t._id || i} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 10, background: 'var(--card)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 700, fontSize: 15, color: C.success }}>
                                                <FaRupeeSign size={12} color={C.success} />{t.amount?.toLocaleString('en-IN') || '0'}
                                            </span>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--secondary-foreground)', background: 'var(--secondary)', padding: '2px 9px', borderRadius: 20 }}>
                                                {getTransactionTypeLabel(t.type)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                                            <Field label="Paid By">{t.paidBy?.name || t.paidBy || '—'}</Field>
                                            <Field label="For User">{t.userId?.name || t.userId || '—'}</Field>
                                            {t.upiId && <Field label="UPI"><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.upiId}</span></Field>}
                                            {t.bankName && <Field label="Bank">{t.bankName}</Field>}
                                            {t.accNo && <Field label="A/C No.">****{t.accNo.slice(-4)}</Field>}
                                            {t.ifscCode && <Field label="IFSC">{t.ifscCode}</Field>}
                                        </div>
                                        <div style={{ marginTop: 10 }}>
                                            <div style={labelStyle}>Transaction ID</div>
                                            <div style={{ fontSize: 11, fontFamily: 'monospace', background: 'var(--muted)', borderRadius: 6, padding: '4px 8px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{t._id || '—'}</div>
                                        </div>
                                        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                                            {t.transactionDate ? new Date(t.transactionDate).toLocaleString('en-IN') : '—'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '36px 20px' }}>
                            <FaCreditCard size={40} color={C.muted} style={{ marginBottom: 12 }} />
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>No transactions yet</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Transaction summary will appear here once payments are made.</div>
                        </div>
                    )}
                </div>

            </div>

            {/* ── Withdraw modal ── */}
            {showWithdrawModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1060,
                    background: 'rgba(0,0,0,0.45)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', padding: 16,
                }}
                    onClick={handleCloseModal}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--card)', borderRadius: 14,
                            width: '100%', maxWidth: 480, overflow: 'hidden',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                    >
                        {/* Modal header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 18px', background: 'var(--primary)',
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 700, fontSize: 15 }}>
                                <FaUndoAlt size={14} color="#fff" /> Request Bill Withdrawal
                            </span>
                            <FaTimes size={16} color="#fff" style={{ cursor: 'pointer' }} onClick={handleCloseModal} />
                        </div>

                        {/* Modal body */}
                        <div style={{ padding: '18px' }}>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-strong)', display: 'block', marginBottom: 6 }}>
                                    Withdrawal Reason <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Please provide a reason for withdrawing this bill…"
                                    value={withdrawReason}
                                    onChange={e => setWithdrawReason(e.target.value)}
                                    style={{
                                        width: '100%', border: '1px solid var(--border)', borderRadius: 8,
                                        padding: '9px 12px', fontSize: 13.5, color: 'var(--foreground)',
                                        background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
                                        resize: 'vertical', minHeight: 90, lineHeight: 1.5,
                                    }}
                                />
                            </div>

                            <div style={{ background: 'var(--muted)', borderLeft: '3px solid var(--accent)', borderRadius: 8, padding: '12px 14px', marginBottom: withdrawError ? 14 : 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 6 }}>Bill details</div>
                                <div style={{ display: 'grid', gap: 4, fontSize: 13, color: 'var(--foreground)' }}>
                                    <div><strong>Firm:</strong> {bill?.firmName || '—'}</div>
                                    <div><strong>Amount:</strong> ₹{(Number(bill?.amount) || 0).toLocaleString('en-IN')}</div>
                                    <div><strong>Invoice:</strong> {bill?.invoiceNo || '—'}</div>
                                </div>
                            </div>

                            {withdrawError && (
                                <div style={{ fontSize: 13, color: C.destructive, background: '#fde8e6', border: '1px solid #f5b8b2', borderRadius: 8, padding: '10px 12px' }}>
                                    {withdrawError}
                                </div>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div style={{
                            display: 'flex', justifyContent: 'flex-end', gap: 10,
                            padding: '14px 18px', borderTop: '1px solid var(--border)',
                        }}>
                            <button
                                onClick={handleCloseModal}
                                disabled={withdrawLoading}
                                style={{
                                    padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)',
                                    background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitWithdraw}
                                disabled={withdrawLoading}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    padding: '9px 18px', borderRadius: 8, border: 'none',
                                    background: 'var(--primary)', color: '#fff',
                                    fontSize: 13, fontWeight: 600,
                                    cursor: withdrawLoading ? 'not-allowed' : 'pointer', opacity: withdrawLoading ? 0.7 : 1,
                                }}
                            >
                                {withdrawLoading
                                    ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} /> Submitting…</>
                                    : 'Submit Withdrawal Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
}