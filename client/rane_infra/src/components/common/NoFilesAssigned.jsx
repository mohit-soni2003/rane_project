import React from "react";
import { useNavigate } from "react-router-dom";
import { FiInbox, FiRefreshCw, FiUploadCloud, FiSend, FiEye, FiCheckCircle } from "react-icons/fi";

// Empty state for the "documents assigned to you" page.
//   role      — 'admin' | 'staff' | 'client' (decides which shortcuts are shown)
//   onRefresh — optional; shows a Refresh button that reloads the list
export default function NoFilesAssigned({ role, onRefresh }) {
  const navigate = useNavigate();
  const canUpload = role === "client" || role === "staff";

  const btn = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
    border: "1px solid var(--border)", background: "var(--secondary)", color: "var(--secondary-foreground)",
  };

  const steps = [
    { Icon: FiSend, title: "Someone forwards a file", text: "A colleague or client sends a document to you." },
    { Icon: FiEye, title: "It appears here", text: "You'll see it in this list with its status." },
    { Icon: FiCheckCircle, title: "You review and respond", text: "Approve, comment or forward it onward." },
  ];

  return (
    <div style={{
      textAlign: "center", padding: "44px 20px 36px",
      background: "var(--muted)", border: "1px dashed var(--border)", borderRadius: 14,
    }}>
      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: "50%", margin: "0 auto 18px",
        background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 4px 14px var(--shadow-color)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <FiInbox size={30} color="#b95a52" />
      </div>

      <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-strong)", marginBottom: 6 }}>
        You&apos;re all caught up
      </div>
      <div style={{ fontSize: 13.5, color: "var(--text-muted)", maxWidth: 420, margin: "0 auto", lineHeight: 1.55 }}>
        No documents are assigned to you right now. When someone forwards a file to you, it will show up here.
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
        {onRefresh && (
          <button type="button" onClick={onRefresh} style={btn}>
            <FiRefreshCw size={14} color="#6b3e2b" /> Refresh
          </button>
        )}
        {canUpload && (
          <button
            type="button"
            onClick={() => navigate(`/${role}/upload-document`)}
            style={{ ...btn, border: "none", background: "var(--primary)", color: "var(--primary-foreground, #fff)" }}
          >
            <FiUploadCloud size={14} /> Upload a document
          </button>
        )}
        {canUpload && (
          <button type="button" onClick={() => navigate(`/${role}/track-dfs/all`)} style={btn}>
            Track my documents
          </button>
        )}
      </div>

      {/* How it works */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12,
        maxWidth: 760, margin: "30px auto 0", textAlign: "left",
      }}>
        {steps.map(({ Icon, title, text }, i) => (
          <div key={title} style={{
            background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px",
            display: "flex", gap: 11, alignItems: "flex-start",
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: 8, background: "var(--secondary)", flexShrink: 0,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={15} color="#b95a52" />
            </span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.25 }}>
                {i + 1}. {title}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.45 }}>{text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
