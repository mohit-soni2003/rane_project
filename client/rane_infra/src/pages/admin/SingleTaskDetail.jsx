import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaTasks, FaProjectDiagram, FaUserCircle, FaUsers, FaFileAlt,
    FaClipboardCheck, FaCheckCircle, FaShieldAlt, FaCalendarAlt,
    FaPlus, FaTrash, FaSave, FaTimesCircle, FaExternalLinkAlt,
    FaSearch, FaClock, FaImages, FaInfoCircle,
} from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import AdminHeader from '../../component/header/AdminHeader';
import {
    getTaskById,
    addUserToTask,
    removeUserFromTask,
    addDocumentToTask,
    removeDocumentFromTask,
    verifyTask,
} from '../../services/task.service.js';
import { getUsersList, getProjectById } from '../../services/project.service.js';

const C = {
    primary: '#6b3e2b',
    accent: '#b95a52',
    success: '#225b31',
    destructive: '#c94a3a',
    muted: '#8b7b74',
};

/* ── enum lists (must match Task schema exactly) ─────────────────────────── */

const OVERALL_STATUSES = ['pending', 'in_progress', 'submitted', 'completed', 'overdue', 'rejected'];

/* ── helpers ──────────────────────────────────────────────────────────────── */

const prettify = (v) =>
    typeof v === 'string' ? v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

const dash = (v) => (v === 0 ? '0' : v || v === false ? v : '—');

const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const formatDateTime = (d) =>
    d
        ? new Date(d).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
        : '—';

const userLabel = (u) => {
    if (!u) return '—';
    if (typeof u === 'string') return u;
    return u.name || u.email || u._id || '—';
};

const toAbsoluteUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('//')) return `https:${url}`;
    return `https://${url}`;
};

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

// Compares today against the deadline (calendar-day precision).
const deadlineDiff = (deadline) => {
    if (!deadline) return { label: '—', color: C.muted };
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const deadlineDay = new Date(deadline);
    deadlineDay.setHours(0, 0, 0, 0);
    const diffDays = Math.round((deadlineDay.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return { label: `${diffDays} day${diffDays === 1 ? '' : 's'} left`, color: diffDays <= 2 ? '#92400e' : C.success };
    if (diffDays === 0) return { label: 'Due today', color: '#92400e' };
    return { label: `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`, color: C.destructive };
};

/* ── shared styles (matches EditProjectDetail / SingleProjectDetail) ────── */

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

const controlStyle = {
    width: '100%', border: '1px solid var(--border)', borderRadius: 8,
    padding: '9px 12px', fontSize: 13.5, color: 'var(--foreground)',
    background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
};

const labelStyle = {
    fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', display: 'block',
    marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
};

const saveButtonStyle = (busy) => ({
    display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8,
    border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 600,
    cursor: busy ? 'not-allowed' : 'pointer', marginTop: 12, opacity: busy ? 0.7 : 1,
});

const secondaryButtonStyle = {
    display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)',
    fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
};

const dangerIconButtonStyle = {
    border: 'none', background: 'transparent', color: C.destructive, cursor: 'pointer', padding: 4,
    display: 'inline-flex', alignItems: 'center',
};

const badgeStyle = (bg, fg) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
    background: bg, color: fg, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap',
});

const subCardStyle = {
    background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 8,
    padding: '12px 14px', marginBottom: 10,
};

const savedTag = {
    display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600,
    color: C.success, marginLeft: 12,
};

const errorTag = {
    display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600,
    color: C.destructive, marginLeft: 12,
};

const navPillStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
    padding: '6px 12px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer',
    border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)',
};

function Field({ label, children }) {
    return (
        <div>
            <div style={rowLabelStyle}>{label}</div>
            <div style={rowValueStyle}>{children}</div>
        </div>
    );
}

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

const SECTIONS = [
    { id: 'basic', label: 'Basic', icon: <FaTasks size={12} /> },
    { id: 'allotment', label: 'Allotment', icon: <FaUsers size={12} /> },
    { id: 'documents', label: 'Documents', icon: <FaFileAlt size={12} /> },
    { id: 'status', label: 'Status', icon: <FaClipboardCheck size={12} /> },
    { id: 'images', label: 'Images', icon: <FaImages size={12} /> },
    { id: 'history', label: 'History', icon: <FaClock size={12} /> },
];

/* ══════════════════════════════════════════════════════════════════════════
   MODULE — Allotted Users (add / remove, with a client-side name filter)
   ══════════════════════════════════════════════════════════════════════════ */
