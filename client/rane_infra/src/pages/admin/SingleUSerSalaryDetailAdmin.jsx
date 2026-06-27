import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getMonthlySalary, updateMonthlySalary, finalizeMonthlySalary, getBaseSalary,
} from '../../services/salaryServices';
import AdminHeader from '../../component/header/AdminHeader';
import dummyUser from '../../assets/images/dummyUser.jpeg';
import {
  FaMoneyBillWave, FaRupeeSign, FaUser, FaPlus, FaLock, FaFilePdf, FaCheckCircle,
} from 'react-icons/fa';

// ── Shared tokens ─────────────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const controlStyle = {
  border: '1px solid var(--border)', borderRadius: 8,
  padding: '8px 11px', fontSize: 13, color: 'var(--foreground)',
  background: 'var(--input)', outline: 'none', boxSizing: 'border-box', width: '100%',
};
const cardStyle = {
  background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)',
  boxShadow: '0 2px 10px var(--shadow-color)', overflow: 'hidden', marginBottom: 16,
};
const cardHeadStyle = {
  borderBottom: '1px solid var(--border)', padding: '12px 18px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
};

const fmtINR = (n) => Number(n || 0).toLocaleString('en-IN');
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

// Section config — drives the three transaction tables
const SECTIONS = [
  { key: 'overtime',   title: 'Overtime Entries',    sign: '+' },
  { key: 'advancePay', title: 'Advance Pay Entries', sign: '−' },
  { key: 'leaveCuts',  title: 'Leave Cut Entries',   sign: '−' },
];

