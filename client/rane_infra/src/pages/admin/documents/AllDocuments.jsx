import React, { useEffect, useMemo, useState } from "react";
import {
  FiSearch, FiX, FiFilter, FiChevronDown, FiArrowDown, FiArrowUp, FiRotateCcw, FiTag, FiCalendar,
  FiExternalLink, FiRefreshCw, FiInbox,
} from "react-icons/fi";
import {
  FaFileAlt, FaChevronDown, FaChevronUp, FaExclamationTriangle, FaUserShield, FaUserTie, FaUser,
  FaRegCopy, FaCheckCircle, FaUsers, FaQuestionCircle,
} from "react-icons/fa";
import AdminHeader from "../../../components/layout/header/AdminHeader";
import ClientHeader from "../../../components/layout/header/ClientHeader";
import StaffHeader from "../../../components/layout/header/StaffHeader";
import { backend_url } from "../../../store/keyStore";
import { useAuthStore } from "../../../store/authStore";

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = { primary: "#6b3e2b", accent: "#b95a52", destructive: "#c94a3a", muted: "#8b7b74", info: "#1e40af" };

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
  textTransform: "uppercase", letterSpacing: "0.05em",
};
const thStyle = {
  padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700,
  color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap",
};
const iconBtn = {
  width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)",
  cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0, textDecoration: "none",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");
const prettify = (t) => (typeof t === "string" && t ? t.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—");
const uploadedAt = (d) => d.uploadDate || d.createdAt;
const roleOf = (p) => (p?.role || "").toLowerCase() || "unknown";

const PERIODS = [
  { id: "all", label: "Any date", days: null },
  { id: "7", label: "Last 7 days", days: 7 },
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "90", label: "Last 90 days", days: 90 },
  { id: "year", label: "This year", days: "year" },
];

// Document statuses: pending, accepted, rejected
const statusMeta = (status) => {
  switch (status) {
    case "approved":
    case "accepted":  return { bg: "var(--success)", color: "var(--success-foreground)" };
    case "rejected":  return { bg: "#fde8e6", color: C.destructive };
    case "pending":   return { bg: "var(--warning)", color: "var(--warning-foreground)" };
    default:          return { bg: "var(--muted)", color: "var(--text-muted)" };
  }
};

const StatusBadge = ({ status }) => {
  const m = statusMeta(status);
  return (
    <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {prettify(status)}
    </span>
  );
};

const roleMeta = (role) => {
  switch (role) {
    case "admin":  return { label: "Admin", bg: "#f3e6df", color: "#6b3e2b", Icon: FaUserShield };
    case "staff":  return { label: "Staff", bg: "#dbeafe", color: C.info, Icon: FaUserTie };
    case "client": return { label: "Client", bg: "var(--success)", color: "var(--success-foreground)", Icon: FaUser };
    default:       return { label: "Unknown", bg: "var(--muted)", color: "var(--text-muted)", Icon: FaQuestionCircle };
  }
};

const RoleBadge = ({ role }) => {
  const { label, bg, color, Icon } = roleMeta(role);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: bg, color }}>
      <Icon size={9} color={color} /> {label}
    </span>
  );
};

// ── Avatar with initials fallback ────────────────────────────────────────────
const Avatar = ({ src, name, size = 30 }) => {
  const [err, setErr] = useState(false);
  const initials = (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  if (!src || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%", background: "var(--secondary)", border: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700,
        color: "var(--secondary-foreground)", flexShrink: 0,
      }}>{initials}</div>
    );
  }
  return <img src={src} alt={name} onError={() => setErr(true)} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }} />;
};

// Person cell: avatar + name + role badge
const Person = ({ person }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
    <Avatar src={person?.profile} name={person?.name} />
    <div style={{ minWidth: 0 }}>
      <div style={{ fontWeight: 600, color: "var(--text-strong)", lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>
        {person?.name || "—"}
      </div>
      <div style={{ marginTop: 3 }}><RoleBadge role={roleOf(person)} /></div>
    </div>
  </div>
);

const Field = ({ label, children, mono, full }) => (
  <div style={{ minWidth: 0, gridColumn: full ? "1 / -1" : "auto" }}>
    <div style={labelStyle}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 3, color: "var(--text-strong)", wordBreak: "break-word", fontFamily: mono ? "monospace" : "inherit" }}>
      {children === 0 || children ? children : <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>—</span>}
    </div>
  </div>
);

