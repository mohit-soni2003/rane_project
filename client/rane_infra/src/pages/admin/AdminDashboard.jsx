import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaProjectDiagram, FaFileInvoiceDollar, FaRupeeSign, FaPiggyBank,
    FaCheckCircle, FaChartPie, FaChartBar, FaEye, FaTimesCircle,
} from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import { getProjects } from '../../services/project.service.js';
import { getProjectBills } from '../../services/projectBillService.js';

const C = {
    primary: '#6b3e2b',
    accent: '#b95a52',
    success: '#225b31',
    destructive: '#c94a3a',
    muted: '#8b7b74',
};

// Fixed palette for chart segments — independent of the app's CSS-variable
// theme so the donut/bars stay legible regardless of dark/light mode.
const STATUS_COLORS = {
    draft: '#8b7b74',
    pending: '#d8a13a',
    in_progress: '#3b7dd8',
    L2: '#c98a2b',
    L3: '#a85c1f',
    not_allotted: '#c94a3a',
    completed: '#225b31',
};

const BAR_PALETTE = ['#6b3e2b', '#b95a52', '#3b7dd8', '#225b31', '#d8a13a', '#8b7b74'];

const prettify = (v) =>
    typeof v === 'string' ? v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

const formatCurrency = (n) =>
    n || n === 0 ? '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '₹0';

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/* ── shared styles — same theme as the rest of the admin pages ── */

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

const statGridStyle = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 14,
};

const statCardStyle = {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
    padding: '16px 18px', boxShadow: '0 2px 8px var(--shadow-color)',
    display: 'flex', alignItems: 'center', gap: 14,
};

const statIconWrapStyle = (bg) => ({
    width: 42, height: 42, borderRadius: 10, background: bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
});

const statLabelStyle = {
    fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3,
};

const statValueStyle = { fontSize: 19, fontWeight: 700, color: 'var(--text-strong)' };

const twoColGrid = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14,
};

const tableWrapStyle = { overflowX: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 640 };
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
const tdRightStyle = { ...tdStyle, textAlign: 'right' };

const viewButtonStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)',
    fontSize: 11, fontWeight: 600, cursor: 'pointer',
};

const legendDotStyle = (color) => ({
    width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0,
});

function StatCard({ icon, iconBg, label, value }) {
    return (
        <div style={statCardStyle}>
            <div style={statIconWrapStyle(iconBg)}>{icon}</div>
            <div>
                <div style={statLabelStyle}>{label}</div>
                <div style={statValueStyle}>{value}</div>
            </div>
        </div>
    );
}

