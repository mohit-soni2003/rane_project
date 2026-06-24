import React, { useState, useRef, useEffect } from 'react';
import {
  FaProjectDiagram, FaBuilding, FaTrain, FaIndustry,
  FaMapMarkedAlt, FaFileContract, FaRupeeSign, FaCalendarAlt,
  FaFileUpload, FaFileAlt, FaFilePdf, FaTimes, FaCheckCircle, FaPlus,
} from 'react-icons/fa';
import { FiRefreshCw, FiSend, FiX } from 'react-icons/fi';
import { CLOUD_NAME, UPLOAD_PRESET, backend_url } from '../../store/keyStore';
import { useAuthStore } from '../../store/authStore';
import { createProject } from '../../services/project.service.js';

// ── Hardcoded icon colors (icons never inherit CSS vars reliably) ────────────
const C = {
  primary: '#6b3e2b',
  accent: '#b95a52',
  success: '#225b31',
  destructive: '#c94a3a',
  muted: '#8b7b74',
  warning: '#4a1f18',
};

// ── Enum options (values match the Mongoose schema exactly) ──────────────────
const PROJECT_TYPES = ['government', 'commercial', 'industrial', 'private', 'amc_work'];

const DEPARTMENTS = [
  'indian_railway', 'municipal_corporation', 'central_government',
  'state_government', 'smart_city', 'psu', 'defence',
  'airport_authority', 'private_sector', 'others',
];

const SUB_DEPARTMENTS = [
  'engineering', 'electrical', 'mechanical', 'signal_and_telecom',
  'commercial', 'medical', 'personnel', 'operating',
];

const CIRCLES = ['circle', 'zone', 'division'];

const PSU_NAMES = ['ntpc', 'ongc', 'iocl', 'gail', 'bhel', 'sail', 'nhpc'];

const DOCUMENT_TYPES = ['tender_document', 'loa', 'agreement', 'boq', 'drawings', 'nit'];

// Railway zones with readable names
const ZONES = {
  cr: 'Central Railway', wr: 'Western Railway', wcr: 'West Central Railway',
  ncr: 'North Central Railway', nr: 'Northern Railway', nwr: 'North Western Railway',
  ner: 'North Eastern Railway', nfr: 'Northeast Frontier Railway', er: 'Eastern Railway',
  ecr: 'East Central Railway', ecor: 'East Coast Railway', ser: 'South Eastern Railway',
  secr: 'South East Central Railway', sr: 'Southern Railway', scr: 'South Central Railway',
  swr: 'South Western Railway', krcl: 'Konkan Railway', mrk: 'Metro Railway Kolkata',
};

// Turn snake_case enum values into readable labels.
const prettify = (v) =>
  v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ── Shared styles (mirrors the sample component) ─────────────────────────────
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block',
  marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
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

const EMPTY_FORM = {
  projectId: '', projectName: '', description: '', projectType: '', category: '',
  clientName: '', department: '',
  subDepartment: '', zone: '', circle: '', division: '', psuName: '',
  tenderNo: '', loaNo: '', agreementNo: '',
  estimatedCost: '', projectCost: '', paidAmount: '',
  startDate: '', estimatedCompletionDate: '',
};

const EMPTY_LOCATION = { state: '', city: '', siteAddress: '', district: '', pincode: '' };

