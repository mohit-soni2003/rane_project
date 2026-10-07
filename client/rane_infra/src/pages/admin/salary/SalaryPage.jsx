import React, { useEffect, useState } from 'react';
import {
  FaRupeeSign, FaFileDownload, FaWallet, FaGift, FaPlusCircle, FaRegClock, FaCalendarAlt,
  FaCreditCard, FaCheckCircle, FaArrowUp, FaArrowDown, FaInfoCircle, FaReceipt,
} from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import { MdOutlinePendingActions } from 'react-icons/md';
import { getBaseSalary, getMonthlySalary } from '../../../services/salaryServices';
import { useAuthStore } from '../../../store/authStore';
import ClientHeader from '../../../components/layout/header/ClientHeader';
import StaffHeader from "../../../components/layout/header/StaffHeader";

const C = { primary: "#6b3e2b", accent: "#b95a52", success: "#225b31", destructive: "#c94a3a", muted: "#8b7b74" };
const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const monthLabel = (m) => {
  const d = new Date(`${m}-01`);
  return isNaN(d) ? m : d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const cardStyle = {
  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
  marginBottom: 16, boxShadow: '0 2px 8px var(--shadow-color)', overflow: 'hidden',
};
const cardHeadStyle = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
  borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13.5, color: 'var(--text-strong)',
};

