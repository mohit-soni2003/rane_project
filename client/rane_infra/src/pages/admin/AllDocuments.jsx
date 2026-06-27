import React, { useEffect, useState } from "react";
import {
  FiFileText, FiSearch, FiX, FiRefreshCw, FiClock, FiExternalLink,
  FiInbox, FiLayers, FiArrowRight, FiUser,
} from "react-icons/fi";
import moment from "moment";
import AdminHeader from "../../component/header/AdminHeader";
import ClientHeader from "../../component/header/ClientHeader";
import StaffHeader from "../../component/header/StaffHeader";
import { backend_url } from "../../store/keyStore";
import { useAuthStore } from "../../store/authStore";

// ── Status styling (palette tokens only) ─────────────────────────────────────
const statusMeta = (status) => {
  switch (status) {
    case "approved":
    case "accepted":  return { bg: "var(--success)", color: "var(--success-foreground)", label: status };
    case "rejected":  return { bg: "var(--destructive)", color: "var(--destructive-foreground)", label: "rejected" };
    case "in-review": return { bg: "var(--warning)", color: "var(--warning-foreground)", label: "in-review" };
    case "pending":   return { bg: "var(--secondary)", color: "var(--secondary-foreground)", label: "pending" };
    default:          return { bg: "var(--muted)", color: "var(--text-muted)", label: status || "—" };
  }
};

const StatusBadge = ({ status }) => {
  const m = statusMeta(status);
  return (
    <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", textTransform: "capitalize" }}>
      {m.label}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const isDfs = type === "dfs";
  return (
    <span style={{
      background: isDfs ? "var(--warning)" : "var(--secondary)",
      color: isDfs ? "var(--warning-foreground)" : "var(--secondary-foreground)",
      fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 6, whiteSpace: "nowrap",
    }}>
      {isDfs ? "DFS" : "Regular"}
    </span>
  );
};

// ── Avatar with initials fallback ────────────────────────────────────────────
const Avatar = ({ src, name, size = 28 }) => {
  const [err, setErr] = useState(false);
  const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  if (!src || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%", background: "var(--secondary)",
        border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.38, fontWeight: 700, color: "var(--secondary-foreground)", flexShrink: 0,
      }}>
        {initials}
      </div>
    );
  }
  return (
    <img src={src} alt={name} onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }} />
  );
};

// ── Person cell (avatar + name + role) ───────────────────────────────────────
const Person = ({ person }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <Avatar src={person?.profile} name={person?.name} />
    <div style={{ minWidth: 0 }}>
      <div style={{ fontWeight: 600, color: "var(--text-strong)", whiteSpace: "nowrap" }}>{person?.name || "—"}</div>
      {person?.role && <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "capitalize" }}>{person.role}</div>}
    </div>
  </div>
);

const fmtDate = (d) => d ? moment(d).format("DD MMM YYYY, hh:mm A") : "—";

