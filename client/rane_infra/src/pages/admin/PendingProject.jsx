import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaProjectDiagram, FaClipboardCheck, FaChevronDown, FaChevronUp,
  FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaBuilding,
  FaUserShield, FaCalendarAlt, FaCommentDots, FaRupeeSign,
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
};

/* ── helpers ──────────────────────────────────────────────────────────────── */

const prettify = (v) =>
  typeof v === 'string'
    ? v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '—';

const dash = (v) => (v === 0 ? '0' : v || v === false ? v : '—');

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const formatCurrency = (n) =>
  n || n === 0 ? '₹' + Number(n).toLocaleString('en-IN') : '—';

// A reference can be a populated object, a raw id string, or null.
const userLabel = (u) => {
  if (!u) return '—';
  if (typeof u === 'string') return u; // unpopulated ObjectId
  return u.name || u.email || u._id || '—';
};

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

/* ── shared styles ────────────────────────────────────────────────────────── */

const cardStyle = {
  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
  marginBottom: 12, boxShadow: '0 2px 8px var(--shadow-color)', overflow: 'hidden',
  transition: 'box-shadow 0.15s ease',
};

const rowLabelStyle = {
  fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2,
};

const rowValueStyle = {
  fontSize: 13, color: 'var(--foreground)', wordBreak: 'break-word',
};

const badgeStyle = (bg, fg) => ({
  display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
  background: bg, color: fg, borderRadius: 20, padding: '3px 10px',
});

const gridCompact = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px 16px',
};

function Field({ label, children }) {
  return (
    <div>
      <div style={rowLabelStyle}>{label}</div>
      <div style={rowValueStyle}>{children}</div>
    </div>
  );
}
 
/* ── main component ──────────────────────────────────────────────────────── */

export default function PendingProject() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openIds, setOpenIds] = useState({});
  const navigate = useNavigate();

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

  const toggle = (id, e) => {
    e.stopPropagation(); // don't trigger the card's navigate-to-detail click
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openDetails = (id) => {
    navigate(`${id}`);
  };

  /* ── render one project row (compact) ── */
  const renderProject = (p) => {
    const isOpen = !!openIds[p._id];
    const st = statusStyle(p.status);

    return (
      <div key={p._id} style={cardStyle}>

        {/* Row — clicking anywhere here (except the arrow) opens the full detail page */}
        <div
          onClick={() => openDetails(p._id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
            cursor: 'pointer', flexWrap: 'wrap',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--warning)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <FaProjectDiagram size={14} color={C.primary} />
          </div>

          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.25 }}>
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

            {/* Down/up arrow — toggles the compact preview only, doesn't navigate */}
            <button
              onClick={(e) => toggle(p._id, e)}
              aria-label={isOpen ? 'Collapse preview' : 'Expand preview'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)',
                background: 'var(--secondary)', cursor: 'pointer', marginLeft: 4,
              }}
            >
              {isOpen
                ? <FaChevronUp size={12} color={C.muted} />
                : <FaChevronDown size={12} color={C.muted} />}
            </button>
          </div>
        </div>

        {/* Compact preview (arrow toggle) — quick-glance info only, not the full record */}
        {isOpen && (
          <div style={{ borderTop: '1px solid var(--divider)', padding: '12px 16px' }} onClick={(e) => e.stopPropagation()}>
            <div style={gridCompact}>
              <Field label={<><FaBuilding size={10} style={{ marginRight: 4 }} />Client</>}>{dash(p.clientName)}</Field>
              <Field label="Department">{prettify(p.department)}</Field>
              <Field label={<><FaUserShield size={10} style={{ marginRight: 4 }} />Current authority</>}>{userLabel(p.currentAuthority)}</Field>
              <Field label={<><FaRupeeSign size={10} style={{ marginRight: 4 }} />Project cost</>}>{formatCurrency(p.projectCost)}</Field>
              <Field label={<><FaCalendarAlt size={10} style={{ marginRight: 4 }} />Est. completion</>}>{formatDate(p.estimatedCompletionDate)}</Field>
              <Field label={<><FaCommentDots size={10} style={{ marginRight: 4 }} />Latest remark</>}>{dash(p.latestRemark)}</Field>
            </div>
            <div
              onClick={() => openDetails(p._id)}
              style={{
                marginTop: 10, fontSize: 12, fontWeight: 600, color: 'var(--link)',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              View full details →
            </div>
          </div>
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
              {loading ? 'Loading…' : `${projects.length} project${projects.length === 1 ? '' : 's'} awaiting your action · use the arrow for a quick preview, or click a card for full details`}
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