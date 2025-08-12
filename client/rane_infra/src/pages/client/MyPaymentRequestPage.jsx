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
      <Container fluid className="py-0 px-0 my-md-3">
        <Card
          className="p-3 shadow border-0"
          style={{ backgroundColor: 'var(--client-component-bg-color)' }}
        >
          {/* Filters */}
          <Row className="align-items-center mb-3 gy-2">
            <Col xs={12} md={6} className="text-muted mobile-text-sm">
              Total {filteredPayments.length} payments found
            </Col>
            <Col xs={12} md={6}>
              <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                <InputGroup style={{ flex: '1 1 auto', maxWidth: '250px' }} className="mobile-input-sm">
                  <InputGroup.Text className="mobile-input-sm">
                    <FaSearch />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search payments..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="mobile-input-sm"
                  />
                </InputGroup>

                <FormControl
                  as="select"
                  className="w-auto mobile-input-sm"
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
                  className="w-auto mobile-input-sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="asc">▲ Ascending</option>
                  <option value="desc">▼ Descending</option>
                </FormControl>

                <Button variant="primary" size="sm" className="mobile-btn-sm">
                  Apply
                </Button>
              </div>
            </Col>
          </Row>

          {/* Table */}
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table
                bordered
                hover
                className="mb-3 align-middle"
                style={{ minWidth: '750px' }}
              >
                <thead className="table-light sticky-top">
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
                      <td className="text-truncate" style={{ maxWidth: '150px' }}>
                        {payment.tender}
                      </td>
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
                            <FaFileInvoice size={18} />
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td style={{ whiteSpace: 'normal' }}>
                        {payment.remark || '- - - - - '}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Footer */}
          {!loading && (
            <div className="d-flex flex-wrap flex-md-nowrap justify-content-between align-items-center gap-2 mobile-text-sm">
              <div className="text-muted small">
                Showing 1 to {filteredPayments.length} of {payments.length} entries
              </div>
              <div className="d-flex gap-2 flex-nowrap">
                <Button variant="outline-primary" size="sm" className="text-truncate mobile-btn-sm">
                  <FaPlus className="me-1" /> New Payment Request
                </Button>
                <Button variant="outline-dark" size="sm" className="text-truncate mobile-btn-sm">
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
