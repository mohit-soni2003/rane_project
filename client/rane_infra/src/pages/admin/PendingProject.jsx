import React, { useState, useEffect } from 'react';
import {
  FaProjectDiagram, FaBuilding, FaTrain, FaIndustry, FaMapMarkedAlt,
  FaFileContract, FaRupeeSign, FaCalendarAlt, FaSitemap, FaUsers,
  FaTasks, FaFileAlt, FaCommentDots, FaUserShield, FaClipboardCheck,
  FaCheckCircle, FaTimesCircle, FaUndo, FaChevronDown, FaChevronUp,
  FaExternalLinkAlt, FaSignature, FaClock, FaInfoCircle, FaHourglassHalf,
} from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import { backend_url } from '../../store/keyStore';
import { useAuthStore } from '../../store/authStore';

// ── Hardcoded icon colors (icons never inherit CSS vars reliably) ────────────
const C = {
  primary: '#6b3e2b',
  accent: '#b95a52',
  success: '#225b31',
  destructive: '#c94a3a',
  muted: '#8b7b74',
  warning: '#4a1f18',
  info: '#1e40af',
  amber: '#92400e',
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

// A reference can be a populated object, a raw id string, or null.
const userLabel = (u) => {
  if (!u) return '—';
  if (typeof u === 'string') return u; // unpopulated ObjectId
  return u.name || u.email || u._id || '—';
};

// status -> badge colors (uses your CSS tokens)
const statusStyle = (status) => {
  const map = {
    draft: { bg: 'var(--muted)', fg: 'var(--text-muted)' },
    pending: { bg: 'var(--amber)', fg: 'var(--amber-foreground)' },
    approved: { bg: 'var(--info)', fg: 'var(--info-foreground)' },
    returned: { bg: 'var(--warning)', fg: 'var(--warning-foreground)' },
    rejected: { bg: 'var(--destructive-bg)', fg: 'var(--destructive)' },
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

/* ── shared styles ────────────────────────────────────────────────────────── */

const cardStyle = {
  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
  marginBottom: 14, boxShadow: '0 2px 8px var(--shadow-color)', overflow: 'hidden',
};

const sectionStyle = {
  borderTop: '1px solid var(--divider)', padding: '14px 18px',
};

const sectionHeaderStyle = {
  display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12,
  fontWeight: 700, fontSize: 12.5, color: 'var(--text-strong)',
  textTransform: 'uppercase', letterSpacing: '0.04em',
};

const gridTwo = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px 18px',
};

const rowLabelStyle = {
  fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2,
};

const rowValueStyle = {
  fontSize: 13.5, color: 'var(--foreground)', wordBreak: 'break-word',
};

const badgeStyle = (bg, fg) => ({
  display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
  background: bg, color: fg, borderRadius: 20, padding: '3px 10px',
});

const chipStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500,
  background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)',
  borderRadius: 20, padding: '3px 10px', margin: '0 6px 6px 0',
};

const subCardStyle = {
  background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 8,
  padding: '10px 12px', marginBottom: 8,
};

/* ── small presentational components ─────────────────────────────────────── */

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

/* ── main component ──────────────────────────────────────────────────────── */

