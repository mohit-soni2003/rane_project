import React, { useState, useRef } from 'react';
import {
  FaFileSignature, FaUserTie, FaFileAlt, FaFileUpload,
  FaCalendarAlt, FaFilePdf, FaCheckCircle, FaTimes,
} from 'react-icons/fa';
import { FiRefreshCw, FiSend, FiX } from 'react-icons/fi';
import AdminHeader from '../../component/header/AdminHeader';
import { createAgreement } from '../../services/agreement';
import { CLOUD_NAME, UPLOAD_PRESET } from '../../store/keyStore';

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
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
};
const controlStyle = {
  width: '100%', border: '1px solid var(--border)', borderRadius: 8,
  padding: '9px 12px', fontSize: 13.5, color: 'var(--foreground)',
  background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
};
const cardStyle = {
  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
  padding: '16px 18px', marginBottom: 14, boxShadow: '0 2px 8px var(--shadow-color)',
};
const sectionHeaderStyle = { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 };
const sectionTitleStyle = { fontWeight: 700, fontSize: 13, color: 'var(--text-strong)' };
const sectionSubtitleStyle = { fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 };
const gridTwo = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12,
};
const optionalTagStyle = {
  fontSize: 9.5, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--muted)',
  border: '1px solid var(--border)', borderRadius: 20, padding: '1px 7px',
  marginLeft: 6, textTransform: 'none', letterSpacing: 0, verticalAlign: 1,
};

export default function PushAgreement() {
  const [form, setForm] = useState({
    title: '', description: '', clientId: '', fileUrl: '', expiryDate: '',
  });
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef();

  // Progress — required fields: clientId (30) + title (30) + file (40)
  const progress = (() => {
    let s = 0;
    if (form.clientId.trim()) s += 30;
    if (form.title.trim()) s += 30;
    if (file) s += 40;
    return Math.min(s, 100);
  })();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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

  const uploadToCloudinary = async () => {
    if (!file) throw new Error('Please select a file.');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      { method: 'POST', body: formData }
    );
    if (!res.ok) throw new Error('File upload failed.');
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!form.title || !form.clientId || !file) {
      setMessage({ type: 'error', text: 'Title, client user ID, and a file are required.' });
      return;
    }

    try {
      setSubmitting(true);
      const uploadedFileUrl = await uploadToCloudinary();
      await createAgreement({ ...form, fileUrl: uploadedFileUrl });
      handleClear();
      setMessage({ type: 'success', text: 'Agreement pushed successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to push agreement: ' + (err.message || 'Unknown error') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setForm({ title: '', description: '', clientId: '', fileUrl: '', expiryDate: '' });
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setMessage({ type: '', text: '' });
  };

  const fileSize = file
    ? file.size / 1024 > 1024
      ? (file.size / 1048576).toFixed(1) + ' MB'
      : Math.round(file.size / 1024) + ' KB'
    : '';

  // ── Message banner ───────────────────────────────────────────────────────
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
          : <FaTimes size={14} color={isWarning ? C.warning : C.destructive} style={{ marginTop: 1, flexShrink: 0 }} />}
        <span style={{ flex: 1 }}>{message.text}</span>
        <FaTimes size={12} color={C.muted}
          style={{ cursor: 'pointer', marginTop: 1, flexShrink: 0 }}
          onClick={() => setMessage({ type: '', text: '' })} />
      </div>
    );
  };

  return (
    <>
      <AdminHeader />

      <div style={{
        padding: '0 2px', fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--foreground)', background: 'var(--background)', minHeight: '100vh',
      }}>

        {/* ── Page card ── */}
        <div style={{
          background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)',
          boxShadow: '0 2px 10px var(--shadow-color)', overflow: 'hidden', marginBottom: 16,
        }}>

          {/* ── Title bar ── */}
          <div style={{
            borderBottom: '1px solid var(--border)', padding: '14px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FaFileSignature size={16} color={C.primary} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                  Push Agreement
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  Upload and assign an agreement to a client
                </div>
              </div>
            </div>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: 'var(--text-muted)',
              padding: '4px 10px', background: 'var(--muted)', borderRadius: 20, fontWeight: 600,
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
                background: 'var(--accent)', borderRadius: 99, transition: 'width .35s ease',
              }} />
            </div>

            <MessageBanner />

            <form onSubmit={handleSubmit}>

              {/* ── Agreement details card ── */}
              <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                  <FaFileAlt size={14} color={C.accent} />
                  <span style={sectionTitleStyle}>Agreement details</span>
                </div>
                <p style={sectionSubtitleStyle}>Who the agreement is for and what it covers.</p>

                <div style={{ ...gridTwo, marginBottom: 12 }}>
                  <div>
                    <label style={labelStyle}>
                      <FaUserTie size={10} style={{ marginRight: 4, verticalAlign: -1 }} />
                      Client user ID *
                    </label>
                    <input
                      type="text" name="clientId" value={form.clientId} onChange={handleChange}
                      placeholder="Enter client user ID" required style={controlStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      <FaFileAlt size={10} style={{ marginRight: 4, verticalAlign: -1 }} />
                      Agreement title *
                    </label>
                    <input
                      type="text" name="title" value={form.title} onChange={handleChange}
                      placeholder="e.g. Annual Maintenance Contract" required style={controlStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>
                    Description <span style={optionalTagStyle}>Optional</span>
                  </label>
                  <textarea
                    name="description" rows={3} value={form.description} onChange={handleChange}
                    placeholder="Add any context or terms summary for this agreement…"
                    style={{ ...controlStyle, resize: 'vertical', minHeight: 84, lineHeight: 1.5 }}
                  />
                </div>
              </div>

              {/* ── Validity card ── */}
              <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                  <FaCalendarAlt size={14} color={C.accent} />
                  <span style={sectionTitleStyle}>Validity</span>
                </div>
                <p style={sectionSubtitleStyle}>Set when this agreement expires. Leave blank if it doesn't expire.</p>

                <div style={gridTwo}>
                  <div>
                    <label style={labelStyle}>
                      Expiry date <span style={optionalTagStyle}>Optional</span>
                    </label>
                    <input
                      type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange}
                      style={{ ...controlStyle, cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>

              {/* ── File upload card ── */}
              <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                  <FaFileUpload size={14} color={C.accent} />
                  <span style={sectionTitleStyle}>Attach agreement document</span>
                </div>
                <p style={sectionSubtitleStyle}>Upload the agreement in PDF format (max 10 MB).</p>

                <label
                  htmlFor="agreementFileUpload"
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
                    Tap to browse or drag &amp; drop
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                    PDF · max 10 MB
                  </div>
                  <input
                    type="file" id="agreementFileUpload" accept=".pdf" ref={fileInputRef}
                    onChange={e => handleFileSelect(e.target.files[0])} style={{ display: 'none' }}
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
                    <FiX size={16}
                      onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      style={{ cursor: 'pointer', color: C.muted, flexShrink: 0 }} />
                  </div>
                )}
              </div>

              {/* ── Actions ── */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button" onClick={handleClear} disabled={submitting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)',
                    background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                    fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <FiX size={14} /> Clear form
                </button>
                <button
                  type="submit" disabled={submitting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '9px 20px', borderRadius: 8, border: 'none',
                    background: 'var(--primary)', color: '#fff',
                    fontSize: 13, fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting
                    ? <><FiRefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
                    : <><FiSend size={14} /> Push agreement</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: var(--text-muted); opacity: 0.7; }
        select option { background: var(--input); color: var(--foreground); }
      `}</style>
    </>
  );
}