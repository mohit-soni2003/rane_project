import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminHeader from '../../component/header/AdminHeader';
import { createBillRemark, getBillById, getBillRemarks, updateWithdrawStatus, deleteBill } from '../../services/billServices';
import { getTransactionsByBillId } from '../../services/transactionService';
import { getPayNotesByBill } from '../../services/paynoteServices';
import { Modal, Form, Button, Alert, Spinner, Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaFileInvoiceDollar, FaFilePdf, FaPlus, FaListUl, FaUndo, FaCreditCard,
  FaChartBar, FaLink, FaCommentDots, FaIdBadge, FaTrash, FaFileAlt,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaRupeeSign,
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

// ── Module-scope helpers (defined here to avoid input remount/focus loss) ──────
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
      <div style={{
        fontSize: 14, fontWeight: 600, marginTop: 3,
        color: color || 'var(--text-strong)', wordBreak: 'break-word',
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
    case 'Approved':
      return { bg: 'var(--success)', color: 'var(--success-foreground)' };
    case 'Sanctioned':
      return { bg: '#dbeafe', color: '#1e40af' };
    case 'Pending':
    case 'Requested':
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

export default function SingleBillDetailAdminPage() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionErr, setActionErr] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [paynotes, setPaynotes] = useState([]);
  const [showPaynoteModal, setShowPaynoteModal] = useState(false);
  const [remarks, setRemarks] = useState([]);
  const [remarkText, setRemarkText] = useState('');
  const [remarksLoading, setRemarksLoading] = useState(false);
  const [addingRemark, setAddingRemark] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigate = useNavigate();

  const handleApprove = async () => {
    try {
      setActionErr('');
      setActionLoading(true);
      const response = await updateWithdrawStatus(id, 'Approved');
      if (response.deleted) {
        setTimeout(() => {
          navigate('/admin/bill');
        }, 1500);
      } else {
        setBill(response);
      }
      setShowApproveModal(false);
      navigate('/admin/bill');
    } catch (error) {
      console.error(error);
      setActionErr(error.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionErr('');
      setActionLoading(true);
      const updated = await updateWithdrawStatus(id, 'Rejected', rejectReason);
      setBill(updated);
      toast.success('Withdrawal request rejected');
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error) {
      console.error(error);
      const msg = error.message || 'Failed to reject';
      setActionErr(msg);
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewPaynote = async () => {
    try {
      const response = await getPayNotesByBill(id);
      setPaynotes(response.paynotes);
      setShowPaynoteModal(true);
    } catch (error) {
      toast.error('Failed to fetch paynotes');
    }
  };

  const handleAddPaynote = () => {
    navigate('/admin/add-paynote?billId=' + id);
  };

  const handleDelete = async () => {
    try {
      setActionErr('');
      setActionLoading(true);
      await deleteBill(id);
      toast.success('Bill deleted successfully');
      setTimeout(() => {
        navigate('/admin/bill');
      }, 1500);
    } catch (error) {
      console.error(error);
      const msg = error.message || 'Failed to delete bill';
      setActionErr(msg);
      toast.error(msg);
      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddRemark = async () => {
    try {
      if (!remarkText.trim()) {
        toast.error('Please enter a remark');
        return;
      }
      setAddingRemark(true);
      const response = await createBillRemark(id, remarkText.trim());
      setRemarks(response.remarks || []);
      setRemarkText('');
      toast.success('Remark added successfully');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to add remark');
    } finally {
      setAddingRemark(false);
    }
  };

  useEffect(() => {
    const fetchBillAndTransactions = async () => {
      try {
        setRemarksLoading(true);
        const [billData, transactionData] = await Promise.all([
          getBillById(id),
          getTransactionsByBillId(id)
        ]);
        setBill(billData);
        setTransactions(transactionData);
        console.log("transaction data in single bill detail page", transactions);

        try {
          const remarksData = await getBillRemarks(id);
          setRemarks(remarksData || []);
        } catch (remarkError) {
          console.error('Failed to load remarks:', remarkError);
          setRemarks([]);
        }
      } catch (error) {
        console.error(error);
        setErr('Failed to load bill or transactions');
      } finally {
        setRemarksLoading(false);
        setLoading(false);
      }
    };

    fetchBillAndTransactions();
  }, [id]);

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
          <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Loading bill details…</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  if (err || !bill) {
    return (
      <>
        <AdminHeader />
        <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--destructive)', fontFamily: 'system-ui, sans-serif' }}>
          <FaExclamationTriangle size={28} color="var(--destructive)" />
          <p style={{ marginTop: 10 }}>{err || 'Bill not found'}</p>
        </div>
      </>
    );
  }

  const {
    firmName, workArea, loaNo, agreement, invoiceNo, amount, workDescription,
    pdfurl, submittedAt, paymentStatus, paymentDate, user = {}
  } = bill;

  const totalPaid = transactions.reduce((total, txn) => total + (txn.amount || 0), 0);
  const remaining = Math.max((Number(amount) || 0) - totalPaid, 0);
  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  // Themed action button helper for modal footers
  const modalBtn = (bg, color) => ({
    background: bg, color, border: 'none', borderRadius: 8, fontWeight: 600,
  });

  return (
    <>
      <AdminHeader />
      <ToastContainer position="top-right" />

      <div style={{
        padding: '0 2px', fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--foreground)', background: 'var(--background)', minHeight: '100vh',
      }}>

        {/* ── Bill Information ── */}
        <Section icon={FaFileInvoiceDollar} title="Bill Information">
          <div style={gridStyle}>
            <Field label="Firm Name" value={firmName} />
            <Field label="Work Area" value={workArea} />
            <Field label="LOA No" value={loaNo} />
            <Field label="Invoice No" value={invoiceNo} />
            <Field label="Amount" value={amount ? fmt(amount) : '—'} color="var(--destructive)" />
            <Field label="Status" value={<StatusBadge status={paymentStatus} />} />
            <Field label="Submitted At" value={submittedAt ? new Date(submittedAt).toLocaleDateString() : '—'} />
            <Field label="Payment Date" value={paymentDate ? new Date(paymentDate).toLocaleDateString() : '—'} />
            <Field label="Work Description" full value={workDescription} color="var(--text-muted)" />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <a href={pdfurl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8, background: 'var(--primary)', color: 'var(--primary-foreground)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              <FaFilePdf size={13} color="var(--primary-foreground)" /> View PDF
            </a>
            <button onClick={handleAddPaynote}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--success)', color: 'var(--success-foreground)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <FaPlus size={12} color="var(--success-foreground)" /> Add Paynote
            </button>
            <button onClick={handleViewPaynote}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--secondary-foreground)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <FaListUl size={12} color="var(--secondary-foreground)" /> View Paynote
            </button>
          </div>
        </Section>

        {/* ── Withdraw Request (if any) ── */}
        {bill.withdrawStatus && (
          <Section icon={FaUndo} title="Withdraw Request"
            right={<StatusBadge status={bill.withdrawStatus} />}>
            <div style={gridStyle}>
              <Field label="Request Status" value={bill.withdrawStatus} />
              <Field label="Requested At" value={bill.withdrawRequestedAt ? new Date(bill.withdrawRequestedAt).toLocaleString() : '—'} />
              <Field label="Reason" full value={bill.withdrawReason} color="var(--text-muted)" />
              {bill.withdrawApprovedAt && (
                <Field label="Decision At" value={new Date(bill.withdrawApprovedAt).toLocaleString()} />
              )}
            </div>

            {bill.withdrawStatus === 'Requested' && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 16 }}>
                <button disabled={actionLoading} onClick={() => setShowApproveModal(true)}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--success)', color: 'var(--success-foreground)', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                  Approve
                </button>
                <button disabled={actionLoading} onClick={() => setShowRejectModal(true)}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--destructive)', color: 'var(--destructive-foreground)', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                  Reject
                </button>
                {actionLoading && <Spin size={20} />}
                {actionErr && <span style={{ color: 'var(--destructive)', fontSize: 13 }}>{actionErr}</span>}
              </div>
            )}
          </Section>
        )}

        {/* ── Transaction Details ── */}
        <Section icon={FaCreditCard} title="Transaction Details">
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted-foreground)' }}>
              <FaExclamationTriangle size={22} color="var(--muted-foreground)" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 13 }}>No transactions found for this bill.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                    {['#', 'Amount', 'Bank', 'Account', 'IFSC', 'UPI', 'Payment Note', 'Date', 'Sent To', 'Done By'].map(h => (
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
                      <td style={{ padding: '10px 12px' }}>
                        {txn.accNo ? txn.accNo.slice(0, 4) + '****' + txn.accNo.slice(-4) : '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>{txn.ifscCode || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{txn.upiId || '—'}</td>
                      <td style={{ padding: '10px 12px', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={txn.payNote || ''}>{txn.payNote || '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {txn.transactionDate ? new Date(txn.transactionDate).toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Image src={txn.userId?.profile || 'https://via.placeholder.com/40'} roundedCircle width={30} height={30}
                            alt={txn.userId?.name || 'User'} style={{ objectFit: 'cover', border: '1px solid var(--border)' }} />
                          <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${txn._id}`}>{txn.userId?.name || 'User'}</Tooltip>}>
                            <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                              {txn.userId?.name || '—'}
                            </span>
                          </OverlayTrigger>
                        </div>
                      </td>
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
              { label: 'Amount Remaining', value: fmt(remaining), color: 'var(--destructive)', bg: '#fde8e6' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ background: bg, border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ ...labelStyle, color }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color, marginTop: 6 }}>{value}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Agreement Linked Details ── */}
        <Section icon={FaLink} title="Agreement Linked Details">
          {agreement ? (
            <>
              <div style={gridStyle}>
                <Field label="Agreement No" value={agreement.agreementId || agreement._id} />
                <Field label="Title" value={agreement.title} />
                <Field label="Status" value={agreement.status ? <span style={{ textTransform: 'capitalize' }}>{agreement.status}</span> : '—'} />
                <Field label="Uploaded At" value={agreement.uploadedAt ? new Date(agreement.uploadedAt).toLocaleDateString() : '—'} />
                <Field label="Signed At" value={agreement.signedAt ? new Date(agreement.signedAt).toLocaleDateString() : '—'} />
                <Field label="Expiry Date" value={agreement.expiryDate ? new Date(agreement.expiryDate).toLocaleDateString() : '—'} />
                <Field label="Description" full value={agreement.description} color="var(--text-muted)" />
              </div>
              <div style={{ marginTop: 14 }}>
                <a href={agreement.fileUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8, background: 'var(--primary)', color: 'var(--primary-foreground)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  <FaFileAlt size={13} color="var(--primary-foreground)" /> View Agreement File
                </a>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted-foreground)', fontSize: 13 }}>
              No agreement linked with this bill.
            </div>
          )}
        </Section>

        {/* ── Remarks ── */}
        <Section icon={FaCommentDots} title="Remarks">
          {remarksLoading ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}><Spin size={22} /></div>
          ) : remarks.length > 0 ? (
            <div style={{ marginBottom: 16 }}>
              {remarks.map((remark) => (
                <div key={remark._id || remark.createdAt}
                  style={{ background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-strong)', marginBottom: 8, fontSize: 14 }}>
                    {remark.text || '—'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Image src={remark.createdBy?.profile || 'https://via.placeholder.com/28'} roundedCircle width={26} height={26}
                      alt={remark.createdBy?.name || 'User'} style={{ objectFit: 'cover', border: '1px solid var(--border)' }} />
                    <small style={{ color: 'var(--text-muted)' }}>Created By: {remark.createdBy?.name || 'Unknown'}</small>
                  </div>
                  <small style={{ color: 'var(--text-muted)', display: 'block' }}>
                    Date: {remark.createdAt ? new Date(remark.createdAt).toLocaleString() : '—'}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 13 }}>No remarks yet.</div>
          )}

          <div style={{ marginBottom: 10 }}>
            <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Add Remark</label>
            <textarea
              rows={3}
              placeholder="Write your remark here…"
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box', resize: 'vertical',
                background: 'var(--input)', color: 'var(--foreground)',
                border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px',
                fontSize: 14, outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
          <button onClick={handleAddRemark} disabled={addingRemark}
            style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'var(--primary-foreground)', fontSize: 13, fontWeight: 600, cursor: addingRemark ? 'not-allowed' : 'pointer', opacity: addingRemark ? 0.7 : 1 }}>
            {addingRemark ? 'Adding…' : 'Add Remark'}
          </button>
        </Section>

        {/* ── User Information ── */}
        <Section icon={FaIdBadge} title="User Information">
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Profile */}
            <div style={{ textAlign: 'center', flex: '0 0 140px' }}>
              <Image src={user?.profile || 'https://via.placeholder.com/150'} roundedCircle width={120} height={120}
                alt="User Profile"
                onClick={() => { navigate(`/admin/client-detail/${user._id}`); }}
                style={{ border: '3px solid var(--secondary)', background: 'var(--muted)', objectFit: 'cover', cursor: 'pointer' }} />
              <div style={{ marginTop: 10, fontWeight: 700, color: 'var(--text-strong)' }}>{user?.name || '—'}</div>
            </div>

            {/* Details */}
            <div style={{ flex: '1 1 300px', minWidth: 0 }}>
              <div style={gridStyle}>
                <Field label="Email" value={user?.email} />
                <Field label="Client ID (CID)" value={user?.cid} />
                <Field label="Firm Name" value={user?.firmName} />
                <Field label="Phone" value={user?.phoneNo} />
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

        {/* ── Delete Bill ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <button onClick={() => setShowDeleteModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--destructive)', color: 'var(--destructive-foreground)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <FaTrash size={13} color="var(--destructive-foreground)" /> Delete Bill
          </button>
        </div>
      </div>

      {/* ── Approve Modal ── */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaCheckCircle color="var(--success-foreground)" /> Approve Withdraw Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}>
          <div style={{ padding: 14, borderRadius: 8, marginBottom: 14, background: 'var(--muted)', borderLeft: '4px solid var(--success)' }}>
            <strong>⚠️ Important</strong>
            <p style={{ margin: '8px 0 0' }}>
              This request will mark the bill as <strong>Withdrawed</strong> and update withdraw approval details. The bill will not be deleted completely.
            </p>
          </div>
          <div style={{ marginBottom: 14 }}>
            <small style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Bill Details:</small>
            <div style={{ marginTop: 8, padding: 10, background: 'var(--muted)', borderRadius: 6 }}>
              <div><strong>Firm:</strong> {bill?.firmName}</div>
              <div><strong>Amount:</strong> {fmt(bill?.amount)}</div>
              <div><strong>Invoice:</strong> {bill?.invoiceNo}</div>
              <div><strong>Reason:</strong> {bill?.withdrawReason || 'Not provided'}</div>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Are you sure you want to approve this withdrawal request? The bill status will be updated, not deleted.
          </p>
          {actionErr && <Alert variant="danger" className="mb-0">{actionErr}</Alert>}
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--secondary)', borderTop: '1px solid var(--border)' }}>
          <Button onClick={() => setShowApproveModal(false)} disabled={actionLoading} style={modalBtn('var(--muted)', 'var(--text-strong)')}>Cancel</Button>
          <Button onClick={handleApprove} disabled={actionLoading} style={modalBtn('var(--success)', 'var(--success-foreground)')}>
            {actionLoading ? (<><Spinner as="span" animation="border" size="sm" className="me-2" />Approving…</>) : 'Yes, Approve Request'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Reject Modal ── */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaTimesCircle color="var(--destructive)" /> Reject Withdraw Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="rejectNote" style={{ color: 'var(--text-strong)', fontWeight: 600 }}>
                Rejection Note <span className="text-muted">(Optional)</span>
              </Form.Label>
              <Form.Control id="rejectNote" as="textarea" rows={4}
                placeholder="Provide a reason for rejecting this withdrawal request. This will be sent to the client."
                value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                style={{ backgroundColor: 'var(--input)', color: 'var(--text-strong)', border: '1px solid var(--border)' }} />
            </Form.Group>
            <div className="mb-3">
              <small style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Bill Details:</small>
              <div style={{ marginTop: 8, padding: 10, background: 'var(--muted)', borderRadius: 6 }}>
                <div><strong>Firm:</strong> {bill?.firmName}</div>
                <div><strong>Amount:</strong> {fmt(bill?.amount)}</div>
                <div><strong>Invoice:</strong> {bill?.invoiceNo}</div>
                <div><strong>Reason:</strong> {bill?.withdrawReason || 'Not provided'}</div>
              </div>
            </div>
            {actionErr && <Alert variant="danger" className="mb-0">{actionErr}</Alert>}
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--secondary)', borderTop: '1px solid var(--border)' }}>
          <Button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} disabled={actionLoading} style={modalBtn('var(--muted)', 'var(--text-strong)')}>Cancel</Button>
          <Button onClick={handleReject} disabled={actionLoading} style={modalBtn('var(--destructive)', 'var(--destructive-foreground)')}>
            {actionLoading ? (<><Spinner as="span" animation="border" size="sm" className="me-2" />Rejecting…</>) : 'Reject Request'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Delete Bill Modal ── */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaExclamationTriangle color="var(--destructive)" /> Delete Bill
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}>
          <div style={{ background: 'var(--destructive-bg)', border: '1px solid var(--destructive-border)', borderRadius: 8, padding: 14, color: 'var(--destructive)' }}>
            <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FaExclamationTriangle size={14} color="var(--destructive)" /> Warning!
            </strong>
            <p style={{ margin: '8px 0 0' }}>
              This action will permanently delete the bill from the system. <strong>All transactions related to this bill will also be deleted.</strong> This action cannot be undone.
            </p>
          </div>
          {actionErr && <Alert variant="danger" className="mt-3 mb-0">{actionErr}</Alert>}
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--secondary)', borderTop: '1px solid var(--border)' }}>
          <Button onClick={() => setShowDeleteModal(false)} disabled={actionLoading} style={modalBtn('var(--muted)', 'var(--text-strong)')}>Cancel</Button>
          <Button onClick={handleDelete} disabled={actionLoading} style={modalBtn('var(--destructive)', 'var(--destructive-foreground)')}>
            {actionLoading ? (<><Spinner as="span" animation="border" size="sm" className="me-2" />Deleting…</>) : 'Yes, Delete Bill Completely'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Paynote Modal ── */}
      <Modal show={showPaynoteModal} onHide={() => setShowPaynoteModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', borderBottom: '1px solid var(--border)' }}>
          <Modal.Title style={{ fontSize: 17 }}>Paynotes for this Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--card)', color: 'var(--card-foreground)' }}>
          {paynotes.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                    {['Paynote No', 'Department', 'Status', 'Amount', 'Created At'].map(h => (
                      <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paynotes.map((paynote) => (
                    <tr key={paynote._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '9px 12px' }}>{paynote.payNoteNo}</td>
                      <td style={{ padding: '9px 12px' }}>{paynote.department}</td>
                      <td style={{ padding: '9px 12px' }}><StatusBadge status={paynote.status} /></td>
                      <td style={{ padding: '9px 12px' }}>{fmt(paynote.totalSanctionAmount)}</td>
                      <td style={{ padding: '9px 12px' }}>{new Date(paynote.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>No paynotes found for this bill.</p>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: 'var(--secondary)', borderTop: '1px solid var(--border)' }}>
          <Button onClick={() => setShowPaynoteModal(false)} style={modalBtn('var(--muted)', 'var(--text-strong)')}>Close</Button>
        </Modal.Footer>
      </Modal>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}