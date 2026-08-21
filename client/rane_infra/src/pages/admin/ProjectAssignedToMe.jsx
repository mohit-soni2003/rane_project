import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaProjectDiagram, FaSitemap, FaTimesCircle, FaUserCircle, FaCheckCircle,
} from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import { getMyActionableProjects } from '../../services/project.service.js';

const C = {
    primary: '#6b3e2b',
    accent: '#b95a52',
    destructive: '#c94a3a',
    success: '#225b31',
    muted: '#8b7b74',
};

/* ── helpers ──────────────────────────────────────────────────────────────── */

const prettify = (v) =>
    typeof v === 'string'
        ? v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : '—';

const dash = (v) => (v === 0 ? '0' : v || v === false ? v : '—');

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

/* ── shared styles ────────────────────────────────────────────────────────── */

const cardStyle = {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
    marginBottom: 14, boxShadow: '0 2px 8px var(--shadow-color)', overflow: 'hidden',
};

const sectionStyle = { borderTop: '1px solid var(--divider)', padding: '16px 18px' };

const sectionHeaderStyle = {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
    fontWeight: 700, fontSize: 13, color: 'var(--text-strong)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
};

const gridTwo = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px 18px',
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

function Field({ label, children }) {
    return (
        <div>
            <div style={rowLabelStyle}>{label}</div>
            <div style={rowValueStyle}>{children}</div>
        </div>
    );
}

function Section({ icon, title, children }) {
    return (
        <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
                {icon}
                <span>{title}</span>
            </div>
            {children}
        </div>
    );
}

/* ── one project card ────────────────────────────────────────────────────── */

function ProjectCard({ p, onOpen, onEdit }) {
    const st = statusStyle(p.status);

    // "Last forwarded authority" = the actor of the most recent
    // approval-trail entry (approvals[] is pushed to in order,
    // so the last element is the most recent action taken).
    const lastForward = p.approvals && p.approvals.length
        ? p.approvals[p.approvals.length - 1]
        : null;
    const forwardedBy = lastForward?.actor;
    const forwarderName = forwardedBy
        ? (typeof forwardedBy === 'string' ? forwardedBy : (forwardedBy.name || forwardedBy.email || '—'))
        : null;
    const forwarderProfile = forwardedBy && typeof forwardedBy === 'object' ? forwardedBy.profile : null;

    return (
        <div style={cardStyle}>

            {/* ── Header ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', flexWrap: 'wrap',
            }}>
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

            {/* ── Basic Details ── */}
            <Section icon={<FaProjectDiagram size={13} color={C.accent} />} title="Basic Details">
                <div style={gridTwo}>
                    <Field label="Project ID">{dash(p.projectId)}</Field>
                    <Field label="Project name">{dash(p.projectName)}</Field>
                    <Field label="Status">{prettify(p.status)}</Field>
                </div>
                <div style={{ marginTop: 10 }}>
                    <Field label="Description">{dash(p.description)}</Field>
                </div>
            </Section>

            {/* ── Advance Details (subset) ── */}
            <Section icon={<FaSitemap size={13} color={C.accent} />} title="Advance Details">
                <div style={gridTwo}>
                    <Field label="Project type">{prettify(p.projectType)}</Field>
                    <Field label="Tender type">{prettify(p.tenderType)}</Field>
                    <Field label="Department">{prettify(p.department)}</Field>
                    <Field label="Contract type">{prettify(p.contractType)}</Field>
                    <Field label="Bidding type">{prettify(p.biddingType)}</Field>
                </div>
            </Section>

            {/* ── Last forwarded authority ── */}
            <Section icon={<FaUserCircle size={13} color={C.accent} />} title="Last Forwarded By">
                {forwarderName ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {forwarderProfile ? (
                            <img
                                src={forwarderProfile}
                                alt={forwarderName}
                                style={{
                                    width: 40, height: 40, borderRadius: '50%', objectFit: 'cover',
                                    border: '1px solid var(--border)', flexShrink: 0,
                                }}
                            />
                        ) : (
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%', background: 'var(--secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <FaUserCircle size={22} color={C.muted} />
                            </div>
                        )}
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>
                                {forwarderName}
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>
                                {prettify(lastForward.stage)} · {prettify(lastForward.action)}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No forwarding history yet.</div>
                )}
            </Section>

            {/* ── Action ── */}
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--divider)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                    onClick={() => onOpen(p._id)}
                    style={{
                        padding: '8px 16px', borderRadius: 8, border: 'none',
                        background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                >
                    View full details
                </button>
                <button
                    onClick={() => onEdit(p._id)}
                    style={{
                        padding: '8px 16px', borderRadius: 8, border: 'none',
                        background: 'var(--primary)', color: '#fff',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                >
                    Take Action
                </button>
            </div>
        </div>
    );
}

/* ── main component ──────────────────────────────────────────────────────── */

export default function ProjectAssignedToMe() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProjects = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getMyActionableProjects();
            setProjects(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load assigned projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const openDetails = (id) => navigate(`../project/${id}`);
    const openEdit = (id) => navigate(`../project/edit/${id}`);

    return (
        <div style={{
            padding: '0 2px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: 'var(--foreground)',
            background: 'var(--background)',
            minHeight: '100vh',
        }}>

            {/* Title bar */}
            <div style={{
                background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)',
                boxShadow: '0 2px 10px var(--shadow-color)', padding: '14px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 10, marginBottom: 16,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <FaProjectDiagram size={15} color={C.primary} />
                    </div>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                            Assigned to Me
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                            {loading ? 'Loading…' : `${projects.length} project${projects.length === 1 ? '' : 's'} where you are the current authority`}
                        </div>
                    </div>
                </div>
                <button
                    onClick={fetchProjects}
                    disabled={loading}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
                        border: '1px solid var(--border)', background: 'var(--secondary)',
                        color: 'var(--secondary-foreground)', fontSize: 13, fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                    }}
                >
                    <FiRefreshCw size={13} style={loading ? { animation: 'spin 1s linear infinite' } : undefined} />
                    Refresh
                </button>
            </div>

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
                    <FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading projects…
                </div>
            )}

            {/* Empty */}
            {!loading && !error && projects.length === 0 && (
                <div style={{
                    textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)',
                    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
                }}>
                    <FaCheckCircle size={28} color={C.success} style={{ marginBottom: 10 }} />
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Nothing pending</div>
                    <div style={{ fontSize: 12.5, marginTop: 4 }}>You're all caught up — no projects are currently waiting on you.</div>
                </div>
            )}

            {/* List */}
            {!loading && projects.map((p) => (
                <ProjectCard key={p._id} p={p} onOpen={openDetails} onEdit={openEdit} />
            ))}

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}