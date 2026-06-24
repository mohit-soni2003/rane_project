import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminHeader from '../../component/header/AdminHeader';
import { getPaymentRequestById } from '../../services/paymentService';
import { getTransactionsByPaymentId } from '../../services/transactionService';
import { backend_url } from '../../store/keyStore';
import { Image } from 'react-bootstrap';
import {
  FaReceipt, FaPenSquare, FaCreditCard, FaChartBar, FaIdBadge,
  FaFilePdf, FaExclamationTriangle, FaCheckCircle,
} from 'react-icons/fa';

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
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16,
};
const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--input)', color: 'var(--foreground)',
  border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px',
  fontSize: 14, outline: 'none', fontFamily: 'inherit',
};

// ── Module-scope helpers (avoid input remount / focus loss) ────────────────────
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

function Field({ label, value, full, color, pre }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto', minWidth: 0 }}>
      <div style={labelStyle}>{label}</div>
      <div style={{
        fontSize: 14, fontWeight: 600, marginTop: 3,
        color: color || 'var(--text-strong)',
        wordBreak: 'break-word', whiteSpace: pre ? 'pre-wrap' : 'normal',
      }}>
        {value === 0 || value ? value : '—'}
      </div>
    </div>
  );
}

const statusMeta = (status) => {
  switch (status) {
    case 'Paid':
    case 'Completed':
      return { bg: 'var(--success)', color: 'var(--success-foreground)' };
    case 'Sanctioned':
      return { bg: '#dbeafe', color: '#1e40af' };
    case 'Pending':
      return { bg: 'var(--warning)', color: 'var(--warning-foreground)' };
    case 'Reject':
    case 'Rejected':
    case 'Overdue':
      return { bg: '#fde8e6', color: 'var(--destructive)' };
    default:
      return { bg: 'var(--secondary)', color: 'var(--secondary-foreground)' };
  }
};
const StatusBadge = ({ status }) => {
  const { bg, color } = statusMeta(status);
  return (
    <span style={{
      display: 'inline-block', padding: '3px 12px', borderRadius: 20,
      fontSize: 12, fontWeight: 700, background: bg, color,
    }}>
      {status || '—'}
    </span>
  );
};

