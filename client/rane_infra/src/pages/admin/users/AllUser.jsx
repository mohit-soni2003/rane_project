import React, { useEffect, useMemo, useState } from "react";
import AdminHeader from "../../../components/layout/header/AdminHeader";
import { backend_url } from "../../../store/keyStore";
import DeleteUserModal from "../../../components/modals/DeleteUserModal";
import SafeKeyGuard from '../../../components/modals/SafeKeyGuard';
import dummyUser from "../../../assets/images/dummyUser.jpeg";
import {
  FaUsers, FaTrash, FaUserShield, FaUserTie, FaUser, FaCheckCircle, FaHourglassHalf, FaChevronDown,
  FaChevronUp, FaBuilding, FaUniversity, FaIdCard, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle,
  FaFilePdf, FaRegCopy,
} from "react-icons/fa";
import {
  FiSearch, FiX, FiFilter, FiChevronDown, FiArrowDown, FiArrowUp, FiRotateCcw, FiShield, FiTag,
} from "react-icons/fi";

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
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0,
};

// ── Formatting helpers ────────────────────────────────────────────────────────
const fmtDateTime = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date) ? String(d) : date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date) ? '—' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const prettify = (t) => (typeof t === 'string' && t ? t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—');
const roleOf = (u) => (u.role || 'client').toLowerCase();

const roleMeta = (role) => {
  switch (role) {
    case 'admin': return { label: 'Admin', bg: '#f3e6df', color: '#6b3e2b', Icon: FaUserShield };
    case 'staff': return { label: 'Staff', bg: '#dbeafe', color: C.info, Icon: FaUserTie };
    default:      return { label: 'Client', bg: 'var(--success)', color: 'var(--success-foreground)', Icon: FaUser };
  }
};

const RoleBadge = ({ role }) => {
  const { label, bg, color, Icon } = roleMeta(role);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color }}>
      <Icon size={10} color={color} /> {label}
    </span>
  );
};

const VerifiedBadge = ({ verified }) => (
  verified ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: 'var(--success-foreground)', background: 'var(--success)', padding: '3px 10px', borderRadius: 20 }}>
      <FaCheckCircle size={10} /> Verified
    </span>
  ) : (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: 'var(--warning-foreground)', background: 'var(--warning)', padding: '3px 10px', borderRadius: 20 }}>
      <FaHourglassHalf size={10} /> Not verified
    </span>
  )
);

// Label + value (value may be any node). Empty values show a dash.
const Field = ({ label, children, mono, full }) => (
  <div style={{ minWidth: 0, gridColumn: full ? '1 / -1' : 'auto' }}>
    <div style={labelStyle}>{label}</div>
    <div style={{
      fontSize: 13, fontWeight: 600, marginTop: 3, color: 'var(--text-strong)', wordBreak: 'break-word',
      fontFamily: mono ? 'monospace' : 'inherit',
    }}>
      {children === 0 || children ? children : <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>—</span>}
    </div>
  </div>
);

// A titled box inside the expanded row
const Group = ({ icon: Icon, title, tone, children }) => (
  <div style={{
    background: tone === 'danger' ? '#fdf3f1' : 'var(--card)',
    border: `1px solid ${tone === 'danger' ? '#f5b8b2' : 'var(--border)'}`,
    borderRadius: 10, padding: '12px 14px', minWidth: 0,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 700, color: tone === 'danger' ? C.destructive : 'var(--text-strong)', marginBottom: 12 }}>
      <Icon size={12} color={tone === 'danger' ? C.destructive : C.accent} /> {title}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px 14px' }}>
      {children}
    </div>
  </div>
);

const DocLink = ({ href }) => (href ? (
  <a href={href} target="_blank" rel="noreferrer"
    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: C.accent, fontWeight: 600, textDecoration: 'none' }}>
    <FaFilePdf size={11} /> View document
  </a>
) : null);

