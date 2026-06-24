import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Image } from 'react-bootstrap';
import AdminHeader from '../../component/header/AdminHeader';
import { getUserFullDetails } from '../../services/userServices';
import dummyUser from '../../assets/images/dummyUser.jpeg';
import { backend_url } from '../../store/keyStore';
import {
  FaUser, FaEnvelope, FaPhoneAlt, FaArrowLeft, FaUniversity, FaIdCard,
  FaMoneyCheckAlt, FaFileInvoice, FaFilePdf, FaClipboardList,
  FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaExclamationTriangle,
} from "react-icons/fa";

// ── Shared styles ─────────────────────────────────────────────────────────────
const cardStyle = {
  background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)',
  boxShadow: '0 2px 10px var(--shadow-color)', overflow: 'hidden', marginBottom: 16,
};
const titleBarStyle = {
  borderBottom: '1px solid var(--border)', padding: '13px 20px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
};
const iconBadgeStyle = {
  width: 32, height: 32, borderRadius: 8, background: 'var(--warning)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};
const sectionTitleStyle = { fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' };
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const gridStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16,
};

function Section({ icon: Icon, title, right, children }) {
  return (
    <div style={cardStyle}>
      <div style={titleBarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={iconBadgeStyle}><Icon size={15} color="var(--primary)" /></div>
          <div style={sectionTitleStyle}>{title}</div>
        </div>
        {right}
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

function Field({ label, value, full, color }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto', minWidth: 0 }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3, color: color || 'var(--text-strong)', wordBreak: 'break-word' }}>
        {value === 0 || value ? value : '-'}
      </div>
    </div>
  );
}

const billStatusMeta = (status) => {
  switch (status) {
    case 'Paid':
    case 'Completed': return { bg: 'var(--success)', color: 'var(--success-foreground)' };
    case 'Reject':
    case 'Rejected': return { bg: '#fde8e6', color: 'var(--destructive)' };
    case 'Sanctioned': return { bg: '#dbeafe', color: '#1e40af' };
    default: return { bg: 'var(--warning)', color: 'var(--warning-foreground)' };
  }
};
const payStatusMeta = (status) => {
  switch (status) {
    case 'Paid': return { bg: 'var(--success)', color: 'var(--success-foreground)', Icon: FaCheckCircle };
    case 'Rejected': return { bg: '#fde8e6', color: 'var(--destructive)', Icon: FaTimesCircle };
    case 'Sanctioned': return { bg: '#dbeafe', color: '#1e40af', Icon: FaCheckCircle };
    default: return { bg: 'var(--warning)', color: 'var(--warning-foreground)', Icon: FaHourglassHalf };
  }
};

const thStyle = {
  padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
};
const tdStyle = { padding: '11px 12px', whiteSpace: 'nowrap' };

const TABS = [
  { key: 'bills', label: 'Bills', icon: FaFileInvoice },
  { key: 'payments', label: 'Payments', icon: FaMoneyCheckAlt },
  { key: 'future1', label: 'Future Option 1', icon: FaClipboardList },
  { key: 'future2', label: 'Future Option 2', icon: FaClipboardList },
];

export default function ClientDetailAdminPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cid, setCid] = useState('');
  const [activeTab, setActiveTab] = useState('bills');

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
  }, [userData]);

  const Spin = ({ size = 32 }) => (
    <span style={{
      display: 'inline-block', width: size, height: size,
      border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
      borderRadius: '50%', animation: 'spin 1s linear infinite',
    }} />
  );

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'system-ui, sans-serif' }}>
          <Spin />
          <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Loading client details…</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  if (!userData) {
    return (
      <>
        <AdminHeader />
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--destructive)', fontFamily: 'system-ui, sans-serif' }}>
          <FaExclamationTriangle size={28} color="var(--destructive)" />
          <p style={{ marginTop: 10 }}>No data found for this client.</p>
        </div>
      </>
    );
  }

  const { user, bills = [], payments = [] } = userData;
  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <>
      <AdminHeader />

      <div style={{
        padding: '0 2px', fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--foreground)', background: 'var(--background)', minHeight: '100vh',
      }}>

        {/* ── Profile Overview ── */}
        <div style={cardStyle}>
          <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ padding: 4, borderRadius: '50%', background: 'var(--secondary)', flexShrink: 0 }}>
              <Image src={user.profile || dummyUser} roundedCircle width={92} height={92} alt="Profile"
                style={{ objectFit: 'cover', border: '2px solid var(--border)' }} />
            </div>

            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <h4 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaUser size={16} color="var(--accent)" /> {user.name}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
                <FaEnvelope size={12} color="var(--text-muted)" /> {user.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                <FaPhoneAlt size={12} color="var(--text-muted)" /> {user.phoneNo || '-'}
              </div>
            </div>

            <button onClick={() => navigate(-1)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
              }}>
              <FaArrowLeft size={12} color="var(--secondary-foreground)" /> Back
            </button>
          </div>
        </div>

        {/* ── Bank & Firm Details ── */}
        <Section icon={FaUniversity} title="Bank & Firm Details">
          <div style={gridStyle}>
            <Field label="Firm" value={user.firmName} />
            <Field label="Account No" value={user.accountNo} />
            <Field label="Bank" value={user.bankName} />
            <Field label="IFSC" value={user.ifscCode} />
            <Field label="UPI" value={user.upi} />
          </div>
        </Section>

        {/* ── Compliance & System Info ── */}
        <Section icon={FaIdCard} title="Compliance & System Info"
          right={
            <span style={{
              padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: user.isverified ? 'var(--success)' : 'var(--warning)',
              color: user.isverified ? 'var(--success-foreground)' : 'var(--warning-foreground)',
            }}>
              {user.isverified ? 'Verified' : 'Not Verified'}
            </span>
          }>
          <div style={gridStyle}>
            <Field label="GST No" value={user.gstno} />
            <Field label="Last Login" value={user.lastlogin ? new Date(user.lastlogin).toLocaleString() : '-'} />
            <Field label="Verified" value={user.isverified ? 'Yes' : 'No'} color={user.isverified ? 'var(--success-foreground)' : 'var(--warning-foreground)'} />
          </div>

          {/* CID Update */}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Client ID (CID)</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                style={{
                  flex: '0 1 220px', minWidth: 160, background: 'var(--input)', color: 'var(--foreground)',
                  border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none',
                }}
              />
              <button onClick={() => handleCidUpdate(user._id)} disabled={updating}
                style={{
                  padding: '9px 18px', borderRadius: 8, border: 'none',
                  background: 'var(--primary)', color: 'var(--primary-foreground)',
                  fontSize: 13, fontWeight: 600, cursor: updating ? 'not-allowed' : 'pointer', opacity: updating ? 0.7 : 1,
                }}>
                {updating ? 'Updating…' : 'Update'}
              </button>
            </div>
          </div>
        </Section>

        {/* ── Tabs ── */}
        <div style={cardStyle}>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 4, padding: 6, background: 'var(--secondary)', flexWrap: 'wrap' }}>
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = activeTab === key;
              return (
                <button key={key} onClick={() => setActiveTab(key)}
                  style={{
                    flex: '1 1 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '9px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: active ? 'var(--card)' : 'transparent',
                    color: active ? 'var(--primary)' : 'var(--secondary-foreground)',
                    fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                    boxShadow: active ? '0 1px 4px var(--shadow-color)' : 'none',
                    transition: 'background .15s, color .15s',
                  }}>
                  <Icon size={13} color={active ? 'var(--primary)' : 'var(--secondary-foreground)'} /> {label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div style={{ padding: '16px 20px' }}>

            {/* Bills */}
            {activeTab === 'bills' && (
              bills.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No bills submitted.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                        {['Firm', 'Work Area', 'LOA', 'Invoice', 'Amount', 'Status', 'Submitted', 'PDF'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map(bill => {
                        const { bg, color } = billStatusMeta(bill.paymentStatus);
                        return (
                          <tr key={bill._id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-strong)' }}>{bill.firmName}</td>
                            <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{bill.workArea}</td>
                            <td style={tdStyle}>{bill.loaNo}</td>
                            <td style={tdStyle}>{bill.invoiceNo}</td>
                            <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--text-strong)' }}>{fmt(bill.amount)}</td>
                            <td style={tdStyle}>
                              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color }}>
                                {bill.paymentStatus}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{new Date(bill.submittedAt).toLocaleDateString()}</td>
                            <td style={tdStyle}>
                              <a href={bill.pdfurl} target="_blank" rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                                <FaFilePdf size={13} color="var(--accent)" /> View
                              </a>
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
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No payments available.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                        {['Tender', 'Amount', 'Status', 'Type', 'Mode', 'Submitted', 'Proof'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => {
                        const { bg, color, Icon } = payStatusMeta(payment.status);
                        return (
                          <tr key={payment._id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-strong)' }}>{payment.tender}</td>
                            <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--text-strong)' }}>{fmt(payment.amount)}</td>
                            <td style={tdStyle}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color }}>
                                <Icon size={10} color={color} /> {payment.status}
                              </span>
                            </td>
                            <td style={tdStyle}>{payment.paymentType}</td>
                            <td style={tdStyle}>{payment.paymentMode || '-'}</td>
                            <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{new Date(payment.submittedAt).toLocaleDateString()}</td>
                            <td style={tdStyle}>
                              {payment.image ? (
                                <a href={payment.image} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>View</a>
                              ) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Future tabs */}
            {(activeTab === 'future1' || activeTab === 'future2') && (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Coming soon…</p>
            )}

          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}