export default function SinglePRdetailAdminPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [refMode, setRefMode] = useState('');
  const [expenseNo, setExpenseNo] = useState('');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [payment, txn] = await Promise.all([
          getPaymentRequestById(id),
          getTransactionsByPaymentId(id)
        ]);
        setPaymentData(payment);
        setTransactions(txn);
        setRefMode(payment.refMode || '');
        setExpenseNo(payment.expenseNo || 'Unpaid');
        setRemark(payment.remark || '');
      } catch (error) {
        console.error(error);
        setErr('Failed to load payment request or transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  const updatePaymentStatus = async () => {
    if (!selectedStatus) {
      alert('Please select a payment status!');
      return;
    }

    try {
      const response = await fetch(`${backend_url}/payment/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus, refMode, expenseNo, remark }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Payment status updated successfully!');
        setPaymentData(data);
      } else {
        alert(data.error || 'Failed to update payment status');
      }
    } catch (err) {
      alert('Server error: ' + err.message);
    }
  };

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
        <div style={{ textAlign: 'center', marginTop: 60, fontFamily: 'system-ui, sans-serif' }}>
          <Spin />
          <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Loading payment request details…</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  if (err || !paymentData) {
    return (
      <>
        <AdminHeader />
        <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--destructive)', fontFamily: 'system-ui, sans-serif' }}>
          <FaExclamationTriangle size={28} color="var(--destructive)" />
          <p style={{ marginTop: 10 }}>{err || 'Payment Request not found'}</p>
        </div>
      </>
    );
  }

  const {
    reason, amount, submittedAt, status, sanctionedAmount, note, sanctionDate, user = {}
  } = paymentData;

  const totalPaid = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const remaining = Math.max((sanctionedAmount || amount || 0) - totalPaid, 0);
  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <>
      <AdminHeader />

      <div style={{
        padding: '0 2px', fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--foreground)', background: 'var(--background)', minHeight: '100vh',
      }}>

        {/* ── Request Information ── */}
        <Section icon={FaReceipt} title="Request Information" right={<StatusBadge status={status} />}>
          <div style={gridStyle}>
            <Field label="Expense No" value={expenseNo} />
            <Field label="Reference Mode" value={refMode} />
            <Field label="Request Type" value={paymentData.paymentType} />
            <Field label="Client Payment Preference" value={paymentData.paymentMOde} />
            <Field label="Status" value={<StatusBadge status={status} />} />
            <Field label="Requested Amount" value={fmt(amount)} color="var(--destructive)" />
            <Field label="Request Date" value={submittedAt ? new Date(submittedAt).toLocaleString() : '—'} />
            <Field label="Sanction Date" value={sanctionDate ? new Date(sanctionDate).toLocaleString() : '—'} />
            <Field label="Sanctioned Amount" value={sanctionedAmount ? fmt(sanctionedAmount) : '—'} color="var(--success-foreground)" />
            <Field label="Note" full value={note} color="var(--text-muted)" pre />
            <Field label="Reason" full value={reason} color="var(--text-muted)" pre />
            <Field label="Remark (by admin)" full value={remark} color="var(--text-muted)" pre />
          </div>

          <div style={{ marginTop: 16 }}>
            <a href={paymentData.image} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8, background: 'var(--primary)', color: 'var(--primary-foreground)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              <FaFilePdf size={13} color="var(--primary-foreground)" /> View PDF
            </a>
          </div>
        </Section>

        {/* ── Update Information ── */}
        <Section icon={FaPenSquare} title="Update Information">
          <div style={gridStyle}>
            <div>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Reference Mode</label>
              <input type="text" value={refMode} onChange={(e) => setRefMode(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Expense No</label>
              <input type="text" value={expenseNo} onChange={(e) => setExpenseNo(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Remark</label>
            <input type="text" value={remark} onChange={(e) => setRemark(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ ...labelStyle, marginTop: 18, marginBottom: 8 }}>Status</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Pending', 'Overdue', 'Paid', 'Sanctioned', 'Rejected'].map((s) => {
              const active = selectedStatus === s;
              return (
                <label key={s}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                    background: active ? 'var(--secondary)' : 'var(--card)',
                    color: active ? 'var(--primary)' : 'var(--foreground)',
                    fontSize: 13, fontWeight: 600, transition: 'all .15s',
                  }}>
                  <input
                    type="radio"
                    name="paymentStatus"
                    value={s}
                    checked={active}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  {s}
                </label>
              );
            })}
          </div>

          <button onClick={updatePaymentStatus}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 18, padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--success)', color: 'var(--success-foreground)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <FaCheckCircle size={13} color="var(--success-foreground)" /> Update Payment Info
          </button>
        </Section>

        {/* ── Transaction Details ── */}
        <Section icon={FaCreditCard} title="Transaction Details">
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-foreground)' }}>
              <FaExclamationTriangle size={22} color="var(--muted-foreground)" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 13 }}>No transactions found for this request.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 950, borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                    {['#', 'Amount', 'Bank', 'Account No', 'IFSC', 'UPI', 'Transaction Date', 'Sent To', 'Done By'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn, idx) => (
                    <tr key={txn._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px' }}>{idx + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--success-foreground)', whiteSpace: 'nowrap' }}>{fmt(txn.amount)}</td>
                      <td style={{ padding: '10px 12px' }}>{txn.bankName || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{txn.accNo || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{txn.ifscCode || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{txn.upiId || '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {txn.transactionDate ? new Date(txn.transactionDate).toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{txn.userId?.name || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{txn.created_by || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* ── Summary ── */}
        <Section icon={FaChartBar} title="Summary">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { label: 'Total Amount Requested', value: fmt(amount || 0), color: 'var(--text-strong)', bg: 'var(--secondary)' },
              { label: 'Total Amount Paid', value: fmt(totalPaid), color: 'var(--success-foreground)', bg: 'var(--success)' },
              { label: 'Amount Remaining', value: fmt(Math.max((Number(amount) || 0) - totalPaid, 0)), color: 'var(--destructive)', bg: '#fde8e6' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ background: bg, border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ ...labelStyle, color }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color, marginTop: 6 }}>{value}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── User Information ── */}
        <Section icon={FaIdBadge} title="User Information">
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Profile */}
            <div style={{ textAlign: 'center', flex: '0 0 140px' }}>
              <Image src={user?.profile || 'https://via.placeholder.com/150'} roundedCircle width={120} height={120}
                alt="User Profile"
                onClick={() => navigate(`/admin/client-detail/${user._id}`)}
                style={{ border: '3px solid var(--secondary)', background: 'var(--muted)', objectFit: 'cover', cursor: 'pointer' }} />
              <div style={{ marginTop: 10, fontWeight: 700, color: 'var(--text-strong)' }}>{user?.name || '—'}</div>
            </div>

            {/* Details */}
            <div style={{ flex: '1 1 300px', minWidth: 0 }}>
              <div style={gridStyle}>
                <Field label="Email" value={user?.email} />
                <Field label="Client ID (CID)" value={user?.cid} />
                <Field label="Phone" value={user?.phoneNo} />
                <Field label="Firm Name" value={user?.firmName} />
                <Field label="Address" full value={user?.address} color="var(--text-muted)" />
                <Field label="Bank Name" value={user?.bankName} />
                <Field label="Account No" value={user?.accountNo} />
                <Field label="IFSC Code" value={user?.ifscCode} />
                <Field label="UPI" value={user?.upi} />
                <Field label="GST No" value={user?.gstno} />
              </div>
            </div>
          </div>
        </Section>

      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}