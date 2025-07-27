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
  Spinner,
} from 'react-bootstrap';
import {
  FaSearch,
  FaFileExport,
  FaPlus,
  FaFileInvoice,
} from 'react-icons/fa';
import ClientHeader from '../../component/header/ClientHeader';
import { getPaymentsByUserId } from '../../services/paymentService';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

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
    case 'Rejected':
      return <Badge bg="danger">Rejected</Badge>;
    default:
      return <Badge bg="secondary">{status}</Badge>;
  }
};

export default function MyPaymentRequestPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');

  const { user } = useAuthStore();
  const userId = user?._id;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const result = await getPaymentsByUserId(userId);
        setPayments(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchPayments();
  }, [userId]);

  const filteredPayments = payments
    .filter(
      (payment) =>
        (statusFilter === 'all' || payment.status === statusFilter) &&
        (payment.tender?.toLowerCase().includes(searchText.toLowerCase()) ||
          payment.expenseNo?.toLowerCase().includes(searchText.toLowerCase()))
    )
    .sort((a, b) =>
      sortOrder === 'asc'
        ? a.expenseNo.localeCompare(b.expenseNo)
        : b.expenseNo.localeCompare(a.expenseNo)
    );

  return (
    <>
      <ClientHeader />
      <Container fluid className="py-4 px-0">
        <Card className="p-4 shadow border-0" style={{ backgroundColor: "var(--client-component-bg-color)" }}>
          <Row className="align-items-center mb-3">
            <Col md={6} className="text-muted">
              Total {filteredPayments.length} payments found
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-end gap-2 flex-wrap">
                <InputGroup style={{ maxWidth: '220px' }}>
                  <InputGroup.Text><FaSearch /></InputGroup.Text>
                  <FormControl
                    placeholder="Search payments..."
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
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Sanctioned">Sanctioned</option>
                  <option value="Overdue">Overdue</option>
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
                  <th>Tender</th>
                  <th>Expense No</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Submitted On</th>
                  <th>View</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, idx) => (
                  <tr key={payment._id || idx}>
                    <td>{idx + 1}</td>
                    <td>{payment.tender}</td>
                    <td>{payment.expenseNo}</td>
                    <td>₹{payment.amount}</td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td>{new Date(payment.submittedAt).toLocaleDateString()}</td>
                    <td className="text-center">
                      {payment.image ? (
                        <a
                          href={payment.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary text-decoration-none"
                        >
                          <FaFileInvoice size={20} />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{payment.remark||"- - - - - "}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {!loading && (
            <div className="d-flex justify-content-between">
              <div className="text-muted">
                Showing 1 to {filteredPayments.length} of {payments.length} entries
              </div>
              <div>
                <Button variant="outline-primary" className="me-2">
                  <FaPlus className="me-1" /> New Payment Request
                </Button>
                <Button variant="outline-dark">
                  <FaFileExport className="me-1" /> Export Payments
                </Button>
              </div>
            </div>
          )}
        </Card>
      </Container>
    </>
  );
}
