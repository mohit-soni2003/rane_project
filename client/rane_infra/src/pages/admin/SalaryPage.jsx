import React, { useEffect, useState } from 'react';
import {
  FaRupeeSign, FaFileDownload, FaWallet, FaGift, FaPlusCircle,
  FaRegClock, FaCalendarAlt, FaCreditCard, FaCheckCircle,
} from 'react-icons/fa';
import { MdOutlinePendingActions } from 'react-icons/md';
import { getBaseSalary, getMonthlySalary } from '../../services/salaryServices';
import { useAuthStore } from '../../store/authStore';
import ClientHeader from '../../component/header/ClientHeader';
import StaffHeader from "../../component/header/StaffHeader";

const C = { primary: "#6b3e2b", accent: "#b95a52", success: "#225b31", destructive: "#c94a3a", muted: "#8b7b74" };
const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

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
    try {
      const [base, monthly] = await Promise.all([
        getBaseSalary(user._id),
        getMonthlySalary(user._id, month),
      ]);
      setBaseSalary(base);
      setMonthlySalary(monthly);
    } catch (error) {
      console.error('Salary fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchSalaryData(selectedMonth);
  }, [user, selectedMonth]);

  const sum = (arr) => arr?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
  const sumObj = (obj) => Object.values(obj || {}).reduce((acc, val) => acc + val, 0);

  const totalOvertime = sum(monthlySalary?.overtime);
  const totalLeaves = sum(monthlySalary?.leaveCuts);
  const totalAdvance = sum(monthlySalary?.advancePay);
  const totalAllowances = sumObj(monthlySalary?.allowances);
  const finalSalary =
    (baseSalary?.amount || 0) +
    (monthlySalary?.bonus || 0) +
    totalOvertime +
    totalAllowances -
    totalLeaves -
    totalAdvance;

  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const value = date.toISOString().slice(0, 7);
    const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    return { value, label };
  });

  const finalized = monthlySalary?.finalized;

  // ── styles ──
  const cardStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, boxShadow: "0 2px 8px var(--shadow-color)" };
  const ctrlStyle = { border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--foreground)", background: "var(--input)", outline: "none", cursor: "pointer" };

  // ── Breakdown card ──
  const BreakdownCard = ({ icon, label, amount, sign, items }) => {
    const positive = sign === '+';
    const amtColor = positive ? C.success : C.destructive;
    return (
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>{label}</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: amtColor, whiteSpace: "nowrap" }}>{sign} {money(amount)}</span>
        </div>
        {items && items.length > 0 && (
          <div style={{ marginTop: 10, borderTop: "1px solid var(--border)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
            {items.map((it, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--text-muted)" }}>
                <span>{new Date(it.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                <span style={{ fontWeight: 600 }}>{money(it.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Calculation row ──
  const Row = ({ label, value, sign, net }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: net ? "12px 14px" : "10px 14px", background: net ? "var(--secondary)" : "transparent", borderTop: "1px solid var(--border)", borderRadius: net ? "0 0 8px 8px" : 0 }}>
      <span style={{ fontSize: net ? 14 : 13, fontWeight: net ? 700 : 500, color: net ? "var(--text-strong)" : "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: net ? 17 : 13.5, fontWeight: 700, color: net ? C.success : (sign === '-' ? C.destructive : "var(--text-strong)") }}>
        {sign && sign + ' '}{money(value)}
      </span>
    </div>
  );

  return (
    <>
      {getHeaderComponent()}

      <div style={{ background: "var(--background)", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--foreground)", padding: "0 2px" }}>

        <div style={{ background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)", boxShadow: "0 2px 10px var(--shadow-color)", overflow: "hidden", marginBottom: 16 }}>

          {/* ── Title bar ── */}
          <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FaRupeeSign size={15} color={C.accent} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>Salary Details</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Your monthly earnings breakdown</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: finalized ? "var(--success)" : "var(--warning)", color: finalized ? "var(--success-foreground)" : "var(--warning-foreground)", fontSize: 11.5, fontWeight: 600, padding: "5px 11px", borderRadius: 20 }}>
                {finalized ? <FaCheckCircle size={12} /> : <MdOutlinePendingActions size={13} />}
                {finalized ? "Finalized" : "Not finalized"}
              </span>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={ctrlStyle}>
                {monthOptions.map((m) => <option value={m.value} key={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "16px 20px" }}>

            {/* Net salary hero */}
            <div style={{ background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--secondary-foreground)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Net salary this month</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 34, fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>{money(finalSalary)}</span>
                <span style={{ fontSize: 14, color: "var(--text-muted)" }}>/ month</span>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ width: 24, height: 24, margin: "0 auto 12px", border: "3px solid var(--border)", borderTopColor: C.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading salary details…</div>
              </div>
            ) : (
              <>
                {/* Breakdown */}
                <div style={cardStyle}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-strong)", marginBottom: 14 }}>Salary breakdown</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
                    <BreakdownCard icon={<FaWallet size={14} color={C.accent} />} label="Base salary" amount={baseSalary?.amount} sign="+" />
                    <BreakdownCard icon={<FaGift size={14} color={C.accent} />} label="Bonus" amount={monthlySalary?.bonus} sign="+" />
                    <BreakdownCard icon={<FaPlusCircle size={14} color={C.accent} />} label="Allowances" amount={totalAllowances} sign="+" />
                    <BreakdownCard icon={<FaRegClock size={14} color={C.accent} />} label="Overtime" amount={totalOvertime} sign="+" items={monthlySalary?.overtime} />
                    <BreakdownCard icon={<FaCalendarAlt size={14} color={C.destructive} />} label="Leave cuts" amount={totalLeaves} sign="-" items={monthlySalary?.leaveCuts} />
                    <BreakdownCard icon={<FaCreditCard size={14} color={C.destructive} />} label="Advance pay" amount={totalAdvance} sign="-" items={monthlySalary?.advancePay} />
                  </div>
                </div>

                {/* Calculation summary */}
                <div style={cardStyle}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-strong)", marginBottom: 12 }}>Salary calculation</div>
                  <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px" }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>Base salary</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-strong)" }}>{money(baseSalary?.amount)}</span>
                    </div>
                    <Row label="Bonus" value={monthlySalary?.bonus} sign="+" />
                    <Row label="Allowances" value={totalAllowances} sign="+" />
                    <Row label="Overtime" value={totalOvertime} sign="+" />
                    <Row label="Leaves deduction" value={totalLeaves} sign="-" />
                    <Row label="Advance deduction" value={totalAdvance} sign="-" />
                    <Row label="Net salary" value={finalSalary} net />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                    <button
                      disabled={!finalized}
                      onClick={() => alert("⚠️ This service is currently unavailable. We're working on it and will make it available soon. Thank you for your patience!")}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, border: "none",
                        background: finalized ? "var(--primary)" : "var(--muted)",
                        color: finalized ? "#fff" : "var(--text-muted)",
                        fontSize: 13, fontWeight: 600, cursor: finalized ? "pointer" : "not-allowed",
                      }}
                    >
                      <FaFileDownload size={13} color={finalized ? "#ffffff" : C.muted} /> Download salary PDF
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}