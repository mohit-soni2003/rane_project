import React, { useEffect, useMemo, useState } from 'react';
import {
  FiSearch, FiX, FiFilter, FiChevronDown, FiArrowDown, FiArrowUp, FiRotateCcw, FiTag, FiBriefcase,
  FiExternalLink, FiPaperclip, FiArrowRight,
} from 'react-icons/fi';
import {
  FaFolderOpen, FaTrash, FaChevronDown, FaChevronUp, FaExclamationTriangle, FaUserShield, FaUserTie, FaUser,
  FaRegCopy, FaCheckCircle, FaClock, FaCommentDots, FaFileAlt, FaUsers, FaQuestionCircle,
} from 'react-icons/fa';
import { backend_url } from '../../../store/keyStore';
import AdminHeader from '../../../components/layout/header/AdminHeader';
import DeleteConfirmationModal from '../../../components/modals/DeleteConfirmationModal';
import SafeKeyGuard from '../../../components/modals/SafeKeyGuard';

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = { primary: '#6b3e2b', accent: '#b95a52', destructive: '#c94a3a', muted: '#8b7b74', info: '#1e40af' };

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const thStyle = {
  padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
};
const iconBtn = {
  width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)',
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, textDecoration: 'none',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const prettify = (t) => (typeof t === 'string' && t ? t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—');

const statusMeta = (status) => {
  switch (status) {
    case 'approved':  return { bg: 'var(--success)', color: 'var(--success-foreground)', label: 'Approved' };
    case 'rejected':  return { bg: '#fde8e6', color: C.destructive, label: 'Rejected' };
    case 'in-review': return { bg: 'var(--warning)', color: 'var(--warning-foreground)', label: 'In Review' };
    case 'pending':   return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)', label: 'Pending' };
    default:          return { bg: 'var(--muted)', color: 'var(--text-muted)', label: status || '—' };
  }
};

const StatusBadge = ({ status }) => {
  const m = statusMeta(status);
  return (
    <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
};

const roleMeta = (role) => {
  switch (role) {
    case 'admin':  return { label: 'Admin', bg: '#f3e6df', color: '#6b3e2b', Icon: FaUserShield };
    case 'staff':  return { label: 'Staff', bg: '#dbeafe', color: C.info, Icon: FaUserTie };
    case 'client': return { label: 'Client', bg: 'var(--success)', color: 'var(--success-foreground)', Icon: FaUser };
    default:       return { label: 'Unknown', bg: 'var(--muted)', color: 'var(--text-muted)', Icon: FaQuestionCircle };
  }
};

const RoleBadge = ({ role }) => {
  const { label, bg, color, Icon } = roleMeta(role);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: bg, color }}>
      <Icon size={9} color={color} /> {label}
    </span>
  );
};

// Label + value
const Field = ({ label, children, mono, full }) => (
  <div style={{ minWidth: 0, gridColumn: full ? '1 / -1' : 'auto' }}>
    <div style={labelStyle}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 3, color: 'var(--text-strong)', wordBreak: 'break-word', fontFamily: mono ? 'monospace' : 'inherit' }}>
      {children === 0 || children ? children : <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>—</span>}
    </div>
  </div>
);

// Titled box inside the expanded row
const Group = ({ icon: Icon, title, right, children, wide }) => (
  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', minWidth: 0, gridColumn: wide ? '1 / -1' : 'auto' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 700, color: 'var(--text-strong)' }}>
        <Icon size={12} color={C.accent} /> {title}
      </span>
      {right}
    </div>
    {children}
  </div>
);

