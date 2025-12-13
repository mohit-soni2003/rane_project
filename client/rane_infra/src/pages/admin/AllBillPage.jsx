import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Table, Form, Button,
  InputGroup, Pagination, Spinner
} from 'react-bootstrap';
import {
  FaFileInvoice, FaSearch, FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle,
  FaEllipsisV, FaRupeeSign
} from 'react-icons/fa';

import AdminHeader from "../../component/header/AdminHeader";
import StaffHeader from "../../component/header/StaffHeader";
import { getAllBills } from '../../services/billServices';
import { useNavigate } from 'react-router-dom';
import PayBillModal from '../../component/models/PayBillModel';
import { useAuthStore } from '../../store/authStore';

export default function AllBillPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // default newest first
  const {user} = useAuthStore();

  const getHeaderComponent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminHeader />;
      case 'staff':
        return <StaffHeader />;
      default:
        return <AdminHeader />; // fallback
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const data = await getAllBills();
        setBills(data);
      } catch (err) {
        console.error('Failed to load bills:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  // Filter bills based on search term
  let filteredBills = bills.filter((bill) => {
    const term = searchTerm.toLowerCase();
    return (
      bill.user?.cid?.toLowerCase().includes(term) ||
      bill.user?.name?.toLowerCase().includes(term) ||
      bill.firmName?.toLowerCase().includes(term) ||
      bill.workArea?.toLowerCase().includes(term) ||
      bill.user?.phone?.toLowerCase().includes(term) ||
      bill.paymentStatus?.toLowerCase().includes(term) ||
      new Date(bill.submittedAt).toLocaleDateString().toLowerCase().includes(term)
    );
  });

  // Sort bills based on submittedAt date
  filteredBills.sort((a, b) => {
    const dateA = new Date(a.submittedAt);
    const dateB = new Date(b.submittedAt);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Toggle sort order
  const handleSortToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <>
      {getHeaderComponent()}
      <Container
        fluid
        className="py-4"
        style={{ backgroundColor: 'var(--admin-dashboard-bg-color)', minHeight: '100vh' }}
      >
        {/* Search & Sort */}
        <Row className="mb-3 align-items-center">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text
                style={{
                  backgroundColor: 'var(--admin-component-bg-color)',
                  color: 'var(--admin-muted-color)',
                  borderColor: 'var(--admin-border-color)'
                }}
              >
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by CID, Firm Name, Uploaded By, Status, Date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: 'var(--admin-input-bg)',
                  borderColor: 'var(--admin-input-border)',
                  color: 'var(--admin-input-text)'
                }}
              />
            </InputGroup>
          </Col>
          <Col md={6} className="text-end">
            <Button
              variant="outline-primary"
              onClick={handleSortToggle}
              style={{
                backgroundColor: 'var(--admin-component-bg-color)',
                borderColor: 'var(--admin-border-color)',
                color: 'var(--admin-input-text)'
              }}
            >
              Sort by Date {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </Col>
        </Row>

        {/* Table */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Table
            responsive
            hover
            className="shadow-sm"
            style={{
              backgroundColor: 'var(--admin-component-bg-color)',
              border: '1px solid var(--admin-border-color)'
            }}
          >
            <thead style={{ backgroundColor: '#e7edf3' }}>
              <tr className="text-muted small text-uppercase">
                <th>S.No</th>
                <th>CID</th>
                <th>Uploaded By</th>
                <th>Firm Name</th>
                <th>Work Area</th>
                <th>Payment Status</th>
                <th>Upload Date</th>
                <th>Bill File</th>
                <th>Action</th>
                <th>More</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length > 0 ? (
                filteredBills.map((bill, i) => {
                  const status = bill.paymentStatus || 'Pending';
                  const statusIcon =
                    status === 'Paid' ? <FaCheckCircle className="me-1" /> :
                      status === 'Reject' ? <FaTimesCircle className="me-1" /> :
                        status === 'Sanctioned' || status === 'Overdue' || status === 'Pending'
                          ? <FaExclamationTriangle className="me-1" /> : null;

                  const statusColor =
                    status === 'Paid' ? 'var(--admin-success-color)' :
                      status === 'Reject' ? 'var(--admin-danger-color)' :
                        'var(--admin-warning-color)';

                  const isPayDisabled = status === 'Rejected';

                  return (
                    <tr key={bill._id}>
                      <td>
                        <div
                          className="rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{
                            backgroundColor: 'var(--staff-serial-number-bg)',
                            width: '30px',
                            height: '30px',
                            fontSize: '0.9rem'
                          }}
                        >
                          {i + 1}
                        </div>
                      </td>
                      <td>{bill.user?.cid || 'N/A'}</td>
                      <td>{bill.user?.name || 'N/A'}</td>
                      <td>{bill.firmName}</td>
                      <td>{bill.workArea}</td>
                      <td>
                        <span className="badge text-white" style={{ backgroundColor: statusColor }}>
                          {statusIcon} {status}
                        </span>
                      </td>
                      <td>{new Date(bill.submittedAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          href={bill.pdfurl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaFileInvoice />
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          disabled={isPayDisabled}
                          style={{
                            backgroundColor: isPayDisabled
                              ? 'var(--admin-btn-secondary-bg)'
                              : 'var(--admin-btn-success-bg)',
                            color: 'var(--admin-btn-success-text)',
                            border: 'none'
                          }}
                          onClick={() => {
                            setSelectedBillId(bill._id);
                            setShowPayModal(true);
                          }}
                        >
                          <FaRupeeSign className="me-1" /> Pay
                        </Button>
                      </td>
                      <td>
                        <FaEllipsisV onClick={() => { navigate(`/${user.role}/bill/${bill._id}`) }} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" className="text-center py-3 text-muted">
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}

        {/* Pagination Footer */}
        <Row className="mt-3">
          <Col className="text-start text-muted small">
            Showing 1 to {filteredBills.length} of {bills.length} entries
          </Col>
          <Col className="text-end">
            <Pagination className="mb-0">
              <Pagination.First />
              <Pagination.Prev />
              <Pagination.Item active>1</Pagination.Item>
              <Pagination.Next />
              <Pagination.Last />
            </Pagination>
          </Col>
        </Row>
      </Container>

      <PayBillModal
        show={showPayModal}
        onHide={() => setShowPayModal(false)}
        billId={selectedBillId}
      />
    </>
  );
}
