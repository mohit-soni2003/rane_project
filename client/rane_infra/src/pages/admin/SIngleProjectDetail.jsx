import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    FaProjectDiagram, FaMapMarkedAlt, FaSitemap, FaRupeeSign,
    FaFileAlt, FaUserShield, FaClipboardCheck, FaExternalLinkAlt,
    FaClock, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaUndo,
    FaTrain, FaIndustry, FaCalendarAlt, FaBoxes, FaTasks, FaUserCircle,
    FaUsers, FaShieldAlt, FaEye,
} from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import { backend_url } from '../../store/keyStore';
import { useAuthStore } from '../../store/authStore';
import AdminHeader from '../../component/header/AdminHeader';

const C = {
    primary: '#6b3e2b',
    accent: '#b95a52',
    success: '#225b31',
    destructive: '#c94a3a',
    muted: '#8b7b74',
    warning: '#4a1f18',
};

/* ── helpers ──────────────────────────────────────────────────────────────── */

const prettify = (v) =>
    typeof v === 'string'
        ? v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : '—';

const dash = (v) => (v === 0 ? '0' : v || v === false ? v : '—');

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const formatDateTime = (d) =>
    d
        ? new Date(d).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
        : '—';

const formatCurrency = (n) =>
    n || n === 0 ? '₹' + Number(n).toLocaleString('en-IN') : '—';

const userLabel = (u) => {
    if (!u) return '—';
    if (typeof u === 'string') return u;
    return u.name || u.email || u._id || '—';
};

// Normalizes a stored document URL that may be missing its scheme
// (e.g. "www.example.com" or a bare Cloudinary host without "https://"),
// which otherwise resolves as relative to the current page.
const toAbsoluteUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('//')) return `https:${url}`;
    return `https://${url}`;
};

const statusStyle = (status) => {
    const map = {
        draft: { bg: 'var(--muted)', fg: 'var(--text-muted)' },
        pending: { bg: 'var(--amber)', fg: 'var(--amber-foreground)' },
        in_progress: { bg: 'var(--info)', fg: 'var(--info-foreground)' },
        L2: { bg: 'var(--warning)', fg: 'var(--warning-foreground)' },
        L3: { bg: 'var(--warning)', fg: 'var(--warning-foreground)' },
        not_allotted: { bg: 'var(--destructive-bg)', fg: 'var(--destructive)' },
        completed: { bg: 'var(--success)', fg: 'var(--success-foreground)' },
    };
    return map[status] || { bg: 'var(--muted)', fg: 'var(--text-muted)' };
};

const actionIcon = (action) => {
    if (action === 'approved') return <FaCheckCircle size={12} color={C.success} />;
    if (action === 'rejected') return <FaTimesCircle size={12} color={C.destructive} />;
    if (action === 'returned') return <FaUndo size={12} color={C.warning} />;
    return <FaInfoCircle size={12} color={C.muted} />;
};

const actionBadgeStyle = (action) => {
    const map = {
        approved: { bg: 'var(--info)', fg: 'var(--info-foreground)' },
        rejected: { bg: 'var(--destructive-bg)', fg: 'var(--destructive)' },
        returned: { bg: 'var(--warning)', fg: 'var(--warning-foreground)' },
        pending: { bg: 'var(--amber)', fg: 'var(--amber-foreground)' },
    };
    return map[action] || { bg: 'var(--muted)', fg: 'var(--text-muted)' };
};

// task overall status -> badge colors (mirrors EditProjectDetail's TasksModule)
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

