import React from 'react';
import ClientHeader from '../../component/header/ClientHeader';
import {
  FaFileAlt, FaFileInvoice, FaCartPlus, FaArrowDown, FaArrowUp, FaCalculator,
  FaTruck, FaMoneyBillWave, FaUniversity, FaEllipsisH, FaFolderOpen, FaChevronRight,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const C = { primary: "#6b3e2b", accent: "#b95a52", muted: "#8b7b74" };

// Each category gets a tint (bg) + icon color from the palette family
const documents = [
  { name: 'LOA', slug: 'LOA', description: 'Letters of Authorization', icon: <FaFileAlt />, tint: 'var(--secondary)', ink: '#6b3e2b' },
  { name: 'Sales Order', slug: 'SalesOrder', description: 'All sales orders', icon: <FaFileInvoice />, tint: 'var(--success)', ink: '#225b31' },
  { name: 'Purchase Order', slug: 'PurchaseOrder', description: 'All purchase orders', icon: <FaCartPlus />, tint: 'var(--warning)', ink: '#4a1f18' },
  { name: 'Pay-In', slug: 'PayIn', description: 'Incoming payments', icon: <FaArrowDown />, tint: 'var(--success)', ink: '#225b31' },
  { name: 'Pay-Out', slug: 'PayOut', description: 'Outgoing payments', icon: <FaArrowUp />, tint: 'var(--warning)', ink: '#4a1f18' },
  { name: 'Estimate', slug: 'Estimate', description: 'All estimates', icon: <FaCalculator />, tint: 'var(--secondary)', ink: '#6b3e2b' },
  { name: 'Delivery Challan', slug: 'DeliveryChallan', description: 'All delivery challans', icon: <FaTruck />, tint: 'var(--muted)', ink: '#8b7b74' },
  { name: 'Expense', slug: 'Expense', description: 'All expenses', icon: <FaMoneyBillWave />, tint: 'var(--warning)', ink: '#4a1f18' },
  { name: 'Bank Reference', slug: 'BankReference', description: 'All bank references', icon: <FaUniversity />, tint: 'var(--secondary)', ink: '#6b3e2b' },
  { name: 'Other', slug: 'Other', description: 'All other documents', icon: <FaEllipsisH />, tint: 'var(--muted)', ink: '#8b7b74' },
];

export default function DocumentCategory() {
  const navigate = useNavigate();

  return (
    <>
      <ClientHeader />

      <div style={{ background: "var(--background)", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--foreground)", padding: "0 2px" }}>

        <div style={{ background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)", boxShadow: "0 2px 10px var(--shadow-color)", overflow: "hidden", marginBottom: 16 }}>

          {/* ── Title bar ── */}
          <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FaFolderOpen size={15} color={C.accent} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>Document Categories</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Browse documents grouped by type</div>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "16px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
              {documents.map((doc) => (
                <div
                  key={doc.slug}
                  role="button"
                  onClick={() => navigate(`/client/document/category/${doc.slug}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 13,
                    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
                    padding: "14px 16px", cursor: "pointer", boxShadow: "0 2px 8px var(--shadow-color)",
                    transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 24px var(--shadow-color)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px var(--shadow-color)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  {/* Icon chip */}
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: doc.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20, color: doc.ink }}>
                    {doc.icon}
                  </div>

                  {/* Text */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.3 }}>{doc.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{doc.description}</div>
                  </div>

                  {/* Chevron */}
                  <FaChevronRight size={13} color={C.muted} style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}