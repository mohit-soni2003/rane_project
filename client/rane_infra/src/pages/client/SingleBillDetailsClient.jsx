import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBillById } from '../../services/billServices';
import { getBillTransactions } from '../../services/billServices';
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
} from 'react-bootstrap';
import {
    FaFileInvoice,
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
    FaCalculator
} from 'react-icons/fa';

export default function SingleBillDetailsClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchBillAndTransactions = async () => {
            try {
                // Fetch bill details
                const billResult = await getBillById(id);
                setBill(billResult);

                // Fetch transactions for this bill
                try {
                    const transactionResult = await getBillTransactions(id);
                    setTransactions(transactionResult);
                } catch (transactionError) {
                    console.warn('Could not fetch transactions:', transactionError.message);
                    setTransactions([]);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch bill.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchBillAndTransactions();
    }, [id]);

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

    return (
        <>
            <ClientHeader />
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
                                            const latestTransaction = transactions.length > 0 ? transactions[0] : null;
                                            const isPaid = bill?.paymentStatus === 'Paid' && latestTransaction;

                                            return (
                                                <>
                                                    {/* Amount Paid */}
                                                    <div className="mb-3">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <FaRupeeSign className="me-2 text-success" />
                                                            <small className="text-muted fw-bold">AMOUNT PAID</small>
                                                        </div>
                                                        <h5 className="text-success mb-0">
                                                            ₹{isPaid ? latestTransaction.amount?.toLocaleString('en-IN') : '0'}
                                                        </h5>
                                                    </div>

                                                    {/* Paid By */}
                                                    <div className="mb-3">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <FaUserTie className="me-2 text-secondary" />
                                                            <small className="text-muted fw-bold">PAID BY</small>
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            {isPaid && latestTransaction?.userId ? (
                                                                <>
                                                                    <div
                                                                        className="rounded-circle me-2 d-flex align-items-center justify-content-center bg-primary"
                                                                        style={{ width: '40px', height: '40px' }}
                                                                    >
                                                                        <FaUserTie className="text-white" size={16} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="fw-bold small">
                                                                            {latestTransaction.userId.name || 'Unknown User'}
                                                                        </div>
                                                                        <div className="text-muted small">
                                                                            {latestTransaction.userId.email || 'No email'}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-muted small">
                                                                    Not Paid Yet
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Total Remaining */}
                                                    <div className="mb-3">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <FaCalculator className="me-2 text-warning" />
                                                            <small className="text-muted fw-bold">TOTAL REMAINING</small>
                                                        </div>
                                                        <h6 className="text-warning mb-0">
                                                            ₹{isPaid ? '0' : (bill?.amount ? bill.amount.toLocaleString('en-IN') : '0')}
                                                        </h6>
                                                    </div>

                                                    {/* Payment Method */}
                                                    <div className="mb-3">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <FaWallet className="me-2 text-info" />
                                                            <small className="text-muted fw-bold">PAYMENT METHOD</small>
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            <Badge
                                                                bg={isPaid ? 'success' : 'secondary'}
                                                                className="d-flex align-items-center"
                                                            >
                                                                {isPaid ? (
                                                                    <>
                                                                        {latestTransaction?.bankName ? (
                                                                            <>
                                                                                <FaMoneyBillWave className="me-1" size={10} />
                                                                                Bank Transfer
                                                                            </>
                                                                        ) : latestTransaction?.upiId ? (
                                                                            <>
                                                                                <FaWallet className="me-1" size={10} />
                                                                                UPI Payment
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <FaCreditCard className="me-1" size={10} />
                                                                                Online Payment
                                                                            </>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FaWallet className="me-1" size={10} />
                                                                        Pending
                                                                    </>
                                                                )}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {/* Transaction ID */}
                                                    <div className="mb-0">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <FaHashtag className="me-2 text-primary" />
                                                            <small className="text-muted fw-bold">TRANSACTION ID</small>
                                                        </div>
                                                        <div className="bg-light p-2 rounded small font-monospace">
                                                            {isPaid && latestTransaction?._id
                                                                ? latestTransaction._id.toString().slice(-12).toUpperCase()
                                                                : 'Not Available'
                                                            }
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
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
