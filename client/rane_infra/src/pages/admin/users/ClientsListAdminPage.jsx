import React, { useState, useEffect, useMemo } from 'react';
import AdminHeader from '../../../components/layout/header/AdminHeader';
import StaffHeader from '../../../components/layout/header/StaffHeader';
import { getAllClients } from '../../../services/userServices';
import dummyUser from "../../../assets/images/dummyUser.jpeg";
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { FaUsers, FaUserShield, FaUserTie, FaUser, FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
import {
  FiSearch, FiX, FiArrowRight, FiSend, FiFilter, FiChevronDown, FiArrowDown, FiArrowUp,
  FiRotateCcw, FiShield, FiMail, FiPhone,
} from "react-icons/fi";

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = { primary: '#6b3e2b', accent: '#b95a52', muted: '#8b7b74' };

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const thStyle = {
  padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
};
const secondaryBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
  padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)',
  background: 'var(--secondary)', color: 'var(--secondary-foreground)',
  fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
};
const accentBtn = {
  ...secondaryBtn, border: 'none', background: 'var(--accent)', color: 'var(--accent-foreground)',
};

// Role badge colours follow the header accents (admin brown, staff blue, client green)
const roleMeta = (role) => {
  switch ((role || 'client').toLowerCase()) {
    case 'admin': return { label: 'Admin', bg: '#f3e6df', color: '#6b3e2b', Icon: FaUserShield };
    case 'staff': return { label: 'Staff', bg: '#dbeafe', color: '#1e40af', Icon: FaUserTie };
    default:      return { label: 'Client', bg: 'var(--success)', color: 'var(--success-foreground)', Icon: FaUser };
  }
};

const RoleBadge = ({ role }) => {
  const { label, bg, color, Icon } = roleMeta(role);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, background: bg, color,
    }}>
      <Icon size={10} color={color} /> {label}
    </span>
  );
};

