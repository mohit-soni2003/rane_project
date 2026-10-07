import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminHeader from '../../../components/layout/header/AdminHeader';
import { getUserFullDetails } from '../../../services/userServices';
import dummyUser from '../../../assets/images/dummyUser.jpeg';
import { backend_url } from '../../../store/keyStore';
import {
  FaEnvelope, FaPhoneAlt, FaArrowLeft, FaUniversity, FaIdCard, FaMoneyCheckAlt, FaFileInvoice,
  FaFilePdf, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaExclamationTriangle, FaBuilding,
  FaMapMarkerAlt, FaUserShield, FaClock,
} from "react-icons/fa";
import { FiArrowRight } from 'react-icons/fi';

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = { primary: '#6b3e2b', accent: '#b95a52', success: '#225b31', destructive: '#c94a3a', muted: '#8b7b74', info: '#1e40af' };

// ── Shared styles ─────────────────────────────────────────────────────────────
const cardStyle = {
  background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)',
  boxShadow: '0 2px 10px var(--shadow-color)', overflow: 'hidden', marginBottom: 16,
};
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const thStyle = {
  padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
};
const tdStyle = { padding: '11px 12px', whiteSpace: 'nowrap' };
const ctrlStyle = {
  width: '100%', height: 38, boxSizing: 'border-box', background: 'var(--input)', color: 'var(--foreground)',
  border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', fontSize: 13.5, outline: 'none',
};
const primaryBtn = {
  height: 38, padding: '0 16px', borderRadius: 8, border: 'none', whiteSpace: 'nowrap',
  background: 'var(--primary)', color: 'var(--primary-foreground)', fontSize: 13, fontWeight: 600,
};
const smallBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 7,
  border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)',
  fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
};

// Section card with an icon title
function Section({ icon: Icon, title, right, children }) {
  return (
    <div style={cardStyle}>
      <div style={{
        borderBottom: '1px solid var(--border)', padding: '12px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>
          <Icon size={14} color={C.accent} /> {title}
        </span>
        {right}
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  );
}

// Label + value line
function Field({ label, value, icon: Icon, color, mono }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 5 }}>
        {Icon && <Icon size={10} color={C.muted} />} {label}
      </div>
      <div style={{
        fontSize: 13.5, fontWeight: 600, marginTop: 3, color: color || 'var(--text-strong)',
        wordBreak: 'break-word', fontFamily: mono ? 'monospace' : 'inherit',
      }}>
        {value === 0 || value ? value : '—'}
      </div>
    </div>
  );
}

const billStatusMeta = (status) => {
  switch (status) {
    case 'Paid':
    case 'Completed': return { bg: 'var(--success)', color: 'var(--success-foreground)' };
    case 'Reject':
    case 'Rejected': return { bg: '#fde8e6', color: C.destructive };
    case 'Sanctioned': return { bg: '#dbeafe', color: C.info };
    default: return { bg: 'var(--warning)', color: 'var(--warning-foreground)' };
  }
};
const payStatusMeta = (status) => {
  switch (status) {
    case 'Paid': return { bg: 'var(--success)', color: 'var(--success-foreground)', Icon: FaCheckCircle };
    case 'Rejected': return { bg: '#fde8e6', color: C.destructive, Icon: FaTimesCircle };
    case 'Sanctioned': return { bg: '#dbeafe', color: C.info, Icon: FaCheckCircle };
    default: return { bg: 'var(--warning)', color: 'var(--warning-foreground)', Icon: FaHourglassHalf };
  }
};

