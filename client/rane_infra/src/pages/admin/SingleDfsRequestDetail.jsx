import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getFileById,
  getAllUsers,
  forwardDocument,
  deleteDfsFile,
} from "../../services/dfsService";
import { CLOUDINARY_URL, UPLOAD_PRESET } from "../../store/keyStore";
import { Container, Row, Col } from "react-bootstrap";
import AdminHeader from "../../component/header/AdminHeader";
import moment from "moment";
import { MdAttachFile } from "react-icons/md";
import { useAuthStore } from "../../store/authStore";
import ReactDOM from "react-dom";
import {
  FaUserPlus,
  FaTasks,
  FaStickyNote,
  FaPaperPlane,
  FaFilePdf,
  FaUserCircle,
  FaTrash,
  FaBuilding,
  FaLayerGroup,
  FaInfoCircle,
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
  FaExternalLinkAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

/* ─── shared tokens ────────────────────────────────────────────────────────── */
const cardStyle = {
  background: "var(--card)",
  borderRadius: 14,
  border: "1px solid var(--border)",
  boxShadow: "0 2px 10px var(--shadow-color)",
  overflow: "hidden",
  marginBottom: 16,
};

const cardHeadStyle = {
  borderBottom: "1px solid var(--border)",
  padding: "12px 18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
};

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  display: "block",
  marginBottom: 3,
};

const C = {
  primary: "#6b3e2b",
  accent: "#b95a52",
  muted: "#8b7b74",
};

/* ─── reusable Btn ─────────────────────────────────────────────────────────── */
const Btn = ({ variant = "primary", loading, children, style, ...rest }) => {
  const palette = {
    primary: {
      bg: "var(--primary)",
      fg: "var(--primary-foreground)",
      bd: "none",
      hover: "var(--primary-hover)",
    },
    success: {
      bg: "var(--success)",
      fg: "var(--success-foreground)",
      bd: "none",
      hover: "var(--success-border)",
    },
    destructive: {
      bg: "var(--destructive)",
      fg: "var(--destructive-foreground)",
      bd: "none",
      hover: "#b03f30",
    },
    secondary: {
      bg: "var(--secondary)",
      fg: "var(--secondary-foreground)",
      bd: "1px solid var(--border)",
      hover: "var(--secondary-hover)",
    },
    outline: {
      bg: "transparent",
      fg: "var(--text-strong)",
      bd: "1px solid var(--border)",
      hover: "var(--secondary)",
    },
  }[variant] || {
    bg: "var(--primary)",
    fg: "var(--primary-foreground)",
    bd: "none",
    hover: "var(--primary-hover)",
  };

  const disabled = rest.disabled || loading;
  return (
    <button
      {...rest}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = palette.hover;
          e.currentTarget.style.boxShadow = "0 2px 8px var(--shadow-color)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = palette.bg;
          e.currentTarget.style.boxShadow = "none";
        }
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 8,
        border: palette.bd,
        background: disabled ? "var(--muted)" : palette.bg,
        color: disabled ? "var(--muted-foreground)" : palette.fg,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
        transition: "background .15s, box-shadow .15s",
        ...style,
      }}
    >
      {loading && (
        <span
          style={{
            width: 13,
            height: 13,
            border: "2px solid rgba(255,255,255,0.4)",
            borderTopColor: "currentColor",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 1s linear infinite",
          }}
        />
      )}
      {children}
    </button>
  );
};

/* ─── Section wrapper ──────────────────────────────────────────────────────── */
const Section = ({ icon: Icon, title, right, children }) => (
  <div style={cardStyle}>
    <div style={cardHeadStyle}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          fontWeight: 700,
          color: "var(--text-strong)",
        }}
      >
        <Icon size={15} color={C.accent} /> {title}
      </span>
      {right}
    </div>
    <div style={{ padding: "16px 18px" }}>{children}</div>
  </div>
);

