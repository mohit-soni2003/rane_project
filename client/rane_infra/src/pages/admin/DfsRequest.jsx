import React, { useEffect, useState } from "react";
import {
  FiClipboard, FiSearch, FiX, FiRefreshCw, FiClock,
  FiInbox, FiCheckCircle, FiUser,
} from "react-icons/fi";
import { FaEye, FaEllipsisV, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getMyRequests, deleteDfsFile } from "../../services/dfsService";
import AdminHeader from "../../component/header/AdminHeader";
import ClientHeader from "../../component/header/ClientHeader";
import StaffHeader from "../../component/header/StaffHeader";
import { useAuthStore } from "../../store/authStore";
import DeleteConfirmationModal from "../../component/models/DeleteConfirmationModal";
import NoFilesAssigned from "../../assets/components/unique_component/NoFilesAssigned";

// ── Status styling (palette tokens only) ─────────────────────────────────────
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
  return (
    <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
};

const TypePill = ({ type }) => type ? (
  <span style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, whiteSpace: 'nowrap' }}>
    {type}
  </span>
) : null;

const Avatar = ({ src, name }) => (
  src ? (
    <img src={src} alt={name || 'User'} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
  ) : (
    <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <FiUser size={15} color="#8b7b74" />
    </span>
  )
);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const iconBtn = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 30, height: 30, borderRadius: 7, border: "1px solid var(--border)",
  background: "var(--card)", cursor: "pointer", textDecoration: "none", padding: 0,
};