export default function CreateProject() {
  const { user } = useAuthStore();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [location, setLocation] = useState(EMPTY_LOCATION);
  const [documents, setDocuments] = useState([]);

  const [docFile, setDocFile] = useState(null);
  const [docType, setDocType] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const docInputRef = useRef();

  const isRailway = formData.department === 'indian_railway';
  const isPsu = formData.department === 'psu';

  // Progress — required fields only: projectId, projectName, projectType, department
  const progress = (() => {
    let s = 0;
    if (formData.projectId.trim()) s += 25;
    if (formData.projectName.trim()) s += 25;
    if (formData.projectType) s += 25;
    if (formData.department) s += 25;
    return Math.min(s, 100);
  })();

  // Auto-computed, read-only
  const pendingAmount = Math.max(
    (Number(formData.projectCost) || 0) - (Number(formData.paidAmount) || 0),
    0,
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocation((prev) => ({ ...prev, [name]: value }));
  };

  // Reset railway/PSU fields when department changes so we never send stale values.
  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    setFormData((prev) => ({
      ...prev,
      department,
      subDepartment: '', zone: '', circle: '', division: '', psuName: '',
    }));
  };

  // ── Cloudinary upload ──────────────────────────────────────────────────────
  const uploadToCloudinary = async (f) => {
    const cloudFormData = new FormData();
    cloudFormData.append('file', f);
    cloudFormData.append('upload_preset', UPLOAD_PRESET);
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
    const res = await fetch(url, { method: 'POST', body: cloudFormData });
    if (!res.ok) throw new Error('Failed to upload file to Cloudinary');
    const data = await res.json();
    return data.secure_url;
  };

  const handleDocFileSelect = (f) => {
    if (!f) return;
    if (f.size / 1024 / 1024 > 10) {
      setMessage({ type: 'error', text: 'File size exceeds the 10 MB limit.' });
      return;
    }
    setDocFile(f);
    setMessage({ type: '', text: '' });
  };

  const handleAddDocument = async () => {
    if (!docFile) {
      setMessage({ type: 'warning', text: 'Choose a file before adding the document.' });
      return;
    }
    if (!docType) {
      setMessage({ type: 'warning', text: 'Select a document type before adding.' });
      return;
    }
    setUploadingDoc(true);
    setMessage({ type: '', text: '' });
    try {
      const url = await uploadToCloudinary(docFile);
      setDocuments((prev) => [
        ...prev,
        { name: docFile.name, url, documentType: docType },
      ]);
      setDocFile(null);
      setDocType('');
      if (docInputRef.current) docInputRef.current.value = '';
    } catch (err) {
      setMessage({ type: 'error', text: 'Upload failed: ' + err.message });
    } finally {
      setUploadingDoc(false);
    }
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Build a clean payload (omit blanks, cast numbers) ────────────────────────
  const buildPayload = () => {
    const payload = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) return;
      payload[k] = v;
    });

    // Numbers
    ['estimatedCost', 'projectCost', 'paidAmount'].forEach((k) => {
      if (payload[k] !== undefined) payload[k] = Number(payload[k]);
    });
    payload.pendingAmount = pendingAmount;

    // Location (only non-empty fields)
    const loc = {};
    Object.entries(location).forEach(([k, v]) => {
      if (v && v.trim()) loc[k] = v.trim();
    });
    if (Object.keys(loc).length) payload.location = loc;

    // Documents
    if (documents.length) payload.documents = documents;

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = buildPayload();
      await createProject(payload);
      handleClear();
      setMessage({ type: 'success', text: 'Project created successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Creation failed: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData(EMPTY_FORM);
    setLocation(EMPTY_LOCATION);
    setDocuments([]);
    setDocFile(null);
    setDocType('');
    setMessage({ type: '', text: '' });
  };

  // ── Message banner ───────────────────────────────────────────────────────
  const MessageBanner = () => {
    if (!message.text) return null;
    const isSuccess = message.type === 'success';
    const isWarning = message.type === 'warning';
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 14px', borderRadius: 8, marginBottom: 14,
        background: isSuccess ? 'var(--success)' : isWarning ? 'var(--warning)' : 'var(--destructive-bg)',
        border: `1px solid ${isSuccess ? 'var(--success-border)' : isWarning ? 'var(--warning-border)' : 'var(--destructive-border)'}`,
        fontSize: 13, color: isSuccess ? C.success : isWarning ? C.warning : C.destructive,
      }}>
        {isSuccess
          ? <FaCheckCircle size={14} color={C.success} style={{ marginTop: 1, flexShrink: 0 }} />
          : <FaTimes size={14} color={isWarning ? C.warning : C.destructive} style={{ marginTop: 1, flexShrink: 0 }} />}
        <span style={{ flex: 1 }}>{message.text}</span>
        <FaTimes
          size={12} color={C.muted}
          style={{ cursor: 'pointer', marginTop: 1, flexShrink: 0 }}
          onClick={() => setMessage({ type: '', text: '' })}
        />
      </div>
    );
  };

  const docFileSize = docFile
    ? docFile.size / 1024 > 1024
      ? (docFile.size / 1048576).toFixed(1) + ' MB'
      : Math.round(docFile.size / 1024) + ' KB'
    : '';

  return (
    <div style={{
      padding: '0 2px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'var(--foreground)',
      background: 'var(--background)',
      minHeight: '100vh',
    }}>

      {/* ── Page card ── */}
      <div style={{
        background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)',
        boxShadow: '0 2px 10px var(--shadow-color)', overflow: 'hidden', marginBottom: 16,
      }}>

        {/* ── Title bar ── */}
        <div style={{
          borderBottom: '1px solid var(--border)', padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FaProjectDiagram size={16} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                Create Project
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                Enter the work allocation details for a new project
              </div>
            </div>
          </div>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
            color: 'var(--text-muted)', padding: '4px 10px', background: 'var(--muted)',
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
              height: '100%', width: `${progress}%`, background: 'var(--accent)',
              borderRadius: 99, transition: 'width .35s ease',
            }} />
          </div>

          <MessageBanner />

          <form onSubmit={handleSubmit}>

            {/* ── Basic information ── */}
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <FaProjectDiagram size={14} color={C.accent} />
                <span style={sectionTitleStyle}>Basic information</span>
              </div>
              <p style={sectionSubtitleStyle}>Identify the project and the kind of work involved.</p>

              <div style={{ ...gridTwo, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Project ID *</label>
                  <input
                    type="text" name="projectId" value={formData.projectId}
                    onChange={handleChange} placeholder="e.g. RNS-2026-0042" required
                    style={controlStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Project name *</label>
                  <input
                    type="text" name="projectName" value={formData.projectName}
                    onChange={handleChange} placeholder="e.g. Platform shelter upgrade" required
                    style={controlStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Project type *</label>
                  <select
                    name="projectType" value={formData.projectType} onChange={handleChange}
                    required style={{ ...controlStyle, cursor: 'pointer' }}
                  >
                    <option value="">Select type</option>
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>{prettify(t)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Category <span style={optionalTagStyle}>Optional</span></label>
                  <input
                    type="text" name="category" value={formData.category}
                    onChange={handleChange} placeholder="e.g. Civil works" style={controlStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description <span style={optionalTagStyle}>Optional</span></label>
                <textarea
                  name="description" rows={3} value={formData.description}
                  onChange={handleChange} placeholder="Brief description of the project scope…"
                  style={{ ...controlStyle, resize: 'vertical', minHeight: 84, lineHeight: 1.5 }}
                />
              </div>
            </div>

            {/* ── Client & department ── */}
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <FaBuilding size={14} color={C.accent} />
                <span style={sectionTitleStyle}>Client & department</span>
              </div>
              <p style={sectionSubtitleStyle}>Who the work is for and which government body it belongs to.</p>

              <div style={gridTwo}>
                <div>
                  <label style={labelStyle}>Client name <span style={optionalTagStyle}>Optional</span></label>
                  <input
                    type="text" name="clientName" value={formData.clientName}
                    onChange={handleChange} placeholder="e.g. Western Railway" style={controlStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Department *</label>
                  <select
                    name="department" value={formData.department} onChange={handleDepartmentChange}
                    required style={{ ...controlStyle, cursor: 'pointer' }}
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{prettify(d)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Railway details (conditional) ── */}
            {isRailway && (
              <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                  <FaTrain size={14} color={C.accent} />
                  <span style={sectionTitleStyle}>Railway details</span>
                </div>
                <p style={sectionSubtitleStyle}>Zone is required for Indian Railway projects.</p>

                <div style={gridTwo}>
                  <div>
                    <label style={labelStyle}>Zone *</label>
                    <select
                      name="zone" value={formData.zone} onChange={handleChange}
                      style={{ ...controlStyle, cursor: 'pointer' }}
                    >
                      <option value="">Select zone</option>
                      {Object.entries(ZONES).map(([code, name]) => (
                        <option key={code} value={code}>{`${name} (${code.toUpperCase()})`}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Sub-department <span style={optionalTagStyle}>Optional</span></label>
                    <select
                      name="subDepartment" value={formData.subDepartment} onChange={handleChange}
                      style={{ ...controlStyle, cursor: 'pointer' }}
                    >
                      <option value="">Select sub-department</option>
                      {SUB_DEPARTMENTS.map((s) => (
                        <option key={s} value={s}>{prettify(s)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Circle level <span style={optionalTagStyle}>Optional</span></label>
                    <select
                      name="circle" value={formData.circle} onChange={handleChange}
                      style={{ ...controlStyle, cursor: 'pointer' }}
                    >
                      <option value="">Select level</option>
                      {CIRCLES.map((c) => (
                        <option key={c} value={c}>{prettify(c)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Division <span style={optionalTagStyle}>Optional</span></label>
                    <input
                      type="text" name="division" value={formData.division}
                      onChange={handleChange} placeholder="e.g. Ratlam Division" style={controlStyle}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── PSU details (conditional) ── */}
            {isPsu && (
              <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                  <FaIndustry size={14} color={C.accent} />
                  <span style={sectionTitleStyle}>PSU details</span>
                </div>
                <p style={sectionSubtitleStyle}>Name the public-sector undertaking this work is for.</p>

                <div style={gridTwo}>
                  <div>
                    <label style={labelStyle}>PSU name *</label>
                    <select
                      name="psuName" value={formData.psuName} onChange={handleChange}
                      style={{ ...controlStyle, cursor: 'pointer' }}
                    >
                      <option value="">Select PSU</option>
                      {PSU_NAMES.map((p) => (
                        <option key={p} value={p}>{p.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Location ── */}
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <FaMapMarkedAlt size={14} color={C.accent} />
                <span style={sectionTitleStyle}>Location</span>
              </div>
              <p style={sectionSubtitleStyle}>Where the work will be carried out.</p>

              <div style={{ ...gridTwo, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>State <span style={optionalTagStyle}>Optional</span></label>
                  <input type="text" name="state" value={location.state}
                    onChange={handleLocationChange} placeholder="e.g. Madhya Pradesh" style={controlStyle} />
                </div>
                <div>
                  <label style={labelStyle}>City <span style={optionalTagStyle}>Optional</span></label>
                  <input type="text" name="city" value={location.city}
                    onChange={handleLocationChange} placeholder="e.g. Indore" style={controlStyle} />
                </div>
                <div>
                  <label style={labelStyle}>District <span style={optionalTagStyle}>Optional</span></label>
                  <input type="text" name="district" value={location.district}
                    onChange={handleLocationChange} placeholder="e.g. Indore" style={controlStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Pincode <span style={optionalTagStyle}>Optional</span></label>
                  <input type="text" name="pincode" value={location.pincode}
                    onChange={handleLocationChange} placeholder="e.g. 452001" style={controlStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Site address <span style={optionalTagStyle}>Optional</span></label>
                <textarea name="siteAddress" rows={2} value={location.siteAddress}
                  onChange={handleLocationChange} placeholder="Full site address…"
                  style={{ ...controlStyle, resize: 'vertical', minHeight: 60, lineHeight: 1.5 }} />
              </div>
            </div>

            {/* ── Tender details ── */}
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <FaFileContract size={14} color={C.accent} />
                <span style={sectionTitleStyle}>Tender details</span>
              </div>
              <p style={sectionSubtitleStyle}>Reference numbers for the tender, LOA, and agreement.</p>

              <div style={gridTwo}>
                <div>
                  <label style={labelStyle}>Tender no. <span style={optionalTagStyle}>Optional</span></label>
                  <input type="text" name="tenderNo" value={formData.tenderNo}
                    onChange={handleChange} placeholder="e.g. TND-2026-118" style={controlStyle} />
                </div>
                <div>
                  <label style={labelStyle}>LOA no. <span style={optionalTagStyle}>Optional</span></label>
                  <input type="text" name="loaNo" value={formData.loaNo}
                    onChange={handleChange} placeholder="e.g. LOA-2026-044" style={controlStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Agreement no. <span style={optionalTagStyle}>Optional</span></label>
                  <input type="text" name="agreementNo" value={formData.agreementNo}
                    onChange={handleChange} placeholder="e.g. AGR-2026-077" style={controlStyle} />
                </div>
              </div>
            </div>

            {/* ── Financial details ── */}
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <FaRupeeSign size={14} color={C.accent} />
                <span style={sectionTitleStyle}>Financial details</span>
              </div>
              <p style={sectionSubtitleStyle}>Estimated and contracted amounts. Pending is calculated automatically.</p>

              <div style={gridTwo}>
                <div>
                  <label style={labelStyle}>Estimated cost (₹) <span style={optionalTagStyle}>Optional</span></label>
                  <input type="number" name="estimatedCost" value={formData.estimatedCost}
                    onChange={handleChange} placeholder="0" min="0" style={controlStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Project cost (₹) <span style={optionalTagStyle}>Optional</span></label>
                  <input type="number" name="projectCost" value={formData.projectCost}
                    onChange={handleChange} placeholder="0" min="0" style={controlStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Paid amount (₹) <span style={optionalTagStyle}>Optional</span></label>
                  <input type="number" name="paidAmount" value={formData.paidAmount}
                    onChange={handleChange} placeholder="0" min="0" style={controlStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Pending amount (₹)</label>
                  <input type="text" value={pendingAmount.toLocaleString('en-IN')} readOnly
                    style={{ ...controlStyle, background: 'var(--muted)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                </div>
              </div>
            </div>

            {/* ── Timeline ── */}
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <FaCalendarAlt size={14} color={C.accent} />
                <span style={sectionTitleStyle}>Timeline</span>
              </div>
              <p style={sectionSubtitleStyle}>Planned start and estimated completion dates.</p>

              <div style={gridTwo}>
                <div>
                  <label style={labelStyle}>Start date <span style={optionalTagStyle}>Optional</span></label>
                  <input type="date" name="startDate" value={formData.startDate}
                    onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }} />
                </div>
                <div>
                  <label style={labelStyle}>Estimated completion <span style={optionalTagStyle}>Optional</span></label>
                  <input type="date" name="estimatedCompletionDate" value={formData.estimatedCompletionDate}
                    onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }} />
                </div>
              </div>
            </div>

            {/* ── Documents ── */}
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <FaFileUpload size={14} color={C.accent} />
                <span style={sectionTitleStyle}>Documents</span>
              </div>
              <p style={sectionSubtitleStyle}>Attach tender, LOA, agreement, BOQ, drawings, or NIT files (max 10 MB each).</p>

              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Document type</label>
                <select
                  value={docType} onChange={(e) => setDocType(e.target.value)}
                  style={{ ...controlStyle, cursor: 'pointer' }}
                >
                  <option value="">Select document type</option>
                  {DOCUMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{prettify(t)}</option>
                  ))}
                </select>
              </div>

              <label
                htmlFor="projectDocUpload"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleDocFileSelect(e.dataTransfer.files[0]); }}
                style={{
                  display: 'block', textAlign: 'center', cursor: 'pointer',
                  border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '22px 16px',
                  background: dragOver ? 'var(--secondary)' : 'var(--muted)',
                  transition: 'border-color .2s, background .2s',
                }}
              >
                <FaFileUpload size={26} color={C.muted} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--secondary-foreground)' }}>
                  Tap to browse or drag &amp; drop
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                  PDF, JPG, PNG · max 10 MB
                </div>
                <input
                  type="file" id="projectDocUpload" accept=".pdf,.jpg,.jpeg,.png"
                  ref={docInputRef}
                  onChange={(e) => handleDocFileSelect(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </label>

              {docFile && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  background: 'var(--secondary)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '9px 12px', marginTop: 10,
                }}>
                  <FaFilePdf size={17} color={C.accent} style={{ flexShrink: 0 }} />
                  <span style={{
                    fontSize: 13, fontWeight: 500, color: 'var(--foreground)', flex: 1,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {docFile.name}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{docFileSize}</span>
                  <FiX size={16} onClick={() => setDocFile(null)}
                    style={{ cursor: 'pointer', color: C.muted, flexShrink: 0 }} />
                </div>
              )}

              <button
                type="button" onClick={handleAddDocument} disabled={uploadingDoc}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginTop: 10,
                  padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                  fontSize: 13, fontWeight: 600, cursor: uploadingDoc ? 'not-allowed' : 'pointer',
                  opacity: uploadingDoc ? 0.7 : 1,
                }}
              >
                {uploadingDoc
                  ? <><FiRefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Uploading…</>
                  : <><FaPlus size={12} /> Add document</>}
              </button>

              {/* Added documents list */}
              {documents.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {documents.map((doc, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      background: 'var(--input)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '8px 12px',
                    }}>
                      <FaFileAlt size={15} color={C.accent} style={{ flexShrink: 0 }} />
                      <span style={{
                        fontSize: 13, fontWeight: 500, color: 'var(--foreground)', flex: 1,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {doc.name}
                      </span>
                      <span style={{
                        fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)',
                        background: 'var(--muted)', border: '1px solid var(--border)',
                        borderRadius: 20, padding: '2px 8px',
                      }}>
                        {prettify(doc.documentType)}
                      </span>
                      <FiX size={15} onClick={() => removeDocument(i)}
                        style={{ cursor: 'pointer', color: C.muted, flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Actions ── */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button" onClick={handleClear} disabled={submitting}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
                  borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <FiX size={14} /> Clear form
              </button>
              <button
                type="submit" disabled={submitting}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px',
                  borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff',
                  fontSize: 13, fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting
                  ? <><FiRefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Creating…</>
                  : <><FiSend size={14} /> Create project</>}
              </button>
            </div>

          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 0.4; }
        select option { background: var(--input); color: var(--foreground); }
      `}</style>
    </div>
  );
}