import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    FaProjectDiagram, FaMapMarkedAlt, FaSitemap, FaRupeeSign,
    FaFileAlt, FaUserShield, FaClipboardCheck, FaTimesCircle,
    FaTrain, FaIndustry, FaSave, FaPlus, FaPaperPlane, FaExternalLinkAlt,
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
    getUsersList,
    forwardProject
} from '../../services/project.service.js';

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
const SUB_DEPARTMENTS = [
    'engineering', 'electrical', 'mechanical', 'signal_and_telecom',
    'commercial', 'medical', 'personnel', 'operating',
];
const CIRCLES = ['circle', 'zone', 'division'];
const ZONES = ['cr', 'wr', 'wcr', 'ncr', 'nr', 'nwr', 'ner', 'nfr', 'er', 'ecr', 'ecor', 'ser', 'secr', 'sr', 'scr', 'swr', 'krcl', 'mrk'];
const PSU_NAMES = ['ntpc', 'ongc', 'iocl', 'gail', 'bhel', 'sail', 'nhpc'];
const BIDDING_POSITIONS = ['below', 'above', 'at_par'];
const DOCUMENT_TYPES = ['tender_document', 'loa', 'agreement', 'boq', 'drawings', 'nit'];
const PROJECT_STATUSES = ['draft', 'in_progress', 'pending', 'L2', 'L3', 'not_allotted', 'completed'];
const FORWARD_ACTIONS = ['approved', 'returned', 'rejected', 'pending'];

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
            const updated = await updateLocation(project._id, form);
            onUpdated(updated);
            setSaved(true);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Module id="location" icon={<FaMapMarkedAlt size={13} color={C.accent} />} title="Location Details">
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
        zone: project.zone || '',
        subDepartment: project.subDepartment || '',
        circle: project.circle || '',
        division: project.division || '',
        psuName: project.psuName || '',
    });
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

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            const updated = await updateAdvanceDetails(project._id, form);
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
   MODULE 7 — Forward Project → PATCH /v1/forward/:projectId
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

/* ── section registry (quick-jump nav) ───────────────────────────────────── */

const SECTIONS = [
    { id: 'basic', label: 'Basic', icon: <FaProjectDiagram size={12} /> },
    { id: 'location', label: 'Location', icon: <FaMapMarkedAlt size={12} /> },
    { id: 'advance', label: 'Advance', icon: <FaSitemap size={12} /> },
    { id: 'financial', label: 'Financial', icon: <FaRupeeSign size={12} /> },
    { id: 'status', label: 'Status', icon: <FaClipboardCheck size={12} /> },
    { id: 'documents', label: 'Documents', icon: <FaFileAlt size={12} /> },
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
                    <StatusModule project={p} onUpdated={handleProjectUpdated} />
                    <DocumentsModule project={p} onUpdated={handleProjectUpdated} />
                    <ForwardModule project={p} onUpdated={handleProjectUpdated} />                </>
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