export default function DfsRequest() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      const data = await getMyRequests();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      alert("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getHeaderComponent = () => {
    switch (user?.role) {
      case 'admin': return <AdminHeader />;
      case 'client': return <ClientHeader />;
      case 'staff': return <StaffHeader />;
      default: return <AdminHeader />;
    }
  };

  const handleDeleteClick = (doc) => { setSelectedDocument(doc); setShowDeleteModal(true); };

  const handleDeleteConfirm = async () => {
    if (!selectedDocument) return;
    try {
      await deleteDfsFile(selectedDocument._id);
      setDocuments(prev => prev.filter(doc => doc._id !== selectedDocument._id));
      alert("✅ DFS file deleted successfully!");
    } catch (error) {
      alert("❌ Failed to delete DFS file: " + error.message);
    }
  };

  const counts = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    review: documents.filter(d => d.status === 'in-review').length,
    approved: documents.filter(d => d.status === 'approved').length,
  };

  const filtered = documents
    .filter(d =>
      (d.fileTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
        d.uploadedBy?.name?.toLowerCase().includes(searchText.toLowerCase())) &&
      (statusFilter === 'all' || d.status === statusFilter)
    )
    .sort((a, b) => sortOrder === 'asc'
      ? new Date(a.createdAt) - new Date(b.createdAt)
      : new Date(b.createdAt) - new Date(a.createdAt));

  const resetFilters = () => { setSearchText(''); setStatusFilter('all'); setSortOrder('desc'); };

  const isAdmin = user?.role === 'admin';

  const btnStyle = {
    display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 7,
    border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)",
    fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  };
  const ctrlStyle = {
    width: "100%", border: "1px solid var(--border)", borderRadius: 7, padding: "8px 12px",
    fontSize: 13, color: "var(--foreground)", background: "var(--input)", outline: "none", boxSizing: "border-box",
  };
  const thStyle = (align = 'left') => ({
    padding: "10px 12px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
    textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border)",
    background: "var(--muted)", textAlign: align, whiteSpace: "nowrap",
  });
  const tdStyle = { padding: "11px 12px", fontSize: 13, color: "var(--foreground)", borderBottom: "1px solid var(--border)", verticalAlign: "middle" };

  return (
    <>
      {getHeaderComponent()}

      <div style={{ background: "var(--background)", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--foreground)", padding: "0 2px" }}>

        <div style={{ background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)", boxShadow: "0 2px 10px var(--shadow-color)", overflow: "hidden", marginBottom: 16 }}>

          {/* ── Title bar ── */}
          <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FiClipboard size={16} color="#b95a52" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>Documents Assigned to You</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Pending actions and review requests</div>
              </div>
            </div>
          </div>

          <div style={{ padding: "16px 20px" }}>

            {loading ? (
              <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <FiRefreshCw size={22} color="#b95a52" style={{ marginBottom: 12, animation: "spin 1s linear infinite" }} />
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading assigned documents…</div>
              </div>
            ) : documents.length === 0 ? (
              <NoFilesAssigned />
            ) : (
              <>
                {/* Stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Total Assigned", value: counts.total, sub: "Currently with you", icon: <FiClipboard size={15} color="#b95a52" /> },
                    { label: "Pending", value: counts.pending, sub: "Awaiting action", icon: <FiInbox size={15} color="#b95a52" /> },
                    { label: "In Review", value: counts.review, sub: "Being processed", icon: <FiClock size={15} color="#b95a52" /> },
                    { label: "Approved", value: counts.approved, sub: "Cleared by you", icon: <FiCheckCircle size={15} color="#b95a52" /> },
                  ].map(s => (
                    <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{s.label}</span>
                        <span>{s.icon}</span>
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-strong)", marginBottom: 3 }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Search & filter */}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-strong)", marginBottom: 2 }}>Find a request</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Search by document title or sender, then filter and sort.</div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Search</label>
                      <div style={{ position: "relative" }}>
                        <FiSearch size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input type="text" placeholder="Search title or sender…" value={searchText} onChange={e => setSearchText(e.target.value)} style={{ ...ctrlStyle, padding: "8px 30px 8px 32px" }} />
                        {searchText && <FiX size={14} onClick={() => setSearchText("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", cursor: "pointer" }} />}
                      </div>
                    </div>

                    <div style={{ minWidth: 140 }}>
                      <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</label>
                      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...ctrlStyle, cursor: "pointer" }}>
                        <option value="all">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in-review">In Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div style={{ minWidth: 140 }}>
                      <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sort</label>
                      <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={{ ...ctrlStyle, cursor: "pointer" }}>
                        <option value="desc">Newest first</option>
                        <option value="asc">Oldest first</option>
                      </select>
                    </div>

                    <button style={{ ...btnStyle, padding: "8px 12px" }} onClick={resetFilters}>
                      <FiRefreshCw size={13} color="#6b3e2b" /> Reset
                    </button>
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                    <FiInbox size={24} color="#8b7b74" style={{ marginBottom: 10 }} />
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)", marginBottom: 4 }}>No matching requests</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Try adjusting your search or filters.</div>
                  </div>
                ) : (
                  <>
                    {/* ════ DESKTOP TABLE ════ */}
                    <div className="d-none d-md-block" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
                          <thead>
                            <tr>
                              <th style={thStyle()}>#</th>
                              <th style={thStyle()}>Document</th>
                              <th style={thStyle()}>Uploaded by</th>
                              <th style={thStyle()}>Forwarded by</th>
                              <th style={thStyle()}>Status</th>
                              <th style={thStyle()}>Date</th>
                              <th style={thStyle('center')}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((doc, i) => (
                              <tr key={doc._id}
                                style={{ background: "var(--card)", transition: "background .2s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--muted)"}
                                onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
                              >
                                <td style={{ ...tdStyle, color: "var(--text-muted)", fontWeight: 600 }}>{String(i + 1).padStart(2, "0")}</td>
                                <td style={{ ...tdStyle, maxWidth: 260 }}>
                                  <div style={{ fontWeight: 600, color: "var(--text-strong)" }}>{doc.fileTitle}</div>
                                  {doc.docType && <div style={{ marginTop: 4 }}><TypePill type={doc.docType} /></div>}
                                </td>
                                <td style={tdStyle}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Avatar src={doc.uploadedBy?.profile} name={doc.uploadedBy?.name} />
                                    <span style={{ whiteSpace: "nowrap" }}>{doc.uploadedBy?.name || "—"}</span>
                                  </div>
                                </td>
                                <td style={{ ...tdStyle, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{doc.forwardedBy?.name || "—"}</td>
                                <td style={tdStyle}><StatusBadge status={doc.status} /></td>
                                <td style={{ ...tdStyle, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                  <FiClock size={12} color="#b95a52" style={{ marginRight: 5, verticalAlign: -1 }} />{fmtDate(doc.createdAt)}
                                </td>
                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" title="Open file" style={iconBtn}>
                                      <FaEye size={13} color="#b95a52" />
                                    </a>
                                    <button title="Details" style={iconBtn} onClick={() => navigate(`/${user.role}/dfsrequest/${doc._id}`)}>
                                      <FaEllipsisV size={13} color="#6b3e2b" />
                                    </button>
                                    {isAdmin && (
                                      <button title="Delete" style={iconBtn} onClick={() => handleDeleteClick(doc)}>
                                        <FaTrash size={12} color="#c94a3a" />
                                      </button>
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
                      {filtered.map((doc, i) => (
                        <div key={doc._id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                              <Avatar src={doc.uploadedBy?.profile} name={doc.uploadedBy?.name} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-strong)" }}>{doc.uploadedBy?.name || "—"}</div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>via {doc.forwardedBy?.name || "—"}</div>
                              </div>
                            </div>
                            <StatusBadge status={doc.status} />
                          </div>

                          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-strong)", lineHeight: 1.3, marginBottom: 6 }}>{doc.fileTitle}</div>
                          {doc.docType && <div style={{ marginBottom: 10 }}><TypePill type={doc.docType} /></div>}

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                            <span style={{ fontSize: 12, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                              <FiClock size={12} color="#b95a52" /> {fmtDate(doc.createdAt)}
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" title="Open file" style={iconBtn}>
                                <FaEye size={13} color="#b95a52" />
                              </a>
                              <button title="Details" style={iconBtn} onClick={() => navigate(`/${user.role}/dfsrequest/${doc._id}`)}>
                                <FaEllipsisV size={13} color="#6b3e2b" />
                              </button>
                              {isAdmin && (
                                <button title="Delete" style={iconBtn} onClick={() => handleDeleteClick(doc)}>
                                  <FaTrash size={12} color="#c94a3a" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer count */}
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
                      Showing {filtered.length} of {documents.length} requests
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedDocument?.fileTitle}
        itemType="DFS Document"
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}