export default function SalaryPage() {
  const { user } = useAuthStore();
  const [baseSalary, setBaseSalary] = useState(null);
  const [monthlySalary, setMonthlySalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const getHeaderComponent = () => {
    switch (user?.role) {
      case 'client': return <ClientHeader />;
      case 'staff': return <StaffHeader />;
      default: return <ClientHeader />;
    }
  };

  const fetchSalaryData = async (month) => {
    setLoading(true);
    // Clear the previous month first so a month without a record never shows stale figures
    setMonthlySalary(null);
    const [base, monthly] = await Promise.allSettled([
      getBaseSalary(user._id),
      getMonthlySalary(user._id, month),
    ]);
    if (base.status === 'fulfilled') setBaseSalary(base.value);
    else console.error('Base salary fetch error:', base.reason);
    if (monthly.status === 'fulfilled') setMonthlySalary(monthly.value);
    else console.error('Monthly salary fetch error:', monthly.reason);
    setLoading(false);
  };

  useEffect(() => {
    if (user?._id) fetchSalaryData(selectedMonth);
  }, [user, selectedMonth]);

  const sum = (arr) => arr?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
  const sumObj = (obj) => Object.values(obj || {}).reduce((acc, val) => acc + val, 0);

  const base = baseSalary?.amount || 0;
  const bonus = monthlySalary?.bonus || 0;
  const totalOvertime = sum(monthlySalary?.overtime);
  const totalLeaves = sum(monthlySalary?.leaveCuts);
  const totalAdvance = sum(monthlySalary?.advancePay);
  const totalAllowances = sumObj(monthlySalary?.allowances);
  const totalEarnings = base + bonus + totalOvertime + totalAllowances;
  const totalDeductions = totalLeaves + totalAdvance;
  const finalSalary = totalEarnings - totalDeductions;

  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const value = date.toISOString().slice(0, 7);
    const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    return { value, label };
  });

  const finalized = monthlySalary?.finalized;
  const hasRecord = !!monthlySalary;
  const allowanceEntries = Object.entries(monthlySalary?.allowances || {}).filter(([, v]) => Number(v) > 0);

  // ── One earnings / deductions line, with optional itemised entries ──
  const renderLine = ({ icon, label, amount, sign, items, detail }) => {
    const positive = sign === '+';
    const amtColor = positive ? C.success : C.destructive;
    return (
      <div key={label} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{
              width: 32, height: 32, borderRadius: 8, background: 'var(--secondary)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{icon}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)' }}>{label}</div>
              {detail && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{detail}</div>}
            </div>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: amount > 0 ? amtColor : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {amount > 0 ? `${sign} ` : ''}{money(amount)}
          </span>
        </div>

        {items && items.length > 0 && (
          <div style={{
            marginTop: 10, marginLeft: 42, background: 'var(--muted)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '4px 12px',
          }}>
            {items.map((it, i) => (
              <div key={it._id || i} style={{
                display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0',
                borderBottom: i === items.length - 1 ? 'none' : '1px dashed var(--border)', fontSize: 12,
              }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 0 }}>
                  {fmtDate(it.date)}{it.note ? ` · ${it.note}` : ''}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-strong)', whiteSpace: 'nowrap' }}>{money(it.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Payslip calculation row ──
  const renderCalcRow = (label, value, sign) => (
    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: sign === '-' ? C.destructive : sign === '+' ? C.success : 'var(--text-strong)' }}>
        {sign ? `${sign} ` : ''}{money(value)}
      </span>
    </div>
  );

  return (
    <>
      {getHeaderComponent()}

      <div style={{ background: "var(--background)", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--foreground)", padding: "0 2px" }}>

        {/* ── Header card ── */}
        <div style={{
          ...cardStyle, padding: '14px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FaRupeeSign size={15} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>My Salary</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Your monthly earnings and deductions</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {hasRecord && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: finalized ? 'var(--success)' : 'var(--warning)',
                color: finalized ? 'var(--success-foreground)' : 'var(--warning-foreground)',
                fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 20,
              }}>
                {finalized ? <FaCheckCircle size={12} /> : <MdOutlinePendingActions size={13} />}
                {finalized ? 'Finalized' : 'Not finalized'}
              </span>
            )}
            <div className="sl-select">
              <FaCalendarAlt size={13} color={C.muted} className="sl-icon-left" />
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} aria-label="Select month">
                {monthOptions.map((m) => <option value={m.value} key={m.value}>{m.label}</option>)}
              </select>
              <FiChevronDown size={14} color={C.muted} className="sl-icon-right" />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '56px 20px' }}>
            <div style={{ width: 26, height: 26, margin: '0 auto 12px', border: '3px solid var(--border)', borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Loading salary details…</div>
          </div>
        ) : !hasRecord ? (
          /* ── No record for this month ── */
          <div style={{ ...cardStyle, textAlign: 'center', padding: '56px 20px', background: 'var(--muted)' }}>
            <FaInfoCircle size={30} color={C.muted} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>
              No salary record for {monthLabel(selectedMonth)}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', maxWidth: 380, margin: '0 auto', lineHeight: 1.55 }}>
              Your salary for this month hasn&apos;t been prepared yet. Pick another month, or check back once it has been added.
            </div>
          </div>
        ) : (
          <>
            {/* ── Net salary hero ── */}
            <div className="sl-hero">
              <div style={{
                ...cardStyle, marginBottom: 0, background: 'var(--secondary)', padding: '20px 22px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                <div style={{ ...labelStyle, color: 'var(--secondary-foreground)', marginBottom: 6 }}>
                  Net salary · {monthLabel(selectedMonth)}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{money(finalSalary)}</span>
                </div>
                {finalized && monthlySalary?.paidOn && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Paid on {fmtDate(monthlySalary.paidOn)}</div>
                )}
              </div>

              <div style={{ ...cardStyle, marginBottom: 0, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FaArrowUp size={14} color={C.success} />
                </span>
                <div>
                  <div style={labelStyle}>Total earnings</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.success, marginTop: 2 }}>{money(totalEarnings)}</div>
                </div>
              </div>

              <div style={{ ...cardStyle, marginBottom: 0, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#fde8e6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FaArrowDown size={14} color={C.destructive} />
                </span>
                <div>
                  <div style={labelStyle}>Total deductions</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.destructive, marginTop: 2 }}>{money(totalDeductions)}</div>
                </div>
              </div>
            </div>

            {/* ── Main grid ── */}
            <div className="sl-grid" style={{ marginTop: 16 }}>

              {/* Earnings + deductions */}
              <div style={{ minWidth: 0 }}>
                <div style={cardStyle}>
                  <div style={cardHeadStyle}>
                    <FaArrowUp size={12} color={C.success} /> Earnings
                  </div>
                  {renderLine({ icon: <FaWallet size={14} color={C.accent} />, label: 'Base salary', amount: base, sign: '+' })}
                  {renderLine({ icon: <FaGift size={14} color={C.accent} />, label: 'Bonus', amount: bonus, sign: '+' })}
                  {renderLine({
                    icon: <FaPlusCircle size={14} color={C.accent} />, label: 'Allowances', amount: totalAllowances, sign: '+',
                    detail: allowanceEntries.length > 0
                      ? allowanceEntries.map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)} ${money(v)}`).join(' · ')
                      : null,
                  })}
                  {renderLine({ icon: <FaRegClock size={14} color={C.accent} />, label: 'Overtime', amount: totalOvertime, sign: '+', items: monthlySalary?.overtime })}
                </div>

                <div style={cardStyle}>
                  <div style={cardHeadStyle}>
                    <FaArrowDown size={12} color={C.destructive} /> Deductions
                  </div>
                  {renderLine({ icon: <FaCalendarAlt size={14} color={C.destructive} />, label: 'Leave cuts', amount: totalLeaves, sign: '-', items: monthlySalary?.leaveCuts })}
                  {renderLine({ icon: <FaCreditCard size={14} color={C.destructive} />, label: 'Advance pay', amount: totalAdvance, sign: '-', items: monthlySalary?.advancePay })}
                </div>
              </div>

              {/* Payslip */}
              <div className="sl-side">
                <div style={cardStyle}>
                  <div style={cardHeadStyle}>
                    <FaReceipt size={13} color={C.accent} /> Salary calculation
                  </div>
                  <div style={{ padding: '10px 16px 16px' }}>
                    {renderCalcRow('Base salary', base)}
                    {renderCalcRow('Bonus', bonus, '+')}
                    {renderCalcRow('Allowances', totalAllowances, '+')}
                    {renderCalcRow('Overtime', totalOvertime, '+')}
                    {renderCalcRow('Leaves deduction', totalLeaves, '-')}
                    {renderCalcRow('Advance deduction', totalAdvance, '-')}

                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'var(--secondary)', borderRadius: 10, padding: '12px 14px', marginTop: 8,
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>Net salary</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: C.success }}>{money(finalSalary)}</span>
                    </div>

                    <button
                      disabled={!finalized}
                      onClick={() => alert("⚠️ This service is currently unavailable. We're working on it and will make it available soon. Thank you for your patience!")}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        width: '100%', marginTop: 14, padding: '10px 18px', borderRadius: 8, border: 'none',
                        background: finalized ? 'var(--primary)' : 'var(--muted)',
                        color: finalized ? '#fff' : 'var(--text-muted)',
                        fontSize: 13, fontWeight: 600, cursor: finalized ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <FaFileDownload size={13} color={finalized ? '#ffffff' : C.muted} /> Download salary PDF
                    </button>
                    {!finalized && (
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                        Available once this month&apos;s salary is finalized.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .sl-select { position: relative; }
        .sl-select select {
          appearance: none; -webkit-appearance: none; cursor: pointer;
          height: 38px; min-width: 190px; box-sizing: border-box; padding: 0 32px 0 34px;
          border: 1px solid var(--border); border-radius: 10px;
          background: var(--input); color: var(--foreground); font-size: 13px; outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .sl-select select:hover { border-color: var(--muted-foreground, #8b7b74); }
        .sl-select select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(107, 62, 43, 0.14); }
        .sl-icon-left, .sl-icon-right { position: absolute; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .sl-icon-left { left: 12px; }
        .sl-icon-right { right: 11px; }
        select option { background: var(--input); color: var(--foreground); }

        .sl-hero { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 16px; }
        .sl-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 16px; align-items: start; }
        .sl-side { min-width: 0; position: sticky; top: 12px; }
        @media (max-width: 991px) {
          .sl-hero { grid-template-columns: 1fr 1fr; }
          .sl-hero > :first-child { grid-column: span 2; }
          .sl-grid { grid-template-columns: minmax(0, 1fr); }
          .sl-side { position: static; }
        }
        @media (max-width: 575px) {
          .sl-hero { grid-template-columns: 1fr; }
          .sl-hero > :first-child { grid-column: span 1; }
          .sl-select, .sl-select select { width: 100%; }
        }
      `}</style>
    </>
  );
}