// ── Forwarding trail as a compact timeline ───────────────────────────────────
function TrailTimeline({ trail }) {
  if (!trail || trail.length === 0) {
    return <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No forwarding history yet.</div>;
  }
  return (
    <div style={{ position: 'relative', paddingLeft: 4 }}>
      <div style={{ position: 'absolute', left: 15, top: 8, bottom: 8, width: 2, background: 'var(--border)' }} />
      {trail.map((e, i) => (
        <div key={e._id || i} style={{ position: 'relative', display: 'flex', gap: 11, marginBottom: i === trail.length - 1 ? 0 : 12 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%', flexShrink: 0, zIndex: 1, background: 'var(--secondary)', color: 'var(--secondary-foreground)',
            border: '2px solid var(--card)', boxShadow: '0 0 0 1px var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 700,
          }}>{i + 1}</div>
          <div style={{ flex: 1, minWidth: 0, background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 9, padding: '8px 11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: e.note ? 6 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)', flexWrap: 'wrap' }}>
                <span>{e.forwardedBy?.name || 'Unknown'}</span>
                <FiArrowRight size={11} color="#b95a52" />
                <span>{e.forwardedTo?.name || 'Unknown'}</span>
                {e.action && (
                  <span style={{ background: 'var(--card)', color: 'var(--text-muted)', fontSize: 10.5, fontWeight: 700, padding: '1px 8px', borderRadius: 20, textTransform: 'capitalize', border: '1px solid var(--border)' }}>
                    {e.action}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtDateTime(e.timestamp)}</span>
            </div>
            {e.note && <div style={{ fontSize: 12.5, color: 'var(--foreground)', lineHeight: 1.5, wordBreak: 'break-word' }}>{e.note}</div>}
            {e.attachment && (
              <a href={e.attachment} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.accent, textDecoration: 'none', marginTop: 6, fontWeight: 600 }}>
                <FiPaperclip size={12} /> View attachment
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Subtype choices stored on the file (invoice type, e-agreement, proposal type, …)
const subFieldRows = (f) => {
  const rows = [];
  const add = (label, v) => { if (v) rows.push([label, v]); };
  add('Invoice type', f.invoiceSubFields?.invoiceType);
  add('E-agreement', f.contractSubFields?.eAgreement);
  add('General contract & labour', f.contractSubFields?.generalContractAndLabour);
  add('Proposal type', f.proposalSubFields?.proposalType);
  add('Measurement book (EMB)', f.reportSubFields?.employeeMeasurementBook);
  add('Employee report', f.reportSubFields?.employeeReport);
  return rows;
};

const lastActivityOf = (f) => {
  const t = (f.forwardingTrail || []).map((e) => new Date(e.timestamp || 0).getTime());
  return t.length ? Math.max(...t) : new Date(f.createdAt || 0).getTime();
};

const AllDFSRequests = () => {
  const [files, setFiles] = useState([]);
  const [userMap, setUserMap] = useState({});        // { [userId]: { role, tag } } — gives us each owner's role
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownerRole, setOwnerRole] = useState('all');   // current owner's role
  const [typeFilter, setTypeFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortKey, setSortKey] = useState('created-desc');

  const [expanded, setExpanded] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [filesRes, usersRes] = await Promise.allSettled([
        fetch(`${backend_url}/dfs/files`, { method: 'GET', credentials: 'include' }).then((r) => r.json()),
        fetch(`${backend_url}/admin-get-users`, { credentials: 'include' }).then((r) => r.json()),
      ]);

      if (filesRes.status === 'fulfilled') setFiles(Array.isArray(filesRes.value) ? filesRes.value : []);
      else setError(filesRes.reason?.message || 'Failed to load files');

      // The files API does not include roles, so look them up from the users list (client side only)
      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value?.users)) {
        const map = {};
        usersRes.value.users.forEach((u) => { map[u._id] = { role: (u.role || 'client').toLowerCase(), tag: u.tag }; });
        setUserMap(map);
        setRolesLoaded(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (file) => { setSelectedFile(file); setShowDeleteModal(true); };

  const handleDeleteConfirm = async () => {
    if (!selectedFile) return;
    try {
      const response = await fetch(`${backend_url}/dfs/file/${selectedFile._id}`, { method: 'DELETE', credentials: 'include' });
      if (response.ok) {
        setFiles((prev) => prev.filter((f) => f._id !== selectedFile._id));
        alert('✅ DFS file deleted successfully!');
      } else {
        const errorData = await response.json();
        alert('❌ Failed to delete DFS file: ' + errorData.error);
      }
    } catch (err) {
      alert('❌ Failed to delete DFS file: ' + err.message);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const toggleExpanded = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const copyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch { /* clipboard unavailable */ }
  };

  const roleOfUser = (u) => (u?._id ? (userMap[u._id]?.role || 'unknown') : 'unknown');
  const tagOfUser = (u) => (u?._id ? userMap[u._id]?.tag : undefined);

  // ── Option lists built from the data ──
  const typeOptions = useMemo(() => Array.from(new Set(files.map((f) => f.docType).filter(Boolean))).sort(), [files]);
  const deptOptions = useMemo(() => Array.from(new Set(files.map((f) => f.Department).filter(Boolean))).sort(), [files]);

  const counts = useMemo(() => {
    const c = { total: files.length, pending: 0, review: 0, approved: 0, rejected: 0, admin: 0, staff: 0, client: 0, unknown: 0 };
    files.forEach((f) => {
      if (f.status === 'pending') c.pending++;
      else if (f.status === 'in-review') c.review++;
      else if (f.status === 'approved') c.approved++;
      else if (f.status === 'rejected') c.rejected++;
      c[roleOfUser(f.currentOwner)]++;
    });
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, userMap]);

  // ── Search + filters + sort (all client side) ──
  const filteredFiles = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return files
      .filter((f) => {
        if (statusFilter !== 'all' && f.status !== statusFilter) return false;
        if (ownerRole !== 'all' && roleOfUser(f.currentOwner) !== ownerRole) return false;
        if (typeFilter !== 'all' && f.docType !== typeFilter) return false;
        if (deptFilter !== 'all' && f.Department !== deptFilter) return false;
        if (!term) return true;
        const hay = [
          f.fileTitle, f.description, f.docType, f.Department, f._id,
          f.uploadedBy?.name, f.uploadedBy?.email, f.uploadedBy?.cid,
          f.currentOwner?.name, f.currentOwner?.email, f.currentOwner?.cid,
          ...(f.forwardingTrail || []).map((e) => e.note),
        ];
        return hay.some((v) => (v || '').toString().toLowerCase().includes(term));
      })
      .sort((a, b) => {
        switch (sortKey) {
          case 'created-asc':   return new Date(a.createdAt) - new Date(b.createdAt);
          case 'activity-desc': return lastActivityOf(b) - lastActivityOf(a);
          case 'forwards-desc': return (b.forwardingTrail?.length || 0) - (a.forwardingTrail?.length || 0);
          case 'title-asc':     return (a.fileTitle || '').localeCompare(b.fileTitle || '');
          case 'title-desc':    return (b.fileTitle || '').localeCompare(a.fileTitle || '');
          case 'owner-asc':     return (a.currentOwner?.name || '').localeCompare(b.currentOwner?.name || '');
          default:              return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, userMap, searchText, statusFilter, ownerRole, typeFilter, deptFilter, sortKey]);

  const hasActiveFilters = searchText !== '' || statusFilter !== 'all' || ownerRole !== 'all' || typeFilter !== 'all' || deptFilter !== 'all' || sortKey !== 'created-desc';
  const resetFilters = () => { setSearchText(''); setStatusFilter('all'); setOwnerRole('all'); setTypeFilter('all'); setDeptFilter('all'); setSortKey('created-desc'); };

  // ── Expanded details ──
  const renderDetails = (f) => {
    const subs = subFieldRows(f);
    const comments = f.comments || [];
    const person = (label, u) => (
      <div style={{ minWidth: 0 }}>
        <div style={labelStyle}>{label}</div>
        <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{u?.name || '—'}</span>
          <RoleBadge role={roleOfUser(u)} />
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3, wordBreak: 'break-all' }}>
          {u?.email || ''}{u?.cid && u.cid !== 'N/A' ? ` · ${u.cid}` : ''}{tagOfUser(u) ? ` · ${prettify(tagOfUser(u))}` : ''}
        </div>
      </div>
    );

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
        <Group icon={FaFileAlt} title="Document details"
          right={f.fileUrl ? (
            <a href={f.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: C.accent, textDecoration: 'none' }}>
              Open file <FiExternalLink size={12} />
            </a>
          ) : null}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px 14px' }}>
            <Field label="File ID" mono full>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {f._id}
                <button type="button" onClick={() => copyId(f._id)} title="Copy ID" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'inline-flex' }}>
                  {copiedId === f._id ? <FaCheckCircle size={12} color="#225b31" /> : <FaRegCopy size={12} color={C.muted} />}
                </button>
              </span>
            </Field>
            <Field label="Document type">{f.docType}</Field>
            <Field label="Department">{f.Department}</Field>
            {subs.map(([label, v]) => <Field key={label} label={label}>{v}</Field>)}
            <Field label="Uploaded on">{fmtDateTime(f.createdAt)}</Field>
            <Field label="Last activity">{fmtDateTime(lastActivityOf(f))}</Field>
            <Field label="Description" full>{f.description}</Field>
          </div>
        </Group>

        <Group icon={FaUsers} title="People">
          <div style={{ display: 'grid', gap: 14 }}>
            {person('Uploaded by', f.uploadedBy)}
            {person('Current owner', f.currentOwner)}
          </div>
        </Group>

        <Group icon={FaClock} title={`Forwarding trail (${(f.forwardingTrail || []).length})`} wide={(f.forwardingTrail || []).length > 2}>
          <TrailTimeline trail={f.forwardingTrail} />
        </Group>

        {comments.length > 0 && (
          <Group icon={FaCommentDots} title={`Comments (${comments.length})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {comments.map((c, i) => (
                <div key={c._id || i} style={{ background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 9, padding: '8px 11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)' }}>{c.user?.name || 'Unknown'}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtDateTime(c.timestamp)}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--foreground)', lineHeight: 1.5, wordBreak: 'break-word' }}>{c.comment}</div>
                </div>
              ))}
            </div>
          </Group>
        )}
      </div>
    );
  };

  const renderActions = (f, open) => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }} onClick={(e) => e.stopPropagation()}>
      <button type="button" style={iconBtn} title={open ? 'Hide details' : 'Show details'} aria-label="Toggle details" onClick={() => toggleExpanded(f._id)}>
        {open ? <FaChevronUp size={12} color={C.primary} /> : <FaChevronDown size={12} color={C.primary} />}
      </button>
      {f.fileUrl && (
        <a href={f.fileUrl} target="_blank" rel="noopener noreferrer" style={iconBtn} title="Open file" aria-label="Open file">
          <FiExternalLink size={14} color={C.primary} />
        </a>
      )}
      <button type="button" style={{ ...iconBtn, borderColor: '#f5b8b2', background: '#fde8e6' }} title="Delete file" aria-label="Delete file" onClick={() => handleDeleteClick(f)}>
        <FaTrash size={12} color={C.destructive} />
      </button>
    </div>
  );

  const renderPersonCell = (u) => (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontWeight: 600, color: 'var(--text-strong)', lineHeight: 1.25 }}>{u?.name || '—'}</div>
      <div style={{ marginTop: 3 }}><RoleBadge role={roleOfUser(u)} /></div>
    </div>
  );

  return (
    <>
      <AdminHeader />
      <SafeKeyGuard>
        <div style={{ background: 'var(--background)', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: 'var(--foreground)', padding: '0 2px' }}>

          <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', boxShadow: '0 2px 10px var(--shadow-color)', overflow: 'hidden', marginBottom: 16 }}>

            {/* ── Title bar ── */}
            <div style={{ borderBottom: '1px solid var(--border)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fde8e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FaExclamationTriangle size={15} color={C.destructive} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>All DFS Files · Danger Zone</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                    Every document file in the system. Open a row for the full history; deleting a file is permanent.
                  </div>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--muted)', padding: '4px 12px', borderRadius: 20 }}>
                {files.length} total
              </span>
            </div>

            <div style={{ padding: '16px 20px' }}>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <span style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>Loading all DFS files…</div>
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fde8e6', border: '1px solid #f5b8b2', borderRadius: 12 }}>
                  <FaExclamationTriangle size={26} color={C.destructive} style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.destructive, marginBottom: 4 }}>Could not load files</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{error}</div>
                </div>
              ) : files.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <FaFolderOpen size={32} color={C.muted} style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>No DFS files yet</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Files will appear here once someone uploads a document.</div>
                </div>
              ) : (
                <>
                  {/* ── Summary chips: status + current owner role ── */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
                    {[
                      { key: 'all', label: 'All', value: counts.total, bg: 'var(--secondary)', color: C.primary },
                      { key: 'pending', label: 'Pending', value: counts.pending, bg: 'var(--secondary)', color: 'var(--secondary-foreground)' },
                      { key: 'in-review', label: 'In review', value: counts.review, bg: 'var(--warning)', color: 'var(--warning-foreground)' },
                      { key: 'approved', label: 'Approved', value: counts.approved, bg: 'var(--success)', color: 'var(--success-foreground)' },
                      { key: 'rejected', label: 'Rejected', value: counts.rejected, bg: '#fde8e6', color: C.destructive },
                    ].map(({ key, label, value, bg, color }) => {
                      const active = statusFilter === key;
                      return (
                        <button key={key} type="button" onClick={() => setStatusFilter(key)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 999, cursor: 'pointer', background: bg, color, fontSize: 12.5, fontWeight: 700,
                            border: `1px solid ${active ? color : 'var(--border)'}`, boxShadow: active ? `0 0 0 2px ${color}33` : 'none',
                          }}>
                          {label}
                          <span style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 20, padding: '1px 8px', fontSize: 11 }}>{value}</span>
                        </button>
                      );
                    })}
                  </div>
                  {rolesLoaded && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <span style={{ ...labelStyle, marginRight: 2 }}>Owned by</span>
                      {['admin', 'staff', 'client'].map((role) => {
                        const { label, bg, color, Icon } = roleMeta(role);
                        const active = ownerRole === role;
                        return (
                          <button key={role} type="button" onClick={() => setOwnerRole(active ? 'all' : role)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 13px', borderRadius: 999, cursor: 'pointer', background: bg, color, fontSize: 12, fontWeight: 700,
                              border: `1px solid ${active ? color : 'var(--border)'}`, boxShadow: active ? `0 0 0 2px ${color}33` : 'none',
                            }}>
                            <Icon size={10} color={color} /> {label}
                            <span style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 20, padding: '1px 8px', fontSize: 11 }}>{counts[role]}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Search / filter / sort bar ── */}
                  <div className="ad-toolbar">
                    <div className="ad-search">
                      <FiSearch size={15} color={C.muted} className="ad-icon-left" />
                      <input type="text" placeholder="Search title, description, people, notes, CID or file ID…" value={searchText}
                        onChange={(e) => setSearchText(e.target.value)} className="ad-ctl" style={{ paddingLeft: 36, paddingRight: searchText ? 34 : 12 }} />
                      {searchText && (
                        <button type="button" aria-label="Clear search" className="ad-clear" onClick={() => setSearchText('')}><FiX size={14} color={C.muted} /></button>
                      )}
                    </div>

                    <div className="ad-select">
                      <FiFilter size={14} color={C.muted} className="ad-icon-left" />
                      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="ad-ctl" aria-label="Filter by status">
                        <option value="all">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in-review">In Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <FiChevronDown size={14} color={C.muted} className="ad-icon-right" />
                    </div>

                    <div className="ad-select">
                      <FaUsers size={13} color={C.muted} className="ad-icon-left" />
                      <select value={ownerRole} onChange={(e) => setOwnerRole(e.target.value)} className="ad-ctl" aria-label="Filter by current owner role" disabled={!rolesLoaded}
                        title={rolesLoaded ? '' : 'Roles could not be loaded'}>
                        <option value="all">Any owner role</option>
                        <option value="admin">Owner: Admin</option>
                        <option value="staff">Owner: Staff</option>
                        <option value="client">Owner: Client</option>
                        <option value="unknown">Owner: Unknown</option>
                      </select>
                      <FiChevronDown size={14} color={C.muted} className="ad-icon-right" />
                    </div>

                    <div className="ad-select">
                      <FiTag size={14} color={C.muted} className="ad-icon-left" />
                      <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="ad-ctl" aria-label="Filter by document type">
                        <option value="all">All types</option>
                        {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <FiChevronDown size={14} color={C.muted} className="ad-icon-right" />
                    </div>

                    <div className="ad-select">
                      <FiBriefcase size={14} color={C.muted} className="ad-icon-left" />
                      <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="ad-ctl" aria-label="Filter by department">
                        <option value="all">All departments</option>
                        {deptOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <FiChevronDown size={14} color={C.muted} className="ad-icon-right" />
                    </div>

                    <div className="ad-select">
                      {sortKey.endsWith('-asc') || sortKey === 'owner-asc'
                        ? <FiArrowUp size={14} color={C.muted} className="ad-icon-left" />
                        : <FiArrowDown size={14} color={C.muted} className="ad-icon-left" />}
                      <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="ad-ctl" aria-label="Sort files">
                        <option value="created-desc">Uploaded: Newest</option>
                        <option value="created-asc">Uploaded: Oldest</option>
                        <option value="activity-desc">Last activity: Recent</option>
                        <option value="forwards-desc">Most forwarded</option>
                        <option value="title-asc">Title: A to Z</option>
                        <option value="title-desc">Title: Z to A</option>
                        <option value="owner-asc">Owner: A to Z</option>
                      </select>
                      <FiChevronDown size={14} color={C.muted} className="ad-icon-right" />
                    </div>

                    {hasActiveFilters && (
                      <button type="button" className="ad-reset" onClick={resetFilters}><FiRotateCcw size={13} /> Reset</button>
                    )}
                    <div className="ad-count">Showing <strong>{filteredFiles.length}</strong> of <strong>{files.length}</strong> files</div>
                  </div>

                  {/* ── Empty (after filtering) ── */}
                  {filteredFiles.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '44px 20px', background: 'var(--muted)', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <FaFolderOpen size={30} color={C.muted} style={{ marginBottom: 10 }} />
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>No matching files</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Try adjusting your search or filters.</div>
                    </div>
                  )}

                  {/* ── Desktop table ── */}
                  {filteredFiles.length > 0 && (
                    <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                            {['#', 'Document', 'Uploaded by', 'Current owner', 'Status', 'Forwards', 'Last activity', 'Actions'].map((h, i) => (
                              <th key={h} style={{ ...thStyle, textAlign: i === 7 ? 'right' : 'left' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFiles.map((f, index) => {
                            const open = !!expanded[f._id];
                            return (
                              <React.Fragment key={f._id || index}>
                                <tr onClick={() => toggleExpanded(f._id)}
                                  style={{ borderBottom: open ? 'none' : '1px solid var(--border)', cursor: 'pointer', background: open ? 'var(--muted)' : 'transparent', transition: 'background .15s' }}
                                  onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = 'var(--muted)'; }}
                                  onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = 'transparent'; }}>
                                  <td style={{ padding: '11px 14px' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'var(--secondary)', color: 'var(--secondary-foreground)', fontWeight: 700, fontSize: 11.5 }}>{index + 1}</span>
                                  </td>
                                  <td style={{ padding: '11px 14px', maxWidth: 280 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.fileTitle}>{f.fileTitle || '—'}</div>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                                      {f.docType && <span style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{f.docType}</span>}
                                      {f.Department && <span style={{ background: 'var(--muted)', color: 'var(--text-muted)', fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>{f.Department}</span>}
                                    </div>
                                  </td>
                                  <td style={{ padding: '11px 14px' }}>{renderPersonCell(f.uploadedBy)}</td>
                                  <td style={{ padding: '11px 14px' }}>{renderPersonCell(f.currentOwner)}</td>
                                  <td style={{ padding: '11px 14px' }}><StatusBadge status={f.status} /></td>
                                  <td style={{ padding: '11px 14px', fontWeight: 700, color: 'var(--text-strong)' }}>{f.forwardingTrail?.length || 0}</td>
                                  <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(lastActivityOf(f))}</td>
                                  <td style={{ padding: '11px 14px' }}>{renderActions(f, open)}</td>
                                </tr>
                                {open && (
                                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                                    <td colSpan={8} style={{ padding: '4px 14px 16px' }}>{renderDetails(f)}</td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ── Mobile cards ── */}
                  {filteredFiles.length > 0 && (
                    <div className="d-md-none">
                      {filteredFiles.map((f, index) => {
                        const open = !!expanded[f._id];
                        return (
                          <div key={f._id || index} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 12, boxShadow: '0 2px 8px var(--shadow-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.25, wordBreak: 'break-word' }}>{f.fileTitle || '—'}</div>
                                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{[f.docType, f.Department].filter(Boolean).join(' · ')}</div>
                              </div>
                              <StatusBadge status={f.status} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px', marginBottom: 12 }}>
                              <div><div style={{ ...labelStyle, marginBottom: 2 }}>Uploaded by</div>{renderPersonCell(f.uploadedBy)}</div>
                              <div><div style={{ ...labelStyle, marginBottom: 2 }}>Current owner</div>{renderPersonCell(f.currentOwner)}</div>
                              <div><div style={{ ...labelStyle, marginBottom: 2 }}>Forwards</div><div style={{ fontWeight: 700, color: 'var(--text-strong)' }}>{f.forwardingTrail?.length || 0}</div></div>
                              <div><div style={{ ...labelStyle, marginBottom: 2 }}>Last activity</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{fmtDate(lastActivityOf(f))}</div></div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button type="button" onClick={() => toggleExpanded(f._id)}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 9, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                {open ? <>Hide details <FaChevronUp size={11} /></> : <>More details <FaChevronDown size={11} /></>}
                              </button>
                              <button type="button" onClick={() => handleDeleteClick(f)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: '1px solid #f5b8b2', background: '#fde8e6', color: C.destructive, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                <FaTrash size={11} /> Delete
                              </button>
                            </div>
                            {open && <div style={{ marginTop: 14 }}>{renderDetails(f)}</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <DeleteConfirmationModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          itemName={selectedFile?.fileTitle}
          itemType="DFS Document"
        />
      </SafeKeyGuard>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: var(--input); color: var(--foreground); }
        .ad-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 10px 0 14px; margin-bottom: 6px; border-bottom: 1px solid var(--border); }
        .ad-search { position: relative; flex: 1 1 280px; min-width: 200px; }
        .ad-select { position: relative; flex: 0 1 175px; min-width: 150px; }
        .ad-ctl { width: 100%; height: 38px; box-sizing: border-box; border: 1px solid var(--border); border-radius: 10px; background: var(--input); color: var(--foreground); font-size: 13px; outline: none; transition: border-color .15s, box-shadow .15s; }
        .ad-select .ad-ctl { appearance: none; -webkit-appearance: none; cursor: pointer; padding: 0 32px 0 34px; }
        .ad-ctl:disabled { opacity: .6; cursor: not-allowed; }
        .ad-ctl:hover:not(:disabled) { border-color: var(--muted-foreground, #8b7b74); }
        .ad-ctl:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(107, 62, 43, 0.14); }
        .ad-icon-left, .ad-icon-right { position: absolute; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .ad-icon-left { left: 12px; }
        .ad-icon-right { right: 11px; }
        .ad-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); width: 24px; height: 24px; border: none; border-radius: 50%; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .ad-clear:hover { background: var(--muted); }
        .ad-reset { display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 12px; border-radius: 10px; border: 1px dashed var(--border); background: transparent; color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background .15s, color .15s; }
        .ad-reset:hover { background: var(--secondary); color: var(--secondary-foreground); }
        .ad-count { margin-left: auto; font-size: 12px; color: var(--text-muted); white-space: nowrap; }
        .ad-count strong { color: var(--text-strong); }
        @media (max-width: 640px) {
          .ad-search, .ad-select { flex: 1 1 100%; }
          .ad-count { margin-left: 0; width: 100%; }
        }
      `}</style>
    </>
  );
};

export default AllDFSRequests;
