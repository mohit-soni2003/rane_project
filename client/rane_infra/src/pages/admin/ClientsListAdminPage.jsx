import React, { useState, useEffect } from 'react';
import { Container, Table, Form, InputGroup, Image, Spinner, Button } from 'react-bootstrap';
import { BsSearch } from 'react-icons/bs';
import AdminHeader from '../../component/header/AdminHeader';
import StaffHeader from "../../component/header/StaffHeader";
import { getAllClients } from '../../services/userServices'; // Adjust path as needed
import dummyUser from "../../assets/images/dummyUser.jpeg";
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { FaUsers } from "react-icons/fa";


export default function ClientsListAdminPage() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      try {
        const data = await getAllClients();
        setClients(data || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
      setLoading(false);
    }
    fetchClients();
  }, []);

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

  // Search by Name, Email, CID, or Phone Number
  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase();
    return (
      (client.name || '').toLowerCase().includes(term) ||
      (client.email || '').toLowerCase().includes(term) ||
      (client.cid || '').toLowerCase().includes(term) ||
      (client.phoneNo || '').toString().toLowerCase().includes(term)
    );
  });

  return (
    <>
      {getHeaderComponent()}
      <Container fluid
        className="my-3 p-4"
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "15px",
          boxShadow: "0 6px 20px var(--shadow-color)"
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4
            className="mb-0 fw-semibold d-flex align-items-center gap-2"
            style={{ color: "var(--text-strong)" }}
          >
            <span
              className="d-inline-flex align-items-center justify-content-center"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "var(--secondary)",
                color: "var(--accent)"
              }}
            >
              <FaUsers size={16} />
            </span>
            All Clients
          </h4>


          {/* Search */}
          <Form style={{ width: "300px" }}>
            <InputGroup
              style={{
                backgroundColor: "var(--input)",
                border: "1px solid var(--border)",
                borderRadius: "999px",
                overflow: "hidden"
              }}
            >
              <InputGroup.Text
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  paddingLeft: "14px",
                  color: "var(--text-muted)"
                }}
              >
                <BsSearch size={14} />
              </InputGroup.Text>

              <Form.Control
                placeholder="Search by name, email, CID, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "none",
                  boxShadow: "none",
                  backgroundColor: "transparent",
                  color: "var(--foreground)",
                  paddingLeft: "6px",
                  fontSize: "0.9rem"
                }}
              />
            </InputGroup>
          </Form>

        </div>

        {/* Table Wrapper */}
        <div
          className="table-responsive rounded"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)"
          }}
        >
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: "var(--primary)" }} />
              <div className="mt-2" style={{ color: "var(--text-muted)" }}>
                Loading clients...
              </div>
            </div>
          ) : (
            <>
              <Table hover className="mb-0">
                <thead
                  style={{
                    backgroundColor: "var(--secondary)",
                    color: "var(--secondary-foreground)"
                  }}
                >
                  <tr className="small text-uppercase">
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone No</th>
                    <th>CID Code</th>
                    <th>Quick Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client, index) => (
                      <tr
                        key={client._id || index}
                        style={{
                          borderBottom: "1px solid var(--divider)"
                        }}
                      >
                        {/* index */}
                        <td>
                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              backgroundColor: "var(--secondary)",
                              color: "var(--secondary-foreground)",
                              fontWeight: "600",
                              fontSize: "0.9rem",
                              margin: "0 auto"
                            }}
                          >
                            {index + 1}
                          </div>
                        </td>
                        {/* Profile */}
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={client.profile || dummyUser}
                              alt="profile"
                              style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "1px solid var(--border)"
                              }}
                            />

                            <div className="d-flex flex-column">
                              <span className="fw-semibold" style={{ color: "var(--text-strong)" }}>
                                {client.name}
                              </span>
                              <small style={{ color: "var(--text-muted)" }}>
                                {client.role}
                              </small>
                            </div>
                          </div>
                        </td>
                        {/* email  */}
                        <td>{client.email}</td>
                        {/* phoneNo  */}
                        <td
                          style={{
                            whiteSpace: "nowrap",
                            fontVariantNumeric: "tabular-nums"
                          }}
                        >
                          {client.phoneNo || "-"}
                        </td>
                        {/* cid  */}
                        <td className="fw-semibold" style={{ whiteSpace: "nowrap" }}>
                          {client.cid || `CID-${index + 1}`}
                        </td>
                        {/* more and push doc btn  */}
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                navigate(`/${user.role}/client-detail/${client._id}`)
                              }
                              style={{
                                backgroundColor: "var(--secondary)",
                                color: "var(--secondary-foreground)",
                                borderColor: "var(--border)"
                              }}
                            >
                              More
                            </Button>

                            <Button
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/${user.role}/push-document/${encodeURIComponent(client.cid)}`
                                )
                              }
                              style={{
                                backgroundColor: "var(--accent)",
                                color: "var(--accent-foreground)",
                                border: "none"
                              }}
                            >
                              Push Doc
                            </Button>
                          </div>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center py-4"
                        style={{ color: "var(--text-muted)" }}
                      >
                        No clients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* Footer */}
              <div
                className="px-3 py-2 small"
                style={{
                  backgroundColor: "var(--muted)",
                  color: "var(--muted-foreground)"
                }}
              >
                Showing {filteredClients.length} of {clients.length} entries
              </div>
            </>
          )}
        </div>
      </Container>

    </>
  );
}
