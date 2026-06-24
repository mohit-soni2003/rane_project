import React, { useState, useEffect } from 'react';
import { deleteDocument, getMyUploadedDocuments } from '../../services/documentService';
import AdminHeader from '../../component/header/AdminHeader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegFileAlt, FaTrash, FaUser, FaFileAlt, FaExclamationTriangle } from "react-icons/fa";
import { FiSearch, FiX } from "react-icons/fi";

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const controlStyle = {
  border: '1px solid var(--border)', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, color: 'var(--foreground)',
  background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
};

// ── Status badge meta ─────────────────────────────────────────────────────────
const statusMeta = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'accepted': return { bg: 'var(--success)', color: 'var(--success-foreground)' };
    case 'rejected': return { bg: '#fde8e6', color: 'var(--destructive)' };
    default: return { bg: 'var(--warning)', color: 'var(--warning-foreground)' };
  }
};
const StatusBadge = ({ status }) => {
  const { bg, color } = statusMeta(status);
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, background: bg, color, textTransform: 'capitalize',
    }}>
      {status || 'pending'}
    </span>
  );
};

export default function MyPushedDocument() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("");

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await getMyUploadedDocuments();
        setDocuments(res || []);
      } catch (error) {
        console.error("Error fetching my uploaded documents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const openDeleteModal = (docId) => {
    setSelectedDocumentId(docId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteDocument(selectedDocumentId);
      const res = await getMyUploadedDocuments();
      setDocuments(res || []);
      setShowDeleteModal(false);
      setSelectedDocumentId(null);
      toast.success('Document deleted successfully.');
    } catch (err) {
      console.error('Failed to delete document:', err);
      setShowDeleteModal(false);
      setSelectedDocumentId(null);
      toast.error('Failed to delete document.');
    } finally {
      setDeleting(false);
    }
  };

  // Doc-type options built from actual data
  const docTypes = [...new Set(documents.map(d => d.docType).filter(Boolean))];

  // Filters (now actually applied)
  const filteredDocuments = documents.filter((doc) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      (doc.documentCode || '').toLowerCase().includes(term) ||
      (doc.userId?.name || '').toLowerCase().includes(term);
    const matchesStatus = !statusFilter || (doc.status || 'pending').toLowerCase() === statusFilter;
    const matchesType = !docTypeFilter || doc.docType === docTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';
  const fmtDateTime = (d) => d ? new Date(d).toLocaleString() : '—';

  const resetFilters = () => { setSearchTerm(''); setStatusFilter(''); setDocTypeFilter(''); };

  return (
    <>
      <AdminHeader />
      <ToastContainer position="top-right" autoClose={2500} newestOnTop />

      <div style={{
        padding: '0 2px', fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--foreground)', background: 'var(--background)', minHeight: '100vh',
      }}>

        {/* ── Page card ── */}
        <div style={{
          background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)',
          boxShadow: '0 2px 10px var(--shadow-color)', overflow: 'hidden', marginBottom: 16,
        }}>

          {/* ── Title bar ── */}
          <div style={{
            borderBottom: '1px solid var(--border)', padding: '14px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FaRegFileAlt size={16} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                  My Pushed Documents
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  Documents you have uploaded and assigned to clients
                </div>
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
              background: 'var(--muted)', padding: '4px 12px', borderRadius: 20,
            }}>
              {documents.length} total
            </span>
          </div>

          <div style={{ padding: '16px 20px' }}>

            {/* ── Search / filter bar ── */}
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 16px', marginBottom: 14,
              boxShadow: '0 2px 8px var(--shadow-color)',
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
                {/* Search */}
                <div style={{ flex: '1 1 240px', minWidth: 200 }}>
                  <label style={{ ...labelStyle, display: 'block', marginBottom: 5 }}>Search</label>
                  <div style={{ position: 'relative' }}>
                    <FiSearch size={14} color="var(--muted-foreground)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text" placeholder="Search by code or name"
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ ...controlStyle, width: '100%', height: 38, paddingLeft: 33, paddingRight: searchTerm ? 32 : 12 }}
                    />
                    {searchTerm && (
                      <FiX size={14} color="var(--muted-foreground)" onClick={() => setSearchTerm('')}
                        style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} />
                    )}
                  </div>
                </div>

                {/* Status */}
                <div style={{ flex: '0 0 160px' }}>
                  <label style={{ ...labelStyle, display: 'block', marginBottom: 5 }}>Status</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ ...controlStyle, width: '100%', height: 38, cursor: 'pointer' }}>
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Doc Type */}
                <div style={{ flex: '0 0 180px' }}>
                  <label style={{ ...labelStyle, display: 'block', marginBottom: 5 }}>Doc Type</label>
                  <select value={docTypeFilter} onChange={(e) => setDocTypeFilter(e.target.value)}
                    style={{ ...controlStyle, width: '100%', height: 38, cursor: 'pointer' }}>
                    <option value="">All Doc Types</option>
                    {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Reset */}
                <button onClick={resetFilters}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px',
                    borderRadius: 8, border: '1px solid var(--border)',
                    background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--secondary)'}
                >
                  <FiX size={14} color="var(--secondary-foreground)" /> Reset
                </button>
              </div>

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
                Showing <strong style={{ color: 'var(--text-strong)' }}>{filteredDocuments.length}</strong> of{' '}
                <strong style={{ color: 'var(--text-strong)' }}>{documents.length}</strong> documents
              </div>
            </div>

            {/* ── Loading ── */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <span style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>Loading documents…</div>
              </div>
            )}

            {/* ── Empty ── */}
            {!loading && filteredDocuments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--muted)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <FaFileAlt size={32} color="var(--muted-foreground)" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>No documents found</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {searchTerm || statusFilter || docTypeFilter ? 'Try adjusting your search or filters.' : 'No documents uploaded yet.'}
                </div>
              </div>
            )}

            {/* ── Desktop table ── */}
            {!loading && filteredDocuments.length > 0 && (
              <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 1080, borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                      {['S.No', 'Doc Type', 'Doc Code', 'Uploaded For', 'Date of Issue', 'Upload Date', 'Document', 'Status', 'Status Change', 'Action'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc, index) => (
                      <tr key={doc._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '11px 12px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'var(--secondary)', color: 'var(--secondary-foreground)', fontWeight: 700, fontSize: 11 }}>{index + 1}</span>
                        </td>
                        <td style={{ padding: '11px 12px', fontWeight: 600, color: 'var(--text-strong)' }}>{doc.docType || '—'}</td>
                        <td style={{ padding: '11px 12px' }}>{doc.documentCode || '—'}</td>
                        <td style={{ padding: '11px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {doc.userId?.profile ? (
                              <img src={doc.userId.profile} alt={doc.userId.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'var(--muted)', color: 'var(--text-muted)', flexShrink: 0 }}>
                                <FaUser size={12} color="var(--muted-foreground)" />
                              </span>
                            )}
                            <span>{doc.userId?.name || '—'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '11px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(doc.dateOfIssue)}</td>
                        <td style={{ padding: '11px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(doc.uploadDate)}</td>
                        <td style={{ padding: '11px 12px' }}>
                          {doc.documentLink ? (
                            <a href={doc.documentLink} target="_blank" rel="noreferrer" title="View Document"
                              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)', textDecoration: 'none' }}>
                              <FaRegFileAlt size={13} color="var(--secondary-foreground)" />
                            </a>
                          ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        <td style={{ padding: '11px 12px' }}><StatusBadge status={doc.status} /></td>
                        <td style={{ padding: '11px 12px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDateTime(doc.statusUpdatedAt)}</td>
                        <td style={{ padding: '11px 12px' }}>
                          <button onClick={() => openDeleteModal(doc._id)} title="Delete Document"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 7, border: '1px solid var(--destructive-border)', background: 'var(--destructive-bg)', color: 'var(--destructive)', cursor: 'pointer' }}>
                            <FaTrash size={12} color="var(--destructive)" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Mobile cards ── */}
            {!loading && filteredDocuments.length > 0 && (
              <div className="d-md-none">
                {filteredDocuments.map((doc, index) => (
                  <div key={doc._id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 12, boxShadow: '0 2px 8px var(--shadow-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {doc.userId?.profile ? (
                          <img src={doc.userId.profile} alt={doc.userId.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: 'var(--muted)', color: 'var(--text-muted)', flexShrink: 0 }}>
                            <FaUser size={13} color="var(--muted-foreground)" />
                          </span>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-strong)', lineHeight: 1.2 }}>{doc.userId?.name || '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{doc.docType || '—'} • {doc.documentCode || '—'}</div>
                        </div>
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: 10 }}>
                      {[
                        { label: 'Date of Issue', value: fmtDate(doc.dateOfIssue) },
                        { label: 'Upload Date', value: fmtDate(doc.uploadDate) },
                        { label: 'Status Change', value: fmtDateTime(doc.statusUpdatedAt) },
                        {
                          label: 'Document', value: doc.documentLink ? (
                            <a href={doc.documentLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                              <FaRegFileAlt size={13} color="var(--accent)" /> View
                            </a>
                          ) : <span style={{ color: 'var(--text-muted)' }}>—</span>
                        },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={{ ...labelStyle, marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', wordBreak: 'break-word' }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => openDeleteModal(doc._id)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '9px', borderRadius: 8, border: '1px solid var(--destructive-border)', background: 'var(--destructive-bg)', color: 'var(--destructive)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      <FaTrash size={12} color="var(--destructive)" /> Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Delete confirm modal (custom, themed) ── */}
      {showDeleteModal && (
        <div
          onClick={() => !deleting && setShowDeleteModal(false)}
          style={{
            position: 'fixed', inset: 0, background: 'var(--overlay)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--card)', borderRadius: 14, width: '100%', maxWidth: 380,
            boxShadow: '0 16px 48px var(--shadow-color)', overflow: 'hidden',
          }}>
            <div style={{ textAlign: 'center', padding: '24px 24px 16px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--destructive-bg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <FaExclamationTriangle size={24} color="var(--destructive)" />
              </div>
              <h5 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)', margin: '0 0 8px' }}>Delete Document</h5>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to delete this document? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
              <button onClick={() => setShowDeleteModal(false)} disabled={deleting}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)', fontSize: 14, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', borderRadius: 10, border: 'none', background: 'var(--destructive)', color: 'var(--destructive-foreground)', fontSize: 14, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.8 : 1 }}>
                {deleting
                  ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} /> Deleting…</>
                  : <><FaTrash size={12} color="var(--destructive-foreground)" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: var(--input); color: var(--foreground); }`}</style>
    </>
  );
}