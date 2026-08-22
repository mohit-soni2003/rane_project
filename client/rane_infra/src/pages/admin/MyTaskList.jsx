import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Spinner } from 'react-bootstrap';
import {
  FaTasks, FaChevronRight, FaTimesCircle, FaCalendarAlt, FaProjectDiagram,
} from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import { getTasksByUser } from '../../services/task.service.js';
import { useAuthStore } from '../../store/authStore';
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

const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

// per-user status -> badge colors (your CSS tokens)
const statusStyle = (status) => {
  const map = {
    pending: { bg: 'var(--muted)', fg: 'var(--text-muted)' },
    in_progress: { bg: 'var(--info)', fg: 'var(--info-foreground)' },
    submitted: { bg: 'var(--amber)', fg: 'var(--amber-foreground)' },
    completed: { bg: 'var(--success)', fg: 'var(--success-foreground)' },
    rejected: { bg: 'var(--destructive-bg)', fg: 'var(--destructive)' },
  };
  return map[status] || { bg: 'var(--muted)', fg: 'var(--text-muted)' };
};

// priority -> badge colors
const priorityStyle = (priority) => {
  const map = {
    low: { bg: 'var(--muted)', fg: 'var(--text-muted)' },
    medium: { bg: 'var(--info)', fg: 'var(--info-foreground)' },
    high: { bg: 'var(--warning)', fg: 'var(--warning-foreground)' },
    urgent: { bg: 'var(--destructive-bg)', fg: 'var(--destructive)' },
  };
  return map[priority] || { bg: 'var(--muted)', fg: 'var(--text-muted)' };
};

// Plain span for status/priority pills — deliberately NOT react-bootstrap's
// <Badge>, since its default bg="primary" utility class uses !important
// and silently overrides inline styles.
function Pill({ label, bg, fg }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: bg,
        color: fg,
        fontWeight: 600,
        fontSize: 11,
        borderRadius: 20,
        padding: '5px 10px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

export default function MyTaskList() {
  const navigate = useNavigate();
  // NOTE: adjust this selector to match your actual authStore shape —
  // assumes the logged-in user's Mongo _id lives at state.user._id.
  const userId = useAuthStore((state) => state.user?._id);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getTasksByUser(userId);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const goToDetails = (id) => navigate(`../task/${id}`);

  // Find this user's own entry inside a task's allottedTo[] array
  const myEntry = (task) => task.allottedTo?.find((a) => a.user?._id === userId || a.user === userId);

  const isOverdue = (task) => {
    if (!task.deadline) return false;
    const entry = myEntry(task);
    if (entry?.status === 'completed') return false;
    return new Date(task.deadline).getTime() < Date.now();
  };

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
              <FaTasks size={16} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}>My Tasks</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {loading ? 'Loading…' : `${tasks.length} task${tasks.length === 1 ? '' : 's'}`}
              </div>
            </div>
          </div>
          <Button
            onClick={fetchTasks}
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
            <Spinner animation="border" size="sm" /> Loading tasks…
          </div>
        )}

        {/* Empty */}
        {!loading && !error && tasks.length === 0 && (
          <div className="text-center" style={{ padding: '40px 20px', color: 'var(--text-muted)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <FaTasks size={28} color={C.muted} style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>No tasks allotted to you</div>
          </div>
        )}

        {/* ── List ── */}
        {!loading && tasks.map((t) => {
          const entry = myEntry(t);
          const overdue = isOverdue(t);

          return (
            <Card
              key={t._id}
              className="border-0 mb-3"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 8px var(--shadow-color)' }}
            >
              <Card.Body className="d-flex align-items-center gap-3 flex-wrap" style={{ padding: '14px 18px' }}>
                <div className="d-flex align-items-center justify-content-center" style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--warning)', flexShrink: 0 }}>
                  <FaTasks size={15} color={C.primary} />
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.25 }}>
                    {dash(t.title)}
                  </div>
                  <div className="d-flex align-items-center gap-1" style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                    <FaProjectDiagram size={10} />
                    {dash(t.project?.projectName)}
                  </div>
                  {t.description && (
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, maxWidth: 480, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.description}
                    </div>
                  )}
                  <div
                    className="d-flex align-items-center gap-1"
                    style={{ fontSize: 11.5, marginTop: 4, color: overdue ? C.destructive : 'var(--text-muted)', fontWeight: overdue ? 700 : 400 }}
                  >
                    <FaCalendarAlt size={10} />
                    {overdue ? 'Overdue — ' : 'Due '}{formatDate(t.deadline)}
                  </div>
                </div>

                <Pill label={prettify(t.priority)} {...priorityStyle(t.priority)} />
                <Pill label={prettify(entry?.status)} {...statusStyle(entry?.status)} />

                <Button
                  onClick={() => goToDetails(t._id)}
                  style={{ background: 'var(--primary)', border: 'none', fontSize: 12.5, fontWeight: 600 }}
                  className="d-flex align-items-center gap-1"
                >
                  View details <FaChevronRight size={11} />
                </Button>
              </Card.Body>
            </Card>
          );
        })}

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </>
  );
}