// Keep this in sync with the User schema's `tag` enum.
const TAG_OPTIONS = [
  'admin', 'ceo', 'cto', 'cfo', 'coo', 'director', 'site_incharge',
  'chief_finance_head', 'finance_head', 'accountant', 'supervisor',
  'client', 'staff',
];
const prettifyTag = (t) =>
  typeof t === 'string' ? t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function ClientDetailAdminPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cid, setCid] = useState('');
  const [tag, setTag] = useState('');
  const [updatingTag, setUpdatingTag] = useState(false);
  const [activeTab, setActiveTab] = useState('bills');
  const [avatarError, setAvatarError] = useState(false);

  const handleCidUpdate = async (userId) => {
    try {
      setUpdating(true);
      const response = await fetch(`${backend_url}/update-cid/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cid }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update CID');
      }
      alert('CID updated successfully');
    } catch (error) {
      console.error("CID update failed:", error);
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleTagUpdate = async (userId) => {
    if (!tag) {
      alert('Select a tag first.');
      return;
    }
    try {
      setUpdatingTag(true);
      const response = await fetch(`${backend_url}/admin-update-user-tag`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: userId, tag }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update tag');
      }
      alert('Tag updated successfully');
    } catch (error) {
      console.error("Tag update failed:", error);
      alert(error.message);
    } finally {
      setUpdatingTag(false);
    }
  };

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const data = await getUserFullDetails(id);
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch client data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  useEffect(() => {
    if (userData?.user?.cid) {
      setCid(userData.user.cid);
    }
    if (userData?.user?.tag) {
      setTag(userData.user.tag);
    }
  }, [userData]);

  const wrapStyle = {
    padding: '0 2px', fontFamily: 'system-ui, -apple-system, sans-serif',
    color: 'var(--foreground)', background: 'var(--background)', minHeight: '100vh',
  };

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div style={{ ...wrapStyle, textAlign: 'center', paddingTop: 60 }}>
          <span style={{
            display: 'inline-block', width: 34, height: 34, border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 13 }}>Loading client details…</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  if (!userData) {
    return (
      <>
        <AdminHeader />
        <div style={wrapStyle}>
          <div style={{ maxWidth: 460, margin: '40px auto', textAlign: 'center', padding: '36px 24px', background: '#fde8e6', border: '1px solid #f5b8b2', borderRadius: 14 }}>
            <FaExclamationTriangle size={28} color={C.destructive} />
            <div style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: C.destructive }}>No data found for this client.</div>
            <button onClick={() => navigate(-1)} style={{ ...smallBtn, margin: '16px auto 0', padding: '8px 16px', fontSize: 13 }}>
              <FaArrowLeft size={11} /> Go back
            </button>
          </div>
        </div>
      </>
    );
  }

  const { user, bills = [], payments = [] } = userData;

  // ── Summary figures ──
  const totalBilled = bills.reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const paidBilled = bills
    .filter(b => ['Paid', 'Completed'].includes(b.paymentStatus))
    .reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const totalRequested = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const tabs = [
    { key: 'bills', label: 'Bills', icon: FaFileInvoice, count: bills.length },
    { key: 'payments', label: 'Payment Requests', icon: FaMoneyCheckAlt, count: payments.length },
  ];

  return (
    <>
      <AdminHeader />

      <div style={wrapStyle}>

        {/* ── Header card ── */}
        <div style={{ ...cardStyle, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button onClick={() => navigate(-1)} aria-label="Go back" style={{
            width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--secondary)',
            cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FaArrowLeft size={13} color={C.primary} />
          </button>

          <img
            src={avatarError ? dummyUser : (user.profile || dummyUser)}
            onError={() => setAvatarError(true)}
            alt="Profile"
            style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--secondary)', flexShrink: 0 }}
          />

          <div style={{ flex: '1 1 240px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-strong)', wordBreak: 'break-word' }}>{user.name}</h4>
              {user.cid && user.cid !== 'N/A' && (
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--secondary-foreground)', background: 'var(--secondary)', padding: '3px 10px', borderRadius: 20 }}>
                  {user.cid}
                </span>
              )}
              {user.tag && (
                <span style={{ fontSize: 11, fontWeight: 700, color: C.info, background: '#dbeafe', padding: '3px 10px', borderRadius: 20 }}>
                  {prettifyTag(user.tag)}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 6, fontSize: 12.5, color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, wordBreak: 'break-all' }}>
                <FaEnvelope size={11} color={C.accent} /> {user.email}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FaPhoneAlt size={11} color={C.accent} /> {user.phoneNo || '—'}
              </span>
            </div>
          </div>

          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: user.isverified ? 'var(--success)' : 'var(--warning)',
            color: user.isverified ? 'var(--success-foreground)' : 'var(--warning-foreground)',
          }}>
            {user.isverified ? <FaCheckCircle size={11} /> : <FaHourglassHalf size={11} />}
            {user.isverified ? 'Verified' : 'Not verified'}
          </span>
        </div>

        {/* ── Summary cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Bills submitted', value: bills.length, sub: `${fmt(totalBilled)} billed`, icon: FaFileInvoice, color: 'var(--warning-foreground)', bg: 'var(--warning)' },
            { label: 'Bills paid', value: fmt(paidBilled), sub: `${bills.filter(b => ['Paid', 'Completed'].includes(b.paymentStatus)).length} of ${bills.length} paid`, icon: FaCheckCircle, color: 'var(--success-foreground)', bg: 'var(--success)' },
            { label: 'Payment requests', value: payments.length, sub: `${fmt(totalRequested)} requested`, icon: FaMoneyCheckAlt, color: C.info, bg: '#dbeafe' },
          ].map(({ label, value, sub, icon: Icon, color, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ ...labelStyle, color }}>{label}</div>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.55)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={12} color={color} />
                </span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 6, lineHeight: 1.1 }}>{value}</div>
              <div style={{ fontSize: 11, color, opacity: 0.8, marginTop: 3 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className="cd-grid">

          {/* LEFT: bills / payments */}
          <div style={{ minWidth: 0 }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: 'var(--muted)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                {tabs.map(({ key, label, icon: Icon, count }) => {
                  const active = activeTab === key;
                  return (
                    <button key={key} onClick={() => setActiveTab(key)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: active ? 'var(--primary)' : 'transparent',
                      color: active ? 'var(--primary-foreground, #fff)' : 'var(--foreground)',
                      fontSize: 12.5, fontWeight: 600, transition: 'background .15s',
                    }}>
                      <Icon size={12} color={active ? '#fff' : C.accent} /> {label}
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
                        background: active ? 'rgba(255,255,255,0.25)' : 'var(--secondary)',
                        color: active ? '#fff' : 'var(--secondary-foreground)',
                      }}>{count}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ padding: '14px 18px' }}>

                {/* Bills */}
                {activeTab === 'bills' && (
                  bills.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--text-muted)', fontSize: 13 }}>
                      <FaFileInvoice size={26} color={C.muted} style={{ marginBottom: 8 }} /><br />No bills submitted.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                            {['Firm', 'Work Area', 'LOA', 'Invoice', 'Amount', 'Status', 'Submitted', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {bills.map(bill => {
                            const { bg, color } = billStatusMeta(bill.paymentStatus);
                            return (
                              <tr key={bill._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-strong)' }}>{bill.firmName || '—'}</td>
                                <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{bill.workArea || '—'}</td>
                                <td style={tdStyle}>{bill.loaNo || '—'}</td>
                                <td style={tdStyle}>{bill.invoiceNo || '—'}</td>
                                <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--text-strong)' }}>{fmt(bill.amount)}</td>
                                <td style={tdStyle}>
                                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color }}>
                                    {bill.paymentStatus}
                                  </span>
                                </td>
                                <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: 12 }}>{fmtDate(bill.submittedAt)}</td>
                                <td style={tdStyle}>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    {bill.pdfurl && (
                                      <a href={bill.pdfurl} target="_blank" rel="noreferrer" style={{ ...smallBtn, textDecoration: 'none' }}>
                                        <FaFilePdf size={11} color={C.accent} /> File
                                      </a>
                                    )}
                                    <button onClick={() => navigate(`/admin/bill/${bill._id}`)} style={smallBtn}>
                                      Details <FiArrowRight size={11} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                )}

                {/* Payments */}
                {activeTab === 'payments' && (
                  payments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--text-muted)', fontSize: 13 }}>
                      <FaMoneyCheckAlt size={26} color={C.muted} style={{ marginBottom: 8 }} /><br />No payment requests.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', minWidth: 780, borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                            {['Tender', 'Amount', 'Status', 'Type', 'Mode', 'Submitted', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map(payment => {
                            const { bg, color, Icon } = payStatusMeta(payment.status);
                            return (
                              <tr key={payment._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-strong)' }}>{payment.tender || '—'}</td>
                                <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--text-strong)' }}>{fmt(payment.amount)}</td>
                                <td style={tdStyle}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color }}>
                                    <Icon size={10} color={color} /> {payment.status}
                                  </span>
                                </td>
                                <td style={tdStyle}>{payment.paymentType || '—'}</td>
                                <td style={tdStyle}>{payment.paymentMode || '—'}</td>
                                <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: 12 }}>{fmtDate(payment.submittedAt)}</td>
                                <td style={tdStyle}>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    {payment.image && (
                                      <a href={payment.image} target="_blank" rel="noreferrer" style={{ ...smallBtn, textDecoration: 'none' }}>
                                        <FaFilePdf size={11} color={C.accent} /> Proof
                                      </a>
                                    )}
                                    <button onClick={() => navigate(`/admin/payment-request/${payment._id}`)} style={smallBtn}>
                                      Details <FiArrowRight size={11} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: details + admin controls */}
          <div style={{ minWidth: 0 }}>

            <Section icon={FaBuilding} title="Contact & Firm">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Firm" value={user.firmName} icon={FaBuilding} />
                <Field label="GST number" value={user.gstno} icon={FaIdCard} mono />
                <Field label="Address" value={user.address} icon={FaMapMarkerAlt} />
              </div>
            </Section>

            <Section icon={FaUniversity} title="Bank Details">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Bank" value={user.bankName} />
                <Field label="Account number" value={user.accountNo} mono />
                <Field label="IFSC" value={user.ifscCode} mono />
                <Field label="UPI" value={user.upi} mono />
              </div>
            </Section>

            <Section icon={FaUserShield} title="Account Controls">
              {/* CID */}
              <div>
                <label htmlFor="cd-cid" style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Client ID (CID)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input id="cd-cid" type="text" value={cid} onChange={(e) => setCid(e.target.value)} style={ctrlStyle} />
                  <button onClick={() => handleCidUpdate(user._id)} disabled={updating}
                    style={{ ...primaryBtn, cursor: updating ? 'not-allowed' : 'pointer', opacity: updating ? 0.7 : 1 }}>
                    {updating ? 'Saving…' : 'Update'}
                  </button>
                </div>
              </div>

              {/* Tag */}
              <div style={{ marginTop: 16 }}>
                <label htmlFor="cd-tag" style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>User tag</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select id="cd-tag" value={tag} onChange={(e) => setTag(e.target.value)} style={{ ...ctrlStyle, cursor: 'pointer' }}>
                    <option value="">Select tag</option>
                    {TAG_OPTIONS.map((t) => (
                      <option key={t} value={t}>{prettifyTag(t)}</option>
                    ))}
                  </select>
                  <button onClick={() => handleTagUpdate(user._id)} disabled={updatingTag}
                    style={{ ...primaryBtn, cursor: updatingTag ? 'not-allowed' : 'pointer', opacity: updatingTag ? 0.7 : 1 }}>
                    {updatingTag ? 'Saving…' : 'Update'}
                  </button>
                </div>
              </div>

              {/* System info */}
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Verification" value={user.isverified ? 'Verified' : 'Not verified'}
                  color={user.isverified ? C.success : 'var(--warning-foreground)'} />
                <Field label="Last login" icon={FaClock}
                  value={user.lastlogin ? new Date(user.lastlogin).toLocaleString('en-IN') : '—'} />
              </div>
            </Section>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: var(--input); color: var(--foreground); }
        input:focus, select:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(107, 62, 43, 0.14); }
        .cd-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 16px; align-items: start; }
        @media (max-width: 991px) { .cd-grid { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
    </>
  );
}
