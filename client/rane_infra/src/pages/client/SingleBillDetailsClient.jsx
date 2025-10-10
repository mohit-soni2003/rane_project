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
    Table,
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
                                                        <div className="text-muted">
                                                            -
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
                                                            null
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Transaction Summary Table */}
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
                                        Transaction Summary ({transactions.length})
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        {transactions.length > 0 ? (
                                            <div className="table-responsive">
                                                <Table bordered hover className="mb-0 align-middle">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th className="ps-3">#</th>
                                                            <th>Amount</th>
                                                            <th>Transaction Status</th>
                                                            <th>Paid By</th>
                                                            <th>UPI</th>
                                                            <th>Bank</th>
                                                            <th>Transaction ID</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {transactions.map((transaction, index) => (
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
                                                                    <Badge
                                                                        bg={bill?.paymentStatus === 'Paid' ? 'success' : 'warning'}
                                                                        className="d-flex align-items-center justify-content-center"
                                                                    >
                                                                        {bill?.paymentStatus === 'Paid' ? (
                                                                            <>
                                                                                <FaCheckCircle className="me-1" size={10} />
                                                                                Completed
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <FaClock className="me-1" size={10} />
                                                                                Pending
                                                                            </>
                                                                        )}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <span className="text-muted">-</span>
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
                                                                        null
                                                                    </div>
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