/* ─── Field cell ───────────────────────────────────────────────────────────── */
const Field = ({ label, icon: Icon, children }) => (
  <div>
    <span
      style={{
        ...labelStyle,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      {Icon && <Icon size={11} color={C.muted} />} {label}
    </span>
    <div
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: "var(--text-strong)",
        wordBreak: "break-word",
      }}
    >
      {children}
    </div>
  </div>
);

/* ─── Status badge ─────────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  const meta =
    s === "pending"
      ? {
          bg: "var(--warning)",
          color: "var(--warning-foreground)",
          Icon: FaHourglassHalf,
        }
      : s === "approved"
      ? {
          bg: "var(--success)",
          color: "var(--success-foreground)",
          Icon: FaCheckCircle,
        }
      : s === "rejected"
      ? {
          bg: "var(--destructive-bg)",
          color: "var(--destructive)",
          Icon: FaExclamationTriangle,
        }
      : {
          bg: "var(--secondary)",
          color: "var(--secondary-foreground)",
          Icon: FaInfoCircle,
        };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: meta.bg,
        color: meta.color,
        textTransform: "capitalize",
      }}
    >
      <meta.Icon size={11} color={meta.color} /> {status}
    </span>
  );
};

/* ─── Action badge ─────────────────────────────────────────────────────────── */
const ActionBadge = ({ action }) => {
  const a = (action || "").toLowerCase();
  const bg =
    a === "approved"
      ? "var(--success)"
      : a === "rejected"
      ? "var(--destructive-bg)"
      : "var(--warning)";
  const color =
    a === "approved"
      ? "var(--success-foreground)"
      : a === "rejected"
      ? "var(--destructive)"
      : "var(--warning-foreground)";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: bg,
        color,
        textTransform: "capitalize",
      }}
    >
      {action}
    </span>
  );
};

/* ─── Avatar ───────────────────────────────────────────────────────────────── */
const Avatar = ({ src, name, size = 32 }) => {
  const [err, setErr] = useState(false);
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  if (!src || err) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "var(--secondary)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.38,
          fontWeight: 700,
          color: "var(--secondary-foreground)",
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setErr(true)}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        border: "1px solid var(--border)",
        flexShrink: 0,
      }}
    />
  );
};

