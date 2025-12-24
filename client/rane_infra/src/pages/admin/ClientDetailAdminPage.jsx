import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Image, Spinner, Tab, Tabs, Table, Form, Button } from 'react-bootstrap';
import AdminHeader from '../../component/header/AdminHeader';
import { getUserFullDetails } from '../../services/userServices';
import dummyUser from '../../assets/images/dummyUser.jpeg';
import { backend_url } from '../../store/keyStore';
import { FaUser, FaEnvelope, FaPhoneAlt, FaArrowLeft } from "react-icons/fa";
import {
    FaBuilding,
    FaUniversity,
    FaHashtag,
    FaRegClock,
    FaCheckCircle,
    FaIdCard,
    FaMoneyCheckAlt,
    FaQrcode
} from "react-icons/fa";
import {
    FaFileInvoice,
    FaFilePdf,
    FaClipboardList,
    FaTimesCircle,
    FaHourglassHalf
} from "react-icons/fa";



export default function ClientDetailAdminPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [cid, setCid] = useState('');

    const handleCidUpdate = async (userId) => {
        try {
            setUpdating(true);

            const response = await fetch(`${backend_url}/update-cid/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
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


    if (loading) {
        return (
            <>
                <AdminHeader />
                <Container className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Loading client details...</p>
                </Container>
            </>
        );
    }

    if (!userData) {
        return (
            <>
                <AdminHeader />
                <Container className="py-5 text-center">
                    <p className="text-danger">No data found for this client.</p>
                </Container>
            </>
        );
    }

    const { user, bills = [], payments = [] } = userData;

    return (
        <>
            <AdminHeader />
            <Container
                fluid
                className="my-4 p-4"
                style={{ backgroundColor: "var(--background)", borderRadius: "15px" }}
            >
                {/* Profile Overview */}
                {/* Profile Overview */}
                <Card
                    className="mb-4 border-0"
                    style={{
                        backgroundColor: "var(--card)",
                        color: "var(--card-foreground)",
                        borderRadius: "14px",
                        boxShadow: "0 4px 12px var(--shadow-color)"
                    }}
                >
                    <Card.Body>
                        <Row className="align-items-center gy-3">
                            {/* Profile Image */}
                            <Col md="auto" className="text-center">
                                <div
                                    style={{
                                        padding: "4px",
                                        borderRadius: "50%",
                                        backgroundColor: "var(--secondary)",
                                        display: "inline-block"
                                    }}
                                >
                                    <Image
                                        src={user.profile || dummyUser}
                                        roundedCircle
                                        width={96}
                                        height={96}
                                        alt="Profile"
                                        style={{
                                            objectFit: "cover",
                                            border: "2px solid var(--border)"
                                        }}
                                    />
                                </div>
                            </Col>

                            {/* User Info */}
                            <Col>
                                <h4
                                    className="mb-1 fw-semibold d-flex align-items-center gap-2"
                                    style={{ color: "var(--text-strong)" }}
                                >
                                    <FaUser style={{ color: "var(--accent)" }} />
                                    {user.name}
                                </h4>

                                <div
                                    className="d-flex align-items-center gap-2 small mb-1"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    <FaEnvelope />
                                    {user.email}
                                </div>

                                <div
                                    className="d-flex align-items-center gap-2 small"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    <FaPhoneAlt />
                                    {user.phoneNo || "-"}
                                </div>
                            </Col>

                            {/* Back Button */}
                            <Col md="auto">
                                <Button
                                    size="sm"
                                    onClick={() => navigate(-1)}
                                    style={{
                                        backgroundColor: "var(--secondary)",
                                        color: "var(--secondary-foreground)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px"
                                    }}
                                >
                                    <FaArrowLeft className="me-1" />
                                    Back
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>


                {/* Detailed Info + Tabs */}
                <Card
                    className="mb-4 border-0"
                    style={{
                        backgroundColor: "var(--card)",
                        color: "var(--card-foreground)",
                        borderRadius: "14px",
                        boxShadow: "0 4px 12px var(--shadow-color)"
                    }}
                >
                    <Card.Body>
                        <Row className="gy-4">
                            {/* Left Column – Bank Details */}
                            <Col md={6}>
                                <div className="fw-semibold mb-3" style={{ color: "var(--text-strong)" }}>
                                    <FaUniversity className="me-2" style={{ color: "var(--accent)" }} />
                                    Bank & Firm Details
                                </div>

                                <ul className="list-unstyled mb-0 small">
                                    <li className="d-flex align-items-center gap-2 mb-2">
                                        <FaBuilding className="text-muted" />
                                        <span><strong>Firm:</strong> {user.firmName || "-"}</span>
                                    </li>

                                    <li className="d-flex align-items-center gap-2 mb-2">
                                        <FaMoneyCheckAlt className="text-muted" />
                                        <span><strong>Account No:</strong> {user.accountNo || "-"}</span>
                                    </li>

                                    <li className="d-flex align-items-center gap-2 mb-2">
                                        <FaUniversity className="text-muted" />
                                        <span><strong>Bank:</strong> {user.bankName || "-"}</span>
                                    </li>

                                    <li className="d-flex align-items-center gap-2 mb-2">
                                        <FaHashtag className="text-muted" />
                                        <span><strong>IFSC:</strong> {user.ifscCode || "-"}</span>
                                    </li>

                                    <li className="d-flex align-items-center gap-2">
                                        <FaQrcode className="text-muted" />
                                        <span><strong>UPI:</strong> {user.upi || "-"}</span>
                                    </li>
                                </ul>
                            </Col>

                            {/* Right Column – Compliance & System Info */}
                            <Col md={6}>
                                <div className="fw-semibold mb-3" style={{ color: "var(--text-strong)" }}>
                                    <FaIdCard className="me-2" style={{ color: "var(--accent)" }} />
                                    Compliance & System Info
                                </div>

                                <ul className="list-unstyled mb-3 small">
                                    <li className="d-flex align-items-center gap-2 mb-2">
                                        <FaIdCard className="text-muted" />
                                        <span><strong>GST No:</strong> {user.gstno || "-"}</span>
                                    </li>

                                    <li className="d-flex align-items-center gap-2 mb-2">
                                        <FaRegClock className="text-muted" />
                                        <span>
                                            <strong>Last Login:</strong>{" "}
                                            {user.lastlogin
                                                ? new Date(user.lastlogin).toLocaleString()
                                                : "-"}
                                        </span>
                                    </li>

                                    {/* CID Update */}
                                    <li className="d-flex align-items-center gap-2 mb-2">
                                        <strong className="me-2">CID:</strong>

                                        <Form.Control
                                            type="text"
                                            value={cid}
                                            onChange={(e) => setCid(e.target.value)}
                                            size="sm"
                                            style={{
                                                maxWidth: "160px",
                                                backgroundColor: "var(--input)",
                                                borderColor: "var(--border)"
                                            }}
                                        />

                                        <Button
                                            size="sm"
                                            onClick={() => handleCidUpdate(user._id)}
                                            disabled={updating}
                                            style={{
                                                backgroundColor: "var(--primary)",
                                                color: "var(--primary-foreground)",
                                                border: "none"
                                            }}
                                        >
                                            {updating ? "Updating..." : "Update"}
                                        </Button>
                                    </li>

                                    {/* Verification */}
                                    <li className="d-flex align-items-center gap-2">
                                        <strong>Verified:</strong>
                                        <span
                                            className="px-2 py-1 rounded-pill small"
                                            style={{
                                                backgroundColor: user.isverified
                                                    ? "var(--success)"
                                                    : "var(--warning)",
                                                color: user.isverified
                                                    ? "var(--success-foreground)"
                                                    : "var(--warning-foreground)"
                                            }}
                                        >
                                            {user.isverified ? "Yes" : "No"}
                                        </span>
                                    </li>
                                </ul>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Tab View for Bills & Payments */}
                <Tabs
                    defaultActiveKey="bills"
                    className="mb-4"
                    fill
                    style={{
                        backgroundColor: "var(--secondary)",
                        borderRadius: "12px",
                        padding: "6px"
                    }}
                >
                    {/* Bills Tab */}
                    <Tab
                        eventKey="bills"
                        title={
                            <span className="d-flex align-items-center gap-2">
                                <FaFileInvoice /> Bills
                            </span>
                        }
                    >
                        <Card
                            className="border-0 shadow-sm"
                            style={{ backgroundColor: "var(--card)" }}
                        >
                            <Card.Body>
                                {bills.length === 0 ? (
                                    <p className="text-muted">No bills submitted.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <Table hover className="align-middle small">
                                            <thead style={{ background: "var(--muted)" }}>
                                                <tr className="text-uppercase text-muted small">
                                                    <th>Firm</th>
                                                    <th>Work Area</th>
                                                    <th>LOA</th>
                                                    <th>Invoice</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th>Submitted</th>
                                                    <th>PDF</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bills.map(bill => {
                                                    const statusColor =
                                                        bill.paymentStatus === "Paid"
                                                            ? "var(--success)"
                                                            : bill.paymentStatus === "Rejected"
                                                                ? "var(--destructive)"
                                                                : "var(--warning)";

                                                    return (
                                                        <tr key={bill._id}>
                                                            <td className="fw-semibold">{bill.firmName}</td>
                                                            <td>{bill.workArea}</td>
                                                            <td>{bill.loaNo}</td>
                                                            <td>{bill.invoiceNo}</td>
                                                            <td className="fw-semibold">₹{bill.amount}</td>
                                                            <td>
                                                                <span
                                                                    className="px-2 py-1 rounded-pill small"
                                                                    style={{
                                                                        backgroundColor: statusColor,
                                                                        color: "var(--card-foreground)"
                                                                    }}
                                                                >
                                                                    {bill.paymentStatus}
                                                                </span>
                                                            </td>
                                                            <td className="text-muted">
                                                                {new Date(bill.submittedAt).toLocaleDateString()}
                                                            </td>
                                                            <td>
                                                                <a
                                                                    href={bill.pdfurl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="d-inline-flex align-items-center gap-1"
                                                                    style={{ color: "var(--accent)" }}
                                                                >
                                                                    <FaFilePdf /> View
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab>


                    {/* Payments Tab */}
                    <Tab
                        eventKey="payments"
                        title={
                            <span className="d-flex align-items-center gap-2">
                                <FaMoneyCheckAlt /> Payments
                            </span>
                        }
                    >
                        <Card
                            className="border-0 shadow-sm"
                            style={{ backgroundColor: "var(--card)" }}
                        >
                            <Card.Body>
                                {payments.length === 0 ? (
                                    <p className="text-muted">No payments available.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <Table hover className="align-middle small">
                                            <thead style={{ background: "var(--muted)" }}>
                                                <tr className="text-uppercase text-muted small">
                                                    <th>Tender</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th>Type</th>
                                                    <th>Mode</th>
                                                    <th>Submitted</th>
                                                    <th>Proof</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.map(payment => {
                                                    const statusBadge =
                                                        payment.status === "Paid"
                                                            ? { bg: "var(--success)", icon: <FaCheckCircle /> }
                                                            : payment.status === "Rejected"
                                                                ? { bg: "var(--destructive)", icon: <FaTimesCircle /> }
                                                                : { bg: "var(--warning)", icon: <FaHourglassHalf /> };

                                                    return (
                                                        <tr key={payment._id}>
                                                            <td className="fw-semibold">{payment.tender}</td>
                                                            <td className="fw-semibold">₹{payment.amount}</td>
                                                            <td>
                                                                <span
                                                                    className="px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1 small"
                                                                    style={{
                                                                        backgroundColor: statusBadge.bg,
                                                                        color: "var(--card-foreground)"
                                                                    }}
                                                                >
                                                                    {statusBadge.icon} {payment.status}
                                                                </span>
                                                            </td>
                                                            <td>{payment.paymentType}</td>
                                                            <td>{payment.paymentMode || "-"}</td>
                                                            <td className="text-muted">
                                                                {new Date(payment.submittedAt).toLocaleDateString()}
                                                            </td>
                                                            <td>
                                                                {payment.image ? (
                                                                    <a
                                                                        href={payment.image}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        style={{ color: "var(--accent)" }}
                                                                    >
                                                                        View
                                                                    </a>
                                                                ) : (
                                                                    "-"
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab>

                    {/* Future Tab 1 */}
                    <Tab eventKey="future1" title="Future Option 1">
                        <Card className="shadow-sm">
                            <Card.Body>
                                <p className="text-muted">Coming soon...</p>
                            </Card.Body>
                        </Card>
                    </Tab>

                    {/* Future Tab 2 */}
                    <Tab eventKey="future2" title="Future Option 2">
                        <Card className="shadow-sm">
                            <Card.Body>
                                <p className="text-muted">Coming soon...</p>
                            </Card.Body>
                        </Card>
                    </Tab>
                </Tabs>
            </Container>
        </>
    );
}