export default function AllUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [verifyFilter, setVerifyFilter] = useState('all');
  const [sortKey, setSortKey] = useState('name-asc');

  const [expanded, setExpanded] = useState({});     // { [userId]: true }
  const [revealed, setRevealed] = useState({});     // sensitive section shown, { [userId]: true }
  const [copiedId, setCopiedId] = useState(null);

  const fetchUsers = () => {
    fetch(`${backend_url}/admin-get-users`)
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${backend_url}/admin-delete-user/${selectedUser._id}`, {
        method: "DELETE",
        credentials: "include", // the route is admin-only, so the login cookie must be sent
      });
      const result = await res.json();
      if (res.ok) {
        setShowDeleteModal(false);
        fetchUsers();
      } else {
        alert(result.message || "Failed to delete user");
      }
    } catch (error) {
      alert("Something went wrong while deleting user.");
    }
  };

  const toggleExpanded = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleRevealed = (id) => setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));

  const copyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch { /* clipboard unavailable */ }
  };

  // ── Filter options built from the data ──
  const tagOptions = useMemo(
    () => Array.from(new Set(users.map(u => u.tag).filter(Boolean))).sort(),
    [users]
  );

  const counts = useMemo(() => ({
    all: users.length,
    client: users.filter(u => roleOf(u) === 'client').length,
    staff: users.filter(u => roleOf(u) === 'staff').length,
    admin: users.filter(u => roleOf(u) === 'admin').length,
    unverified: users.filter(u => !u.isverified).length,
  }), [users]);

  // ── Search + filters + sort ──
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users
      .filter((u) => {
        if (roleFilter !== 'all' && roleOf(u) !== roleFilter) return false;
        if (tagFilter !== 'all' && (tagFilter === 'none' ? !!u.tag : u.tag !== tagFilter)) return false;
        if (verifyFilter === 'verified' && !u.isverified) return false;
        if (verifyFilter === 'unverified' && u.isverified) return false;
        if (!term) return true;
        return [u.name, u.email, u.phoneNo, u.firmName, u.cid, u.gstno, u._id]
          .some((v) => (v || '').toString().toLowerCase().includes(term));
      })
      .sort((a, b) => {
        switch (sortKey) {
          case 'name-desc':  return (b.name || '').localeCompare(a.name || '');
          case 'login-desc': return new Date(b.lastlogin || 0) - new Date(a.lastlogin || 0);
          case 'login-asc':  return new Date(a.lastlogin || 0) - new Date(b.lastlogin || 0);
          default:           return (a.name || '').localeCompare(b.name || '');
        }
      });
  }, [users, searchTerm, roleFilter, tagFilter, verifyFilter, sortKey]);

  const hasActiveFilters = searchTerm !== '' || roleFilter !== 'all' || tagFilter !== 'all' || verifyFilter !== 'all' || sortKey !== 'name-asc';
  const resetFilters = () => { setSearchTerm(''); setRoleFilter('all'); setTagFilter('all'); setVerifyFilter('all'); setSortKey('name-asc'); };

  const openDelete = (u) => { setSelectedUser(u); setShowDeleteModal(true); };

  // ── Expanded details (shared by the table row and the mobile card) ──
  const renderDetails = (u) => {
    const id = u._id;
    const showSensitive = !!revealed[id];
    const aadhar = u.idproof?.aadhar || {};
    const pan = u.idproof?.pan || {};
    const hidden = <span style={{ letterSpacing: 2, color: 'var(--text-muted)' }}>••••••••••</span>;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>

        <Group icon={FaBuilding} title="Profile & firm">
          <Field label="User ID" mono>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {id}
              <button type="button" onClick={() => copyId(id)} title="Copy ID"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'inline-flex' }}>
                {copiedId === id ? <FaCheckCircle size={12} color="#225b31" /> : <FaRegCopy size={12} color={C.muted} />}
              </button>
            </span>
          </Field>
          <Field label="Firm">{u.firmName}</Field>
          <Field label="GST number" mono>{u.gstno}</Field>
          <Field label="Address" full>{u.address}</Field>
          <Field label="User type (legacy)">{u.usertype}</Field>
          <Field label="Client type (legacy)">{u.clientType}</Field>
        </Group>

        <Group icon={FaUniversity} title="Bank details">
          <Field label="Bank">{u.bankName}</Field>
          <Field label="Account number" mono>{u.accountNo}</Field>
          <Field label="IFSC" mono>{u.ifscCode}</Field>
          <Field label="Account type">{u.accountType ? prettify(u.accountType) : null}</Field>
          <Field label="UPI" mono>{u.upi}</Field>
        </Group>

        <Group icon={FaIdCard} title="ID proofs">
          <Field label="Aadhar number" mono>{aadhar.number}</Field>
          <Field label="Aadhar updated">{aadhar.lastUpdate ? fmtDate(aadhar.lastUpdate) : null}</Field>
          <Field label="Aadhar document"><DocLink href={aadhar.link} /></Field>
          <Field label="PAN number" mono>{pan.number}</Field>
          <Field label="PAN updated">{pan.lastUpdate ? fmtDate(pan.lastUpdate) : null}</Field>
          <Field label="PAN document"><DocLink href={pan.link} /></Field>
          <Field label="ID proof type (legacy)">{u.idProofType}</Field>
        </Group>

        <Group icon={FaLock} title="Security (sensitive)" tone="danger">
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Password hash and tokens are hidden. Reveal only when you need them.
            </span>
            <button type="button" onClick={() => toggleRevealed(id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 7, cursor: 'pointer',
                border: '1px solid #f5b8b2', background: '#fde8e6', color: C.destructive, fontSize: 12, fontWeight: 600,
              }}>
              {showSensitive ? <><FaEyeSlash size={11} /> Hide</> : <><FaEye size={11} /> Reveal</>}
            </button>
          </div>
          <Field label="Password (hash)" mono full>{showSensitive ? u.password : hidden}</Field>
          <Field label="Reset token" mono full>{showSensitive ? u.resetPasswordToken : (u.resetPasswordToken ? hidden : null)}</Field>
          <Field label="Reset token expiry">{fmtDateTime(u.resetPasswordExpiresAt)}</Field>
          <Field label="Verification token" mono full>{showSensitive ? u.VerificationToken : (u.VerificationToken ? hidden : null)}</Field>
          <Field label="Verification token expiry">{fmtDateTime(u.VerificationTokenExpiresAt)}</Field>
        </Group>
      </div>
    );
  };

  const renderAvatar = (u, size) => (
    <img
      src={u.profile || dummyUser} alt="profile"
      onError={(e) => { e.currentTarget.src = dummyUser; }}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }}
    />
  );

  return (
    <>
      <AdminHeader />
      <SafeKeyGuard>
        <DeleteUserModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          user={selectedUser}
        />

        <div style={{
          padding: '0 2px', fontFamily: 'system-ui, -apple-system, sans-serif',
          color: 'var(--foreground)', background: 'var(--background)', minHeight: '100vh',
        }}>

          {/* ── Page card ── */}
          <div style={{
            background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)',
            boxShadow: '0 2px 10px var(--shadow-color)', overflow: 'hidden', marginBottom: 16,
          }}>

            {/* ── Title bar ── */}
            <div style={{ borderBottom: '1px solid var(--border)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fde8e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FaExclamationTriangle size={15} color={C.destructive} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>User Records · Danger Zone</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                    Every field of every user. Open a row for full details; deleting a user is permanent.
                  </div>
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--muted)', padding: '4px 12px', borderRadius: 20 }}>
                {users.length} total
              </span>
            </div>

            <div style={{ padding: '16px 20px' }}>

              {/* ── Summary chips ── */}
              {!loading && users.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                  {[
                    { key: 'all', label: 'All', value: counts.all, bg: 'var(--secondary)', color: C.primary, Icon: FaUsers },
                    { key: 'client', label: 'Clients', value: counts.client, bg: 'var(--success)', color: 'var(--success-foreground)', Icon: FaUser },
                    { key: 'staff', label: 'Staff', value: counts.staff, bg: '#dbeafe', color: C.info, Icon: FaUserTie },
                    { key: 'admin', label: 'Admins', value: counts.admin, bg: '#f3e6df', color: '#6b3e2b', Icon: FaUserShield },
                  ].map(({ key, label, value, bg, color, Icon }) => {
                    const active = roleFilter === key;
                    return (
                      <button key={key} type="button" onClick={() => setRoleFilter(key)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
                          background: bg, color, fontSize: 12.5, fontWeight: 700,
                          border: `1px solid ${active ? color : 'var(--border)'}`, boxShadow: active ? `0 0 0 2px ${color}33` : 'none',
                        }}>
                        <Icon size={11} color={color} /> {label}
                        <span style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 20, padding: '1px 8px', fontSize: 11 }}>{value}</span>
                      </button>
                    );
                  })}
                  <button type="button" onClick={() => setVerifyFilter(verifyFilter === 'unverified' ? 'all' : 'unverified')}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
                      background: 'var(--warning)', color: 'var(--warning-foreground)', fontSize: 12.5, fontWeight: 700,
                      border: `1px solid ${verifyFilter === 'unverified' ? 'var(--warning-foreground)' : 'var(--border)'}`,
                    }}>
                    <FaHourglassHalf size={11} /> Not verified
                    <span style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 20, padding: '1px 8px', fontSize: 11 }}>{counts.unverified}</span>
                  </button>
                </div>
              )}

              {/* ── Search / filter bar ── */}
              {!loading && users.length > 0 && (
                <div className="au-toolbar">
                  <div className="au-search">
                    <FiSearch size={15} color={C.muted} className="au-icon-left" />
                    <input
                      type="text"
                      placeholder="Search name, email, phone, firm, CID, GST or user ID…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="au-ctl"
                      style={{ paddingLeft: 36, paddingRight: searchTerm ? 34 : 12 }}
                    />
                    {searchTerm && (
                      <button type="button" aria-label="Clear search" className="au-clear" onClick={() => setSearchTerm('')}>
                        <FiX size={14} color={C.muted} />
                      </button>
                    )}
                  </div>

                  <div className="au-select">
                    <FiFilter size={14} color={C.muted} className="au-icon-left" />
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="au-ctl" aria-label="Filter by role">
                      <option value="all">All roles</option>
                      <option value="client">Clients</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admins</option>
                    </select>
                    <FiChevronDown size={14} color={C.muted} className="au-icon-right" />
                  </div>

                  <div className="au-select">
                    <FiTag size={14} color={C.muted} className="au-icon-left" />
                    <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="au-ctl" aria-label="Filter by tag">
                      <option value="all">All tags</option>
                      {tagOptions.map(t => <option key={t} value={t}>{prettify(t)}</option>)}
                      <option value="none">No tag</option>
                    </select>
                    <FiChevronDown size={14} color={C.muted} className="au-icon-right" />
                  </div>

                  <div className="au-select">
                    <FiShield size={14} color={C.muted} className="au-icon-left" />
                    <select value={verifyFilter} onChange={(e) => setVerifyFilter(e.target.value)} className="au-ctl" aria-label="Filter by verification">
                      <option value="all">Any verification</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Not verified</option>
                    </select>
                    <FiChevronDown size={14} color={C.muted} className="au-icon-right" />
                  </div>

                  <div className="au-select">
                    {sortKey === 'name-desc' || sortKey === 'login-asc'
                      ? <FiArrowUp size={14} color={C.muted} className="au-icon-left" />
                      : <FiArrowDown size={14} color={C.muted} className="au-icon-left" />}
                    <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="au-ctl" aria-label="Sort users">
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                      <option value="login-desc">Last login: Recent</option>
                      <option value="login-asc">Last login: Oldest</option>
                    </select>
                    <FiChevronDown size={14} color={C.muted} className="au-icon-right" />
                  </div>

                  {hasActiveFilters && (
                    <button type="button" className="au-reset" onClick={resetFilters}>
                      <FiRotateCcw size={13} /> Reset
                    </button>
                  )}

                  <div className="au-count">
                    Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
                  </div>
                </div>
              )}

              {/* ── Loading ── */}
              {loading && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <span style={{
                    display: 'inline-block', width: 32, height: 32, border: '3px solid var(--border)',
                    borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite',
                  }} />
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>Loading users…</div>
                </div>
              )}

              {/* ── Empty ── */}
              {!loading && filteredUsers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--muted)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <FaUsers size={32} color={C.muted} style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>No users found</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {hasActiveFilters ? 'Try adjusting your search or filters.' : 'No users have been added yet.'}
                  </div>
                </div>
              )}

              {/* ── Desktop table ── */}
              {!loading && filteredUsers.length > 0 && (
                <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: 960, borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                        {['#', 'User', 'Role / Tag', 'Phone', 'CID', 'Firm', 'Status', 'Last login', 'Actions'].map((h, i) => (
                          <th key={h} style={{ ...thStyle, textAlign: i === 8 ? 'right' : 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, index) => {
                        const open = !!expanded[u._id];
                        return (
                          <React.Fragment key={u._id || index}>
                            <tr
                              onClick={() => toggleExpanded(u._id)}
                              style={{
                                borderBottom: open ? 'none' : '1px solid var(--border)', cursor: 'pointer',
                                background: open ? 'var(--muted)' : 'transparent', transition: 'background .15s',
                              }}
                              onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = 'var(--muted)'; }}
                              onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = 'transparent'; }}
                            >
                              <td style={{ padding: '11px 14px' }}>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28,
                                  borderRadius: '50%', background: 'var(--secondary)', color: 'var(--secondary-foreground)', fontWeight: 700, fontSize: 11.5,
                                }}>{index + 1}</span>
                              </td>
                              <td style={{ padding: '11px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  {renderAvatar(u, 36)}
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-strong)', lineHeight: 1.25 }}>{u.name || '—'}</div>
                                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, maxWidth: 230, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.email}>
                                      {u.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '11px 14px' }}>
                                <RoleBadge role={roleOf(u)} />
                                {u.tag && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{prettify(u.tag)}</div>}
                              </td>
                              <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{u.phoneNo || '—'}</td>
                              <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--text-strong)' }}>
                                {u.cid && u.cid !== 'N/A' ? u.cid : <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>—</span>}
                              </td>
                              <td style={{ padding: '11px 14px', maxWidth: 170 }}>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.firmName}>
                                  {u.firmName || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                </div>
                              </td>
                              <td style={{ padding: '11px 14px' }}><VerifiedBadge verified={u.isverified} /></td>
                              <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(u.lastlogin)}</td>
                              <td style={{ padding: '11px 14px' }} onClick={(e) => e.stopPropagation()}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                  <button type="button" style={iconBtn} title={open ? 'Hide details' : 'Show details'} aria-label="Toggle details"
                                    onClick={() => toggleExpanded(u._id)}>
                                    {open ? <FaChevronUp size={12} color={C.primary} /> : <FaChevronDown size={12} color={C.primary} />}
                                  </button>
                                  <button type="button" style={{ ...iconBtn, borderColor: '#f5b8b2', background: '#fde8e6' }} title="Delete user" aria-label="Delete user"
                                    onClick={() => openDelete(u)}>
                                    <FaTrash size={12} color={C.destructive} />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {open && (
                              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                                <td colSpan={9} style={{ padding: '4px 14px 16px' }}>
                                  {renderDetails(u)}
                                </td>
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
              {!loading && filteredUsers.length > 0 && (
                <div className="d-md-none">
                  {filteredUsers.map((u, index) => {
                    const open = !!expanded[u._id];
                    return (
                      <div key={u._id || index} style={{
                        background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
                        padding: '14px 16px', marginBottom: 12, boxShadow: '0 2px 8px var(--shadow-color)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            {renderAvatar(u, 42)}
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.2, wordBreak: 'break-word' }}>{u.name || '—'}</div>
                              <div style={{ marginTop: 4, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                <RoleBadge role={roleOf(u)} />
                                {u.tag && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{prettify(u.tag)}</span>}
                              </div>
                            </div>
                          </div>
                          <VerifiedBadge verified={u.isverified} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: 12 }}>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <div style={{ ...labelStyle, marginBottom: 2 }}>Email</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', wordBreak: 'break-word' }}>{u.email || '—'}</div>
                          </div>
                          <div><div style={{ ...labelStyle, marginBottom: 2 }}>Phone</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{u.phoneNo || '—'}</div></div>
                          <div><div style={{ ...labelStyle, marginBottom: 2 }}>CID</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{u.cid && u.cid !== 'N/A' ? u.cid : '—'}</div></div>
                          <div><div style={{ ...labelStyle, marginBottom: 2 }}>Firm</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{u.firmName || '—'}</div></div>
                          <div><div style={{ ...labelStyle, marginBottom: 2 }}>Last login</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{fmtDate(u.lastlogin)}</div></div>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="button" onClick={() => toggleExpanded(u._id)}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 9, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            {open ? <>Hide details <FaChevronUp size={11} /></> : <>More details <FaChevronDown size={11} /></>}
                          </button>
                          <button type="button" onClick={() => openDelete(u)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: '1px solid #f5b8b2', background: '#fde8e6', color: C.destructive, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            <FaTrash size={11} /> Delete
                          </button>
                        </div>

                        {open && <div style={{ marginTop: 14 }}>{renderDetails(u)}</div>}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </div>
      </SafeKeyGuard>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: var(--input); color: var(--foreground); }
        .au-toolbar {
          display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
          padding: 10px 0 14px; margin-bottom: 6px; border-bottom: 1px solid var(--border);
        }
        .au-search { position: relative; flex: 1 1 280px; min-width: 200px; }
        .au-select { position: relative; flex: 0 1 180px; min-width: 155px; }
        .au-ctl {
          width: 100%; height: 38px; box-sizing: border-box;
          border: 1px solid var(--border); border-radius: 10px;
          background: var(--input); color: var(--foreground);
          font-size: 13px; outline: none; transition: border-color .15s, box-shadow .15s;
        }
        .au-select .au-ctl { appearance: none; -webkit-appearance: none; cursor: pointer; padding: 0 32px 0 34px; }
        .au-ctl:hover { border-color: var(--muted-foreground, #8b7b74); }
        .au-ctl:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(107, 62, 43, 0.14); }
        .au-icon-left, .au-icon-right { position: absolute; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .au-icon-left { left: 12px; }
        .au-icon-right { right: 11px; }
        .au-clear {
          position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
          width: 24px; height: 24px; border: none; border-radius: 50%; background: transparent;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .au-clear:hover { background: var(--muted); }
        .au-reset {
          display: inline-flex; align-items: center; gap: 6px;
          height: 38px; padding: 0 12px; border-radius: 10px;
          border: 1px dashed var(--border); background: transparent;
          color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap;
          transition: background .15s, color .15s;
        }
        .au-reset:hover { background: var(--secondary); color: var(--secondary-foreground); }
        .au-count { margin-left: auto; font-size: 12px; color: var(--text-muted); white-space: nowrap; }
        .au-count strong { color: var(--text-strong); }
        @media (max-width: 640px) {
          .au-search, .au-select { flex: 1 1 100%; }
          .au-count { margin-left: 0; width: 100%; }
        }
      `}</style>
    </>
  );
}