/* ─── Portal Modal ─────────────────────────────────────────────────────────── */
const Modal = ({ show, onClose, busy, children }) => {
  if (!show) return null;
  return ReactDOM.createPortal(
    <div
      onClick={() => !busy && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "modalFade .18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          borderRadius: 14,
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
          overflow: "hidden",
          animation: "modalPop .2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

/* ─── Select / Input shared style ─────────────────────────────────────────── */
const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--input)",
  color: "var(--foreground)",
  fontSize: 13,
  outline: "none",
  transition: "border-color .15s, box-shadow .15s",
  appearance: "none",
  WebkitAppearance: "none",
};

/* ─── File type meta map ───────────────────────────────────────────────────── */
const EXT_META = {
  pdf:  { bg: "#fde8e6", color: "#c94a3a", icon: "FaFilePdf"  },
  doc:  { bg: "#dbeafe", color: "#1e40af", icon: "FaFileWord" },
  docx: { bg: "#dbeafe", color: "#1e40af", icon: "FaFileWord" },
  xlsx: { bg: "#dcfce7", color: "#15803d", icon: "FaFileExcel"},
  xls:  { bg: "#dcfce7", color: "#15803d", icon: "FaFileExcel"},
  png:  { bg: "#f3e8ff", color: "#7e22ce", icon: "FaFileImage"},
  jpg:  { bg: "#f3e8ff", color: "#7e22ce", icon: "FaFileImage"},
  jpeg: { bg: "#f3e8ff", color: "#7e22ce", icon: "FaFileImage"},
  zip:  { bg: "#fef9c3", color: "#a16207", icon: "FaFileArchive"},
};

function getExt(name) { return (name.split(".").pop() || "").toLowerCase(); }
function fmtSize(b) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

/* ─── Attachment Uploader ──────────────────────────────────────────────────── */
const AttachmentUploader = ({ files, setFiles }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = React.useRef(null);

  const addFiles = (raw) => {
    const incoming = Array.from(raw).map((f) => ({
      file: f,
      id: Math.random().toString(36).slice(2),
      status: f.size > 10 * 1024 * 1024 ? "error" : "ready",
    }));
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.file.name + f.file.size));
      return [...prev, ...incoming.filter((f) => !existingNames.has(f.file.name + f.file.size))];
    });
  };

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const FileTypeIcon = ({ name, size = 15 }) => {
    const meta = EXT_META[getExt(name)] || { bg: "var(--secondary)", color: "var(--secondary-foreground)", icon: "FaFile" };
    const icons = {
      FaFilePdf: () => (
        <svg viewBox="0 0 24 24" width={size} height={size} fill={meta.color}>
          <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
        </svg>
      ),
      FaFile: () => (
        <svg viewBox="0 0 24 24" width={size} height={size} fill={meta.color}>
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
        </svg>
      ),
    };
    const Icon = icons[meta.icon] || icons.FaFile;
    return (
      <div style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon />
      </div>
    );
  };

  const validCount = files.filter((f) => f.status === "ready").length;

  return (
    <div>
      {/* Label */}
      <div style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
        <MdAttachFile size={12} color={C.muted} />
        Attachment{" "}
        <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        aria-label="Drop files here or click to browse"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        style={{
          border: `1.5px dashed ${dragging ? C.accent : "var(--border)"}`,
          borderRadius: 10,
          background: dragging ? "#fde8e6" : "var(--muted)",
          padding: "24px 20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color .18s, background .18s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.zip"
          style={{ display: "none" }}
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
        />

        {/* Upload icon chip */}
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: "var(--card)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px",
        }}>
          <svg viewBox="0 0 24 24" width={22} height={22} fill={C.accent}>
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
          </svg>
        </div>

        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)", margin: "0 0 4px" }}>
          Drop files here or{" "}
          <span style={{ color: C.accent, textDecoration: "underline", textUnderlineOffset: 2 }}>browse</span>
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
          PDF, Word, Excel, images, ZIP · max 10 MB each
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {files.map((f) => {
            const isErr = f.status === "error";
            return (
              <div
                key={f.id}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "var(--card)",
                  border: `1px solid ${isErr ? "var(--destructive-border)" : "var(--border)"}`,
                  borderRadius: 8, padding: "9px 12px",
                }}
              >
                <FileTypeIcon name={f.file.name} />

                {/* Name + size */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: "var(--text-strong)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {f.file.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    {fmtSize(f.file.size)}
                  </div>
                </div>

                {/* Status pill */}
                {isErr ? (
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                    background: "var(--destructive-bg)", color: "var(--destructive)",
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    Too large
                  </span>
                ) : (
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                    background: "var(--success)", color: "var(--success-foreground)",
                    whiteSpace: "nowrap", flexShrink: 0,
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}>
                    <FaCheckCircle size={9} /> Ready
                  </span>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  aria-label={`Remove ${f.file.name}`}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", padding: 4, borderRadius: 6,
                    display: "flex", alignItems: "center", flexShrink: 0,
                    transition: "color .15s, background .15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--destructive)"; e.currentTarget.style.background = "var(--destructive-bg)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
                >
                  <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            );
          })}

          {/* Footer count */}
          {validCount > 0 && (
            <div style={{ fontSize: 12, color: "var(--text-muted)", paddingLeft: 2 }}>
              {validCount} file{validCount !== 1 ? "s" : ""} ready to attach
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Main component ───────────────────────────────────────────────────────── */
export default function SingleDfsRequestDetail() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const [forwardedTo, setForwardedTo] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fileData, userData] = await Promise.all([
          getFileById(id),
          getAllUsers(),
        ]);
        setFile(fileData);
        setUsers(userData);
        setStatus(fileData.status);
      } catch (error) {
        alert("❌ " + error.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleForward = async (e) => {
    e.preventDefault();
    if (!forwardedTo || !action || !note.trim() || !status) {
      alert("⚠️ Please fill all required fields.");
      return;
    }
    try {
      setSubmitting(true);
      const validFiles = attachmentFiles.filter((f) => f.status === "ready");
      let attachmentUrl = null;
      if (validFiles.length > 0) {
        const formData = new FormData();
        formData.append("file", validFiles[0].file);
        formData.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
        const uploadData = await res.json();
        if (!uploadData.secure_url) throw new Error("Cloud upload failed.");
        attachmentUrl = uploadData.secure_url;
      }
      await forwardDocument(id, {
        forwardedTo,
        action,
        note,
        status,
        attachment: attachmentUrl || undefined,
      });
      alert("✅ Document forwarded successfully.");
      const updated = await getFileById(id);
      setFile(updated);
      setForwardedTo("");
      setAction("");
      setNote("");
      setAttachmentFiles([]);
    } catch (err) {
      alert("❌ Failed to forward: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      setShowDeleteModal(false);
      await deleteDfsFile(file._id);
      alert("✅ File deleted successfully.");
      window.history.back();
    } catch (err) {
      alert("❌ Failed to delete file: " + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <>
        <AdminHeader />
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            background: "var(--background)",
            minHeight: "100vh",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 34,
              height: 34,
              border: "3px solid var(--border)",
              borderTopColor: C.accent,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <div
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginTop: 12,
            }}
          >
            Loading document details…
          </div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  if (!file) {
    return (
      <>
        <AdminHeader />
        <div
          style={{
            background: "var(--background)",
            minHeight: "100vh",
            padding: "40px 16px",
          }}
        >
          <div
            style={{
              maxWidth: 460,
              margin: "0 auto",
              textAlign: "center",
              padding: "40px 24px",
              background: "var(--muted)",
              border: "1px solid var(--border)",
              borderRadius: 14,
            }}
          >
            <FaFilePdf size={32} color={C.muted} style={{ marginBottom: 12 }} />
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--text-strong)",
                marginBottom: 4,
              }}
            >
              Document not found
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              It may have been deleted or the link is invalid.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader />

      <Container
        fluid
        className="py-4 my-3"
        style={{ background: "var(--background)" }}
      >
        {/* ── Page title bar ── */}
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <div style={cardHeadStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "var(--warning)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <FaFilePdf size={16} color={C.primary} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-strong)",
                    lineHeight: 1.2,
                  }}
                >
                  DFS Request Details
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                  Document File System · Review &amp; Forward
                </div>
              </div>
            </div>
            <StatusBadge status={file.status} />
          </div>
        </div>

        {/* ── Document overview ── */}
        <Section
          icon={FaFilePdf}
          title="Document Information"
          right={
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-strong)",
                background: "var(--muted)",
                padding: "5px 12px",
                borderRadius: 20,
              }}
            >
              <FaClock size={11} color={C.accent} />
              {moment(file.createdAt).format("DD MMM YYYY, hh:mm A")}
            </span>
          }
        >
          <Row className="g-3">
            <Col xs={12} md={8}>
              <span style={labelStyle}>Title</span>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--text-strong)",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <FaFilePdf size={14} color={C.accent} />
                {file.fileTitle}
              </div>
            </Col>
            <Col xs={6} md={2}>
              <Field label="Type" icon={FaLayerGroup}>
                {file.docType || "—"}
              </Field>
            </Col>
            <Col xs={6} md={2}>
              <Field label="Department" icon={FaBuilding}>
                {file.Department || "—"}
              </Field>
            </Col>
            <Col xs={12}>
              <span style={labelStyle}>Description</span>
              <div
                style={{
                  fontSize: 13.5,
                  color: "var(--text-muted)",
                  lineHeight: 1.55,
                  wordBreak: "break-word",
                }}
              >
                {file.description || "No description provided."}
              </div>
            </Col>
            <Col xs={12}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--primary-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--primary)")
                  }
                >
                  <FaExternalLinkAlt size={11} /> View PDF
                </a>

                {/* Uploader pill */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    padding: "5px 12px 5px 6px",
                  }}
                >
                  <Avatar
                    src={file.uploadedBy?.profile}
                    name={file.uploadedBy?.name}
                    size={24}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text-strong)",
                        lineHeight: 1.1,
                      }}
                    >
                      {file.uploadedBy?.name}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      Uploader
                    </div>
                  </div>
                </div>

                {/* Delete — only admin or owner */}
                {(user?.role === "admin" ||
                  user?._id === file.uploadedBy?._id) && (
                  <Btn
                    variant="destructive"
                    onClick={() => setShowDeleteModal(true)}
                    style={{ marginLeft: "auto" }}
                  >
                    <FaTrash size={11} /> Delete File
                  </Btn>
                )}
              </div>
            </Col>
          </Row>
        </Section>

        {/* ── Forwarding trail ── */}
        <Section
          icon={FaPaperPlane}
          title="Forwarding Trail"
          right={
            file.forwardingTrail?.length > 0 ? (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  background: "var(--muted)",
                  padding: "4px 12px",
                  borderRadius: 20,
                }}
              >
                {file.forwardingTrail.length}{" "}
                {file.forwardingTrail.length === 1 ? "entry" : "entries"}
              </span>
            ) : null
          }
        >
          {!file.forwardingTrail?.length ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              <FaInfoCircle size={14} color={C.muted} /> No forwarding history
              yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: 900,
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    {[
                      "#",
                      "Forwarded By",
                      "Forwarded To",
                      "Note",
                      "Action",
                      "Date & Time",
                      "Attachment",
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          borderBottom: "1px solid var(--border)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {file.forwardingTrail.map((trail, i) => (
                    <tr
                      key={i}
                      style={{
                        background:
                          i % 2 === 0 ? "transparent" : "var(--muted)",
                      }}
                    >
                      {/* # */}
                      <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: "var(--secondary)",
                            color: "var(--secondary-foreground)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {i + 1}
                        </div>
                      </td>

                      {/* Forwarded By */}
                      <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                        <div
                          style={{ display: "flex", alignItems: "center", gap: 8 }}
                        >
                          <Avatar
                            src={trail.forwardedBy?.profile}
                            name={trail.forwardedBy?.name}
                            size={28}
                          />
                          <span
                            style={{
                              fontWeight: 600,
                              color: "var(--text-strong)",
                            }}
                          >
                            {trail.forwardedBy?.name || "Unknown"}
                          </span>
                        </div>
                      </td>

                      {/* Forwarded To */}
                      <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                        <div
                          style={{ display: "flex", alignItems: "center", gap: 8 }}
                        >
                          <Avatar
                            src={trail.forwardedTo?.profile}
                            name={trail.forwardedTo?.name}
                            size={28}
                          />
                          <span
                            style={{
                              fontWeight: 600,
                              color: "var(--text-strong)",
                            }}
                          >
                            {trail.forwardedTo?.name || "Unknown"}
                          </span>
                        </div>
                      </td>

                      {/* Note */}
                      <td
                        style={{
                          padding: "10px 12px",
                          maxWidth: 240,
                          whiteSpace: "normal",
                          color: "var(--foreground)",
                          lineHeight: 1.45,
                          fontSize: 12.5,
                        }}
                      >
                        {trail.note}
                      </td>

                      {/* Action */}
                      <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                        <ActionBadge action={trail.action} />
                      </td>

                      {/* Date */}
                      <td
                        style={{
                          padding: "10px 12px",
                          whiteSpace: "nowrap",
                          color: "var(--text-muted)",
                          fontSize: 12,
                        }}
                      >
                        <FaClock
                          size={11}
                          style={{ marginRight: 5, verticalAlign: -1 }}
                        />
                        {moment(trail.timestamp).format("DD MMM YYYY, hh:mm A")}
                      </td>

                      {/* Attachment */}
                      <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                        {trail.attachment ? (
                          <a
                            href={trail.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "5px 11px",
                              borderRadius: 7,
                              border: "1px solid var(--border)",
                              background: "var(--secondary)",
                              color: "var(--secondary-foreground)",
                              fontSize: 12,
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            <MdAttachFile size={13} /> View
                          </a>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* ── Forward document form ── */}
        <Section icon={FaPaperPlane} title="Forward This Document">
          <form onSubmit={handleForward}>
            <Row className="g-3 mb-3">
              {/* Forward To */}
              <Col xs={12} md={4}>
                <label
                  style={{
                    ...labelStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <FaUserPlus size={11} color={C.muted} /> Forward To
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={forwardedTo}
                    onChange={(e) => setForwardedTo(e.target.value)}
                    required
                    style={inputStyle}
                  >
                    <option value="">— Select user —</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                    <option value={file.uploadedBy?._id}>
                      {file.uploadedBy?.name} (File Owner)
                    </option>
                  </select>
                </div>
              </Col>

              {/* Action */}
              <Col xs={12} md={4}>
                <label
                  style={{
                    ...labelStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <FaTasks size={11} color={C.muted} /> Your Action
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  required
                  style={inputStyle}
                >
                  <option value="">— What you did —</option>
                  <option value="forwarded">Forwarded</option>
                  <option value="viewed">Viewed</option>
                  <option value="commented">Commented</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </Col>

              {/* Status */}
              <Col xs={12} md={4}>
                <label
                  style={{
                    ...labelStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <FaInfoCircle size={11} color={C.muted} /> File Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  style={inputStyle}
                >
                  <option value="">— Overall status —</option>
                  <option value="pending">Pending</option>
                  <option value="in-review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </Col>
            </Row>

            {/* Note */}
            <Row className="g-3 mb-3">
              <Col xs={12}>
                <label
                  style={{
                    ...labelStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <FaStickyNote size={11} color={C.muted} /> Note
                </label>
                <textarea
                  rows={3}
                  placeholder="Write a short note for the receiver…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  required
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    lineHeight: 1.55,
                    fontFamily: "inherit",
                  }}
                />
              </Col>
            </Row>

            {/* Attachment */}
            <Row className="g-3 mb-4">
              <Col xs={12}>
                <AttachmentUploader
                  files={attachmentFiles}
                  setFiles={setAttachmentFiles}
                />
              </Col>
            </Row>

            {/* Submit */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Btn type="submit" variant="primary" loading={submitting}>
                {!submitting && <FaPaperPlane size={12} />}
                {submitting ? "Forwarding…" : "Forward Document"}
              </Btn>
            </div>
          </form>
        </Section>
      </Container>

      {/* ── Delete confirm modal ── */}
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        busy={deleteLoading}
      >
        <div style={{ textAlign: "center", padding: "24px 24px 16px" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--destructive-bg)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <FaExclamationTriangle size={24} color="var(--destructive)" />
          </div>
          <h5
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "var(--text-strong)",
              margin: "0 0 8px",
            }}
          >
            Delete document
          </h5>
          <p
            style={{
              fontSize: 13.5,
              color: "var(--text-muted)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Permanently delete{" "}
            <strong style={{ color: "var(--text-strong)" }}>
              {file?.fileTitle}
            </strong>
            ? This also removes all forwarding history and cannot be undone.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
          <Btn
            variant="secondary"
            disabled={deleteLoading}
            onClick={() => setShowDeleteModal(false)}
            style={{ flex: 1 }}
          >
            Cancel
          </Btn>
          <Btn
            variant="destructive"
            loading={deleteLoading}
            onClick={handleDeleteConfirm}
            style={{ flex: 1 }}
          >
            {!deleteLoading && <FaTrash size={11} />}
            {deleteLoading ? "Deleting…" : "Delete"}
          </Btn>
        </div>
      </Modal>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes modalFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPop { from { opacity: 0; transform: translateY(8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        select option { background: var(--card); color: var(--foreground); }
      `}</style>
    </>
  );
}