const Group = ({ icon: Icon, title, right, children }) => (
  <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", minWidth: 0 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: "var(--text-strong)" }}>
        <Icon size={12} color={C.accent} /> {title}
      </span>
      {right}
    </div>
    {children}
  </div>
);

export default function AllDocuments() {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");       // document type (LOA, SalesOrder …)
  const [ownerRole, setOwnerRole] = useState("all");         // role of the user the document is for
  const [uploaderRole, setUploaderRole] = useState("all");
  const [period, setPeriod] = useState("all");
  const [sortKey, setSortKey] = useState("uploaded-desc");

  const [expanded, setExpanded] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const isAdmin = user?.role === "admin";

  const getApiEndpoint = () => {
    switch (user?.role) {
      case "admin":  return "/admin-get-all-documents";
      case "client": return "/client-get-all-documents";
      case "staff":  return "/staff-get-all-documents";
      default:       return "/admin-get-all-documents";
    }
  };

  const getHeaderComponent = () => {
    switch (user?.role) {
      case "admin":  return <AdminHeader />;
      case "client": return <ClientHeader />;
      case "staff":  return <StaffHeader />;
      default:       return <AdminHeader />;
    }
  };

  const fetchDocuments = () => {
    if (!user || !user.role) return;
    setLoading(true);
    fetch(`${backend_url}${getApiEndpoint()}`)
      .then((res) => res.json())
      .then((data) => setDocuments(data.success ? (data.documents || []) : []))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user && user.role) fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleExpanded = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const copyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch { /* clipboard unavailable */ }
  };

  // ── Option lists + counts ──
  const typeOptions = useMemo(() => Array.from(new Set(documents.map((d) => d.documentType).filter(Boolean))).sort(), [documents]);
  const statusOptions = useMemo(() => Array.from(new Set(documents.map((d) => d.status).filter(Boolean))).sort(), [documents]);

  const counts = useMemo(() => {
    const c = { total: documents.length, pending: 0, accepted: 0, rejected: 0, admin: 0, staff: 0, client: 0, unknown: 0 };
    documents.forEach((d) => {
      if (d.status === "pending") c.pending++;
      else if (d.status === "accepted") c.accepted++;
      else if (d.status === "rejected") c.rejected++;
      const r = roleOf(d.userId);
      c[["admin", "staff", "client"].includes(r) ? r : "unknown"]++;
    });
    return c;
  }, [documents]);

  // ── Search + filters + sort (all client side) ──
  const filteredDocuments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const p = PERIODS.find((x) => x.id === period);
    let since = null;
    if (p?.days === "year") since = new Date(new Date().getFullYear(), 0, 1);
    else if (p?.days) since = new Date(Date.now() - p.days * 24 * 60 * 60 * 1000);

    return documents
      .filter((d) => {
        if (statusFilter !== "all" && d.status !== statusFilter) return false;
        if (typeFilter !== "all" && d.documentType !== typeFilter) return false;
        if (ownerRole !== "all" && roleOf(d.userId) !== ownerRole) return false;
        if (uploaderRole !== "all" && roleOf(d.uploadedBy) !== uploaderRole) return false;
        if (since && new Date(uploadedAt(d)) < since) return false;
        if (!term) return true;
        return [
          d.title, d.documentType, d.documentCode, d.remark, d._id,
          d.uploadedBy?.name, d.uploadedBy?.email, d.uploadedBy?.cid,
          d.userId?.name, d.userId?.email, d.userId?.cid,
        ].some((v) => (v || "").toString().toLowerCase().includes(term));
      })
      .sort((a, b) => {
        switch (sortKey) {
          case "uploaded-asc": return new Date(uploadedAt(a)) - new Date(uploadedAt(b));
          case "updated-desc": return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
          case "issued-desc":  return new Date(b.dateOfIssue || 0) - new Date(a.dateOfIssue || 0);
          case "issued-asc":   return new Date(a.dateOfIssue || 0) - new Date(b.dateOfIssue || 0);
          case "code-asc":     return (a.documentCode || "").localeCompare(b.documentCode || "");
          case "owner-asc":    return (a.userId?.name || "").localeCompare(b.userId?.name || "");
          case "status-asc":   return (a.status || "").localeCompare(b.status || "");
          default:             return new Date(uploadedAt(b)) - new Date(uploadedAt(a));
        }
      });
  }, [documents, searchTerm, statusFilter, typeFilter, ownerRole, uploaderRole, period, sortKey]);

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || typeFilter !== "all"
    || ownerRole !== "all" || uploaderRole !== "all" || period !== "all" || sortKey !== "uploaded-desc";
  const resetFilters = () => {
    setSearchTerm(""); setStatusFilter("all"); setTypeFilter("all");
    setOwnerRole("all"); setUploaderRole("all"); setPeriod("all"); setSortKey("uploaded-desc");
  };

  // ── Expanded details ──
  const renderPerson = (label, p) => (
    <div style={{ minWidth: 0 }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-strong)" }}>{p?.name || "—"}</span>
        <RoleBadge role={roleOf(p)} />
      </div>
      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 3, wordBreak: "break-all" }}>
        {p?.email || ""}{p?.cid && p.cid !== "N/A" ? ` · ${p.cid}` : ""}
      </div>
    </div>
  );

  const renderDetails = (d) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
      <Group
        icon={FaFileAlt}
        title="Document details"
        right={d.documentLink ? (
          <a href={d.documentLink} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: C.accent, textDecoration: "none" }}>
            Open file <FiExternalLink size={12} />
          </a>
        ) : null}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px 14px" }}>
          <Field label="Document ID" mono full>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {d._id}
              <button type="button" onClick={() => copyId(d._id)} title="Copy ID" style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0, display: "inline-flex" }}>
                {copiedId === d._id ? <FaCheckCircle size={12} color="#225b31" /> : <FaRegCopy size={12} color={C.muted} />}
              </button>
            </span>
          </Field>
          <Field label="Document type">{d.documentType}</Field>
          <Field label="Document code" mono>{d.documentCode}</Field>
          <Field label="Status"><StatusBadge status={d.status} /></Field>
          <Field label="Date of issue">{fmtDate(d.dateOfIssue)}</Field>
          <Field label="Uploaded on">{fmtDateTime(uploadedAt(d))}</Field>
          <Field label="Last updated">{fmtDateTime(d.updatedAt)}</Field>
          <Field label="Status changed">{d.statusUpdatedAt ? fmtDateTime(d.statusUpdatedAt) : null}</Field>
          <Field label="Remark" full>{d.remark}</Field>
        </div>
      </Group>

      <Group icon={FaUsers} title="People">
        <div style={{ display: "grid", gap: 14 }}>
          {renderPerson("Uploaded by", d.uploadedBy)}
          {renderPerson("Document for", d.userId)}
        </div>
      </Group>
    </div>
  );

  const renderActions = (d, open) => (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }} onClick={(e) => e.stopPropagation()}>
      <button type="button" style={iconBtn} title={open ? "Hide details" : "Show details"} aria-label="Toggle details" onClick={() => toggleExpanded(d._id)}>
        {open ? <FaChevronUp size={12} color={C.primary} /> : <FaChevronDown size={12} color={C.primary} />}
      </button>
      {d.documentLink && (
        <a href={d.documentLink} target="_blank" rel="noopener noreferrer" style={iconBtn} title="Open file" aria-label="Open file">
          <FiExternalLink size={14} color={C.primary} />
        </a>
      )}
    </div>
  );

  return (
    <>
      {getHeaderComponent()}

      <div style={{ background: "var(--background)", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--foreground)", padding: "0 2px" }}>
        <div style={{ background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)", boxShadow: "0 2px 10px var(--shadow-color)", overflow: "hidden", marginBottom: 16 }}>

          {/* ── Title bar ── */}
          <div style={{ borderBottom: "1px solid var(--border)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: isAdmin ? "#fde8e6" : "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {isAdmin ? <FaExclamationTriangle size={15} color={C.destructive} /> : <FaFileAlt size={15} color={C.primary} />}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>
                  {isAdmin ? "All Documents · Danger Zone" : "All Documents"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                  Documents uploaded for users (LOA, orders, payments and more). Open a row for the full details.
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button type="button" onClick={fetchDocuments} disabled={loading}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--secondary)", color: "var(--secondary-foreground)", fontSize: 12, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
                <FiRefreshCw size={12} style={loading ? { animation: "spin 1s linear infinite" } : undefined} /> Refresh
              </button>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", background: "var(--muted)", padding: "5px 12px", borderRadius: 20 }}>
                {documents.length} total
              </span>
            </div>
          </div>

          <div style={{ padding: "16px 20px" }}>

            {loading || !user ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <span style={{ display: "inline-block", width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10 }}>{loading ? "Loading documents…" : "Waiting for authentication…"}</div>
              </div>
            ) : documents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 12 }}>
                <FiInbox size={30} color={C.muted} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>No documents yet</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Documents will appear here once they are uploaded for a user.</div>
              </div>
            ) : (
              <>
                {/* ── Summary chips: status, then who the document is for ── */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  {[
                    { key: "all", label: "All", value: counts.total, bg: "var(--secondary)", color: C.primary },
                    { key: "pending", label: "Pending", value: counts.pending, bg: "var(--warning)", color: "var(--warning-foreground)" },
                    { key: "accepted", label: "Accepted", value: counts.accepted, bg: "var(--success)", color: "var(--success-foreground)" },
                    { key: "rejected", label: "Rejected", value: counts.rejected, bg: "#fde8e6", color: C.destructive },
                  ].map(({ key, label, value, bg, color }) => {
                    const active = statusFilter === key;
                    return (
                      <button key={key} type="button" onClick={() => setStatusFilter(key)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 999, cursor: "pointer", background: bg, color, fontSize: 12.5, fontWeight: 700, border: `1px solid ${active ? color : "var(--border)"}`, boxShadow: active ? `0 0 0 2px ${color}33` : "none" }}>
                        {label}
                        <span style={{ background: "rgba(255,255,255,0.6)", borderRadius: 20, padding: "1px 8px", fontSize: 11 }}>{value}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ ...labelStyle, marginRight: 2 }}>Document for</span>
                  {["admin", "staff", "client"].map((role) => {
                    const { label, bg, color, Icon } = roleMeta(role);
                    const active = ownerRole === role;
                    return (
                      <button key={role} type="button" onClick={() => setOwnerRole(active ? "all" : role)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 13px", borderRadius: 999, cursor: "pointer", background: bg, color, fontSize: 12, fontWeight: 700, border: `1px solid ${active ? color : "var(--border)"}`, boxShadow: active ? `0 0 0 2px ${color}33` : "none" }}>
                        <Icon size={10} color={color} /> {label}
                        <span style={{ background: "rgba(255,255,255,0.6)", borderRadius: 20, padding: "1px 8px", fontSize: 11 }}>{counts[role]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* ── Search / filter / sort bar ── */}
                <div className="ld-toolbar">
                  <div className="ld-search">
                    <FiSearch size={15} color={C.muted} className="ld-icon-left" />
                    <input type="text" placeholder="Search type, code, remark, people or document ID…" value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)} className="ld-ctl" style={{ paddingLeft: 36, paddingRight: searchTerm ? 34 : 12 }} />
                    {searchTerm && (
                      <button type="button" aria-label="Clear search" className="ld-clear" onClick={() => setSearchTerm("")}><FiX size={14} color={C.muted} /></button>
                    )}
                  </div>

                  <div className="ld-select">
                    <FiFilter size={14} color={C.muted} className="ld-icon-left" />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="ld-ctl" aria-label="Filter by status">
                      <option value="all">All statuses</option>
                      {statusOptions.map((s) => <option key={s} value={s}>{prettify(s)}</option>)}
                    </select>
                    <FiChevronDown size={14} color={C.muted} className="ld-icon-right" />
                  </div>

                  <div className="ld-select">
                    <FiTag size={14} color={C.muted} className="ld-icon-left" />
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="ld-ctl" aria-label="Filter by document type">
                      <option value="all">All document types</option>
                      {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <FiChevronDown size={14} color={C.muted} className="ld-icon-right" />
                  </div>

                  <div className="ld-select">
                    <FaUsers size={13} color={C.muted} className="ld-icon-left" />
                    <select value={uploaderRole} onChange={(e) => setUploaderRole(e.target.value)} className="ld-ctl" aria-label="Filter by uploader role">
                      <option value="all">Any uploader</option>
                      <option value="admin">Uploaded by Admin</option>
                      <option value="staff">Uploaded by Staff</option>
                      <option value="client">Uploaded by Client</option>
                    </select>
                    <FiChevronDown size={14} color={C.muted} className="ld-icon-right" />
                  </div>

                  <div className="ld-select">
                    <FiCalendar size={14} color={C.muted} className="ld-icon-left" />
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="ld-ctl" aria-label="Filter by upload date">
                      {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                    <FiChevronDown size={14} color={C.muted} className="ld-icon-right" />
                  </div>

                  <div className="ld-select">
                    {["uploaded-asc", "issued-asc", "code-asc", "owner-asc", "status-asc"].includes(sortKey)
                      ? <FiArrowUp size={14} color={C.muted} className="ld-icon-left" />
                      : <FiArrowDown size={14} color={C.muted} className="ld-icon-left" />}
                    <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="ld-ctl" aria-label="Sort documents">
                      <option value="uploaded-desc">Uploaded: Newest</option>
                      <option value="uploaded-asc">Uploaded: Oldest</option>
                      <option value="updated-desc">Recently updated</option>
                      <option value="issued-desc">Date of issue: Newest</option>
                      <option value="issued-asc">Date of issue: Oldest</option>
                      <option value="code-asc">Code: A to Z</option>
                      <option value="owner-asc">Document for: A to Z</option>
                      <option value="status-asc">Status: A to Z</option>
                    </select>
                    <FiChevronDown size={14} color={C.muted} className="ld-icon-right" />
                  </div>

                  {hasActiveFilters && (
                    <button type="button" className="ld-reset" onClick={resetFilters}><FiRotateCcw size={13} /> Reset</button>
                  )}
                  <div className="ld-count">Showing <strong>{filteredDocuments.length}</strong> of <strong>{documents.length}</strong> documents</div>
                </div>

                {/* ── Empty (after filtering) ── */}
                {filteredDocuments.length === 0 && (
                  <div style={{ textAlign: "center", padding: "44px 20px", background: "var(--muted)", borderRadius: 12, border: "1px solid var(--border)" }}>
                    <FiInbox size={28} color={C.muted} style={{ marginBottom: 10 }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>No matching documents</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Try adjusting your search or filters.</div>
                  </div>
                )}

                {/* ── Desktop table ── */}
                {filteredDocuments.length > 0 && (
                  <div className="d-none d-md-block" style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", minWidth: 960, borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "var(--muted)", borderBottom: "2px solid var(--border)" }}>
                          {["#", "Document", "Status", "Uploaded by", "Document for", "Issued", "Uploaded", "Actions"].map((h, i) => (
                            <th key={h} style={{ ...thStyle, textAlign: i === 7 ? "right" : "left" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDocuments.map((d, index) => {
                          const open = !!expanded[d._id];
                          return (
                            <React.Fragment key={d._id || index}>
                              <tr onClick={() => toggleExpanded(d._id)}
                                style={{ borderBottom: open ? "none" : "1px solid var(--border)", cursor: "pointer", background: open ? "var(--muted)" : "transparent", transition: "background .15s" }}
                                onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = "var(--muted)"; }}
                                onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = "transparent"; }}>
                                <td style={{ padding: "11px 14px" }}>
                                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: "var(--secondary)", color: "var(--secondary-foreground)", fontWeight: 700, fontSize: 11.5 }}>{index + 1}</span>
                                </td>
                                <td style={{ padding: "11px 14px", maxWidth: 260 }}>
                                  <div style={{ fontWeight: 600, color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={d.title}>{d.title || "—"}</div>
                                  {d.documentType && (
                                    <span style={{ display: "inline-block", marginTop: 4, background: "var(--secondary)", color: "var(--secondary-foreground)", fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20 }}>{d.documentType}</span>
                                  )}
                                </td>
                                <td style={{ padding: "11px 14px" }}><StatusBadge status={d.status} /></td>
                                <td style={{ padding: "11px 14px" }}><Person person={d.uploadedBy} /></td>
                                <td style={{ padding: "11px 14px" }}><Person person={d.userId} /></td>
                                <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmtDate(d.dateOfIssue)}</td>
                                <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmtDate(uploadedAt(d))}</td>
                                <td style={{ padding: "11px 14px" }}>{renderActions(d, open)}</td>
                              </tr>
                              {open && (
                                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
                                  <td colSpan={8} style={{ padding: "4px 14px 16px" }}>{renderDetails(d)}</td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ── Mobile cards ── */}
                {filteredDocuments.length > 0 && (
                  <div className="d-md-none">
                    {filteredDocuments.map((d, index) => {
                      const open = !!expanded[d._id];
                      return (
                        <div key={d._id || index} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", marginBottom: 12, boxShadow: "0 2px 8px var(--shadow-color)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginBottom: 3 }}>#{index + 1}</div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-strong)", lineHeight: 1.25, wordBreak: "break-word" }}>{d.title || "—"}</div>
                              {d.documentType && <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{d.documentType}</div>}
                            </div>
                            <StatusBadge status={d.status} />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px", marginBottom: 12 }}>
                            <div><div style={{ ...labelStyle, marginBottom: 3 }}>Uploaded by</div><Person person={d.uploadedBy} /></div>
                            <div><div style={{ ...labelStyle, marginBottom: 3 }}>Document for</div><Person person={d.userId} /></div>
                            <div><div style={{ ...labelStyle, marginBottom: 2 }}>Issued</div><div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-strong)" }}>{fmtDate(d.dateOfIssue)}</div></div>
                            <div><div style={{ ...labelStyle, marginBottom: 2 }}>Uploaded</div><div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-strong)" }}>{fmtDate(uploadedAt(d))}</div></div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button type="button" onClick={() => toggleExpanded(d._id)}
                              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 9, borderRadius: 8, border: "1px solid var(--border)", background: "var(--secondary)", color: "var(--secondary-foreground)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                              {open ? <>Hide details <FaChevronUp size={11} /></> : <>More details <FaChevronDown size={11} /></>}
                            </button>
                            {d.documentLink && (
                              <a href={d.documentLink} target="_blank" rel="noopener noreferrer"
                                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: C.primary, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                                <FiExternalLink size={13} /> File
                              </a>
                            )}
                          </div>
                          {open && <div style={{ marginTop: 14 }}>{renderDetails(d)}</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: var(--input); color: var(--foreground); }
        .ld-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 10px 0 14px; margin-bottom: 6px; border-bottom: 1px solid var(--border); }
        .ld-search { position: relative; flex: 1 1 280px; min-width: 200px; }
        .ld-select { position: relative; flex: 0 1 175px; min-width: 150px; }
        .ld-ctl { width: 100%; height: 38px; box-sizing: border-box; border: 1px solid var(--border); border-radius: 10px; background: var(--input); color: var(--foreground); font-size: 13px; outline: none; transition: border-color .15s, box-shadow .15s; }
        .ld-select .ld-ctl { appearance: none; -webkit-appearance: none; cursor: pointer; padding: 0 32px 0 34px; }
        .ld-ctl:hover { border-color: var(--muted-foreground, #8b7b74); }
        .ld-ctl:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(107, 62, 43, 0.14); }
        .ld-icon-left, .ld-icon-right { position: absolute; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .ld-icon-left { left: 12px; }
        .ld-icon-right { right: 11px; }
        .ld-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); width: 24px; height: 24px; border: none; border-radius: 50%; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .ld-clear:hover { background: var(--muted); }
        .ld-reset { display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 12px; border-radius: 10px; border: 1px dashed var(--border); background: transparent; color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background .15s, color .15s; }
        .ld-reset:hover { background: var(--secondary); color: var(--secondary-foreground); }
        .ld-count { margin-left: auto; font-size: 12px; color: var(--text-muted); white-space: nowrap; }
        .ld-count strong { color: var(--text-strong); }
        @media (max-width: 640px) {
          .ld-search, .ld-select { flex: 1 1 100%; }
          .ld-count { margin-left: 0; width: 100%; }
        }
      `}</style>
    </>
  );
}
