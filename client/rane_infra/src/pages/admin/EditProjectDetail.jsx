import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    FaProjectDiagram, FaMapMarkedAlt, FaSitemap, FaRupeeSign,
    FaFileAlt, FaUserShield, FaClipboardCheck, FaTimesCircle,
    FaTrain, FaIndustry, FaSave, FaPlus, FaPaperPlane, FaExternalLinkAlt,
    FaBoxes, FaTrash, FaTasks, FaUserCircle, FaUsers, FaCheckCircle, FaShieldAlt,
    FaChevronRight, FaSearch, FaGavel, FaLandmark, FaExclamationTriangle, FaPiggyBank,
    FaCalendarAlt,
} from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import { CLOUD_NAME, UPLOAD_PRESET } from '../../store/keyStore';
import {
    getProjectById,
    updateBasicDetails,
    updateLocation,
    updateAdvanceDetails,
    updateFinancials,
    updateProjectStatus,
    addProjectDocument,
    deleteProjectDocument,
    getUsersList,
    forwardProject,
    addItems,
    getProjectItems,
    updateBiddingDetails,
    addCostEstimation,
    updatePgDetails,
    updatePenaltyDetails,
    updateSecurityDepositDetails,
    addSecurityDepositCust,
    updateTimeline,
} from '../../services/project.service.js';
import { getTasksByProject, createTask } from '../../services/task.service.js';

const C = {
    primary: '#6b3e2b',
    accent: '#b95a52',
    success: '#225b31',
    destructive: '#c94a3a',
    muted: '#8b7b74',
};

/* ── enum option lists (must match Project schema exactly) ──────────────── */

const PROJECT_TYPES = ['government', 'commercial', 'industrial', 'private', 'amc_work'];
const TENDER_TYPES = ['open', 'limited', 'single', 'nomination'];
const DEPARTMENTS = [
    'indian_railway', 'municipal_corporation', 'central_government',
    'state_government', 'smart_city', 'psu', 'defence',
    'airport_authority', 'private_sector', 'others',
];
const CONTRACT_TYPES = ['work', 'goods', 'supply'];
const BIDDING_TYPES = ['normal_tender', 'special_tender', 'limited_tender'];
const EXPENDITURE_TYPES = ['capital', 'revenue'];
const RANKING_ORDERS = ['low_to_high', 'high_to_low'];
const BIDDING_SYSTEM_OPTIONS = ['single_packet', 'double_packet'];
const SUB_DEPARTMENTS = [
    'engineering', 'electrical', 'mechanical', 'signal_and_telecom',
    'commercial', 'medical', 'personnel', 'operating',
];
const CIRCLES = ['circle', 'zone', 'division'];
const ZONES = ['cr', 'wr', 'wcr', 'ncr', 'nr', 'nwr', 'ner', 'nfr', 'er', 'ecr', 'ecor', 'ser', 'secr', 'sr', 'scr', 'swr', 'krcl', 'mrk'];
const PSU_NAMES = ['ntpc', 'ongc', 'iocl', 'gail', 'bhel', 'sail', 'nhpc'];
const BIDDING_POSITIONS = ['below', 'above', 'at_par'];
const DOCUMENT_TYPES = ['tender_document', 'loa', 'agreement', 'boq', 'drawings', 'nit'];
const PROJECT_STATUSES = ['draft', 'in_progress', 'pending', 'L1', 'L2', 'L3', 'not_allotted', 'alloted', 'completed'];
const FORWARD_ACTIONS = ['approved', 'returned', 'rejected', 'pending'];

// Unit options — matches the Item schema's unit enum
const UNIT_OPTIONS = ['Each', 'Meter', 'Set', 'Rmt', 'kg'];

// Matches the Project schema's projectUnder enum
const PROJECT_UNDER_OPTIONS = ['company', 'firm'];

const prettify = (v) =>
    typeof v === 'string' ? v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

const toAbsoluteUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('//')) return `https:${url}`;
    return `https://${url}`;
};

/* ── shared styles ────────────────────────────────────────────────────────── */

const moduleCardStyle = {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
    marginBottom: 14, boxShadow: '0 2px 8px var(--shadow-color)', overflow: 'hidden',
};

const moduleBodyStyle = { padding: '16px 18px' };

const sectionHeaderStyle = {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
    fontWeight: 700, fontSize: 13, color: 'var(--text-strong)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
};

const subHeaderStyle = {
    display: 'flex', alignItems: 'center', gap: 7, margin: '16px 0 10px',
    fontWeight: 700, fontSize: 12, color: 'var(--text-strong)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
};

const gridTwo = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px 18px',
};

const labelStyle = {
    fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block',
    marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
};

const controlStyle = {
    width: '100%', border: '1px solid var(--border)', borderRadius: 8,
    padding: '9px 12px', fontSize: 13.5, color: 'var(--foreground)',
    background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
};

const disabledControlStyle = {
    ...controlStyle, background: 'var(--muted)', color: 'var(--text-muted)', cursor: 'not-allowed',
};

const saveButtonStyle = (busy) => ({
    display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8,
    border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 600,
    cursor: busy ? 'not-allowed' : 'pointer', marginTop: 16, opacity: busy ? 0.7 : 1,
});

const secondaryButtonStyle = {
    display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)',
    fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
};

const badgeStyle = (bg, fg) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
    background: bg, color: fg, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap',
});

const subCardStyle = {
    background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 8,
    padding: '12px 14px', marginBottom: 10,
};

const savedTag = {
    display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600,
    color: C.success, marginLeft: 12,
};

const errorTag = {
    display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600,
    color: C.destructive, marginLeft: 12,
};

// Materials table styles
const tableWrapStyle = { overflowX: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 950 };
const thStyle = {
    textAlign: 'left', padding: '8px 8px', fontSize: 10.5, fontWeight: 700,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em',
    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
};
const thRightStyle = { ...thStyle, textAlign: 'right' };
const tdStyle = { padding: '6px 8px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' };
const cellInputStyle = {
    ...controlStyle, padding: '6px 8px', fontSize: 12.5, minWidth: 80,
};
const cellInputWideStyle = { ...cellInputStyle, minWidth: 140 };
const totalRowStyle = { fontWeight: 700, color: 'var(--text-strong)', background: 'var(--input)' };

function Field({ label, htmlFor, children }) {
    return (
        <div>
            <label htmlFor={htmlFor} style={labelStyle}>{label}</label>
            {children}
        </div>
    );
}

