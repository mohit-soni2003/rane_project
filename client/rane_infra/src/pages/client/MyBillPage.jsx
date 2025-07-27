import React, { useEffect, useState } from 'react';
import {Table,Button,InputGroup,FormControl,Badge,Container,Card,Row,  Col,Spinner,} from 'react-bootstrap';
import {FaSearch,FaFileExport,FaPlus, FaFileAlt} from 'react-icons/fa';
import ClientHeader from '../../component/header/ClientHeader';
import { getBillsByUserId } from '../../services/billServices';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

// Reusable badge renderer
const getStatusBadge = (status) => {
    switch (status) {
        case 'Paid':
            return <Badge bg="success">Paid</Badge>;
        case 'Pending':
            return <Badge bg="warning" text="dark">Pending</Badge>;
        case 'Overdue':
            return <Badge bg="danger">Overdue</Badge>;
        case 'Sanctioned':
            return <Badge bg="primary">Sanctioned</Badge>;
        case 'Reject':
            return <Badge bg="danger">Rejected</Badge>;
        case 'Unpaid':
            return <Badge bg="secondary">Unpaid</Badge>;
        default:
            return <Badge bg="secondary">{status}</Badge>;
    }
};


export default function MyBillPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('asc');


    // ✅ Get logged-in user from Zustand store
    const user = useAuthStore((state) => state.user);
    const userId = user?._id;

    const navigate = useNavigate();
    // Fetch bills for this user
    useEffect(() => {
        const fetchBills = async () => {
            try {
                const result = await getBillsByUserId(userId);
                setBills(Array.isArray(result) ? result : []);
            } catch (error) {
                console.error('Failed to fetch bills:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchBills();
    }, [userId]);

    // Filter + Sort Logic
    const filteredBills = bills
        .filter((bill) =>
            (statusFilter === 'all' || bill.status === statusFilter) &&
            (bill.firm?.toLowerCase().includes(searchText.toLowerCase()) ||
                bill.invoiceNo?.toLowerCase().includes(searchText.toLowerCase()))
        )
        .sort((a, b) =>
            sortOrder === 'asc'
                ? a.invoiceNo.localeCompare(b.invoiceNo)
                : b.invoiceNo.localeCompare(a.invoiceNo)
        );

    return (
        <>
            <ClientHeader />

            <Container fluid className="py-4 px-0">
                <Card className="p-4 shadow-sm" style={{ backgroundColor: "var(--client-component-bg-color)" }}>
                    <Row className="align-items-center mb-3">
                        <Col md={6} className="text-muted">
                            Total {filteredBills.length} bills found
                        </Col>
                        <Col md={6}>
                            <div className="d-flex justify-content-end gap-2 flex-wrap">
                                <InputGroup style={{ maxWidth: '220px' }}>
                                    <InputGroup.Text><FaSearch /></InputGroup.Text>
                                    <FormControl
                                        placeholder="Search bills..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                    />
                                </InputGroup>

                                <FormControl
                                    as="select"
                                    className="w-auto"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Partial">Partial</option>
                                </FormControl>

                                <FormControl
                                    as="select"
                                    className="w-auto"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="asc">Sort: ▲ Ascending</option>
                                    <option value="desc">Sort: ▼ Descending</option>
                                </FormControl>

                                <Button variant="primary">Apply</Button>
                            </div>
                        </Col>
                    </Row>

                    {loading ? (
                        <div className="text-center my-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <Table responsive bordered hover className="mb-3 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>S.No.</th>
                                    <th>Firm Name</th>
                                    <th>Work Area</th>
                                    <th>LOA No.</th>
                                    <th>Invoice No.</th>
                                    <th>Payment Status</th>
                                    <th>View Bill</th>
                                    <th>Know More</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBills.map((bill, idx) => (
                                    <tr key={bill._id || idx}>
                                        <td>{idx + 1}</td>
                                        <td>{bill.firmName}</td>
                                        <td>{bill.workArea}</td>
                                        <td>{bill.loaNo}</td>
                                        <td>{bill.invoiceNo}</td>
                                        <td>{getStatusBadge(bill.paymentStatus)}</td>
                                        <td className="text-center">
                                            <a
                                                href={bill.pdfurl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-secondary text-decoration-none"
                                            >
                                                <FaFileAlt size={20} />
                                            </a>
                                        </td>

                                        <td><Button size="sm" variant="outline-secondary" onClick={()=>navigate(`/client/bill/${bill._id}`)}>Details</Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}

                    {!loading && (
                        <div className="d-flex justify-content-between">
                            <div className="text-muted">Showing 1 to {filteredBills.length} of {bills.length} entries</div>
                            <div>
                                <Button variant="outline-primary" className="me-2">
                                    <FaPlus className="me-1" /> Upload New Bill
                                </Button>
                                <Button variant="outline-dark">
                                    <FaFileExport className="me-1" /> Export Bills
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </Container>
        </>
    );
}
