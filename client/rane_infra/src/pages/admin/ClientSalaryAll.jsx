import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminHeader from '../../component/header/AdminHeader';
import { getAllClients } from '../../services/userServices';
import { getBaseSalary, uploadBaseSalary, initMonthlySalary } from '../../services/salaryServices';
import dummyUser from '../../assets/images/dummyUser.jpeg';
import { useNavigate } from 'react-router-dom';
import {
  FaMoneyBillWave, FaRupeeSign, FaUser,
  FaUsers, FaCheckCircle,
} from 'react-icons/fa';
import { FiSearch, FiX, FiArrowRight, FiRefreshCw } from 'react-icons/fi';

// ── Shared style tokens ───────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const controlStyle = {
  border: '1px solid var(--border)', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, color: 'var(--foreground)',
  background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
};

export default function ClientSalaryAll() {
  const [clients,    setClients]    = useState([]);
  const [salaries,   setSalaries]   = useState({});
  const [newSalaries, setNewSalaries] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [updating,   setUpdating]   = useState(null);
  const [initializing, setInitializing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const currentMonth = new Date().toISOString().slice(0, 7);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllClients();
        setClients(data || []);
        const salaryMap = {};
        for (const client of (data || [])) {
          try {
            const s = await getBaseSalary(client._id);
            salaryMap[client._id] = s.amount ?? 0;
          } catch {
            salaryMap[client._id] = 0;
          }
        }
        setSalaries(salaryMap);
      } catch (err) {
        toast.error('Failed to load clients.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSalaryChange = (clientId, value) =>
    setNewSalaries(prev => ({ ...prev, [clientId]: value }));

  const handleUpdate = async (clientId) => {
    const amount = Number(newSalaries[clientId]);
    if (isNaN(amount) || amount < 0) {
      toast.warning('Enter a valid amount.');
      return;
    }
    try {
      setUpdating(clientId);
      await uploadBaseSalary(clientId, amount);
      setSalaries(prev => ({ ...prev, [clientId]: amount }));
      setNewSalaries(prev => ({ ...prev, [clientId]: '' }));
      toast.success('Base salary updated.');
    } catch (err) {
      toast.error(err.message || 'Update failed.');
    } finally {
      setUpdating(null);
    }
  };

  const handleInitialize = async (clientId) => {
    setInitializing(clientId);
    try {
      await initMonthlySalary(clientId, currentMonth);
      toast.success('Monthly salary initialized.');
    } catch (err) {
      if (err.message === 'Already initialized') {
        toast.warning('Already initialized for this month.');
      } else {
        toast.error(err.message || 'Initialization failed.');
      }
    } finally {
      setInitializing(null);
    }
  };

  const filteredClients = clients.filter(c => {
    const t = searchTerm.toLowerCase();
    return (
      (c.name  || '').toLowerCase().includes(t) ||
      (c.email || '').toLowerCase().includes(t) ||
      (c.cid   || '').toLowerCase().includes(t)
    );
  });

  // ── Stat derivations ─────────────────────────────────────────────────────
  const totalSalary    = Object.values(salaries).reduce((s, v) => s + (v || 0), 0);
  const withSalary     = clients.filter(c => (salaries[c._id] || 0) > 0).length;
  const withoutSalary  = clients.length - withSalary;

  const fmtINR = (n) => Number(n).toLocaleString('en-IN');

  return (
    <>
      <AdminHeader />
      <ToastContainer position="top-right" autoClose={2500} newestOnTop />

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
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FaMoneyBillWave size={16} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                  Client Base Salaries
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  Manage and update client salary records
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

            {/* ── Stat cards ── */}
            {!loading && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 12, marginBottom: 16,
              }}>
                {[
                  {
                    label: 'Total clients',
                    value: clients.length,
                    sub: `${clients.length === 1 ? 'client' : 'clients'} registered`,
                    icon: <FaUsers size={14} color="var(--primary)" />,
                    bg: 'var(--secondary)', color: 'var(--primary)',
                  },
                  {
                    label: 'Total base salary',
                    value: <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><FaRupeeSign size={14} />{fmtINR(totalSalary)}</span>,
                    sub: 'across all clients',
                    icon: <FaMoneyBillWave size={14} color="var(--success-foreground)" />,
                    bg: 'var(--success)', color: 'var(--success-foreground)',
                  },
                  {
                    label: 'Salary assigned',
                    value: withSalary,
                    sub: `${withoutSalary} still unset`,
                    icon: <FaCheckCircle size={14} color="var(--success-foreground)" />,
                    bg: '#dbeafe', color: '#1e40af',
                  },
                ].map(({ label, value, sub, icon, bg, color }) => (
                  <div key={label} style={{
                    background: bg, borderRadius: 10,
                    padding: '12px 14px', border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
                      <div style={{ ...labelStyle, color }}>{label}</div>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 26, height: 26, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.55)',
                      }}>{icon}</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>

                {/* Search */}
                <div style={{ flex: '1 1 280px', minWidth: 220 }}>
                  <label style={{ ...labelStyle, display: 'block', marginBottom: 5 }}>Search</label>
                  <div style={{ position: 'relative' }}>
                    <FiSearch size={14} color="var(--muted-foreground)"
                      style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text" placeholder="Search by name, email or CID…"
                      value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      style={{ ...controlStyle, width: '100%', height: 38, paddingLeft: 33, paddingRight: searchTerm ? 32 : 12 }}
                    />
                    {searchTerm && (
                      <FiX size={14} color="var(--muted-foreground)"
                        onClick={() => setSearchTerm('')}
                        style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} />
                    )}
                  </div>
                </div>

                {/* Reset */}
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    height: 38, padding: '0 16px', borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--secondary)'}
                >
                  <FiX size={14} /> Reset
                </button>
              </div>

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
                Showing <strong style={{ color: 'var(--text-strong)' }}>{filteredClients.length}</strong> of{' '}
                <strong style={{ color: 'var(--text-strong)' }}>{clients.length}</strong> clients
              </div>
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
                  {searchTerm ? 'Try adjusting your search.' : 'No clients have been added yet.'}
                </div>
              </div>
            )}

            {/* ── Desktop table ── */}
            {!loading && filteredClients.length > 0 && (
              <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 1100, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                      {['S.No', 'Client', 'Email', 'Phone', 'CID', 'Base Salary', 'New Salary', 'Update', 'Initialize', 'Details'].map(h => (
                        <th key={h} style={{
                          padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                          color: 'var(--text-muted)', textTransform: 'uppercase',
                          letterSpacing: '0.04em', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client, index) => (
                      <tr key={client._id || index}
                        style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* S.No */}
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                            fontWeight: 700, fontSize: 11,
                          }}>{index + 1}</span>
                        </td>

                        {/* Client */}
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <img
                              src={client.profile || dummyUser}
                              alt={client.name}
                              style={{
                                width: 32, height: 32, borderRadius: '50%',
                                objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0,
                              }}
                              onError={e => { e.currentTarget.src = dummyUser; }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-strong)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                                {client.name || '—'}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                {client.cid || '—'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: 12, maxWidth: 180 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={client.email}>
                            {client.email || '—'}
                          </div>
                        </td>

                        {/* Phone */}
                        <td style={{ padding: '11px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {client.phoneNo || '—'}
                        </td>

                        {/* CID */}
                        <td style={{ padding: '11px 14px', fontWeight: 600, color: 'var(--text-strong)' }}>
                          {client.cid || `CID-${index + 1}`}
                        </td>

                        {/* Base Salary */}
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            fontWeight: 700, color: 'var(--text-strong)', fontSize: 13,
                          }}>
                            <FaRupeeSign size={11} color="var(--accent)" />
                            {fmtINR(salaries[client._id] || 0)}
                          </span>
                        </td>

                        {/* New Salary Input */}
                        <td style={{ padding: '11px 14px', minWidth: 148 }}>
                          <div style={{ position: 'relative' }}>
                            <span style={{
                              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                              fontSize: 12, color: 'var(--text-muted)', pointerEvents: 'none',
                            }}>₹</span>
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={newSalaries[client._id] || ''}
                              onChange={e => handleSalaryChange(client._id, e.target.value)}
                              style={{
                                ...controlStyle,
                                width: '100%', height: 34,
                                paddingLeft: 22, paddingRight: 8,
                                fontSize: 13,
                              }}
                            />
                          </div>
                        </td>

                        {/* Update */}
                        <td style={{ padding: '11px 14px' }}>
                          <button
                            disabled={updating === client._id}
                            onClick={() => handleUpdate(client._id)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '6px 13px', borderRadius: 7, border: 'none',
                              background: updating === client._id ? 'var(--muted)' : 'var(--primary)',
                              color: updating === client._id ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                              fontSize: 12, fontWeight: 600, cursor: updating === client._id ? 'not-allowed' : 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {updating === client._id ? (
                              <><span style={{
                                width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)',
                                borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block',
                                animation: 'spin 1s linear infinite',
                              }} /> Saving…</>
                            ) : 'Save'}
                          </button>
                        </td>

                        {/* Initialize */}
                        <td style={{ padding: '11px 14px' }}>
                          <button
                            disabled={initializing === client._id}
                            onClick={() => handleInitialize(client._id)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '6px 13px', borderRadius: 7, border: 'none',
                              background: initializing === client._id ? 'var(--muted)' : 'var(--success)',
                              color: initializing === client._id ? 'var(--muted-foreground)' : 'var(--success-foreground)',
                              fontSize: 12, fontWeight: 600,
                              cursor: initializing === client._id ? 'not-allowed' : 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {initializing === client._id ? (
                              <><span style={{
                                width: 12, height: 12, border: '2px solid rgba(0,0,0,0.15)',
                                borderTopColor: 'var(--success-foreground)', borderRadius: '50%',
                                display: 'inline-block', animation: 'spin 1s linear infinite',
                              }} /> Working…</>
                            ) : (
                              <><FiRefreshCw size={11} /> Initialize</>
                            )}
                          </button>
                        </td>

                        {/* Details */}
                        <td style={{ padding: '11px 14px' }}>
                          <button
                            onClick={() => navigate(`/admin/salary-detail/${client._id}/${currentMonth}`)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '6px 13px', borderRadius: 7,
                              border: '1px solid var(--border)',
                              background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                              fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--secondary)'}
                          >
                            Details <FiArrowRight size={11} />
                          </button>
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
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <img
                          src={client.profile || dummyUser}
                          alt={client.name}
                          style={{
                            width: 36, height: 36, borderRadius: '50%',
                            objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0,
                          }}
                          onError={e => { e.currentTarget.src = dummyUser; }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                            {client.name || '—'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                            {client.cid || '—'} · {client.phoneNo || '—'}
                          </div>
                        </div>
                      </div>
                      {/* Current salary chip */}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 2,
                        padding: '4px 10px', borderRadius: 20,
                        background: 'var(--success)', color: 'var(--success-foreground)',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        <FaRupeeSign size={10} />{fmtINR(salaries[client._id] || 0)}
                      </span>
                    </div>

                    {/* Info grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: 12 }}>
                      {[
                        { label: 'Email', value: client.email || '—' },
                        { label: 'CID',   value: client.cid   || '—' },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={{ ...labelStyle, marginBottom: 2 }}>{label}</div>
                          <div style={{
                            fontSize: 13, fontWeight: 600, color: 'var(--text-strong)',
                            wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* New salary input */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ ...labelStyle, marginBottom: 5 }}>New base salary</div>
                      <div style={{ position: 'relative' }}>
                        <span style={{
                          position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                          fontSize: 13, color: 'var(--text-muted)', pointerEvents: 'none',
                        }}>₹</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Enter amount"
                          value={newSalaries[client._id] || ''}
                          onChange={e => handleSalaryChange(client._id, e.target.value)}
                          style={{ ...controlStyle, width: '100%', paddingLeft: 24 }}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      {/* Save */}
                      <button
                        disabled={updating === client._id}
                        onClick={() => handleUpdate(client._id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          padding: '9px 6px', borderRadius: 8, border: 'none',
                          background: updating === client._id ? 'var(--muted)' : 'var(--primary)',
                          color: updating === client._id ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                          fontSize: 12, fontWeight: 600,
                          cursor: updating === client._id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {updating === client._id
                          ? <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                          : 'Save'}
                      </button>

                      {/* Initialize */}
                      <button
                        disabled={initializing === client._id}
                        onClick={() => handleInitialize(client._id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          padding: '9px 6px', borderRadius: 8, border: 'none',
                          background: initializing === client._id ? 'var(--muted)' : 'var(--success)',
                          color: initializing === client._id ? 'var(--muted-foreground)' : 'var(--success-foreground)',
                          fontSize: 12, fontWeight: 600,
                          cursor: initializing === client._id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {initializing === client._id
                          ? <span style={{ width: 12, height: 12, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: 'var(--success-foreground)', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                          : <><FiRefreshCw size={11} /> Init</>}
                      </button>

                      {/* Details */}
                      <button
                        onClick={() => navigate(`/admin/salary-detail/${client._id}/${currentMonth}`)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          padding: '9px 6px', borderRadius: 8,
                          border: '1px solid var(--border)',
                          background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Details <FiArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Footer count ── */}
            {!loading && filteredClients.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                Showing 1 to {filteredClients.length} of {clients.length} entries
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </>
  );
}