import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaymentRequestById } from '../../../services/paymentService';
import { getTransactionsByPaymentId } from '../../../services/transactionService';
import { useAuthStore } from '../../../store/authStore';
import ClientHeader from '../../../components/layout/header/ClientHeader';
import StaffHeader from '../../../components/layout/header/StaffHeader';
import {
    FaFileInvoice, FaArrowLeft, FaCalendarAlt, FaCreditCard, FaWallet,
    FaRupeeSign, FaCalculator, FaCommentDots, FaFileAlt,
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
const statusMeta = (status) => {
    switch (status) {
        case 'Paid':       return { bg: 'var(--success)', color: 'var(--success-foreground)', label: 'Paid' };
        case 'Pending':    return { bg: 'var(--warning)', color: 'var(--warning-foreground)', label: 'Pending' };
        case 'Sanctioned': return { bg: '#dbeafe', color: C.info, label: 'Sanctioned' };
        case 'Rejected':
        case 'Overdue':    return { bg: '#fde8e6', color: C.destructive, label: status };
        default:           return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)', label: status || '—' };
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
const countChipStyle = {
    marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
    background: 'var(--muted)', padding: '2px 9px', borderRadius: 20,
};
const textBlockStyle = {
    fontSize: 13, color: 'var(--foreground)', lineHeight: 1.55,
    background: 'var(--muted)', borderRadius: 8, padding: '10px 12px',
    border: '1px solid var(--border)',
};
const pdfBtnStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '8px 16px', borderRadius: 8, border: 'none',
    background: 'var(--primary)', color: '#fff',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
};
const thStyle = {
    padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
};

const formatDate = (d) => (d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—');

// Field block
const Field = ({ label, children }) => (
    <div>
        <div style={labelStyle}>{label}</div>
        <div style={valueStyle}>{children}</div>
    </div>
);

export default function SinglePaymentRequestDetailsClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const [payment, setPayment] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const Header = user?.role === 'staff' ? StaffHeader : ClientHeader;

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const result = await getPaymentRequestById(id);
                if (!result || result.error || !result._id) {
                    throw new Error('Payment request not found.');
                }
                // Only the owner of a payment request may open it from this page
                const ownerId = result.user?._id || result.user;
                if (user?._id && ownerId && ownerId !== user._id) {
                    throw new Error('You do not have access to this payment request.');
                }
                setPayment(result);
                try {
                    const txns = await getTransactionsByPaymentId(id);
                    setTransactions(txns || []);
                } catch (txnError) {
                    console.warn('Could not fetch transactions:', txnError.message);
                    setTransactions([]);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch payment request.');
            } finally {
                setLoading(false);
            }
        };
        if (id && user?._id) fetchPayment();
    }, [id, user?._id]);

    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b?.transactionDate || 0) - new Date(a?.transactionDate || 0)
    );
    const requestedAmount = Number(payment?.amount) || 0;
    const totalPaidAmount = sortedTransactions.reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);
    const remainingAmount = Math.max(requestedAmount - totalPaidAmount, 0);

    const wrapStyle = {
        padding: '0 2px', fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--foreground)', background: 'var(--background)', minHeight: '100vh',
    };

    // ── Loading / error states ────────────────────────────────────────────────
    if (loading) {
        return (
            <>
                <Header />
                <div style={wrapStyle}>
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <span style={{
                            display: 'inline-block', width: 36, height: 36,
                            border: '3px solid var(--border)', borderTopColor: C.accent,
                            borderRadius: '50%', animation: 'spin 1s linear infinite',
                        }} />
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>Loading payment request…</div>
                    </div>
                    <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                </div>
            </>
        );
    }
    if (error || !payment) {
        return (
            <>
                <Header />
                <div style={wrapStyle}>
                    <div style={{ ...cardStyle, padding: '16px', color: C.destructive, background: '#fde8e6', border: '1px solid #f5b8b2' }}>
                        {error || 'No payment request found.'}
                    </div>
                    <button onClick={() => navigate(-1)} style={{ ...pdfBtnStyle, background: 'var(--card)', color: C.primary, border: '1px solid var(--border)' }}>
                        <FaArrowLeft size={12} color={C.primary} /> Back
                    </button>
                </div>
            </>
        );
    }

    const documentUrl = payment.image_url || payment.image;

    return (
        <>
            <Header />

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
                                Payment Request Details
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                Expense {payment.expenseNo || '—'} · {payment.tender || '—'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Request info + Payment summary ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 0 }}>

                    {/* Request information (wide) */}
                    <div style={{ ...cardStyle, gridColumn: 'span 2', minWidth: 0 }}>
                        <div style={cardHeaderStyle}>
                            <FaFileInvoice size={15} color={C.accent} />
                            <span style={cardHeaderTitleStyle}>Request Information</span>
                        </div>
                        <div style={cardBodyStyle}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                                <Field label="Tender">{payment.tender || '—'}</Field>
                                <Field label="Expense No.">{payment.expenseNo || '—'}</Field>
                                <Field label="Payment Type">{payment.paymentType || '—'}</Field>
                                <Field label="Payment Mode">{payment.paymentMode || '—'}</Field>
                                <Field label="Reference Mode">{payment.refMode || '—'}</Field>
                                <Field label="Amount">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: C.primary }}>
                                        <FaRupeeSign size={12} color={C.accent} />
                                        {requestedAmount.toLocaleString('en-IN')}
                                    </span>
                                </Field>
                                <Field label="Status"><Badge meta={statusMeta(payment.status)} /></Field>
                                <Field label="Submitted On">
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                        <FaCalendarAlt size={11} color={C.muted} />
                                        {formatDate(payment.submittedAt)}
                                    </span>
                                </Field>
                            </div>

                            <div style={{ marginTop: 14 }}>
                                <div style={labelStyle}>Description</div>
                                <div style={textBlockStyle}>
                                    {payment.description || 'No description provided.'}
                                </div>
                            </div>

                            {documentUrl && (
                                <div style={{ textAlign: 'right', marginTop: 14 }}>
                                    <a href={documentUrl} target="_blank" rel="noopener noreferrer" style={pdfBtnStyle}>
                                        <FaFileAlt size={13} color="#fff" /> View Document
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment summary (narrow) */}
                    <div style={{ ...cardStyle, minWidth: 0 }}>
                        <div style={cardHeaderStyle}>
                            <FaCreditCard size={15} color={C.accent} />
                            <span style={cardHeaderTitleStyle}>Payment Summary</span>
                        </div>
                        <div style={cardBodyStyle}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                    <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FaFileInvoice size={11} color={C.accent} /> Amount requested
                                    </div>
                                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-strong)' }}>
                                        ₹{requestedAmount.toLocaleString('en-IN')}
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Admin remark ── */}
                <div style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <FaCommentDots size={15} color={C.accent} />
                        <span style={cardHeaderTitleStyle}>Remark</span>
                    </div>
                    <div style={cardBodyStyle}>
                        {payment.remark ? (
                            <div style={textBlockStyle}>{payment.remark}</div>
                        ) : (
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                                No remark added for this payment request yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Transaction Summary ── */}
                <div style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <FaCreditCard size={15} color={C.accent} />
                        <span style={cardHeaderTitleStyle}>Transaction Summary</span>
                        <span style={countChipStyle}>{sortedTransactions.length}</span>
                    </div>
                    {sortedTransactions.length > 0 ? (
                        <>
                            {/* Desktop table */}
                            <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                                            {['#', 'Amount', 'UPI', 'Transaction ID', 'Date'].map(h => (
                                                <th key={h} style={thStyle}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedTransactions.map((t, i) => (
                                            <tr key={t._id || i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '11px 14px', fontWeight: 700 }}>{i + 1}</td>
                                                <td style={{ padding: '11px 14px' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 700, color: C.success }}>
                                                        <FaRupeeSign size={11} color={C.success} />{(Number(t.amount) || 0).toLocaleString('en-IN')}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '11px 14px' }}>
                                                    {t.upiId ? (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'monospace' }}>
                                                            <FaWallet size={11} color={C.info} />{t.upiId}
                                                        </span>
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
                                                <FaRupeeSign size={12} color={C.success} />{(Number(t.amount) || 0).toLocaleString('en-IN')}
                                            </span>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                {t.transactionDate ? new Date(t.transactionDate).toLocaleString('en-IN') : '—'}
                                            </span>
                                        </div>
                                        {t.upiId && (
                                            <Field label="UPI"><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.upiId}</span></Field>
                                        )}
                                        <div style={{ marginTop: 10 }}>
                                            <div style={labelStyle}>Transaction ID</div>
                                            <div style={{ fontSize: 11, fontFamily: 'monospace', background: 'var(--muted)', borderRadius: 6, padding: '4px 8px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{t._id || '—'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                            No transactions found for this payment request.
                        </div>
                    )}
                </div>
            </div>

            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </>
    );
}
