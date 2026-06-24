import React, { useState, useRef, useEffect } from 'react';
import {
  FaBuilding, FaMapMarkedAlt, FaFileInvoice,
  FaRupeeSign, FaFileUpload, FaFileAlt, FaFilePdf,
  FaTimes, FaCheckCircle,
} from 'react-icons/fa';
import { FiRefreshCw, FiSend, FiX } from 'react-icons/fi';
import { CLOUD_NAME, UPLOAD_PRESET, backend_url } from '../../store/keyStore';
import { useAuthStore } from '../../store/authStore';
import ClientHeader from '../../component/header/ClientHeader';
import { postBill } from '../../services/billServices';
import { getClientAgreements } from '../../services/agreement';

// ── Hardcoded icon colors (never rely on CSS var inheritance for icons) ──────
const C = {
  primary: '#6b3e2b',
  accent: '#b95a52',
  success: '#225b31',
  destructive: '#c94a3a',
  muted: '#8b7b74',
  warning: '#4a1f18',
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

const optionalTagStyle = {
  fontSize: 9.5,
  fontWeight: 600,
  color: 'var(--text-muted)',
  background: 'var(--muted)',
  border: '1px solid var(--border)',
  borderRadius: 20,
  padding: '1px 7px',
  marginLeft: 6,
  textTransform: 'none',
  letterSpacing: 0,
  verticalAlign: 1,
};

export default function UploadBillPage() {
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    firmName: '',
    workArea: '',
    loaNo: '',
    agreement: '',
    invoiceNo: '',
    amount: '',
    workDescription: '',
    pdfurl: '',
    user: '',
  });
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loaOptions, setLoaOptions] = useState([]);
  const [loadingLoa, setLoadingLoa] = useState(false);
  const [agreementOptions, setAgreementOptions] = useState([]);
  const [loadingAgreements, setLoadingAgreements] = useState(false);
  const fileInputRef = useRef();

  // Progress calculation — LOA & agreement are optional, so required fields total 100
  const progress = (() => {
    let s = 0;
    if (formData.firmName.trim()) s += 20;
    if (formData.workArea.trim()) s += 15;
    if (formData.invoiceNo.trim()) s += 20;
    if (formData.amount) s += 20;
    if (file) s += 25;
    return Math.min(s, 100);
  })();

  // Set user ID
  useEffect(() => {
    if (user?._id) setFormData(prev => ({ ...prev, user: user._id }));
  }, [user]);

  // Fetch LOAs
  useEffect(() => {
    if (!user?._id) return;
    const fetchLoas = async () => {
      setLoadingLoa(true);
      try {
        const res = await fetch(`${backend_url}/loa/${user._id}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to fetch LOA documents');
        }
        const data = await res.json();
        setLoaOptions(data);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoadingLoa(false);
      }
    };
    fetchLoas();
  }, [user]);

  // Fetch signed agreements
  useEffect(() => {
    if (!user?._id) return;
    const fetchSignedAgreements = async () => {
      setLoadingAgreements(true);
      try {
        const data = await getClientAgreements('signed');
        const agreements = data.agreements || [];
        setAgreementOptions(agreements);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoadingAgreements(false);
      }
    };
    fetchSignedAgreements();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (f) => {
    if (!f) return;
    const fileSizeMB = f.size / 1024 / 1024;
    if (fileSizeMB > 10) {
      setMessage({ type: 'error', text: 'File size exceeds the 10 MB limit.' });
      return;
    }
    setFile(f);
    setMessage({ type: '', text: '' });
  };

  const handleUpload = async () => {
    if (!file) return '';
    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('upload_preset', UPLOAD_PRESET);
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
    const res = await fetch(cloudinaryUrl, { method: 'POST', body: cloudFormData });
    if (!res.ok) throw new Error('Failed to upload file to Cloudinary');
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const pdfurl = await handleUpload();
      const payload = { ...formData, pdfurl };
      await postBill(payload);
      handleClear();
      setMessage({ type: 'success', text: 'Bill submitted successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Submission failed: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      firmName: '', workArea: '', loaNo: '', agreement: '',
      invoiceNo: '', amount: '', workDescription: '', pdfurl: '',
      user: user?._id || '',
    });
    setFile(null);
    setMessage({ type: '', text: '' });
  };

  const fileSize = file
    ? file.size / 1024 > 1024
      ? (file.size / 1048576).toFixed(1) + ' MB'
      : Math.round(file.size / 1024) + ' KB'
    : '';

  // Inline select loading placeholder
  const LoadingSelect = () => (
    <div style={{
      ...controlStyle,
      display: 'flex', alignItems: 'center', gap: 8,
      color: 'var(--text-muted)', cursor: 'not-allowed',
    }}>
      <span style={{
        width: 12, height: 12, border: '2px solid var(--border)',
        borderTopColor: C.accent, borderRadius: '50%',
        display: 'inline-block', animation: 'spin 1s linear infinite',
      }} />
      Loading…
    </div>
  );

  // Message banner
  const MessageBanner = () => {
    if (!message.text) return null;
    const isSuccess = message.type === 'success';
    const isWarning = message.type === 'warning';
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 14px', borderRadius: 8, marginBottom: 14,
        background: isSuccess ? 'var(--success)' : isWarning ? 'var(--warning)' : '#fde8e6',
        border: `1px solid ${isSuccess ? '#b6dfc4' : isWarning ? '#e8b4ab' : '#f5b8b2'}`,
        fontSize: 13, color: isSuccess ? C.success : isWarning ? C.warning : C.destructive,
      }}>
        {isSuccess
          ? <FaCheckCircle size={14} color={C.success} style={{ marginTop: 1, flexShrink: 0 }} />
          : <FaTimes size={14} color={isWarning ? C.warning : C.destructive} style={{ marginTop: 1, flexShrink: 0 }} />
        }
        <span style={{ flex: 1 }}>{message.text}</span>
        <FaTimes
          size={12} color={C.muted}
          style={{ cursor: 'pointer', marginTop: 1, flexShrink: 0 }}
          onClick={() => setMessage({ type: '', text: '' })}
        />
      </div>
    );
  };

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
                <FaFileInvoice size={16} color={C.primary} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                  Upload Bill
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  Submit your bill for review and processing
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

              {/* ── Firm & Location card ── */}
              <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                  <FaBuilding size={14} color={C.accent} />
                  <span style={sectionTitleStyle}>Firm & work details</span>
                </div>
                <p style={sectionSubtitleStyle}>Basic information about the firm and the work location.</p>

                <div style={gridTwo}>
                  <div>
                    <label style={labelStyle}>
                      <FaBuilding size={10} style={{ marginRight: 4, verticalAlign: -1 }} />
                      Firm name *
                    </label>
                    <input
                      type="text"
                      name="firmName"
                      value={formData.firmName}
                      onChange={handleChange}
                      placeholder="e.g. Rane Construction Ltd."
                      required
                      style={controlStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      <FaMapMarkedAlt size={10} style={{ marginRight: 4, verticalAlign: -1 }} />
                      Work area *
                    </label>
                    <input
                      type="text"
                      name="workArea"
                      value={formData.workArea}
                      onChange={handleChange}
                      placeholder="e.g. Site Block C, Indore"
                      required
                      style={controlStyle}
                    />
                  </div>
                </div>
              </div>

              {/* ── LOA & Agreement card (optional) ── */}
              <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                  <FaFileAlt size={14} color={C.accent} />
                  <span style={sectionTitleStyle}>LOA & agreement</span>
                </div>
                <p style={sectionSubtitleStyle}>Optionally link this bill to an LOA and a signed agreement. Leave blank if not applicable.</p>

                <div style={gridTwo}>
                  <div>
                    <label style={labelStyle}>
                      LOA <span style={optionalTagStyle}>Optional</span>
                    </label>
                    {loadingLoa ? <LoadingSelect /> : (
                      <select
                        name="loaNo"
                        value={formData.loaNo}
                        onChange={handleChange}
                        style={{ ...controlStyle, cursor: 'pointer' }}
                      >
                        <option value="">No LOA / not applicable</option>
                        {loaOptions.map(loa => (
                          <option key={loa._id} value={loa.documentCode}>{loa.documentCode}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Agreement <span style={optionalTagStyle}>Optional</span>
                    </label>
                    {loadingAgreements ? <LoadingSelect /> : (
                      <select
                        name="agreement"
                        value={formData.agreement}
                        onChange={handleChange}
                        style={{ ...controlStyle, cursor: 'pointer' }}
                      >
                        <option value="">No agreement / not applicable</option>
                        {agreementOptions.map(agr => (
                          <option key={agr._id} value={agr._id}>
                            {`${agr.title || 'Untitled Agreement'} (${agr.agreementId || agr._id})`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Invoice details card ── */}
              <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                  <FaRupeeSign size={14} color={C.accent} />
                  <span style={sectionTitleStyle}>Invoice details</span>
                </div>
                <p style={sectionSubtitleStyle}>Provide the invoice number, amount, and a brief work description.</p>

                <div style={{ ...gridTwo, marginBottom: 12 }}>
                  <div>
                    <label style={labelStyle}>
                      <FaFileInvoice size={10} style={{ marginRight: 4, verticalAlign: -1 }} />
                      Invoice no. *
                    </label>
                    <input
                      type="text"
                      name="invoiceNo"
                      value={formData.invoiceNo}
                      onChange={handleChange}
                      placeholder="e.g. INV-2025-0042"
                      required
                      style={controlStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      <FaRupeeSign size={10} style={{ marginRight: 4, verticalAlign: -1 }} />
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                      style={controlStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Work description</label>
                  <textarea
                    name="workDescription"
                    rows={3}
                    value={formData.workDescription}
                    onChange={handleChange}
                    placeholder="Describe the work carried out for this bill…"
                    style={{ ...controlStyle, resize: 'vertical', minHeight: 84, lineHeight: 1.5 }}
                  />
                </div>
              </div>

              {/* ── File upload card ── */}
              <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                  <FaFileUpload size={14} color={C.accent} />
                  <span style={sectionTitleStyle}>Attach bill document</span>
                </div>
                <p style={sectionSubtitleStyle}>Upload the bill in PDF, JPG, or PNG format (max 10 MB).</p>

                <label
                  htmlFor="billFileUpload"
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
                  <FaFileUpload size={28} color={C.muted} style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--secondary-foreground)' }}>
                    Tap to browse or drag & drop
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                    PDF, JPG, PNG · max 10 MB
                  </div>
                  <input
                    type="file"
                    id="billFileUpload"
                    accept=".pdf,.jpg,.jpeg,.png"
                    ref={fileInputRef}
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
                    <FiX
                      size={16}
                      onClick={() => setFile(null)}
                      style={{ cursor: 'pointer', color: C.muted, flexShrink: 0 }}
                    />
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
                    : <><FiSend size={14} /> Submit bill</>
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