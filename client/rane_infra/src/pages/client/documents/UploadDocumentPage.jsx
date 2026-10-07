import React, { useState } from 'react';
import { FiUploadCloud, FiFile, FiX, FiSend, FiRefreshCw, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { uploadDocument } from '../../../services/dfsService';
import { CLOUDINARY_URL, UPLOAD_PRESET } from '../../../store/keyStore';
import ClientHeader from "../../../components/layout/header/ClientHeader";
import StaffHeader from "../../../components/layout/header/StaffHeader";
import { useAuthStore } from '../../../store/authStore';

// ── Sub-field config: single source of truth ─────────────────────────────────
const SUB_FIELD_CONFIG = {
    Invoices: [
        { key: "invoiceType", label: "Invoice type", options: ["IR Invoice", "Commercial Invoice", "Return Invoice", "Labour Invoice"] },
    ],
    Contract: [
        { key: "eAgreement", label: "E-agreement", options: ["Agreement Acceptance", "Agreement Modification", "Other"] },
        { key: "generalContractAndLabour", label: "General contract & labour", options: ["Labour", "Goods and Supply"] },
    ],
    Proposal: [
        { key: "proposalType", label: "Proposal type", options: ["New NS Item Proposal", "Vetted NS Item Proposal", "NS Under SORS", "Previous NS Query"] },
    ],
    Report: [
        { key: "employeeMeasurementBook", label: "Measurement book (EMB)", options: ["Recorded MB", "Finalised MB", "Pending MB"] },
        { key: "employeeReport", label: "Employee report", options: ["Document Report", "Tender Report", "Work Report", "Other"] },
    ],
};

const DOC_TYPES = ["Proposal", "Report", "Quotation/Estimate", "Contract", "Invoices", "Others"];
const DEPARTMENTS = ["Finance/Account", "Operations", "Executives", "Info-Technology"];

// Any common document, spreadsheet, presentation, image or archive
const ALLOWED_EXTENSIONS = [
    'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'txt',
    'png', 'jpg', 'jpeg', 'webp', 'zip',
];
const ACCEPT_ATTR = ALLOWED_EXTENSIONS.map(e => `.${e}`).join(',');
const MAX_SIZE_MB = 10;

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
    fontSize: 12, fontWeight: 600, color: "var(--text-strong)", display: "block", marginBottom: 6,
};
const controlStyle = {
    width: "100%", height: 40, border: "1px solid var(--border)", borderRadius: 10,
    padding: "0 12px", fontSize: 13.5, color: "var(--foreground)",
    background: "var(--input)", outline: "none", boxSizing: "border-box",
};

// Numbered step heading
const StepHeading = ({ number, title, hint }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{
            width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
            background: "var(--primary)", color: "var(--primary-foreground, #fff)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700,
        }}>{number}</span>
        <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>{title}</div>
            {hint && <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 1 }}>{hint}</div>}
        </div>
    </div>
);

