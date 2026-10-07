import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getMonthlySalary, updateMonthlySalary, finalizeMonthlySalary, getBaseSalary,
} from '../../../services/salaryServices';
import AdminHeader from '../../../components/layout/header/AdminHeader';
import dummyUser from '../../../assets/images/dummyUser.jpeg';
import {
  FaMoneyBillWave, FaRupeeSign, FaPlus, FaLock, FaFilePdf, FaCheckCircle, FaArrowLeft,
  FaCalendarAlt, FaGift, FaClock, FaHandHoldingUsd, FaUserSlash, FaWallet, FaInfoCircle,
} from 'react-icons/fa';

// ── Shared tokens ─────────────────────────────────────────────────────────────
const C = { primary: '#6b3e2b', accent: '#b95a52', success: '#225b31', destructive: '#c94a3a', muted: '#8b7b74' };

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const controlStyle = {
  border: '1px solid var(--border)', borderRadius: 8,
  padding: '8px 11px', fontSize: 13, color: 'var(--foreground)',
  background: 'var(--input)', outline: 'none', boxSizing: 'border-box', width: '100%', height: 38,
};
const cardStyle = {
  background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)',
  boxShadow: '0 2px 10px var(--shadow-color)', overflow: 'hidden', marginBottom: 16,
};
const cardHeadStyle = {
  borderBottom: '1px solid var(--border)', padding: '12px 18px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
};
const cardTitleStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  fontSize: 14, fontWeight: 700, color: 'var(--text-strong)',
};

const fmtINR = (n) => Number(n || 0).toLocaleString('en-IN');
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtMonth = (m) => {
  const d = new Date(`${m}-01`);
  return isNaN(d) ? m : d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

// Section config — drives the three adjustment tabs
const SECTIONS = [
  { key: 'overtime',   title: 'Overtime',    sign: '+', Icon: FaClock,          color: C.success },
  { key: 'advancePay', title: 'Advance Pay', sign: '−', Icon: FaHandHoldingUsd, color: C.destructive },
  { key: 'leaveCuts',  title: 'Leave Cuts',  sign: '−', Icon: FaUserSlash,      color: C.destructive },
];

// ── Reusable button ───────────────────────────────────────────────────────────
const Btn = ({ variant = 'primary', loading, children, style, ...rest }) => {
  const palette = {
    primary:   { bg: 'var(--primary)',   fg: 'var(--primary-foreground)',   bd: 'none' },
    success:   { bg: 'var(--success)',   fg: 'var(--success-foreground)',   bd: '1px solid var(--border)' },
    warning:   { bg: 'var(--warning)',   fg: 'var(--warning-foreground)',   bd: '1px solid var(--border)' },
    secondary: { bg: 'var(--secondary)', fg: 'var(--secondary-foreground)', bd: '1px solid var(--border)' },
  }[variant];
  const disabled = rest.disabled || loading;
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 8, border: palette.bd,
        background: disabled ? 'var(--muted)' : palette.bg,
        color: disabled ? 'var(--muted-foreground)' : palette.fg,
        fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap', ...style,
      }}
    >
      {loading && (
        <span style={{
          width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)',
          borderTopColor: 'currentColor', borderRadius: '50%', display: 'inline-block',
          animation: 'spin 1s linear infinite',
        }} />
      )}
      {children}
    </button>
  );
};

// ── Status badge ──────────────────────────────────────────────────────────────
const FinalizedBadge = ({ finalized }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
    background: finalized ? 'var(--success)' : 'var(--warning)',
    color: finalized ? 'var(--success-foreground)' : 'var(--warning-foreground)',
  }}>
    {finalized ? <FaLock size={10} /> : null}
    {finalized ? 'Finalized' : 'Not finalized'}
  </span>
);

