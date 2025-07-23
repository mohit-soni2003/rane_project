import React from 'react';
import {
  Container, Row, Col, Table, Form, Button, Dropdown,
  InputGroup, Pagination
} from 'react-bootstrap';
import {
  FaFileInvoice, FaSearch, FaEye, FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle, FaEllipsisV,
  FaRupeeSign, FaFilter
} from 'react-icons/fa';
import AdminHeader from '../../component/header/AdminHeader';

export default function AllBillPage() {
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(6)].map((_, i) => {
              const status = ['Paid', 'Rejected', 'Partial', 'Paid', 'Partial', 'Paid'][i];
              const statusIcon =
                status === 'Paid' ? <FaCheckCircle className="me-1" /> :
                status === 'Rejected' ? <FaTimesCircle className="me-1" /> :
                <FaExclamationTriangle className="me-1" />;
              const statusColor =
                status === 'Paid' ? 'var(--admin-success-color)' :
                status === 'Rejected' ? 'var(--admin-danger-color)' :
                'var(--admin-warning-color)';
              const isPayDisabled = status === 'Rejected';

              return (
                <tr
                  key={i}
                  style={{
                    backgroundColor: i % 2 === 0 ? 'var(--admin-dashboard-bg-color)' : 'var(--admin-component-bg-color)'
                  }}
                >
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
                  <td>{`CID00${i + 1}`}</td>
                  <td>John Smith</td>
                  <td>Acme Solutions</td>
                  <td>Web Development</td>
                  <td>(555) 123-45{67 + i}</td>
                  <td>
                    <span className="badge text-white" style={{ backgroundColor: statusColor }}>
                      {statusIcon} {status}
                    </span>
                  </td>
                  <td>{`${12 + i}-03-2023`}</td>
                  <td>
                    <Button variant="outline-secondary" size="sm">
                      <FaFileInvoice />
                    </Button>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      disabled={isPayDisabled}
                      style={{
                        backgroundColor: isPayDisabled ? 'var(--admin-btn-secondary-bg)' : 'var(--admin-btn-success-bg)',
                        color: 'var(--admin-btn-success-text)',
                        border: 'none'
                      }}
                    >
                      <FaRupeeSign className="me-1" /> Pay
                    </Button>
                  </td>
                  <td>
                    <Dropdown align="end">
                      <Dropdown.Toggle
                        variant="light"
                        size="sm"
                        style={{ border: '1px solid var(--admin-border-color)' }}
                      >
                        <FaEllipsisV />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item><FaEye className="me-2" /> View Details</Dropdown.Item>
                        <Dropdown.Item><FaFileInvoice className="me-2" /> View Bill</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        {/* Pagination Footer */}
        <Row className="mt-3">
          <Col className="text-start text-muted small">Showing 1 to 6 of 24 entries</Col>
          <Col className="text-end">
            <Pagination className="mb-0">
              <Pagination.First />
              <Pagination.Prev />
              <Pagination.Item active>1</Pagination.Item>
              <Pagination.Item>2</Pagination.Item>
              <Pagination.Item>3</Pagination.Item>
              <Pagination.Item>4</Pagination.Item>
              <Pagination.Next />
              <Pagination.Last />
            </Pagination>
          </Col>
        </Row>
      </Container>
    </>
  );
}
