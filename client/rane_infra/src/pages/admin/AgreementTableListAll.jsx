import React, { useEffect, useState } from 'react';
import {
  FaFileContract, FaFileSignature, FaUser, FaClock,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaHourglassHalf,
} from 'react-icons/fa';
import { FiSearch, FiX, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../component/header/AdminHeader';
import StaffHeader from '../../component/header/StaffHeader';
import { getAllAgreements } from '../../services/agreement';
import { useAuthStore } from '../../store/authStore';

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = {
  primary: '#6b3e2b',
  accent: '#b95a52',
  success: '#225b31',
  destructive: '#c94a3a',
  muted: '#8b7b74',
  warning: '#4a1f18',
  info: '#1e40af',
};

// ── Status badge meta ─────────────────────────────────────────────────────────
const statusMeta = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'signed':
      return { bg: 'var(--success)', color: 'var(--success-foreground)', icon: FaCheckCircle, label: 'Signed' };
    case 'rejected':
      return { bg: '#fde8e6', color: C.destructive, icon: FaTimesCircle, label: 'Rejected' };
    case 'viewed':
      return { bg: '#dbeafe', color: '#1e40af', icon: FaCheckCircle, label: 'Viewed' };
    case 'expired':
      return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)', icon: FaHourglassHalf, label: 'Expired' };
    case 'pending':
    default:
      return { bg: 'var(--warning)', color: 'var(--warning-foreground)', icon: FaExclamationTriangle, label: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending' };
  }
};

const StatusBadge = ({ status }) => {
  const { bg, color, icon: Icon, label } = statusMeta(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, background: bg, color, letterSpacing: '0.03em',
    }}>
      <Icon size={10} color={color} /> {label}
    </span>
  );
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const controlStyle = {
  border: '1px solid var(--border)', borderRadius: 8,
  padding: '8px 12px', fontSize: 13, color: 'var(--foreground)',
  background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
};

