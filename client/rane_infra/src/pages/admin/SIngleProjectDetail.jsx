import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    FaProjectDiagram, FaMapMarkedAlt, FaSitemap, FaRupeeSign,
    FaFileAlt, FaUserShield, FaClipboardCheck, FaExternalLinkAlt,
    FaClock, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaUndo,
    FaTrain, FaIndustry, FaCalendarAlt,
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
    { id: 'documents', label: 'Documents', icon: <FaFileAlt size={12} /> },
    { id: 'approvals', label: 'Approvals', icon: <FaUserShield size={12} /> },
    { id: 'timeline', label: 'Timeline', icon: <FaCalendarAlt size={12} /> },
];

/* ── main component ──────────────────────────────────────────────────────── */

export default function SingleProjectDetail() {
    const { id } = useParams();
    const [p, setP] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    useEffect(() => {
        if (id) fetchProject();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const scrollToSection = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

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

                        {/* ── 5. Documents ── */}
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

                        {/* ── 6. Approvals ── */}
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

                        {/* ── 7. Timeline ── */}
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