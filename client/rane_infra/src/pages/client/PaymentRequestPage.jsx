import React, { useState } from 'react';
import {
    FaRupeeSign, FaUpload, FaUniversity, FaQrcode,
    FaFileInvoiceDollar, FaCheck, FaFilePdf, FaTimes,
    FaCheckCircle, FaWallet,
} from 'react-icons/fa';
import { FiRefreshCw, FiSend, FiX } from 'react-icons/fi';
import ClientHeader from '../../component/header/ClientHeader';
import StaffHeader from '../../component/header/StaffHeader';
import { postPaymentRequest } from '../../services/paymentService';
import { CLOUDINARY_URL, UPLOAD_PRESET } from '../../store/keyStore';
import { useAuthStore } from '../../store/authStore';

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = {
    primary: '#6b3e2b',
    accent: '#b95a52',
    success: '#225b31',
    destructive: '#c94a3a',
    muted: '#8b7b74',
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    display: 'block',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const controlStyle = {
    width: '100%',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 13.5,
    color: 'var(--foreground)',
    background: 'var(--input)',
    outline: 'none',
    boxSizing: 'border-box',
};

const cardStyle = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '16px 18px',
    marginBottom: 14,
    boxShadow: '0 2px 8px var(--shadow-color)',
};

const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
};

const sectionTitleStyle = {
    fontWeight: 700,
    fontSize: 13,
    color: 'var(--text-strong)',
};

const sectionSubtitleStyle = {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginBottom: 14,
};

const gridTwo = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
};

// ── Payment mode icon map ─────────────────────────────────────────────────────
const MODE_CONFIG = {
    UPI:    { icon: <FaQrcode size={22} color={C.accent} />,            label: 'UPI' },
    Bank:   { icon: <FaUniversity size={22} color={C.accent} />,        label: 'Bank Transfer' },
    Cheque: { icon: <FaFileInvoiceDollar size={22} color={C.accent} />, label: 'Cheque' },
};