function AllotmentModule({ task, onChanged }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [usersError, setUsersError] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState('');

    const [removingId, setRemovingId] = useState(null);
    const [removeError, setRemoveError] = useState('');

    const allottedIds = new Set((task.allottedTo || []).map((a) => (a.user?._id || a.user)));

    const openAddForm = async () => {
        setShowAddForm(true);
        setAddError('');
        if (users.length > 0 || loadingUsers) return;
        setLoadingUsers(true);
        setUsersError('');
        try {
            const data = await getUsersList();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            setUsersError(err.message || 'Failed to load users');
        } finally {
            setLoadingUsers(false);
        }
    };

    // Only users not already allotted, then filtered by the search box —
    // client-side only, fine up to the ~50-user scale this is meant for.
    const availableUsers = users
        .filter((u) => !allottedIds.has(u._id))
        .filter((u) => (u.name || '').toLowerCase().includes(userSearch.trim().toLowerCase()));

    const handleAddUser = async () => {
        if (!selectedUserId) {
            setAddError('Select a user to add.');
            return;
        }
        setAdding(true);
        setAddError('');
        try {
            await addUserToTask(task._id, selectedUserId);
            await onChanged();
            setSelectedUserId('');
            setUserSearch('');
            setShowAddForm(false);
        } catch (err) {
            setAddError(err.message || 'Failed to add user');
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!window.confirm('Remove this user from the task?')) return;
        setRemovingId(userId);
        setRemoveError('');
        try {
            await removeUserFromTask(task._id, userId);
            await onChanged();
        } catch (err) {
            setRemoveError(err.message || 'Failed to remove user');
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <Module
            id="allotment"
            icon={<FaUsers size={13} color={C.accent} />}
            title="Allotted Users"
            extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{task.allottedTo?.length || 0} user{task.allottedTo?.length === 1 ? '' : 's'}</span>}
        >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button type="button" onClick={openAddForm} style={secondaryButtonStyle}>
                    <FaPlus size={11} /> Add user
                </button>
            </div>

            {showAddForm && (
                <div style={{ ...subCardStyle, marginBottom: 16 }}>
                    <div style={subHeaderStyle}>Add a user to this task</div>
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                        <FaSearch
                            size={11} color={C.muted}
                            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
                        />
                        <input
                            type="text"
                            placeholder="Search users by name…"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            disabled={loadingUsers || !!usersError}
                            style={{ ...controlStyle, paddingLeft: 28 }}
                        />
                    </div>
                    <select
                        value={selectedUserId}
                        onChange={(e) => { setSelectedUserId(e.target.value); setAddError(''); }}
                        disabled={loadingUsers || !!usersError}
                        size={6}
                        style={{ ...controlStyle, cursor: loadingUsers ? 'not-allowed' : 'pointer' }}
                    >
                        {availableUsers.map((u) => (
                            <option key={u._id} value={u._id}>
                                {u.name || 'Unnamed'} ({u.cid || 'N/A'}) [{prettify(u.role) || u.role}]
                            </option>
                        ))}
                    </select>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4 }}>
                        {loadingUsers
                            ? 'Loading users…'
                            : usersError
                                ? usersError
                                : `${availableUsers.length} available`}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                        <button onClick={handleAddUser} disabled={adding} style={{ ...saveButtonStyle(adding) }}>
                            <FaPlus size={12} /> {adding ? 'Adding…' : 'Add to task'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowAddForm(false); setSelectedUserId(''); setUserSearch(''); setAddError(''); }}
                            style={{ ...secondaryButtonStyle, marginTop: 12 }}
                        >
                            Cancel
                        </button>
                        {addError && <span style={errorTag}>{addError}</span>}
                    </div>
                </div>
            )}

            {removeError && <div style={{ ...errorTag, marginLeft: 0, marginBottom: 10 }}>{removeError}</div>}

            {task.allottedTo && task.allottedTo.length > 0 ? (
                task.allottedTo.map((a, i) => {
                    const aStyle = taskStatusStyle(a.status);
                    const uid = a.user?._id || a.user;
                    return (
                        <div key={a._id || i} style={subCardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, flexWrap: 'wrap' }}>
                                <FaUserCircle size={15} color={C.muted} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{userLabel(a.user)}</span>
                                <span style={badgeStyle(aStyle.bg, aStyle.fg)}>{prettify(a.status)}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveUser(uid)}
                                    disabled={removingId === uid || task.allottedTo.length === 1}
                                    title={task.allottedTo.length === 1 ? "Can't remove the only allotted user" : 'Remove user'}
                                    style={{ ...dangerIconButtonStyle, marginLeft: 'auto', opacity: task.allottedTo.length === 1 ? 0.4 : 1 }}
                                >
                                    <FaTrash size={12} />
                                </button>
                            </div>
                            <div style={gridTwo}>
                                <Field label="Remark">{dash(a.remark)}</Field>
                                <Field label="Images">{a.images?.length || 0}</Field>
                                <Field label="Submitted at">{formatDateTime(a.submittedAt)}</Field>
                                <Field label="Completed at">{formatDateTime(a.completedAt)}</Field>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No users allotted.</div>
            )}
        </Module>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE — Related Documents (add / remove from the project's document list)
   ══════════════════════════════════════════════════════════════════════════ */
function DocumentsModule({ task, projectDocs, onChanged }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState('');
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState('');
    const [removingId, setRemovingId] = useState(null);
    const [removeError, setRemoveError] = useState('');

    const linkedIds = new Set(task.relatedDocuments || []);
    const availableDocs = (projectDocs || []).filter((d) => !linkedIds.has(d._id));
    const linkedDocs = (projectDocs || []).filter((d) => linkedIds.has(d._id));

    const handleAddDocument = async () => {
        if (!selectedDocId) {
            setAddError('Select a document to link.');
            return;
        }
        setAdding(true);
        setAddError('');
        try {
            await addDocumentToTask(task._id, selectedDocId);
            await onChanged();
            setSelectedDocId('');
            setShowAddForm(false);
        } catch (err) {
            setAddError(err.message || 'Failed to add document');
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveDocument = async (docId) => {
        if (!window.confirm('Unlink this document from the task?')) return;
        setRemovingId(docId);
        setRemoveError('');
        try {
            await removeDocumentFromTask(task._id, docId);
            await onChanged();
        } catch (err) {
            setRemoveError(err.message || 'Failed to remove document');
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <Module
            id="documents"
            icon={<FaFileAlt size={13} color={C.accent} />}
            title="Related Documents"
            extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{task.relatedDocuments?.length || 0} linked</span>}
        >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button type="button" onClick={() => { setShowAddForm(true); setAddError(''); }} style={secondaryButtonStyle}>
                    <FaPlus size={11} /> Add document
                </button>
            </div>

            {showAddForm && (
                <div style={{ ...subCardStyle, marginBottom: 16 }}>
                    <div style={subHeaderStyle}>Link a project document</div>
                    <select
                        value={selectedDocId}
                        onChange={(e) => { setSelectedDocId(e.target.value); setAddError(''); }}
                        disabled={availableDocs.length === 0}
                        style={{ ...controlStyle, cursor: 'pointer' }}
                    >
                        <option value="">
                            {availableDocs.length === 0 ? 'No more documents to link' : 'Select a document'}
                        </option>
                        {availableDocs.map((d) => (
                            <option key={d._id} value={d._id}>{d.name} ({prettify(d.documentType)})</option>
                        ))}
                    </select>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                        <button onClick={handleAddDocument} disabled={adding || availableDocs.length === 0} style={saveButtonStyle(adding)}>
                            <FaPlus size={12} /> {adding ? 'Linking…' : 'Link document'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowAddForm(false); setSelectedDocId(''); setAddError(''); }}
                            style={{ ...secondaryButtonStyle, marginTop: 12 }}
                        >
                            Cancel
                        </button>
                        {addError && <span style={errorTag}>{addError}</span>}
                    </div>
                </div>
            )}

            {removeError && <div style={{ ...errorTag, marginLeft: 0, marginBottom: 10 }}>{removeError}</div>}

            {linkedDocs.length > 0 ? (
                linkedDocs.map((doc) => (
                    <div key={doc._id} style={{ ...subCardStyle, display: 'flex', alignItems: 'center', gap: 9 }}>
                        <FaFileAlt size={14} color={C.accent} style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {doc.name}
                            </div>
                        </div>
                        <span style={badgeStyle('var(--secondary)', 'var(--secondary-foreground)')}>{prettify(doc.documentType)}</span>
                        {doc.url && (
                            <a href={toAbsoluteUrl(doc.url)} target="_blank" rel="noreferrer"
                                style={{ color: 'var(--link)', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, flexShrink: 0 }}>
                                Open <FaExternalLinkAlt size={10} />
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={() => handleRemoveDocument(doc._id)}
                            disabled={removingId === doc._id}
                            title="Unlink document"
                            style={dangerIconButtonStyle}
                        >
                            <FaTrash size={12} />
                        </button>
                    </div>
                ))
            ) : (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {task.relatedDocuments?.length > 0
                        ? "Linked, but the project's document list couldn't be matched."
                        : 'No documents linked yet.'}
                </div>
            )}
        </Module>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODULE — Overall Status & Verification → PATCH /task/verify/:id
   ══════════════════════════════════════════════════════════════════════════ */
function StatusModule({ task, onChanged }) {
    const [status, setStatus] = useState(task.status || 'pending');
    const [remark, setRemark] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleUpdate = async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            await verifyTask(task._id, { status, remark: remark || undefined });
            await onChanged();
            setSaved(true);
            setRemark('');
        } catch (err) {
            setError(err.message || 'Failed to update status');
        } finally {
            setSaving(false);
        }
    };

    const sStyle = taskStatusStyle(task.status);

    return (
        <Module id="status" icon={<FaClipboardCheck size={13} color={C.accent} />} title="Overall Status & Verification">
            <div style={gridTwo}>
                <Field label="Current status"><span style={badgeStyle(sStyle.bg, sStyle.fg)}>{prettify(task.status)}</span></Field>
                <Field label="Completed at">{formatDateTime(task.completedAt)}</Field>
                <Field label="Verified by">{userLabel(task.verifiedBy)}</Field>
                <Field label="Verified at">{formatDateTime(task.verifiedAt)}</Field>
            </div>

            <div style={subHeaderStyle}>Update status</div>
            <div style={gridTwo}>
                <div>
                    <label style={labelStyle}>New status</label>
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setSaved(false); setError(''); }}
                        style={{ ...controlStyle, cursor: 'pointer' }}
                    >
                        {OVERALL_STATUSES.map((s) => <option key={s} value={s}>{prettify(s)}</option>)}
                    </select>
                </div>
            </div>
            <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Remark</label>
                <textarea
                    rows={2} value={remark}
                    onChange={(e) => { setRemark(e.target.value); setSaved(false); setError(''); }}
                    style={{ ...controlStyle, resize: 'vertical' }}
                />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <FaInfoCircle size={11} /> Setting status to "Completed" automatically records the verification (verified by you, timestamped now).
            </div>

            <button onClick={handleUpdate} disabled={saving} style={saveButtonStyle(saving)}>
                <FaSave size={12} /> {saving ? 'Updating…' : 'Update status'}
            </button>
            {saved && <span style={savedTag}>Updated</span>}
            {error && <span style={errorTag}>{error}</span>}
        </Module>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
export default function SingleTaskDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [projectDocs, setProjectDocs] = useState([]);
    const [projectDocsError, setProjectDocsError] = useState('');

    const fetchTask = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getTaskById(id);
            setTask(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to load task');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // The task's populated "project" field only carries projectId/projectName
    // (see the backend's getTaskById route) — the full documents[] array
    // has to be fetched separately from the project itself.
    const fetchProjectDocs = async (projectRef) => {
        const projectId = projectRef?._id || projectRef;
        if (!projectId) return;
        setProjectDocsError('');
        try {
            const project = await getProjectById(projectId);
            setProjectDocs(Array.isArray(project?.documents) ? project.documents : []);
        } catch (err) {
            setProjectDocsError(err.message || 'Failed to load project documents');
        }
    };

    useEffect(() => {
        (async () => {
            if (!id) return;
            const data = await fetchTask();
            if (data?.project) await fetchProjectDocs(data.project);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Every management action (add/remove user, add/remove document, status
    // update) calls this afterward so the whole page reflects fresh server
    // state immediately — same "refresh on change" pattern as the edit page.
    const handleChanged = async () => {
        await fetchTask();
    };

    const scrollToSection = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Flatten every allotted user's images into one gallery, tagged with
    // whose submission each image belongs to.
    const allImages = (task?.allottedTo || []).flatMap((a) =>
        (a.images || []).map((img) => ({ ...img, ownerLabel: userLabel(a.user) }))
    );

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
                        <FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading task…
                    </div>
                )}

                {!loading && !error && task && (() => {
                    const pStyle = taskPriorityStyle(task.priority);
                    const sStyle = taskStatusStyle(task.status);
                    const dl = deadlineDiff(task.deadline);

                    return (
                        <>
                            {/* Identity header + quick-jump nav */}
                            <div style={moduleCardStyle}>
                                <div style={{ ...moduleBodyStyle, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 8, background: 'var(--warning)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <FaTasks size={17} color={C.primary} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.25 }}>
                                            {dash(task.title)}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                            <FaProjectDiagram size={10} />
                                            {dash(task.project?.projectName)} · {dash(task.project?.projectId)}
                                        </div>
                                    </div>
                                    <span style={badgeStyle(pStyle.bg, pStyle.fg)}>{prettify(task.priority)}</span>
                                    <span style={badgeStyle(sStyle.bg, sStyle.fg)}>{prettify(task.status)}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: dl.color }}>{dl.label}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 18px 16px' }}>
                                    {SECTIONS.map((s) => (
                                        <span key={s.id} style={navPillStyle} onClick={() => scrollToSection(s.id)}>
                                            {s.icon} {s.label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* ── Basic Details ── */}
                            <Module id="basic" icon={<FaTasks size={13} color={C.accent} />} title="Basic Details">
                                <div style={gridTwo}>
                                    <Field label="Title">{dash(task.title)}</Field>
                                    <Field label="Vertical">{task.vertical ? prettify(task.vertical) : '—'}</Field>
                                    <Field label="Priority">{prettify(task.priority)}</Field>
                                    <Field label="Allotted by">{userLabel(task.allottedBy)}</Field>
                                    <Field label="Start date">{formatDate(task.startDate)}</Field>
                                    <Field label="Deadline">{formatDate(task.deadline)}</Field>
                                    <Field label="Created at">{formatDateTime(task.createdAt)}</Field>
                                    <Field label="Last updated">{formatDateTime(task.updatedAt)}</Field>
                                </div>
                                <div style={{ marginTop: 10 }}>
                                    <Field label="Description">{dash(task.description)}</Field>
                                </div>
                                <div style={{ marginTop: 10 }}>
                                    <Field label="Latest remark">{dash(task.latestRemark)}</Field>
                                </div>
                            </Module>

                            {/* ── Allotted Users ── */}
                            <AllotmentModule task={task} onChanged={handleChanged} />

                            {/* ── Related Documents ── */}
                            {projectDocsError && (
                                <div style={{ ...errorTag, marginLeft: 0, marginBottom: 10 }}>{projectDocsError}</div>
                            )}
                            <DocumentsModule task={task} projectDocs={projectDocs} onChanged={handleChanged} />

                            {/* ── Overall Status & Verification ── */}
                            <StatusModule task={task} onChanged={handleChanged} />

                            {/* ── Uploaded Images ── */}
                            <Module
                                id="images"
                                icon={<FaImages size={13} color={C.accent} />}
                                title="Uploaded Images"
                                extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{allImages.length} image{allImages.length === 1 ? '' : 's'}</span>}
                            >
                                {allImages.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                                        {allImages.map((img, i) => (
                                            <a
                                                key={img._id || i}
                                                href={toAbsoluteUrl(img.url)}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{ display: 'block', textDecoration: 'none' }}
                                            >
                                                <div style={{
                                                    borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)',
                                                    aspectRatio: '1 / 1', background: 'var(--input)',
                                                }}>
                                                    <img
                                                        src={toAbsoluteUrl(img.url)}
                                                        alt={img.name || 'Task submission'}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                    />
                                                </div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {img.name || 'Untitled'}
                                                </div>
                                                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                                                    {img.ownerLabel} · {formatDate(img.uploadedAt)}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No images uploaded yet.</div>
                                )}
                            </Module>

                            {/* ── Status History ── */}
                            <Module
                                id="history"
                                icon={<FaClock size={13} color={C.accent} />}
                                title="Status History"
                                extra={<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{task.statusHistory?.length || 0} entries</span>}
                            >
                                {task.statusHistory && task.statusHistory.length > 0 ? (
                                    [...task.statusHistory].reverse().map((h, i) => {
                                        const hStyle = taskStatusStyle(h.status);
                                        return (
                                            <div key={i} style={subCardStyle}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, flexWrap: 'wrap' }}>
                                                    <span style={badgeStyle(hStyle.bg, hStyle.fg)}>{prettify(h.status)}</span>
                                                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                                        <FaClock size={10} style={{ marginRight: 4, verticalAlign: -1 }} />
                                                        {formatDateTime(h.updatedAt)}
                                                    </span>
                                                </div>
                                                <div style={gridTwo}>
                                                    <Field label="Updated by">{userLabel(h.updatedBy)}</Field>
                                                    <Field label="Remark">{dash(h.remark)}</Field>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No status changes logged.</div>
                                )}
                            </Module>
                        </>
                    );
                })()}

                {!loading && !error && !task && (
                    <div style={{
                        textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)',
                        background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
                    }}>
                        Task not found.
                    </div>
                )}

                <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
            </div>
        </>
    );
}