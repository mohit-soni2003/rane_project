import React, { useState, useRef } from "react";
import AdminHeader from "../../component/header/AdminHeader";
import { createAgreement } from "../../services/agreement";
import { CLOUD_NAME, UPLOAD_PRESET } from "../../store/keyStore";
import {
  FaFileAlt, FaUserTie, FaCalendarAlt, FaFileUpload, FaFileSignature,
  FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaTimes,
} from "react-icons/fa";

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: 'var(--text-strong)',
  display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6,
};

export default function PushAgreement() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    clientId: "",
    fileUrl: "",
    expiryDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [file, setFile] = useState(null);
  const [focused, setFocused] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title || !form.clientId || !file) {
      setError("Title, Client ID, and file are required.");
      return;
    }

    try {
      setLoading(true);

      // 1. Upload file first
      const uploadedFileUrl = await uploadToCloudinary();

      // 2. Send agreement data with fileUrl
      await createAgreement({
        ...form,
        fileUrl: uploadedFileUrl,
      });

      setSuccess("Agreement pushed successfully.");
      setForm({
        title: "",
        description: "",
        clientId: "",
        fileUrl: "",
        expiryDate: "",
      });
      setFile(null);
    } catch (err) {
      setError(err.message || "Failed to push agreement.");
    } finally {
      setLoading(false);
    }
  };

  const uploadToCloudinary = async () => {
    if (!file) throw new Error("Please select a file");

    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > 10) {
      throw new Error("File size must be under 10MB");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      throw new Error("File upload failed");
    }

    const data = await res.json();
    return data.secure_url;
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
              <FaFileSignature size={16} color="var(--primary)" />
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

          <div style={{ padding: '18px 20px' }}>

            {/* Alerts */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--destructive-bg)', border: '1px solid var(--destructive-border)',
                borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 13, color: 'var(--destructive)',
              }}>
                <FaExclamationTriangle size={14} color="var(--destructive)" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--success)', border: '1px solid var(--success-border)',
                borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 13, color: 'var(--success-foreground)',
              }}>
                <FaCheckCircle size={14} color="var(--success-foreground)" style={{ flexShrink: 0 }} />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px 20px' }}>
                {/* Client ID */}
                <div>
                  <label style={labelStyle}>
                    <FaUserTie size={12} color="var(--accent)" /> Client User ID
                  </label>
                  <input
                    type="text" name="clientId" placeholder="Enter client user ID"
                    value={form.clientId} onChange={handleChange}
                    onFocus={() => setFocused('clientId')} onBlur={() => setFocused('')}
                    style={inputStyle('clientId')}
                  />
                </div>

                {/* Title */}
                <div>
                  <label style={labelStyle}>
                    <FaFileAlt size={12} color="var(--accent)" /> Agreement Title
                  </label>
                  <input
                    type="text" name="title" placeholder="Enter agreement title"
                    value={form.title} onChange={handleChange}
                    onFocus={() => setFocused('title')} onBlur={() => setFocused('')}
                    style={inputStyle('title')}
                  />
                </div>

                {/* Description (full width) */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    name="description" rows="3" placeholder="Optional description"
                    value={form.description} onChange={handleChange}
                    onFocus={() => setFocused('description')} onBlur={() => setFocused('')}
                    style={{ ...inputStyle('description'), resize: 'vertical' }}
                  />
                </div>

                {/* File Upload (full width) */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>
                    <FaFileUpload size={12} color="var(--accent)" /> Upload Agreement File
                  </label>
                  <div
                    onClick={() => fileInputRef.current.click()}
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
                      <FaFileAlt size={18} color="var(--primary)" />
                    </div>
                    {file ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </span>
                        <FaTimes size={13} color="var(--text-muted)" title="Remove file"
                          onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          style={{ cursor: 'pointer' }} />
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>Click to upload PDF</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Maximum file size 10MB</span>
                      </>
                    )}
                  </div>
                  <input type="file" accept=".pdf" ref={fileInputRef} hidden onChange={handleFileChange} />
                </div>

                {/* Expiry Date */}
                <div>
                  <label style={labelStyle}>
                    <FaCalendarAlt size={12} color="var(--accent)" /> Expiry Date
                  </label>
                  <input
                    type="date" name="expiryDate"
                    value={form.expiryDate} onChange={handleChange}
                    onFocus={() => setFocused('expiryDate')} onBlur={() => setFocused('')}
                    style={inputStyle('expiryDate')}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginTop: 22, padding: '12px 36px', borderRadius: 8, border: 'none',
                  background: 'var(--primary)', color: 'var(--primary-foreground)',
                  fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1,
                  transition: 'background .15s',
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--primary-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)'; }}
              >
                {loading
                  ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} /> Submitting…</>
                  : <>Push Agreement <FaArrowRight size={13} color="var(--primary-foreground)" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: var(--text-muted); opacity: 0.7; }
      `}</style>
    </>
  );
}