import React from 'react';
import { Table, Button, InputGroup, FormControl, Badge, Container, Card, Row, Col } from 'react-bootstrap';
import { FaSearch, FaFilter, FaFileInvoice, FaPlus, FaFileExport } from 'react-icons/fa';
import ClientHeader from '../../component/header/ClientHeader';

const bills = [
    {
        firm: 'Karnataka Power Ltd.',
        workArea: 'Electrical Maintenance',
        loaNo: 'LOA-2023-001',
        invoiceNo: 'INV-2023-0458',
        status: 'Completed',
    },
    {
        firm: 'Tata Constructions',
        workArea: 'Civil Work',
        loaNo: 'LOA-2023-015',
        invoiceNo: 'INV-2023-0523',
        status: 'Pending',
    },
    {
        firm: 'Mahindra Engineering',
        workArea: 'Mechanical Support',
        loaNo: 'LOA-2023-008',
        invoiceNo: 'INV-2023-0612',
        status: 'Rejected',
    },
    {
        firm: 'Larsen & Toubro',
        workArea: 'Structural Design',
        loaNo: 'LOA-2023-022',
        invoiceNo: 'INV-2023-0721',
        status: 'Partial',
    },
    {
        firm: 'Reliance Industrial',
        workArea: 'System Integration',
        loaNo: 'LOA-2023-018',
        invoiceNo: 'INV-2023-0836',
        status: 'Completed',
    },
    {
        firm: 'Adani Power',
        workArea: 'Power Distribution',
        loaNo: 'LOA-2023-025',
        invoiceNo: 'INV-2023-0947',
        status: 'Pending',
    },
];

const getStatusBadge = (status) => {
    switch (status) {
        case 'Completed':
            return <Badge bg="success">Completed</Badge>;
        case 'Pending':
            return <Badge bg="warning" text="dark">Pending</Badge>;
        case 'Rejected':
            return <Badge bg="danger">Rejected</Badge>;
        case 'Partial':
            return <Badge bg="primary">Partial</Badge>;
        default:
            return <Badge bg="secondary">{status}</Badge>;
    }
};

export default function MyBillPage() {
    return (
        <>
            <ClientHeader />

            <Container fluid className="py-4 px-0">
                <Card className="p-4 shadow-sm"
                style={{backgroundColor:"var(--client-component-bg-color)"}}>
                    <Row className="align-items-center mb-3">
                        <Col md={6} className="text-muted">
                            Total {bills.length} bills found
                        </Col>
                        <Col md={6}>
                            <div className="d-flex justify-content-end gap-2 flex-wrap">
                                {/* Search input */}
                                <InputGroup style={{ maxWidth: '220px' }}>
                                    <InputGroup.Text><FaSearch /></InputGroup.Text>
                                    <FormControl placeholder="Search bills..." />
                                </InputGroup>

                                {/* Filter by Status */}
                                <FormControl as="select" className="w-auto">
                                    <option value="all">All Status</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Partial">Partial</option>
                                </FormControl>

                                {/* Sort Order */}
                                <FormControl as="select" className="w-auto">
                                    <option value="asc"><span className='fw-bolder'>Sort:</span> ▲ Ascending</option>
                                    <option value="desc">Sort: ▼ Descending</option>
                                </FormControl>
                                {/* Apply Button */}
                                <Button variant="primary">Apply</Button>
                            </div>
                        </Col>
                    </Row>


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
                            {bills.map((bill, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{bill.firm}</td>
                                    <td>{bill.workArea}</td>
                                    <td>{bill.loaNo}</td>
                                    <td>{bill.invoiceNo}</td>
                                    <td>{getStatusBadge(bill.status)}</td>
                                    <td><Button size="sm" variant="primary">View</Button></td>
                                    <td><Button size="sm" variant="outline-secondary">Details</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <div className="d-flex justify-content-between">
                        <div className="text-muted">Showing 1 to {bills.length} of {bills.length} entries</div>
                        <div>
                            <Button variant="outline-primary" className="me-2"><FaPlus className="me-1" /> Upload New Bill</Button>
                            <Button variant="outline-dark"><FaFileExport className="me-1" /> Export Bills</Button>
                        </div>
                    </div>
                </Card>
            </Container>
        </>
    );
}
