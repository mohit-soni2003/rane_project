import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaProjectDiagram, FaExclamationTriangle, FaClock, FaFileInvoiceDollar,
    FaMoneyCheckAlt, FaChartPie, FaChartBar, FaChartLine, FaTimesCircle,
    FaFileSignature, FaShareSquare, FaUndo, FaFileAlt, FaHistory,
    FaUsers, FaTasks, FaListAlt,
} from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import {
    getAdminSystemCounts,
    getAdminBillOverview,
    getAdminPaymentOverview,
    getAdminCashFlow,
    getAdminProjectStatus,
    getAdminTaskStatus,
    getAdminDfsStatus,
    getAdminDocumentStatus,
    getAdminApprovalsQueue,
    getAdminRecentActivity,
} from '../../services/dashboardService';
import StaffHeader from '../../component/header/StaffHeader';

const C = {
    primary: '#6b3e2b',
    accent: '#b95a52',
    success: '#225b31',
    destructive: '#c94a3a',
    muted: '#8b7b74',
};

const BAR_PALETTE = ['#6b3e2b', '#b95a52', '#3b7dd8', '#225b31', '#d8a13a', '#8b7b74'];

const PROJECT_STATUS_COLORS = {
    draft: '#8b7b74',
    pending: '#d8a13a',
    not_allotted: '#c94a3a',
    alloted: '#3b9c6b',
    in_progress: '#3b7dd8',
    L1: '#e0b34c',
    L2: '#c98a2b',
    L3: '#a85c1f',
    completed: '#225b31',
};

const TASK_STATUS_COLORS = {
    pending: '#d8a13a',
    in_progress: '#3b7dd8',
    submitted: '#6b3e2b',
    completed: '#225b31',
    overdue: '#c94a3a',
    rejected: '#7a2020',
};

const DFS_STATUS_COLORS = {
    pending: '#d8a13a',
    'in-review': '#3b7dd8',
    approved: '#225b31',
    rejected: '#c94a3a',
};

const DOCUMENT_STATUS_COLORS = {
    pending: '#d8a13a',
    accepted: '#225b31',
    rejected: '#c94a3a',
};

const BILL_STATUS_COLORS = {
    Unpaid: '#8b7b74',
    Pending: '#d8a13a',
    Overdue: '#c94a3a',
    Paid: '#225b31',
    Sanctioned: '#3b7dd8',
    Reject: '#7a2020',
    Withdrawed: '#6b3e2b',
};

// Payment.status has no fixed enum in the schema — map the common values
// seen in practice, and fall back to the bar palette for anything else.
const PAYMENT_STATUS_COLORS = {
    Pending: '#d8a13a',
    Approved: '#3b7dd8',
    Processing: '#3b7dd8',
    Paid: '#225b31',
    Completed: '#225b31',
    Rejected: '#c94a3a',
    Failed: '#7a2020',
};

const APPROVAL_META = {
    agreement_signature: { icon: FaFileSignature, bg: '#3b7dd8' },
    agreement_extension: { icon: FaFileSignature, bg: '#d8a13a' },
    file_forward: { icon: FaShareSquare, bg: '#6b3e2b' },
    bill_withdrawal: { icon: FaUndo, bg: '#c94a3a' },
    document: { icon: FaFileAlt, bg: '#225b31' },
};

const prettify = (v) =>
    typeof v === 'string' ? v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

const formatCurrency = (n) =>
    n || n === 0 ? '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '₹0';

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const timeAgo = (d) => {
    if (!d) return '—';
    const diffMs = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(d);
};

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
    display: 'grid', gridTemplateColumns: 'repeat(3, minmax(190px, 1fr))', gap: 14, marginBottom: 14,
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

const legendDotStyle = (color) => ({
    width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0,
});

const listRowStyle = (isLast) => ({
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
    borderBottom: isLast ? 'none' : '1px solid var(--border)',
});

/* ── generic building blocks ── */

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

function Empty({ text }) {
    return <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{text}</div>;
}