export default function SingleUserSalaryDetailAdmin() {
  const { clientid, currmonth } = useParams();
  const navigate = useNavigate();
  const [salaryData, setSalaryData] = useState(null);
  const [baseSalary, setBaseSalary] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overtime');

  const [form, setForm] = useState({
    overtime:   { date: '', amount: '', note: '' },
    advancePay: { date: '', amount: '', note: '' },
    leaveCuts:  { date: '', amount: '', note: '' },
  });
  const [submitting, setSubmitting] = useState({ overtime: false, advancePay: false, leaveCuts: false });
  const [editedAllowances, setEditedAllowances] = useState({});
  const [savingAllowances, setSavingAllowances] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);

  useEffect(() => {
    async function fetchSalary() {
      try {
        setLoading(true);
        setError('');
        const data = await getMonthlySalary(clientid, currmonth);
        const baseData = await getBaseSalary(clientid);
        setSalaryData(data);
        setEditedAllowances(data.allowances || {});
        setBaseSalary(baseData.amount || 0);
      } catch (err) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    }
    fetchSalary();
  }, [clientid, currmonth]);

  const handleInput = (section, field, value) =>
    setForm(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));

  const handleAddEntry = async (section) => {
    if (submitting[section]) return;
    const entry = form[section];
    if (!entry.date || !entry.amount) {
      toast.warning('Please fill date and amount.');
      return;
    }
    try {
      setSubmitting(prev => ({ ...prev, [section]: true }));
      const currentEntries = salaryData?.[section] ?? [];
      const payload = { [section]: [...currentEntries, entry] };
      const updated = await updateMonthlySalary(clientid, currmonth, payload);
      setSalaryData(updated);
      setForm(prev => ({ ...prev, [section]: { date: '', amount: '', note: '' } }));
      toast.success('Entry added.');
    } catch (err) {
      toast.error(err.message || 'Failed to add entry.');
    } finally {
      setSubmitting(prev => ({ ...prev, [section]: false }));
    }
  };

  const handleAllowanceChange = (key, value) =>
    setEditedAllowances(prev => ({ ...prev, [key]: value }));

  const handleSaveAllowances = async () => {
    if (savingAllowances) return;
    try {
      setSavingAllowances(true);
      const payload = { allowances: editedAllowances, bonus: salaryData.bonus };
      const updated = await updateMonthlySalary(clientid, currmonth, payload);
      setSalaryData(updated);
      toast.success('Allowances and bonus updated.');
    } catch (err) {
      toast.error('Error updating data: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingAllowances(false);
    }
  };

  const handleFinalizeSalary = async () => {
    try {
      setFinalizing(true);
      const updated = await finalizeMonthlySalary(clientid, currmonth);
      setSalaryData(updated);
      setConfirmFinalize(false);
      toast.success('Salary finalized.');
    } catch (err) {
      toast.error('Error finalizing salary: ' + (err.message || 'Unknown error'));
    } finally {
      setFinalizing(false);
    }
  };

  // ── Totals ──────────────────────────────────────────────────────────────
  let totalAllowances = 0, totalOvertime = 0, totalAdvancePay = 0, totalLeaveCuts = 0, netPayable = 0;
  if (salaryData) {
    totalAllowances = Object.values(editedAllowances).reduce((s, v) => s + Number(v || 0), 0);
    totalOvertime   = salaryData.overtime?.reduce((s, i) => s + Number(i.amount || 0), 0) || 0;
    totalAdvancePay = salaryData.advancePay?.reduce((s, i) => s + Number(i.amount || 0), 0) || 0;
    totalLeaveCuts  = salaryData.leaveCuts?.reduce((s, i) => s + Number(i.amount || 0), 0) || 0;
    netPayable = baseSalary + totalAllowances + totalOvertime + (salaryData.bonus || 0) - totalAdvancePay - totalLeaveCuts;
  }

  // ── Loading / error ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <AdminHeader />
        <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--background)', minHeight: '100vh' }}>
          <span style={{
            display: 'inline-block', width: 34, height: 34, border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite',
          }} />
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>Fetching salary details…</div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }
  if (error) {
    return (
      <>
        <AdminHeader />
        <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '40px 16px' }}>
          <div style={{
            maxWidth: 460, margin: '0 auto', textAlign: 'center', padding: '32px 24px',
            background: '#fde8e6', border: '1px solid #f5b8b2', borderRadius: 14,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.destructive, marginBottom: 6 }}>Couldn&apos;t load salary</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{error}</div>
            <Btn variant="secondary" onClick={() => navigate('/admin/salary/all-client-list')}>
              <FaArrowLeft size={11} /> Back to clients
            </Btn>
          </div>
        </div>
      </>
    );
  }

  const { user, month, createdAt, finalized, paidOn, bonus } = salaryData;
  const activeSection = SECTIONS.find(s => s.key === activeTab) || SECTIONS[0];
  const activeData = salaryData[activeSection.key] || [];
  const activeTotal = activeData.reduce((s, i) => s + Number(i.amount || 0), 0);

  // Summary line
  const renderSummaryRow = (label, amount, { negative, positive } = {}) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 2,
        color: negative ? C.destructive : positive ? C.success : 'var(--text-strong)',
      }}>
        {negative ? '−' : positive ? '+' : ''}<FaRupeeSign size={10} />{fmtINR(amount)}
      </span>
    </div>
  );

  return (
    <>
      <AdminHeader />
      <ToastContainer position="top-right" autoClose={2500} newestOnTop />

      <div style={{
        padding: '0 2px', fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--foreground)', background: 'var(--background)', minHeight: '100vh',
      }}>

        {/* ── Header card ── */}
        <div style={{ ...cardStyle, ...cardHeadStyle, padding: '14px 20px', borderBottom: cardStyle.border }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <button
              onClick={() => navigate('/admin/salary/all-client-list')}
              aria-label="Back to client salaries"
              style={{
                width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--secondary)', cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <FaArrowLeft size={13} color={C.primary} />
            </button>
            <img
              src={user?.profile || dummyUser} alt={user?.name}
              onError={e => { e.currentTarget.src = dummyUser; }}
              style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--secondary)', flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2, wordBreak: 'break-word' }}>
                {user?.name || '—'}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, wordBreak: 'break-all' }}>
                {user?.email || '—'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, color: 'var(--text-strong)',
              background: 'var(--muted)', padding: '5px 12px', borderRadius: 20,
            }}>
              <FaCalendarAlt size={11} color={C.accent} /> {fmtMonth(month)}
            </span>
            <FinalizedBadge finalized={finalized} />
          </div>
        </div>

        {finalized && (
          <div style={{
            ...cardStyle, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--success)', color: 'var(--success-foreground)',
          }}>
            <FaLock size={13} color={C.success} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              This salary is finalized{paidOn ? ` (paid on ${fmtDate(paidOn)})` : ''}. It can no longer be edited.
            </span>
          </div>
        )}

        {/* ── Main grid ── */}
        <div className="sd-grid">

          {/* LEFT COLUMN */}
          <div style={{ minWidth: 0 }}>

            {/* Allowances & bonus */}
            <div style={cardStyle}>
              <div style={cardHeadStyle}>
                <span style={cardTitleStyle}><FaGift size={14} color={C.accent} /> Allowances &amp; Bonus</span>
                <Btn variant="success" loading={savingAllowances} disabled={finalized}
                  onClick={handleSaveAllowances} style={{ padding: '6px 14px', fontSize: 12 }}>
                  {!savingAllowances && <FaCheckCircle size={11} />}
                  {savingAllowances ? 'Saving…' : 'Save changes'}
                </Btn>
              </div>
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
                  {Object.entries(editedAllowances).map(([key, value]) => (
                    <div key={key}>
                      <label style={{ ...labelStyle, display: 'block', marginBottom: 4 }}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <input type="number" min="0" value={value} disabled={finalized}
                        onChange={e => handleAllowanceChange(key, Number(e.target.value))} style={controlStyle} />
                    </div>
                  ))}
                  <div>
                    <label style={{ ...labelStyle, display: 'block', marginBottom: 4 }}>Bonus</label>
                    <input type="number" min="0" value={bonus} disabled={finalized}
                      onChange={e => setSalaryData(prev => ({ ...prev, bonus: Number(e.target.value) }))} style={controlStyle} />
                  </div>
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                  Total allowances: <strong style={{ color: 'var(--text-strong)' }}>₹{fmtINR(totalAllowances)}</strong>
                </div>
              </div>
            </div>

            {/* Adjustments — overtime / advance / leave cuts */}
            <div style={cardStyle}>
              <div style={{
                display: 'flex', gap: 4, padding: '10px 14px', flexWrap: 'wrap',
                borderBottom: '1px solid var(--border)', background: 'var(--muted)',
              }}>
                {SECTIONS.map(({ key, title, Icon }) => {
                  const active = key === activeTab;
                  const count = (salaryData[key] || []).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: active ? 'var(--primary)' : 'transparent',
                        color: active ? 'var(--primary-foreground, #fff)' : 'var(--foreground)',
                        fontSize: 12.5, fontWeight: 600, transition: 'background .15s',
                      }}
                    >
                      <Icon size={12} color={active ? '#fff' : C.accent} />
                      {title}
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
                        background: active ? 'rgba(255,255,255,0.25)' : 'var(--secondary)',
                        color: active ? '#fff' : 'var(--secondary-foreground)',
                      }}>{count}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)' }}>
                    {activeSection.title} entries
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    fontSize: 12, fontWeight: 700, color: activeSection.color,
                    background: 'var(--muted)', padding: '4px 12px', borderRadius: 20,
                  }}>
                    {activeSection.sign}<FaRupeeSign size={10} />{fmtINR(activeTotal)} total
                  </span>
                </div>

                {/* Add-entry form */}
                <div className="sd-entry-form">
                  <div>
                    <label style={{ ...labelStyle, display: 'block', marginBottom: 4 }}>Date</label>
                    <input type="date" value={form[activeTab].date} disabled={finalized}
                      onChange={e => handleInput(activeTab, 'date', e.target.value)} style={controlStyle} />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, display: 'block', marginBottom: 4 }}>Amount</label>
                    <input type="number" min="0" placeholder="₹ 0" value={form[activeTab].amount} disabled={finalized}
                      onChange={e => handleInput(activeTab, 'amount', e.target.value)} style={controlStyle} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ ...labelStyle, display: 'block', marginBottom: 4 }}>Note</label>
                    <input type="text" placeholder="Optional" value={form[activeTab].note} disabled={finalized}
                      onChange={e => handleInput(activeTab, 'note', e.target.value)} style={controlStyle} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <Btn variant="primary" loading={submitting[activeTab]} disabled={finalized}
                      onClick={() => handleAddEntry(activeTab)} style={{ width: '100%', height: 38 }}>
                      {!submitting[activeTab] && <FaPlus size={11} />}
                      {submitting[activeTab] ? 'Adding…' : 'Add'}
                    </Btn>
                  </div>
                </div>

                {/* Entries */}
                {activeData.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '24px 20px', background: 'var(--muted)',
                    borderRadius: 10, border: '1px solid var(--border)',
                    fontSize: 12.5, color: 'var(--text-muted)', marginTop: 14,
                  }}>
                    <FaInfoCircle size={14} color={C.muted} style={{ marginBottom: 6 }} /><br />
                    No {activeSection.title.toLowerCase()} entries recorded yet.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', marginTop: 14 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                          {['#', 'Date', 'Amount', 'Note'].map(h => (
                            <th key={h} style={{
                              padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                              color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em',
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeData.map((item, idx) => (
                          <tr key={item._id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '9px 12px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                            <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>{fmtDate(item.date)}</td>
                            <td style={{ padding: '9px 12px', fontWeight: 700, color: activeSection.color }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                {activeSection.sign}<FaRupeeSign size={10} />{fmtINR(item.amount)}
                              </span>
                            </td>
                            <td style={{ padding: '9px 12px', color: 'var(--text-muted)' }}>{item.note || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (sticky on desktop) */}
          <div className="sd-side">

            {/* Net payable + breakdown */}
            <div style={cardStyle}>
              <div style={cardHeadStyle}>
                <span style={cardTitleStyle}><FaWallet size={14} color={C.accent} /> Salary Summary</span>
              </div>
              <div style={{ padding: '16px 18px' }}>
                <div style={{
                  background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 12,
                  padding: '14px 16px', marginBottom: 12,
                }}>
                  <div style={labelStyle}>Net payable</div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 3, marginTop: 4,
                    fontSize: 26, fontWeight: 800, color: C.primary, lineHeight: 1.1,
                  }}>
                    <FaRupeeSign size={20} />{fmtINR(netPayable)}
                  </div>
                </div>

                {renderSummaryRow('Base salary', baseSalary)}
                {renderSummaryRow('Allowances', totalAllowances, { positive: true })}
                {renderSummaryRow('Overtime', totalOvertime, { positive: true })}
                {renderSummaryRow('Bonus', bonus, { positive: true })}
                <div style={{ borderTop: '1px dashed var(--border)', margin: '4px 0' }} />
                {renderSummaryRow('Advance pay', totalAdvancePay, { negative: true })}
                {renderSummaryRow('Leave cuts', totalLeaveCuts, { negative: true })}

                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 8,
                  marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)',
                }}>
                  <Btn variant="warning" disabled={finalized} onClick={() => setConfirmFinalize(true)} style={{ width: '100%' }}>
                    <FaLock size={11} /> {finalized ? 'Already finalized' : 'Finalize salary'}
                  </Btn>
                  <Btn variant="secondary" onClick={() => toast.info('PDF generation coming soon.')} style={{ width: '100%' }}>
                    <FaFilePdf size={12} /> View PDF
                  </Btn>
                </div>
              </div>
            </div>

            {/* Record details */}
            <div style={cardStyle}>
              <div style={cardHeadStyle}>
                <span style={cardTitleStyle}><FaMoneyBillWave size={14} color={C.accent} /> Record Details</span>
              </div>
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Pay period', value: fmtMonth(month) },
                  { label: 'Base salary', value: `₹${fmtINR(baseSalary)}` },
                  { label: 'Paid on', value: fmtDate(paidOn) },
                  { label: 'Record created', value: fmtDate(createdAt) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ ...labelStyle, marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Finalize confirm modal ── */}
      {confirmFinalize && (
        <div
          onClick={() => !finalizing && setConfirmFinalize(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--card)', borderRadius: 14, width: '100%', maxWidth: 400,
            boxShadow: '0 16px 48px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}>
            <div style={{ textAlign: 'center', padding: '24px 24px 16px' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: 'var(--warning)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <FaLock size={22} color="var(--warning-foreground)" />
              </div>
              <h5 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)', margin: '0 0 8px' }}>Finalize salary?</h5>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Net payable is <strong style={{ color: 'var(--text-strong)' }}>₹{fmtINR(netPayable)}</strong>. Once finalized,
                this salary record can no longer be edited.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
              <Btn variant="secondary" disabled={finalizing} onClick={() => setConfirmFinalize(false)} style={{ flex: 1 }}>
                Cancel
              </Btn>
              <Btn variant="warning" loading={finalizing} onClick={handleFinalizeSalary} style={{ flex: 1 }}>
                {finalizing ? 'Finalizing…' : 'Finalize'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        input:disabled { opacity: 0.6; cursor: not-allowed; }
        input:focus { border-color: var(--primary) !important; }

        .sd-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 16px; align-items: start; }
        .sd-side { min-width: 0; position: sticky; top: 12px; }
        .sd-entry-form { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 110px; gap: 10px; }
        @media (max-width: 991px) {
          .sd-grid { grid-template-columns: minmax(0, 1fr); }
          .sd-side { position: static; }
        }
        @media (max-width: 640px) {
          .sd-entry-form { grid-template-columns: 1fr 1fr; }
          .sd-entry-form > div[style*="span 2"] { grid-column: span 2; }
          .sd-entry-form > div:last-child { grid-column: span 2; }
        }
      `}</style>
    </>
  );
}
