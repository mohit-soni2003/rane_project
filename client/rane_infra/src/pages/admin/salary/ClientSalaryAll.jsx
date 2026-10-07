import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminHeader from '../../../components/layout/header/AdminHeader';
import { getAllClients } from '../../../services/userServices';
import { getBaseSalary, uploadBaseSalary, initMonthlySalary } from '../../../services/salaryServices';
import dummyUser from '../../../assets/images/dummyUser.jpeg';
import { useNavigate } from 'react-router-dom';
import { FaMoneyBillWave, FaRupeeSign, FaUsers, FaCheckCircle, FaExclamationCircle, FaCalendarAlt } from 'react-icons/fa';
import {
  FiSearch, FiX, FiArrowRight, FiRefreshCw, FiFilter, FiChevronDown, FiRotateCcw, FiMail, FiPhone,
} from 'react-icons/fi';

// ── Shared style tokens ───────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const thStyle = {
  padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase',
  letterSpacing: '0.05em', whiteSpace: 'nowrap',
};

const spinnerStyle = (light) => ({
  width: 12, height: 12, borderRadius: '50%', display: 'inline-block',
  border: `2px solid ${light ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.15)'}`,
  borderTopColor: light ? '#fff' : 'var(--success-foreground)',
  animation: 'spin 1s linear infinite',
});

