import React, { useState, useEffect } from 'react';
import { FaUserTag, FaSave, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import { getUsersList } from '../../services/project.service.js';
import { updateUserTag } from '../../services/userTag.service.js';

const C = {
    primary: '#6b3e2b',
    accent: '#b95a52',
    success: '#225b31',
    destructive: '#c94a3a',
    muted: '#8b7b74',
};

// Keep this in sync with the User schema's `tag` enum.
const TAG_OPTIONS = [
    'admin', 'ceo', 'cto', 'cfo', 'coo', 'director', 'site_incharge',
    'chief_finance_head', 'finance_head', 'accountant', 'supervisor',
    'client', 'staff',
];

const prettify = (v) =>
    typeof v === 'string' ? v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

// ── shared styles — same theme as the rest of the admin pages ──
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
    border: '1px solid var(--border)', borderRadius: 8,
    padding: '7px 10px', fontSize: 13, color: 'var(--foreground)',
    background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
};
const tableWrapStyle = { overflowX: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 720 };
const thStyle = {
    textAlign: 'left', padding: '8px 10px', fontSize: 10.5, fontWeight: 700,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em',
    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
};
const tdStyle = {
    padding: '8px 10px', borderBottom: '1px solid var(--border)',
    color: 'var(--foreground)', whiteSpace: 'nowrap',
};
const saveButtonStyle = (busy) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
    border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 12, fontWeight: 600,
    cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1,
});

export default function UserTagManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // Per-row editable tag value, keyed by user _id — seeded from each
    // user's current tag so the select shows their existing value until
    // changed.
    const [tagByUser, setTagByUser] = useState({});
    const [savingId, setSavingId] = useState(null);
    const [savedId, setSavedId] = useState(null);
    const [errorByUser, setErrorByUser] = useState({});

    const loadUsers = async () => {
        setLoading(true);
        setLoadError('');
        try {
            const data = await getUsersList();
            const list = Array.isArray(data) ? data : [];
            setUsers(list);
            const initial = {};
            list.forEach((u) => { initial[u._id] = u.tag || ''; });
            setTagByUser(initial);
        } catch (err) {
            setLoadError(err.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    const handleTagChange = (userId, value) => {
        setTagByUser((prev) => ({ ...prev, [userId]: value }));
        setSavedId(null);
        setErrorByUser((prev) => ({ ...prev, [userId]: '' }));
    };

    const handleUpdate = async (userId) => {
        const tag = tagByUser[userId];
        if (!tag) {
            setErrorByUser((prev) => ({ ...prev, [userId]: 'Select a tag.' }));
            return;
        }
        setSavingId(userId);
        setSavedId(null);
        setErrorByUser((prev) => ({ ...prev, [userId]: '' }));
        try {
            const updated = await updateUserTag(userId, tag);
            setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, tag: updated.tag } : u)));
            setSavedId(userId);
        } catch (err) {
            setErrorByUser((prev) => ({ ...prev, [userId]: err.message || 'Failed to update tag' }));
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div style={{
            padding: '0 2px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: 'var(--foreground)',
            background: 'var(--background)',
            minHeight: '100vh',
        }}>
            <div style={moduleCardStyle}>
                <div style={{ ...moduleBodyStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 8, background: 'var(--warning)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <FaUserTag size={17} color={C.primary} />
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)' }}>
                        Manage User Tags
                    </div>
                </div>
            </div>

            <div style={moduleCardStyle}>
                <div style={moduleBodyStyle}>
                    <div style={sectionHeaderStyle}>
                        <FaUserTag size={13} color={C.accent} />
                        <span>Users ({users.length})</span>
                    </div>

                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                            <FiRefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading users…
                        </div>
                    )}

                    {!loading && loadError && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.destructive }}>
                            <FaTimesCircle size={13} /> {loadError}
                        </div>
                    )}

                    {!loading && !loadError && (
                        <div style={tableWrapStyle}>
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Name</th>
                                        <th style={thStyle}>Email / CID</th>
                                        <th style={thStyle}>Role</th>
                                        <th style={thStyle}>Current Tag</th>
                                        <th style={thStyle}>New Tag</th>
                                        <th style={thStyle}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id}>
                                            <td style={tdStyle}>{u.name || '—'}</td>
                                            <td style={tdStyle}>{u.cid || u.email || '—'}</td>
                                            <td style={tdStyle}>{prettify(u.role)}</td>
                                            <td style={tdStyle}>{prettify(u.tag)}</td>
                                            <td style={tdStyle}>
                                                <select
                                                    value={tagByUser[u._id] || ''}
                                                    onChange={(e) => handleTagChange(u._id, e.target.value)}
                                                    style={{ ...controlStyle, cursor: 'pointer', minWidth: 160 }}
                                                >
                                                    <option value="">Select tag</option>
                                                    {TAG_OPTIONS.map((t) => (
                                                        <option key={t} value={t}>{prettify(t)}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <button
                                                        onClick={() => handleUpdate(u._id)}
                                                        disabled={savingId === u._id}
                                                        style={saveButtonStyle(savingId === u._id)}
                                                    >
                                                        <FaSave size={11} /> {savingId === u._id ? 'Saving…' : 'Update'}
                                                    </button>
                                                    {savedId === u._id && <FaCheckCircle size={13} color={C.success} title="Updated" />}
                                                    {errorByUser[u._id] && (
                                                        <span style={{ fontSize: 11, color: C.destructive }}>{errorByUser[u._id]}</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}