// Compares today against the task's deadline (calendar-day precision).
// Future deadline -> "N days left". Past deadline -> "N days overdue".
const deadlineDiff = (deadline) => {
    if (!deadline) return { label: '—', color: C.muted };
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const deadlineDay = new Date(deadline);
    deadlineDay.setHours(0, 0, 0, 0);
    const diffDays = Math.round((deadlineDay.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return { label: `${diffDays} day${diffDays === 1 ? '' : 's'} left`, color: diffDays <= 2 ? C.warning : C.success };
    if (diffDays === 0) return { label: 'Due today', color: C.warning };
    return { label: `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`, color: C.destructive };
};

/* ── shared styles ────────────────────────────────────────────────────────── */

// Each section is now its OWN card, not one continuous block —
// that's what makes the page modular: sections can be reordered,
// hidden, or lazy-loaded independently without touching layout.
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

const rowLabelStyle = {
    fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2,
};

const rowValueStyle = { fontSize: 13.5, color: 'var(--foreground)', wordBreak: 'break-word' };

const badgeStyle = (bg, fg) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
    background: bg, color: fg, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap',
});

const subCardStyle = {
    background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 8,
    padding: '12px 14px', marginBottom: 10,
};

const navPillStyle = (active) => ({
    display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
    padding: '6px 12px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer',
    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
    background: active ? 'var(--primary)' : 'var(--secondary)',
    color: active ? '#fff' : 'var(--secondary-foreground)',
    transition: 'background .15s, color .15s, border-color .15s',
});

// Table styles for the Materials / Tasks sections
const tableWrapStyle = { overflowX: 'auto' };

const tableStyle = {
    width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 900,
};

const thStyle = {
    textAlign: 'left', padding: '8px 10px', fontSize: 10.5, fontWeight: 700,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em',
    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
};

const thRightStyle = { ...thStyle, textAlign: 'right' };

const tdStyle = {
    padding: '8px 10px', borderBottom: '1px solid var(--border)',
    color: 'var(--foreground)', whiteSpace: 'nowrap',
};

const tdWrapStyle = { ...tdStyle, whiteSpace: 'normal', minWidth: 160 };

const tdRightStyle = { ...tdStyle, textAlign: 'right' };

const totalRowStyle = {
    fontWeight: 700, color: 'var(--text-strong)', background: 'var(--input)',
};

const viewButtonStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)',
    fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
};

function Field({ label, children }) {
    return (
        <div>
            <div style={rowLabelStyle}>{label}</div>
            <div style={rowValueStyle}>{children}</div>
        </div>
    );
}

// A "module" = one independent, self-contained card for a section.
// Splitting this out means each section owns its own header, spacing,
// and boundary — no shared wrapper, no borderTop dividers to manage.
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

/* ── section registry (drives both nav pills and render order) ──────────── */

const SECTIONS = [
    { id: 'basic', label: 'Basic', icon: <FaProjectDiagram size={12} /> },
    { id: 'location', label: 'Location', icon: <FaMapMarkedAlt size={12} /> },
    { id: 'advance', label: 'Advance', icon: <FaSitemap size={12} /> },
    { id: 'financial', label: 'Financial', icon: <FaRupeeSign size={12} /> },
    { id: 'materials', label: 'Materials', icon: <FaBoxes size={12} /> },
    { id: 'documents', label: 'Documents', icon: <FaFileAlt size={12} /> },
    { id: 'tasks', label: 'Tasks', icon: <FaTasks size={12} /> },
    { id: 'approvals', label: 'Approvals', icon: <FaUserShield size={12} /> },
    { id: 'timeline', label: 'Timeline', icon: <FaCalendarAlt size={12} /> },
];

/* ── main component ──────────────────────────────────────────────────────── */

