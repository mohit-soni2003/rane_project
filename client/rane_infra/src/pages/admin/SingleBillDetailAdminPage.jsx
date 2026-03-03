import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminHeader from '../../component/header/AdminHeader';
import { getBillById, updateWithdrawStatus } from '../../services/billServices';
import { getTransactionsByBillId } from '../../services/transactionService';
import { Container, Row, Col, Card, Image, Spinner, Table, Tooltip, OverlayTrigger, Modal, Form, Button, Alert } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

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

    useEffect(() => {
        const fetchBillAndTransactions = async () => {
            try {
                const [billData, transactionData] = await Promise.all([
                    getBillById(id),
                    getTransactionsByBillId(id)
                ]);
                setBill(billData);
                setTransactions(transactionData);
                console.log("transaction data in single bill detail page", transactions);
            } catch (error) {
                console.error(error);
                setErr('Failed to load bill or transactions');
            } finally {
                setLoading(false);
            }
        };

        fetchBillAndTransactions();
    }, [id]);

    if (loading) {
        return (
            <>
                <AdminHeader />
                <div className="text-center mt-5">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading bill details...</p>
                </div>
            </>
        );
    }

    if (err || !bill) {
        return (
            <>
                <AdminHeader />
                <div className="text-center mt-5 text-danger">
                    <p>{err || 'Bill not found'}</p>
                </div>
            </>
        );
    }

    const {
        firmName,
        workArea,
        loaNo,
        invoiceNo,
        amount,
        workDescription,
        pdfurl,
        submittedAt,
        paymentStatus,
        paymentDate,
        user = {}
    } = bill;

    return (
        <>
            <AdminHeader />
            <ToastContainer position="top-right" />
            <Container
                fluid
                className="py-4 my-3"
                style={{ backgroundColor: 'var(--background)', minHeight: '100vh', borderRadius: "20px" }}
            >
                {/* Bill Info */}
                <Card
                    className="mb-4 shadow-sm border-0"
                    style={{
                        background: "var(--card)",
                        color: "var(--card-foreground)",
                        borderRadius: "12px",
                    }}
                >
                    {/* Header */}
                    <Card.Header
                        className="d-flex align-items-center gap-2 fw-semibold"
                        style={{
                            background: "var(--secondary)",
                            color: "var(--secondary-foreground)",
                            borderBottom: "1px solid var(--border)",
                        }}
                    >
                        <i className="bi bi-receipt fs-5" style={{ color: "var(--accent)" }} />
                        Bill Information
                    </Card.Header>

                    {/* Body */}
                    <Card.Body>
                        <Row className="gy-3">
                            {/* Left Column */}
                            <Col md={6}>
                                <small className="text-muted">Firm Name</small>
                                <div className="fw-semibold">{firmName || "—"}</div>
                            </Col>

                            <Col md={6}>
                                <small className="text-muted">Work Area</small>
                                <div className="fw-semibold">{workArea || "—"}</div>
                            </Col>

                            <Col md={6}>
                                <small className="text-muted">LOA No</small>
                                <div className="fw-semibold">{loaNo || "—"}</div>
                            </Col>

                            <Col md={6}>
                                <small className="text-muted">Invoice No</small>
                                <div className="fw-semibold">{invoiceNo || "—"}</div>
                            </Col>

                            <Col md={6}>
                                <small className="text-muted">Amount</small>
                                <div
                                    className="fw-bold fs-5"
                                    style={{ color: "var(--destructive)" }}
                                >
                                    ₹{amount || "—"}
                                </div>
                            </Col>

                            <Col md={6}>
                                <small className="text-muted">Status : </small>
                                <div
                                    className=" py-1  fw-semibold "
                                    style={{
                                        color: "var(--warning-foreground)",
                                    }}
                                >
                                    {paymentStatus || "—"}
                                </div>
                            </Col>

                            <Col md={6}>
                                <small className="text-muted">Submitted At</small>
                                <div className="fw-semibold">
                                    {submittedAt
                                        ? new Date(submittedAt).toLocaleDateString()
                                        : "—"}
                                </div>
                            </Col>


                            <Col md={12}>
                                <small className="text-muted">Work Description</small>
                                <div
                                    className="mt-1"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    {workDescription || "—"}
                                </div>
                            </Col>

                            {/* Action */}
                            <Col md={12} className="mt-3">
                                <a
                                    href={pdfurl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm d-inline-flex align-items-center gap-2"
                                    style={{
                                        background: "var(--primary)",
                                        color: "var(--primary-foreground)",
                                        borderRadius: "8px",
                                    }}
                                >
                                    <i className="bi bi-file-earmark-pdf" />
                                    View PDF
                                </a>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>


                {/* Withdraw Request Info (if any) */}
                {bill.withdrawStatus && (
                    <Card
                        className="mb-4 shadow-sm border-0"
                        style={{
                            background: "var(--card)",
                            color: "var(--card-foreground)",
                            borderRadius: "12px",
                        }}
                    >
                        <Card.Header
                            className="d-flex align-items-center gap-2 fw-semibold"
                            style={{
                                background: "var(--secondary)",
                                color: "var(--secondary-foreground)",
                                borderBottom: "1px solid var(--border)",
                            }}
                        >
                            <i className="bi bi-arrow-counterclockwise fs-5" style={{ color: "var(--accent)" }} />
                            Withdraw Request
                        </Card.Header>

                        <Card.Body>
                            <Row className="gy-3">
                                <Col md={6}>
                                    <small className="text-muted">Request Status</small>
                                    <div className="fw-semibold">{bill.withdrawStatus || '—'}</div>
                                </Col>

                                <Col md={6}>
                                    <small className="text-muted">Requested At</small>
                                    <div className="fw-semibold">
                                        {bill.withdrawRequestedAt ? new Date(bill.withdrawRequestedAt).toLocaleString() : '—'}
                                    </div>
                                </Col>

                                <Col md={12}>
                                    <small className="text-muted">Reason</small>
                                    <div className="mt-1" style={{ color: "var(--text-muted)" }}>
                                        {bill.withdrawReason || '—'}
                                    </div>
                                </Col>

                                {bill.withdrawApprovedAt && (
                                    <Col md={6}>
                                        <small className="text-muted">Decision At</small>
                                        <div className="fw-semibold">{new Date(bill.withdrawApprovedAt).toLocaleString()}</div>
                                    </Col>
                                )}

                                {/* Action buttons only for pending requests */}
                                {bill.withdrawStatus === 'Requested' && (
                                    <Col md={12} className="mt-3 d-flex gap-2">
                                        <button
                                            className="btn btn-sm"
                                            style={{ background: 'var(--success)', color: 'var(--success-foreground)', borderRadius: '8px' }}
                                            disabled={actionLoading}
                                            onClick={() => setShowApproveModal(true)}
                                        >
                                            Approve
                                        </button>

                                        <button
                                            className="btn btn-sm"
                                            style={{ background: 'var(--destructive)', color: 'var(--destructive-foreground)', borderRadius: '8px' }}
                                            disabled={actionLoading}
                                            onClick={() => setShowRejectModal(true)}
                                        >
                                            Reject
                                        </button>

                                        {actionLoading && <Spinner animation="border" size="sm" />}
                                        {actionErr && <div className="text-danger ms-2">{actionErr}</div>}
                                    </Col>
                                )}
                            </Row>
                        </Card.Body>
                    </Card>
                )}



                {/* Transaction Info */}
                <Card
                    className="mb-4 shadow-sm border-0"
                    style={{
                        background: "var(--card)",
                        color: "var(--card-foreground)",
                        borderRadius: "12px",
                    }}
                >
                    {/* Header */}
                    <Card.Header
                        className="d-flex align-items-center gap-2 fw-semibold"
                        style={{
                            background: "var(--secondary)",
                            color: "var(--secondary-foreground)",
                            borderBottom: "1px solid var(--border)",
                        }}
                    >
                        <i className="bi bi-credit-card-2-front fs-5" style={{ color: "var(--accent)" }} />
                        Transaction Details
                    </Card.Header>

                    {/* Body */}
                    <Card.Body>
                        {transactions.length === 0 ? (
                            <div
                                className="text-center py-4"
                                style={{ color: "var(--muted-foreground)" }}
                            >
                                <i className="bi bi-info-circle fs-4 mb-2 d-block" />
                                No transactions found for this bill.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table
                                    hover
                                    className="align-middle mb-0"
                                    style={{
                                        borderColor: "var(--border)",
                                        fontSize: "0.875rem",
                                        marginBottom: "0",
                                    }}
                                >
                                    <thead
                                        style={{
                                            background: "var(--muted)",
                                            color: "var(--text-strong)",
                                        }}
                                    >
                                        <tr>
                                            <th style={{ padding: "8px 4px" }}>#</th>
                                            <th style={{ padding: "8px 4px" }}>Amount</th>
                                            <th style={{ padding: "8px 4px" }}>Bank</th>
                                            <th style={{ padding: "8px 4px" }}>Account</th>
                                            <th style={{ padding: "8px 4px" }}>IFSC</th>
                                            <th style={{ padding: "8px 4px" }}>UPI</th>
                                            <th style={{ padding: "8px 4px" }}>Payment Note</th>
                                            <th style={{ padding: "8px 4px" }}>Date</th>
                                            <th style={{ padding: "8px 4px" }}>Sent To</th>
                                            <th style={{ padding: "8px 4px" }}>Done By</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {transactions.map((txn, idx) => (
                                            <tr key={txn._id}>
                                                <td style={{ padding: "8px 4px" }}>{idx + 1}</td>

                                                <td className="fw-semibold" style={{ color: "var(--success-foreground)", padding: "8px 4px" }}>
                                                    ₹{txn.amount}
                                                </td>

                                                <td style={{ padding: "8px 4px" }}>{txn.bankName || "—"}</td>
                                                <td style={{ padding: "8px 4px" }}>
                                                    {txn.accNo
                                                        ? txn.accNo.slice(0, 4) + "****" + txn.accNo.slice(-4)
                                                        : "—"}
                                                </td>
                                                <td style={{ padding: "8px 4px" }}>{txn.ifscCode || "—"}</td>
                                                <td style={{ padding: "8px 4px" }}>{txn.upiId || "—"}</td>
                                                <td style={{ padding: "8px 4px", maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{txn.payNote || "—"}</td>

                                                <td style={{ padding: "8px 4px", fontSize: "0.8rem" }}>
                                                    {txn.transactionDate
                                                        ? new Date(txn.transactionDate).toLocaleString()
                                                        : "—"}
                                                </td>

                                                <td className="fw-semibold d-flex align-items-center gap-2" style={{ padding: "8px 4px" }}>
                                                    <Image
                                                        src={txn.userId?.profile || "https://via.placeholder.com/40"}
                                                        roundedCircle
                                                        width={32}
                                                        height={32}
                                                        alt={txn.userId?.name || "User"}
                                                        style={{ objectFit: "cover" }}
                                                    />
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={
                                                            <Tooltip id={`tooltip-${txn._id}`}>
                                                                {txn.userId?.name || "User"}
                                                            </Tooltip>
                                                        }
                                                    >
                                                        <span
                                                            style={{
                                                                maxWidth: "100px",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                                display: "inline-block",
                                                            }}
                                                        >
                                                            {txn.userId?.name || "—"}
                                                        </span>
                                                    </OverlayTrigger>
                                                </td>

                                                <td style={{ padding: "8px 4px" }}>{txn.created_by || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>


                {/* Summary Card */}

                <Card
                    className="mb-4 shadow-sm border-0"
                    style={{
                        background: "var(--card)",
                        color: "var(--card-foreground)",
                        borderRadius: "12px",
                    }}
                >
                    {/* Header */}
                    <Card.Header
                        className="d-flex align-items-center gap-2 fw-semibold"
                        style={{
                            background: "var(--secondary)",
                            color: "var(--secondary-foreground)",
                            borderBottom: "1px solid var(--border)",
                        }}
                    >
                        <i className="bi bi-bar-chart-fill fs-5" style={{ color: "var(--accent)" }} />
                        Summary
                    </Card.Header>

                    {/* Body */}
                    <Card.Body>
                        <Row className="gy-3 text-center">
                            {/* Total Requested */}
                            <Col md={4}>
                                <small className="text-muted">Total Amount Requested</small>
                                <div
                                    className="fw-bold fs-5 mt-1"
                                    style={{ color: "var(--text-strong)" }}
                                >
                                    ₹{amount || 0}
                                </div>
                            </Col>

                            {/* Total Paid */}
                            <Col md={4}>
                                <small className="text-muted">Total Amount Paid</small>
                                <div
                                    className="fw-bold fs-5 mt-1"
                                    style={{ color: "var(--success-foreground)" }}
                                >
                                    ₹
                                    {transactions.reduce(
                                        (total, txn) => total + (txn.amount || 0),
                                        0
                                    )}
                                </div>
                            </Col>

                            {/* Remaining */}
                            <Col md={4}>
                                <small className="text-muted">Amount Remaining</small>
                                <div
                                    className="fw-bold fs-5 mt-1"
                                    style={{ color: "var(--destructive)" }}
                                >
                                    ₹
                                    {Math.max(
                                        (Number(amount) || 0) -
                                        transactions.reduce(
                                            (total, txn) => total + (txn.amount || 0),
                                            0
                                        ),
                                        0
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* User Info */}
                <Card
                    className="mb-4 shadow-sm border-0"
                    style={{
                        background: "var(--card)",
                        color: "var(--card-foreground)",
                        borderRadius: "12px",
                    }}
                >
                    {/* Header */}
                    <Card.Header
                        className="d-flex align-items-center gap-2 fw-semibold"
                        style={{
                            background: "var(--secondary)",
                            color: "var(--secondary-foreground)",
                            borderBottom: "1px solid var(--border)",
                        }}
                    >
                        <i className="bi bi-person-badge fs-5" style={{ color: "var(--accent)" }} />
                        User Information
                    </Card.Header>

                    {/* Body */}
                    <Card.Body>
                        <Row className="gy-4 align-items-start">
                            {/* Profile */}
                            <Col
                                md={3}
                                className="text-center"
                            >
                                <Image
                                    src={user?.profile || "https://via.placeholder.com/150"}
                                    roundedCircle
                                    width={120}
                                    height={120}
                                    alt="User Profile"
                                    style={{
                                        border: "3px solid var(--secondary)",
                                        background: "var(--muted)",
                                    }}
                                    onClick={() => { navigate(`/admin/client-detail/${user._id}`) }}
                                />
                                <div
                                    className="mt-2 fw-semibold"
                                    style={{ color: "var(--text-strong)" }}
                                >
                                    {user?.name || "—"}
                                </div>
                            </Col>

                            {/* Details */}
                            <Col md={9}>
                                <Row className="gy-3" style={{ minWidth: 0 }}>
                                    <Col md={6}>
                                        <small className="text-muted">Email</small>
                                        <div className="fw-semibold">{user?.email || "—"}</div>
                                    </Col>

                                    <Col md={6}>
                                        <small className="text-muted">Client ID (CID)</small>
                                        <div className="fw-semibold">{user?.cid || "—"}</div>
                                    </Col>


                                    <Col md={6}>
                                        <small className="text-muted">Firm Name</small>
                                        <div className="fw-semibold">{user?.firmName || "—"}</div>
                                    </Col>
                                    <Col md={6}>
                                        <small className="text-muted">Phone</small>
                                        <div className="fw-semibold">{user?.phoneNo || "—"}</div>
                                    </Col>


                                    <Col md={12}>
                                        <small className="text-muted">Address</small>
                                        <div
                                            className="fw-semibold text-wrap"
                                            style={{
                                                color: "var(--text-muted)",
                                                wordWrap: "break-word",
                                                overflowWrap: "break-word",
                                                wordBreak: "break-word",
                                                whiteSpace: "normal",
                                                display: "block",
                                                width: "50%",
                                                minWidth: "200px",
                                            }}
                                        >
                                            {user?.address || "—"}
                                        </div>
                                    </Col>

                                    <Col md={6}>
                                        <small className="text-muted">Bank Name</small>
                                        <div className="fw-semibold">{user?.bankName || "—"}</div>
                                    </Col>

                                    <Col md={6}>
                                        <small className="text-muted">Account No</small>
                                        <div className="fw-semibold">{user?.accountNo || "—"}</div>
                                    </Col>

                                    <Col md={6}>
                                        <small className="text-muted">IFSC Code</small>
                                        <div className="fw-semibold">{user?.ifscCode || "—"}</div>
                                    </Col>

                                    <Col md={6}>
                                        <small className="text-muted">UPI</small>
                                        <div className="fw-semibold">{user?.upi || "—"}</div>
                                    </Col>

                                    <Col md={6}>
                                        <small className="text-muted">GST No</small>
                                        <div className="fw-semibold">{user?.gstno || "—"}</div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

            </Container>

            {/* Approve Modal */}
            <Modal
                show={showApproveModal}
                onHide={() => setShowApproveModal(false)}
                centered
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header
                    closeButton
                    style={{
                        background: 'var(--secondary)',
                        color: 'var(--secondary-foreground)',
                        borderBottom: '1px solid var(--border)',
                    }}
                >
                    <Modal.Title>
                        <i className="bi bi-check-circle me-2" style={{ color: 'var(--success)' }} />
                        Approve Withdraw Request
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    style={{
                        background: 'var(--card)',
                        color: 'var(--card-foreground)',
                    }}
                >
                    <div
                        className="p-3 rounded mb-3"
                        style={{
                            backgroundColor: 'var(--muted)',
                            borderLeft: '4px solid var(--success)',
                        }}
                    >
                        <strong>⚠️ Important</strong>
                        <p className="mb-0 mt-2">
                            This bill will be <strong>permanently deleted</strong> from the system once approved. This action cannot be undone.
                        </p>
                    </div>

                    <div className="mb-3">
                        <small className="text-muted fw-bold">Bill Details:</small>
                        <div className="mt-2 p-2" style={{ backgroundColor: 'var(--muted)', borderRadius: '4px' }}>
                            <div><strong>Firm:</strong> {bill?.firmName}</div>
                            <div><strong>Amount:</strong> ₹{bill?.amount}</div>
                            <div><strong>Invoice:</strong> {bill?.invoiceNo}</div>
                            <div><strong>Reason:</strong> {bill?.withdrawReason || 'Not provided'}</div>
                        </div>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Are you sure you want to approve this withdrawal request? The bill will be deleted permanently.
                    </p>

                    {actionErr && (
                        <Alert variant="danger" className="mb-0">
                            {actionErr}
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer
                    style={{
                        background: 'var(--secondary)',
                        borderTop: '1px solid var(--border)',
                    }}
                >
                    <Button
                        variant="secondary"
                        onClick={() => setShowApproveModal(false)}
                        disabled={actionLoading}
                        style={{
                            background: 'var(--muted)',
                            color: 'var(--text-strong)',
                            border: 'none',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        style={{
                            background: 'var(--success)',
                            color: 'var(--success-foreground)',
                            border: 'none',
                        }}
                    >
                        {actionLoading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Approving...
                            </>
                        ) : (
                            'Yes, Approve & Delete'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Reject Modal */}
            <Modal
                show={showRejectModal}
                onHide={() => setShowRejectModal(false)}
                centered
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header
                    closeButton
                    style={{
                        background: 'var(--secondary)',
                        color: 'var(--secondary-foreground)',
                        borderBottom: '1px solid var(--border)',
                    }}
                >
                    <Modal.Title>
                        <i className="bi bi-x-circle me-2" style={{ color: 'var(--destructive)' }} />
                        Reject Withdraw Request
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    style={{
                        background: 'var(--card)',
                        color: 'var(--card-foreground)',
                    }}
                >
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label
                                htmlFor="rejectNote"
                                style={{ color: 'var(--text-strong)', fontWeight: 600 }}
                            >
                                Rejection Note <span className="text-muted">(Optional)</span>
                            </Form.Label>
                            <Form.Control
                                id="rejectNote"
                                as="textarea"
                                rows={4}
                                placeholder="Provide a reason for rejecting this withdrawal request. This will be sent to the client."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                style={{
                                    backgroundColor: 'var(--muted)',
                                    color: 'var(--text-strong)',
                                    border: '1px solid var(--border)',
                                }}
                            />
                        </Form.Group>

                        <div className="mb-3">
                            <small className="text-muted fw-bold">Bill Details:</small>
                            <div className="mt-2 p-2" style={{ backgroundColor: 'var(--muted)', borderRadius: '4px' }}>
                                <div><strong>Firm:</strong> {bill?.firmName}</div>
                                <div><strong>Amount:</strong> ₹{bill?.amount}</div>
                                <div><strong>Invoice:</strong> {bill?.invoiceNo}</div>
                                <div><strong>Reason:</strong> {bill?.withdrawReason || 'Not provided'}</div>
                            </div>
                        </div>

                        {actionErr && (
                            <Alert variant="danger" className="mb-0">
                                {actionErr}
                            </Alert>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer
                    style={{
                        background: 'var(--secondary)',
                        borderTop: '1px solid var(--border)',
                    }}
                >
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowRejectModal(false);
                            setRejectReason('');
                        }}
                        disabled={actionLoading}
                        style={{
                            background: 'var(--muted)',
                            color: 'var(--text-strong)',
                            border: 'none',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReject}
                        disabled={actionLoading}
                        style={{
                            background: 'var(--destructive)',
                            color: 'var(--destructive-foreground)',
                            border: 'none',
                        }}
                    >
                        {actionLoading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Rejecting...
                            </>
                        ) : (
                            'Reject Request'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