function Module({ icon, title, extra, children }) {
    return (
        <div style={moduleCardStyle}>
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

/* ── CSS-only donut chart (no charting library needed) ──────────────────── */
function DonutChart({ segments }) {
    // segments: [{ label, value, color }]
    const total = segments.reduce((s, seg) => s + seg.value, 0);

    let cumulative = 0;
    const stops = segments.map((seg) => {
        const start = total ? (cumulative / total) * 360 : 0;
        cumulative += seg.value;
        const end = total ? (cumulative / total) * 360 : 0;
        return `${seg.color} ${start}deg ${end}deg`;
    });

    const gradient = total
        ? `conic-gradient(${stops.join(', ')})`
        : 'conic-gradient(var(--muted) 0deg 360deg)';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
            <div style={{
                width: 130, height: 130, borderRadius: '50%', background: gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                <div style={{
                    width: 84, height: 84, borderRadius: '50%', background: 'var(--card)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-strong)' }}>{total}</div>
                    <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Projects</div>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 160 }}>
                {segments.map((seg) => (
                    <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                        <span style={legendDotStyle(seg.color)} />
                        <span style={{ color: 'var(--foreground)', flex: 1 }}>{prettify(seg.label)}</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{seg.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── CSS-only horizontal bar chart (no charting library needed) ─────────── */
function BarRows({ rows }) {
    // rows: [{ label, value, color }]
    const max = Math.max(1, ...rows.map((r) => r.value));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rows.map((r) => (
                <div key={r.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{r.label}</span>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{formatCurrency(r.value)}</span>
                    </div>
                    <div style={{ background: 'var(--input)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                        <div style={{
                            width: `${(r.value / max) * 100}%`, height: '100%',
                            background: r.color, borderRadius: 6, transition: 'width .3s ease',
                        }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── main component ──────────────────────────────────────────────────────── */

export default function AdminDashboard() {
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [bills, setBills] = useState([]); // flattened, each tagged with its project
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadDashboard = async () => {
        setLoading(true);
        setError('');
        try {
            const projectList = await getProjects({ scope: 'all' });
            const list = Array.isArray(projectList) ? projectList : [];
            setProjects(list);

            // NOTE: there's no cross-project "list all bills" endpoint yet,
            // so this fetches each project's bills in parallel and flattens
            // them here. Fine for moderate project counts — if this ever
            // gets slow, the real fix is a backend endpoint that returns
            // bill totals per project (or all bills) in one call.
            const perProjectBills = await Promise.all(
                list.map((p) =>
                    getProjectBills(p._id)
                        .then((b) => (Array.isArray(b) ? b.map((bill) => ({ ...bill, projectRef: p })) : []))
                        .catch(() => [])
                )
            );
            setBills(perProjectBills.flat());
        } catch (err) {
            setError(err.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const stats = useMemo(() => {
        const totalProjects = projects.length;
        const activeProjects = projects.filter((p) => p.status === 'in_progress').length;

        const totalGrossBilled = bills.reduce((sum, b) => sum + (Number(b.grossAmount) || 0), 0);
        const totalRecoveries = bills.reduce(
            (sum, b) => sum + (b.recovery || []).reduce((s, r) => s + (Number(r.recoveryAmt) || 0), 0),
            0
        );
        const netPayable = totalGrossBilled - totalRecoveries;

        const statusCounts = {};
        projects.forEach((p) => {
            const key = p.status || 'draft';
            statusCounts[key] = (statusCounts[key] || 0) + 1;
        });

        const statusSegments = Object.entries(statusCounts).map(([status, value]) => ({
            label: status,
            value,
            color: STATUS_COLORS[status] || C.muted,
        }));

        // Top 5 projects by total gross billed amount.
        const byProject = {};
        bills.forEach((b) => {
            const pid = b.projectRef?._id;
            if (!pid) return;
            if (!byProject[pid]) byProject[pid] = { name: b.projectRef.projectName, total: 0 };
            byProject[pid].total += Number(b.grossAmount) || 0;
        });
        const topProjects = Object.values(byProject)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
            .map((p, i) => ({ label: p.name, value: p.total, color: BAR_PALETTE[i % BAR_PALETTE.length] }));

        // Recent bills, newest first.
        const recentBills = [...bills]
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 8);

        return {
            totalProjects, activeProjects, totalBills: bills.length,
            totalGrossBilled, totalRecoveries, netPayable,
            statusSegments, topProjects, recentBills,
        };
    }, [projects, bills]);

    return (
        <div style={{
            padding: '0 2px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: 'var(--foreground)',
            background: 'var(--background)',
            minHeight: '100vh',
        }}>
            {/* Header */}
            <div style={moduleCardStyle}>
                <div style={{ ...moduleBodyStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 8, background: 'var(--warning)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <FaChartPie size={17} color={C.primary} />
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)' }}>
                        Dashboard
                    </div>
                </div>
            </div>

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
                    <FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading dashboard…
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* ── Stat cards ── */}
                    <div style={statGridStyle}>
                        <StatCard
                            icon={<FaProjectDiagram size={18} color="#fff" />}
                            iconBg={C.primary}
                            label="Total projects"
                            value={stats.totalProjects}
                        />
                        <StatCard
                            icon={<FaCheckCircle size={18} color="#fff" />}
                            iconBg="#3b7dd8"
                            label="Active projects"
                            value={stats.activeProjects}
                        />
                        <StatCard
                            icon={<FaFileInvoiceDollar size={18} color="#fff" />}
                            iconBg={C.accent}
                            label="Total bills"
                            value={stats.totalBills}
                        />
                        <StatCard
                            icon={<FaRupeeSign size={18} color="#fff" />}
                            iconBg={C.success}
                            label="Gross billed"
                            value={formatCurrency(stats.totalGrossBilled)}
                        />
                        <StatCard
                            icon={<FaPiggyBank size={18} color="#fff" />}
                            iconBg="#d8a13a"
                            label="Total recoveries"
                            value={formatCurrency(stats.totalRecoveries)}
                        />
                        <StatCard
                            icon={<FaRupeeSign size={18} color="#fff" />}
                            iconBg={C.destructive}
                            label="Net payable"
                            value={formatCurrency(stats.netPayable)}
                        />
                    </div>

                    {/* ── Charts ── */}
                    <div style={twoColGrid}>
                        <Module icon={<FaChartPie size={13} color={C.accent} />} title="Projects by Status">
                            {stats.totalProjects > 0 ? (
                                <DonutChart segments={stats.statusSegments} />
                            ) : (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No projects yet.</div>
                            )}
                        </Module>

                        <Module icon={<FaChartBar size={13} color={C.accent} />} title="Top Projects by Billed Amount">
                            {stats.topProjects.length > 0 ? (
                                <BarRows rows={stats.topProjects} />
                            ) : (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No bills created yet.</div>
                            )}
                        </Module>
                    </div>

                    {/* ── Recent bills ── */}
                    <Module
                        icon={<FaFileInvoiceDollar size={13} color={C.accent} />}
                        title="Recent Bills"
                        extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{stats.recentBills.length} shown</span>}
                    >
                        {stats.recentBills.length > 0 ? (
                            <div style={tableWrapStyle}>
                                <table style={tableStyle}>
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>Bill No.</th>
                                            <th style={thStyle}>Project</th>
                                            <th style={thStyle}>LOA No.</th>
                                            <th style={thRightStyle}>Gross Amount</th>
                                            <th style={thStyle}>Created</th>
                                            <th style={thStyle}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentBills.map((b, i) => (
                                            <tr key={b._id || i}>
                                                <td style={tdStyle}>{b.billNo || '—'}</td>
                                                <td style={tdStyle}>{b.projectRef?.projectName || '—'}</td>
                                                <td style={tdStyle}>{b.loaNo || '—'}</td>
                                                <td style={tdRightStyle}>{formatCurrency(b.grossAmount)}</td>
                                                <td style={tdStyle}>{formatDate(b.createdAt)}</td>
                                                <td style={tdStyle}>
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/admin/project-bill/${b._id}`)}
                                                        style={viewButtonStyle}
                                                    >
                                                        <FaEye size={10} /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No bills created yet.</div>
                        )}
                    </Module>
                </>
            )}

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}