export default function SingleProjectDetail({ onViewTask } = {}) {
    const { id } = useParams();
    const [p, setP] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [items, setItems] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(true);
    const [itemsError, setItemsError] = useState('');

    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [tasksError, setTasksError] = useState('');

    const fetchProject = async () => {
        setLoading(true);
        setError('');
        try {
            const token = useAuthStore.getState()?.token;
            const res = await fetch(`${backend_url}/project/v1/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: 'include',
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(json.message || 'Failed to load project');
            }

            const data = json.data !== undefined ? json.data : json;
            setP(data);
        } catch (err) {
            setError(err.message || 'Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    // NOTE: the items route lives at /project/:projectId/items (no /v1
    // prefix) in the backend as currently written — matching that here.
    const fetchItems = async () => {
        setItemsLoading(true);
        setItemsError('');
        try {
            const token = useAuthStore.getState()?.token;
            const res = await fetch(`${backend_url}/project/${id}/items`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: 'include',
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(json.message || 'Failed to load items');
            }

            const data = json.data !== undefined ? json.data : json;
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setItemsError(err.message || 'Failed to load items');
        } finally {
            setItemsLoading(false);
        }
    };

    // Tasks route lives at /task/project/:projectId (its own router,
    // not nested under /project) — matching that here the same way
    // fetchItems matches the items route's own path shape.
    const fetchTasks = async () => {
        setTasksLoading(true);
        setTasksError('');
        try {
            const token = useAuthStore.getState()?.token;
            const res = await fetch(`${backend_url}/task/project/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: 'include',
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(json.message || 'Failed to load tasks');
            }

            const data = json.data !== undefined ? json.data : json;
            setTasks(Array.isArray(data) ? data : []);
        } catch (err) {
            setTasksError(err.message || 'Failed to load tasks');
        } finally {
            setTasksLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProject();
            fetchItems();
            fetchTasks();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const scrollToSection = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const itemsTotal = items.reduce((sum, it) => sum + (Number(it.total) || 0), 0);

    return (
        <>
        <AdminHeader></AdminHeader>
         <div style={{
            padding: '0 2px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: 'var(--foreground)',
            background: 'var(--background)',
            minHeight: '100vh',
        }}>

            {/* Error */}
            {error && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderRadius: 8, marginBottom: 14, background: 'var(--destructive-bg)',
                    border: '1px solid var(--destructive-border)', fontSize: 13, color: C.destructive,
                }}>
                    <FaTimesCircle size={14} color={C.destructive} /> {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    padding: '40px 0', color: 'var(--text-muted)', fontSize: 14,
                }}>
                    <FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading project…
                </div>
            )}

            {!loading && !error && p && (() => {
                const st = statusStyle(p.status);
                const isRailway = p.department === 'indian_railway';
                const isPsu = p.department === 'psu';
                const f = p.financials || {};
                const recovery = f.recoveryAtContractEnd || {};

                return (
                    <>
                        {/* ── Identity module ── */}
                        <div style={moduleCardStyle}>
                            <div style={{ ...moduleBodyStyle, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <div style={{
                                    width: 38, height: 38, borderRadius: 8, background: 'var(--warning)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <FaProjectDiagram size={17} color={C.primary} />
                                </div>
                                <div style={{ flex: 1, minWidth: 200 }}>
                                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.25 }}>
                                        {dash(p.projectName)}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                        {dash(p.projectId)}
                                    </div>
                                </div>
                                <span style={badgeStyle(st.bg, st.fg)}>{prettify(p.status)}</span>
                            </div>

                            {/* Quick-jump nav — lets you drop to any module without scrolling */}
                            <div style={{
                                display: 'flex', gap: 8, overflowX: 'auto', padding: '0 18px 16px',
                            }}>
                                {SECTIONS.map((s) => (
                                    <span key={s.id} style={navPillStyle(false)} onClick={() => scrollToSection(s.id)}>
                                        {s.icon} {s.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* ── 1. Basic Details ── */}
                        <Module id="basic" icon={<FaProjectDiagram size={13} color={C.accent} />} title="Basic Details">
                            <div style={gridTwo}>
                                <Field label="Project ID">{dash(p.projectId)}</Field>
                                <Field label="Project name">{dash(p.projectName)}</Field>
                                <Field label="Status">{prettify(p.status)}</Field>
                                <Field label="Created by">{userLabel(p.createdBy)}</Field>
                            </div>
                            <div style={{ marginTop: 10 }}>
                                <Field label="Description">{dash(p.description)}</Field>
                            </div>
                        </Module>

                        {/* ── 2. Location Details ── */}
                        <Module id="location" icon={<FaMapMarkedAlt size={13} color={C.accent} />} title="Location Details">
                            <div style={gridTwo}>
                                <Field label="State">{dash(p.location?.state)}</Field>
                                <Field label="City">{dash(p.location?.city)}</Field>
                                <Field label="District">{dash(p.location?.district)}</Field>
                                <Field label="Pincode">{dash(p.location?.pincode)}</Field>
                            </div>
                            <div style={{ marginTop: 10 }}>
                                <Field label="Site address">{dash(p.location?.siteAddress)}</Field>
                            </div>
                        </Module>

                        {/* ── 3. Advance Project Details ── */}
                        <Module id="advance" icon={<FaSitemap size={13} color={C.accent} />} title="Advance Project Details">
                            <div style={gridTwo}>
                                <Field label="Project type">{prettify(p.projectType)}</Field>
                                <Field label="Tender type">{prettify(p.tenderType)}</Field>
                                <Field label="Department">{prettify(p.department)}</Field>
                                <Field label="Contract type">{prettify(p.contractType)}</Field>
                                <Field label="Bidding type">{prettify(p.biddingType)}</Field>
                                <Field label="Expenditure type">{prettify(p.expenditureType)}</Field>
                                <Field label="Ranking order for bid">{prettify(p.rankingOrderForBid)}</Field>
                            </div>

                            {isRailway && (
                                <>
                                    <div style={subHeaderStyle}>
                                        <FaTrain size={12} color={C.accent} /> Railway details
                                    </div>
                                    <div style={gridTwo}>
                                        <Field label="Zone">{p.zone ? p.zone.toUpperCase() : '—'}</Field>
                                        <Field label="Sub-department">{prettify(p.subDepartment)}</Field>
                                        <Field label="Circle level">{prettify(p.circle)}</Field>
                                        <Field label="Division">{dash(p.division)}</Field>
                                    </div>
                                </>
                            )}

                            {isPsu && (
                                <>
                                    <div style={subHeaderStyle}>
                                        <FaIndustry size={12} color={C.accent} /> PSU details
                                    </div>
                                    <div style={gridTwo}>
                                        <Field label="PSU name">{p.psuName ? p.psuName.toUpperCase() : '—'}</Field>
                                    </div>
                                </>
                            )}
                        </Module>

                        {/* ── 4. Financial Details ── */}
                        <Module id="financial" icon={<FaRupeeSign size={13} color={C.accent} />} title="Financial Details">
                            <div style={gridTwo}>
                                <Field label="Tender amount">{formatCurrency(f.tenderAmount)}</Field>
                                <Field label="Bidding position">{prettify(f.biddingPosition)}</Field>
                                <Field label="Bidding percentage">{f.biddingPercentage || f.biddingPercentage === 0 ? `${f.biddingPercentage}%` : '—'}</Field>
                                <Field label="Actual bidding amount">{formatCurrency(f.actualBiddingAmount)}</Field>
                            </div>

                            <div style={subHeaderStyle}>Performance guarantee</div>
                            <div style={gridTwo}>
                                <Field label="PG amount">{formatCurrency(f.pgAmount)}</Field>
                                <Field label="Actual PG amount">{formatCurrency(f.actualPgAmount)}</Field>
                                <Field label="PG maturity date">{formatDate(f.pgMaturityDate)}</Field>
                                <Field label="PG maturity interest">{formatCurrency(f.pgMaturityInterest)}</Field>
                                <Field label="Rate of interest">{f.rateOfInterest || f.rateOfInterest === 0 ? `${f.rateOfInterest}%` : '—'}</Field>
                                <Field label="Duration (days)">{dash(f.durationInDays)}</Field>
                            </div>

                            <div style={subHeaderStyle}>Deposit</div>
                            <div style={gridTwo}>
                                <Field label="Deposit account no.">{dash(f.depositAccountNo)}</Field>
                                <Field label="Deposit start date">{formatDate(f.depositStartDate)}</Field>
                            </div>

                            <div style={subHeaderStyle}>Penalty</div>
                            <div style={gridTwo}>
                                <Field label="Penalty">{formatCurrency(f.penalty)}</Field>
                                <Field label="Penalty ticket no.">{dash(f.penaltyTicketNo)}</Field>
                            </div>

                            <div style={subHeaderStyle}>Recovery at contract end</div>
                            <div style={gridTwo}>
                                <Field label="Bill amount">{formatCurrency(recovery.billAmount)}</Field>
                                <Field label="Recovery amount">{formatCurrency(recovery.recoveryAmount)}</Field>
                                <Field label="Bill number">{dash(recovery.billNumber)}</Field>
                                <Field label="Recovery description">{dash(recovery.recoveryDesc)}</Field>
                            </div>
                        </Module>

                        {/* ── 5. Materials ── */}
                        <Module
                            id="materials"
                            icon={<FaBoxes size={13} color={C.accent} />}
                            title="Materials"
                            extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{items.length} item{items.length === 1 ? '' : 's'}</span>}
                        >
                            {itemsLoading && (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading items…</div>
                            )}

                            {!itemsLoading && itemsError && (
                                <div style={{ fontSize: 13, color: C.destructive }}>{itemsError}</div>
                            )}

                            {!itemsLoading && !itemsError && items.length === 0 && (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No items added yet.</div>
                            )}

                            {!itemsLoading && !itemsError && items.length > 0 && (
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
                                                <th style={thRightStyle}>Profit/Loss %</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((it, i) => (
                                                <tr key={it._id || i}>
                                                    <td style={tdStyle}>{dash(it.itemNo)}</td>
                                                    <td style={tdWrapStyle}>{dash(it.name)}</td>
                                                    <td style={tdWrapStyle}>{dash(it.description)}</td>
                                                    <td style={tdStyle}>{prettify(it.unit)}</td>
                                                    <td style={tdRightStyle}>{formatCurrency(it.railwayRate)}</td>
                                                    <td style={tdRightStyle}>{formatCurrency(it.ourRate)}</td>
                                                    <td style={tdRightStyle}>{formatCurrency(it.marketRate)}</td>
                                                    <td style={tdRightStyle}>{dash(it.quantity)}</td>
                                                    <td style={tdRightStyle}>{formatCurrency(it.installation)}</td>
                                                    <td style={tdRightStyle}>{formatCurrency(it.total)}</td>
                                                    <td style={tdRightStyle}>
                                                        {it.profitLossPercent || it.profitLossPercent === 0 ? `${it.profitLossPercent}%` : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr style={totalRowStyle}>
                                                <td style={tdStyle} colSpan={9}>Total</td>
                                                <td style={tdRightStyle}>{formatCurrency(itemsTotal)}</td>
                                                <td style={tdRightStyle}></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </Module>

                        {/* ── 6. Documents ── */}
                        <Module
                            id="documents"
                            icon={<FaFileAlt size={13} color={C.accent} />}
                            title="Documents"
                            extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{p.documents?.length || 0} file{p.documents?.length === 1 ? '' : 's'}</span>}
                        >
                            {p.documents && p.documents.length ? (
                                p.documents.map((doc, i) => (
                                    <div key={doc._id || i} style={{
                                        ...subCardStyle, display: 'flex', alignItems: 'center', gap: 9,
                                    }}>
                                        <FaFileAlt size={15} color={C.accent} style={{ flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {dash(doc.name)}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                                {prettify(doc.documentType)} · uploaded by {userLabel(doc.uploadedBy)} · {formatDate(doc.uploadedAt)}
                                            </div>
                                        </div>
                                        {doc.url && (
                                            <a href={toAbsoluteUrl(doc.url)} target="_blank" rel="noreferrer"
                                                style={{ color: 'var(--link)', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, flexShrink: 0 }}>
                                                Open <FaExternalLinkAlt size={11} />
                                            </a>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No documents attached.</div>
                            )}
                        </Module>

                        {/* ── 7. Tasks ── */}
                        <Module
                            id="tasks"
                            icon={<FaTasks size={13} color={C.accent} />}
                            title="Tasks"
                            extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{tasks.length} task{tasks.length === 1 ? '' : 's'}</span>}
                        >
                            {tasksLoading && (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading tasks…</div>
                            )}

                            {!tasksLoading && tasksError && (
                                <div style={{ fontSize: 13, color: C.destructive }}>{tasksError}</div>
                            )}

                            {!tasksLoading && !tasksError && tasks.length === 0 && (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No tasks created for this project yet.</div>
                            )}

                            {!tasksLoading && !tasksError && tasks.length > 0 && (
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
                                                <th style={thStyle}>Time Left / Overdue</th>
                                                <th style={thStyle}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.map((t, i) => {
                                                const pStyle = taskPriorityStyle(t.priority);
                                                const sStyle = taskStatusStyle(t.status);
                                                const dl = deadlineDiff(t.deadline);
                                                return (
                                                    <tr key={t._id || i}>
                                                        <td style={tdStyle}>{i + 1}</td>
                                                        <td style={tdWrapStyle}>{dash(t.title)}</td>
                                                        <td style={tdStyle}>
                                                            <span style={badgeStyle(pStyle.bg, pStyle.fg)}>{prettify(t.priority)}</span>
                                                        </td>
                                                        <td style={tdStyle}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <FaUserCircle size={14} color={C.muted} />
                                                                {userLabel(t.allottedBy)}
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
                                                            <span style={{ color: dl.color, fontWeight: 600 }}>{dl.label}</span>
                                                        </td>
                                                        <td style={tdStyle}>
                                                            <button
                                                                type="button"
                                                                onClick={() => onViewTask && onViewTask(t._id)}
                                                                style={viewButtonStyle}
                                                            >
                                                                <FaEye size={11} /> View
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

                        {/* ── 8. Approvals ── */}
                        <Module id="approvals" icon={<FaUserShield size={13} color={C.accent} />} title="Approvals">
                            <div style={gridTwo}>
                                <Field label="Current authority">{userLabel(p.currentAuthority)}</Field>
                                <Field label="Next authority">{userLabel(p.nextAuthority)}</Field>
                            </div>

                            <div style={subHeaderStyle}>
                                <FaClipboardCheck size={12} color={C.accent} /> Approval trail ({p.approvals?.length || 0})
                            </div>
                            {p.approvals && p.approvals.length ? (
                                [...p.approvals].reverse().map((a, i) => {
                                    const ab = actionBadgeStyle(a.action);
                                    return (
                                        <div key={a._id || i} style={subCardStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, flexWrap: 'wrap' }}>
                                                <span style={badgeStyle('var(--secondary)', 'var(--secondary-foreground)')}>{dash(a.stage)}</span>
                                                <span style={badgeStyle(ab.bg, ab.fg)}>
                                                    {actionIcon(a.action)} {prettify(a.action)}
                                                </span>
                                                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                                    <FaClock size={10} style={{ marginRight: 4, verticalAlign: -1 }} />
                                                    {formatDateTime(a.actedAt)}
                                                </span>
                                            </div>
                                            <div style={gridTwo}>
                                                <Field label="Actor">{userLabel(a.actor)}</Field>
                                                <Field label="Remark">{dash(a.remark)}</Field>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No approval actions yet.</div>
                            )}
                        </Module>

                        {/* ── 9. Timeline ── */}
                        <Module id="timeline" icon={<FaCalendarAlt size={13} color={C.accent} />} title="Timeline">
                            <div style={gridTwo}>
                                <Field label="Start date">{formatDate(p.startDate)}</Field>
                                <Field label="End date">{formatDate(p.endDate)}</Field>
                                <Field label="Estimated completion">{formatDate(p.estimatedCompletionDate)}</Field>
                                <Field label="Created at">{formatDateTime(p.createdAt)}</Field>
                                <Field label="Last updated">{formatDateTime(p.updatedAt)}</Field>
                            </div>
                        </Module>
                    </>
                );
            })()}

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
        </>
       
    );
}