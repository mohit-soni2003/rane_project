import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Table, Form, Button, Dropdown,
  InputGroup, Pagination, Spinner
} from 'react-bootstrap';
import {
  FaFileInvoice, FaSearch, FaEye, FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle, FaEllipsisV,
  FaRupeeSign, FaFilter
} from 'react-icons/fa';

import AdminHeader from '../../component/header/AdminHeader';
import { getAllBills } from '../../services/billServices';
import { useNavigate } from 'react-router-dom';
import PayBillModal from '../../component/models/PayBillModel';

export default function AllBillPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);

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

  return (
    <>
      <AdminHeader />
      <Container
        fluid
        className="py-4"
        style={{ backgroundColor: 'var(--admin-dashboard-bg-color)', minHeight: '100vh' }}
      >
        {/* Search & Filter */}
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
                placeholder="Search by CID, Firm Name, or Phone"
                style={{
                  backgroundColor: 'var(--admin-input-bg)',
                  borderColor: 'var(--admin-input-border)',
                  color: 'var(--admin-input-text)'
                }}
              />
            </InputGroup>
          </Col>
          <Col md={6} className="text-end">
            <InputGroup className="justify-content-end">
              <InputGroup.Text
                style={{
                  backgroundColor: 'var(--admin-component-bg-color)',
                  color: 'var(--admin-muted-color)',
                  borderColor: 'var(--admin-border-color)'
                }}
              >
                <FaFilter />
              </InputGroup.Text>
              <Form.Select
                className="w-auto"
                style={{
                  backgroundColor: 'var(--admin-input-bg)',
                  borderColor: 'var(--admin-input-border)',
                  color: 'var(--admin-input-text)'
                }}
              >
                <option value="">Payment Status: All</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
                <option value="partial">Partial</option>
              </Form.Select>
            </InputGroup>
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
                <th>Phone Number</th>
                <th>Payment Status</th>
                <th>Upload Date</th>
                <th>Bill File</th>
                <th>Action</th>
                <th>More</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill, i) => {
                const status = bill.paymentStatus || 'Pending'; // default to "Pending" if undefined
                const statusIcon =
                  status === 'Paid' ? <FaCheckCircle className="me-1" /> :
                    status === 'Reject' ? <FaTimesCircle className="me-1" /> :
                      status === 'Sanctioned' || status === 'Overdue' || status === 'Pending' ? <FaExclamationTriangle className="me-1" /> :
                        null;

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
                          backgroundColor: '#fcebea',
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
                    <td>{bill.user?.phone || 'N/A'}</td>
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
                      <FaEllipsisV onClick={() => { navigate(`/admin/bill/${bill._id}`) }} />

                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}

        {/* Pagination Footer (static for now) */}
        <Row className="mt-3">
          <Col className="text-start text-muted small">
            Showing 1 to {bills.length} of {bills.length} entries
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
