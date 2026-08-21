import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Spinner } from 'react-bootstrap';
import {
  FaProjectDiagram, FaChevronRight, FaTimesCircle,
} from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import { getProjects } from '../../services/project.service.js';
import AdminHeader from '../../component/header/AdminHeader.jsx';

const C = {
  primary: '#6b3e2b',
  accent: '#b95a52',
  destructive: '#c94a3a',
  muted: '#8b7b74',
};

const dash = (v) => (v || v === 0 ? v : '—');

const prettify = (v) =>
  typeof v === 'string' ? v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

// status -> badge colors (your CSS tokens)
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

// Plain span for status pills — deliberately NOT react-bootstrap's <Badge>.
// Badge defaults to bg="primary" (Bootstrap blue) when no variant is passed,
// and that utility class uses !important, silently overriding inline styles.
function StatusPill({ status }) {
  const st = statusStyle(status);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: st.bg,
        color: st.fg,
        fontWeight: 600,
        fontSize: 11,
        borderRadius: 20,
        padding: '5px 10px',
        whiteSpace: 'nowrap',
      }}
    >
      {prettify(status)}
    </span>
  );
}

export default function ListProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const goToDetails = (id) => navigate(`../project/${id}`);
  const goToEdit = (id) => navigate(`../project/edit/${id}`);

  return (
    <>
      <AdminHeader></AdminHeader>
      <div style={{ padding: '0 2px', background: 'var(--background)', minHeight: '100vh' }}>

        {/* Title bar */}
        <div
          className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3"
          style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', boxShadow: '0 2px 10px var(--shadow-color)', padding: '14px 20px' }}
        >
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex align-items-center justify-content-center" style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--warning)' }}>
              <FaProjectDiagram size={16} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}>Projects</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {loading ? 'Loading…' : `${projects.length} project${projects.length === 1 ? '' : 's'}`}
              </div>
            </div>
          </div>
          <Button
            onClick={fetchProjects}
            disabled={loading}
            style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600 }}
            className="d-flex align-items-center gap-2"
          >
            <FiRefreshCw size={13} style={loading ? { animation: 'spin 1s linear infinite' } : undefined} />
            Refresh
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div
            className="d-flex align-items-center gap-2 mb-3"
            style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--destructive-bg)', border: '1px solid var(--destructive-border)', fontSize: 13, color: C.destructive }}
          >
            <FaTimesCircle size={14} color={C.destructive} /> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="d-flex align-items-center justify-content-center gap-2" style={{ padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
            <Spinner animation="border" size="sm" /> Loading projects…
          </div>
        )}

        {/* Empty */}
        {!loading && !error && projects.length === 0 && (
          <div className="text-center" style={{ padding: '40px 20px', color: 'var(--text-muted)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <FaProjectDiagram size={28} color={C.muted} style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>No projects found</div>
          </div>
        )}

        {/* ── List — basic details only ── */}
        {!loading && projects.map((p) => (
          <Card
            key={p._id}
            className="border-0 mb-3"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 8px var(--shadow-color)' }}
          >
            <Card.Body className="d-flex align-items-center gap-3 flex-wrap" style={{ padding: '14px 18px' }}>
              <div className="d-flex align-items-center justify-content-center" style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--warning)', flexShrink: 0 }}>
                <FaProjectDiagram size={15} color={C.primary} />
              </div>

              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.25 }}>
                  {dash(p.projectName)}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>
                  {dash(p.projectId)}
                </div>
                {p.description && (
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, maxWidth: 480, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.description}
                  </div>
                )}
              </div>

              <StatusPill status={p.status} />

              <Button
                onClick={() => goToDetails(p._id)}
                style={{ background: 'var(--primary)', border: 'none', fontSize: 12.5, fontWeight: 600 }}
                className="d-flex align-items-center gap-1"
              >
                View full details <FaChevronRight size={11} />
              </Button>
              <Button
                onClick={() => goToEdit(p._id)}
                style={{ background: 'var(--primary)', border: 'none', fontSize: 12.5, fontWeight: 600 }}
                className="d-flex align-items-center gap-1"
              >
                Modify <FaChevronRight size={11} />
              </Button>
            </Card.Body>
          </Card>
        ))}

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </>
  );
}