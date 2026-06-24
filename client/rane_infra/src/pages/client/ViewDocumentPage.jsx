import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import {
  FaFileAlt, FaCheckCircle, FaTimesCircle, FaExternalLinkAlt,
  FaFolderOpen, FaInbox, FaClock, FaCheck,
} from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import ClientHeader from "../../component/header/ClientHeader";
import { getDocumentsByUserId, updateDocumentStatus } from '../../services/documentService';
import { useAuthStore } from '../../store/authStore';

const C = { primary: "#6b3e2b", accent: "#b95a52", success: "#225b31", destructive: "#c94a3a", muted: "#8b7b74" };

const statusMeta = (status) => {
  switch (status) {
    case 'accepted': return { bg: 'var(--success)', color: 'var(--success-foreground)', label: 'Accepted' };
    case 'rejected': return { bg: 'var(--destructive)', color: 'var(--destructive-foreground)', label: 'Rejected' };
    case 'pending':
    default:         return { bg: 'var(--warning)', color: 'var(--warning-foreground)', label: 'Pending' };
  }
};

const StatusBadge = ({ status }) => {
  const m = statusMeta(status);
  return <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>{m.label}</span>;
};

const Avatar = ({ src, name }) => (
  src ? (
    <img src={src} alt={name || 'User'} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
  ) : (
    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--secondary)', color: C.primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
      {(name || '?').trim().charAt(0).toUpperCase()}
    </span>
  )
);

