import React, { useEffect, useState } from 'react';
import {
  FiFileText, FiSearch, FiX, FiRefreshCw, FiAlertCircle, FiClock,
  FiChevronDown, FiChevronUp, FiExternalLink, FiPlus, FiDownload,
  FiInbox, FiCheckCircle, FiUser, FiPaperclip, FiArrowRight,
} from 'react-icons/fi';
import { getMyUploadedFiles } from '../../services/dfsService';
import ClientHeader from '../../component/header/ClientHeader';
import StaffHeader from "../../component/header/StaffHeader";
import { useAuthStore } from '../../store/authStore';

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

const TypePill = ({ type }) => (
  <span style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, whiteSpace: 'nowrap' }}>
    {type || '—'}
  </span>
);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Forwarding trail — stacked, works on desktop + mobile ────────────────────
function TrailView({ trail }) {
  if (!trail || trail.length === 0) {
    return <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 2px' }}>No communication trail yet.</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {trail.map((e, i) => (
        <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600, color: 'var(--text-strong)' }}>
              <span>{e.forwardedBy?.name || '—'}</span>
              <FiArrowRight size={12} color="var(--accent)" />
              <span>{e.forwardedTo?.name || '—'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {e.action && (
                <span style={{ background: 'var(--muted)', color: 'var(--text-muted)', fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 5, textTransform: 'capitalize' }}>
                  {e.action}
                </span>
              )}
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtDateTime(e.timestamp)}</span>
            </div>
          </div>
          {e.note && <div style={{ fontSize: 12.5, color: 'var(--foreground)', lineHeight: 1.5 }}>{e.note}</div>}
          {e.attachment && (
            <a href={e.attachment} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--link)', textDecoration: 'none', marginTop: 6, fontWeight: 500 }}>
              <FiPaperclip size={12} /> View attachment
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

export default function TrackMyAllDocument() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFileId, setExpandedFileId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const result = await getMyUploadedFiles();
        setFiles(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const getHeaderComponent = () => {
    switch (user?.role) {
      case 'client': return <ClientHeader />;
      case 'staff': return <StaffHeader />;
      default: return <ClientHeader />;
    }
  };

  const toggleCollapse = (id) => setExpandedFileId(prev => (prev === id ? null : id));

  const counts = {
    total: files.length,
    pending: files.filter(f => f.status === 'pending').length,
    review: files.filter(f => f.status === 'in-review').length,
    approved: files.filter(f => f.status === 'approved').length,
  };

  const filteredFiles = files
    .filter(f =>
      (f.fileTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
        f.docType?.toLowerCase().includes(searchText.toLowerCase())) &&
      (statusFilter === 'all' || f.status === statusFilter)
    )
    .sort((a, b) => sortOrder === 'asc'
      ? new Date(a.createdAt) - new Date(b.createdAt)
      : new Date(b.createdAt) - new Date(a.createdAt));

  const resetFilters = () => { setSearchText(''); setStatusFilter('all'); setSortOrder('desc'); };

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

        {/* ── Lifted page card ── */}
        <div style={{
          background: "var(--card)",
          borderRadius: 14,
          border: "1px solid var(--border)",
          boxShadow: "0 2px 10px var(--shadow-color)",
          overflow: "hidden",
          marginBottom: 16,
        }}>

          {/* ── Title bar ── */}
          <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FiFileText size={16} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>Track Documents</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Status and forwarding history of your uploaded documents</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <button style={{ ...btnStyle, background: "var(--primary)", color: "#fff", border: "none" }}>
                <FiPlus size={13} /> Upload New
              </button>
              <button style={{ ...btnStyle, background: "var(--secondary)" }}>
                <FiDownload size={13} /> Export
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "16px 20px" }}>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Total Documents", value: counts.total, sub: "All your uploads", icon: <FiFileText size={15} /> },
                { label: "Pending", value: counts.pending, sub: "Awaiting first review", icon: <FiInbox size={15} /> },
                { label: "In Review", value: counts.review, sub: "Currently being processed", icon: <FiClock size={15} /> },
                { label: "Approved", value: counts.approved, sub: "Fully cleared", icon: <FiCheckCircle size={15} /> },
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
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Search by title or type, then filter and sort the results.</div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Search</label>
                  <div style={{ position: "relative" }}>
                    <FiSearch size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                      type="text" placeholder="Search title or type…"
                      value={searchText} onChange={e => setSearchText(e.target.value)}
                      style={{ ...ctrlStyle, padding: "8px 30px 8px 32px" }}
                    />
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
                  <FiRefreshCw size={13} /> Reset
                </button>
              </div>
            </div>

            {/* States */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <FiRefreshCw size={22} color="var(--accent)" style={{ marginBottom: 12, animation: "spin 1s linear infinite" }} />
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading your documents…</div>
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <FiAlertCircle size={24} color="var(--destructive)" style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)", marginBottom: 6 }}>Couldn't load documents</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{error}</div>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <FiInbox size={24} color="var(--muted-foreground)" style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)", marginBottom: 4 }}>No documents found</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{files.length === 0 ? "You haven't uploaded any documents yet." : "Try adjusting your search or filters."}</div>
              </div>
            ) : (
              <>
                {/* ════ DESKTOP TABLE ════ */}
                <div className="d-none d-md-block" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
                      <thead>
                        <tr>
                          <th style={thStyle()}>#</th>
                          <th style={thStyle()}>Document</th>
                          <th style={thStyle()}>Type</th>
                          <th style={thStyle()}>Department</th>
                          <th style={thStyle()}>Status</th>
                          <th style={thStyle()}>Owner</th>
                          <th style={thStyle()}>Date</th>
                          <th style={thStyle('center')}>File</th>
                          <th style={thStyle('center')}>Trail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFiles.map((file, idx) => {
                          const open = expandedFileId === file._id;
                          return (
                            <React.Fragment key={file._id}>
                              <tr
                                style={{ background: open ? "var(--secondary)" : "var(--card)", transition: "background .2s" }}
                                onMouseEnter={e => { if (!open) e.currentTarget.style.background = "var(--muted)"; }}
                                onMouseLeave={e => { if (!open) e.currentTarget.style.background = "var(--card)"; }}
                              >
                                <td style={{ ...tdStyle, color: "var(--text-muted)", fontWeight: 600 }}>{String(idx + 1).padStart(2, "0")}</td>
                                <td style={{ ...tdStyle, maxWidth: 260 }}>
                                  <div style={{ fontWeight: 600, color: "var(--text-strong)" }}>{file.fileTitle}</div>
                                  {file.description && (
                                    <div style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 250 }}>
                                      {file.description}
                                    </div>
                                  )}
                                </td>
                                <td style={tdStyle}><TypePill type={file.docType} /></td>
                                <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{file.Department || '—'}</td>
                                <td style={tdStyle}><StatusBadge status={file.status} /></td>
                                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{file.currentOwner?.name || '—'}</td>
                                <td style={{ ...tdStyle, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmtDate(file.createdAt)}</td>
                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                  {file.fileUrl ? (
                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
                                      <FiExternalLink size={16} />
                                    </a>
                                  ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                                </td>
                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                  <button onClick={() => toggleCollapse(file._id)} style={{ ...btnStyle, padding: "5px 10px", margin: "0 auto", fontSize: 11.5 }}>
                                    {open ? <><FiChevronUp size={12} /> Hide</> : <><FiChevronDown size={12} /> View</>}
                                  </button>
                                </td>
                              </tr>
                              {open && (
                                <tr>
                                  <td colSpan={9} style={{ padding: 0, background: "var(--muted)" }}>
                                    <div style={{ padding: "14px 16px" }}>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-strong)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Communication trail</div>
                                      <TrailView trail={file.forwardingTrail} />
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ════ MOBILE CARDS ════ */}
                <div className="d-md-none" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredFiles.map((file, idx) => {
                    const open = expandedFileId === file._id;
                    return (
                      <div key={file._id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>#{String(idx + 1).padStart(2, "0")}</div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-strong)", lineHeight: 1.3 }}>{file.fileTitle}</div>
                            </div>
                            <StatusBadge status={file.status} />
                          </div>

                          {file.description && (
                            <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 10 }}>{file.description}</div>
                          )}

                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                            <TypePill type={file.docType} />
                            {file.Department && (
                              <span style={{ fontSize: 11, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", padding: "3px 0" }}>{file.Department}</span>
                            )}
                          </div>

                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: 12, color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><FiUser size={12} color="var(--accent)" /> {file.currentOwner?.name || '—'}</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><FiClock size={12} color="var(--accent)" /> {fmtDate(file.createdAt)}</span>
                            {file.fileUrl && (
                              <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--link)", textDecoration: "none", fontWeight: 500 }}>
                                <FiExternalLink size={12} /> Open file
                              </a>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => toggleCollapse(file._id)}
                          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", border: "none", borderTop: "1px solid var(--border)", background: open ? "var(--secondary)" : "var(--muted)", color: "var(--primary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                        >
                          {open ? <><FiChevronUp size={13} /> Hide trail</> : <><FiChevronDown size={13} /> View trail</>}
                        </button>

                        {open && (
                          <div style={{ padding: "12px 14px", background: "var(--muted)", borderTop: "1px solid var(--border)" }}>
                            <TrailView trail={file.forwardingTrail} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer count */}
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
                  Showing {filteredFiles.length} of {files.length} documents
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