// A "module" = one independent, self-contained card for a section —
// each owns its own local edit state and calls its own service directly,
// so sections update independently without touching one another.
function Module({ id, icon, title, extra, children }) {
    return (
        <div id={id} style={moduleCardStyle}>
            <div style={moduleBodyStyle}>
                <div style={{ ...sectionHeaderStyle, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {icon}
                        <span>{title}</span>
                    </div>
                    {extra}
                </div>
                {children}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 1 — Basic Details → PATCH /v1/basic-details/:projectId
   ══════════════════════════════════════════════════════════════════════════ */
function BasicDetailsModule({ project, onUpdated }) {
    const [form, setForm] = useState({
        projectName: project.projectName || '',
        description: project.description || '',
        projectUnder: project.projectUnder || '',
        tenderClosingDate: project.tenderClosingDate ? project.tenderClosingDate.slice(0, 10) : '',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setSaved(false);
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            const updated = await updateBasicDetails(project._id, form);
            onUpdated(updated);
            setSaved(true);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Module id="basic" icon={<FaProjectDiagram size={13} color={C.accent} />} title="Basic Details">
            <div style={gridTwo}>
                <Field label="Project ID">
                    <input type="text" value={project.projectId || ''} disabled style={disabledControlStyle} />
                </Field>
                <Field label="Project name" htmlFor="projectName">
                    <input
                        id="projectName" type="text" name="projectName" value={form.projectName}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
                <Field label="Project under" htmlFor="projectUnder">
                    <select
                        id="projectUnder" name="projectUnder" value={form.projectUnder}
                        onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}
                    >
                        <option value="">Select</option>
                        {PROJECT_UNDER_OPTIONS.map((o) => <option key={o} value={o}>{prettify(o)}</option>)}
                    </select>
                </Field>
                <Field label="Tender closing date" htmlFor="tenderClosingDate">
                    <input
                        id="tenderClosingDate" type="date" name="tenderClosingDate" value={form.tenderClosingDate}
                        onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}
                    />
                </Field>
            </div>
            <div style={{ marginTop: 12 }}>
                <Field label="Description" htmlFor="description">
                    <textarea
                        id="description" name="description" rows={3} value={form.description}
                        onChange={handleChange} style={{ ...controlStyle, resize: 'vertical' }}
                    />
                </Field>
            </div>
            <button onClick={handleSave} disabled={saving} style={saveButtonStyle(saving)}>
                <FaSave size={12} /> {saving ? 'Saving…' : 'Save basic details'}
            </button>
            {saved && <span style={savedTag}>Saved</span>}
            {error && <span style={errorTag}>{error}</span>}
        </Module>
    );
}

/* ── Indian states & union territories ───────────────────────────────────── */

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
    'Ladakh', 'Lakshadweep', 'Puducherry',
];

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 2 — Location Details → PATCH /v1/location/:projectId
   ══════════════════════════════════════════════════════════════════════════ */
function LocationModule({ project, onUpdated }) {
    const [form, setForm] = useState({
        state: project.location?.state || '',
        city: project.location?.city || '',
        district: project.location?.district || '',
        pincode: project.location?.pincode || '',
        siteAddress: project.location?.siteAddress || '',
    });

    // NEW: headquarter location — same shape as location above, kept as
    // its own form state since it's a separate field on the project.
    const [hqForm, setHqForm] = useState({
        state: project.headquarterLocation?.state || '',
        city: project.headquarterLocation?.city || '',
        district: project.headquarterLocation?.district || '',
        pincode: project.headquarterLocation?.pincode || '',
        siteAddress: project.headquarterLocation?.siteAddress || '',
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setSaved(false);
        setError('');
    };

    const handleHqChange = (e) => {
        setHqForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setSaved(false);
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            const updated = await updateLocation(project._id, form, hqForm);
            onUpdated(updated);
            setSaved(true);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Module id="location" icon={<FaMapMarkedAlt size={13} color={C.accent} />} title="Location">
            <div style={subHeaderStyle}>Site location</div>
            <div style={gridTwo}>
                <Field label="State" htmlFor="state">
                    <select
                        id="state" name="state" value={form.state}
                        onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}
                    >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </Field>
                <Field label="City" htmlFor="city">
                    <input id="city" type="text" name="city" value={form.city} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="District" htmlFor="district">
                    <input id="district" type="text" name="district" value={form.district} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="Pincode" htmlFor="pincode">
                    <input id="pincode" type="text" name="pincode" value={form.pincode} onChange={handleChange} style={controlStyle} />
                </Field>
            </div>
            <div style={{ marginTop: 12 }}>
                <Field label="Site address" htmlFor="siteAddress">
                    <textarea
                        id="siteAddress" name="siteAddress" rows={2} value={form.siteAddress}
                        onChange={handleChange} style={{ ...controlStyle, resize: 'vertical' }}
                    />
                </Field>
            </div>

            {/* NEW: headquarter location — same field set as site location */}
            <div style={subHeaderStyle}>Headquarter location</div>
            <div style={gridTwo}>
                <Field label="State" htmlFor="hqState">
                    <select
                        id="hqState" name="state" value={hqForm.state}
                        onChange={handleHqChange} style={{ ...controlStyle, cursor: 'pointer' }}
                    >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </Field>
                <Field label="City" htmlFor="hqCity">
                    <input id="hqCity" type="text" name="city" value={hqForm.city} onChange={handleHqChange} style={controlStyle} />
                </Field>
                <Field label="District" htmlFor="hqDistrict">
                    <input id="hqDistrict" type="text" name="district" value={hqForm.district} onChange={handleHqChange} style={controlStyle} />
                </Field>
                <Field label="Pincode" htmlFor="hqPincode">
                    <input id="hqPincode" type="text" name="pincode" value={hqForm.pincode} onChange={handleHqChange} style={controlStyle} />
                </Field>
            </div>
            <div style={{ marginTop: 12 }}>
                <Field label="Site address" htmlFor="hqSiteAddress">
                    <textarea
                        id="hqSiteAddress" name="siteAddress" rows={2} value={hqForm.siteAddress}
                        onChange={handleHqChange} style={{ ...controlStyle, resize: 'vertical' }}
                    />
                </Field>
            </div>

            <button onClick={handleSave} disabled={saving} style={saveButtonStyle(saving)}>
                <FaSave size={12} /> {saving ? 'Saving…' : 'Save location'}
            </button>
            {saved && <span style={savedTag}>Saved</span>}
            {error && <span style={errorTag}>{error}</span>}
        </Module>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 3 — Advance Project Details → PATCH /v1/advance-details/:projectId
   ══════════════════════════════════════════════════════════════════════════ */
function AdvanceDetailsModule({ project, onUpdated }) {
    const [form, setForm] = useState({
        projectType: project.projectType || '',
        tenderType: project.tenderType || '',
        department: project.department || '',
        contractType: project.contractType || '',
        biddingType: project.biddingType || '',
        expenditureType: project.expenditureType || '',
        rankingOrderForBid: project.rankingOrderForBid || '',
        biddingSystem: project.biddingSystem || '',
        currentDateOfCompletion: project.currentDateOfCompletion ? project.currentDateOfCompletion.slice(0, 10) : '',
        zone: project.zone || '',
        subDepartment: project.subDepartment || '',
        circle: project.circle || '',
        division: project.division || '',
        psuName: project.psuName || '',
        // NEW: client / tender / contract fields
        clientName: project.clientName || '',
        tenderNo: project.tenderNo || '',
        loaNo: project.loaNo || '',
        agreementNo: project.agreementNo || '',
        loaDate: project.loaDate ? project.loaDate.slice(0, 10) : '',
        tenderTotalAmount: project.tenderTotalAmount ?? '',
        loaAmount: project.loaAmount ?? '',
        contractorName: project.contractorName || '',
        contractorCode: project.contractorCode || '',
        tca: project.tca || '',
        taa: project.taa || '',
    });

    // NEW: joint venture members — a simple string array, edited as a
    // "type a name, hit Add" list rather than a plain text field so it
    // matches the schema shape (array of strings) exactly.
    const [jvMembers, setJvMembers] = useState(project.jointVentureMembers || []);
    const [jvInput, setJvInput] = useState('');

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const isRailway = form.department === 'indian_railway';
    const isPsu = form.department === 'psu';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'department' ? { zone: '', subDepartment: '', circle: '', division: '', psuName: '' } : {}),
        }));
        setSaved(false);
        setError('');
    };

    const addJvMember = () => {
        const name = jvInput.trim();
        if (!name) return;
        setJvMembers((prev) => [...prev, name]);
        setJvInput('');
        setSaved(false);
        setError('');
    };

    const removeJvMember = (index) => {
        setJvMembers((prev) => prev.filter((_, i) => i !== index));
        setSaved(false);
        setError('');
    };

    const handleJvKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addJvMember();
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            const payload = {
                ...form,
                tenderTotalAmount: form.tenderTotalAmount === '' ? undefined : Number(form.tenderTotalAmount),
                loaAmount: form.loaAmount === '' ? undefined : Number(form.loaAmount),
                loaDate: form.loaDate || undefined,
                currentDateOfCompletion: form.currentDateOfCompletion || undefined,
                jointVentureMembers: jvMembers,
            };
            const updated = await updateAdvanceDetails(project._id, payload);
            onUpdated(updated);
            setSaved(true);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Module id="advance" icon={<FaSitemap size={13} color={C.accent} />} title="Advance Project Details">
            <div style={gridTwo}>
                <Field label="Project type" htmlFor="projectType">
                    <select id="projectType" name="projectType" value={form.projectType} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}>
                        <option value="">Select type</option>
                        {PROJECT_TYPES.map((t) => <option key={t} value={t}>{prettify(t)}</option>)}
                    </select>
                </Field>
                <Field label="Tender type" htmlFor="tenderType">
                    <select id="tenderType" name="tenderType" value={form.tenderType} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}>
                        <option value="">Select type</option>
                        {TENDER_TYPES.map((t) => <option key={t} value={t}>{prettify(t)}</option>)}
                    </select>
                </Field>
                <Field label="Department" htmlFor="department">
                    <select id="department" name="department" value={form.department} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}>
                        <option value="">Select department</option>
                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{prettify(d)}</option>)}
                    </select>
                </Field>
                <Field label="Contract type" htmlFor="contractType">
                    <select id="contractType" name="contractType" value={form.contractType} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}>
                        <option value="">Select type</option>
                        {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{prettify(t)}</option>)}
                    </select>
                </Field>
                <Field label="Bidding type" htmlFor="biddingType">
                    <select id="biddingType" name="biddingType" value={form.biddingType} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}>
                        <option value="">Select type</option>
                        {BIDDING_TYPES.map((t) => <option key={t} value={t}>{prettify(t)}</option>)}
                    </select>
                </Field>
                <Field label="Expenditure type" htmlFor="expenditureType">
                    <select id="expenditureType" name="expenditureType" value={form.expenditureType} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}>
                        <option value="">Select type</option>
                        {EXPENDITURE_TYPES.map((t) => <option key={t} value={t}>{prettify(t)}</option>)}
                    </select>
                </Field>
                <Field label="Ranking order for bid" htmlFor="rankingOrderForBid">
                    <select id="rankingOrderForBid" name="rankingOrderForBid" value={form.rankingOrderForBid} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}>
                        <option value="">Select order</option>
                        {RANKING_ORDERS.map((r) => <option key={r} value={r}>{prettify(r)}</option>)}
                    </select>
                </Field>
                <Field label="Bidding system" htmlFor="biddingSystem">
                    <select id="biddingSystem" name="biddingSystem" value={form.biddingSystem} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}>
                        <option value="">Select system</option>
                        {BIDDING_SYSTEM_OPTIONS.map((b) => <option key={b} value={b}>{prettify(b)}</option>)}
                    </select>
                </Field>
                <Field label="Current date of completion" htmlFor="currentDateOfCompletion">
                    <input
                        id="currentDateOfCompletion" type="date" name="currentDateOfCompletion" value={form.currentDateOfCompletion}
                        onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}
                    />
                </Field>
            </div>

            {/* NEW: client / tender / contract fields */}
            <div style={subHeaderStyle}>Client / tender / contract</div>
            <div style={gridTwo}>
                <Field label="Client name" htmlFor="clientName">
                    <input id="clientName" type="text" name="clientName" value={form.clientName} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="Tender No." htmlFor="tenderNo">
                    <input id="tenderNo" type="text" name="tenderNo" value={form.tenderNo} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="LOA No." htmlFor="loaNo">
                    <input id="loaNo" type="text" name="loaNo" value={form.loaNo} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="Agreement No." htmlFor="agreementNo">
                    <input id="agreementNo" type="text" name="agreementNo" value={form.agreementNo} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="LOA date" htmlFor="loaDate">
                    <input id="loaDate" type="date" name="loaDate" value={form.loaDate} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }} />
                </Field>
                <Field label="Tender total amount" htmlFor="tenderTotalAmount">
                    <input id="tenderTotalAmount" type="number" name="tenderTotalAmount" value={form.tenderTotalAmount} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="LOA amount" htmlFor="loaAmount">
                    <input id="loaAmount" type="number" name="loaAmount" value={form.loaAmount} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="Contractor name" htmlFor="contractorName">
                    <input id="contractorName" type="text" name="contractorName" value={form.contractorName} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="Contractor code" htmlFor="contractorCode">
                    <input id="contractorCode" type="text" name="contractorCode" value={form.contractorCode} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="TCA" htmlFor="tca">
                    <input id="tca" type="text" name="tca" value={form.tca} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="TAA" htmlFor="taa">
                    <input id="taa" type="text" name="taa" value={form.taa} onChange={handleChange} style={controlStyle} />
                </Field>
            </div>

            {/* NEW: joint venture members — add/remove list */}
            <div style={subHeaderStyle}>
                <FaUsers size={12} color={C.accent} /> Joint venture members ({jvMembers.length})
            </div>

            {jvMembers.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {jvMembers.map((m, i) => (
                        <span key={i} style={{ ...badgeStyle('var(--secondary)', 'var(--secondary-foreground)'), gap: 8 }}>
                            {m}
                            <FaTrash
                                size={10}
                                style={{ cursor: 'pointer' }}
                                color={C.destructive}
                                onClick={() => removeJvMember(i)}
                                title="Remove"
                            />
                        </span>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', maxWidth: 420 }}>
                <div style={{ flex: 1 }}>
                    <Field label="Add member" htmlFor="jvMemberInput">
                        <input
                            id="jvMemberInput" type="text" value={jvInput}
                            onChange={(e) => setJvInput(e.target.value)}
                            onKeyDown={handleJvKeyDown}
                            placeholder="Member / firm name"
                            style={controlStyle}
                        />
                    </Field>
                </div>
                <button type="button" onClick={addJvMember} style={{ ...secondaryButtonStyle, height: 38 }}>
                    <FaPlus size={11} /> Add
                </button>
            </div>

            {isRailway && (
                <>
                    <div style={subHeaderStyle}><FaTrain size={12} color={C.accent} /> Railway details</div>
                    <div style={gridTwo}>
                        <Field label="Zone" htmlFor="zone">
                            <select id="zone" name="zone" value={form.zone} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}>
                                <option value="">Select zone</option>
                                {ZONES.map((z) => <option key={z} value={z}>{z.toUpperCase()}</option>)}
                            </select>
                        </Field>
                        <Field label="Sub-department" htmlFor="subDepartment">
                            <select id="subDepartment" name="subDepartment" value={form.subDepartment} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}>
                                <option value="">Select sub-department</option>
                                {SUB_DEPARTMENTS.map((s) => <option key={s} value={s}>{prettify(s)}</option>)}
                            </select>
                        </Field>
                        <Field label="Circle level" htmlFor="circle">
                            <select id="circle" name="circle" value={form.circle} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}>
                                <option value="">Select level</option>
                                {CIRCLES.map((c) => <option key={c} value={c}>{prettify(c)}</option>)}
                            </select>
                        </Field>
                        <Field label="Division" htmlFor="division">
                            <input id="division" type="text" name="division" value={form.division} onChange={handleChange} style={controlStyle} />
                        </Field>
                    </div>
                </>
            )}

            {isPsu && (
                <>
                    <div style={subHeaderStyle}><FaIndustry size={12} color={C.accent} /> PSU details</div>
                    <div style={gridTwo}>
                        <Field label="PSU name" htmlFor="psuName">
                            <select id="psuName" name="psuName" value={form.psuName} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}>
                                <option value="">Select PSU</option>
                                {PSU_NAMES.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                            </select>
                        </Field>
                    </div>
                </>
            )}

            <button onClick={handleSave} disabled={saving} style={saveButtonStyle(saving)}>
                <FaSave size={12} /> {saving ? 'Saving…' : 'Save advance details'}
            </button>
            {saved && <span style={savedTag}>Saved</span>}
            {error && <span style={errorTag}>{error}</span>}
        </Module>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 4 — Financial Details → PATCH /v1/financials/:projectId
   ══════════════════════════════════════════════════════════════════════════ */
function FinancialDetailsModule({ project, onUpdated }) {
    const f = project.financials || {};
    const recovery = f.recoveryAtContractEnd || {};

    const [form, setForm] = useState({
        tenderAmount: f.tenderAmount ?? '',
        biddingPosition: f.biddingPosition || '',
        biddingPercentage: f.biddingPercentage ?? '',
        pgAmount: f.pgAmount ?? '',
        actualPgAmount: f.actualPgAmount ?? '',
        pgMaturityDate: f.pgMaturityDate ? f.pgMaturityDate.slice(0, 10) : '',
        pgMaturityInterest: f.pgMaturityInterest ?? '',
        rateOfInterest: f.rateOfInterest ?? '',
        durationInDays: f.durationInDays ?? '',
        depositAccountNo: f.depositAccountNo || '',
        depositStartDate: f.depositStartDate ? f.depositStartDate.slice(0, 10) : '',
        penalty: f.penalty ?? '',
        penaltyTicketNo: f.penaltyTicketNo || '',
        recoveryBillAmount: recovery.billAmount ?? '',
        recoveryAmount: recovery.recoveryAmount ?? '',
        recoveryBillNumber: recovery.billNumber || '',
        recoveryDesc: recovery.recoveryDesc || '',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setSaved(false);
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            // Reshape flat form state back into the nested financials shape
            const payload = {
                tenderAmount: form.tenderAmount === '' ? undefined : Number(form.tenderAmount),
                biddingPosition: form.biddingPosition || undefined,
                biddingPercentage: form.biddingPercentage === '' ? undefined : Number(form.biddingPercentage),
                pgAmount: form.pgAmount === '' ? undefined : Number(form.pgAmount),
                actualPgAmount: form.actualPgAmount === '' ? undefined : Number(form.actualPgAmount),
                pgMaturityDate: form.pgMaturityDate || undefined,
                pgMaturityInterest: form.pgMaturityInterest === '' ? undefined : Number(form.pgMaturityInterest),
                rateOfInterest: form.rateOfInterest === '' ? undefined : Number(form.rateOfInterest),
                durationInDays: form.durationInDays === '' ? undefined : Number(form.durationInDays),
                depositAccountNo: form.depositAccountNo || undefined,
                depositStartDate: form.depositStartDate || undefined,
                penalty: form.penalty === '' ? undefined : Number(form.penalty),
                penaltyTicketNo: form.penaltyTicketNo || undefined,
                recoveryAtContractEnd: {
                    billAmount: form.recoveryBillAmount === '' ? undefined : Number(form.recoveryBillAmount),
                    recoveryAmount: form.recoveryAmount === '' ? undefined : Number(form.recoveryAmount),
                    billNumber: form.recoveryBillNumber || undefined,
                    recoveryDesc: form.recoveryDesc || undefined,
                },
            };
            const updated = await updateFinancials(project._id, payload);
            onUpdated(updated);
            setSaved(true);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Module id="financial" icon={<FaRupeeSign size={13} color={C.accent} />} title="Financial Details">
            <div style={gridTwo}>
                <Field label="Tender amount" htmlFor="tenderAmount">
                    <input id="tenderAmount" type="number" name="tenderAmount" value={form.tenderAmount} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="Bidding position" htmlFor="biddingPosition">
                    <select id="biddingPosition" name="biddingPosition" value={form.biddingPosition} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}>
                        <option value="">Select position</option>
                        {BIDDING_POSITIONS.map((b) => <option key={b} value={b}>{prettify(b)}</option>)}
                    </select>
                </Field>
                <Field label="Bidding percentage" htmlFor="biddingPercentage">
                    <input id="biddingPercentage" type="number" name="biddingPercentage" value={form.biddingPercentage} onChange={handleChange} style={controlStyle} />
                </Field>
            </div>

            <div style={subHeaderStyle}>Performance guarantee</div>
            <div style={gridTwo}>
                <Field label="PG amount" htmlFor="pgAmount">
                    <input id="pgAmount" type="number" name="pgAmount" value={form.pgAmount} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="Actual PG amount" htmlFor="actualPgAmount">
                    <input id="actualPgAmount" type="number" name="actualPgAmount" value={form.actualPgAmount} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="PG maturity date" htmlFor="pgMaturityDate">
                    <input id="pgMaturityDate" type="date" name="pgMaturityDate" value={form.pgMaturityDate} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }} />
                </Field>
                <Field label="PG maturity interest" htmlFor="pgMaturityInterest">
                    <input id="pgMaturityInterest" type="number" name="pgMaturityInterest" value={form.pgMaturityInterest} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="Rate of interest (%)" htmlFor="rateOfInterest">
                    <input id="rateOfInterest" type="number" name="rateOfInterest" value={form.rateOfInterest} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="Duration (days)" htmlFor="durationInDays">
                    <input id="durationInDays" type="number" name="durationInDays" value={form.durationInDays} onChange={handleChange} style={controlStyle} />
                </Field>
            </div>

            <div style={subHeaderStyle}>Deposit</div>
            <div style={gridTwo}>
                <Field label="Deposit account no." htmlFor="depositAccountNo">
                    <input id="depositAccountNo" type="text" name="depositAccountNo" value={form.depositAccountNo} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="Deposit start date" htmlFor="depositStartDate">
                    <input id="depositStartDate" type="date" name="depositStartDate" value={form.depositStartDate} onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }} />
                </Field>
            </div>

            <div style={subHeaderStyle}>Penalty</div>
            <div style={gridTwo}>
                <Field label="Penalty" htmlFor="penalty">
                    <input id="penalty" type="number" name="penalty" value={form.penalty} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="Penalty ticket no." htmlFor="penaltyTicketNo">
                    <input id="penaltyTicketNo" type="text" name="penaltyTicketNo" value={form.penaltyTicketNo} onChange={handleChange} style={controlStyle} />
                </Field>
            </div>

            <div style={subHeaderStyle}>Recovery at contract end</div>
            <div style={gridTwo}>
                <Field label="Bill amount" htmlFor="recoveryBillAmount">
                    <input id="recoveryBillAmount" type="number" name="recoveryBillAmount" value={form.recoveryBillAmount} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="Recovery amount" htmlFor="recoveryAmount">
                    <input id="recoveryAmount" type="number" name="recoveryAmount" value={form.recoveryAmount} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="Bill number" htmlFor="recoveryBillNumber">
                    <input id="recoveryBillNumber" type="text" name="recoveryBillNumber" value={form.recoveryBillNumber} onChange={handleChange} style={controlStyle} />
                </Field>
                <Field label="Recovery description" htmlFor="recoveryDesc">
                    <input id="recoveryDesc" type="text" name="recoveryDesc" value={form.recoveryDesc} onChange={handleChange} style={controlStyle} />
                </Field>
            </div>

            <button onClick={handleSave} disabled={saving} style={saveButtonStyle(saving)}>
                <FaSave size={12} /> {saving ? 'Saving…' : 'Save financial details'}
            </button>
            {saved && <span style={savedTag}>Saved</span>}
            {error && <span style={errorTag}>{error}</span>}
        </Module>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 4B — Bidding Financials
   PATCH /v1/financials/bidding/:projectId  (updateBiddingDetails)
   POST  /v1/financials/bidding/:projectId/cost-estimation (addCostEstimation, one at a time)
   ══════════════════════════════════════════════════════════════════════════ */