// ── Reusable button ───────────────────────────────────────────────────────────
const Btn = ({ variant = 'primary', loading, children, style, ...rest }) => {
  const palette = {
    primary:   { bg: 'var(--primary)',   fg: 'var(--primary-foreground)',   bd: 'none' },
    success:   { bg: 'var(--success)',   fg: 'var(--success-foreground)',   bd: 'none' },
    warning:   { bg: 'var(--warning)',   fg: 'var(--warning-foreground)',   bd: 'none' },
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
  const [salaryData, setSalaryData] = useState(null);
  const [baseSalary, setBaseSalary] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            background: 'var(--destructive-bg)', border: '1px solid var(--destructive-border)', borderRadius: 14,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--destructive)', marginBottom: 6 }}>Couldn't load salary</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{error}</div>
          </div>
        </div>
      </>
    );
  }

  const { user, month, createdAt, finalized, paidOn, bonus } = salaryData;

  // ── Transaction table renderer ──────────────────────────────────────────
  const renderSection = ({ key, title }) => {
    const data = salaryData[key] || [];
    const total = data.reduce((s, i) => s + Number(i.amount || 0), 0);
    return (
      <div key={key} style={cardStyle}>
        <div style={cardHeadStyle}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>{title}</span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
            background: 'var(--muted)', padding: '4px 12px', borderRadius: 20,
            display: 'inline-flex', alignItems: 'center', gap: 3,
          }}>
            <FaRupeeSign size={10} />{fmtINR(total)} · {data.length} {data.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <div style={{ padding: '14px 18px' }}>
          {/* Add-entry form */}
          <Row className="g-2 align-items-end mb-3">
            <Col xs={6} md={3}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 4 }}>Date</label>
              <input type="date" value={form[key].date} disabled={finalized}
                onChange={e => handleInput(key, 'date', e.target.value)} style={controlStyle} />
            </Col>
            <Col xs={6} md={3}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 4 }}>Amount</label>
              <input type="number" min="0" placeholder="₹ 0" value={form[key].amount} disabled={finalized}
                onChange={e => handleInput(key, 'amount', e.target.value)} style={controlStyle} />
            </Col>
            <Col xs={12} md={4}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 4 }}>Note</label>
              <input type="text" placeholder="Optional" value={form[key].note} disabled={finalized}
                onChange={e => handleInput(key, 'note', e.target.value)} style={controlStyle} />
            </Col>
            <Col xs={12} md={2}>
              <Btn variant="primary" loading={submitting[key]} disabled={finalized}
                onClick={() => handleAddEntry(key)} style={{ width: '100%' }}>
                {!submitting[key] && <FaPlus size={11} />}
                {submitting[key] ? 'Adding…' : 'Add'}
              </Btn>
            </Col>
          </Row>

          {/* Entries */}
          {data.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '20px', background: 'var(--muted)',
              borderRadius: 10, border: '1px solid var(--border)',
              fontSize: 12, color: 'var(--text-muted)',
            }}>
              No entries recorded yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
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
                  {data.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '9px 12px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>{fmtDate(item.date)}</td>
                      <td style={{ padding: '9px 12px', fontWeight: 600, color: 'var(--text-strong)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          <FaRupeeSign size={10} color="var(--accent)" />{fmtINR(item.amount)}
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
    );
  };

  // Summary line component
  const SummaryRow = ({ label, amount, negative, strong }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: strong ? '12px 0 2px' : '6px 0',
    }}>
      <span style={{ fontSize: strong ? 14 : 13, fontWeight: strong ? 700 : 500, color: strong ? 'var(--text-strong)' : 'var(--text-muted)' }}>
        {label}
      </span>
      <span style={{
        fontSize: strong ? 18 : 13, fontWeight: 700,
        color: negative ? 'var(--destructive)' : (strong ? 'var(--primary)' : 'var(--text-strong)'),
        display: 'inline-flex', alignItems: 'center', gap: 2,
      }}>
        {negative ? '−' : ''}<FaRupeeSign size={strong ? 14 : 11} />{fmtINR(amount)}
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

        {/* ── Page title ── */}
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <div style={cardHeadStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FaMoneyBillWave size={16} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                  Monthly Salary Details
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  Pay period {month}
                </div>
              </div>
            </div>
            <FinalizedBadge finalized={finalized} />
          </div>

          {/* Profile + meta */}
          <div style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <img
                src={user?.profile || dummyUser} alt={user?.name}
                onError={e => { e.currentTarget.src = dummyUser; }}
                style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
              />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}>{user?.name || '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email || '—'}</div>
              </div>
            </div>

            <Row className="g-3">
              {[
                { label: 'Month',        value: month },
                { label: 'Base salary',  value: `₹${fmtINR(baseSalary)}` },
                { label: 'Bonus',        value: `₹${fmtINR(bonus)}` },
                { label: 'Paid on',      value: fmtDate(paidOn) },
                { label: 'Created at',   value: fmtDate(createdAt) },
              ].map(({ label, value }) => (
                <Col xs={6} md={3} key={label}>
                  <div style={{ ...labelStyle, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-strong)' }}>{value}</div>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* ── Allowances & Bonus ── */}
        <div style={cardStyle}>
          <div style={cardHeadStyle}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>Allowances &amp; Bonus</span>
            <Btn variant="success" loading={savingAllowances} disabled={finalized}
              onClick={handleSaveAllowances} style={{ padding: '6px 14px', fontSize: 12 }}>
              {!savingAllowances && <FaCheckCircle size={11} />}
              {savingAllowances ? 'Saving…' : 'Save changes'}
            </Btn>
          </div>
          <div style={{ padding: '16px 18px' }}>
            <Row className="g-3">
              {Object.entries(editedAllowances).map(([key, value]) => (
                <Col xs={6} md={3} key={key}>
                  <label style={{ ...labelStyle, display: 'block', marginBottom: 4 }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input type="number" min="0" value={value} disabled={finalized}
                    onChange={e => handleAllowanceChange(key, Number(e.target.value))} style={controlStyle} />
                </Col>
              ))}
              <Col xs={6} md={3}>
                <label style={{ ...labelStyle, display: 'block', marginBottom: 4 }}>Bonus</label>
                <input type="number" min="0" value={bonus} disabled={finalized}
                  onChange={e => setSalaryData(prev => ({ ...prev, bonus: Number(e.target.value) }))} style={controlStyle} />
              </Col>
            </Row>
          </div>
        </div>

        {/* ── Transaction sections ── */}
        {SECTIONS.map(renderSection)}

        {/* ── Salary summary ── */}
        <div style={cardStyle}>
          <div style={cardHeadStyle}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>Salary Summary</span>
          </div>
          <div style={{ padding: '16px 18px' }}>
            <Row>
              <Col md={7}>
                <SummaryRow label="Base salary" amount={baseSalary} />
                <SummaryRow label="Total allowances" amount={totalAllowances} />
                <SummaryRow label="Total overtime" amount={totalOvertime} />
                <SummaryRow label="Bonus" amount={bonus} />
                <SummaryRow label="Advance pay" amount={totalAdvancePay} negative />
                <SummaryRow label="Leave cuts" amount={totalLeaveCuts} negative />
                <div style={{ borderTop: '1px solid var(--border)', marginTop: 8 }} />
                <SummaryRow label="Net payable salary" amount={netPayable} strong />
              </Col>
            </Row>

            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap',
              marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)',
            }}>
              <Btn variant="secondary" onClick={() => toast.info('PDF generation coming soon.')}>
                <FaFilePdf size={12} /> View PDF
              </Btn>
              <Btn variant="warning" disabled={finalized} onClick={() => setConfirmFinalize(true)}>
                <FaLock size={11} /> {finalized ? 'Already finalized' : 'Finalize salary'}
              </Btn>
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
      `}</style>
    </>
  );
}