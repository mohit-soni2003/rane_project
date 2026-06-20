import React, { useState } from 'react';
import {
    FiFileText, FiUploadCloud, FiFile, FiX, FiSend,
    FiRefreshCw, FiLayers, FiHome, FiType, FiAlignLeft, FiCheckCircle
} from 'react-icons/fi';
import { uploadDocument } from '../../services/dfsService';
import { CLOUDINARY_URL, UPLOAD_PRESET } from '../../store/keyStore';
import ClientHeader from "../../component/header/ClientHeader";
import StaffHeader from "../../component/header/StaffHeader";
import { useAuthStore } from '../../store/authStore';

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

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
    fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block",
    marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em",
};
const controlStyle = {
    width: "100%", border: "1px solid var(--border)", borderRadius: 8,
    padding: "9px 12px", fontSize: 13.5, color: "var(--foreground)",
    background: "var(--input)", outline: "none", boxSizing: "border-box",
};
// Consistent card shadow — matches the header
const cardStyle = {
    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
    padding: "16px 18px", marginBottom: 14, boxShadow: "0 2px 8px var(--shadow-color)",
};

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

    const getHeaderComponent = () => {
        switch (user?.role) {
            case 'client': return <ClientHeader />;
            case 'staff': return <StaffHeader />;
            default: return <ClientHeader />;
        }
    };

    const activeSubFields = SUB_FIELD_CONFIG[documentType] || [];

    const progress = (() => {
        let s = 0;
        if (documentType) s += 20;
        if (department) s += 15;
        if (fileTitle.trim()) s += 20;
        if (description.trim()) s += 20;
        if (file) s += 25;
        return s;
    })();

    const handleDocTypeChange = (e) => {
        setDocumentType(e.target.value);
        setSubFields({});
    };
    const handleSubFieldChange = (key, value) =>
        setSubFields((prev) => ({ ...prev, [key]: value }));

    const setSelectedFile = (f) => {
        if (!f) return;
        if (f.type !== 'application/pdf') { alert("Only PDF files are accepted."); return; }
        if (f.size > 10 * 1024 * 1024) { alert("File exceeds the 10 MB limit."); return; }
        setFile(f);
    };

    const resetForm = () => {
        setFile(null); setFileTitle(''); setDescription('');
        setDocumentType(''); setDepartment(''); setSubFields({});
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) { alert("Please attach a PDF file."); return; }
        try {
            setLoading(true);
            const fileUrl = await uploadDocumentToCloudinary(file);
            const response = await uploadDocument({
                fileTitle, fileUrl,
                docType: documentType,
                Department: department,
                description,
                ...subFields,
            });
            alert("Document uploaded successfully!");
            console.log("Response:", response);
            resetForm();
        } catch (err) {
            alert("Upload failed: " + err.message);
        } finally {
            setLoading(false);
        }
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

    const fileSize = file
        ? (file.size / 1024 > 1024
            ? (file.size / 1048576).toFixed(1) + " MB"
            : Math.round(file.size / 1024) + " KB")
        : "";

    return (
        <>
            {getHeaderComponent()}

            <div style={{ padding: "0 2px", fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--foreground)" }}>

                {/* ── Page card (lifted, rounded, accent-topped — matches header) ── */}
                <div style={{
                    background: "var(--card)",
                    borderRadius: 14,
                    border: "1px solid var(--border)",
                    boxShadow: "0 2px 10px var(--shadow-color)",
                    overflow: "hidden",
                    marginBottom: 16,
                }}>



                    {/* ── Title bar ── */}
                    <div style={{
                        borderBottom: "1px solid var(--border)",
                        padding: "14px 20px", display: "flex", alignItems: "center",
                        justifyContent: "space-between", flexWrap: "wrap", gap: 10,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <FiUploadCloud size={16} color="var(--primary)" />
                            </div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>Upload Document</div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Submit a document into the forwarding & review workflow</div>
                            </div>
                        </div>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", padding: "4px 10px", background: "var(--muted)", borderRadius: 20, fontWeight: 600 }}>
                            <FiCheckCircle size={11} color="var(--accent)" /> {progress}% complete
                        </span>
                    </div>

                    {/* ── Form body ── */}
                    <div style={{ padding: "18px 20px" }}>

                        <form onSubmit={handleUpload}>

                            {/* Progress strip */}
                            <div style={{ height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden", marginBottom: 16 }}>
                                <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", borderRadius: 99, transition: "width .35s ease" }} />
                            </div>

                            {/* ── Document details card ── */}
                            <div style={cardStyle}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                                    <FiFileText size={14} color="var(--accent)" />
                                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-strong)" }}>Document details</span>
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                                    Categorise the document so it routes to the right reviewers.
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 12 }}>
                                    <div>
                                        <label style={labelStyle}><FiLayers size={11} style={{ marginRight: 4, verticalAlign: -1 }} />Document type *</label>
                                        <select value={documentType} onChange={handleDocTypeChange} required style={{ ...controlStyle, cursor: "pointer" }}>
                                            <option value="">Select type</option>
                                            {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}><FiHome size={11} style={{ marginRight: 4, verticalAlign: -1 }} />Department *</label>
                                        <select value={department} onChange={e => setDepartment(e.target.value)} required style={{ ...controlStyle, cursor: "pointer" }}>
                                            <option value="">Select department</option>
                                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={labelStyle}><FiType size={11} style={{ marginRight: 4, verticalAlign: -1 }} />Document title *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Q3 Commercial Invoice — Vendor XYZ"
                                        value={fileTitle}
                                        onChange={e => setFileTitle(e.target.value)}
                                        required
                                        style={controlStyle}
                                    />
                                </div>
                            </div>

                            {/* ── Conditional sub-fields card ── */}
                            {activeSubFields.length > 0 && (
                                <div style={{ ...cardStyle, borderLeft: "3px solid var(--accent)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                                        <span style={{ background: "var(--warning)", color: "var(--warning-foreground)", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                            {documentType}
                                        </span>
                                        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text-strong)" }}>Additional classification</span>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                                        {activeSubFields.map(field => (
                                            <div key={field.key}>
                                                <label style={labelStyle}>{field.label}</label>
                                                <select
                                                    value={subFields[field.key] || ""}
                                                    onChange={e => handleSubFieldChange(field.key, e.target.value)}
                                                    style={{ ...controlStyle, cursor: "pointer" }}
                                                >
                                                    <option value="">Select {field.label.toLowerCase()}</option>
                                                    {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Description card ── */}
                            <div style={cardStyle}>
                                <label style={labelStyle}><FiAlignLeft size={11} style={{ marginRight: 4, verticalAlign: -1 }} />Description *</label>
                                <textarea
                                    rows={3}
                                    placeholder="Briefly describe the document's purpose and any relevant context…"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    required
                                    style={{ ...controlStyle, resize: "vertical", minHeight: 84, lineHeight: 1.5 }}
                                />
                            </div>

                            {/* ── File upload card ── */}
                            <div style={cardStyle}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                                    <FiUploadCloud size={14} color="var(--accent)" />
                                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-strong)" }}>Attach file</span>
                                </div>

                                <label
                                    htmlFor="fileUpload"
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={e => { e.preventDefault(); setDragOver(false); setSelectedFile(e.dataTransfer.files[0]); }}
                                    style={{
                                        display: "block", textAlign: "center", cursor: "pointer",
                                        border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
                                        borderRadius: 10, padding: "26px 16px",
                                        background: dragOver ? "var(--secondary)" : "var(--muted)",
                                        transition: "border-color .2s, background .2s",
                                    }}
                                >
                                    <FiUploadCloud size={30} color="var(--muted-foreground)" style={{ marginBottom: 8 }} />
                                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--secondary-foreground)" }}>Tap to browse or drag & drop</div>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>PDF only · max 10 MB</div>
                                    <input
                                        type="file" id="fileUpload" accept=".pdf"
                                        onChange={e => setSelectedFile(e.target.files[0])}
                                        style={{ display: "none" }}
                                    />
                                </label>

                                {file && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 9, background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", marginTop: 10 }}>
                                        <FiFile size={17} color="var(--primary)" style={{ flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</span>
                                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{fileSize}</span>
                                        <FiX size={16} onClick={() => setFile(null)} style={{ cursor: "pointer", color: "var(--text-muted)", flexShrink: 0 }} />
                                    </div>
                                )}
                            </div>

                            {/* ── Actions ── */}
                            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                                <button
                                    type="button" onClick={resetForm} disabled={loading}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        padding: "9px 16px", borderRadius: 8, border: "1px solid var(--border)",
                                        background: "var(--secondary)", color: "var(--secondary-foreground)",
                                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                                    }}
                                >
                                    <FiX size={14} /> Clear form
                                </button>
                                <button
                                    type="submit" disabled={loading}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 7,
                                        padding: "9px 20px", borderRadius: 8, border: "none",
                                        background: "var(--primary)", color: "#fff",
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
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </>
    );
}