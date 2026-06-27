import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getAgreementById, reviewAgreementExtension, deleteAgreement,
} from '../../services/agreement';
import AdminHeader from '../../component/header/AdminHeader';
import {
  FaFileContract, FaFileSignature, FaCalendarAlt, FaInfoCircle, FaExternalLinkAlt,
  FaEye, FaPenFancy, FaCheckCircle, FaTimesCircle, FaTrash, FaHistory, FaClock,
  FaUserTie, FaUserCircle, FaUser, FaCheck, FaTimes, FaExclamationTriangle,
} from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';

// ── Icon colors ───────────────────────────────────────────────────────────────
const C = {
  primary: '#6b3e2b', accent: '#b95a52', success: '#225b31',
  destructive: '#c94a3a', muted: '#8b7b74', warning: '#4a1f18', info: '#1e40af',
};

// ── Shared tokens ─────────────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 3,
};
const cardStyle = {
  background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)',
  boxShadow: '0 2px 10px var(--shadow-color)', overflow: 'hidden', marginBottom: 16,
};
const cardHeadStyle = {
  borderBottom: '1px solid var(--border)', padding: '12px 18px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
};

const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const formatDate     = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Reusable button ───────────────────────────────────────────────────────────
const Btn = ({ variant = 'primary', loading, children, style, ...rest }) => {
  const palette = {
    primary:     { bg: 'var(--primary)',     fg: 'var(--primary-foreground)',     bd: 'none',                    hover: 'var(--primary-hover)' },
    success:     { bg: 'var(--success)',     fg: 'var(--success-foreground)',     bd: 'none',                    hover: 'var(--success-border)' },
    destructive: { bg: 'var(--destructive)', fg: 'var(--destructive-foreground)', bd: 'none',                    hover: '#b03f30' },
    secondary:   { bg: 'var(--secondary)',   fg: 'var(--secondary-foreground)',   bd: '1px solid var(--border)', hover: 'var(--secondary-hover)' },
  }[variant];
  const disabled = rest.disabled || loading;
  return (
    <button
      {...rest}
      disabled={disabled}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = palette.hover; e.currentTarget.style.boxShadow = '0 2px 8px var(--shadow-color)'; } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = palette.bg; e.currentTarget.style.boxShadow = 'none'; } }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 8, border: palette.bd,
        background: disabled ? 'var(--muted)' : palette.bg,
        color: disabled ? 'var(--muted-foreground)' : palette.fg,
        fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap', transition: 'background .15s, box-shadow .15s', ...style,
      }}
    >
      {loading && <span style={{
        width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'currentColor',
        borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite',
      }} />}
      {children}
    </button>
  );
};

// ── Agreement status badge ────────────────────────────────────────────────────
const agreementStatusMeta = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'signed':   return { bg: 'var(--success)',   color: 'var(--success-foreground)', Icon: FaCheckCircle, label: 'Signed' };
    case 'rejected': return { bg: '#fde8e6',          color: C.destructive,               Icon: FaTimesCircle, label: 'Rejected' };
    case 'viewed':   return { bg: '#dbeafe',          color: '#1e40af',                   Icon: FaEye,         label: 'Viewed' };
    case 'expired':  return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)', Icon: FaClock,     label: 'Expired' };
    default:         return { bg: 'var(--warning)',   color: 'var(--warning-foreground)', Icon: FaExclamationTriangle, label: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending' };
  }
};
const StatusBadge = ({ status }) => {
  const { bg, color, Icon, label } = agreementStatusMeta(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px',
      borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color,
    }}>
      <Icon size={11} color={color} /> {label}
    </span>
  );
};

// ── Extension status pill ─────────────────────────────────────────────────────
const ExtStatusPill = ({ status }) => {
  const s = (status || '').toLowerCase();
  const meta = s === 'approved'
    ? { bg: 'var(--success)', color: 'var(--success-foreground)', Icon: FaCheckCircle }
    : s === 'rejected'
      ? { bg: '#fde8e6', color: C.destructive, Icon: FaTimesCircle }
      : { bg: 'var(--warning)', color: 'var(--warning-foreground)', Icon: FaClock };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px',
      borderRadius: 20, fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color, textTransform: 'capitalize',
    }}>
      <meta.Icon size={11} color={meta.color} /> {status || 'pending'}
    </span>
  );
};

