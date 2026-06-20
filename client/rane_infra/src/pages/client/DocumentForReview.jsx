// This component shows the details of a particular DFS and helps take action when it is
// assigned to the client by admin or staff (for uploading a new file or reviewing it).

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFileById, getAllUsers, forwardDocument } from "../../services/dfsService";
import { CLOUDINARY_URL, UPLOAD_PRESET } from "../../store/keyStore";
import ClientHeader from "../../component/header/ClientHeader";
import moment from "moment";
import { FaFilePdf, FaPaperPlane, FaUserCircle } from "react-icons/fa";
import { MdAttachFile } from "react-icons/md";
import { useAuthStore } from "../../store/authStore";

// ── Palette hex (hardcoded on icons so they always render) ───────────────────
const C = { primary: "#6b3e2b", accent: "#b95a52", destructive: "#c94a3a", muted: "#8b7b74" };

const statusMeta = (status) => {
  switch (status) {
    case 'approved':  return { bg: 'var(--success)', color: 'var(--success-foreground)', label: 'Approved' };
    case 'rejected':  return { bg: 'var(--destructive)', color: 'var(--destructive-foreground)', label: 'Rejected' };
    case 'in-review': return { bg: 'var(--warning)', color: 'var(--warning-foreground)', label: 'In Review' };
    case 'pending':   return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)', label: 'Pending' };
    default:          return { bg: 'var(--muted)', color: 'var(--text-muted)', label: status || '—' };
  }
};

const StatusBadge = ({ status }) => {
  const m = statusMeta(status);
  return <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>{m.label}</span>;
};

const Avatar = ({ src, name, size = 30 }) => (
  src ? (
    <img src={src} alt={name || 'User'} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }}
      onError={(e) => { e.currentTarget.style.display = 'none'; }} />
  ) : (
    <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <FaUserCircle size={size * 0.7} color={C.muted} />
    </span>
  )
);