export default function ClientSalaryAll() {
  const [clients,    setClients]    = useState([]);
  const [salaries,   setSalaries]   = useState({});
  const [newSalaries, setNewSalaries] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [updating,   setUpdating]   = useState(null);
  const [initializing, setInitializing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('all'); // all | set | unset
  const [sortKey, setSortKey] = useState('name');          // name | salary-desc | salary-asc

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthLabel = new Date(`${currentMonth}-01`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
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

  const filteredClients = clients
    .filter(c => {
      const t = searchTerm.toLowerCase();
      const matchesSearch =
        (c.name  || '').toLowerCase().includes(t) ||
        (c.email || '').toLowerCase().includes(t) ||
        (c.cid   || '').toLowerCase().includes(t);
      const hasSalary = (salaries[c._id] || 0) > 0;
      const matchesSalary =
        salaryFilter === 'all' || (salaryFilter === 'set' ? hasSalary : !hasSalary);
      return matchesSearch && matchesSalary;
    })
    .sort((a, b) => {
      if (sortKey === 'salary-desc') return (salaries[b._id] || 0) - (salaries[a._id] || 0);
      if (sortKey === 'salary-asc')  return (salaries[a._id] || 0) - (salaries[b._id] || 0);
      return (a.name || '').localeCompare(b.name || '');
    });

  const hasActiveFilters = searchTerm !== '' || salaryFilter !== 'all' || sortKey !== 'name';
  const resetFilters = () => { setSearchTerm(''); setSalaryFilter('all'); setSortKey('name'); };

  // ── Stat derivations ─────────────────────────────────────────────────────
  const totalSalary    = Object.values(salaries).reduce((s, v) => s + (v || 0), 0);
  const withSalary     = clients.filter(c => (salaries[c._id] || 0) > 0).length;
  const withoutSalary  = clients.length - withSalary;

  const fmtINR = (n) => Number(n).toLocaleString('en-IN');

  // ── Reusable pieces ──────────────────────────────────────────────────────
  const renderSalaryChip = (amount) => (amount > 0 ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 700, fontSize: 13.5, color: 'var(--text-strong)' }}>
      <FaRupeeSign size={11} color="var(--accent)" />{fmtINR(amount)}
    </span>
  ) : (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: 'var(--warning)', color: 'var(--warning-foreground)',
    }}>Not set</span>
  ));

  const renderSalaryEditor = (client) => (
    <div className="cs-editor">
      <span className="cs-editor-prefix">₹</span>
      <input
        type="number"
        min="0"
        placeholder="New amount"
        value={newSalaries[client._id] || ''}
        onChange={e => handleSalaryChange(client._id, e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && updating !== client._id) handleUpdate(client._id); }}
        aria-label={`New base salary for ${client.name || 'client'}`}
      />
      <button
        type="button"
        disabled={updating === client._id}
        onClick={() => handleUpdate(client._id)}
        className="cs-editor-save"
      >
        {updating === client._id ? <span style={spinnerStyle(true)} /> : 'Save'}
      </button>
    </div>
  );

  const renderInitButton = (client, short) => (
    <button
      type="button"
      disabled={initializing === client._id}
      onClick={() => handleInitialize(client._id)}
      className="cs-btn cs-btn-success"
      title={`Create ${monthLabel} salary record`}
    >
      {initializing === client._id
        ? <><span style={spinnerStyle(false)} /> Working…</>
        : <><FiRefreshCw size={11} /> {short ? 'Init month' : 'Initialize month'}</>}
    </button>
  );

  const renderDetailsButton = (client) => (
    <button
      type="button"
      onClick={() => navigate(`/admin/salary-detail/${client._id}/${currentMonth}`)}
      className="cs-btn cs-btn-secondary"
    >
      Details <FiArrowRight size={11} />
    </button>
  );

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
                  Set each client&apos;s base salary and start their monthly salary record
                </div>
              </div>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, color: 'var(--text-strong)',
              background: 'var(--muted)', padding: '5px 12px', borderRadius: 20,
            }}>
              <FaCalendarAlt size={11} color="var(--accent)" /> {monthLabel}
            </span>
          </div>

          <div style={{ padding: '16px 20px' }}>

            {/* ── Stat cards ── */}
            {!loading && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
                    sub: 'clients with a base salary',
                    icon: <FaCheckCircle size={14} color="#1e40af" />,
                    bg: '#dbeafe', color: '#1e40af',
                  },
                  {
                    label: 'Salary not set',
                    value: withoutSalary,
                    sub: withoutSalary === 0 ? 'all clients covered' : 'need a base salary',
                    icon: <FaExclamationCircle size={14} color="var(--warning-foreground)" />,
                    bg: 'var(--warning)', color: 'var(--warning-foreground)',
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
            <div className="cs-toolbar">
              <div className="cs-search">
                <FiSearch size={15} color="var(--muted-foreground)" className="cs-icon-left" />
                <input
                  type="text"
                  placeholder="Search by name, email or CID…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="cs-ctl"
                  style={{ paddingLeft: 36, paddingRight: searchTerm ? 34 : 12 }}
                />
                {searchTerm && (
                  <button type="button" aria-label="Clear search" className="cs-clear" onClick={() => setSearchTerm('')}>
                    <FiX size={14} color="var(--muted-foreground)" />
                  </button>
                )}
              </div>

              <div className="cs-select">
                <FiFilter size={14} color="var(--muted-foreground)" className="cs-icon-left" />
                <select value={salaryFilter} onChange={e => setSalaryFilter(e.target.value)} className="cs-ctl" aria-label="Filter by salary status">
                  <option value="all">All clients</option>
                  <option value="set">Salary set</option>
                  <option value="unset">Salary not set</option>
                </select>
                <FiChevronDown size={14} color="var(--muted-foreground)" className="cs-icon-right" />
              </div>

              <div className="cs-select">
                <FaMoneyBillWave size={13} color="var(--muted-foreground)" className="cs-icon-left" />
                <select value={sortKey} onChange={e => setSortKey(e.target.value)} className="cs-ctl" aria-label="Sort clients">
                  <option value="name">Name (A–Z)</option>
                  <option value="salary-desc">Salary: High to low</option>
                  <option value="salary-asc">Salary: Low to high</option>
                </select>
                <FiChevronDown size={14} color="var(--muted-foreground)" className="cs-icon-right" />
              </div>

              {hasActiveFilters && (
                <button type="button" className="cs-reset" onClick={resetFilters}>
                  <FiRotateCcw size={13} /> Reset
                </button>
              )}

              <div className="cs-count">
                Showing <strong>{filteredClients.length}</strong> of <strong>{clients.length}</strong> clients
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
                  {searchTerm || salaryFilter !== 'all' ? 'Try adjusting your search or filters.' : 'No clients have been added yet.'}
                </div>
              </div>
            )}

            {/* ── Desktop table ── */}
            {!loading && filteredClients.length > 0 && (
              <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 940, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                      {['#', 'Client', 'Contact', 'Base Salary', 'Set New Salary', 'Actions'].map((h, i) => (
                        <th key={h} style={{ ...thStyle, textAlign: i === 5 ? 'right' : 'left' }}>{h}</th>
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
                        {/* # */}
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                            fontWeight: 700, fontSize: 11,
                          }}>{index + 1}</span>
                        </td>

                        {/* Client */}
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img
                              src={client.profile || dummyUser}
                              alt={client.name}
                              style={{
                                width: 36, height: 36, borderRadius: '50%',
                                objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0,
                              }}
                              onError={e => { e.currentTarget.src = dummyUser; }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-strong)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                                {client.name || '—'}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                {client.cid && client.cid !== 'N/A' ? client.cid : `CID-${index + 1}`}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)', maxWidth: 220 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={client.email}>
                            <FiMail size={11} color="var(--accent)" style={{ flexShrink: 0 }} /> {client.email || '—'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <FiPhone size={11} color="var(--accent)" style={{ flexShrink: 0 }} /> {client.phoneNo || '—'}
                          </div>
                        </td>

                        {/* Base salary */}
                        <td style={{ padding: '11px 14px' }}>
                          {renderSalaryChip(salaries[client._id] || 0)}
                        </td>

                        {/* Set new salary */}
                        <td style={{ padding: '11px 14px', minWidth: 230 }}>
                          {renderSalaryEditor(client)}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            {renderInitButton(client, false)}
                            {renderDetailsButton(client)}
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
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <img
                          src={client.profile || dummyUser}
                          alt={client.name}
                          style={{
                            width: 38, height: 38, borderRadius: '50%',
                            objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0,
                          }}
                          onError={e => { e.currentTarget.src = dummyUser; }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-strong)', lineHeight: 1.2, wordBreak: 'break-word' }}>
                            {client.name || '—'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {client.cid && client.cid !== 'N/A' ? client.cid : `CID-${index + 1}`}
                          </div>
                        </div>
                      </div>
                      {renderSalaryChip(salaries[client._id] || 0)}
                    </div>

                    {/* Contact */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ ...labelStyle, marginBottom: 2 }}>Email</div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {client.email || '—'}
                        </div>
                      </div>
                      <div>
                        <div style={{ ...labelStyle, marginBottom: 2 }}>Phone</div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)' }}>{client.phoneNo || '—'}</div>
                      </div>
                    </div>

                    {/* New salary */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ ...labelStyle, marginBottom: 5 }}>Set new base salary</div>
                      {renderSalaryEditor(client)}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {renderInitButton(client, true)}
                      {renderDetailsButton(client)}
                    </div>
                  </div>
                ))}
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
        select option { background: var(--input); color: var(--foreground); }

        .cs-toolbar {
          display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
          padding: 10px 0 14px; margin-bottom: 6px;
          border-bottom: 1px solid var(--border);
        }
        .cs-search { position: relative; flex: 1 1 260px; min-width: 200px; }
        .cs-select { position: relative; flex: 0 1 200px; min-width: 170px; }
        .cs-ctl {
          width: 100%; height: 38px; box-sizing: border-box;
          border: 1px solid var(--border); border-radius: 10px;
          background: var(--input); color: var(--foreground);
          font-size: 13px; outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .cs-select .cs-ctl { appearance: none; -webkit-appearance: none; cursor: pointer; padding: 0 32px 0 34px; }
        .cs-ctl:hover { border-color: var(--muted-foreground, #8b7b74); }
        .cs-ctl:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(107, 62, 43, 0.14); }
        .cs-icon-left, .cs-icon-right { position: absolute; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .cs-icon-left { left: 12px; }
        .cs-icon-right { right: 11px; }
        .cs-clear {
          position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
          width: 24px; height: 24px; border: none; border-radius: 50%; background: transparent;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .cs-clear:hover { background: var(--muted); }
        .cs-reset {
          display: inline-flex; align-items: center; gap: 6px;
          height: 38px; padding: 0 12px; border-radius: 10px;
          border: 1px dashed var(--border); background: transparent;
          color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap;
          transition: background .15s, color .15s;
        }
        .cs-reset:hover { background: var(--secondary); color: var(--secondary-foreground); }
        .cs-count { margin-left: auto; font-size: 12px; color: var(--text-muted); white-space: nowrap; }
        .cs-count strong { color: var(--text-strong); }

        /* inline salary editor: [₹ input][Save] */
        .cs-editor { display: flex; align-items: stretch; width: 100%; }
        .cs-editor-prefix {
          display: inline-flex; align-items: center; padding: 0 10px;
          border: 1px solid var(--border); border-right: none; border-radius: 8px 0 0 8px;
          background: var(--muted); color: var(--text-muted); font-size: 12.5px;
        }
        .cs-editor input {
          flex: 1; min-width: 0; height: 34px; box-sizing: border-box;
          border: 1px solid var(--border); background: var(--input); color: var(--foreground);
          font-size: 13px; padding: 0 10px; outline: none;
        }
        .cs-editor input:focus { border-color: var(--primary); }
        .cs-editor-save {
          padding: 0 14px; border: none; border-radius: 0 8px 8px 0;
          background: var(--primary); color: var(--primary-foreground, #fff);
          font-size: 12px; font-weight: 600; cursor: pointer; min-width: 58px;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .cs-editor-save:disabled { background: var(--muted); color: var(--muted-foreground); cursor: not-allowed; }

        .cs-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 5px;
          padding: 6px 13px; border-radius: 7px; font-size: 12px; font-weight: 600;
          cursor: pointer; white-space: nowrap; transition: background .15s;
        }
        .cs-btn-secondary { border: 1px solid var(--border); background: var(--secondary); color: var(--secondary-foreground); }
        .cs-btn-secondary:hover { background: var(--secondary-hover); }
        .cs-btn-success { border: 1px solid var(--border); background: var(--success); color: var(--success-foreground); }
        .cs-btn-success:hover:not(:disabled) { filter: brightness(0.96); }
        .cs-btn:disabled { background: var(--muted); color: var(--muted-foreground); cursor: not-allowed; }

        @media (max-width: 640px) {
          .cs-search, .cs-select { flex: 1 1 100%; }
          .cs-count { margin-left: 0; width: 100%; }
        }
      `}</style>
    </>
  );
}