// ── Field cell ────────────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, children, strong, danger }) => (
  <div>
    <span style={{ ...labelStyle, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      {Icon && <Icon size={11} color={C.muted} />} {label}
    </span>
    <div style={{
      fontSize: 14, fontWeight: strong ? 700 : 600,
      color: danger ? 'var(--destructive)' : 'var(--text-strong)', wordBreak: 'break-word',
    }}>
      {children}
    </div>
  </div>
);

// ── Section card wrapper ──────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, right, children }) => (
  <div style={cardStyle}>
    <div style={cardHeadStyle}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>
        <Icon size={15} color={C.accent} /> {title}
      </span>
      {right}
    </div>
    <div style={{ padding: '16px 18px' }}>{children}</div>
  </div>
);

// ── Portal modal ──────────────────────────────────────────────────────────────
const Modal = ({ show, onClose, busy, children }) => {
  if (!show) return null;
  return ReactDOM.createPortal(
    <div onClick={() => !busy && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      animation: 'modalFade .18s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--card)', borderRadius: 14, width: '100%', maxWidth: 400,
        boxShadow: '0 16px 48px rgba(0,0,0,0.25)', overflow: 'hidden',
        animation: 'modalPop .2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default function SingleAgreementDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [decision, setDecision] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { fetchAgreement(); }, [id]);

  const fetchAgreement = async () => {
    try {
      setLoading(true);
      const res = await getAgreementById(id);
      setAgreement(res.agreement);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (type) => { setDecision(type); setShowReviewModal(true); };
  const closeReviewModal = () => { setShowReviewModal(false); setDecision(null); };

  const handleReviewExtension = async () => {
    try {
      setActionLoading(true);
      await reviewAgreementExtension(id, decision);
      closeReviewModal();
      fetchAgreement();
      toast.success(`Extension request ${decision} successfully.`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await deleteAgreement(id);
      setShowDeleteModal(false);
      toast.success('Agreement deleted successfully.');
      setTimeout(() => navigate('/admin/agreement/track'), 2000);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to delete agreement.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Loading / not found ───────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <AdminHeader />
        <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--background)', minHeight: '100vh' }}>
          <span style={{
            display: 'inline-block', width: 34, height: 34, border: '3px solid var(--border)',
            borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 1s linear infinite',
          }} />
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>Loading agreement details…</div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  if (!agreement) {
    return (
      <>
        <AdminHeader />
        <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '40px 16px' }}>
          <div style={{
            maxWidth: 460, margin: '0 auto', textAlign: 'center', padding: '40px 24px',
            background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 14,
          }}>
            <FaFileContract size={32} color={C.muted} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>Agreement not found</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>It may have been deleted or the link is invalid.</div>
          </div>
        </div>
      </>
    );
  }

  const hasExtensionRequest = agreement.extensionRequest?.requested;
  const extensions = agreement.extensions || [];

  return (
    <>
      <AdminHeader />
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover draggable />

      <div style={{
        padding: '0 2px', fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--foreground)', background: 'var(--background)', minHeight: '100vh',
      }}>

        {/* ── Page title bar ── */}
        <div style={cardStyle}>
          <div style={cardHeadStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FaFileSignature size={16} color={C.primary} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                  Agreement Details
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  {agreement.agreementId || '—'}
                </div>
              </div>
            </div>
            <StatusBadge status={agreement.status} />
          </div>
        </div>

        {/* ── Agreement Information ── */}
        <Section
          icon={FaFileContract}
          title="Agreement Information"
          right={
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, color: 'var(--text-strong)',
              background: 'var(--muted)', padding: '5px 12px', borderRadius: 20,
            }}>
              <FaCalendarAlt size={12} color={C.accent} /> Expiry: {formatDate(agreement.expiryDate)}
            </span>
          }
        >
          <Row className="g-3">
            <Col xs={6} md={6}><Field label="Agreement ID">{agreement.agreementId || '—'}</Field></Col>
            <Col xs={6} md={6}>
              <Field label="Status"><StatusBadge status={agreement.status} /></Field>
            </Col>
            <Col xs={12}><Field label="Title">{agreement.title || '—'}</Field></Col>
            <Col xs={12}>
              <span style={labelStyle}>Description</span>
              <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.55, wordBreak: 'break-word' }}>
                {agreement.description || '—'}
              </div>
            </Col>
            <Col xs={12}>
              {agreement.fileUrl ? (
                <a href={agreement.fileUrl} target="_blank" rel="noreferrer"
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-hover)'; e.currentTarget.style.boxShadow = '0 2px 8px var(--shadow-color)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.boxShadow = 'none'; }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '8px 16px', borderRadius: 8,
                    background: 'var(--primary)', color: 'var(--primary-foreground)',
                    fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    transition: 'background .15s, box-shadow .15s',
                  }}>
                  <FaExternalLinkAlt size={12} color="var(--primary-foreground)" /> View agreement file
                </a>
              ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No file attached</span>}
            </Col>
          </Row>
        </Section>

        {/* ── Participants ── */}
        <Section icon={FaUserCircle} title="Participants">
          <Row className="g-4">
            {/* Uploaded by */}
            <Col md={6}>
              <span style={labelStyle}>Uploaded by</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <img
                  src={agreement.uploadedBy?.profile || ''} alt={agreement.uploadedBy?.name}
                  onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'inline-flex'; }}
                  style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--secondary)', background: 'var(--muted)' }}
                />
                <span style={{
                  display: agreement.uploadedBy?.profile ? 'none' : 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', width: 52, height: 52,
                  borderRadius: '50%', border: '2px solid var(--secondary)', background: 'var(--muted)',
                }}>
                  <FaUserTie size={20} color={C.muted} />
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaUserTie size={13} color={C.accent} /> {agreement.uploadedBy?.name || '—'}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                    {agreement.uploadedBy?.email || '—'}
                  </div>
                </div>
              </div>
            </Col>

            {/* Client */}
            <Col md={6}>
              <span style={labelStyle}>Client</span>
              <div
                onClick={() => agreement.client?._id && navigate(`/admin/client-detail/${agreement.client._id}`)}
                onMouseEnter={e => { if (agreement.client?._id) { e.currentTarget.style.background = 'var(--secondary)'; e.currentTarget.style.borderColor = 'var(--primary)'; } }}
                onMouseLeave={e => { if (agreement.client?._id) { e.currentTarget.style.background = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)'; } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, marginTop: 4,
                  cursor: agreement.client?._id ? 'pointer' : 'default',
                  background: 'var(--muted)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px 12px',
                  transition: 'background .15s, border-color .15s',
                }}
              >
                <img
                  src={agreement.client?.profile || ''} alt={agreement.client?.name}
                  onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'inline-flex'; }}
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--secondary)', background: 'var(--card)' }}
                />
                <span style={{
                  display: agreement.client?.profile ? 'none' : 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', width: 48, height: 48,
                  borderRadius: '50%', border: '2px solid var(--secondary)', background: 'var(--card)',
                }}>
                  <FaUser size={18} color={C.muted} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>
                    {agreement.client?.name || '—'}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                    {agreement.client?.email || '—'}
                  </div>
                </div>
                {agreement.client?._id && <FiArrowRight size={16} color={C.muted} />}
              </div>
            </Col>
          </Row>
        </Section>

        {/* ── Timeline ── */}
        <Section icon={FaCalendarAlt} title="Agreement Timeline">
          <Row className="g-4">
            <Col xs={6} md={3}><Field label="Uploaded at" icon={FaClock}>{formatDateTime(agreement.createdAt)}</Field></Col>
            <Col xs={6} md={3}><Field label="Viewed at" icon={FaEye}>{formatDateTime(agreement.viewedAt)}</Field></Col>
            <Col xs={6} md={3}><Field label="Signed at" icon={FaPenFancy}>{formatDateTime(agreement.signedAt)}</Field></Col>
            <Col xs={6} md={3}><Field label="Expiry date" icon={FaCalendarAlt} strong danger>{formatDate(agreement.expiryDate)}</Field></Col>
          </Row>
        </Section>

        {/* ── Extension Request ── */}
        <Section
          icon={FaClock}
          title="Extension Request"
          right={hasExtensionRequest ? <ExtStatusPill status={agreement.extensionRequest.status} /> : null}
        >
          {!hasExtensionRequest ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              <FaInfoCircle size={14} color={C.muted} /> No extension requested.
            </div>
          ) : (
            <>
              <Row className="g-4">
                <Col xs={6} md={4}>
                  <Field label="Requested expiry" icon={FaCalendarAlt}>
                    {formatDate(agreement.extensionRequest.requestedExpiryDate)}
                  </Field>
                </Col>
                <Col xs={6} md={4}>
                  <Field label="Status"><ExtStatusPill status={agreement.extensionRequest.status} /></Field>
                </Col>
                <Col xs={12}>
                  <span style={labelStyle}>Reason</span>
                  <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.55, wordBreak: 'break-word' }}>
                    {agreement.extensionRequest.reason || '—'}
                  </div>
                </Col>
              </Row>

              {/* Actions — only meaningful while still pending */}
              <div style={{ display: 'flex', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <Btn variant="success" onClick={() => openReviewModal('approved')}>
                  <FaCheck size={12} /> Accept
                </Btn>
                <Btn variant="destructive" onClick={() => openReviewModal('rejected')}>
                  <FaTimes size={12} /> Reject
                </Btn>
              </div>
            </>
          )}
        </Section>

        {/* ── Extension History ── */}
        <Section
          icon={FaHistory}
          title="Extension History"
          right={extensions.length > 0 ? (
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
              background: 'var(--muted)', padding: '4px 12px', borderRadius: 20,
            }}>
              {extensions.length} {extensions.length === 1 ? 'extension' : 'extensions'}
            </span>
          ) : null}
        >
          {extensions.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              <FaInfoCircle size={14} color={C.muted} /> No extensions applied.
            </div>
          ) : (
            extensions.map((ext, i) => (
              <div key={i} style={{
                background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 10,
                padding: '12px 14px', marginBottom: i === extensions.length - 1 ? 0 : 10,
              }}>
                <Row className="g-3">
                  <Col xs={6} md={3}><Field label="Old expiry">{formatDate(ext.oldExpiryDate)}</Field></Col>
                  <Col xs={6} md={3}>
                    <span style={labelStyle}>New expiry</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--success-foreground)' }}>
                      {formatDate(ext.newExpiryDate)}
                    </div>
                  </Col>
                  <Col xs={6} md={3}><Field label="Extended at">{formatDateTime(ext.extendedAt)}</Field></Col>
                  <Col xs={6} md={3}>
                    <span style={labelStyle}>Reason</span>
                    <div style={{ fontSize: 13.5, color: 'var(--text-muted)', wordBreak: 'break-word' }}>
                      {ext.reason || '—'}
                    </div>
                  </Col>
                </Row>
              </div>
            ))
          )}
        </Section>

        {/* ── Danger zone ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <Btn variant="destructive" onClick={() => setShowDeleteModal(true)}>
            <FaTrash size={12} /> Delete agreement
          </Btn>
        </div>
      </div>

      {/* ── Review extension modal ── */}
      <Modal show={showReviewModal} onClose={closeReviewModal} busy={actionLoading}>
        <div style={{ textAlign: 'center', padding: '24px 24px 16px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', marginBottom: 14,
            background: decision === 'approved' ? 'var(--success)' : 'var(--destructive-bg)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {decision === 'approved'
              ? <FaCheckCircle size={24} color="var(--success-foreground)" />
              : <FaTimesCircle size={24} color="var(--destructive)" />}
          </div>
          <h5 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)', margin: '0 0 8px' }}>
            {decision === 'approved' ? 'Approve extension' : 'Reject extension'}
          </h5>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Are you sure you want to <strong style={{ color: 'var(--text-strong)' }}>{decision === 'approved' ? 'approve' : 'reject'}</strong> this
            extension request? The client will be notified of your decision.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
          <Btn variant="secondary" disabled={actionLoading} onClick={closeReviewModal} style={{ flex: 1 }}>Cancel</Btn>
          <Btn variant={decision === 'approved' ? 'success' : 'destructive'} loading={actionLoading}
            onClick={handleReviewExtension} style={{ flex: 1 }}>
            {actionLoading ? 'Processing…' : 'Confirm'}
          </Btn>
        </div>
      </Modal>

      {/* ── Delete confirm modal ── */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} busy={deleteLoading}>
        <div style={{ textAlign: 'center', padding: '24px 24px 16px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: 'var(--destructive-bg)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
          }}>
            <FaExclamationTriangle size={24} color="var(--destructive)" />
          </div>
          <h5 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)', margin: '0 0 8px' }}>Delete agreement</h5>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            This permanently deletes the agreement along with all related notifications and activity. This action cannot be undone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '0 24px 24px' }}>
          <Btn variant="secondary" disabled={deleteLoading} onClick={() => setShowDeleteModal(false)} style={{ flex: 1 }}>Cancel</Btn>
          <Btn variant="destructive" loading={deleteLoading} onClick={handleDeleteConfirm} style={{ flex: 1 }}>
            {!deleteLoading && <FaTrash size={12} />} {deleteLoading ? 'Deleting…' : 'Delete'}
          </Btn>
        </div>
      </Modal>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes modalFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPop { from { opacity: 0; transform: translateY(8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </>
  );
}