export default function PendingProject() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openIds, setOpenIds] = useState({});

  // ── Fetch projects pending on the logged-in authority ───────────────────
  // The backend derives the authority from the auth token (req.userId),
  // so no id needs to be passed from here.
  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const token = useAuthStore.getState()?.token;
      const res = await fetch(`${backend_url}/project/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || 'Failed to load pending projects');
      }

      // API responds as { success, message, data }
      const data = json.data !== undefined ? json.data : json;
      setProjects(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load pending projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const toggle = (id) => setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ── render one project (all fields) ── */
  const renderProject = (p) => {
    const isOpen = !!openIds[p._id];
    const st = statusStyle(p.status);
    const isRailway = p.department === 'indian_railway';
    const isPsu = p.department === 'psu';

    return (
      <div key={p._id} style={cardStyle}>

        {/* Header (always visible) */}
        <div
          onClick={() => toggle(p._id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
            cursor: 'pointer', flexWrap: 'wrap',
          }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <FaProjectDiagram size={15} color={C.primary} />
          </div>

          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.25 }}>
              {dash(p.projectName)}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>
              {dash(p.projectId)} · {prettify(p.projectType)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={badgeStyle('var(--secondary)', 'var(--secondary-foreground)')}>
              <FaClipboardCheck size={11} color={C.accent} /> {dash(p.approvalStage)}
            </span>
            <span style={badgeStyle(st.bg, st.fg)}>{prettify(p.status)}</span>
            {isOpen
              ? <FaChevronUp size={14} color={C.muted} />
              : <FaChevronDown size={14} color={C.muted} />}
          </div>
        </div>

        {/* Full details (expanded) */}
        {isOpen && (
          <>
            {/* Basic information */}
            <Section icon={<FaProjectDiagram size={13} color={C.accent} />} title="Basic information">
              <div style={gridTwo}>
                <Field label="Project ID">{dash(p.projectId)}</Field>
                <Field label="Project name">{dash(p.projectName)}</Field>
                <Field label="Project type">{prettify(p.projectType)}</Field>
                <Field label="Category">{dash(p.category)}</Field>
              </div>
              <div style={{ marginTop: 10 }}>
                <Field label="Description">{dash(p.description)}</Field>
              </div>
            </Section>

            {/* Client & department */}
            <Section icon={<FaBuilding size={13} color={C.accent} />} title="Client & department">
              <div style={gridTwo}>
                <Field label="Client name">{dash(p.clientName)}</Field>
                <Field label="Department">{prettify(p.department)}</Field>
              </div>
            </Section>

            {/* Railway details */}
            {isRailway && (
              <Section icon={<FaTrain size={13} color={C.accent} />} title="Railway details">
                <div style={gridTwo}>
                  <Field label="Zone">{p.zone ? p.zone.toUpperCase() : '—'}</Field>
                  <Field label="Sub-department">{prettify(p.subDepartment)}</Field>
                  <Field label="Circle level">{prettify(p.circle)}</Field>
                  <Field label="Division">{dash(p.division)}</Field>
                </div>
              </Section>
            )}

            {/* PSU details */}
            {isPsu && (
              <Section icon={<FaIndustry size={13} color={C.accent} />} title="PSU details">
                <div style={gridTwo}>
                  <Field label="PSU name">{p.psuName ? p.psuName.toUpperCase() : '—'}</Field>
                </div>
              </Section>
            )}

            {/* Location */}
            <Section icon={<FaMapMarkedAlt size={13} color={C.accent} />} title="Location">
              <div style={gridTwo}>
                <Field label="State">{dash(p.location?.state)}</Field>
                <Field label="City">{dash(p.location?.city)}</Field>
                <Field label="District">{dash(p.location?.district)}</Field>
                <Field label="Pincode">{dash(p.location?.pincode)}</Field>
              </div>
              <div style={{ marginTop: 10 }}>
                <Field label="Site address">{dash(p.location?.siteAddress)}</Field>
              </div>
            </Section>

            {/* Tender details */}
            <Section icon={<FaFileContract size={13} color={C.accent} />} title="Tender details">
              <div style={gridTwo}>
                <Field label="Tender no.">{dash(p.tenderNo)}</Field>
                <Field label="LOA no.">{dash(p.loaNo)}</Field>
                <Field label="Agreement no.">{dash(p.agreementNo)}</Field>
              </div>
            </Section>

            {/* Financial details */}
            <Section icon={<FaRupeeSign size={13} color={C.accent} />} title="Financial details">
              <div style={gridTwo}>
                <Field label="Estimated cost">{formatCurrency(p.estimatedCost)}</Field>
                <Field label="Project cost">{formatCurrency(p.projectCost)}</Field>
                <Field label="Paid amount">{formatCurrency(p.paidAmount)}</Field>
                <Field label="Pending amount">{formatCurrency(p.pendingAmount)}</Field>
              </div>
            </Section>

            {/* Approval workflow */}
            <Section icon={<FaUserShield size={13} color={C.accent} />} title="Approval workflow">
              <div style={gridTwo}>
                <Field label="Approval stage">{dash(p.approvalStage)}</Field>
                <Field label="Status">{prettify(p.status)}</Field>
                <Field label="Current authority">{userLabel(p.currentAuthority)}</Field>
                <Field label="Created by">{userLabel(p.createdBy)}</Field>
                <Field label="Project manager">{userLabel(p.projectManager)}</Field>
              </div>
            </Section>

            {/* Approval trail */}
            <Section icon={<FaClipboardCheck size={13} color={C.accent} />} title={`Approval trail (${p.approvals?.length || 0})`}>
              {p.approvals && p.approvals.length ? (
                p.approvals.map((a, i) => (
                  <div key={a._id || i} style={subCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={badgeStyle('var(--secondary)', 'var(--secondary-foreground)')}>{dash(a.stage)}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 600, color: 'var(--foreground)' }}>
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
                      <Field label="Signed at">{formatDateTime(a.signedAt)}</Field>
                      <Field label="Signature">
                        {a.signatureUrl ? (
                          <a href={a.signatureUrl} target="_blank" rel="noreferrer"
                            style={{ color: 'var(--link)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <FaSignature size={12} /> View signature
                          </a>
                        ) : '—'}
                      </Field>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No approval actions yet.</div>
              )}
            </Section>

            {/* Teams */}
            <Section icon={<FaSitemap size={13} color={C.accent} />} title={`Teams (${p.teams?.length || 0})`}>
              {p.teams && p.teams.length ? (
                p.teams.map((t, i) => (
                  <div key={t._id || i} style={subCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={badgeStyle('var(--secondary)', 'var(--secondary-foreground)')}>{dash(t.vertical)}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--foreground)' }}>{dash(t.name)}</span>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>· {prettify(t.purpose)}</span>
                    </div>
                    <div style={gridTwo}>
                      <Field label="Lead">{userLabel(t.lead)}</Field>
                      <Field label="Created by">{userLabel(t.createdBy)}</Field>
                      <Field label="Created at">{formatDate(t.createdAt)}</Field>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div style={rowLabelStyle}>Members ({t.members?.length || 0})</div>
                      <div style={{ marginTop: 4 }}>
                        {t.members && t.members.length
                          ? t.members.map((m, mi) => (
                              <span key={mi} style={chipStyle}>
                                <FaUsers size={11} color={C.muted} /> {userLabel(m)}
                              </span>
                            ))
                          : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>—</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No teams created yet.</div>
              )}
            </Section>

            {/* Tasks */}
            <Section icon={<FaTasks size={13} color={C.accent} />} title={`Tasks (${p.tasks?.length || 0})`}>
              {p.tasks && p.tasks.length ? (
                p.tasks.map((task, i) => {
                  // tasks may be populated objects or raw ids
                  if (typeof task === 'string') {
                    return <div key={i} style={chipStyle}>{task}</div>;
                  }
                  const ts = statusStyle(task.status);
                  return (
                    <div key={task._id || i} style={subCardStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--foreground)' }}>{dash(task.title)}</span>
                        {task.status && <span style={badgeStyle(ts.bg, ts.fg)}>{prettify(task.status)}</span>}
                        {task.priority && <span style={chipStyle}>{prettify(task.priority)}</span>}
                      </div>
                      <div style={gridTwo}>
                        <Field label="Vertical">{dash(task.vertical)}</Field>
                        <Field label="Deadline">{formatDate(task.deadline)}</Field>
                        <Field label="Allotted by">{userLabel(task.allottedBy)}</Field>
                        <Field label="Allotted to">
                          {Array.isArray(task.allottedTo) && task.allottedTo.length
                            ? task.allottedTo.map((u) => userLabel(u)).join(', ')
                            : userLabel(task.allottedTo)}
                        </Field>
                      </div>
                      {task.description && (
                        <div style={{ marginTop: 8 }}>
                          <Field label="Description">{task.description}</Field>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No tasks under this project.</div>
              )}
            </Section>

            {/* Documents */}
            <Section icon={<FaFileAlt size={13} color={C.accent} />} title={`Documents (${p.documents?.length || 0})`}>
              {p.documents && p.documents.length ? (
                p.documents.map((doc, i) => (
                  <div key={doc._id || i} style={{
                    ...subCardStyle, display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8,
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
                      <a href={doc.url} target="_blank" rel="noreferrer"
                        style={{ color: 'var(--link)', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, flexShrink: 0 }}>
                        Open <FaExternalLinkAlt size={11} />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No documents attached.</div>
              )}
            </Section>

            {/* Remarks */}
            <Section icon={<FaCommentDots size={13} color={C.accent} />} title="Remarks">
              <Field label="Latest remark">{dash(p.latestRemark)}</Field>
            </Section>

            {/* Timeline */}
            <Section icon={<FaCalendarAlt size={13} color={C.accent} />} title="Timeline">
              <div style={gridTwo}>
                <Field label="Start date">{formatDate(p.startDate)}</Field>
                <Field label="Estimated completion">{formatDate(p.estimatedCompletionDate)}</Field>
                <Field label="Completion date">{formatDate(p.completionDate)}</Field>
              </div>
            </Section>

            {/* Record metadata */}
            <Section icon={<FaClock size={13} color={C.accent} />} title="Record details">
              <div style={gridTwo}>
                <Field label="Mongo _id">{dash(p._id)}</Field>
                <Field label="Created at">{formatDateTime(p.createdAt)}</Field>
                <Field label="Updated at">{formatDateTime(p.updatedAt)}</Field>
              </div>
            </Section>
          </>
        )}
      </div>
    );
  };

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
            <FaHourglassHalf size={15} color={C.primary} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
              Pending Approvals
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              {loading ? 'Loading…' : `${projects.length} project${projects.length === 1 ? '' : 's'} awaiting your action · tap a card for full details`}
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
          <FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading pending projects…
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
          <div style={{ fontSize: 12.5, marginTop: 4 }}>You're all caught up — no projects are waiting on you.</div>
        </div>
      )}

      {/* List */}
      {!loading && projects.map(renderProject)}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}