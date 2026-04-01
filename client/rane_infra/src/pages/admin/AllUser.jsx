import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Spinner,
  Form,
  Row,
  Col,
  InputGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import AdminHeader from "../../component/header/AdminHeader";
import { backend_url } from "../../store/keyStore";
import DeleteUserModal from "../../assets/cards/models/DeleteUserModal";
import SafeKeyGuard from '../../component/models/SafeKeyGuard';
import { FaSearch, FaUser } from "react-icons/fa";

export default function AllUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = () => {
    fetch(`${backend_url}/admin-get-users`)
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${backend_url}/admin-delete-user/${selectedUser._id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (res.ok) {
        setShowDeleteModal(false);
        fetchUsers();
      } else {
        alert(result.message || "Failed to delete user");
      }
    } catch (error) {
      alert("Something went wrong while deleting user.");
    }
  };

  const displayValue = (val) => (val ? val : "-");
  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : "-";

  // Filter users by name, email, phoneNo, or firmName
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.phoneNo?.toLowerCase().includes(term) ||
      user.firmName?.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <AdminHeader />
      <SafeKeyGuard>
      <DeleteUserModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        user={selectedUser}
      />
      <Container
        fluid
        className="py-4 my-3"
        style={{ backgroundColor: 'var(--background)', minHeight: '100vh', borderRadius: "20px" }}
      >
        <Card
          className="p-4 shadow-sm border-0"
          style={{
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
          }}
        >
          <Row className="mb-3 align-items-center">
            <Col md={4}>
              <InputGroup
                style={{
                  borderRadius: '999px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px var(--shadow-color)',
                }}
              >
                <InputGroup.Text
                  style={{
                    backgroundColor: 'var(--card)',
                    color: 'var(--accent)',
                    border: '1px solid var(--border)',
                    borderRight: 'none',
                    paddingLeft: '16px',
                  }}
                >
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, email, phone, or firm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    backgroundColor: 'var(--input)',
                    border: '1px solid var(--border)',
                    borderLeft: 'none',
                    color: 'var(--foreground)',
                    padding: '10px 14px',
                    fontSize: '0.9rem',
                  }}
                />
              </InputGroup>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className="table-responsive">
            <Table
              hover
              className="shadow-sm small mb-3 align-middle"
              style={{
                backgroundColor: 'var(--card)',
                border: '0px solid var(--border)',
                borderRadius: '18px',
                minWidth: '1800px',
                whiteSpace: 'nowrap',
              }}
            >
              <thead
                style={{
                  backgroundColor: 'var(--card)',
                  color: 'var(--text-strong)',
                  whiteSpace: 'nowrap',
                }}
              >
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Firm</th>
                  <th>GST No</th>
                  <th>Address</th>
                  <th>User Type</th>
                  <th>Client Type</th>
                  <th>Verified</th>
                  <th>Profile</th>
                  <th>Aadhar No</th>
                  <th>Aadhar Link</th>
                  <th>Aadhar Updated</th>
                  <th>PAN No</th>
                  <th>PAN Link</th>
                  <th>PAN Updated</th>
                  <th>UPI</th>
                  <th>Bank Name</th>
                  <th>IFSC</th>
                  <th>Account No</th>
                  <th>Last Login</th>
                  <th>Role</th>
                  <th>User ID</th>
                  <th>Password</th>
                  <th>Reset Token</th>
                  <th>Reset Expiry</th>
                  <th>Verify Token</th>
                  <th>Verify Expiry</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {user.profile ? (
                            <img
                              src={user.profile}
                              alt={user.name || "Profile"}
                              width="28"
                              height="28"
                              className="rounded-circle"
                              style={{ objectFit: "cover", border: "1px solid var(--border)" }}
                            />
                          ) : (
                            <div
                              className="d-flex align-items-center justify-content-center rounded-circle"
                              style={{
                                width: "28px",
                                height: "28px",
                                backgroundColor: "var(--muted)",
                                color: "var(--text-muted)",
                                border: "1px solid var(--border)",
                                fontSize: "0.75rem",
                              }}
                            >
                              <FaUser />
                            </div>
                          )}
                          <span>{`${user.name} (${user.role})`}</span>
                        </div>
                      </td>
                      <td>{displayValue(user.email)}</td>
                      <td>{displayValue(user.phoneNo)}</td>
                      <td>{displayValue(user.firmName)}</td>
                      <td>{displayValue(user.gstno)}</td>
                      <td>
                        {user.address && user.address.length > 30 ? (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-address-${user._id}`}>{user.address}</Tooltip>}
                          >
                            <span
                              style={{
                                maxWidth: "180px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "inline-block",
                                verticalAlign: "bottom",
                              }}
                            >
                              {user.address}
                            </span>
                          </OverlayTrigger>
                        ) : (
                          displayValue(user.address)
                        )}
                      </td>
                      <td>{displayValue(user.usertype)}</td>
                      <td>{displayValue(user.clientType)}</td>
                      <td>
                        {user.isverified ? (
                          <span className="badge bg-success">Yes</span>
                        ) : (
                          <span className="badge bg-danger">No</span>
                        )}
                      </td>
                      <td>
                        {user.profile ? (
                          <img
                            src={user.profile}
                            alt="Profile"
                            width="40"
                            height="40"
                            className="rounded-circle"
                          />
                        ) : "-"}
                      </td>
                      <td>{displayValue(user.idproof?.aadhar?.number)}</td>
                      <td>
                        {user.idproof?.aadhar?.link ? (
                          <a href={user.idproof.aadhar.link} target="_blank" rel="noreferrer">View</a>
                        ) : "-"}
                      </td>
                      <td>{formatDate(user.idproof?.aadhar?.lastUpdate)}</td>
                      <td>{displayValue(user.idproof?.pan?.number)}</td>
                      <td>
                        {user.idproof?.pan?.link ? (
                          <a href={user.idproof.pan.link} target="_blank" rel="noreferrer">View</a>
                        ) : "-"}
                      </td>
                      <td>{formatDate(user.idproof?.pan?.lastUpdate)}</td>
                      <td>{displayValue(user.upi)}</td>
                      <td>{displayValue(user.bankName)}</td>
                      <td>{displayValue(user.ifscCode)}</td>
                      <td>{displayValue(user.accountNo)}</td>
                      <td>{formatDate(user.lastlogin)}</td>
                      <td>{displayValue(user.role)}</td>
                      <td>{user._id}</td>
                      <td>{displayValue(user.password)}</td>
                      <td>{displayValue(user.resetPasswordToken)}</td>
                      <td>{formatDate(user.resetPasswordExpiresAt)}</td>
                      <td>{displayValue(user.VerificationToken)}</td>
                      <td>{formatDate(user.VerificationTokenExpiresAt)}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="30" className="text-center">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            </div>
          )}
        </Card>
      </Container>
      </SafeKeyGuard>
    </>
  );
}







