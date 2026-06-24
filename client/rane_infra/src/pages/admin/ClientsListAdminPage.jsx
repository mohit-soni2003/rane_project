import React, { useState, useEffect } from 'react';
import AdminHeader from '../../component/header/AdminHeader';
import StaffHeader from '../../component/header/StaffHeader';
import { getAllClients } from '../../services/userServices';
import dummyUser from "../../assets/images/dummyUser.jpeg";
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { FaUsers } from "react-icons/fa";
import { FiSearch, FiX, FiArrowRight, FiSend } from "react-icons/fi";

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const controlStyle = {
  border: '1px solid var(--border)', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, color: 'var(--foreground)',
  background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
};

export default function ClientsListAdminPage() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      try {
        const data = await getAllClients();
        setClients(data || []);
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

  // Search by Name, Email, CID, or Phone Number
  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase();
    return (
      (client.name || '').toLowerCase().includes(term) ||
      (client.email || '').toLowerCase().includes(term) ||
      (client.cid || '').toLowerCase().includes(term) ||
      (client.phoneNo || '').toString().toLowerCase().includes(term)
    );
  });

  const goDetail = (client) => navigate(`/${user.role}/client-detail/${client._id}`);
  const goPush = (client) => navigate(`/${user.role}/push-document/${encodeURIComponent(client.cid)}`);

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
                <FaUsers size={16} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                  All Clients
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  Browse, view, and push documents to clients
                </div>
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
              background: 'var(--muted)', padding: '4px 12px', borderRadius: 20,
            }}>
              {clients.length} total
            </span>
          </div>

          <div style={{ padding: '16px 20px' }}>

            {/* ── Search ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 420, minWidth: 220 }}>
                <FiSearch size={14} color="var(--muted-foreground)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search by name, email, CID, phone…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ ...controlStyle, width: '100%', paddingLeft: 33, paddingRight: searchTerm ? 32 : 12 }}
                />
                {searchTerm && (
                  <FiX size={14} color="var(--muted-foreground)" onClick={() => setSearchTerm('')}
                    style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} />
                )}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Showing <strong style={{ color: 'var(--text-strong)' }}>{filteredClients.length}</strong> of{' '}
                <strong style={{ color: 'var(--text-strong)' }}>{clients.length}</strong> clients
              </span>
            </div>

            {/* ── Loading ── */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <span style={{
                  display: 'inline-block', width: 32, height: 32,
                  border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
                  borderRadius: '50%', animation: 'spin 1s linear infinite',
                }} />
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>Loading clients…</div>
              </div>
            )}

            {/* ── Empty ── */}
            {!loading && filteredClients.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '48px 20px',
                background: 'var(--muted)', borderRadius: 12, border: '1px solid var(--border)',
              }}>
                <FaUsers size={32} color="var(--muted-foreground)" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>No clients found</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {searchTerm ? 'Try a different search term.' : 'No clients have been added yet.'}
                </div>
              </div>
            )}

            {/* ── Desktop table ── */}
            {!loading && filteredClients.length > 0 && (
              <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                      {['S.No', 'Name', 'Email', 'Phone No', 'CID Code', 'Quick Actions'].map(h => (
                        <th key={h} style={{
                          padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                          color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client, index) => (
                      <tr key={client._id || index} style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* S.No */}
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                            fontWeight: 700, fontSize: 12,
                          }}>{index + 1}</span>
                        </td>

                        {/* Name + avatar + role */}
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={client.profile || dummyUser} alt="profile"
                              style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{client.name}</span>
                              <small style={{ color: 'var(--text-muted)' }}>{client.role}</small>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: '11px 14px', color: 'var(--text-muted)' }}>{client.email}</td>

                        {/* Phone */}
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                          {client.phoneNo || '-'}
                        </td>

                        {/* CID */}
                        <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--text-strong)', whiteSpace: 'nowrap' }}>
                          {client.cid || `CID-${index + 1}`}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => goDetail(client)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)',
                                background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                              }}>
                              More <FiArrowRight size={12} />
                            </button>
                            <button onClick={() => goPush(client)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '6px 12px', borderRadius: 7, border: 'none',
                                background: 'var(--accent)', color: 'var(--accent-foreground)',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                              }}>
                              <FiSend size={12} color="var(--accent-foreground)" /> Push Doc
                            </button>
                          </div>
                        </td>
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
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <img src={client.profile || dummyUser} alt="profile"
                        style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-strong)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {client.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                          {client.role} • #{index + 1}
                        </div>
                      </div>
                    </div>

                    {/* Data grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: 12 }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ ...labelStyle, marginBottom: 2 }}>Email</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', wordBreak: 'break-word' }}>{client.email || '-'}</div>
                      </div>
                      <div>
                        <div style={{ ...labelStyle, marginBottom: 2 }}>Phone No</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{client.phoneNo || '-'}</div>
                      </div>
                      <div>
                        <div style={{ ...labelStyle, marginBottom: 2 }}>CID Code</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>{client.cid || `CID-${index + 1}`}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => goDetail(client)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)',
                          background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                          fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}>
                        More <FiArrowRight size={13} />
                      </button>
                      <button onClick={() => goPush(client)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          flex: 1, padding: '9px', borderRadius: 8, border: 'none',
                          background: 'var(--accent)', color: 'var(--accent-foreground)',
                          fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}>
                        <FiSend size={13} color="var(--accent-foreground)" /> Push Doc
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Footer ── */}
            {!loading && (
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                Showing {filteredClients.length} of {clients.length} entries
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}