/* ── CSS-only donut chart (no charting library needed) ──────────────────── */
function DonutChart({ segments, centerLabel = 'Total' }) {
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
                    <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{centerLabel}</div>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 160 }}>
                {segments.map((seg) => (
                    <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                        <span style={legendDotStyle(seg.color)} />
                        <span style={{ color: 'var(--foreground)', flex: 1 }}>{prettify(seg.label)}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.25 }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{seg.value}</span>
                            {seg.amount !== undefined && (
                                <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600 }}>{formatCurrency(seg.amount)}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── CSS/SVG-only vertical bar chart (no charting library needed) ───────── */
function BarChart({ rows, height = 240 }) {
    const width = 640;
    const padLeft = 40;
    const padRight = 16;
    const padTop = 22;
    const padBottom = 8;
    const gap = 16;
    const maxBarWidth = 70;

    const max = Math.max(1, ...rows.map((r) => r.value));
    const n = rows.length || 1;
    const plotWidth = width - padLeft - padRight;
    const rawBarWidth = (plotWidth - gap * (n - 1)) / n;
    const barWidth = Math.max(6, Math.min(maxBarWidth, rawBarWidth));
    const groupWidth = barWidth * n + gap * (n - 1);
    const startX = padLeft + Math.max(0, (plotWidth - groupWidth) / 2);

    const plotHeight = height - padTop - padBottom;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

    return (
        <div>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height, display: 'block' }} preserveAspectRatio="xMidYMid meet">
                {ticks.map((t, i) => {
                    const y = padTop + plotHeight - (t / max) * plotHeight;
                    return (
                        <g key={i}>
                            <line x1={padLeft} x2={width - padRight} y1={y} y2={y} stroke="var(--border)" strokeWidth="1" />
                            <text x={padLeft - 8} y={y + 3.5} textAnchor="end" fontSize="10.5" fill="var(--text-muted)">{t}</text>
                        </g>
                    );
                })}
                {rows.map((r, i) => {
                    const barHeight = (r.value / max) * plotHeight;
                    const x = startX + i * (barWidth + gap);
                    const y = padTop + plotHeight - barHeight;
                    return (
                        <g key={r.label}>
                            <rect x={x} y={y} width={barWidth} height={barHeight} fill={r.color} rx={4} />
                            <text x={x + barWidth / 2} y={y - 7} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text-strong)">
                                {r.value}
                            </text>
                        </g>
                    );
                })}
                <line x1={padLeft} x2={width - padRight} y1={padTop + plotHeight} y2={padTop + plotHeight} stroke="var(--border)" strokeWidth="1.5" />
            </svg>
            <div style={{ display: 'flex', justifyContent: n * (barWidth + gap) - gap < plotWidth ? 'center' : 'flex-start', gap: `${(gap / width) * 100}%`, paddingLeft: `${(padLeft / width) * 100}%`, paddingRight: `${(padRight / width) * 100}%` }}>
                {rows.map((r) => (
                    <div
                        key={r.label}
                        style={{
                            width: `${(barWidth / width) * 100}%`, flexShrink: 0, textAlign: 'center', fontSize: 10.5,
                            color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                    >
                        {prettify(r.label)}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── CSS/SVG-only multi-line trend chart (no charting library needed) ───── */
function LineTrend({ data, series, height = 190 }) {
    const width = 640;
    const padX = 12;
    const padY = 16;

    const maxVal = Math.max(1, ...data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0)));
    const stepX = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0;
    const yFor = (v) => height - padY - (Math.max(0, Number(v) || 0) / maxVal) * (height - padY * 2);
    const xFor = (i) => padX + i * stepX;

    return (
        <div>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height, display: 'block' }} preserveAspectRatio="none">
                {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                    <line
                        key={f}
                        x1={padX} x2={width - padX}
                        y1={height - padY - f * (height - padY * 2)}
                        y2={height - padY - f * (height - padY * 2)}
                        stroke="var(--border)" strokeWidth="1"
                    />
                ))}
                {series.map((s) => (
                    <polyline
                        key={s.key}
                        points={data.map((d, i) => `${xFor(i)},${yFor(d[s.key])}`).join(' ')}
                        fill="none" stroke={s.color} strokeWidth="2.4"
                        strokeLinejoin="round" strokeLinecap="round"
                    />
                ))}
                {series.map((s) => data.map((d, i) => (
                    <circle key={`${s.key}-${i}`} cx={xFor(i)} cy={yFor(d[s.key])} r="3" fill={s.color} />
                )))}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-muted)', padding: '0 2px' }}>
                {data.map((d, i) => <span key={i}>{d.month}</span>)}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                {series.map((s) => (
                    <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <span style={legendDotStyle(s.color)} />
                        <span style={{ color: 'var(--foreground)' }}>{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── main component ──────────────────────────────────────────────────────── */

export default function HomePageStaff() {
    const navigate = useNavigate();

    const [systemCounts, setSystemCounts] = useState(null);
    const [billOverview, setBillOverview] = useState(null);
    const [paymentOverview, setPaymentOverview] = useState(null);
    const [cashFlow, setCashFlow] = useState([]);
    const [projectStatus, setProjectStatus] = useState(null);
    const [taskStatus, setTaskStatus] = useState([]);
    const [dfsStatus, setDfsStatus] = useState([]);
    const [documentStatus, setDocumentStatus] = useState([]);
    const [approvals, setApprovals] = useState([]);
    const [activity, setActivity] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadDashboard = async () => {
        setLoading(true);
        setError('');
        try {
            const [
                countsRes, billRes, paymentRes, cashFlowRes, projectStatusRes,
                taskStatusRes, dfsStatusRes, documentStatusRes, approvalsRes, activityRes,
            ] = await Promise.all([
                getAdminSystemCounts(),
                getAdminBillOverview(),
                getAdminPaymentOverview(),
                getAdminCashFlow(6),
                getAdminProjectStatus(),
                getAdminTaskStatus(),
                getAdminDfsStatus(),
                getAdminDocumentStatus(),
                getAdminApprovalsQueue(6),
                getAdminRecentActivity(8),
            ]);

            setSystemCounts(countsRes?.success ? countsRes.data : null);
            setBillOverview(billRes?.success ? billRes.data : null);
            setPaymentOverview(paymentRes?.success ? paymentRes.data : null);
            setCashFlow(cashFlowRes?.success ? cashFlowRes.data || [] : []);
            setProjectStatus(projectStatusRes?.success ? projectStatusRes.data : null);
            setTaskStatus(taskStatusRes?.success ? taskStatusRes.data || [] : []);
            setDfsStatus(dfsStatusRes?.success ? dfsStatusRes.data || [] : []);
            setDocumentStatus(documentStatusRes?.success ? documentStatusRes.data || [] : []);
            setApprovals(approvalsRes?.success ? approvalsRes.data || [] : []);
            setActivity(activityRes?.success ? activityRes.data || [] : []);

            const allFailed = [countsRes, billRes, paymentRes, cashFlowRes, projectStatusRes, taskStatusRes, dfsStatusRes, documentStatusRes, approvalsRes, activityRes]
                .every((r) => !r?.success);
            if (allFailed) setError('Failed to load dashboard data.');
        } catch (err) {
            setError(err.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const billStatusSegments = useMemo(() => {
        if (!billOverview?.breakdown) return [];
        return billOverview.breakdown.map((row) => ({
            label: row.status, value: row.count, amount: row.amount,
            color: BILL_STATUS_COLORS[row.status] || C.muted,
        }));
    }, [billOverview]);

    const paymentStatusSegments = useMemo(() => {
        if (!paymentOverview?.breakdown) return [];
        return paymentOverview.breakdown.map((row, i) => ({
            label: row.status, value: row.count, amount: row.amount,
            color: PAYMENT_STATUS_COLORS[row.status] || BAR_PALETTE[i % BAR_PALETTE.length],
        }));
    }, [paymentOverview]);

    const projectStatusRows = useMemo(() => {
        if (!projectStatus?.statusBreakdown) return [];
        return projectStatus.statusBreakdown
            .map((s) => ({ label: s.status, value: s.count, color: PROJECT_STATUS_COLORS[s.status] || C.muted }));
    }, [projectStatus]);

    const taskStatusRows = useMemo(
        () => taskStatus
            .map((s) => ({ label: s.status, value: s.count, color: TASK_STATUS_COLORS[s.status] || C.muted })),
        [taskStatus]
    );

    const dfsStatusSegments = useMemo(
        () => dfsStatus
            .filter((s) => s.count > 0)
            .map((s) => ({ label: s.status, value: s.count, color: DFS_STATUS_COLORS[s.status] || C.muted })),
        [dfsStatus]
    );

    const documentStatusSegments = useMemo(
        () => documentStatus
            .filter((s) => s.count > 0)
            .map((s) => ({ label: s.status, value: s.count, color: DOCUMENT_STATUS_COLORS[s.status] || C.muted })),
        [documentStatus]
    );

    const cashFlowSeries = [
        { key: 'bill', label: 'Bills', color: '#3b7dd8' },
        { key: 'payment_request', label: 'Payment requests', color: '#d8a13a' },
        { key: 'salary', label: 'Salary', color: '#225b31' },
    ];

    return (
        <>
            <StaffHeader />

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
                        <FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading dashboard…
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* ── System counts — 9 tiles, 3×3 ── */}
                        <div style={statGridStyle}>
                            <StatCard
                                icon={<FaUsers size={18} color="#fff" />}
                                iconBg={C.primary}
                                label="Clients / staff"
                                value={systemCounts?.clientStaffCount ?? '—'}
                            />
                            <StatCard
                                icon={<FaFileInvoiceDollar size={18} color="#fff" />}
                                iconBg="#3b7dd8"
                                label="Total bills"
                                value={systemCounts?.totalBills ?? '—'}
                            />
                            <StatCard
                                icon={<FaMoneyCheckAlt size={18} color="#fff" />}
                                iconBg={C.accent}
                                label="Payment requests"
                                value={systemCounts?.totalPayments ?? '—'}
                            />
                            <StatCard
                                icon={<FaProjectDiagram size={18} color="#fff" />}
                                iconBg={C.primary}
                                label="Projects"
                                value={systemCounts?.totalProjects ?? '—'}
                            />
                            <StatCard
                                icon={<FaTasks size={18} color="#fff" />}
                                iconBg="#3b7dd8"
                                label="Tasks"
                                value={systemCounts?.totalTasks ?? '—'}
                            />
                            <StatCard
                                icon={<FaShareSquare size={18} color="#fff" />}
                                iconBg="#6b3e2b"
                                label="DFS requests"
                                value={systemCounts?.totalDfs ?? '—'}
                            />
                            <StatCard
                                icon={<FaFileSignature size={18} color="#fff" />}
                                iconBg={C.destructive}
                                label="Agreements"
                                value={systemCounts?.totalAgreements ?? '—'}
                            />
                            <StatCard
                                icon={<FaListAlt size={18} color="#fff" />}
                                iconBg="#d8a13a"
                                label="SOR items"
                                value={systemCounts?.totalSorItems ?? '—'}
                            />
                            <StatCard
                                icon={<FaFileAlt size={18} color="#fff" />}
                                iconBg={C.success}
                                label="Documents"
                                value={systemCounts?.totalDocuments ?? '—'}
                            />
                        </div>

                        {/* ── Bill vs Payment Request status ── */}
                        <div style={twoColGrid}>
                            <Module
                                icon={<FaChartPie size={13} color={C.accent} />}
                                title="Bill Status"
                                extra={billOverview ? (
                                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600 }}>{formatCurrency(billOverview.totalAmount)} total</span>
                                ) : null}
                            >
                                {billStatusSegments.length > 0 ? (
                                    <DonutChart segments={billStatusSegments} centerLabel="Bills" />
                                ) : (
                                    <Empty text="No bills created yet." />
                                )}
                            </Module>

                            <Module
                                icon={<FaChartPie size={13} color={C.accent} />}
                                title="Payment Request Status"
                                extra={paymentOverview ? (
                                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600 }}>{formatCurrency(paymentOverview.totalAmount)} total</span>
                                ) : null}
                            >
                                {paymentStatusSegments.length > 0 ? (
                                    <DonutChart segments={paymentStatusSegments} centerLabel="Requests" />
                                ) : (
                                    <Empty text="No payment requests raised yet." />
                                )}
                            </Module>
                        </div>

                        {/* ── Task status + Project status (bar charts) ── */}
                        <div style={twoColGrid}>
                            <Module icon={<FaChartBar size={13} color={C.accent} />} title="Task Status">
                                {taskStatus.length > 0 ? (
                                    <BarChart rows={taskStatusRows} />
                                ) : (
                                    <Empty text="No tasks created yet." />
                                )}
                            </Module>

                            <Module icon={<FaChartBar size={13} color={C.accent} />} title="Project Status">
                                {projectStatus?.statusBreakdown?.length > 0 ? (
                                    <BarChart rows={projectStatusRows} />
                                ) : (
                                    <Empty text="No projects yet." />
                                )}
                            </Module>
                        </div>

                        {/* ── DFS status + Document status ── */}
                        <div style={twoColGrid}>
                            <Module icon={<FaChartPie size={13} color={C.accent} />} title="DFS Status">
                                {dfsStatusSegments.length > 0 ? (
                                    <DonutChart segments={dfsStatusSegments} centerLabel="DFS" />
                                ) : (
                                    <Empty text="No DFS requests raised yet." />
                                )}
                            </Module>

                            <Module icon={<FaChartPie size={13} color={C.accent} />} title="Document Status">
                                {documentStatusSegments.length > 0 ? (
                                    <DonutChart segments={documentStatusSegments} centerLabel="Docs" />
                                ) : (
                                    <Empty text="No documents uploaded yet." />
                                )}
                            </Module>
                        </div>

                        {/* ── Cash flow ── */}
                        <Module
                            icon={<FaChartLine size={13} color={C.accent} />}
                            title="Cash Flow — Last 6 Months"
                            extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Bills · Payment requests · Salary</span>}
                        >
                            {cashFlow.length > 0 ? (
                                <LineTrend data={cashFlow} series={cashFlowSeries} />
                            ) : (
                                <Empty text="No transactions recorded yet." />
                            )}
                        </Module>

                        {/* ── Approvals queue + recent activity ── */}
                        <div style={twoColGrid}>
                            <Module
                                icon={<FaExclamationTriangle size={13} color={C.accent} />}
                                title="Approvals Queue"
                                extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{approvals.length} shown</span>}
                            >
                                {approvals.length > 0 ? (
                                    approvals.map((a, i) => {
                                        const meta = APPROVAL_META[a.type] || { icon: FaFileAlt, bg: C.muted };
                                        const Icon = meta.icon;
                                        return (
                                            <div key={`${a.refId}-${i}`} style={listRowStyle(i === approvals.length - 1)}>
                                                <div style={statIconWrapStyle(meta.bg)}>
                                                    <Icon size={14} color="#fff" />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{
                                                        fontSize: 13, color: 'var(--text-strong)',
                                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                    }}>
                                                        {a.label}
                                                    </div>
                                                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{a.who}</div>
                                                </div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(a.date)}</div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <Empty text="Nothing pending — you're all caught up." />
                                )}
                            </Module>

                            <Module icon={<FaHistory size={13} color={C.accent} />} title="Recent Activity">
                                {activity.length > 0 ? (
                                    activity.map((a, i) => (
                                        <div
                                            key={i}
                                            style={{ ...listRowStyle(i === activity.length - 1), cursor: a.actionUrl ? 'pointer' : 'default' }}
                                            onClick={() => a.actionUrl && navigate(a.actionUrl)}
                                        >
                                            <span style={{ width: 7, height: 7, borderRadius: 4, background: C.accent, flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: 12.5, color: 'var(--text-strong)',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>
                                                    {a.description}
                                                </div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.who} · {timeAgo(a.createdAt)}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <Empty text="No recent activity." />
                                )}
                            </Module>
                        </div>
                    </>
                )}

                <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
            </div>
        </>
    );
}