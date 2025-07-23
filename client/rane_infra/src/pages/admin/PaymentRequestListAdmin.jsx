import React from 'react';
import {
  Container, Row, Col, Table, Button, Form,
  InputGroup, Dropdown, Pagination, Badge
} from 'react-bootstrap';
import {
  FaSearch, FaFilter, FaEllipsisV, FaEye,
  FaFileInvoice, FaRupeeSign,FaExclamationTriangle ,FaCheckCircle,FaTimesCircle 
} from 'react-icons/fa';
import AdminHeader from '../../component/header/AdminHeader';

const statusMap = {
  Pending: { color: '#f4b400', textColor: '#000' },
  Paid: { color: '#34a853', textColor: '#fff' },
  Overdue: { color: '#ea4335', textColor: '#fff' },
  Sanctioned: { color: '#4285f4', textColor: '#fff' },
  Rejected: { color: '#9e9e9e', textColor: '#000' },
};

export default function PaymentRequestListAdmin() {
  const data = [
    {
      user: 'John Smith', uploadedBy: 'Admin User', tender: 'Office Supplies', amount: '$1,250.00',
      expenseNo: 'EXP-2023-001', status: 'Pending', requestDate: '10 Jan 2024'
    },
    {
      user: 'Alice Johnson', uploadedBy: 'Finance Team', tender: 'IT Equipment', amount: '$3,750.50',
      expenseNo: 'EXP-2023-002', status: 'Paid', requestDate: '05 Jan 2024', paymentDate: '12 Jan 2024',
      paymentMode: 'Bank Transfer', trx: 'TRX-89012'
    },
    {
      user: 'Robert Davis', uploadedBy: 'Procurement', tender: 'Office Furniture', amount: '$5,430.00',
      expenseNo: 'EXP-2023-003', status: 'Overdue', requestDate: '15 Dec 2023'
    },
    {
      user: 'Emily Wilson', uploadedBy: 'HR Department', tender: 'Training Services', amount: '$1,875.25',
      expenseNo: 'EXP-2023-004', status: 'Sanctioned', requestDate: '18 Dec 2023', paymentDate: '25 Dec 2023',
      paymentMode: 'Credit Card', trx: 'TRX-45678'
    },
    {
      user: 'Michael Brown', uploadedBy: 'Marketing', tender: 'Event Sponsorship', amount: '$2,500.00',
      expenseNo: 'EXP-2023-005', status: 'Rejected', requestDate: '20 Dec 2023'
    },
    {
      user: 'Jennifer Lee', uploadedBy: 'Finance Team', tender: 'Software License', amount: '$4,200.75',
      expenseNo: 'EXP-2023-006', status: 'Paid', requestDate: '22 Dec 2023', paymentDate: '05 Jan 2024',
      paymentMode: 'Bank Transfer', trx: 'TRX-12345'
    },
    {
      user: 'David Martinez', uploadedBy: 'Admin User', tender: 'Maintenance Contract', amount: '$3,150.00',
      expenseNo: 'EXP-2023-007', status: 'Pending', requestDate: '03 Jan 2024'
    }
  ];

  return (
    <>
      <AdminHeader />
      <Container
        fluid
        style={{ backgroundColor: 'var(--admin-dashboard-bg-color)', minHeight: '100vh' }}
        className="py-4 px-4"
      >
        {/* Summary Cards */}
        <Row className="mb-4">
          {[
            { label: 'Total Requests', value: 142 },
            { label: 'Pending', value: 38 },
            { label: 'Paid', value: 86 },
            { label: 'Overdue', value: 18 },
          ].map((item, i) => (
            <Col key={i} md={3} sm={6} className="mb-2">
              <div
                className="p-3 rounded border"
                style={{
                  backgroundColor: 'var(--admin-component-bg-color)',
                  borderColor: 'var(--admin-border-color)'
                }}
              >
                <div className="text-muted small">{item.label}</div>
                <div className="fs-4 fw-semibold">{item.value}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Search and Filters */}
        <Row className="align-items-center mb-3">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text style={{ backgroundColor: 'white' }}>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control placeholder="Search users, tenders..." />
            </InputGroup>
          </Col>
          <Col md={6} className="text-end">
            <Button variant="light" className="me-2">
              <FaFilter className="me-1" /> Filter by Status
            </Button>
            <Button variant="outline-secondary">Advanced Filter</Button>
          </Col>
        </Row>

        {/* Table */}
        <div className="table-responsive">
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
      <th>S.NO</th>
      <th>Uploaded By</th>
      <th>Tender</th>
      <th>Amount</th>
      <th>Expense No</th>
      <th>Status</th>
      <th>Request Date</th>
      <th>Payment Date</th>
      <th>Payment Mode</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {data.map((d, i) => {
      const status = d.status;
      const icon = {
        Pending: <FaExclamationTriangle className="me-1" />,
        Paid: <FaCheckCircle className="me-1" />,
        Overdue: <FaTimesCircle className="me-1" />,
        Sanctioned: <FaCheckCircle className="me-1" />,
        Rejected: <FaTimesCircle className="me-1" />
      }[status];

      const bgColor = i % 2 === 0 ? 'var(--admin-dashboard-bg-color)' : 'var(--admin-component-bg-color)';
      const payDisabled = status === 'Rejected';

      return (
        <tr key={i} style={{ backgroundColor: bgColor }}>
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
          <td>{d.uploadedBy}</td>
          <td>{d.tender}</td>
          <td>{d.amount}</td>
          <td>{d.expenseNo}</td>
          <td>
            <span
              className="badge text-white"
              style={{
                backgroundColor: statusMap[status].color,
                color: statusMap[status].textColor
              }}
            >
              {icon} {status}
            </span>
          </td>
          <td>{d.requestDate}</td>
          <td>{d.paymentDate || '—'}</td>
          <td>{d.paymentMode || '—'}</td>
          <td>
            <div className="d-flex align-items-center gap-2">
              <Button variant="outline-secondary" size="sm">
                <FaFileInvoice />
              </Button>
              <Button
                size="sm"
                disabled={payDisabled}
                style={{
                  backgroundColor: payDisabled ? 'var(--admin-btn-secondary-bg)' : 'var(--admin-btn-success-bg)',
                  color: 'var(--admin-btn-success-text)',
                  border: 'none'
                }}
              >
                <FaRupeeSign className="me-1" /> Pay
              </Button>
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  size="sm"
                  className="border"
                  style={{ borderColor: 'var(--admin-border-color)' }}
                >
                  <FaEllipsisV />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item><FaEye className="me-2" /> View Details</Dropdown.Item>
                  <Dropdown.Item><FaFileInvoice className="me-2" /> View Bill</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </td>
        </tr>
      );
    })}
  </tbody>
</Table>

        </div>

        {/* Pagination */}
        <Row className="mt-2">
          <Col className="text-muted small">Showing 1–7 of 142 entries</Col>
          <Col className="text-end">
            <Pagination className="mb-0 justify-content-end">
              <Pagination.Prev />
              <Pagination.Item active>1</Pagination.Item>
              <Pagination.Item>2</Pagination.Item>
              <Pagination.Item>3</Pagination.Item>
              <Pagination.Next />
              <Pagination.Last />
            </Pagination>
          </Col>
        </Row>
      </Container>
    </>
  );
}