export default function ViewDocumentPage() {
  const { docType } = useParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [acceptTime, setAcceptTime] = useState("");

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const data = await getDocumentsByUserId(user._id, docType);
        setDocuments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user._id) fetchDocs();
  }, [docType, user._id]);

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const handleOpenModal = (doc) => {
    setSelectedDoc(doc);
    setAcceptTime(new Date().toLocaleString());
    setShowModal(true);
  };

  const handleAccept = async () => {
    if (!selectedDoc) return;
    try {
      await updateDocumentStatus(selectedDoc._id, 'accepted');
      setDocuments(prev => prev.map(doc =>
        doc._id === selectedDoc._id ? { ...doc, status: 'accepted', statusUpdatedAt: new Date().toISOString() } : doc
      ));
      setShowModal(false);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleReject = async (docId) => {
    try {
      await updateDocumentStatus(docId, 'rejected');
      setDocuments(prev => prev.map(doc =>
        doc._id === docId ? { ...doc, status: 'rejected', statusUpdatedAt: new Date().toISOString() } : doc
      ));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const counts = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    accepted: documents.filter(d => d.status === 'accepted').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
  };

  // styles
  const thStyle = (align = 'left') => ({ padding: "10px 12px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border)", background: "var(--muted)", textAlign: align, whiteSpace: "nowrap" });
  const tdStyle = { padding: "11px 12px", fontSize: 13, color: "var(--foreground)", borderBottom: "1px solid var(--border)", verticalAlign: "middle" };
  const actionBtn = () => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 7, border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", padding: 0 });
  const openDocLink = (href) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--link)", textDecoration: "none" }}>
      <FaExternalLinkAlt size={11} color={C.accent} /> Open
    </a>
  );

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
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>{docType || 'Documents'}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Review, sign, or reject documents shared with you</div>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "16px 20px" }}>

            {loading ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ width: 24, height: 24, margin: "0 auto 12px", border: "3px solid var(--border)", borderTopColor: C.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading documents…</div>
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <FaTimesCircle size={22} color={C.destructive} style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)", marginBottom: 6 }}>Couldn't load documents</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{error}</div>
              </div>
            ) : documents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <FaInbox size={22} color={C.muted} style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)", marginBottom: 4 }}>No documents found</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>There are no {docType} documents shared with you yet.</div>
              </div>
            ) : (
              <>
                {/* Stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Total", value: counts.total, icon: <FaFileAlt size={14} color={C.accent} /> },
                    { label: "Pending", value: counts.pending, icon: <FaClock size={14} color={C.accent} /> },
                    { label: "Accepted", value: counts.accepted, icon: <FaCheckCircle size={14} color={C.accent} /> },
                    { label: "Rejected", value: counts.rejected, icon: <FaTimesCircle size={14} color={C.accent} /> },
                  ].map(s => (
                    <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{s.label}</span>
                        <span>{s.icon}</span>
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-strong)" }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* ════ DESKTOP TABLE ════ */}
                <div className="d-none d-md-block" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
                      <thead>
                        <tr>
                          <th style={thStyle()}>#</th>
                          <th style={thStyle()}>Doc code</th>
                          <th style={thStyle()}>Issued</th>
                          <th style={thStyle()}>Uploaded</th>
                          <th style={thStyle('center')}>File</th>
                          <th style={thStyle()}>Remark</th>
                          <th style={thStyle()}>Status</th>
                          <th style={thStyle()}>Uploaded by</th>
                          <th style={thStyle('center')}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc, index) => (
                          <tr key={doc._id}
                            style={{ background: "var(--card)", transition: "background .2s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--muted)"}
                            onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
                          >
                            <td style={{ ...tdStyle, color: "var(--text-muted)", fontWeight: 600 }}>{String(index + 1).padStart(2, "0")}</td>
                            <td style={{ ...tdStyle, fontWeight: 600, color: "var(--text-strong)", whiteSpace: "nowrap" }}>{doc.documentCode}</td>
                            <td style={{ ...tdStyle, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{formatDate(doc.dateOfIssue)}</td>
                            <td style={{ ...tdStyle, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{formatDate(doc.uploadDate)}</td>
                            <td style={{ ...tdStyle, textAlign: "center" }}>{openDocLink(doc.documentLink)}</td>
                            <td style={{ ...tdStyle, maxWidth: 220 }}>
                              {doc.remark ? (
                                <div
                                  title={doc.remark}
                                  style={{
                                    color: "var(--text-muted)",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {doc.remark}
                                </div>
                              ) : (
                                <span style={{ color: "var(--text-muted)" }}>-</span>
                              )}
                            </td>
                            <td style={tdStyle}><StatusBadge status={doc.status} /></td>
                            <td style={tdStyle}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Avatar src={doc.uploadedBy?.profile} name={doc.uploadedBy?.name} />
                                <span style={{ whiteSpace: "nowrap" }}>{doc.uploadedBy?.name || '—'}</span>
                              </div>
                            </td>
                            <td style={{ ...tdStyle, textAlign: "center" }}>
                              {doc.status === 'pending' ? (
                                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                                  <button title="Accept & sign" style={actionBtn()} onClick={() => handleOpenModal(doc)}>
                                    <FaCheckCircle size={14} color={C.success} />
                                  </button>
                                  <button title="Reject" style={actionBtn()} onClick={() => handleReject(doc._id)}>
                                    <FaTimesCircle size={14} color={C.destructive} />
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(doc.statusUpdatedAt || doc.uploadDate)}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ════ MOBILE CARDS ════ */}
                <div className="d-md-none" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {documents.map((doc, index) => (
                    <div key={doc._id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>#{String(index + 1).padStart(2, "0")}</div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-strong)" }}>{doc.documentCode}</div>
                        </div>
                        <StatusBadge status={doc.status} />
                      </div>

                      {doc.remark && (
                        <div style={{
                          fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 10,
                          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {doc.remark}
                        </div>
                      )}

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
                        <span><strong style={{ fontWeight: 600 }}>Issued:</strong> {formatDate(doc.dateOfIssue)}</span>
                        <span><strong style={{ fontWeight: 600 }}>Uploaded:</strong> {formatDate(doc.uploadDate)}</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                          <Avatar src={doc.uploadedBy?.profile} name={doc.uploadedBy?.name} />
                          <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.uploadedBy?.name || '—'}</span>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          {openDocLink(doc.documentLink)}
                          {doc.status === 'pending' && (
                            <>
                              <button title="Accept & sign" style={actionBtn()} onClick={() => handleOpenModal(doc)}>
                                <FaCheckCircle size={14} color={C.success} />
                              </button>
                              <button title="Reject" style={actionBtn()} onClick={() => handleReject(doc._id)}>
                                <FaTimesCircle size={14} color={C.destructive} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
                  {documents.length} document{documents.length !== 1 ? 's' : ''} found
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Digital signature modal ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <div style={{ background: "var(--card)", borderRadius: 14, overflow: "hidden", fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--foreground)" }}>
          {/* Header */}
          <div style={{ background: "var(--primary)", padding: "16px 22px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "0.5px" }}>RS-WMS DigiSigner</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.12em" }}>Digital Signature Certificate</div>
          </div>

          <div style={{ padding: "22px 24px" }}>
            <p style={{ fontWeight: 600, fontStyle: "italic", color: "var(--text-strong)", marginBottom: 8 }}>By signing this document, I confirm:</p>
            <p style={{ fontSize: 13.5, color: "var(--foreground)", lineHeight: 1.6, marginBottom: 10 }}>
              By clicking <strong>Accept &amp; Sign</strong>, you acknowledge that you have carefully reviewed the contents of this document and agree to be bound by the terms, conditions, and responsibilities described herein.
            </p>
            <p style={{ fontSize: 13.5, color: "var(--foreground)", lineHeight: 1.6, marginBottom: 16 }}>
              This acceptance will serve as a record of your consent and may be referenced in the future for verification or compliance purposes.
            </p>

            <p style={{ fontWeight: 600, fontStyle: "italic", color: "var(--text-strong)", marginBottom: 8 }}>Some important points</p>
            <ol style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, paddingLeft: 18, marginBottom: 20 }}>
              <li>I understand the document and sign of my own free will.</li>
              <li>I consent to the use of this electronic signature as legal evidence.</li>
              <li>I sign this document in my senses through the RS-WMS DigiSigner.</li>
              <li>I have entered my full legal name without abbreviations or nicknames.</li>
            </ol>

            <p style={{ fontWeight: 600, fontStyle: "italic", color: "var(--text-strong)", marginBottom: 12 }}>I acknowledge</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>Name</label>
                <input type="text" id="signerName" defaultValue={user.name} placeholder="Enter your full legal name"
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13.5, color: "var(--foreground)", background: "var(--input)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>Legal ID</label>
                <input type="text" placeholder="Enter your full legal ID"
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13.5, color: "var(--foreground)", background: "var(--input)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ fontSize: 13.5 }}>
                <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>CID: </span>
                <span style={{ color: "var(--text-strong)" }}>{user.cid}</span>
              </div>
            </div>

            <p style={{ textAlign: "center", fontStyle: "italic", color: "var(--text-muted)", fontSize: 12, marginBottom: 20 }}>Timestamp: {acceptTime}</p>

            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button onClick={() => setShowModal(false)}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 22px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--secondary)", color: "var(--secondary-foreground)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <FaTimesCircle size={13} color={C.destructive} /> Cancel
              </button>
              <button onClick={handleAccept}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 22px", borderRadius: 8, border: "none", background: "var(--primary)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <FaCheck size={13} color="#ffffff" /> Accept &amp; Sign
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}