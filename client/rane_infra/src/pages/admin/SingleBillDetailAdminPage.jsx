import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminHeader from '../../component/header/AdminHeader';
import { getBillById } from '../../services/billServices';
import { getTransactionsByBillId } from '../../services/transactionService';
import { Container, Row, Col, Card, Image, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function SingleBillDetailAdminPage() {
    const { id } = useParams();
    const [bill, setBill] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchBillAndTransactions = async () => {
            try {
                const [billData, transactionData] = await Promise.all([
                    getBillById(id),
                    getTransactionsByBillId(id)
                ]);
                setBill(billData);
                setTransactions(transactionData);
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

                            <Col md={6}>
                                <small className="text-muted">Payment Date</small>
                                <div className="fw-semibold">
                                    {paymentDate
                                        ? new Date(paymentDate).toLocaleDateString()
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
                                    }}
                                >
                                    <thead
                                        style={{
                                            background: "var(--muted)",
                                            color: "var(--text-strong)",
                                        }}
                                    >
                                        <tr>
                                            <th>#</th>
                                            <th>Amount</th>
                                            <th>Bank</th>
                                            <th>Account No</th>
                                            <th>IFSC</th>
                                            <th>UPI</th>
                                            <th>Transaction Date</th>
                                            <th>Sent To</th>
                                            <th>Done By</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {transactions.map((txn, idx) => (
                                            <tr key={txn._id}>
                                                <td>{idx + 1}</td>

                                                <td className="fw-semibold" style={{ color: "var(--success-foreground)" }}>
                                                    ₹{txn.amount}
                                                </td>

                                                <td>{txn.bankName || "—"}</td>
                                                <td>{txn.accNo || "—"}</td>
                                                <td>{txn.ifscCode || "—"}</td>
                                                <td>{txn.upiId || "—"}</td>

                                                <td>
                                                    {txn.transactionDate
                                                        ? new Date(txn.transactionDate).toLocaleString()
                                                        : "—"}
                                                </td>

                                                <td className="fw-semibold">
                                                    {txn.userId?.name || "—"}
                                                </td>

                                                <td>{txn.created_by || "—"}</td>
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
                                <Row className="gy-3">
                                    <Col md={6}>
                                        <small className="text-muted">Email</small>
                                        <div className="fw-semibold">{user?.email || "—"}</div>
                                    </Col>

                                    <Col md={6}>
                                        <small className="text-muted">Client ID (CID)</small>
                                        <div className="fw-semibold">{user?.cid || "—"}</div>
                                    </Col>

                                    <Col md={6}>
                                        <small className="text-muted">Phone</small>
                                        <div className="fw-semibold">{user?.phoneNo || "—"}</div>
                                    </Col>

                                    <Col md={6}>
                                        <small className="text-muted">Firm Name</small>
                                        <div className="fw-semibold">{user?.firmName || "—"}</div>
                                    </Col>

                                    <Col md={12}>
                                        <small className="text-muted">Address</small>
                                        <div
                                            className="fw-semibold"
                                            style={{ color: "var(--text-muted)" }}
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
        </>
    );
}