export default function DocumentForReview() {
  const { id } = useParams();
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

  // ── Shared styles ──
  const labelStyle = { fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" };
  const ctrlStyle = { width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13.5, color: "var(--foreground)", background: "var(--input)", outline: "none", boxSizing: "border-box" };
  const cardStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, boxShadow: "0 2px 8px var(--shadow-color)" };
  const sectionTitle = (text, color = C.accent) => (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
      <FaFilePdf size={13} color={color} />
      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-strong)" }}>{text}</span>
    </div>
  );

  return (
    <>
      <ClientHeader />

      <div style={{ background: "var(--background)", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--foreground)", padding: "0 2px" }}>

        <div style={{ background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)", boxShadow: "0 2px 10px var(--shadow-color)", overflow: "hidden", marginBottom: 16 }}>

          {/* ── Title bar ── */}
          <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FaFilePdf size={15} color={C.accent} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>DFS Request Detail</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Review the document and forward it onward</div>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "16px 20px" }}>

            {loading ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ width: 24, height: 24, margin: "0 auto 12px", border: "3px solid var(--border)", borderTopColor: C.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading document…</div>
              </div>
            ) : !file ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: 14 }}>No file found.</div>
            ) : (
              <>
                {/* ── Document info ── */}
                <div style={cardStyle}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
                    {/* Left: details */}
                    <div style={{ flex: "1 1 320px", minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                        <h5 style={{ fontWeight: 700, fontSize: 17, color: "var(--text-strong)", margin: 0 }}>{file.fileTitle}</h5>
                        <StatusBadge status={file.status} />
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                        {file.docType && <span style={{ background: "var(--secondary)", color: "var(--secondary-foreground)", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 6 }}>{file.docType}</span>}
                        {file.Department && <span style={{ background: "var(--muted)", color: "var(--text-muted)", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 6 }}>{file.Department}</span>}
                      </div>

                      {file.description && (
                        <p style={{ fontSize: 13.5, color: "var(--foreground)", lineHeight: 1.6, marginBottom: 12 }}>{file.description}</p>
                      )}

                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 8, background: "var(--secondary)", color: "var(--secondary-foreground)", fontSize: 13, fontWeight: 600, textDecoration: "none", border: "1px solid var(--border)" }}>
                        <FaFilePdf size={13} color={C.destructive} /> Open PDF
                      </a>
                    </div>

                    {/* Right: uploader */}
                    <div style={{ flex: "0 0 auto", minWidth: 180 }}>
                      <div style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Uploaded by</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                          <Avatar src={file.uploadedBy?.profile} name={file.uploadedBy?.name} size={36} />
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-strong)" }}>{file.uploadedBy?.name || "—"}</div>
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{moment(file.createdAt).format("DD MMM YYYY, hh:mm A")}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Forwarding trail ── */}
                <div style={cardStyle}>
                  {sectionTitle("Forwarding trail")}
                  {file.forwardingTrail.length === 0 ? (
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No forwarding history yet.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {file.forwardingTrail.map((trail, index) => (
                        <div key={index} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: trail.note ? 8 : 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 12.5, fontWeight: 600, color: "var(--text-strong)" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <Avatar src={trail.forwardedBy?.profile} name={trail.forwardedBy?.name} size={24} />
                                {trail.forwardedBy?.name || "Unknown"}
                              </span>
                              <span style={{ color: C.accent, fontWeight: 700 }}>→</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <Avatar src={trail.forwardedTo?.profile} name={trail.forwardedTo?.name} size={24} />
                                {trail.forwardedTo?.name || "Unknown"}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {trail.action && <span style={{ background: "var(--secondary)", color: "var(--secondary-foreground)", fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 5, textTransform: "capitalize" }}>{trail.action}</span>}
                              <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{moment(trail.timestamp).format("DD MMM, hh:mm A")}</span>
                            </div>
                          </div>
                          {trail.note && <div style={{ fontSize: 12.5, color: "var(--foreground)", lineHeight: 1.5 }}>{trail.note}</div>}
                          {trail.attachment && (
                            <a href={trail.attachment} target="_blank" rel="noopener noreferrer"
                              style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--link)", textDecoration: "none", marginTop: 8, fontWeight: 500 }}>
                              <MdAttachFile size={14} color={C.accent} /> View attachment
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Forward form ── */}
                <div style={cardStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                    <FaPaperPlane size={13} color={C.accent} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-strong)" }}>Forward this document</span>
                  </div>

                  <form onSubmit={handleForward}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={labelStyle}>Forward to *</label>
                        <select value={forwardedTo} onChange={(e) => setForwardedTo(e.target.value)} required style={{ ...ctrlStyle, cursor: "pointer" }}>
                          <option value="">Select user</option>
                          {users.map((u) => (
                            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={labelStyle}>Action *</label>
                        <select value={action} onChange={(e) => setAction(e.target.value)} required style={{ ...ctrlStyle, cursor: "pointer" }}>
                          <option value="">Select action</option>
                          <option value="forwarded">Forwarded</option>
                          <option value="viewed">Viewed</option>
                          <option value="commented">Commented</option>
                          <option value="approved">Approved</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={labelStyle}>Note *</label>
                      <textarea rows={3} placeholder="Add a note about what you did or what's needed next…" value={note} onChange={(e) => setNote(e.target.value)} required style={{ ...ctrlStyle, resize: "vertical", minHeight: 84, lineHeight: 1.5 }} />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>Attachment (optional)</label>
                      <label htmlFor="attachInput" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", border: "1px dashed var(--border)", borderRadius: 8, padding: "11px 14px", background: "var(--muted)", color: "var(--text-muted)", fontSize: 13 }}>
                        <MdAttachFile size={16} color={C.accent} />
                        {attachment ? "Change file" : "Choose a file to attach"}
                      </label>
                      <input id="attachInput" type="file" onChange={(e) => setAttachment(e.target.files[0])} style={{ display: "none" }} />
                      {attachment && (
                        <div style={{ display: "flex", alignItems: "center", gap: 9, background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", marginTop: 8 }}>
                          <MdAttachFile size={16} color={C.primary} />
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{attachment.name}</span>
                          <span onClick={() => setAttachment(null)} style={{ cursor: "pointer", color: "var(--text-muted)", fontSize: 16, lineHeight: 1 }}>×</span>
                        </div>
                      )}
                    </div>

                    <button type="submit" disabled={submitting}
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "none", background: "var(--primary)", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
                      {submitting
                        ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> Forwarding…</>
                        : <><FaPaperPlane size={13} color="#ffffff" /> Forward document</>}
                    </button>
                  </form>
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