export default function UploadDocumentPage() {
    const { user } = useAuthStore();

    const [fileTitle, setFileTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [documentType, setDocumentType] = useState('');
    const [department, setDepartment] = useState('');
    const [subFields, setSubFields] = useState({});
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' }); // success | error

    const getHeaderComponent = () => {
        switch (user?.role) {
            case 'client': return <ClientHeader />;
            case 'staff': return <StaffHeader />;
            default: return <ClientHeader />;
        }
    };

    const activeSubFields = SUB_FIELD_CONFIG[documentType] || [];

    const handleDocTypeChange = (e) => {
        setDocumentType(e.target.value);
        setSubFields({});
    };
    const handleSubFieldChange = (key, value) =>
        setSubFields((prev) => ({ ...prev, [key]: value }));

    const setSelectedFile = (f) => {
        if (!f) return;
        const ext = f.name.split('.').pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            setMessage({ type: 'error', text: 'This file type is not supported. Use PDF, Word, PowerPoint, Excel, an image, text or a zip file.' });
            return;
        }
        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
            setMessage({ type: 'error', text: `File exceeds the ${MAX_SIZE_MB} MB limit.` });
            return;
        }
        setMessage({ type: '', text: '' });
        setFile(f);
    };

    const resetForm = () => {
        setFile(null); setFileTitle(''); setDescription('');
        setDocumentType(''); setDepartment(''); setSubFields({});
    };

    const uploadDocumentToCloudinary = async (f) => {
        const formData = new FormData();
        formData.append('file', f);
        formData.append('upload_preset', UPLOAD_PRESET);
        const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Cloudinary upload failed');
        const data = await res.json();
        return data.secure_url;
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) { setMessage({ type: 'error', text: 'Please attach a file.' }); return; }
        try {
            setLoading(true);
            setMessage({ type: '', text: '' });
            const fileUrl = await uploadDocumentToCloudinary(file);
            await uploadDocument({
                fileTitle, fileUrl,
                docType: documentType,
                Department: department,
                description,
                ...subFields,
            });
            resetForm();
            setMessage({ type: 'success', text: 'Document uploaded successfully.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Upload failed: ' + err.message });
        } finally {
            setLoading(false);
        }
    };

    const fileSize = file
        ? (file.size / 1024 > 1024
            ? (file.size / 1048576).toFixed(1) + " MB"
            : Math.round(file.size / 1024) + " KB")
        : "";

    return (
        <>
            {getHeaderComponent()}

            <div style={{ padding: "0 2px", fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--foreground)", background: "var(--background)", minHeight: "100vh" }}>

                <div style={{
                    background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)",
                    boxShadow: "0 2px 10px var(--shadow-color)", overflow: "hidden", marginBottom: 16,
                }}>

                    {/* ── Title bar ── */}
                    <div style={{ borderBottom: "1px solid var(--border)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <FiUploadCloud size={16} color="var(--primary)" />
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>Upload Document</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Tell us what the document is, then attach your file</div>
                        </div>
                    </div>

                    <form onSubmit={handleUpload} style={{ padding: "20px 22px" }}>

                        {/* ── Status message ── */}
                        {message.text && (
                            <div style={{
                                display: "flex", alignItems: "center", gap: 8, marginBottom: 18,
                                padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                                background: message.type === 'success' ? "var(--success)" : "#fde8e6",
                                color: message.type === 'success' ? "var(--success-foreground)" : "#c94a3a",
                                border: `1px solid ${message.type === 'success' ? "var(--border)" : "#f5b8b2"}`,
                            }}>
                                {message.type === 'success' ? <FiCheckCircle size={15} /> : <FiAlertCircle size={15} />}
                                <span style={{ flex: 1 }}>{message.text}</span>
                                <FiX size={14} style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => setMessage({ type: '', text: '' })} />
                            </div>
                        )}

                        {/* ── Step 1: details ── */}
                        <StepHeading number="1" title="Document details" hint="So it reaches the right people" />

                        <div className="ud-grid">
                            <div className="ud-span-all">
                                <label htmlFor="doc-title" style={labelStyle}>Title <span style={{ color: "#c94a3a" }}>*</span></label>
                                <input
                                    id="doc-title" type="text"
                                    placeholder="e.g. Q3 Commercial Invoice — Vendor XYZ"
                                    value={fileTitle} onChange={e => setFileTitle(e.target.value)}
                                    required style={controlStyle}
                                />
                            </div>

                            <div>
                                <label htmlFor="doc-type" style={labelStyle}>Document type <span style={{ color: "#c94a3a" }}>*</span></label>
                                <select id="doc-type" value={documentType} onChange={handleDocTypeChange} required style={{ ...controlStyle, cursor: "pointer" }}>
                                    <option value="">Select type</option>
                                    {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="doc-dept" style={labelStyle}>Department <span style={{ color: "#c94a3a" }}>*</span></label>
                                <select id="doc-dept" value={department} onChange={e => setDepartment(e.target.value)} required style={{ ...controlStyle, cursor: "pointer" }}>
                                    <option value="">Select department</option>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            {/* Extra choices that appear for some document types */}
                            {activeSubFields.map(field => (
                                <div key={field.key}>
                                    <label htmlFor={`sub-${field.key}`} style={labelStyle}>{field.label}</label>
                                    <select
                                        id={`sub-${field.key}`}
                                        value={subFields[field.key] || ""}
                                        onChange={e => handleSubFieldChange(field.key, e.target.value)}
                                        style={{ ...controlStyle, cursor: "pointer" }}
                                    >
                                        <option value="">Select {field.label.toLowerCase()}</option>
                                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            ))}

                            <div className="ud-span-all">
                                <label htmlFor="doc-desc" style={labelStyle}>Description <span style={{ color: "#c94a3a" }}>*</span></label>
                                <textarea
                                    id="doc-desc" rows={3}
                                    placeholder="Briefly describe what this document is for…"
                                    value={description} onChange={e => setDescription(e.target.value)}
                                    required
                                    style={{ ...controlStyle, height: "auto", padding: "10px 12px", resize: "vertical", minHeight: 84, lineHeight: 1.5 }}
                                />
                            </div>
                        </div>

                        <div style={{ height: 1, background: "var(--border)", margin: "24px 0" }} />

                        {/* ── Step 2: file (at the bottom) ── */}
                        <StepHeading number="2" title="Attach your file" hint={`PDF, Word, PowerPoint, Excel, images, text or zip · up to ${MAX_SIZE_MB} MB`} />

                        {!file ? (
                            <label
                                htmlFor="fileUpload"
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={e => { e.preventDefault(); setDragOver(false); setSelectedFile(e.dataTransfer.files[0]); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                                    border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
                                    borderRadius: 12, padding: "16px 18px",
                                    background: dragOver ? "var(--secondary)" : "var(--muted)",
                                    transition: "border-color .2s, background .2s",
                                }}
                            >
                                <span style={{
                                    width: 44, height: 44, borderRadius: 10, background: "var(--card)", flexShrink: 0,
                                    border: "1px solid var(--border)", display: "inline-flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <FiUploadCloud size={20} color="var(--primary)" />
                                </span>
                                <span style={{ flex: 1, minWidth: 0 }}>
                                    <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--secondary-foreground)" }}>
                                        Drag &amp; drop your file here
                                    </span>
                                    <span style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                                        or click to browse your device
                                    </span>
                                </span>
                                <span style={{
                                    padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)",
                                    background: "var(--card)", color: "var(--text-strong)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
                                }}>
                                    Browse
                                </span>
                                <input
                                    type="file" id="fileUpload" accept={ACCEPT_ATTR}
                                    onChange={e => setSelectedFile(e.target.files[0])}
                                    style={{ display: "none" }}
                                />
                            </label>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
                                <span style={{
                                    width: 44, height: 44, borderRadius: 10, background: "var(--card)", flexShrink: 0,
                                    border: "1px solid var(--border)", display: "inline-flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <FiFile size={20} color="var(--primary)" />
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</div>
                                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 1 }}>{fileSize}</div>
                                </div>
                                <button type="button" onClick={() => setFile(null)} disabled={loading}
                                    style={{ border: "1px solid var(--border)", background: "var(--card)", color: "var(--text-strong)", borderRadius: 8, padding: "7px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                                    Change
                                </button>
                            </div>
                        )}

                        {/* ── Actions ── */}
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap", marginTop: 22 }}>
                            <button
                                type="button" onClick={resetForm} disabled={loading}
                                style={{
                                    padding: "10px 18px", borderRadius: 8, border: "1px solid var(--border)",
                                    background: "var(--secondary)", color: "var(--secondary-foreground)",
                                    fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                                }}
                            >
                                Clear
                            </button>
                            <button
                                type="submit" disabled={loading}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: 7,
                                    padding: "10px 22px", borderRadius: 8, border: "none",
                                    background: "var(--primary)", color: "var(--primary-foreground, #fff)",
                                    fontSize: 13, fontWeight: 600,
                                    cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading
                                    ? <><FiRefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Uploading…</>
                                    : <><FiSend size={14} /> Submit document</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                select option { background: var(--input); color: var(--foreground); }
                input:focus, select:focus, textarea:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(107, 62, 43, 0.14); }
                .ud-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
                .ud-span-all { grid-column: 1 / -1; }
                @media (max-width: 991px) { .ud-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
                @media (max-width: 575px) { .ud-grid { grid-template-columns: minmax(0, 1fr); } }
            `}</style>
        </>
    );
}
