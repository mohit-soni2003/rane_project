import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Table, Form, Button,
  InputGroup, Pagination, Spinner
} from 'react-bootstrap';
import {
  FaFileInvoice, FaSearch, FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle,
  FaEllipsisV, FaRupeeSign, FaSortAmountDownAlt, FaFilter,FaUser,FaFileContract,
  FaClock,
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
  const { user } = useAuthStore();

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
        className="py-4 my-3"
        style={{ backgroundColor: 'var(--background)', minHeight: '100vh', borderRadius: "20px" }}
      >
        {/* Search & Sort */}
        <Row className="mb-3 align-items-center">
          <Col md={6}>
            <InputGroup
              style={{
                borderRadius: '999px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px var(--shadow-color)'
              }}
            >
              <InputGroup.Text
                style={{
                  backgroundColor: 'var(--card)',
                  color: 'var(--accent)',
                  border: '1px solid var(--border)',
                  borderRight: 'none',
                  paddingLeft: '16px'
                }}
              >
                <FaSearch />
              </InputGroup.Text>

              <Form.Control
                placeholder="Search by CID, Firm Name, Uploaded By, Status, Date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: 'var(--input)',
                  border: '1px solid var(--border)',
                  borderLeft: 'none',
                  color: 'var(--foreground)',
                  padding: '10px 14px',
                  fontSize: '0.9rem'
                }}
              />
            </InputGroup>
          </Col>

          <Col md={6} className="d-flex justify-content-end gap-2">

            {/* Sort Button */}
            <Button
              onClick={handleSortToggle}
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--primary)',
                borderRadius: '999px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                boxShadow: '0 4px 10px var(--shadow-color)'
              }}
            >
              <FaSortAmountDownAlt className="me-2" />
              Date
              <span style={{ marginLeft: '6px', fontSize: '0.75rem' }}>
                {sortOrder === "asc" ? "↑" : "↓"}
              </span>
            </Button>

          </Col>

        </Row>


        {/* Table */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <div className="table-responsive">

            <Table
              hover
              className="shadow-sm small"
              style={{
                backgroundColor: 'var(--card)',
                border: '0px solid var(--border)',
                borderRadius: '18px',
                minWidth: '1200px',        // 🔥 increase width
                whiteSpace: 'nowrap'      // 🔥 prevents wrapping
              }}
            >


              <thead
                style={{
                  backgroundColor: 'var(--card)',
                  color: 'var(--text-strong)',
                  whiteSpace: 'nowrap'
                }}
              >

                <tr className="small text-uppercase">
                  <th>S.No</th>
                  <th>CID</th>
                  <th>Uploaded By</th>
                  <th>Firm Name</th>
                  <th>Work Area</th>
                  <th>Payment Status</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>



              <tbody>
                {filteredBills.length > 0 ? (
                  filteredBills.map((bill, i) => {
                    const status = bill.paymentStatus || 'Pending';

                    const statusIcon =
                      status === 'Paid' ? <FaCheckCircle className="me-1" /> :
                        status === 'Reject' ? <FaTimesCircle className="me-1" /> :
                          <FaExclamationTriangle className="me-1" />;

                    const statusColor =
                      status === 'Paid'
                        ? 'var(--success)'
                        : status === 'Reject'
                          ? 'var(--destructive)'
                          : 'var(--warning)';

                    const statusTextColor =
                      status === 'Paid'
                        ? 'var(--success-foreground)'
                        : status === 'Reject'
                          ? 'var(--destructive-foreground)'
                          : 'var(--warning-foreground)';

                    const isPayDisabled = status === 'Rejected';

                    return (
                      <tr key={bill._id}>
                        <td>
                          <div
                            className="rounded-circle d-inline-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: 'var(--muted)',
                              color: 'var(--text-strong)',
                              width: '30px',
                              height: '30px',
                              fontSize: '0.9rem'
                            }}
                          >
                            {i + 1}
                          </div>
                        </td>

                        <td >{bill.user?.cid || 'N/A'}</td>
                        {/* username with profile photo icon  */}
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {bill.user?.profile ? (
                              <img
                                src={bill.user.profile}
                                alt={bill.user.name}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  border: '1px solid var(--border)'
                                }}
                              />
                            ) : (
                              <div
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  backgroundColor: 'var(--muted)',
                                  color: 'var(--text-muted)',
                                  fontSize: '0.8rem'
                                }}
                              >
                                <FaUser />
                              </div>
                            )}

                            <span>{bill.user?.name || 'N/A'}</span>
                          </div>
                        </td>

                        <td>{bill.firmName}</td>
                        <td>{bill.workArea}</td>

                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: statusColor,
                              color: statusTextColor
                            }}
                          >
                            {statusIcon} {status}
                          </span>
                        </td>

                        <td>{new Date(bill.submittedAt).toLocaleDateString()}</td>
                        {/* more file pay btn  */}
                        <td>
                          <div className="d-flex align-items-center gap-2">

                            {/* View Bill */}
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              href={bill.pdfurl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View Bill"
                              style={{
                                borderColor: 'var(--border)',
                                color: 'var(--secondary-foreground)'
                              }}
                            >
                              <FaFileInvoice />
                            </Button>

                            {/* Pay */}
                            <Button
                              size="sm"
                              disabled={isPayDisabled}
                              style={{
                                backgroundColor: isPayDisabled
                                  ? 'var(--muted)'
                                  : 'var(--primary)',
                                color: isPayDisabled
                                  ? 'var(--muted-foreground)'
                                  : 'var(--primary-foreground)',
                                border: 'none'
                              }}
                              onClick={() => {
                                setSelectedBillId(bill._id);
                                setShowPayModal(true);
                              }}
                            >
                              <FaRupeeSign className="me-1" /> Pay
                            </Button>

                            {/* More */}
                            <FaEllipsisV
                              title="More options"
                              style={{
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem'
                              }}
                              onClick={() =>
                                navigate(`/${user.role}/bill/${bill._id}`)
                              }
                            />
                          </div>
                        </td>


                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center py-3" style={{ color: 'var(--text-muted)' }}>
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
              {/* your table content */}
            </Table>
          </div>


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
