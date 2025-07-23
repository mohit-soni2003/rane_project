import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminHeader from '../../component/header/AdminHeader';
import { getBillById } from '../../services/billServices';
import { getTransactionsByBillId } from '../../services/transactionService';
import { Container, Row, Col, Card, Image, Spinner, Table } from 'react-bootstrap';

export default function SingleBillDetailAdminPage() {
    const { id } = useParams();
    const [bill, setBill] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

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
            <Container className="py-4">
                <h4 className="mb-4">Bill Detail</h4>

                {/* Bill Info */}
                <Card className="mb-4">
                    <Card.Header className="fw-semibold">Bill Information</Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}><strong>Firm Name:</strong> {firmName || '—'}</Col>
                            <Col md={6}><strong>Work Area:</strong> {workArea || '—'}</Col>
                            <Col md={6}><strong>LOA No:</strong> {loaNo || '—'}</Col>
                            <Col md={6}><strong>Invoice No:</strong> {invoiceNo || '—'}</Col>
                            <Col md={6}><strong>Amount:</strong> ₹{amount || '—'}</Col>
                            <Col md={6}><strong>Status:</strong> {paymentStatus || '—'}</Col>
                            <Col md={6}><strong>Submitted At:</strong> {new Date(submittedAt).toLocaleDateString()}</Col>
                            <Col md={6}><strong>Payment Date:</strong> {paymentDate ? new Date(paymentDate).toLocaleDateString() : '—'}</Col>
                            <Col md={12}><strong>Work Description:</strong> {workDescription || '—'}</Col>
                            <Col md={12} className="mt-3">
                                <a href={pdfurl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                                    View PDF
                                </a>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>



                {/* Transaction Info */}
                <Card className='mb-4'>
                    <Card.Header className="fw-semibold">Transaction Details</Card.Header>
                    <Card.Body>
                        {transactions.length === 0 ? (
                            <p>No transactions found for this bill.</p>
                        ) : (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Amount</th>
                                        <th>Bank</th>
                                        <th>Account No</th>
                                        <th>IFSC</th>
                                        <th>UPI</th>
                                        <th>Transaction Date</th>
                                        <th>Send to</th>
                                        <th>Done By </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((txn, idx) => (
                                        <tr key={txn._id}>
                                            <td>{idx + 1}</td>
                                            <td>₹{txn.amount}</td>
                                            <td>{txn.bankName || '—'}</td>
                                            <td>{txn.accNo || '—'}</td>
                                            <td>{txn.ifscCode || '—'}</td>
                                            <td>{txn.upiId || '—'}</td>
                                            <td>{new Date(txn.transactionDate).toLocaleString()}</td>
                                            <td>{txn.userId?.name || '—'}</td>
                                            <td>{txn.created_by || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>

                {/* Summary Card */}

                <Card className='mb-4'>
                    <Card.Header className="fw-semibold">Summary</Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={4}><strong>Total Amount Requested:</strong> ₹{amount || 0}</Col>
                            <Col md={4}>
                                <strong>Total Amount Paid:</strong> ₹
                                {transactions.reduce((total, txn) => total + (txn.amount || 0), 0)}
                            </Col>
                            <Col md={4}>
                                <strong>Amount Remaining:</strong> ₹
                                {Math.max(
                                    (Number(amount) || 0) -
                                    transactions.reduce((total, txn) => total + (txn.amount || 0), 0),
                                    0
                                )}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
                {/* User Info */}
                <Card className="mb-4">
                    <Card.Header className="fw-semibold">User Information</Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={3}>
                                <Image
                                    src={user?.profile || 'https://via.placeholder.com/150'}
                                    roundedCircle
                                    width={120}
                                    height={120}
                                    alt="User Profile"
                                />
                            </Col>
                            <Col md={9}>
                                <Row>
                                    <Col md={6}><strong>Name:</strong> {user.name || '—'}</Col>
                                    <Col md={6}><strong>Email:</strong> {user.email || '—'}</Col>
                                    <Col md={6}><strong>Phone:</strong> {user.phoneNo || '—'}</Col>
                                    <Col md={6}><strong>Client ID (CID):</strong> {user.cid || '—'}</Col>
                                    <Col md={6}><strong>Firm Name:</strong> {user.firmName || '—'}</Col>
                                    <Col md={6}><strong>Address:</strong> {user.address || '—'}</Col>
                                    <Col md={6}><strong>Bank Name:</strong> {user.bankName || '—'}</Col>
                                    <Col md={6}><strong>Account No:</strong> {user.accountNo || '—'}</Col>
                                    <Col md={6}><strong>IFSC Code:</strong> {user.ifscCode || '—'}</Col>
                                    <Col md={6}><strong>UPI:</strong> {user.upi || '—'}</Col>
                                    <Col md={6}><strong>GST No:</strong> {user.gstno || '—'}</Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
}
