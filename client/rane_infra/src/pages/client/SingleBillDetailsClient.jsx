import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBillById } from '../../services/billServices';
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
} from 'react-icons/fa';

export default function SingleBillDetailsClient() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const result = await getBillById(id);
                setBill(result);
            } catch (err) {
                setError(err.message || 'Failed to fetch bill.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchBill();
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

                            {/* Paid By Info */}
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
                                        <FaUserTie className="me-2 text-secondary" />
                                        Paid By
                                    </Card.Header>
                                    <Card.Body className="text-center">
                                        {bill.paidby ? (
                                            <>
                                                <img
                                                    src={bill.paidby.profile}
                                                    alt="Paid By"
                                                    className="rounded-circle mb-2"
                                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                />
                                                <h6 className="mb-0">{bill.paidby.name}</h6>
                                                <div className="text-muted small">
                                                    <FaEnvelope className="me-1" />
                                                    {bill.paidby.email}
                                                </div>
                                                <div className="text-muted small">
                                                    <FaBuilding className="me-1" />
                                                    {bill.paidby.firmName}
                                                </div>
                                            </>
                                        ) : (
                                            <Alert variant="info" className="mt-3">
                                                No payer info available.
                                            </Alert>
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
