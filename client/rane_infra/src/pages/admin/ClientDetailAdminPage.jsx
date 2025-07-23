import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Image, Spinner, Tab, Tabs, Table, Form, Button } from 'react-bootstrap';
import AdminHeader from '../../component/header/AdminHeader';
import { getUserFullDetails } from '../../services/userServices';
import dummyUser from '../../assets/images/dummyUser.jpeg';
import { backend_url } from '../../store/keyStore';
 
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
            <Container className="my-4">
                {/* Profile Overview */}
                <Card className="mb-4 shadow-sm">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col md="auto">
                                <Image
                                    src={user.profile || dummyUser}
                                    roundedCircle
                                    width={100}
                                    height={100}
                                    alt="Profile"
                                />
                            </Col>
                            <Col>
                                <h4 className="mb-1">{user.name}</h4>
                                <p className="mb-1 text-muted">{user.email}</p>
                                <p className="mb-0 small">Phone: {user.phoneNo || '-'}</p>
                            </Col>
                            <Col md="auto">
                                <Button variant="outline-secondary" onClick={() => navigate(-1)}>← Back</Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Detailed Info + Tabs */}
                <Card className="shadow-sm mb-4">
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <ul className="list-unstyled mb-0">
                                    <li><strong>Firm:</strong> {user.firmName || '-'}</li>
                                    <li><strong>Account No:</strong> {user.accountNo || '-'}</li>
                                    <li><strong>Bank:</strong> {user.bankName || '-'}</li>
                                    <li><strong>IFSC:</strong> {user.ifscCode || '-'}</li>
                                    <li><strong>UPI:</strong> {user.upi || '-'}</li>
                                </ul>
                            </Col>
                            <Col md={6}>
                                <ul className="list-unstyled mb-3">
                                    <li><strong>GST No:</strong> {user.gstno || '-'}</li>
                                    <li><strong>Last Login:</strong> {user.lastlogin ? new Date(user.lastlogin).toLocaleString() : '-'}</li>
                                    <li className="d-flex align-items-center gap-2">
                                        <strong className="me-2">CID:</strong>
                                        <Form.Control
                                            type="text"
                                            value={cid}
                                            onChange={(e) => setCid(e.target.value)}
                                            size="sm"
                                            style={{ maxWidth: "200px" }}
                                        />
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={()=>{handleCidUpdate(user._id)}}
                                            disabled={updating}
                                        >
                                            {updating ? "Updating..." : "Update CID"}
                                        </Button>
                                    </li>
                                    <li><strong>Verified:</strong> {user.isverified ? "Yes" : "No"}</li>
                                </ul>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
                {/* Tab View for Bills & Payments */}
                <Tabs defaultActiveKey="bills" className="mb-3" fill>
                    {/* Bills Tab */}
                    <Tab eventKey="bills" title="Bills">
                        <Card className="shadow-sm">
                            <Card.Body>
                                {bills.length === 0 ? (
                                    <p className="text-muted">No bills submitted.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <Table bordered hover>
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Firm</th>
                                                    <th>Work Area</th>
                                                    <th>LOA No</th>
                                                    <th>Invoice No</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th>Description</th>
                                                    <th>Submitted</th>
                                                    <th>PDF</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bills.map(bill => (
                                                    <tr key={bill._id}>
                                                        <td>{bill.firmName}</td>
                                                        <td>{bill.workArea}</td>
                                                        <td>{bill.loaNo}</td>
                                                        <td>{bill.invoiceNo}</td>
                                                        <td>₹{bill.amount}</td>
                                                        <td>{bill.paymentStatus}</td>
                                                        <td>{bill.workDescription}</td>
                                                        <td>{new Date(bill.submittedAt).toLocaleString()}</td>
                                                        <td>
                                                            <a href={bill.pdfurl} target="_blank" rel="noreferrer">
                                                                View
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Tab>

                    {/* Payments Tab */}
                    <Tab eventKey="payments" title="Payment Requests">
                        <Card className="shadow-sm">
                            <Card.Body>
                                {payments.length === 0 ? (
                                    <p className="text-muted">No payments available.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <Table bordered hover>
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Tender</th>
                                                    <th>Amount</th>
                                                    <th>Description</th>
                                                    <th>Status</th>
                                                    <th>Type</th>
                                                    <th>Mode</th>
                                                    <th>Image</th>
                                                    <th>Submitted</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.map(payment => (
                                                    <tr key={payment._id}>
                                                        <td>{payment.tender}</td>
                                                        <td>₹{payment.amount}</td>
                                                        <td>{payment.description}</td>
                                                        <td>{payment.status}</td>
                                                        <td>{payment.paymentType}</td>
                                                        <td>{payment.paymentMode || '-'}</td>
                                                        <td>
                                                            {payment.image ? (
                                                                <a href={payment.image} target="_blank" rel="noreferrer">View</a>
                                                            ) : '-'}
                                                        </td>
                                                        <td>{new Date(payment.submittedAt).toLocaleString()}</td>
                                                    </tr>
                                                ))}
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
