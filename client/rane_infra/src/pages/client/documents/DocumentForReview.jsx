// This component shows the details of a particular DFS and helps take action when it is
// assigned to the client by admin or staff (for uploading a new file or reviewing it).

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFileById, forwardDocument } from "../../../services/dfsService";
import { CLOUDINARY_URL, UPLOAD_PRESET } from "../../../store/keyStore";
import ClientHeader from "../../../components/layout/header/ClientHeader";
import moment from "moment";
import {
  FaFilePdf, FaPaperPlane, FaUserCircle, FaArrowLeft, FaArrowRight, FaClock, FaInfoCircle,
  FaLayerGroup, FaBuilding, FaExternalLinkAlt, FaUserPlus, FaTasks, FaStickyNote,
} from "react-icons/fa";
import { MdAttachFile } from "react-icons/md";
import { useAuthStore } from "../../../store/authStore";

// ── Palette hex (hardcoded on icons so they always render) ───────────────────
const C = { primary: "#6b3e2b", accent: "#b95a52", destructive: "#c94a3a", muted: "#8b7b74" };

const statusMeta = (status) => {
  switch (status) {
    case 'approved':  return { bg: 'var(--success)', color: 'var(--success-foreground)', label: 'Approved' };
    case 'rejected':  return { bg: '#fde8e6', color: C.destructive, label: 'Rejected' };
    case 'in-review': return { bg: 'var(--warning)', color: 'var(--warning-foreground)', label: 'In Review' };
    case 'pending':   return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)', label: 'Pending' };
    default:          return { bg: 'var(--muted)', color: 'var(--text-muted)', label: status || '—' };
  }
};

const StatusBadge = ({ status }) => {
  const m = statusMeta(status);
  return <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>{m.label}</span>;
};

const actionMeta = (action) => {
  const a = (action || "").toLowerCase();
  if (a === "approved") return { bg: "var(--success)", color: "var(--success-foreground)" };
  if (a === "rejected") return { bg: "#fde8e6", color: C.destructive };
  return { bg: "var(--warning)", color: "var(--warning-foreground)" };
};

const Avatar = ({ src, name, size = 30 }) => {
  const [err, setErr] = useState(false);
  return src && !err ? (
    <img src={src} alt={name || 'User'} onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
  ) : (
    <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <FaUserCircle size={size * 0.7} color={C.muted} />
    </span>
  );
};

// ── Shared styles ────────────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5,
  marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em",
};
const ctrlStyle = {
  width: "100%", height: 40, border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px",
  fontSize: 13.5, color: "var(--foreground)", background: "var(--input)", outline: "none", boxSizing: "border-box",
};
const cardStyle = {
  background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)",
  boxShadow: "0 2px 10px var(--shadow-color)", overflow: "hidden", marginBottom: 16,
};
const cardHeadStyle = {
  borderBottom: "1px solid var(--border)", padding: "12px 18px",
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap",
};

// Section card with an icon title
const Section = ({ icon: Icon, title, right, children }) => (
  <div style={cardStyle}>
    <div style={cardHeadStyle}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "var(--text-strong)" }}>
        <Icon size={14} color={C.accent} /> {title}
      </span>
      {right}
    </div>
    <div style={{ padding: "16px 18px" }}>{children}</div>
  </div>
);