export default function AgreementTableListAll() {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mineOnly, setMineOnly] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuthStore();

  const getHeaderComponent = () => {
    switch (user?.role) {
      case 'admin': return <AdminHeader />;
      case 'staff': return <StaffHeader />;
      default: return <AdminHeader />;
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, [mineOnly]);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const res = await getAllAgreements(mineOnly);
      setAgreements(res?.agreements || []);
    } catch (err) {
      console.error('Failed to load agreements', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredAgreements = agreements.filter((a) => {
    const term = searchTerm.toLowerCase();
    const searchMatch =
      a.agreementId?.toLowerCase().includes(term) ||
      a.title?.toLowerCase().includes(term) ||
      a.client?.name?.toLowerCase().includes(term);
    const statusMatch = statusFilter === 'all' || a.status === statusFilter;
    return searchMatch && statusMatch;
  });

  // ── Stat counts ─────────────────────────────────────────────────────────────
  const signedCount    = agreements.filter(a => a.status === 'signed').length;
  const pendingCount   = agreements.filter(a => ['pending', 'viewed'].includes(a.status)).length;
  const extensionCount = agreements.filter(a => a.extensionRequest?.requested).length;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const resetFilters = () => { setSearchTerm(''); setStatusFilter('all'); };

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
          <div style={{
            borderBottom: '1px solid var(--border)', padding: '14px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FaFileSignature size={16} color={C.primary} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                  All Agreements
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  Track agreements pushed to and signed by clients
                </div>
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
              background: 'var(--muted)', padding: '4px 12px', borderRadius: 20,
            }}>
              {agreements.length} total
            </span>
          </div>

          <div style={{ padding: '16px 20px' }}>

            {/* ── Stat cards ── */}
            {!loading && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 12, marginBottom: 16,
              }}>
                {[
                  { label: 'Total agreements', count: agreements.length, sub: mineOnly ? 'pushed by you' : 'across all staff', color: C.primary, bg: 'var(--secondary)', Icon: FaFileContract },
                  { label: 'Signed', count: signedCount, sub: 'completed by clients', color: C.success, bg: 'var(--success)', Icon: FaCheckCircle },
                  { label: 'Awaiting action', count: pendingCount, sub: 'pending or viewed', color: C.warning, bg: 'var(--warning)', Icon: FaExclamationTriangle },
                  { label: 'Extension requests', count: extensionCount, sub: 'need review', color: C.info, bg: '#dbeafe', Icon: FaClock },
                ].map(({ label, count, sub, color, bg, Icon }) => (
                  <div key={label} style={{
                    background: bg, borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
                      <div style={{ ...labelStyle, color }}>{label}</div>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.55)',
                      }}>
                        <Icon size={13} color={color} />
                      </span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1.1 }}>{count}</div>
                    <div style={{ fontSize: 11, color, opacity: 0.75, marginTop: 3 }}>{sub}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Search / filter bar ── */}
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 16px', marginBottom: 14,
              boxShadow: '0 2px 8px var(--shadow-color)',
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>

                {/* Search */}
                <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
                  <FiSearch size={13} color={C.muted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search by ID, title or client…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ ...controlStyle, width: '100%', paddingLeft: 30, paddingRight: searchTerm ? 30 : 12 }}
                  />
                  {searchTerm && (
                    <FiX size={13} color={C.muted} onClick={() => setSearchTerm('')}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} />
                  )}
                </div>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{ ...controlStyle, flex: '0 1 150px', cursor: 'pointer' }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="viewed">Viewed</option>
                  <option value="signed">Signed</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>

                {/* Scope toggle */}
                <div style={{ display: 'inline-flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <button
                    onClick={() => setMineOnly(false)}
                    style={{
                      padding: '8px 14px', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: !mineOnly ? 'var(--primary)' : 'var(--card)',
                      color: !mineOnly ? 'var(--primary-foreground)' : 'var(--foreground)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setMineOnly(true)}
                    style={{
                      padding: '8px 14px', border: 'none', borderLeft: '1px solid var(--border)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: mineOnly ? 'var(--primary)' : 'var(--card)',
                      color: mineOnly ? 'var(--primary-foreground)' : 'var(--foreground)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Pushed by me
                  </button>
                </div>

                {/* Reset */}
                <button
                  onClick={resetFilters}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
                    background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  <FiX size={12} /> Reset
                </button>
              </div>

              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                Showing <strong style={{ color: 'var(--text-strong)' }}>{filteredAgreements.length}</strong> of{' '}
                <strong style={{ color: 'var(--text-strong)' }}>{agreements.length}</strong> agreements
              </div>
            </div>

            {/* ── Loading ── */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <span style={{
                  display: 'inline-block', width: 32, height: 32, border: '3px solid var(--border)',
                  borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 1s linear infinite',
                }} />
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>Loading agreements…</div>
              </div>
            )}

            {/* ── Empty ── */}
            {!loading && filteredAgreements.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '48px 20px',
                background: 'var(--muted)', borderRadius: 12, border: '1px solid var(--border)',
              }}>
                <FaFileContract size={32} color={C.muted} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>No agreements found</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : mineOnly ? 'You haven\u2019t pushed any agreements yet.' : 'No agreements have been created yet.'}
                </div>
              </div>
            )}

            {/* ── Desktop table ── */}
            {!loading && filteredAgreements.length > 0 && (
              <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 1080, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                      {['#', 'Agreement ID', 'Title', 'Client', 'Status', 'Uploaded By', 'Expiry', 'Extension', 'Action'].map(h => (
                        <th key={h} style={{
                          padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                          color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgreements.map((a, idx) => (
                      <tr key={a._id || idx} style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* # */}
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                            fontWeight: 700, fontSize: 11,
                          }}>{idx + 1}</span>
                        </td>

                        {/* Agreement ID */}
                        <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--text-strong)', whiteSpace: 'nowrap' }}>
                          {a.agreementId || '—'}
                        </td>

                        {/* Title */}
                        <td style={{ padding: '11px 14px', maxWidth: 200 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.title}>
                            {a.title || '—'}
                          </div>
                        </td>

                        {/* Client */}
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {a.client?.profile ? (
                              <img src={a.client.profile} alt={a.client.name}
                                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
                            ) : (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 28, height: 28, borderRadius: '50%',
                                background: 'var(--muted)', color: 'var(--text-muted)', flexShrink: 0,
                              }}>
                                <FaUser size={12} color={C.muted} />
                              </span>
                            )}
                            <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.client?.name}>
                              {a.client?.name || 'N/A'}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '11px 14px' }}>
                          <StatusBadge status={a.status} />
                        </td>

                        {/* Uploaded By */}
                        <td style={{ padding: '11px 14px', color: 'var(--text-muted)' }}>
                          {a.uploadedBy?.name || 'N/A'}
                        </td>

                        {/* Expiry */}
                        <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {fmtDate(a.expiryDate)}
                        </td>

                        {/* Extension */}
                        <td style={{ padding: '11px 14px' }}>
                          {a.extensionRequest?.requested ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                              background: 'var(--warning)', color: 'var(--warning-foreground)', textTransform: 'capitalize',
                            }}>
                              <FaClock size={10} color="var(--warning-foreground)" />
                              {a.extensionRequest.status || 'requested'}
                            </span>
                          ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>

                        {/* Action */}
                        <td style={{ padding: '11px 14px' }}>
                          <button
                            onClick={() => navigate(`/admin/agreement/track/${a._id}`)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)',
                              background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                              fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                          >
                            Track <FiArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Mobile cards ── */}
            {!loading && filteredAgreements.length > 0 && (
              <div className="d-md-none">
                {filteredAgreements.map((a, idx) => (
                  <div key={a._id || idx} style={{
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '14px 16px', marginBottom: 12,
                    boxShadow: '0 2px 8px var(--shadow-color)',
                  }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {a.client?.profile ? (
                          <img src={a.client.profile} alt={a.client.name}
                            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--muted)', color: 'var(--text-muted)', flexShrink: 0,
                          }}>
                            <FaUser size={13} color={C.muted} />
                          </span>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                            {a.client?.name || 'N/A'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                            {a.agreementId || '—'}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>

                    {/* Title */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ ...labelStyle, marginBottom: 2 }}>Title</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', wordBreak: 'break-word' }}>
                        {a.title || '—'}
                      </div>
                    </div>

                    {/* Data grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: 12 }}>
                      {[
                        { label: 'Uploaded by', value: a.uploadedBy?.name || 'N/A' },
                        { label: 'Expiry', value: fmtDate(a.expiryDate) },
                        {
                          label: 'Extension',
                          value: a.extensionRequest?.requested ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--warning-foreground)', textTransform: 'capitalize' }}>
                              <FaClock size={11} color="var(--warning-foreground)" /> {a.extensionRequest.status || 'requested'}
                            </span>
                          ) : '—',
                        },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={{ ...labelStyle, marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', wordBreak: 'break-word' }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => navigate(`/admin/agreement/track/${a._id}`)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        width: '100%', padding: '9px', borderRadius: 8,
                        border: '1px solid var(--primary)', background: 'transparent', color: C.primary,
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <FaFileContract size={12} color={C.primary} /> Track agreement <FiArrowRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Footer ── */}
            {!loading && filteredAgreements.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                Showing 1 to {filteredAgreements.length} of {agreements.length} entries
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: var(--input); color: var(--foreground); }
      `}</style>
    </>
  );
}