export default function PaymentRequestPage() {
    const [paymentType, setPaymentType] = useState('IP');
    const [paymentMode, setPaymentMode] = useState('Bank');
    const [file, setFile]               = useState(null);
    const [dragOver, setDragOver]       = useState(false);
    const [tender, setTender]           = useState('RTM-2024-25-69');
    const [amount, setAmount]           = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting]   = useState(false);
    const [message, setMessage]         = useState({ type: '', text: '' });

    const { user } = useAuthStore();

    const getHeaderComponent = () => {
        switch (user?.role) {
            case 'client': return <ClientHeader />;
            case 'staff':  return <StaffHeader />;
            default:       return <ClientHeader />;
        }
    };

    // Progress
    const progress = (() => {
        let s = 0;
        if (tender)           s += 20;
        if (amount)           s += 20;
        if (description.trim()) s += 20;
        if (paymentMode)      s += 15;
        if (file)             s += 25;
        return Math.min(s, 100);
    })();

    const handleFileSelect = (f) => {
        if (!f) return;
        if (f.size > 10 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File exceeds the 10 MB limit.' });
            return;
        }
        setFile(f);
        setMessage({ type: '', text: '' });
    };

    const uploadImageToCloudinary = async (f) => {
        const formData = new FormData();
        formData.append('file', f);
        formData.append('upload_preset', UPLOAD_PRESET);
        const response = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Cloudinary upload failed');
        const data = await response.json();
        return data.secure_url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            let imageUrl = null;
            if (file) imageUrl = await uploadImageToCloudinary(file);

            const paymentData = {
                tender,
                user: user._id,
                amount: Number(amount),
                description,
                paymentType,
                paymentMode,
                ...(imageUrl && { image_url: imageUrl }),
            };

            await postPaymentRequest(paymentData);
            setMessage({ type: 'success', text: 'Payment request submitted successfully!' });
            setFile(null); setAmount(''); setDescription('');
            setTender('RTM-2024-25-69'); setPaymentType('IP'); setPaymentMode('Bank');
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Something went wrong.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleClear = () => {
        setFile(null); setAmount(''); setDescription('');
        setTender('RTM-2024-25-69'); setPaymentType('IP'); setPaymentMode('Bank');
        setMessage({ type: '', text: '' });
    };

    const fileSize = file
        ? file.size / 1024 > 1024
            ? (file.size / 1048576).toFixed(1) + ' MB'
            : Math.round(file.size / 1024) + ' KB'
        : '';

    // Message banner
    const MessageBanner = () => {
        if (!message.text) return null;
        const isSuccess = message.type === 'success';
        return (
            <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 14px', borderRadius: 8, marginBottom: 14,
                background: isSuccess ? 'var(--success)' : '#fde8e6',
                border: `1px solid ${isSuccess ? '#b6dfc4' : '#f5b8b2'}`,
                fontSize: 13, color: isSuccess ? C.success : C.destructive,
            }}>
                {isSuccess
                    ? <FaCheckCircle size={14} color={C.success} style={{ marginTop: 1, flexShrink: 0 }} />
                    : <FaTimes size={14} color={C.destructive} style={{ marginTop: 1, flexShrink: 0 }} />
                }
                <span style={{ flex: 1 }}>{message.text}</span>
                <FaTimes size={12} color={C.muted} style={{ cursor: 'pointer', marginTop: 1 }}
                    onClick={() => setMessage({ type: '', text: '' })} />
            </div>
        );
    };

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
                                    Payment Request
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                    Submit a payment request for review and processing
                                </div>
                            </div>
                        </div>
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            fontSize: 11, color: 'var(--text-muted)',
                            padding: '4px 10px', background: 'var(--muted)',
                            borderRadius: 20, fontWeight: 600,
                        }}>
                            <FaCheckCircle size={11} color={C.accent} /> {progress}% complete
                        </span>
                    </div>

                    {/* ── Form body ── */}
                    <div style={{ padding: '18px 20px' }}>

                        {/* Progress strip */}
                        <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 16 }}>
                            <div style={{
                                height: '100%', width: `${progress}%`,
                                background: 'var(--accent)', borderRadius: 99,
                                transition: 'width .35s ease',
                            }} />
                        </div>

                        <MessageBanner />

                        <form onSubmit={handleSubmit}>

                            {/* ── Request classification card ── */}
                            <div style={cardStyle}>
                                <div style={sectionHeaderStyle}>
                                    <FaFileInvoiceDollar size={14} color={C.accent} />
                                    <span style={sectionTitleStyle}>Request details</span>
                                </div>
                                <p style={sectionSubtitleStyle}>Select the payment type and link to the relevant tender.</p>

                                <div style={gridTwo}>
                                    {/* Payment type */}
                                    <div>
                                        <label style={labelStyle}>Payment type *</label>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {['IP'].map(type => (
                                                <label key={type} style={{
                                                    display: 'flex', alignItems: 'center', gap: 7,
                                                    padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                                                    border: `1px solid ${paymentType === type ? 'var(--accent)' : 'var(--border)'}`,
                                                    background: paymentType === type ? 'var(--secondary)' : 'var(--input)',
                                                    fontSize: 13, fontWeight: 600,
                                                    color: paymentType === type ? C.accent : 'var(--foreground)',
                                                    transition: 'all .15s ease',
                                                }}>
                                                    <input
                                                        type="radio"
                                                        name="paymentType"
                                                        value={type}
                                                        checked={paymentType === type}
                                                        onChange={() => setPaymentType(type)}
                                                        style={{ display: 'none' }}
                                                    />
                                                    {paymentType === type && (
                                                        <span style={{
                                                            width: 14, height: 14, borderRadius: '50%',
                                                            background: C.accent, display: 'flex',
                                                            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                        }}>
                                                            <FaCheck size={7} color="#fff" />
                                                        </span>
                                                    )}
                                                    {type}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tender select */}
                                    <div>
                                        <label style={labelStyle}>Tender *</label>
                                        <select
                                            required
                                            value={tender}
                                            onChange={e => setTender(e.target.value)}
                                            style={{ ...controlStyle, cursor: 'pointer' }}
                                        >
                                            <option value="RTM-2024-25-69">RTM-2024-25-69</option>
                                            <option value="RTM-2024-25-70">RTM-2024-25-70</option>
                                            <option value="RTM-2024-25-71">RTM-2024-25-71</option>
                                            <option value="RTM-2024-25-72">RTM-2024-25-72</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* ── Amount & description card ── */}
                            <div style={cardStyle}>
                                <div style={sectionHeaderStyle}>
                                    <FaRupeeSign size={14} color={C.accent} />
                                    <span style={sectionTitleStyle}>Amount & description</span>
                                </div>
                                <p style={sectionSubtitleStyle}>Enter the requested amount and a brief purpose for this payment.</p>

                                <div style={{ marginBottom: 12 }}>
                                    <label style={labelStyle}>
                                        <FaRupeeSign size={10} style={{ marginRight: 4, verticalAlign: -1 }} />
                                        Amount (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        min="0"
                                        required
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        style={controlStyle}
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Description *</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe the purpose of this payment request…"
                                        required
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        style={{ ...controlStyle, resize: 'vertical', minHeight: 84, lineHeight: 1.5 }}
                                    />
                                </div>
                            </div>

                            {/* ── Payment mode card ── */}
                            <div style={cardStyle}>
                                <div style={sectionHeaderStyle}>
                                    <FaUniversity size={14} color={C.accent} />
                                    <span style={sectionTitleStyle}>Payment mode</span>
                                </div>
                                <p style={sectionSubtitleStyle}>Choose how you'd like to receive the payment.</p>

                                {/* Mode tiles */}
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                                    {Object.entries(MODE_CONFIG).map(([mode, { icon, label }]) => {
                                        const active = paymentMode === mode;
                                        return (
                                            <div
                                                key={mode}
                                                onClick={() => setPaymentMode(mode)}
                                                style={{
                                                    flex: '1 1 110px', minWidth: 110,
                                                    textAlign: 'center', cursor: 'pointer',
                                                    padding: '14px 10px', borderRadius: 10,
                                                    border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                                                    background: active ? 'var(--secondary)' : 'var(--muted)',
                                                    transition: 'all .15s ease',
                                                    boxShadow: active ? '0 2px 8px var(--shadow-color)' : 'none',
                                                }}
                                            >
                                                <div style={{ marginBottom: 7 }}>{icon}</div>
                                                <div style={{
                                                    fontSize: 12, fontWeight: 700,
                                                    color: active ? C.accent : 'var(--foreground)',
                                                }}>
                                                    {label}
                                                </div>
                                                {active && (
                                                    <div style={{ marginTop: 5 }}>
                                                        <span style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: 3,
                                                            fontSize: 10, fontWeight: 700,
                                                            color: C.accent, background: 'var(--warning)',
                                                            padding: '2px 7px', borderRadius: 20,
                                                        }}>
                                                            <FaCheck size={7} color={C.accent} /> Selected
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Bank info panel */}
                                {paymentMode === 'Bank' && (
                                    <div style={{
                                        background: 'var(--secondary)',
                                        border: '1px solid var(--border)',
                                        borderLeft: '3px solid var(--accent)',
                                        borderRadius: 8, padding: '12px 14px',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                                            <FaUniversity size={13} color={C.primary} />
                                            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-strong)' }}>
                                                Bank account details
                                            </span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px 20px' }}>
                                            {[
                                                { label: 'Account holder', value: user?.name },
                                                { label: 'Account number', value: user?.accountNo },
                                                { label: 'IFSC code', value: user?.ifscCode },
                                                { label: 'Bank name', value: user?.bankName },
                                            ].map(({ label, value }) => (
                                                <div key={label}>
                                                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {label}
                                                    </span>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', marginTop: 1 }}>
                                                        {value ?? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>N/A</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* UPI info panel */}
                                {paymentMode === 'UPI' && (
                                    <div style={{
                                        background: 'var(--secondary)',
                                        border: '1px solid var(--border)',
                                        borderLeft: '3px solid var(--accent)',
                                        borderRadius: 8, padding: '12px 14px',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                                            <FaQrcode size={13} color={C.primary} />
                                            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-strong)' }}>
                                                UPI details
                                            </span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '6px 20px', marginBottom: 10 }}>
                                            {[
                                                { label: 'UPI ID', value: user?.upi },
                                                { label: 'Linked bank', value: user?.bankName },
                                            ].map(({ label, value }) => (
                                                <div key={label}>
                                                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {label}
                                                    </span>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', marginTop: 1 }}>
                                                        {value ?? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>N/A</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                            Ensure your UPI ID is correct and linked to the receiving account.
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── File upload card ── */}
                            <div style={cardStyle}>
                                <div style={sectionHeaderStyle}>
                                    <FaUpload size={14} color={C.accent} />
                                    <span style={sectionTitleStyle}>Attach supporting document</span>
                                </div>
                                <p style={sectionSubtitleStyle}>Upload any supporting file (PDF, JPG, PNG · max 10 MB).</p>

                                <label
                                    htmlFor="paymentFileUpload"
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
                                    style={{
                                        display: 'block', textAlign: 'center', cursor: 'pointer',
                                        border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
                                        borderRadius: 10, padding: '26px 16px',
                                        background: dragOver ? 'var(--secondary)' : 'var(--muted)',
                                        transition: 'border-color .2s, background .2s',
                                    }}
                                >
                                    <FaUpload size={28} color={C.muted} style={{ marginBottom: 8 }} />
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--secondary-foreground)' }}>
                                        Tap to browse or drag & drop
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                                        PDF, JPG, PNG · max 10 MB
                                    </div>
                                    <input
                                        type="file"
                                        id="paymentFileUpload"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={e => handleFileSelect(e.target.files[0])}
                                        style={{ display: 'none' }}
                                    />
                                </label>

                                {file && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 9,
                                        background: 'var(--secondary)', border: '1px solid var(--border)',
                                        borderRadius: 8, padding: '9px 12px', marginTop: 10,
                                    }}>
                                        <FaFilePdf size={17} color={C.accent} style={{ flexShrink: 0 }} />
                                        <span style={{
                                            fontSize: 13, fontWeight: 500, color: 'var(--foreground)',
                                            flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>
                                            {file.name}
                                        </span>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fileSize}</span>
                                        <FiX size={16} onClick={() => setFile(null)}
                                            style={{ cursor: 'pointer', color: C.muted, flexShrink: 0 }} />
                                    </div>
                                )}
                            </div>

                            {/* ── Actions ── */}
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    disabled={submitting}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '9px 16px', borderRadius: 8,
                                        border: '1px solid var(--border)',
                                        background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    }}
                                >
                                    <FiX size={14} /> Clear form
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 7,
                                        padding: '9px 20px', borderRadius: 8,
                                        border: 'none',
                                        background: 'var(--primary)', color: '#fff',
                                        fontSize: 13, fontWeight: 600,
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        opacity: submitting ? 0.7 : 1,
                                    }}
                                >
                                    {submitting
                                        ? <><FiRefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
                                        : <><FiSend size={14} /> Request payment</>
                                    }
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button { opacity: 0.4; }
                select option { background: var(--input); color: var(--foreground); }
            `}</style>
        </>
    );
}