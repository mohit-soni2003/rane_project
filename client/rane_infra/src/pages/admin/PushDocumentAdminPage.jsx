import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { pushDocument } from '../../services/documentService';
import { CLOUDINARY_URL, UPLOAD_PRESET } from '../../store/keyStore';
import AdminHeader from '../../component/header/AdminHeader';
import {
  FaIdCard, FaFileUpload, FaCalendarAlt, FaStickyNote, FaListAlt,
  FaFileCode, FaPaperPlane, FaTimes,
} from 'react-icons/fa';

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: 'var(--text-strong)',
  display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6,
};

const DOC_TYPES = [
  { value: '', label: 'Select type' },
  { value: 'LOA', label: 'LOA' },
  { value: 'SalesOrder', label: 'Sales Order' },
  { value: 'PurchaseOrder', label: 'Purchase Order' },
  { value: 'PayIn', label: 'Pay In' },
  { value: 'PayOut', label: 'Pay Out' },
  { value: 'Estimate', label: 'Estimate' },
  { value: 'DeliveryChallan', label: 'Delivery Challan' },
  { value: 'Expense', label: 'Expense' },
  { value: 'BankReference', label: 'Bank Reference' },
  { value: 'Other', label: 'Other' },
];

export default function PushDocumentAdminPage() {
  const { cid: encodedCid } = useParams();
  const [cid, setCid] = useState(decodeURIComponent(encodedCid || ''));
  const [docType, setDocType] = useState('');
  const [documentCode, setDocumentCode] = useState('');
  const [dateOfIssue, setDateOfIssue] = useState('');
  const [remark, setRemark] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Cloudinary upload failed');
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cid || !file || !docType || !documentCode || !dateOfIssue) {
      toast.error('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      const documentLink = await uploadToCloudinary(file);
      const payload = {
        cid,
        docType,
        documentCode,
        dateOfIssue,
        remark,
        documentLink,
      };

      await pushDocument(payload);

      setDocType('');
      setDocumentCode('');
      setDateOfIssue('');
      setRemark('');
      setFile(null);
      toast.success('Document pushed successfully!');
    } catch (err) {
      console.error('Push failed:', err);
      toast.error('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    width: '100%', boxSizing: 'border-box',
    background: 'var(--input)', color: 'var(--foreground)',
    border: `1px solid ${focused === name ? 'var(--primary)' : 'var(--border)'}`,
    borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none',
    boxShadow: focused === name ? '0 0 0 3px var(--accent-ring)' : 'none',
    transition: 'border-color .15s, box-shadow .15s', fontFamily: 'inherit',
  });

  return (
    <>
      <AdminHeader />
      <ToastContainer position="top-right" autoClose={2500} newestOnTop />

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
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FaPaperPlane size={15} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                Push Document to Client
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                Upload and assign a document to a client
              </div>
            </div>
          </div>

          <div style={{ padding: '18px 20px' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px 20px' }}>

                {/* Client CID */}
                <div>
                  <label style={labelStyle}>
                    <FaIdCard size={12} color="var(--accent)" /> Client CID *
                  </label>
                  <input
                    type="text" value={cid} placeholder="Enter client ID" required
                    onChange={(e) => setCid(e.target.value)}
                    onFocus={() => setFocused('cid')} onBlur={() => setFocused('')}
                    style={inputStyle('cid')}
                  />
                </div>

                {/* Document Type */}
                <div>
                  <label style={labelStyle}>
                    <FaListAlt size={12} color="var(--accent)" /> Document Type *
                  </label>
                  <select
                    value={docType} required
                    onChange={(e) => setDocType(e.target.value)}
                    onFocus={() => setFocused('docType')} onBlur={() => setFocused('')}
                    style={{ ...inputStyle('docType'), cursor: 'pointer' }}
                  >
                    {DOC_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Document Code */}
                <div>
                  <label style={labelStyle}>
                    <FaFileCode size={12} color="var(--accent)" /> Document Code *
                  </label>
                  <input
                    type="text" value={documentCode} placeholder="Enter document code" required
                    onChange={(e) => setDocumentCode(e.target.value)}
                    onFocus={() => setFocused('documentCode')} onBlur={() => setFocused('')}
                    style={inputStyle('documentCode')}
                  />
                </div>

                {/* Date of Issue */}
                <div>
                  <label style={labelStyle}>
                    <FaCalendarAlt size={12} color="var(--accent)" /> Date of Issue *
                  </label>
                  <input
                    type="date" value={dateOfIssue} required
                    onChange={(e) => setDateOfIssue(e.target.value)}
                    onFocus={() => setFocused('dateOfIssue')} onBlur={() => setFocused('')}
                    style={inputStyle('dateOfIssue')}
                  />
                </div>

                {/* Remark (full width) */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>
                    <FaStickyNote size={12} color="var(--accent)" /> Remark (optional)
                  </label>
                  <input
                    type="text" value={remark} placeholder="Additional notes about this document (optional)"
                    onChange={(e) => setRemark(e.target.value)}
                    onFocus={() => setFocused('remark')} onBlur={() => setFocused('')}
                    style={inputStyle('remark')}
                  />
                </div>

                {/* Upload (full width) */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>
                    <FaFileUpload size={12} color="var(--accent)" /> Upload Document *
                  </label>
                  <div
                    onClick={() => document.getElementById('customFileInput').click()}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '30px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                      border: `1.5px dashed ${file ? 'var(--primary)' : 'var(--border)'}`,
                      background: file ? 'var(--secondary)' : 'var(--muted)',
                      transition: 'border-color .15s, background .15s',
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', background: 'var(--warning)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FaFileUpload size={18} color="var(--primary)" />
                    </div>
                    {file ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </span>
                        <FaTimes size={13} color="var(--text-muted)" title="Remove file"
                          onClick={(e) => { e.stopPropagation(); setFile(null); const el = document.getElementById('customFileInput'); if (el) el.value = ''; }}
                          style={{ cursor: 'pointer' }} />
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>Drag &amp; drop or click to browse</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>PDF, JPG, or PNG up to 10MB</span>
                      </>
                    )}
                    <input
                      id="customFileInput" type="file" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange} required hidden
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
                <button
                  type="button" disabled={loading}
                  style={{
                    padding: '11px 22px', borderRadius: 8, border: '1px solid var(--border)',
                    background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                    fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={loading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '11px 28px', borderRadius: 8, border: 'none',
                    background: 'var(--primary)', color: 'var(--primary-foreground)',
                    fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1,
                    transition: 'background .15s',
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--primary-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)'; }}
                >
                  {loading
                    ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} /> Uploading…</>
                    : <><FaPaperPlane size={13} color="var(--primary-foreground)" /> Push Document</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: var(--text-muted); opacity: 0.7; }
        select option { background: var(--input); color: var(--foreground); }
      `}</style>
    </>
  );
}