const BIDDING_STATUSES = ['unpaid', 'paid', 'exempted'];
const EXEMPTED_TYPES = ['startup_india', 'msme'];

function BiddingFinancialsModule({ project, onRefresh }) {
    const bidding = project.financials?.bidding || {};

    const [form, setForm] = useState({
        emdAmount: bidding.emdAmount ?? '',
        advertisedValue: bidding.advertisedValue ?? '',
        status: bidding.status || 'unpaid',
        referenceId: bidding.referenceId || '',
        exemptedType: bidding.exemptedType || '',
        biddingPosition: bidding.biddingPosition || '',
        biddingPercentage: bidding.biddingPercentage ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setSaved(false);
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            await updateBiddingDetails(project._id, {
                emdAmount: form.emdAmount === '' ? undefined : Number(form.emdAmount),
                advertisedValue: form.advertisedValue === '' ? undefined : Number(form.advertisedValue),
                status: form.status || undefined,
                // Only the field relevant to the current status is sent —
                // the other is explicitly cleared so stale values don't
                // linger if the status is switched later.
                referenceId: form.status === 'paid' ? (form.referenceId || undefined) : '',
                exemptedType: form.status === 'exempted' ? (form.exemptedType || undefined) : '',
                biddingPosition: form.biddingPosition || undefined,
                biddingPercentage: form.biddingPercentage === '' ? undefined : Number(form.biddingPercentage),
            });
            await onRefresh();
            setSaved(true);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    // ── expense / cost estimation table — added one entry at a time ──
    const [costName, setCostName] = useState('');
    const [costAmount, setCostAmount] = useState('');
    const [addingCost, setAddingCost] = useState(false);
    const [costAdded, setCostAdded] = useState(false);
    const [costError, setCostError] = useState('');

    const handleAddCost = async () => {
        setCostAdded(false);
        if (!costName.trim()) {
            setCostError('Cost name is required.');
            return;
        }
        if (costAmount === '' || Number.isNaN(Number(costAmount))) {
            setCostError('Enter a valid amount.');
            return;
        }
        setAddingCost(true);
        setCostError('');
        try {
            await addCostEstimation(project._id, { name: costName, amount: Number(costAmount) });
            await onRefresh();
            setCostName('');
            setCostAmount('');
            setCostAdded(true);
        } catch (err) {
            setCostError(err.message || 'Failed to add expense');
        } finally {
            setAddingCost(false);
        }
    };

    const costEstimationList = bidding.costEstimation || [];
    const costTotal = costEstimationList.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    return (
        <Module id="bidding" icon={<FaGavel size={13} color={C.accent} />} title="Bidding Financials">
            <div style={gridTwo}>
                <Field label="EMD amount" htmlFor="emdAmount">
                    <input
                        id="emdAmount" type="number" name="emdAmount" value={form.emdAmount}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
                <Field label="Advertised value" htmlFor="advertisedValue">
                    <input
                        id="advertisedValue" type="number" name="advertisedValue" value={form.advertisedValue}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
                <Field label="EMD status" htmlFor="biddingStatus">
                    <select
                        id="biddingStatus" name="status" value={form.status}
                        onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}
                    >
                        {BIDDING_STATUSES.map((s) => <option key={s} value={s}>{prettify(s)}</option>)}
                    </select>
                </Field>
                {form.status === 'paid' && (
                    <Field label="Reference ID" htmlFor="referenceId">
                        <input
                            id="referenceId" type="text" name="referenceId" value={form.referenceId}
                            onChange={handleChange} style={controlStyle}
                        />
                    </Field>
                )}
                {form.status === 'exempted' && (
                    <Field label="Exempted type" htmlFor="exemptedType">
                        <select
                            id="exemptedType" name="exemptedType" value={form.exemptedType}
                            onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}
                        >
                            <option value="">Select type</option>
                            {EXEMPTED_TYPES.map((t) => <option key={t} value={t}>{prettify(t)}</option>)}
                        </select>
                    </Field>
                )}
                <Field label="Bidding position" htmlFor="biddingPos">
                    <select
                        id="biddingPos" name="biddingPosition" value={form.biddingPosition}
                        onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}
                    >
                        <option value="">Select position</option>
                        {BIDDING_POSITIONS.map((b) => <option key={b} value={b}>{prettify(b)}</option>)}
                    </select>
                </Field>
                <Field label="Bidding percentage" htmlFor="biddingPct">
                    <input
                        id="biddingPct" type="number" name="biddingPercentage" value={form.biddingPercentage}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
            </div>

            <button onClick={handleSave} disabled={saving} style={saveButtonStyle(saving)}>
                <FaSave size={12} /> {saving ? 'Saving…' : 'Save bidding details'}
            </button>
            {saved && <span style={savedTag}>Saved</span>}
            {error && <span style={errorTag}>{error}</span>}

            <div style={subHeaderStyle}>Expenses / cost estimation ({costEstimationList.length})</div>

            {costEstimationList.length > 0 ? (
                <div style={tableWrapStyle}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Cost Name</th>
                                <th style={thRightStyle}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {costEstimationList.map((c, i) => (
                                <tr key={c._id || i}>
                                    <td style={tdStyle}>{c.name || '—'}</td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>{c.amount ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={totalRowStyle}>
                                <td style={tdStyle}>Total</td>
                                <td style={{ ...tdStyle, textAlign: 'right' }}>{costTotal}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ) : (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>No expenses added yet.</div>
            )}

            <div style={{ ...gridTwo, marginTop: 12 }}>
                <Field label="Cost name" htmlFor="costName">
                    <input
                        id="costName" type="text" value={costName}
                        onChange={(e) => { setCostName(e.target.value); setCostError(''); setCostAdded(false); }}
                        style={controlStyle}
                    />
                </Field>
                <Field label="Amount" htmlFor="costAmount">
                    <input
                        id="costAmount" type="number" value={costAmount}
                        onChange={(e) => { setCostAmount(e.target.value); setCostError(''); setCostAdded(false); }}
                        style={controlStyle}
                    />
                </Field>
            </div>

            <button onClick={handleAddCost} disabled={addingCost} style={{ ...saveButtonStyle(addingCost), marginTop: 12 }}>
                <FaPlus size={12} /> {addingCost ? 'Adding…' : 'Add expense'}
            </button>
            {costAdded && <span style={savedTag}>Added</span>}
            {costError && <span style={errorTag}>{costError}</span>}
        </Module>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 4C — Advanced Financial Details (PG) → PATCH /v1/financials/pg/:projectId
   ══════════════════════════════════════════════════════════════════════════ */
function PgDetailsModule({ project, onRefresh }) {
    const pg = project.financials?.pg || {};

    const [form, setForm] = useState({
        amountRailway: pg.amountRailway ?? '',
        amountSubmitted: pg.amountSubmitted ?? '',
        createDate: pg.createDate ? pg.createDate.slice(0, 10) : '',
        maturityDate: pg.maturityDate ? pg.maturityDate.slice(0, 10) : '',
        interest: pg.interest ?? '',
        maturityAmount: pg.maturityAmount ?? '',
        name: pg.name || '',
        depositAccountNo: pg.depositAccountNo || '',
        bankBranch: pg.bankBranch || '',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setSaved(false);
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            await updatePgDetails(project._id, {
                amountRailway: form.amountRailway === '' ? undefined : Number(form.amountRailway),
                amountSubmitted: form.amountSubmitted === '' ? undefined : Number(form.amountSubmitted),
                createDate: form.createDate || undefined,
                maturityDate: form.maturityDate || undefined,
                interest: form.interest === '' ? undefined : Number(form.interest),
                maturityAmount: form.maturityAmount === '' ? undefined : Number(form.maturityAmount),
                name: form.name || undefined,
                depositAccountNo: form.depositAccountNo || undefined,
                bankBranch: form.bankBranch || undefined,
            });
            await onRefresh();
            setSaved(true);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Module id="pg" icon={<FaLandmark size={13} color={C.accent} />} title="Advanced Financial Details">
            <div style={gridTwo}>
                <Field label="PG amount (railway)" htmlFor="amountRailway">
                    <input
                        id="amountRailway" type="number" name="amountRailway" value={form.amountRailway}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
                <Field label="PG amount submitted" htmlFor="amountSubmitted">
                    <input
                        id="amountSubmitted" type="number" name="amountSubmitted" value={form.amountSubmitted}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
                <Field label="PG create date" htmlFor="createDate">
                    <input
                        id="createDate" type="date" name="createDate" value={form.createDate}
                        onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}
                    />
                </Field>
                <Field label="Maturity date" htmlFor="maturityDate">
                    <input
                        id="maturityDate" type="date" name="maturityDate" value={form.maturityDate}
                        onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}
                    />
                </Field>
                <Field label="Interest" htmlFor="interest">
                    <input
                        id="interest" type="number" name="interest" value={form.interest}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
                <Field label="Maturity amount" htmlFor="maturityAmount">
                    <input
                        id="maturityAmount" type="number" name="maturityAmount" value={form.maturityAmount}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
                <Field label="Name" htmlFor="pgName">
                    <input
                        id="pgName" type="text" name="name" value={form.name}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
                <Field label="Deposit account no." htmlFor="pgDepositAccountNo">
                    <input
                        id="pgDepositAccountNo" type="text" name="depositAccountNo" value={form.depositAccountNo}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
                <Field label="Bank branch" htmlFor="bankBranch">
                    <input
                        id="bankBranch" type="text" name="bankBranch" value={form.bankBranch}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
            </div>

            <button onClick={handleSave} disabled={saving} style={saveButtonStyle(saving)}>
                <FaSave size={12} /> {saving ? 'Saving…' : 'Save PG details'}
            </button>
            {saved && <span style={savedTag}>Saved</span>}
            {error && <span style={errorTag}>{error}</span>}
        </Module>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 4D — Penalty Details → PATCH /v1/financials/penalty/:projectId
   ══════════════════════════════════════════════════════════════════════════ */
function PenaltyDetailsModule({ project, onRefresh }) {
    const penaltyDetails = project.financials?.penaltyDetails || {};

    const [form, setForm] = useState({
        amount: penaltyDetails.amount ?? '',
        ticketNo: penaltyDetails.ticketNo || '',
        ticketDate: penaltyDetails.ticketDate ? penaltyDetails.ticketDate.slice(0, 10) : '',
        delayDays: penaltyDetails.delayDays ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setSaved(false);
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            await updatePenaltyDetails(project._id, {
                amount: form.amount === '' ? undefined : Number(form.amount),
                ticketNo: form.ticketNo || undefined,
                ticketDate: form.ticketDate || undefined,
                delayDays: form.delayDays === '' ? undefined : Number(form.delayDays),
            });
            await onRefresh();
            setSaved(true);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Module id="penalty" icon={<FaExclamationTriangle size={13} color={C.accent} />} title="Penalty Details">
            <div style={gridTwo}>
                <Field label="Amount" htmlFor="penaltyDetailsAmount">
                    <input
                        id="penaltyDetailsAmount" type="number" name="amount" value={form.amount}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
                <Field label="Ticket No." htmlFor="penaltyTicketNoDetail">
                    <input
                        id="penaltyTicketNoDetail" type="text" name="ticketNo" value={form.ticketNo}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
                <Field label="Ticket date" htmlFor="penaltyTicketDate">
                    <input
                        id="penaltyTicketDate" type="date" name="ticketDate" value={form.ticketDate}
                        onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}
                    />
                </Field>
                <Field label="Delay days" htmlFor="delayDays">
                    <input
                        id="delayDays" type="number" name="delayDays" value={form.delayDays}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
            </div>

            <button onClick={handleSave} disabled={saving} style={saveButtonStyle(saving)}>
                <FaSave size={12} /> {saving ? 'Saving…' : 'Save penalty details'}
            </button>
            {saved && <span style={savedTag}>Saved</span>}
            {error && <span style={errorTag}>{error}</span>}
        </Module>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 4E — Security Deposit
   PATCH /v1/financials/security-deposit/:projectId (updateSecurityDepositDetails)
   POST  /v1/financials/security-deposit/:projectId/cust (addSecurityDepositCust, one at a time)
   ══════════════════════════════════════════════════════════════════════════ */
function SecurityDepositModule({ project, onRefresh }) {
    const sd = project.financials?.security_deposit || {};

    const [form, setForm] = useState({
        amount: sd.amount ?? '',
        percentage: sd.percentage ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setSaved(false);
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            await updateSecurityDepositDetails(project._id, {
                amount: form.amount === '' ? undefined : Number(form.amount),
                percentage: form.percentage === '' ? undefined : Number(form.percentage),
            });
            await onRefresh();
            setSaved(true);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    // ── previous SD entries — added one at a time via their own route ──
    const [billNo, setBillNo] = useState('');
    const [recoveryPercent, setRecoveryPercent] = useState('');
    const [custAmount, setCustAmount] = useState('');
    const [addingCust, setAddingCust] = useState(false);
    const [custAdded, setCustAdded] = useState(false);
    const [custError, setCustError] = useState('');

    const handleAddCust = async () => {
        setCustAdded(false);
        if (!billNo.trim()) {
            setCustError('Bill No. is required.');
            return;
        }
        if (recoveryPercent === '' || Number.isNaN(Number(recoveryPercent))) {
            setCustError('Enter a valid recovery %.');
            return;
        }
        if (custAmount === '' || Number.isNaN(Number(custAmount))) {
            setCustError('Enter a valid amount.');
            return;
        }
        setAddingCust(true);
        setCustError('');
        try {
            await addSecurityDepositCust(project._id, {
                billNo,
                recoveryPercent: Number(recoveryPercent),
                amount: Number(custAmount),
            });
            await onRefresh();
            setBillNo('');
            setRecoveryPercent('');
            setCustAmount('');
            setCustAdded(true);
        } catch (err) {
            setCustError(err.message || 'Failed to add entry');
        } finally {
            setAddingCust(false);
        }
    };

    const custList = sd.cust || [];

    return (
        <Module id="security-deposit" icon={<FaPiggyBank size={13} color={C.accent} />} title="Security Deposit">
            <div style={gridTwo}>
                <Field label="SD amount" htmlFor="sdAmount">
                    <input
                        id="sdAmount" type="number" name="amount" value={form.amount}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
                <Field label="SD %" htmlFor="sdPercentage">
                    <input
                        id="sdPercentage" type="number" name="percentage" value={form.percentage}
                        onChange={handleChange} style={controlStyle}
                    />
                </Field>
            </div>

            <button onClick={handleSave} disabled={saving} style={saveButtonStyle(saving)}>
                <FaSave size={12} /> {saving ? 'Saving…' : 'Save SD details'}
            </button>
            {saved && <span style={savedTag}>Saved</span>}
            {error && <span style={errorTag}>{error}</span>}

            <div style={subHeaderStyle}>Previous SD entries ({custList.length})</div>

            {custList.length > 0 ? (
                <div style={tableWrapStyle}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Bill No.</th>
                                <th style={thRightStyle}>Recovery %</th>
                                <th style={thRightStyle}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {custList.map((c, i) => (
                                <tr key={c._id || i}>
                                    <td style={tdStyle}>{c.billNo || '—'}</td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>{c.recoveryPercent ?? '—'}</td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>{c.amount ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>No SD entries added yet.</div>
            )}

            <div style={{ ...gridTwo, marginTop: 12 }}>
                <Field label="Bill No." htmlFor="sdBillNo">
                    <input
                        id="sdBillNo" type="text" value={billNo}
                        onChange={(e) => { setBillNo(e.target.value); setCustError(''); setCustAdded(false); }}
                        style={controlStyle}
                    />
                </Field>
                <Field label="Recovery %" htmlFor="sdRecoveryPercent">
                    <input
                        id="sdRecoveryPercent" type="number" value={recoveryPercent}
                        onChange={(e) => { setRecoveryPercent(e.target.value); setCustError(''); setCustAdded(false); }}
                        style={controlStyle}
                    />
                </Field>
                <Field label="Amount" htmlFor="sdCustAmount">
                    <input
                        id="sdCustAmount" type="number" value={custAmount}
                        onChange={(e) => { setCustAmount(e.target.value); setCustError(''); setCustAdded(false); }}
                        style={controlStyle}
                    />
                </Field>
            </div>

            <button onClick={handleAddCust} disabled={addingCust} style={{ ...saveButtonStyle(addingCust), marginTop: 12 }}>
                <FaPlus size={12} /> {addingCust ? 'Adding…' : 'Add SD entry'}
            </button>
            {custAdded && <span style={savedTag}>Added</span>}
            {custError && <span style={errorTag}>{custError}</span>}
        </Module>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 5 — Project Status → PATCH /v1/status/:projectId
   ══════════════════════════════════════════════════════════════════════════ */
function StatusModule({ project, onUpdated }) {
    const [status, setStatus] = useState(project.status || 'draft');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            const updated = await updateProjectStatus(project._id, status);
            onUpdated(updated);
            setSaved(true);
        } catch (err) {
            setError(err.message || 'Failed to update status');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Module id="status" icon={<FaClipboardCheck size={13} color={C.accent} />} title="Project Status">
            <div style={{ maxWidth: 280 }}>
                <Field label="Status" htmlFor="status">
                    <select
                        id="status" value={status}
                        onChange={(e) => { setStatus(e.target.value); setSaved(false); setError(''); }}
                        style={{ ...controlStyle, cursor: 'pointer' }}
                    >
                        {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{prettify(s)}</option>)}
                    </select>
                </Field>
            </div>
            <button onClick={handleSave} disabled={saving} style={saveButtonStyle(saving)}>
                <FaSave size={12} /> {saving ? 'Updating…' : 'Update status'}
            </button>
            {saved && <span style={savedTag}>Saved</span>}
            {error && <span style={errorTag}>{error}</span>}
        </Module>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 6 — Documents → POST /v1/:projectId/document (list + attach new)
   ══════════════════════════════════════════════════════════════════════════ */
function DocumentsModule({ project, onUpdated }) {
    const [name, setName] = useState('');
    const [documentType, setDocumentType] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [added, setAdded] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef();

    // Tracks which document _id is currently being deleted, so only that
    // row shows a spinner/disabled state instead of the whole module.
    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState('');

    const handleDelete = async (documentId) => {
        if (!window.confirm('Delete this document? This cannot be undone.')) return;
        setDeletingId(documentId);
        setDeleteError('');
        try {
            const updatedDocuments = await deleteProjectDocument(project._id, documentId);
            onUpdated({ ...project, documents: updatedDocuments });
        } catch (err) {
            setDeleteError(err.message || 'Failed to delete document');
        } finally {
            setDeletingId(null);
        }
    };

    const uploadToCloudinary = async (f) => {
        const cloudFormData = new FormData();
        cloudFormData.append('file', f);
        cloudFormData.append('upload_preset', UPLOAD_PRESET);
        const isPdf = f.type === 'application/pdf';
        const resourceType = isPdf ? 'raw' : 'image';
        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
        const res = await fetch(url, { method: 'POST', body: cloudFormData });
        if (!res.ok) throw new Error('Failed to upload file to Cloudinary');
        const data = await res.json();
        return data.secure_url;
    };

    const handleAdd = async () => {
        if (!file) {
            setError('Choose a file first.');
            return;
        }
        if (!name.trim()) {
            setError('Enter a document name.');
            return;
        }
        if (!documentType) {
            setError('Select a document type.');
            return;
        }
        setUploading(true);
        setError('');
        setAdded(false);
        try {
            const url = await uploadToCloudinary(file);
            const updated = await addProjectDocument(project._id, { name, url, documentType });
            onUpdated(updated);
            setAdded(true);
            setName('');
            setDocumentType('');
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            setError(err.message || 'Failed to attach document');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Module
            id="documents"
            icon={<FaFileAlt size={13} color={C.accent} />}
            title="Documents"
            extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{project.documents?.length || 0} attached</span>}
        >
            {/* ── Already uploaded documents ── */}
            {deleteError && (
                <div style={{ fontSize: 12, color: C.destructive, marginBottom: 10 }}>{deleteError}</div>
            )}
            {project.documents && project.documents.length > 0 ? (
                <div style={{ marginBottom: 14 }}>
                    {project.documents.map((doc, i) => (
                        <div key={doc._id || i} style={{ ...subCardStyle, display: 'flex', alignItems: 'center', gap: 9 }}>
                            <FaFileAlt size={14} color={C.accent} style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {doc.name}
                                </div>
                            </div>
                            <span style={badgeStyle('var(--secondary)', 'var(--secondary-foreground)')}>{prettify(doc.documentType)}</span>
                            {doc.url && (
                                <a href={toAbsoluteUrl(doc.url)} target="_blank" rel="noreferrer"
                                    style={{ color: 'var(--link)', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, flexShrink: 0 }}>
                                    Open <FaExternalLinkAlt size={10} />
                                </a>
                            )}
                            <button
                                type="button"
                                onClick={() => handleDelete(doc._id)}
                                disabled={deletingId === doc._id}
                                title="Delete document"
                                style={{
                                    border: 'none', background: 'transparent', flexShrink: 0, padding: 4,
                                    color: deletingId === doc._id ? 'var(--text-muted)' : C.destructive,
                                    cursor: deletingId === doc._id ? 'not-allowed' : 'pointer',
                                }}
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>No documents attached yet.</div>
            )}

            {/* ── Attach new ── */}
            <div style={subHeaderStyle}>Attach new document</div>
            <div style={gridTwo}>
                <Field label="Document name" htmlFor="docName">
                    <input
                        id="docName" type="text" value={name}
                        onChange={(e) => { setName(e.target.value); setAdded(false); setError(''); }}
                        style={controlStyle}
                    />
                </Field>
                <Field label="Document type" htmlFor="docType">
                    <select
                        id="docType" value={documentType}
                        onChange={(e) => { setDocumentType(e.target.value); setAdded(false); setError(''); }}
                        style={{ ...controlStyle, cursor: 'pointer' }}
                    >
                        <option value="">Select type</option>
                        {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{prettify(t)}</option>)}
                    </select>
                </Field>
                <Field label="File" htmlFor="docFile">
                    <input
                        id="docFile" type="file" accept=".pdf,.jpg,.jpeg,.png" ref={fileInputRef}
                        onChange={(e) => { setFile(e.target.files[0]); setAdded(false); setError(''); }}
                        style={controlStyle}
                    />
                </Field>
            </div>

            <button onClick={handleAdd} disabled={uploading} style={saveButtonStyle(uploading)}>
                <FaPlus size={12} /> {uploading ? 'Uploading…' : 'Attach document'}
            </button>
            {added && <span style={savedTag}>Attached</span>}
            {error && <span style={errorTag}>{error}</span>}
        </Module>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 7 — Materials → GET /:projectId/items (list) + POST /:projectId/items (bulk add)
   No profitLossPercent field here — that calc logic is added later.
   ══════════════════════════════════════════════════════════════════════════ */
const emptyRow = () => ({
    itemNo: '', name: '', description: '', unit: '',
    railwayRate: '', ourRate: '', marketRate: '', quantity: '', installation: '',
});

function MaterialsModule({ project }) {
    const [savedItems, setSavedItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [rows, setRows] = useState([emptyRow()]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const loadItems = async () => {
        setLoadingItems(true);
        setLoadError('');
        try {
            const data = await getProjectItems(project._id);
            setSavedItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setLoadError(err.message || 'Failed to load items');
        } finally {
            setLoadingItems(false);
        }
    };

    useEffect(() => {
        loadItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project._id]);

    const handleRowChange = (index, field, value) => {
        setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
        setSaved(false);
        setError('');
    };

    const addRow = () => setRows((prev) => [...prev, emptyRow()]);

    const removeRow = (index) => setRows((prev) => prev.filter((_, i) => i !== index));

    // Client-side only, computed from marketRate — nothing here is stored
    // in the DB as "total"; it's derived fresh on every render, both for
    // the draft rows being added and for the already-saved items list.
    const rowTotal = (row) => {
        const marketRate = Number(row.marketRate) || 0;
        const quantity = Number(row.quantity) || 0;
        const installation = Number(row.installation) || 0;
        return (marketRate * quantity) + installation;
    };

    const draftTotal = rows.reduce((sum, row) => sum + rowTotal(row), 0);
    const savedTotal = savedItems.reduce((sum, it) => sum + rowTotal(it), 0);

    const handleSave = async () => {
        setError('');
        setSaved(false);

        const validRows = rows.filter((r) => r.itemNo || r.name);

        if (validRows.length === 0) {
            setError('Add at least one item with an Item No. and Name.');
            return;
        }

        for (let i = 0; i < validRows.length; i++) {
            if (!validRows[i].itemNo) {
                setError(`Row ${i + 1} is missing Item No.`);
                return;
            }
            if (!validRows[i].name) {
                setError(`Row ${i + 1} is missing Name.`);
                return;
            }
        }

        setSaving(true);
        try {
            const payload = validRows.map((r) => ({
                itemNo: r.itemNo,
                name: r.name,
                description: r.description || undefined,
                unit: r.unit || undefined,
                railwayRate: r.railwayRate === '' ? undefined : Number(r.railwayRate),
                ourRate: r.ourRate === '' ? undefined : Number(r.ourRate),
                marketRate: r.marketRate === '' ? undefined : Number(r.marketRate),
                quantity: r.quantity === '' ? undefined : Number(r.quantity),
                installation: r.installation === '' ? undefined : Number(r.installation),
            }));

            await addItems(project._id, payload);
            await loadItems();
            setRows([emptyRow()]);
            setSaved(true);
        } catch (err) {
            setError(err.message || 'Failed to save items');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Module
            id="materials"
            icon={<FaBoxes size={13} color={C.accent} />}
            title="Materials"
            extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{savedItems.length} saved</span>}
        >
            {/* ── Already saved items ── */}
            {loadingItems && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Loading items…</div>}
            {!loadingItems && loadError && <div style={{ fontSize: 13, color: C.destructive, marginBottom: 14 }}>{loadError}</div>}

            {!loadingItems && !loadError && savedItems.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                    <div style={tableWrapStyle}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Item No.</th>
                                    <th style={thStyle}>Name</th>
                                    <th style={thStyle}>Description</th>
                                    <th style={thStyle}>Unit</th>
                                    <th style={thRightStyle}>Railway Rate</th>
                                    <th style={thRightStyle}>Our Rate</th>
                                    <th style={thRightStyle}>Market Rate</th>
                                    <th style={thRightStyle}>Qty</th>
                                    <th style={thRightStyle}>Installation</th>
                                    <th style={thRightStyle}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {savedItems.map((it, i) => (
                                    <tr key={it._id || i}>
                                        <td style={tdStyle}>{it.itemNo || '—'}</td>
                                        <td style={tdStyle}>{it.name || '—'}</td>
                                        <td style={tdStyle}>{it.description || '—'}</td>
                                        <td style={tdStyle}>{it.unit || '—'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{it.railwayRate ?? '—'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{it.ourRate ?? '—'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{it.marketRate ?? '—'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{it.quantity ?? '—'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{it.installation ?? '—'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>{rowTotal(it)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={totalRowStyle}>
                                    <td style={tdStyle} colSpan={9}>Total</td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>{savedTotal}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {!loadingItems && !loadError && savedItems.length === 0 && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>No items added yet.</div>
            )}

            {/* ── Add new items ── */}
            <div style={subHeaderStyle}>Add items</div>
            <div style={tableWrapStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Item No.</th>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Description</th>
                            <th style={thStyle}>Unit</th>
                            <th style={thRightStyle}>Railway Rate</th>
                            <th style={thRightStyle}>Our Rate</th>
                            <th style={thRightStyle}>Market Rate</th>
                            <th style={thRightStyle}>Qty</th>
                            <th style={thRightStyle}>Installation</th>
                            <th style={thRightStyle}>Total</th>
                            <th style={thStyle}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i}>
                                <td style={tdStyle}>
                                    <input
                                        type="text" value={row.itemNo}
                                        onChange={(e) => handleRowChange(i, 'itemNo', e.target.value)}
                                        style={cellInputStyle}
                                    />
                                </td>
                                <td style={tdStyle}>
                                    <input
                                        type="text" value={row.name}
                                        onChange={(e) => handleRowChange(i, 'name', e.target.value)}
                                        style={cellInputWideStyle}
                                    />
                                </td>
                                <td style={tdStyle}>
                                    <input
                                        type="text" value={row.description}
                                        onChange={(e) => handleRowChange(i, 'description', e.target.value)}
                                        style={cellInputWideStyle}
                                    />
                                </td>
                                <td style={tdStyle}>
                                    <select
                                        value={row.unit}
                                        onChange={(e) => handleRowChange(i, 'unit', e.target.value)}
                                        style={{ ...cellInputStyle, cursor: 'pointer' }}
                                    >
                                        <option value="">Select</option>
                                        {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </td>
                                <td style={tdStyle}>
                                    <input
                                        type="number" value={row.railwayRate}
                                        onChange={(e) => handleRowChange(i, 'railwayRate', e.target.value)}
                                        style={cellInputStyle}
                                    />
                                </td>
                                <td style={tdStyle}>
                                    <input
                                        type="number" value={row.ourRate}
                                        onChange={(e) => handleRowChange(i, 'ourRate', e.target.value)}
                                        style={cellInputStyle}
                                    />
                                </td>
                                <td style={tdStyle}>
                                    <input
                                        type="number" value={row.marketRate}
                                        onChange={(e) => handleRowChange(i, 'marketRate', e.target.value)}
                                        style={cellInputStyle}
                                    />
                                </td>
                                <td style={tdStyle}>
                                    <input
                                        type="number" value={row.quantity}
                                        onChange={(e) => handleRowChange(i, 'quantity', e.target.value)}
                                        style={cellInputStyle}
                                    />
                                </td>
                                <td style={tdStyle}>
                                    <input
                                        type="number" value={row.installation}
                                        onChange={(e) => handleRowChange(i, 'installation', e.target.value)}
                                        style={cellInputStyle}
                                    />
                                </td>
                                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>
                                    {rowTotal(row)}
                                </td>
                                <td style={tdStyle}>
                                    <button
                                        type="button"
                                        onClick={() => removeRow(i)}
                                        disabled={rows.length === 1}
                                        style={{
                                            border: 'none', background: 'transparent',
                                            color: rows.length === 1 ? 'var(--text-muted)' : C.destructive,
                                            cursor: rows.length === 1 ? 'not-allowed' : 'pointer', padding: 4,
                                        }}
                                        title="Remove row"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={totalRowStyle}>
                            <td style={tdStyle} colSpan={9}>Total (draft)</td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>{draftTotal}</td>
                            <td style={tdStyle}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                <button type="button" onClick={addRow} style={secondaryButtonStyle}>
                    <FaPlus size={11} /> Add row
                </button>
                <button onClick={handleSave} disabled={saving} style={{ ...saveButtonStyle(saving), marginTop: 0 }}>
                    <FaSave size={12} /> {saving ? 'Saving…' : 'Save items'}
                </button>
                {saved && <span style={savedTag}>Saved</span>}
                {error && <span style={errorTag}>{error}</span>}
            </div>
        </Module>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 7B — Timeline → PATCH /v1/timeline/:projectId
   NOTE: this route doesn't exist in your route file yet — add it
   following the same findById + conditional-field pattern as
   basic-details / location before wiring this in production.
   ══════════════════════════════════════════════════════════════════════════ */
function TimelineModule({ project, onUpdated }) {
    const [form, setForm] = useState({
        startDate: project.startDate ? project.startDate.slice(0, 10) : '',
        estimatedCompletionDate: project.estimatedCompletionDate ? project.estimatedCompletionDate.slice(0, 10) : '',
        endDate: project.endDate ? project.endDate.slice(0, 10) : '',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setSaved(false);
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            const payload = {
                startDate: form.startDate || undefined,
                estimatedCompletionDate: form.estimatedCompletionDate || undefined,
                endDate: form.endDate || undefined,
            };
            const updated = await updateTimeline(project._id, payload);
            onUpdated(updated);
            setSaved(true);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Module id="timeline" icon={<FaCalendarAlt size={13} color={C.accent} />} title="Timeline">
            <div style={gridTwo}>
                <Field label="Start date" htmlFor="startDate">
                    <input
                        id="startDate" type="date" name="startDate" value={form.startDate}
                        onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}
                    />
                </Field>
                <Field label="Estimated completion date" htmlFor="estimatedCompletionDate">
                    <input
                        id="estimatedCompletionDate" type="date" name="estimatedCompletionDate" value={form.estimatedCompletionDate}
                        onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}
                    />
                </Field>
                <Field label="End date" htmlFor="endDate">
                    <input
                        id="endDate" type="date" name="endDate" value={form.endDate}
                        onChange={handleChange} style={{ ...controlStyle, cursor: 'pointer' }}
                    />
                </Field>
            </div>

            <button onClick={handleSave} disabled={saving} style={saveButtonStyle(saving)}>
                <FaSave size={12} /> {saving ? 'Saving…' : 'Save timeline'}
            </button>
            {saved && <span style={savedTag}>Saved</span>}
            {error && <span style={errorTag}>{error}</span>}
        </Module>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 8 — Forward Project → PATCH /v1/forward/:projectId
   ══════════════════════════════════════════════════════════════════════════ */
function ForwardModule({ project, onUpdated }) {
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [usersError, setUsersError] = useState('');

    const [action, setAction] = useState('');
    const [remark, setRemark] = useState('');
    const [nextAuthority, setNextAuthority] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadUsers = async () => {
            setLoadingUsers(true);
            setUsersError('');
            try {
                const data = await getUsersList();
                setUsers(Array.isArray(data) ? data : []);
            } catch (err) {
                setUsersError(err.message || 'Failed to load users');
            } finally {
                setLoadingUsers(false);
            }
        };
        loadUsers();
    }, []);

    // "Name (CID) [role] [TAG]" — e.g. "Mohit Soni (CID-102) [admin] [CEO]"
    const userLabel = (u) => {
        let label = `${u.name || 'Unnamed'} (${u.cid || 'N/A'})`;
        label += ` [${prettify(u.role) || u.role}]`;
        if (u.tag) label += ` [${u.tag.toUpperCase()}]`;
        return label;
    };

    const handleForward = async () => {
        if (!action) {
            setError('Select an action.');
            return;
        }
        if (!nextAuthority) {
            setError('Select the next authority.');
            return;
        }
        setSending(true);
        setSent(false);
        setError('');
        try {
            const updated = await forwardProject(project._id, { action, remark, nextAuthority });
            onUpdated(updated);
            setSent(true);
            setAction('');
            setRemark('');
            setNextAuthority('');
        } catch (err) {
            setError(err.message || 'Failed to forward project');
        } finally {
            setSending(false);
        }
    };

    return (
        <Module id="forward" icon={<FaUserShield size={13} color={C.accent} />} title="Forward Project">
            <div style={gridTwo}>
                <Field label="Action" htmlFor="fwdAction">
                    <select
                        id="fwdAction" value={action}
                        onChange={(e) => { setAction(e.target.value); setSent(false); setError(''); }}
                        style={{ ...controlStyle, cursor: 'pointer' }}
                    >
                        <option value="">Select action</option>
                        {FORWARD_ACTIONS.map((a) => <option key={a} value={a}>{prettify(a)}</option>)}
                    </select>
                </Field>

                <Field label="Next authority" htmlFor="fwdNextAuthority">
                    <select
                        id="fwdNextAuthority" value={nextAuthority}
                        onChange={(e) => { setNextAuthority(e.target.value); setSent(false); setError(''); }}
                        disabled={loadingUsers || !!usersError}
                        style={{ ...controlStyle, cursor: loadingUsers ? 'not-allowed' : 'pointer' }}
                    >
                        <option value="">
                            {loadingUsers ? 'Loading users…' : usersError ? 'Failed to load users' : 'Select next authority'}
                        </option>
                        {users.map((u) => (
                            <option key={u._id} value={u._id}>{userLabel(u)}</option>
                        ))}
                    </select>
                    {usersError && <div style={{ fontSize: 11.5, color: C.destructive, marginTop: 4 }}>{usersError}</div>}
                </Field>
            </div>

            <div style={{ marginTop: 12 }}>
                <Field label="Remark" htmlFor="fwdRemark">
                    <textarea
                        id="fwdRemark" rows={3} value={remark}
                        onChange={(e) => { setRemark(e.target.value); setSent(false); setError(''); }}
                        style={{ ...controlStyle, resize: 'vertical' }}
                    />
                </Field>
            </div>

            <button onClick={handleForward} disabled={sending} style={saveButtonStyle(sending)}>
                <FaPaperPlane size={12} /> {sending ? 'Forwarding…' : 'Forward project'}
            </button>
            {sent && <span style={savedTag}>Forwarded</span>}
            {error && <span style={errorTag}>{error}</span>}
        </Module>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE 9 — Project Tasks → GET /task/project/:projectId (list)
                              + POST /task/create (add)
   ══════════════════════════════════════════════════════════════════════════ */

const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const taskStatusStyle = (status) => {
    const map = {
        pending: { bg: 'var(--muted)', fg: 'var(--text-muted)' },
        in_progress: { bg: 'var(--info)', fg: 'var(--info-foreground)' },
        submitted: { bg: 'var(--amber)', fg: 'var(--amber-foreground)' },
        completed: { bg: 'var(--success)', fg: 'var(--success-foreground)' },
        overdue: { bg: 'var(--destructive-bg)', fg: 'var(--destructive)' },
        rejected: { bg: 'var(--destructive-bg)', fg: 'var(--destructive)' },
    };
    return map[status] || { bg: 'var(--muted)', fg: 'var(--text-muted)' };
};

const taskPriorityStyle = (priority) => {
    const map = {
        low: { bg: 'var(--muted)', fg: 'var(--text-muted)' },
        medium: { bg: 'var(--info)', fg: 'var(--info-foreground)' },
        high: { bg: 'var(--warning)', fg: 'var(--warning-foreground)' },
        urgent: { bg: 'var(--destructive-bg)', fg: 'var(--destructive)' },
    };
    return map[priority] || { bg: 'var(--muted)', fg: 'var(--text-muted)' };
};

const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const emptyTaskForm = () => ({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    startDate: '',
    allottedTo: [],       // array of selected user _ids
    relatedDocuments: [], // array of selected project document _ids
});

function TasksModule({ project, onBrowseTask }) {
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [usersError, setUsersError] = useState('');
    const [userSearch, setUserSearch] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyTaskForm());
    const [creating, setCreating] = useState(false);
    const [created, setCreated] = useState(false);
    const [formError, setFormError] = useState('');

    const loadTasks = async () => {
        setLoadingTasks(true);
        setLoadError('');
        try {
            const data = await getTasksByProject(project._id);
            setTasks(Array.isArray(data) ? data : []);
        } catch (err) {
            setLoadError(err.message || 'Failed to load tasks');
        } finally {
            setLoadingTasks(false);
        }
    };

    useEffect(() => {
        loadTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project._id]);

    // Users are only fetched the first time the create form is opened —
    // no point loading the picker list until it's actually needed.
    const openForm = async () => {
        setShowForm(true);
        setCreated(false);
        setFormError('');
        if (users.length > 0 || loadingUsers) return;
        setLoadingUsers(true);
        setUsersError('');
        try {
            const data = await getUsersList();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            setUsersError(err.message || 'Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    };

    const userLabel = (u) => `${u.name || 'Unnamed'} (${u.cid || 'N/A'}) [${prettify(u.role) || u.role}]`;

    // Client-side only — filters the already-fetched user list by name as
    // the person types. No extra request; fine up to the ~50-user scale
    // this picker is meant for.
    const filteredUsers = users.filter((u) =>
        (u.name || '').toLowerCase().includes(userSearch.trim().toLowerCase())
    );

    const handleFieldChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setCreated(false);
        setFormError('');
    };

    const handleMultiSelect = (field, e) => {
        const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
        setForm((prev) => ({ ...prev, [field]: values }));
        setCreated(false);
        setFormError('');
    };

    const handleCreate = async () => {
        if (!form.title.trim()) {
            setFormError('Task name is required.');
            return;
        }
        if (form.allottedTo.length === 0) {
            setFormError('Allot the task to at least one user.');
            return;
        }
        if (!form.deadline) {
            setFormError('Deadline is required.');
            return;
        }

        setCreating(true);
        setFormError('');
        setCreated(false);
        try {
            await createTask({
                projectId: project._id,
                relatedDocuments: form.relatedDocuments,
                title: form.title,
                description: form.description || undefined,
                priority: form.priority,
                allottedTo: form.allottedTo,
                startDate: form.startDate || undefined,
                deadline: form.deadline,
            });
            await loadTasks();
            setCreated(true);
            setForm(emptyTaskForm());
            setShowForm(false);
        } catch (err) {
            setFormError(err.message || 'Failed to create task');
        } finally {
            setCreating(false);
        }
    };

    return (
        <Module
            id="tasks"
            icon={<FaTasks size={13} color={C.accent} />}
            title="Tasks"
            extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{tasks.length} task{tasks.length === 1 ? '' : 's'}</span>}
        >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button type="button" onClick={openForm} style={secondaryButtonStyle}>
                    <FaPlus size={11} /> Add task
                </button>
            </div>

            {/* ── Create task form ── */}
            {showForm && (
                <div style={{ ...subCardStyle, marginBottom: 16 }}>
                    <div style={subHeaderStyle}>New task</div>
                    <div style={gridTwo}>
                        <Field label="Task name" htmlFor="taskTitle">
                            <input
                                id="taskTitle" type="text" name="title" value={form.title}
                                onChange={handleFieldChange} style={controlStyle}
                            />
                        </Field>
                        <Field label="Priority" htmlFor="taskPriority">
                            <select
                                id="taskPriority" name="priority" value={form.priority}
                                onChange={handleFieldChange} style={{ ...controlStyle, cursor: 'pointer' }}
                            >
                                {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{prettify(p)}</option>)}
                            </select>
                        </Field>
                        <Field label="Start date" htmlFor="taskStartDate">
                            <input
                                id="taskStartDate" type="date" name="startDate" value={form.startDate}
                                onChange={handleFieldChange} style={{ ...controlStyle, cursor: 'pointer' }}
                            />
                        </Field>
                        <Field label="Deadline" htmlFor="taskDeadline">
                            <input
                                id="taskDeadline" type="date" name="deadline" value={form.deadline}
                                onChange={handleFieldChange} style={{ ...controlStyle, cursor: 'pointer' }}
                            />
                        </Field>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <Field label="Description" htmlFor="taskDescription">
                            <textarea
                                id="taskDescription" name="description" rows={2} value={form.description}
                                onChange={handleFieldChange} style={{ ...controlStyle, resize: 'vertical' }}
                            />
                        </Field>
                    </div>

                    <div style={{ ...gridTwo, marginTop: 12 }}>
                        <Field label="Allotted to" htmlFor="taskAllottedTo">
                            <div style={{ position: 'relative', marginBottom: 6 }}>
                                <FaSearch
                                    size={11} color={C.muted}
                                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Search users by name…"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    disabled={loadingUsers || !!usersError}
                                    style={{ ...controlStyle, paddingLeft: 28 }}
                                />
                            </div>
                            <select
                                id="taskAllottedTo" multiple value={form.allottedTo}
                                onChange={(e) => handleMultiSelect('allottedTo', e)}
                                disabled={loadingUsers || !!usersError}
                                style={{ ...controlStyle, cursor: loadingUsers ? 'not-allowed' : 'pointer', minHeight: 90 }}
                            >
                                {filteredUsers.map((u) => (
                                    <option key={u._id} value={u._id}>{userLabel(u)}</option>
                                ))}
                            </select>
                            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4 }}>
                                {loadingUsers
                                    ? 'Loading users…'
                                    : usersError
                                        ? usersError
                                        : `${filteredUsers.length} of ${users.length} shown — Ctrl/Cmd + click to select multiple`}
                            </div>
                        </Field>

                        <Field label="Related documents (optional)" htmlFor="taskDocuments">
                            <select
                                id="taskDocuments" multiple value={form.relatedDocuments}
                                onChange={(e) => handleMultiSelect('relatedDocuments', e)}
                                disabled={!project.documents || project.documents.length === 0}
                                style={{ ...controlStyle, cursor: 'pointer', minHeight: 90 }}
                            >
                                {(project.documents || []).map((doc) => (
                                    <option key={doc._id} value={doc._id}>{doc.name} ({prettify(doc.documentType)})</option>
                                ))}
                            </select>
                            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4 }}>
                                {(!project.documents || project.documents.length === 0)
                                    ? 'No documents on this project yet'
                                    : 'Ctrl/Cmd + click to select multiple'}
                            </div>
                        </Field>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                        <button onClick={handleCreate} disabled={creating} style={{ ...saveButtonStyle(creating), marginTop: 12 }}>
                            <FaSave size={12} /> {creating ? 'Creating…' : 'Create task'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); setForm(emptyTaskForm()); setFormError(''); setUserSearch(''); }}
                            style={{ ...secondaryButtonStyle, marginTop: 12 }}
                        >
                            Cancel
                        </button>
                        {formError && <span style={errorTag}>{formError}</span>}
                    </div>
                </div>
            )}

            {created && <div style={{ ...savedTag, marginLeft: 0, marginBottom: 10 }}>Task created</div>}

            {/* ── Task list ── */}
            {loadingTasks && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading tasks…</div>}
            {!loadingTasks && loadError && <div style={{ fontSize: 13, color: C.destructive }}>{loadError}</div>}

            {!loadingTasks && !loadError && tasks.length === 0 && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No tasks created for this project yet.</div>
            )}

            {!loadingTasks && !loadError && tasks.length > 0 && (
                <div style={tableWrapStyle}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>S.No</th>
                                <th style={thStyle}>Name</th>
                                <th style={thStyle}>Priority</th>
                                <th style={thStyle}>Allotted By</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Users</th>
                                <th style={thStyle}>Docs</th>
                                <th style={thStyle}>Completion Date</th>
                                <th style={thStyle}>Verified Date</th>
                                <th style={thStyle}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((t, i) => {
                                const pStyle = taskPriorityStyle(t.priority);
                                const sStyle = taskStatusStyle(t.status);
                                return (
                                    <tr key={t._id}>
                                        <td style={tdStyle}>{i + 1}</td>
                                        <td style={tdStyle}>{t.title || '—'}</td>
                                        <td style={tdStyle}>
                                            <span style={badgeStyle(pStyle.bg, pStyle.fg)}>{prettify(t.priority)}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <FaUserCircle size={14} color={C.muted} />
                                                {t.allottedBy?.name || '—'}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={badgeStyle(sStyle.bg, sStyle.fg)}>{prettify(t.status)}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <FaUsers size={12} color={C.muted} />
                                                {t.allottedTo?.length || 0}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <FaFileAlt size={12} color={C.muted} />
                                                {t.relatedDocuments?.length || 0}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <FaCheckCircle size={12} color={t.completedAt ? C.success : C.muted} />
                                                {formatDate(t.completedAt)}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <FaShieldAlt size={12} color={t.verifiedAt ? C.success : C.muted} />
                                                {formatDate(t.verifiedAt)}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                type="button"
                                                onClick={() => onBrowseTask && onBrowseTask(t._id)}
                                                style={{ ...secondaryButtonStyle, padding: '6px 12px', fontSize: 11.5 }}
                                            >
                                                View <FaChevronRight size={10} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </Module>
    );
}

/* ── section registry (quick-jump nav) ───────────────────────────────────── */

const SECTIONS = [
    { id: 'basic', label: 'Basic', icon: <FaProjectDiagram size={12} /> },
    { id: 'location', label: 'Location', icon: <FaMapMarkedAlt size={12} /> },
    { id: 'advance', label: 'Advance', icon: <FaSitemap size={12} /> },
    { id: 'financial', label: 'Financial', icon: <FaRupeeSign size={12} /> },
    { id: 'bidding', label: 'Bidding', icon: <FaGavel size={12} /> },
    { id: 'pg', label: 'Advanced Financial', icon: <FaLandmark size={12} /> },
    { id: 'penalty', label: 'Penalty', icon: <FaExclamationTriangle size={12} /> },
    { id: 'security-deposit', label: 'Security Deposit', icon: <FaPiggyBank size={12} /> },
    { id: 'materials', label: 'Materials', icon: <FaBoxes size={12} /> },
    { id: 'status', label: 'Status', icon: <FaClipboardCheck size={12} /> },
    { id: 'documents', label: 'Documents', icon: <FaFileAlt size={12} /> },
    { id: 'tasks', label: 'Tasks', icon: <FaTasks size={12} /> },
    { id: 'timeline', label: 'Timeline', icon: <FaCalendarAlt size={12} /> },
    { id: 'forward', label: 'Forward', icon: <FaUserShield size={12} /> },
];

const navPillStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
    padding: '6px 12px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer',
    border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)',
};

/* ── main component ──────────────────────────────────────────────────────── */

export default function EditProjectDetail() {
    const { id } = useParams();
    const [p, setP] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProject = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getProjectById(id);
            setP(data);
        } catch (err) {
            setError(err.message || 'Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchProject();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Every module calls this after a successful save so the whole page
    // (and every other module's read-only display, like document counts
    // or the header) reflects the latest server state immediately.
    const handleProjectUpdated = (updatedProject) => {
        setP(updatedProject);
    };

    const scrollToSection = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // TODO: wire to the real task-detail route once its exact path is defined,
    // e.g. navigate(`../task/${taskId}`)
    const handleBrowseTask = (taskId) => {
        console.log('Browse task', taskId);
    };

    return (
        <div style={{
            padding: '0 2px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: 'var(--foreground)',
            background: 'var(--background)',
            minHeight: '100vh',
        }}>

            {error && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderRadius: 8, marginBottom: 14, background: 'var(--destructive-bg)',
                    border: '1px solid var(--destructive-border)', fontSize: 13, color: C.destructive,
                }}>
                    <FaTimesCircle size={14} color={C.destructive} /> {error}
                </div>
            )}

            {loading && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    padding: '40px 0', color: 'var(--text-muted)', fontSize: 14,
                }}>
                    <FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading project…
                </div>
            )}

            {!loading && !error && p && (
                <>
                    {/* Identity header + quick-jump nav */}
                    <div style={moduleCardStyle}>
                        <div style={{ ...moduleBodyStyle, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 8, background: 'var(--warning)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <FaProjectDiagram size={17} color={C.primary} />
                            </div>
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)' }}>
                                    Edit — {p.projectName}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.projectId}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 18px 16px' }}>
                            {SECTIONS.map((s) => (
                                <span key={s.id} style={navPillStyle} onClick={() => scrollToSection(s.id)}>
                                    {s.icon} {s.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    <BasicDetailsModule project={p} onUpdated={handleProjectUpdated} />
                    <LocationModule project={p} onUpdated={handleProjectUpdated} />
                    <AdvanceDetailsModule project={p} onUpdated={handleProjectUpdated} />
                    <FinancialDetailsModule project={p} onUpdated={handleProjectUpdated} />
                    <BiddingFinancialsModule project={p} onRefresh={fetchProject} />
                    <PgDetailsModule project={p} onRefresh={fetchProject} />
                    <PenaltyDetailsModule project={p} onRefresh={fetchProject} />
                    <SecurityDepositModule project={p} onRefresh={fetchProject} />
                    <MaterialsModule project={p} />
                    <StatusModule project={p} onUpdated={handleProjectUpdated} />
                    <DocumentsModule project={p} onUpdated={handleProjectUpdated} />
                    <TasksModule project={p} onBrowseTask={handleBrowseTask} />
                    <TimelineModule project={p} onUpdated={handleProjectUpdated} />
                    <ForwardModule project={p} onUpdated={handleProjectUpdated} />
                </>
            )}

            {!loading && !error && !p && (
                <div style={{
                    textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)',
                    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
                }}>
                    Project not found.
                </div>
            )}

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}