export default function ClientsListAdminPage() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');       // all | admin | staff | client
  const [verifyFilter, setVerifyFilter] = useState('all');   // all | verified | unverified
  const [sortKey, setSortKey] = useState('name-asc');        // name-asc | name-desc | login-desc
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      try {
        const data = await getAllClients();
        // the server answers with an error object (not a list) when there are no users
        setClients(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
      setLoading(false);
    }
    fetchClients();
  }, []);

  const getHeaderComponent = () => {
    switch (user?.role) {
      case 'admin': return <AdminHeader />;
      case 'staff': return <StaffHeader />;
      default: return <AdminHeader />;
    }
  };

  const roleOf = (u) => (u.role || 'client').toLowerCase();

  // ── Counts per role ──
  const counts = useMemo(() => ({
    all: clients.length,
    client: clients.filter(c => roleOf(c) === 'client').length,
    staff: clients.filter(c => roleOf(c) === 'staff').length,
    admin: clients.filter(c => roleOf(c) === 'admin').length,
  }), [clients]);

  // ── Search (name, email, CID, phone) + role + verification, then sort ──
  const filteredClients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return clients
      .filter((c) => {
        if (roleFilter !== 'all' && roleOf(c) !== roleFilter) return false;
        if (verifyFilter === 'verified' && !c.isverified) return false;
        if (verifyFilter === 'unverified' && c.isverified) return false;
        if (!term) return true;
        return (
          (c.name || '').toLowerCase().includes(term) ||
          (c.email || '').toLowerCase().includes(term) ||
          (c.cid || '').toLowerCase().includes(term) ||
          (c.phoneNo || '').toString().toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        if (sortKey === 'name-desc') return (b.name || '').localeCompare(a.name || '');
        if (sortKey === 'login-desc') return new Date(b.lastlogin || 0) - new Date(a.lastlogin || 0);
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [clients, searchTerm, roleFilter, verifyFilter, sortKey]);

  const hasActiveFilters = searchTerm !== '' || roleFilter !== 'all' || verifyFilter !== 'all' || sortKey !== 'name-asc';
  const resetFilters = () => { setSearchTerm(''); setRoleFilter('all'); setVerifyFilter('all'); setSortKey('name-asc'); };

  const goDetail = (client) => navigate(`/${user.role}/client-detail/${client._id}`);
  const goPush = (client) => navigate(`/${user.role}/push-document/${encodeURIComponent(client.cid)}`);

  // ── Reusable renderers ──
  const renderAvatar = (client, size) => (
    <img
      src={client.profile || dummyUser} alt="profile"
      onError={(e) => { e.currentTarget.src = dummyUser; }}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }}
    />
  );

  const renderVerified = (client) => (
    client.isverified ? (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: 'var(--success-foreground)', background: 'var(--success)', padding: '3px 10px', borderRadius: 20 }}>
        <FaCheckCircle size={10} /> Verified
      </span>
    ) : (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: 'var(--warning-foreground)', background: 'var(--warning)', padding: '3px 10px', borderRadius: 20 }}>
        <FaHourglassHalf size={10} /> Not verified
      </span>
    )
  );

  const renderActions = (client, stretch) => (
    <div style={{ display: 'flex', gap: 8, justifyContent: stretch ? 'stretch' : 'flex-end' }}>
      <button onClick={() => goDetail(client)} style={{ ...secondaryBtn, flex: stretch ? 1 : 'none', padding: stretch ? '9px' : secondaryBtn.padding }}>
        More <FiArrowRight size={12} />
      </button>
      <button onClick={() => goPush(client)} style={{ ...accentBtn, flex: stretch ? 1 : 'none', padding: stretch ? '9px' : accentBtn.padding }}>
        <FiSend size={12} color="var(--accent-foreground)" /> Push Doc
      </button>
    </div>
  );

  return (
    <>
      {getHeaderComponent()}

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
          <div style={{ borderBottom: '1px solid var(--border)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FaUsers size={16} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>All Users</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                Browse admins, staff and clients — view details and push documents
              </div>
            </div>
          </div>

          <div style={{ padding: '16px 20px' }}>

            {/* ── Role summary cards (click to filter) ── */}
            {!loading && clients.length > 0 && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16,
              }}>
                {[
                  { key: 'all', label: 'All users', Icon: FaUsers, color: C.primary, bg: 'var(--secondary)' },
                  { key: 'client', label: 'Clients', Icon: FaUser, color: 'var(--success-foreground)', bg: 'var(--success)' },
                  { key: 'staff', label: 'Staff', Icon: FaUserTie, color: '#1e40af', bg: '#dbeafe' },
                  { key: 'admin', label: 'Admins', Icon: FaUserShield, color: '#6b3e2b', bg: '#f3e6df' },
                ].map(({ key, label, Icon, color, bg }) => {
                  const active = roleFilter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRoleFilter(key)}
                      style={{
                        textAlign: 'left', cursor: 'pointer', background: bg, borderRadius: 10, padding: '12px 14px',
                        border: `1px solid ${active ? color : 'var(--border)'}`,
                        boxShadow: active ? `0 0 0 2px ${color}33` : 'none',
                        transition: 'box-shadow .15s, border-color .15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <span style={{ ...labelStyle, color }}>{label}</span>
                        <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.55)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={12} color={color} />
                        </span>
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 700, color, marginTop: 6, lineHeight: 1 }}>{counts[key]}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Search / filter bar ── */}
            {!loading && clients.length > 0 && (
              <div className="ca-toolbar">
                <div className="ca-search">
                  <FiSearch size={15} color={C.muted} className="ca-icon-left" />
                  <input
                    type="text"
                    placeholder="Search by name, email, CID or phone…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ca-ctl"
                    style={{ paddingLeft: 36, paddingRight: searchTerm ? 34 : 12 }}
                  />
                  {searchTerm && (
                    <button type="button" aria-label="Clear search" className="ca-clear" onClick={() => setSearchTerm('')}>
                      <FiX size={14} color={C.muted} />
                    </button>
                  )}
                </div>

                <div className="ca-select">
                  <FiFilter size={14} color={C.muted} className="ca-icon-left" />
                  <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="ca-ctl" aria-label="Filter by role">
                    <option value="all">All roles</option>
                    <option value="client">Clients</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admins</option>
                  </select>
                  <FiChevronDown size={14} color={C.muted} className="ca-icon-right" />
                </div>

                <div className="ca-select">
                  <FiShield size={14} color={C.muted} className="ca-icon-left" />
                  <select value={verifyFilter} onChange={(e) => setVerifyFilter(e.target.value)} className="ca-ctl" aria-label="Filter by verification">
                    <option value="all">Any verification</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Not verified</option>
                  </select>
                  <FiChevronDown size={14} color={C.muted} className="ca-icon-right" />
                </div>

                <div className="ca-select">
                  {sortKey === 'name-desc'
                    ? <FiArrowUp size={14} color={C.muted} className="ca-icon-left" />
                    : <FiArrowDown size={14} color={C.muted} className="ca-icon-left" />}
                  <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="ca-ctl" aria-label="Sort users">
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="login-desc">Last login: Recent</option>
                  </select>
                  <FiChevronDown size={14} color={C.muted} className="ca-icon-right" />
                </div>

                {hasActiveFilters && (
                  <button type="button" className="ca-reset" onClick={resetFilters}>
                    <FiRotateCcw size={13} /> Reset
                  </button>
                )}

                <div className="ca-count">
                  Showing <strong>{filteredClients.length}</strong> of <strong>{clients.length}</strong> users
                </div>
              </div>
            )}

            {/* ── Loading ── */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <span style={{
                  display: 'inline-block', width: 32, height: 32,
                  border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
                  borderRadius: '50%', animation: 'spin 1s linear infinite',
                }} />
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>Loading users…</div>
              </div>
            )}

            {/* ── Empty ── */}
            {!loading && filteredClients.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '48px 20px',
                background: 'var(--muted)', borderRadius: 12, border: '1px solid var(--border)',
              }}>
                <FaUsers size={32} color="var(--muted-foreground)" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>No users found</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {hasActiveFilters ? 'Try adjusting your search or filters.' : 'No users have been added yet.'}
                </div>
              </div>
            )}

            {/* ── Desktop table ── */}
            {!loading && filteredClients.length > 0 && (
              <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 880, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                      {['#', 'User', 'Contact', 'CID', 'Status', 'Actions'].map((h, i) => (
                        <th key={h} style={{ ...thStyle, textAlign: i === 5 ? 'right' : 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client, index) => (
                      <tr key={client._id || index} style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                            fontWeight: 700, fontSize: 11.5,
                          }}>{index + 1}</span>
                        </td>

                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {renderAvatar(client, 38)}
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-strong)', lineHeight: 1.25 }}>{client.name || '—'}</div>
                              <div style={{ marginTop: 4 }}><RoleBadge role={client.role} /></div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '11px 14px', fontSize: 12.5, color: 'var(--text-muted)', maxWidth: 240 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={client.email}>
                            <FiMail size={11} color={C.accent} style={{ flexShrink: 0 }} /> {client.email || '—'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                            <FiPhone size={11} color={C.accent} style={{ flexShrink: 0 }} /> {client.phoneNo || '—'}
                          </div>
                        </td>

                        <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--text-strong)', whiteSpace: 'nowrap' }}>
                          {client.cid && client.cid !== 'N/A' ? client.cid : <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Not assigned</span>}
                        </td>

                        <td style={{ padding: '11px 14px' }}>{renderVerified(client)}</td>

                        <td style={{ padding: '11px 14px' }}>{renderActions(client)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Mobile cards ── */}
            {!loading && filteredClients.length > 0 && (
              <div className="d-md-none">
                {filteredClients.map((client, index) => (
                  <div key={client._id || index} style={{
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '14px 16px', marginBottom: 12,
                    boxShadow: '0 2px 8px var(--shadow-color)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        {renderAvatar(client, 44)}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.2, wordBreak: 'break-word' }}>
                            {client.name || '—'}
                          </div>
                          <div style={{ marginTop: 4 }}><RoleBadge role={client.role} /></div>
                        </div>
                      </div>
                      {renderVerified(client)}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: 12 }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ ...labelStyle, marginBottom: 2 }}>Email</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', wordBreak: 'break-word' }}>{client.email || '—'}</div>
                      </div>
                      <div>
                        <div style={{ ...labelStyle, marginBottom: 2 }}>Phone</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{client.phoneNo || '—'}</div>
                      </div>
                      <div>
                        <div style={{ ...labelStyle, marginBottom: 2 }}>CID</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>
                          {client.cid && client.cid !== 'N/A' ? client.cid : 'Not assigned'}
                        </div>
                      </div>
                    </div>

                    {renderActions(client, true)}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: var(--input); color: var(--foreground); }
        .ca-toolbar {
          display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
          padding: 10px 0 14px; margin-bottom: 6px; border-bottom: 1px solid var(--border);
        }
        .ca-search { position: relative; flex: 1 1 260px; min-width: 200px; }
        .ca-select { position: relative; flex: 0 1 190px; min-width: 165px; }
        .ca-ctl {
          width: 100%; height: 38px; box-sizing: border-box;
          border: 1px solid var(--border); border-radius: 10px;
          background: var(--input); color: var(--foreground);
          font-size: 13px; outline: none; transition: border-color .15s, box-shadow .15s;
        }
        .ca-select .ca-ctl { appearance: none; -webkit-appearance: none; cursor: pointer; padding: 0 32px 0 34px; }
        .ca-ctl:hover { border-color: var(--muted-foreground, #8b7b74); }
        .ca-ctl:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(107, 62, 43, 0.14); }
        .ca-icon-left, .ca-icon-right { position: absolute; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .ca-icon-left { left: 12px; }
        .ca-icon-right { right: 11px; }
        .ca-clear {
          position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
          width: 24px; height: 24px; border: none; border-radius: 50%; background: transparent;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .ca-clear:hover { background: var(--muted); }
        .ca-reset {
          display: inline-flex; align-items: center; gap: 6px;
          height: 38px; padding: 0 12px; border-radius: 10px;
          border: 1px dashed var(--border); background: transparent;
          color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap;
          transition: background .15s, color .15s;
        }
        .ca-reset:hover { background: var(--secondary); color: var(--secondary-foreground); }
        .ca-count { margin-left: auto; font-size: 12px; color: var(--text-muted); white-space: nowrap; }
        .ca-count strong { color: var(--text-strong); }
        @media (max-width: 640px) {
          .ca-search, .ca-select { flex: 1 1 100%; }
          .ca-count { margin-left: 0; width: 100%; }
        }
      `}</style>
    </>
  );
}
