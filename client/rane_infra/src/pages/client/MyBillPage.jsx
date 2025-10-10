import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    InputGroup,
    FormControl,
    Badge,
    Container,
    Card,
    Row,
    Col,
    Spinner
} from 'react-bootstrap';
import { FaSearch, FaFileExport, FaPlus, FaFileAlt } from 'react-icons/fa';
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

    const user = useAuthStore((state) => state.user);
    const userId = user?._id;

    const navigate = useNavigate();

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
            <Container fluid className="py-md-4 px-md-2 p-0 m-0 border-0">
                <Card fluid className="p-3 border-0 w-100" style={{ backgroundColor: "var(--client-component-bg-color)" }}>
                    {/* Filters */}
                    <Row className="g-2 mb-3">
                        <Col xs={12} md={4}>
                            <InputGroup className="mobile-input-sm">
                                <InputGroup.Text><FaSearch /></InputGroup.Text>
                                <FormControl
                                    placeholder="Search bills..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="mobile-input-sm"
                                />
                            </InputGroup>
                        </Col>
                        <Col xs={6} md={3}>
                            <FormControl
                                as="select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="mobile-input-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="Completed">Completed</option>
                                <option value="Pending">Pending</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Partial">Partial</option>
                            </FormControl>
                        </Col>
                        <Col xs={6} md={3}>
                            <FormControl
                                as="select"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="mobile-input-sm"
                            >
                                <option value="asc">Sort: ▲ Asc</option>
                                <option value="desc">Sort: ▼ Desc</option>
                            </FormControl>
                        </Col>
                        <Col xs={12} md={2} className="d-grid">
                            <Button variant="primary" className="mobile-btn-sm">Apply</Button>
                        </Col>
                    </Row>

                    {/* Table or Loader */}
                    {loading ? (
                        <div className="text-center my-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table bordered hover className="mb-3 align-middle table-sm">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Firm</th>
                                        <th className="d-none d-sm-table-cell">Work Area</th>
                                        <th className="d-none d-sm-table-cell">LOA No.</th>
                                        <th>Invoice</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>View</th>
                                        <th>More</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBills.map((bill, idx) => (
                                        <tr key={bill._id || idx}>
                                            <td>{idx + 1}</td>
                                            <td>{bill.firmName}</td>
                                            <td className="d-none d-sm-table-cell">{bill.workArea}</td>
                                            <td className="d-none d-sm-table-cell">{bill.loaNo}</td>
                                            <td>{bill.invoiceNo}</td>
                                            <td>₹{bill.amount ? bill.amount.toLocaleString('en-IN') : 'N/A'}</td>
                                            <td>{getStatusBadge(bill.paymentStatus)}</td>
                                            <td className="text-center">
                                                <a
                                                    href={bill.pdfurl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-secondary"
                                                >
                                                    <FaFileAlt size={18} />
                                                </a>
                                            </td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    onClick={() => navigate(`/client/bill/${bill._id}`)}
                                                >
                                                    Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {/* Footer Buttons */}
                    {!loading && (
                        <div className="d-flex flex-wrap justify-content-between align-items-center">
                            <small className="text-muted mobile-text-sm">
                                Showing 1 to {filteredBills.length} of {bills.length} entries
                            </small>
                            <div className="mt-2 mt-md-0">
                                <Button 
                                    size="sm" 
                                    variant="outline-primary" 
                                    className="me-2 mobile-btn-sm"
                                    onClick={() => navigate('/client/upload-bill')}
                                >
                                    <FaPlus className="me-1" /> Upload Bill
                                </Button>
                                <Button size="sm" variant="outline-dark" className="mobile-btn-sm">
                                    <FaFileExport className="me-1" /> Export
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </Container>
        </>
    );
}
