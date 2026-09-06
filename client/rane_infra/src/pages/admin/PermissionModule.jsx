import React, { useState, useEffect } from 'react';
import { FaUserShield, FaPlus, FaTrash, FaSave, FaTimesCircle } from 'react-icons/fa';
import { getProjectPermissionAssignments,upsertProjectPermission,removeProjectPermission,} from '../../services/permissionService.js';
import { getUsersList } from '../../services/project.service.js';
import { SECTIONS } from '../../component/hooks/userPermission.js';

const SECTION_LABELS = {
    basic: 'Basic',
    location: 'Location',
    advance: 'Advance',
    bidding: 'Bidding',
    advance_financial: 'Advanced Financial',
    penalty: 'Penalty',
    security_deposit: 'Security Deposit',
    material: 'Material',
    bill: 'Bill',
    document: 'Document',
    task: 'Task',
    approvals: 'Approvals',
};

const emptyMatrix = () => {
    const m = {};
    SECTIONS.forEach((s) => { m[s] = { view: false, edit: false }; });
    return m;
};

const prettifyTag = (t) =>
    typeof t === 'string' ? t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

// ── styles — same theme as the rest of the admin pages ──
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
const controlStyle = {
    width: '100%', border: '1px solid var(--border)', borderRadius: 8,
    padding: '9px 12px', fontSize: 13.5, color: 'var(--foreground)',
    background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
};
const secondaryButtonStyle = {
    display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)',
    fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
};
const saveButtonStyle = (busy) => ({
    display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8,
    border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 600,
    cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1,
});
const subCardStyle = {
    background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 8,
    padding: '14px 16px', marginBottom: 12,
};
const badgeStyle = (bg, fg) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
    background: bg, color: fg, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap',
});
const tableWrapStyle = { overflowX: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 760 };
const thStyle = {
    textAlign: 'center', padding: '8px 6px', fontSize: 10, fontWeight: 700,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em',
    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
};
const thLeftStyle = { ...thStyle, textAlign: 'left' };
const tdCenterStyle = { padding: '6px', textAlign: 'center', borderBottom: '1px solid var(--border)' };
const tdLeftStyle = { padding: '6px', textAlign: 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' };
const savedTag = { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: '#225b31', marginLeft: 12 };
const errorTag = { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: '#c94a3a', marginLeft: 12 };

// One checkbox matrix — used both for a brand-new assignment and for
// editing an existing one. `matrix` / `onChange` follow the shape
// { [section]: { view, edit } }.
function PermissionMatrix({ matrix, onChange }) {
    const toggle = (section, action) => {
        onChange({
            ...matrix,
            [section]: { ...matrix[section], [action]: !matrix[section][action] },
        });
    };

    return (
        <div style={tableWrapStyle}>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thLeftStyle}>Section</th>
                        <th style={thStyle}>View</th>
                        <th style={thStyle}>Edit</th>
                    </tr>
                </thead>
                <tbody>
                    {SECTIONS.map((section) => (
                        <tr key={section}>
                            <td style={tdLeftStyle}>{SECTION_LABELS[section]}</td>
                            <td style={tdCenterStyle}>
                                <input
                                    type="checkbox"
                                    checked={matrix[section].view}
                                    onChange={() => toggle(section, 'view')}
                                    style={{ cursor: 'pointer', width: 16, height: 16 }}
                                />
                            </td>
                            <td style={tdCenterStyle}>
                                <input
                                    type="checkbox"
                                    checked={matrix[section].edit}
                                    onChange={() => toggle(section, 'edit')}
                                    style={{ cursor: 'pointer', width: 16, height: 16 }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function PermissionsModule({ project }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // ── "add a new assignment" flow ──
    const [users, setUsers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [newMatrix, setNewMatrix] = useState(emptyMatrix());
    const [savingNew, setSavingNew] = useState(false);
    const [newError, setNewError] = useState('');

    // ── per-row edit state, keyed by assignment/user id ──
    const [editingId, setEditingId] = useState(null);
    const [editMatrix, setEditMatrix] = useState(emptyMatrix());
    const [savingEditId, setSavingEditId] = useState(null);
    const [editError, setEditError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [saved, setSaved] = useState(false);

    const loadAssignments = async () => {
        setLoading(true);
        setLoadError('');
        try {
            const data = await getProjectPermissionAssignments(project._id);
            setAssignments(Array.isArray(data) ? data : []);
        } catch (err) {
            setLoadError(err.message || 'Failed to load permission assignments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAssignments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project._id]);

    const openAddForm = async () => {
        setShowAddForm(true);
        setNewError('');
        setSaved(false);
        if (users.length === 0) {
            try {
                const data = await getUsersList();
                setUsers(Array.isArray(data) ? data : []);
            } catch (err) {
                setNewError(err.message || 'Failed to load users');
            }
        }
    };

    // Every user starts from a blank matrix — there are no tag defaults
    // to pre-fill from. Each user's access is set explicitly, one at a
    // time, by whoever's managing permissions.
    const handleSelectUser = (e) => {
        const userId = e.target.value;
        setSelectedUserId(userId);
        setNewError('');
        setNewMatrix(emptyMatrix());
    };

    const handleSaveNew = async () => {
        if (!selectedUserId) {
            setNewError('Select a user first.');
            return;
        }
        setSavingNew(true);
        setNewError('');
        try {
            await upsertProjectPermission(project._id, selectedUserId, newMatrix);
            await loadAssignments();
            setShowAddForm(false);
            setSelectedUserId('');
            setNewMatrix(emptyMatrix());
            setSaved(true);
        } catch (err) {
            setNewError(err.message || 'Failed to save permissions');
        } finally {
            setSavingNew(false);
        }
    };

    const startEditing = (assignment) => {
        setEditingId(assignment._id);
        setEditMatrix({ ...emptyMatrix(), ...assignment.permissions });
        setEditError('');
        setSaved(false);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditError('');
    };

    const handleSaveEdit = async (assignment) => {
        setSavingEditId(assignment._id);
        setEditError('');
        try {
            await upsertProjectPermission(project._id, assignment.user._id, editMatrix);
            await loadAssignments();
            setEditingId(null);
            setSaved(true);
        } catch (err) {
            setEditError(err.message || 'Failed to save permissions');
        } finally {
            setSavingEditId(null);
        }
    };

    const handleRemove = async (assignment) => {
        if (!window.confirm(`Remove ${assignment.user?.name || 'this user'}'s access to this project? They will have NO access to any section until re-granted.`)) return;
        setDeletingId(assignment._id);
        try {
            await removeProjectPermission(project._id, assignment.user._id);
            await loadAssignments();
        } catch (err) {
            setLoadError(err.message || 'Failed to remove permission override');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div style={moduleCardStyle}>
            <div style={moduleBodyStyle}>
                <div style={{ ...sectionHeaderStyle, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FaUserShield size={13} color="#b95a52" />
                        <span>Section Permissions</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                        {assignments.length} user{assignments.length === 1 ? '' : 's'} with project-specific access
                    </span>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                    Access on this project is set per user — there are no tag-based defaults. A user
                    with no entry below has no access to any section until you grant it explicitly.
                </div>

                {loading && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading…</div>}
                {!loading && loadError && <div style={{ fontSize: 13, color: '#c94a3a' }}>{loadError}</div>}

                {!loading && !loadError && assignments.length === 0 && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                        No project-specific overrides yet — everyone is on their tag's defaults.
                    </div>
                )}

                {!loading && !loadError && assignments.map((a) => (
                    <div key={a._id} style={subCardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: editingId === a._id ? 12 : 0, flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.user?.name || 'Unknown user'}</div>
                            <span style={badgeStyle('var(--secondary)', 'var(--secondary-foreground)')}>{prettifyTag(a.tag || a.user?.tag)}</span>
                            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{a.user?.email}</span>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                {editingId === a._id ? (
                                    <>
                                        <button onClick={() => handleSaveEdit(a)} disabled={savingEditId === a._id} style={{ ...secondaryButtonStyle, background: 'var(--primary)', color: '#fff', border: 'none' }}>
                                            <FaSave size={11} /> {savingEditId === a._id ? 'Saving…' : 'Save'}
                                        </button>
                                        <button onClick={cancelEditing} style={secondaryButtonStyle}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => startEditing(a)} style={secondaryButtonStyle}>Edit access</button>
                                        <button
                                            onClick={() => handleRemove(a)}
                                            disabled={deletingId === a._id}
                                            style={{ ...secondaryButtonStyle, color: '#c94a3a' }}
                                        >
                                            <FaTrash size={11} /> {deletingId === a._id ? 'Removing…' : 'Remove'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        {editingId === a._id && (
                            <>
                                <PermissionMatrix matrix={editMatrix} onChange={setEditMatrix} />
                                {editError && <div style={{ fontSize: 11.5, color: '#c94a3a', marginTop: 8 }}>{editError}</div>}
                            </>
                        )}
                    </div>
                ))}

                {!showAddForm ? (
                    <button onClick={openAddForm} style={secondaryButtonStyle}>
                        <FaPlus size={11} /> Grant project-specific access
                    </button>
                ) : (
                    <div style={subCardStyle}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>New access grant</div>
                        <div style={{ maxWidth: 380, marginBottom: 14 }}>
                            <select
                                value={selectedUserId}
                                onChange={handleSelectUser}
                                style={{ ...controlStyle, cursor: 'pointer' }}
                            >
                                <option value="">Select a user</option>
                                {users.map((u) => (
                                    <option key={u._id} value={u._id}>
                                        {u.name} ({u.cid || u.email}) — {prettifyTag(u.tag)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedUserId && (
                            <>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                                    Set exactly what this user can view and edit on this project — every box starts unchecked.
                                </div>
                                <PermissionMatrix matrix={newMatrix} onChange={setNewMatrix} />
                            </>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                            <button onClick={handleSaveNew} disabled={savingNew} style={saveButtonStyle(savingNew)}>
                                <FaSave size={12} /> {savingNew ? 'Saving…' : 'Save access'}
                            </button>
                            <button onClick={() => { setShowAddForm(false); setSelectedUserId(''); setNewError(''); }} style={secondaryButtonStyle}>
                                Cancel
                            </button>
                            {newError && <span style={errorTag}><FaTimesCircle size={11} /> {newError}</span>}
                        </div>
                    </div>
                )}

                {saved && <div style={savedTag}>Saved</div>}
            </div>
        </div>
    );
}