export default function AllDocuments() {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [stats, setStats] = useState({ total: 0, regularCount: 0, dfsCount: 0 });

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
      .then((data) => {
        if (data.success) {
          setDocuments(data.documents || []);
          setStats({
            total: data.total || 0,
            regularCount: data.regularCount || 0,
            dfsCount: data.dfsCount || 0,
          });
        } else {
          setDocuments([]);
        }
      })
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user && user.role) fetchDocuments();
  }, [user]);

  const filteredDocuments = documents.filter((doc) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      doc.title?.toLowerCase().includes(term) ||
      doc.documentType?.toLowerCase().includes(term) ||
      doc.description?.toLowerCase().includes(term) ||
      doc.uploadedBy?.name?.toLowerCase().includes(term) ||
      doc.userId?.name?.toLowerCase().includes(term);
    const matchesType = filterType === "all" || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const resetFilters = () => { setSearchTerm(""); setFilterType("all"); };

  // ── Shared styles ──
  const btnStyle = {
    display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 7,
    border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)",
    fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  };
  const ctrlStyle = {
    width: "100%", border: "1px solid var(--border)", borderRadius: 7, padding: "8px 12px",
    fontSize: 13, color: "var(--foreground)", background: "var(--input)", outline: "none", boxSizing: "border-box",
  };
  const thStyle = (align = "left") => ({
    padding: "10px 12px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
    textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border)",
    background: "var(--muted)", textAlign: align, whiteSpace: "nowrap",
  });
  const tdStyle = { padding: "11px 12px", fontSize: 13, color: "var(--foreground)", borderBottom: "1px solid var(--border)", verticalAlign: "middle" };
  const linkBtn = { ...btnStyle, padding: "5px 10px", fontSize: 11.5, textDecoration: "none" };

  return (
    <>
      {getHeaderComponent()}

      <div style={{ background: "var(--background)", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--foreground)", padding: "0 2px" }}>

        {/* ── Lifted page card ── */}
        <div style={{ background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)", boxShadow: "0 2px 10px var(--shadow-color)", overflow: "hidden", marginBottom: 16 }}>

          {/* ── Title bar ── */}
          <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FiFileText size={16} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>All Documents</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Regular and DFS documents across the system</div>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "16px 20px" }}>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Total Documents", value: stats.total, sub: "All document types", icon: <FiFileText size={15} /> },
                { label: "Regular", value: stats.regularCount, sub: "Standard uploads", icon: <FiInbox size={15} /> },
                { label: "DFS", value: stats.dfsCount, sub: "Document file system", icon: <FiLayers size={15} /> },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{s.label}</span>
                    <span style={{ color: "var(--accent)" }}>{s.icon}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-strong)", marginBottom: 3 }}>{loading ? "—" : s.value}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Search & filter */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-strong)", marginBottom: 2 }}>Find a document</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Search by title, type, description or user, then filter by document type.</div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Search</label>
                  <div style={{ position: "relative" }}>
                    <FiSearch size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                      type="text" placeholder="Search title, type, description or user…"
                      value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      style={{ ...ctrlStyle, padding: "8px 30px 8px 32px" }}
                    />
                    {searchTerm && <FiX size={14} onClick={() => setSearchTerm("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", cursor: "pointer" }} />}
                  </div>
                </div>

                <div style={{ minWidth: 160 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</label>
                  <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...ctrlStyle, cursor: "pointer" }}>
                    <option value="all">All types</option>
                    <option value="regular">Regular documents</option>
                    <option value="dfs">DFS documents</option>
                  </select>
                </div>

                <button style={{ ...btnStyle, padding: "8px 12px" }} onClick={fetchDocuments}>
                  <FiRefreshCw size={13} /> Refresh
                </button>
                <button style={{ ...btnStyle, padding: "8px 12px" }} onClick={resetFilters}>
                  <FiX size={13} /> Reset
                </button>
              </div>
            </div>

            {/* States */}
            {loading || !user ? (
              <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <FiRefreshCw size={22} color="var(--accent)" style={{ marginBottom: 12, animation: "spin 1s linear infinite" }} />
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{loading ? "Loading documents…" : "Waiting for authentication…"}</div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <FiInbox size={24} color="var(--muted-foreground)" style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)", marginBottom: 4 }}>No documents found</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {searchTerm || filterType !== "all" ? "Try adjusting your search or filters." : "No documents found in the database."}
                </div>
              </div>
            ) : (
              <>
                {/* ════ DESKTOP TABLE ════ */}
                <div className="d-none d-md-block" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
                      <thead>
                        <tr>
                          <th style={thStyle()}>#</th>
                          <th style={thStyle()}>Type</th>
                          <th style={thStyle()}>Document</th>
                          <th style={thStyle()}>Status</th>
                          <th style={thStyle()}>Uploaded By</th>
                          <th style={thStyle()}>Current Owner</th>
                          <th style={thStyle()}>Upload Date</th>
                          <th style={thStyle("center")}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDocuments.map((doc, idx) => (
                          <tr key={doc._id}
                            style={{ background: "var(--card)", transition: "background .2s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--muted)"}
                            onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
                          >
                            <td style={{ ...tdStyle, color: "var(--text-muted)", fontWeight: 600 }}>{String(idx + 1).padStart(2, "0")}</td>
                            <td style={tdStyle}><TypeBadge type={doc.type} /></td>
                            <td style={{ ...tdStyle, maxWidth: 280 }}>
                              <div style={{ fontWeight: 600, color: "var(--text-strong)" }}>{doc.title}</div>
                              {doc.documentType && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{doc.documentType}</div>}
                              {doc.description && (
                                <div style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 270 }}>
                                  {doc.description}
                                </div>
                              )}
                            </td>
                            <td style={tdStyle}><StatusBadge status={doc.status} /></td>
                            <td style={tdStyle}><Person person={doc.uploadedBy} /></td>
                            <td style={tdStyle}><Person person={doc.userId} /></td>
                            <td style={{ ...tdStyle, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmtDate(doc.uploadDate || doc.createdAt)}</td>
                            <td style={{ ...tdStyle, textAlign: "center" }}>
                              <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                                {doc.documentLink && (
                                  <a href={doc.documentLink} target="_blank" rel="noopener noreferrer" style={linkBtn}>
                                    <FiExternalLink size={12} /> View
                                  </a>
                                )}
                                {doc.type === "dfs" && (
                                  <a href={`/admin/dfsrequest/${doc._id}`} style={{ ...linkBtn, color: "var(--accent)", borderColor: "var(--accent)" }}>
                                    <FiArrowRight size={12} /> Details
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ════ MOBILE CARDS ════ */}
                <div className="d-md-none" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredDocuments.map((doc, idx) => (
                    <div key={doc._id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>#{String(idx + 1).padStart(2, "0")}</span>
                              <TypeBadge type={doc.type} />
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-strong)", lineHeight: 1.3 }}>{doc.title}</div>
                            {doc.documentType && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{doc.documentType}</div>}
                          </div>
                          <StatusBadge status={doc.status} />
                        </div>

                        {doc.description && (
                          <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 10 }}>{doc.description}</div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
                            <FiUser size={12} color="var(--accent)" /> By:
                            <Avatar src={doc.uploadedBy?.profile} name={doc.uploadedBy?.name} size={22} />
                            <span style={{ color: "var(--text-strong)", fontWeight: 600 }}>{doc.uploadedBy?.name || "—"}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
                            <FiUser size={12} color="var(--accent)" /> Owner:
                            <Avatar src={doc.userId?.profile} name={doc.userId?.name} size={22} />
                            <span style={{ color: "var(--text-strong)", fontWeight: 600 }}>{doc.userId?.name || "—"}</span>
                          </div>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                            <FiClock size={12} color="var(--accent)" /> {fmtDate(doc.uploadDate || doc.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", borderTop: "1px solid var(--border)" }}>
                        {doc.documentLink && (
                          <a href={doc.documentLink} target="_blank" rel="noopener noreferrer"
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", background: "var(--muted)", color: "var(--primary)", fontSize: 12.5, fontWeight: 600, textDecoration: "none", borderRight: doc.type === "dfs" ? "1px solid var(--border)" : "none" }}>
                            <FiExternalLink size={13} /> View file
                          </a>
                        )}
                        {doc.type === "dfs" && (
                          <a href={`/admin/dfsrequest/${doc._id}`}
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", background: "var(--muted)", color: "var(--accent)", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>
                            <FiArrowRight size={13} /> Details
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer count */}
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
                  Showing {filteredDocuments.length} of {documents.length} documents
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