export default function DocumentForReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  // Form state
  const [forwardedTo, setForwardedTo] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuthStore(); // logged in user

  useEffect(() => {
    const loadData = async () => {
      try {
        const fileData = await getFileById(id);
        setFile(fileData);
        setStatus(fileData.status);

        // ✅ find the last trail entry where forwardedTo == me
        const lastToMe = fileData.forwardingTrail
          .slice()
          .reverse()
          .find(trail => trail.forwardedTo?._id === user._id);

        // ✅ set that previous sender (forwardedBy) into users list
        if (lastToMe?.forwardedBy) {
          setUsers([lastToMe.forwardedBy]);
        }
      } catch (error) {
        alert("❌ " + error.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, user._id]);

  const handleForward = async (e) => {
    e.preventDefault();
    if (!forwardedTo || !action || !note.trim() || !status) {
      alert("⚠️ Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      let attachmentUrl = null;
      if (attachment) {
        const formData = new FormData();
        formData.append("file", attachment);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
        const uploadData = await res.json();
        if (!uploadData.secure_url) throw new Error("Cloud upload failed.");
        attachmentUrl = uploadData.secure_url;
      }

      const forwardData = { forwardedTo, action, note, status, attachment: attachmentUrl || undefined };

      await forwardDocument(id, forwardData);
      alert("✅ Document forwarded successfully.");

      const updated = await getFileById(id);
      setFile(updated);
      setForwardedTo("");
      setAction("");
      setNote("");
      setAttachment(null);
    } catch (err) {
      alert("❌ Failed to forward: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const trail = file?.forwardingTrail || [];

  const wrapStyle = {
    background: "var(--background)", minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--foreground)", padding: "0 2px",
  };

  // ── Loading / not found ──
  if (loading) {
    return (
      <>
        <ClientHeader />
        <div style={wrapStyle}>
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 30, height: 30, margin: "0 auto 12px", border: "3px solid var(--border)", borderTopColor: C.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading document…</div>
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }
  if (!file) {
    return (
      <>
        <ClientHeader />
        <div style={wrapStyle}>
          <div style={{ maxWidth: 460, margin: "40px auto", textAlign: "center", padding: "40px 24px", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 14 }}>
            <FaFilePdf size={32} color={C.muted} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>Document not found</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>It may have been deleted or the link is invalid.</div>
            <button onClick={() => navigate(-1)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text-strong)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Go back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ClientHeader />

      <div style={wrapStyle}>

        {/* ── Header card ── */}
        <div style={{ ...cardStyle, ...cardHeadStyle, padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              style={{
                width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)",
                background: "var(--secondary)", cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <FaArrowLeft size={13} color={C.primary} />
            </button>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FaFilePdf size={16} color={C.primary} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2, wordBreak: "break-word" }}>
                {file.fileTitle || "DFS Request"}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span>Review and forward</span>
                <span>·</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <FaClock size={10} color={C.accent} /> {moment(file.createdAt).format("DD MMM YYYY, hh:mm A")}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <StatusBadge status={file.status} />
            {file.fileUrl && (
              <a href={file.fileUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, background: "var(--primary)", color: "var(--primary-foreground, #fff)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                <FaExternalLinkAlt size={11} /> View document
              </a>
            )}
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="dr-grid">

          {/* LEFT COLUMN */}
          <div style={{ minWidth: 0 }}>

            {/* Document information */}
            <Section icon={FaInfoCircle} title="Document Information">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                <div>
                  <span style={labelStyle}><FaLayerGroup size={11} color={C.muted} /> Type</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)" }}>{file.docType || "—"}</div>
                </div>
                <div>
                  <span style={labelStyle}><FaBuilding size={11} color={C.muted} /> Department</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)" }}>{file.Department || "—"}</div>
                </div>
                <div>
                  <span style={labelStyle}>Uploaded by</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar src={file.uploadedBy?.profile} name={file.uploadedBy?.name} size={28} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)" }}>{file.uploadedBy?.name || "—"}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <span style={labelStyle}>Description</span>
                <div style={{ fontSize: 13.5, color: "var(--foreground)", lineHeight: 1.55, wordBreak: "break-word", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
                  {file.description || "No description provided."}
                </div>
              </div>
            </Section>

            {/* Forward form */}
            <Section icon={FaPaperPlane} title="Forward This Document">
              <form onSubmit={handleForward}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                  <div>
                    <label htmlFor="fw-to" style={labelStyle}><FaUserPlus size={11} color={C.muted} /> Forward to <span style={{ color: C.destructive }}>*</span></label>
                    <select id="fw-to" value={forwardedTo} onChange={(e) => setForwardedTo(e.target.value)} required style={{ ...ctrlStyle, cursor: "pointer" }}>
                      <option value="">Select user</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                    {users.length === 0 && (
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 5 }}>
                        You can reply to whoever forwarded this document to you.
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="fw-action" style={labelStyle}><FaTasks size={11} color={C.muted} /> Action <span style={{ color: C.destructive }}>*</span></label>
                    <select id="fw-action" value={action} onChange={(e) => setAction(e.target.value)} required style={{ ...ctrlStyle, cursor: "pointer" }}>
                      <option value="">Select action</option>
                      <option value="forwarded">Forwarded</option>
                      <option value="viewed">Viewed</option>
                      <option value="commented">Commented</option>
                      <option value="approved">Approved</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label htmlFor="fw-note" style={labelStyle}><FaStickyNote size={11} color={C.muted} /> Note <span style={{ color: C.destructive }}>*</span></label>
                  <textarea id="fw-note" rows={3} placeholder="Add a note about what you did or what's needed next…" value={note} onChange={(e) => setNote(e.target.value)} required
                    style={{ ...ctrlStyle, height: "auto", padding: "10px 12px", resize: "vertical", minHeight: 84, lineHeight: 1.5, fontFamily: "inherit" }} />
                </div>

                <div style={{ marginTop: 14 }}>
                  <span style={labelStyle}><MdAttachFile size={12} color={C.muted} /> Attachment <span style={{ textTransform: "none", fontWeight: 400 }}>(optional)</span></span>
                  {!attachment ? (
                    <label htmlFor="attachInput" style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: "1.5px dashed var(--border)", borderRadius: 10, padding: "12px 14px", background: "var(--muted)", color: "var(--text-muted)", fontSize: 13 }}>
                      <span style={{ width: 34, height: 34, borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <MdAttachFile size={16} color={C.accent} />
                      </span>
                      <span style={{ flex: 1 }}>Choose a file to attach</span>
                      <span style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text-strong)", fontSize: 12.5, fontWeight: 600 }}>Browse</span>
                    </label>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px" }}>
                      <MdAttachFile size={18} color={C.primary} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-strong)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{attachment.name}</span>
                      <button type="button" onClick={() => setAttachment(null)} style={{ border: "1px solid var(--border)", background: "var(--card)", color: "var(--text-strong)", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Remove</button>
                    </div>
                  )}
                  <input id="attachInput" type="file" onChange={(e) => setAttachment(e.target.files[0])} style={{ display: "none" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
                  <button type="submit" disabled={submitting}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 8, border: "none", background: "var(--primary)", color: "var(--primary-foreground, #fff)", fontSize: 13.5, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
                    {submitting
                      ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} /> Forwarding…</>
                      : <><FaPaperPlane size={13} color="#ffffff" /> Forward document</>}
                  </button>
                </div>
              </form>
            </Section>
          </div>

          {/* RIGHT COLUMN — forwarding trail as a timeline */}
          <div style={{ minWidth: 0 }}>
            <Section
              icon={FaClock}
              title="Forwarding Trail"
              right={trail.length > 0 ? (
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", background: "var(--muted)", padding: "4px 12px", borderRadius: 20 }}>
                  {trail.length} {trail.length === 1 ? "entry" : "entries"}
                </span>
              ) : null}
            >
              {trail.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
                  <FaInfoCircle size={14} color={C.muted} /> No forwarding history yet.
                </div>
              ) : (
                <div style={{ position: "relative", paddingLeft: 6 }}>
                  <div style={{ position: "absolute", left: 18, top: 8, bottom: 8, width: 2, background: "var(--border)" }} />

                  {trail.map((t, i) => {
                    const am = actionMeta(t.action);
                    return (
                      <div key={t._id || i} style={{ position: "relative", display: "flex", gap: 12, marginBottom: i === trail.length - 1 ? 0 : 16 }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                          background: "var(--secondary)", color: "var(--secondary-foreground)",
                          border: "2px solid var(--card)", boxShadow: "0 0 0 1px var(--border)",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                        }}>{i + 1}</div>

                        <div style={{ flex: 1, minWidth: 0, background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                            {t.action ? (
                              <span style={{ background: am.bg, color: am.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "capitalize" }}>{t.action}</span>
                            ) : <span />}
                            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <FaClock size={10} /> {moment(t.timestamp).format("DD MMM YYYY, hh:mm A")}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--text-strong)" }}>
                              <Avatar src={t.forwardedBy?.profile} name={t.forwardedBy?.name} size={24} />
                              {t.forwardedBy?.name || "Unknown"}
                            </span>
                            <FaArrowRight size={10} color={C.muted} />
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--text-strong)" }}>
                              <Avatar src={t.forwardedTo?.profile} name={t.forwardedTo?.name} size={24} />
                              {t.forwardedTo?.name || "Unknown"}
                            </span>
                          </div>

                          {t.note && (
                            <div style={{ fontSize: 12.5, color: "var(--foreground)", lineHeight: 1.5, wordBreak: "break-word", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px" }}>
                              {t.note}
                            </div>
                          )}

                          {t.attachment && (
                            <a href={t.attachment} target="_blank" rel="noopener noreferrer"
                              style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, padding: "5px 11px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--secondary)", color: "var(--secondary-foreground)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                              <MdAttachFile size={13} /> View attachment
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: var(--input); color: var(--foreground); }
        input:focus, select:focus, textarea:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(107, 62, 43, 0.14); }
        .dr-grid { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 16px; align-items: start; }
        @media (max-width: 991px) { .dr-grid { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
    </>
  );
}
