import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBillById, getBillTransactions, requestBillWithdraw } from '../../services/billServices';
import { getPayNotesByBill } from '../../services/paynoteServices';
import ClientHeader from '../../component/header/ClientHeader';
import {
    Container,
    Spinner,
    Alert,
    Row,
    Col,
    Card,
    Badge,
    Button,
    Table,
    Modal,
    Form,
    Image,
} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaFileInvoice,
    FaFileSignature,
    FaUserTie,
    FaFilePdf,
    FaCalendarAlt,
    FaArrowLeft,
    FaBuilding,
    FaEnvelope,
    FaCreditCard,
    FaMoneyBillWave,
    FaWallet,
    FaHashtag,
    FaRupeeSign,
    FaCalculator,
    FaCheckCircle,
    FaClock,
} from 'react-icons/fa';

export default function SingleBillDetailsClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [paynotes, setPaynotes] = useState([]);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawError, setWithdrawError] = useState('');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawReason, setWithdrawReason] = useState('');

    useEffect(() => {
        const fetchBillAndTransactions = async () => {
            try {
                // Fetch bill details
                const billResult = await getBillById(id);
                setBill(billResult);

                // Fetch transactions for this bill
                try {
                    const transactionResult = await getBillTransactions(id);
                    console.log('Transactions fetched:', transactionResult);
                    setTransactions(transactionResult || []);
                } catch (transactionError) {
                    console.warn('Could not fetch transactions:', transactionError.message);
                    setTransactions([]);
                }

                // Fetch paynotes for this bill
                try {
                    const paynoteResult = await getPayNotesByBill(id);
                    setPaynotes(paynoteResult?.paynotes || []);
                } catch (paynoteError) {
                    console.warn('Could not fetch paynotes:', paynoteError.message);
                    setPaynotes([]);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch bill.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchBillAndTransactions();
    }, [id]);

    const handleWithdrawRequest = async () => {
        setShowWithdrawModal(true);
    };

    const handleSubmitWithdraw = async () => {
        try {
            setWithdrawError('');
            setWithdrawLoading(true);
            const updatedBill = await requestBillWithdraw(id, withdrawReason);
            setBill(updatedBill);
            setShowWithdrawModal(false);
            setWithdrawReason('');
            toast.success('Withdrawal request submitted successfully! Admin will review it shortly.');
        } catch (err) {
            console.error(err);
            setWithdrawError(err.message || 'Failed to request withdrawal');
        } finally {
            setWithdrawLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowWithdrawModal(false);
        setWithdrawReason('');
        setWithdrawError('');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Paid':
                return <Badge bg="success">Paid</Badge>;
            case 'Pending':
                return <Badge bg="warning" text="dark">Pending</Badge>;
            case 'Reject':
                return <Badge bg="danger">Rejected</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const getAgreementStatusBadge = (status) => {
        switch (status) {
            case 'signed':
                return <Badge bg="success">Signed</Badge>;
            case 'pending':
                return <Badge bg="warning" text="dark">Pending</Badge>;
            case 'viewed':
                return <Badge bg="info">Viewed</Badge>;
            case 'rejected':
                return <Badge bg="danger">Rejected</Badge>;
            case 'expired':
                return <Badge bg="secondary">Expired</Badge>;
            default:
                return <Badge bg="secondary">{status || 'N/A'}</Badge>;
        }
    };

    const getPaynoteStatusBadge = (status) => {
        switch (status) {
            case 'Paid':
                return <Badge bg="success">Paid</Badge>;
            case 'Approved':
                return <Badge bg="info">Approved</Badge>;
            case 'Pending':
                return <Badge bg="warning" text="dark">Pending</Badge>;
            case 'Rejected':
                return <Badge bg="danger">Rejected</Badge>;
            case 'Draft':
            default:
                return <Badge bg="secondary">{status || 'Draft'}</Badge>;
        }
    };

    const agreement = bill?.agreement && typeof bill.agreement === 'object' ? bill.agreement : null;
    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b?.transactionDate || 0) - new Date(a?.transactionDate || 0)
    );
    const latestTransaction = sortedTransactions.length > 0 ? sortedTransactions[0] : null;
    const totalPaidAmount = sortedTransactions.reduce((sum, txn) => sum + (Number(txn?.amount) || 0), 0);
    const remainingAmount = Math.max((Number(bill?.amount) || 0) - totalPaidAmount, 0);

    const getPaymentMethodLabel = (txn) => {
        if (!txn) return 'Pending';
        if (txn.bankName) return 'Bank Transfer';
        if (txn.upiId) return 'UPI Payment';
        return 'Other';
    };

    const getTransactionTypeLabel = (type) => {
        switch (type) {
            case 'bill':
                return 'Bill';
            case 'payment_request':
                return 'Payment Request';
            case 'salary':
                return 'Salary';
            default:
                return '—';
        }
    };

    return (
        <>
            <ClientHeader />
            <ToastContainer position="top-right" />
            <Container fluid className="py-4 my-3" style={{ backgroundColor: "var(--client-component-bg-color" }}>
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : bill ? (
                    <>
                        {/* Back button */}
                        <div className="mb-3 d-flex align-items-center">
                            <Button
                                variant="link"
                                onClick={() => navigate(-1)}
                                className="text-decoration-none p-0 me-2"
                            >
                                <FaArrowLeft /> Back
                            </Button>
                            <h5 className="mb-0" style={{ color: 'var(--client-heading-color)' }}>
                                Bill Details
                            </h5>
                        </div>

                        <Row className="g-4">
                            {/* Bill Info */}
                            <Col lg={8}>
                                <Card
                                    className="shadow-sm"
                                    style={{
                                        backgroundColor: 'var(--client-dashboard-bg-color)',
                                        color: 'var(--client-text-color)',
                                    }}
                                >
                                    <Card.Header
                                        style={{
                                            backgroundColor: 'transparent',
                                            borderBottom: `1px solid var(--client-border-color)`,
                                            fontWeight: 600,
                                            color: 'var(--client-heading-color)',
                                        }}
                                    >
                                        <FaFileInvoice className="me-2 text-primary" />
                                        Bill Details
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}>
                                                <p><strong>Invoice No</strong><br />{bill.invoiceNo}</p>
                                                <p><strong>Firm Name</strong><br />{bill.firmName}</p>
                                                <p><strong>Work Area</strong><br />{bill.workArea}</p>
                                                <p><strong>LOA No</strong><br />{bill.loaNo}</p>
                                            </Col>
                                            <Col md={6}>
                                                <p><strong>Work Description</strong><br />{bill.workDescription}</p>
                                                <p><strong>Amount</strong><br />₹{bill.amount}</p>
                                                <p><strong>Status</strong><br />{getStatusBadge(bill.paymentStatus)}</p>
                                                <p><FaCalendarAlt className="me-1" /><strong>Submitted On</strong><br />{new Date(bill.submittedAt).toLocaleDateString()}</p>
                                            </Col>
                                        </Row>

                                        <div className="text-end">
                                            <a
                                                href={bill.pdfurl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn"
                                                style={{
                                                    backgroundColor: 'var(--client-btn-bg)',
                                                    color: 'var(--client-btn-text)',
                                                    border: 'none',
                                                }}
                                            >
                                                <FaFilePdf className="me-2" />
                                                View Bill PDF
                                            </a>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Transaction Details */}
                            <Col lg={4}>
                                <Card
                                    className="shadow-sm"
                                    style={{
                                        backgroundColor: 'var(--client-dashboard-bg-color)',
                                        borderColor: 'var(--client-border-color)',
                                        color: 'var(--client-text-color)',
                                    }}
                                >
                                    <Card.Header
                                        style={{
                                            backgroundColor: 'transparent',
                                            borderBottom: `1px solid var(--client-border-color)`,
                                            fontWeight: 600,
                                            color: 'var(--client-heading-color)',
                                        }}
                                    >
                                        <FaCreditCard className="me-2 text-primary" />
                                        Transaction Details
                                    </Card.Header>
                                    <Card.Body>
                                        {/* Get the latest transaction for this bill */}
                                        {(() => {
                                            const paidByName = latestTransaction?.paidBy?.name
                                                || latestTransaction?.userId?.name
                                                || latestTransaction?.paidBy
                                                || latestTransaction?.userId
                                                || '—';
                                            const paidByProfile = latestTransaction?.paidBy?.profile
                                                || latestTransaction?.userId?.profile
                                                || 'https://via.placeholder.com/32';

                                            return (
                                                <>
                                                    {/* Bill Amount */}
                                                    <div className="mb-3">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <FaFileInvoice className="me-2 text-primary" />
                                                            <small className="text-muted fw-bold">BILL AMOUNT</small>
                                                        </div>
                                                        <h5 className="mb-0" style={{ color: 'var(--client-text-color)' }}>
                                                            ₹{(Number(bill?.amount) || 0).toLocaleString('en-IN')}
                                                        </h5>
                                                    </div>

                                                    {/* Amount Paid */}
                                                    <div className="mb-3">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <FaRupeeSign className="me-2 text-success" />
                                                            <small className="text-muted fw-bold">AMOUNT PAID</small>
                                                        </div>
                                                        <h5 className="text-success mb-0">
                                                            ₹{totalPaidAmount.toLocaleString('en-IN')}
                                                        </h5>
                                                    </div>

                                                    {/* Paid By */}
                                                    <div className="mb-3">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <FaUserTie className="me-2 text-secondary" />
                                                            <small className="text-muted fw-bold">PAID BY</small>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2 text-muted">
                                                            <Image
                                                                src={paidByProfile}
                                                                roundedCircle
                                                                width={28}
                                                                height={28}
                                                                alt={typeof paidByName === 'string' ? paidByName : 'User'}
                                                                style={{ objectFit: 'cover' }}
                                                            />
                                                            <span>{paidByName}</span>
                                                        </div>
                                                    </div>

                                                    {/* Total Remaining */}
                                                    <div className="mb-3">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <FaCalculator className="me-2 text-warning" />
                                                            <small className="text-muted fw-bold">TOTAL REMAINING</small>
                                                        </div>
                                                        <h6 className="text-warning mb-0">
                                                            ₹{remainingAmount.toLocaleString('en-IN')}
                                                        </h6>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Attached Agreement Details */}
                        <Row className="mt-4">
                            <Col lg={12}>
                                <Card
                                    className="shadow-sm"
                                    style={{
                                        backgroundColor: 'var(--client-dashboard-bg-color)',
                                        borderColor: 'var(--client-border-color)',
                                        color: 'var(--client-text-color)',
                                    }}
                                >
                                    <Card.Header
                                        style={{
                                            backgroundColor: 'transparent',
                                            borderBottom: `1px solid var(--client-border-color)`,
                                            fontWeight: 600,
                                            color: 'var(--client-heading-color)',
                                        }}
                                    >
                                        <FaFileSignature className="me-2 text-primary" />
                                        Attached Agreement Details
                                    </Card.Header>
                                    <Card.Body>
                                        {agreement ? (
                                            <Row className="gy-3">
                                                <Col md={6}>
                                                    <p className="mb-2"><strong>Agreement Title</strong></p>
                                                    <div>{agreement.title || '—'}</div>
                                                </Col>
                                                <Col md={3}>
                                                    <p className="mb-2"><strong>Agreement ID</strong></p>
                                                    <div>{agreement.agreementId || agreement._id || '—'}</div>
                                                </Col>
                                                <Col md={3}>
                                                    <p className="mb-2"><strong>Status</strong></p>
                                                    <div>{getAgreementStatusBadge(agreement.status)}</div>
                                                </Col>

                                                <Col md={6}>
                                                    <p className="mb-2"><strong>Signed On</strong></p>
                                                    <div>
                                                        {agreement.signedAt
                                                            ? new Date(agreement.signedAt).toLocaleDateString()
                                                            : '—'}
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <p className="mb-2"><strong>Expiry Date</strong></p>
                                                    <div>
                                                        {agreement.expiryDate
                                                            ? new Date(agreement.expiryDate).toLocaleDateString()
                                                            : '—'}
                                                    </div>
                                                </Col>

                                                {agreement.description && (
                                                    <Col md={12}>
                                                        <p className="mb-2"><strong>Description</strong></p>
                                                        <div
                                                            className="p-2 rounded"
                                                            style={{
                                                                backgroundColor: 'var(--client-component-bg-color)',
                                                            }}
                                                        >
                                                            {agreement.description}
                                                        </div>
                                                    </Col>
                                                )}

                                                {(agreement.fileUrl || agreement._id) && (
                                                    <Col md={12}>
                                                        <div className="d-flex gap-2 justify-content-end flex-wrap">
                                                            {agreement._id && (
                                                                <Button
                                                                    onClick={() => navigate(`/client/agreement/view/${agreement._id}`)}
                                                                    style={{
                                                                        backgroundColor: 'var(--client-btn-bg)',
                                                                        color: 'var(--client-btn-text)',
                                                                        border: 'none',
                                                                    }}
                                                                >
                                                                    <FaFileSignature className="me-2" />
                                                                    Open Agreement Page
                                                                </Button>
                                                            )}
                                                            {agreement.fileUrl && (
                                                                <a
                                                                    href={agreement.fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn"
                                                                    style={{
                                                                        backgroundColor: 'var(--client-btn-bg)',
                                                                        color: 'var(--client-btn-text)',
                                                                        border: 'none',
                                                                    }}
                                                                >
                                                                    <FaFilePdf className="me-2" />
                                                                    View Agreement PDF
                                                                </a>
                                                            )}
                                                        </div>
                                                    </Col>
                                                )}
                                            </Row>
                                        ) : (
                                            <Alert variant="light" className="mb-0">
                                                No agreement is attached to this bill.
                                            </Alert>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Paynote Details */}
                        <Row className="mt-4">
                            <Col lg={12}>
                                <Card
                                    className="shadow-sm"
                                    style={{
                                        backgroundColor: 'var(--client-dashboard-bg-color)',
                                        borderColor: 'var(--client-border-color)',
                                        color: 'var(--client-text-color)',
                                    }}
                                >
                                    <Card.Header
                                        style={{
                                            backgroundColor: 'transparent',
                                            borderBottom: `1px solid var(--client-border-color)`,
                                            fontWeight: 600,
                                            color: 'var(--client-heading-color)',
                                        }}
                                    >
                                        <FaFileInvoice className="me-2 text-primary" />
                                        Paynote Details ({paynotes.length})
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        {paynotes.length > 0 ? (
                                            <div className="table-responsive">
                                                <Table bordered hover className="mb-0 align-middle">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th className="ps-3">#</th>
                                                            <th>Pay Note No</th>
                                                            <th>Department</th>
                                                            <th>Amount</th>
                                                            <th>Mode</th>
                                                            <th>Status</th>
                                                            <th>Created On</th>
                                                            <th>PDF</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paynotes.map((paynote, index) => (
                                                            <tr key={paynote._id || index}>
                                                                <td className="ps-3 fw-bold">{index + 1}</td>
                                                                <td>{paynote.payNoteNo || '—'}</td>
                                                                <td>{paynote.department || '—'}</td>
                                                                <td>
                                                                    ₹{paynote.totalSanctionAmount
                                                                        ? Number(paynote.totalSanctionAmount).toLocaleString('en-IN')
                                                                        : '0'}
                                                                </td>
                                                                <td>{paynote.modeOfPayment || '—'}</td>
                                                                <td>{getPaynoteStatusBadge(paynote.status)}</td>
                                                                <td>
                                                                    {paynote.createdAt
                                                                        ? new Date(paynote.createdAt).toLocaleDateString()
                                                                        : '—'}
                                                                </td>
                                                                <td>
                                                                    {paynote.pdfUrl ? (
                                                                        <a
                                                                            href={paynote.pdfUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="btn btn-sm"
                                                                            style={{
                                                                                backgroundColor: 'var(--client-btn-bg)',
                                                                                color: 'var(--client-btn-text)',
                                                                                border: 'none',
                                                                            }}
                                                                        >
                                                                            <FaFilePdf className="me-1" />
                                                                            View
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-muted">—</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-muted">
                                                No paynotes found for this bill.
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Withdraw Request Card */}
                        {bill.withdrawStatus && (
                            <Row className="mt-4">
                                <Col lg={12}>
                                    <Card
                                        className="shadow-sm"
                                        style={{
                                            backgroundColor: 'var(--client-dashboard-bg-color)',
                                            borderLeft: `4px solid ${bill.withdrawStatus === 'Requested' ? '#ffc107' : bill.withdrawStatus === 'Approved' ? '#28a745' : '#dc3545'}`,
                                            color: 'var(--client-text-color)',
                                        }}
                                    >
                                        <Card.Header
                                            style={{
                                                backgroundColor: 'transparent',
                                                borderBottom: `1px solid var(--client-border-color)`,
                                                fontWeight: 600,
                                                color: 'var(--client-heading-color)',
                                            }}
                                        >
                                            <i className="bi bi-arrow-counterclockwise me-2" />
                                            Withdrawal Request Status
                                        </Card.Header>
                                        <Card.Body>
                                            <Row className="gy-3">
                                                <Col md={6}>
                                                    <small className="text-muted fw-bold">Status</small>
                                                    <div className="fw-semibold mt-1">
                                                        <Badge bg={bill.withdrawStatus === 'Requested' ? 'warning' : bill.withdrawStatus === 'Approved' ? 'success' : 'danger'}>
                                                            {bill.withdrawStatus}
                                                        </Badge>
                                                    </div>
                                                </Col>

                                                <Col md={6}>
                                                    <small className="text-muted fw-bold">Requested On</small>
                                                    <div className="fw-semibold mt-1">
                                                        {bill.withdrawRequestedAt
                                                            ? new Date(bill.withdrawRequestedAt).toLocaleString()
                                                            : '—'}
                                                    </div>
                                                </Col>

                                                <Col md={12}>
                                                    <small className="text-muted fw-bold">Reason</small>
                                                    <div
                                                        className="mt-1 p-2"
                                                        style={{
                                                            backgroundColor: 'var(--client-component-bg-color)',
                                                            borderRadius: '4px',
                                                            color: 'var(--client-text-color)',
                                                        }}
                                                    >
                                                        {bill.withdrawReason || '—'}
                                                    </div>
                                                </Col>

                                                {bill.withdrawApprovedAt && (
                                                    <Col md={12}>
                                                        <small className="text-muted fw-bold">Decision Made On</small>
                                                        <div className="fw-semibold mt-1">
                                                            {new Date(bill.withdrawApprovedAt).toLocaleString()}
                                                        </div>
                                                    </Col>
                                                )}
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        )}

                        {/* Withdraw Request Button (only if no pending request and bill not paid) */}
                        {(bill.withdrawStatus === 'None' || bill.withdrawStatus === 'Rejected' || !bill.withdrawStatus) && bill.paymentStatus !== 'Paid' && (
                            <Row className="mt-4">
                                <Col lg={12}>
                                    <div
                                        className="p-3 rounded"
                                        style={{
                                            backgroundColor: 'var(--client-component-bg-color)',
                                            borderTop: `2px dashed var(--client-border-color)`,
                                        }}
                                    >
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <h6 className="mb-1" style={{ color: 'var(--client-heading-color)' }}>
                                                    Request Withdrawal
                                                </h6>
                                                <small className="text-muted">
                                                    {bill.withdrawStatus === 'Rejected'
                                                        ? 'Your previous withdrawal request was rejected. You can submit a new one.'
                                                        : 'Submit a request to withdraw this bill from the system.'}
                                                </small>
                                            </div>
                                            <Button
                                                onClick={handleWithdrawRequest}
                                                disabled={withdrawLoading}
                                                style={{
                                                    backgroundColor: 'var(--client-btn-bg)',
                                                    color: 'var(--client-btn-text)',
                                                    border: 'none',
                                                    minWidth: '120px',
                                                }}
                                            >
                                                {withdrawLoading ? (
                                                    <>
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            role="status"
                                                            aria-hidden="true"
                                                            className="me-2"
                                                        />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>Request Withdrawal</>
                                                )}
                                            </Button>
                                        </div>
                                        {withdrawError && (
                                            <Alert variant="danger" className="mt-2 mb-0">
                                                {withdrawError}
                                            </Alert>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        )}

                        {/* Withdraw Request Modal */}
                        <Modal
                            show={showWithdrawModal}
                            onHide={handleCloseModal}
                            centered
                            backdrop="static"
                            keyboard={false}
                        >
                            <Modal.Header
                                closeButton
                                style={{
                                    backgroundColor: 'var(--client-component-bg-color)',
                                    color: 'var(--client-heading-color)',
                                    borderBottom: '1px solid var(--client-border-color)',
                                }}
                            >
                                <Modal.Title>
                                    <i className="bi bi-arrow-counterclockwise me-2" />
                                    Request Bill Withdrawal
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body
                                style={{
                                    backgroundColor: 'var(--client-component-bg-color)',
                                    color: 'var(--client-text-color)',
                                }}
                            >
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ color: 'var(--client-heading-color)', fontWeight: 600 }}>
                                            Withdrawal Reason <span className="text-muted">(Optional)</span>
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            placeholder="Please provide a reason for withdrawing this bill..."
                                            value={withdrawReason}
                                            onChange={(e) => setWithdrawReason(e.target.value)}
                                            style={{
                                                backgroundColor: 'var(--client-dashboard-bg-color)',
                                                color: 'var(--client-text-color)',
                                                border: '1px solid var(--client-border-color)',
                                            }}
                                        />
                                    </Form.Group>

                                    <div
                                        className="p-3 rounded mb-3"
                                        style={{
                                            backgroundColor: 'var(--client-dashboard-bg-color)',
                                            borderLeft: '3px solid var(--client-btn-bg)',
                                        }}
                                    >
                                        <strong style={{ color: 'var(--client-heading-color)' }}>Bill Details:</strong>
                                        <div className="mt-2" style={{ fontSize: '0.9rem' }}>
                                            <div><strong>Firm:</strong> {bill?.firmName}</div>
                                            <div><strong>Amount:</strong> ₹{bill?.amount}</div>
                                            <div><strong>Invoice:</strong> {bill?.invoiceNo}</div>
                                        </div>
                                    </div>

                                    {withdrawError && (
                                        <Alert variant="danger" className="mb-0">
                                            {withdrawError}
                                        </Alert>
                                    )}
                                </Form>
                            </Modal.Body>
                            <Modal.Footer
                                style={{
                                    backgroundColor: 'var(--client-component-bg-color)',
                                    borderTop: '1px solid var(--client-border-color)',
                                }}
                            >
                                <Button
                                    variant="secondary"
                                    onClick={handleCloseModal}
                                    disabled={withdrawLoading}
                                    style={{
                                        backgroundColor: 'var(--client-border-color)',
                                        color: 'var(--client-text-color)',
                                        border: 'none',
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmitWithdraw}
                                    disabled={withdrawLoading}
                                    style={{
                                        backgroundColor: 'var(--client-btn-bg)',
                                        color: 'var(--client-btn-text)',
                                        border: 'none',
                                    }}
                                >
                                    {withdrawLoading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Withdrawal Request'
                                    )}
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        <Row className="mt-4 d-none d-md-block">
                            <Col lg={12}>
                                <Card
                                    className="shadow-sm"
                                    style={{
                                        backgroundColor: 'var(--client-dashboard-bg-color)',
                                        borderColor: 'var(--client-border-color)',
                                        color: 'var(--client-text-color)',
                                    }}
                                >
                                    <Card.Header
                                        style={{
                                            backgroundColor: 'transparent',
                                            borderBottom: `1px solid var(--client-border-color)`,
                                            fontWeight: 600,
                                            color: 'var(--client-heading-color)',
                                        }}
                                    >
                                        <FaCreditCard className="me-2 text-primary" />
                                        Transaction Summary ({sortedTransactions.length})
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        {sortedTransactions.length > 0 ? (
                                            <div className="table-responsive">
                                                <Table bordered hover className="mb-0 align-middle">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th className="ps-3">#</th>
                                                            <th>Amount</th>
                                                            <th>Type</th>
                                                            <th>Paid By</th>
                                                            <th>For User</th>
                                                            <th>UPI</th>
                                                            <th>Bank</th>
                                                            <th>Transaction ID</th>
                                                            <th>Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sortedTransactions.map((transaction, index) => (
                                                            <tr key={transaction._id || index}>
                                                                <td className="ps-3 fw-bold">{index + 1}</td>
                                                                <td>
                                                                    <div className="d-flex align-items-center">
                                                                        <FaRupeeSign className="me-1 text-success" />
                                                                        <strong className="text-success">
                                                                            {transaction.amount?.toLocaleString('en-IN') || '0'}
                                                                        </strong>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    {getTransactionTypeLabel(transaction.type)}
                                                                </td>
                                                                <td>
                                                                    {transaction.paidBy?.name || transaction.paidBy || <span className="text-muted">—</span>}
                                                                </td>
                                                                <td>
                                                                    {transaction.userId?.name || transaction.userId || <span className="text-muted">—</span>}
                                                                </td>
                                                                <td>
                                                                    {transaction.upiId ? (
                                                                        <div className="d-flex align-items-center">
                                                                            <FaWallet className="me-1 text-info" size={12} />
                                                                            <span className="small font-monospace">
                                                                                {transaction.upiId}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-muted small">-</span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {transaction.bankName ? (
                                                                        <div className="small">
                                                                            <div className="d-flex align-items-center mb-1">
                                                                                <FaMoneyBillWave className="me-1 text-success" size={12} />
                                                                                <strong>{transaction.bankName}</strong>
                                                                            </div>
                                                                            {transaction.accNo && (
                                                                                <div className="text-muted">
                                                                                    A/C: ****{transaction.accNo.slice(-4)}
                                                                                </div>
                                                                            )}
                                                                            {transaction.ifscCode && (
                                                                                <div className="text-muted">
                                                                                    IFSC: {transaction.ifscCode}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-muted small">-</span>
                                                                    )}
                                                                </td>
                                                             
                                                                <td>
                                                                    <div className="bg-light p-2 rounded small font-monospace text-center">
                                                                        {transaction._id || '—'}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className="small">
                                                                        {transaction.transactionDate
                                                                            ? new Date(transaction.transactionDate).toLocaleString()
                                                                            : '—'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <FaCreditCard size={48} className="text-muted mb-3" />
                                                <h6 className="text-muted mb-1">No Transactions Yet</h6>
                                                <p className="text-muted mb-0">Transaction summary will appear here once payments are made</p>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <Alert variant="warning">No bill data found.</Alert>
                )}
            </Container>
        </>
    );
}
