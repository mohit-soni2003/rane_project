import React, { useEffect, useState } from "react";
import {
  Container, Row, Col, Table, Form,
  InputGroup, Spinner, Button
} from "react-bootstrap";
import {
  FaSearch, FaCheckCircle, FaTimesCircle,
  FaExclamationTriangle, FaFileContract,
  FaClock, FaUser
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import AdminHeader from "../../component/header/AdminHeader";
import StaffHeader from "../../component/header/StaffHeader";
import { getAllAgreements } from "../../services/agreement";
import { useAuthStore } from "../../store/authStore";

export default function AgreementTableListAll() {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [mineOnly, setMineOnly] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");


  const navigate = useNavigate();
  const { user } = useAuthStore();

  const getHeaderComponent = () => {
    switch (user?.role) {
      case "admin":
        return <AdminHeader />;
      case "staff":
        return <StaffHeader />;
      default:
        return <AdminHeader />;
    }
  };



  useEffect(() => {
    fetchAgreements();
  }, [mineOnly]);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const res = await getAllAgreements(mineOnly);
      setAgreements(res?.agreements || []);
    } catch (err) {
      console.error("Failed to load agreements", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILTER ---------------- */
  const filteredAgreements = agreements.filter((a) => {
    const term = searchTerm.toLowerCase();

    const searchMatch =
      a.agreementId?.toLowerCase().includes(term) ||
      a.title?.toLowerCase().includes(term) ||
      a.client?.name?.toLowerCase().includes(term);

    const statusMatch =
      statusFilter === "all" || a.status === statusFilter;

    return searchMatch && statusMatch;
  });


  return (
    <>
      {getHeaderComponent()}

      <Container
        fluid
        className="py-4 my-3"
        style={{
          backgroundColor: "var(--background)",
          minHeight: "100vh",
          borderRadius: "20px",
        }}
      >
        {/* Search + Toggle */}
        <Row className="mb-3 align-items-center">
          <Col md={5}>
            <InputGroup
              style={{
                borderRadius: "999px",
                overflow: "hidden",
                boxShadow: "0 4px 12px var(--shadow-color)",
              }}
            >
              <InputGroup.Text
                style={{
                  backgroundColor: "var(--card)",
                  color: "var(--accent)",
                  border: "1px solid var(--border)",
                  borderRight: "none",
                  paddingLeft: "16px",
                }}
              >
                <FaSearch />
              </InputGroup.Text>

              <Form.Control
                placeholder="Search by Agreement ID, Title, Client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: "var(--input)",
                  border: "1px solid var(--border)",
                  borderLeft: "none",
                  color: "var(--foreground)",
                  padding: "10px 14px",
                  fontSize: "0.9rem",
                }}
              />
            </InputGroup>
          </Col>

          {/* STATUS FILTER */}
          <Col md={3}>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                borderRadius: "999px",
                padding: "10px 14px",
                fontSize: "0.85rem",
                boxShadow: "0 4px 10px var(--shadow-color)",
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="viewed">Viewed</option>
              <option value="signed">Signed</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </Form.Select>
          </Col>

          {/* TOGGLE */}
          <Col md={4} className="d-flex justify-content-end gap-2">
            <Button
              size="sm"
              onClick={() => setMineOnly(false)}
              style={{
                backgroundColor: !mineOnly ? "var(--primary)" : "var(--card)",
                color: !mineOnly
                  ? "var(--primary-foreground)"
                  : "var(--foreground)",
                border: "1px solid var(--border)",
                borderRadius: "999px",
                padding: "8px 16px",
              }}
            >
              All Agreements
            </Button>

            <Button
              size="sm"
              onClick={() => setMineOnly(true)}
              style={{
                backgroundColor: mineOnly ? "var(--primary)" : "var(--card)",
                color: mineOnly
                  ? "var(--primary-foreground)"
                  : "var(--foreground)",
                border: "1px solid var(--border)",
                borderRadius: "999px",
                padding: "8px 16px",
              }}
            >
              Pushed By Me
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
                backgroundColor: "var(--card)",
                borderRadius: "18px",
                minWidth: "1200px",
                whiteSpace: "nowrap",
              }}
            >
              <thead
                style={{
                  backgroundColor: "var(--card)",
                  color: "var(--text-strong)",
                }}
              >
                <tr className="small text-uppercase">
                  <th>S.No</th>
                  <th>Agreement ID</th>
                  <th>Title</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Uploaded By</th>
                  <th>Expiry</th>
                  <th>Extension</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAgreements.length > 0 ? (
                  filteredAgreements.map((a, i) => {
                    const status = a.status;

                    const statusIcon =
                      status === "signed" ? <FaCheckCircle className="me-1" /> :
                        status === "rejected" ? <FaTimesCircle className="me-1" /> :
                          <FaExclamationTriangle className="me-1" />;

                    const statusColor =
                      status === "signed"
                        ? "var(--success)"
                        : status === "rejected"
                          ? "var(--destructive)"
                          : "var(--warning)";

                    const statusTextColor =
                      status === "signed"
                        ? "var(--success-foreground)"
                        : status === "rejected"
                          ? "var(--destructive-foreground)"
                          : "var(--warning-foreground)";

                    return (
                      <tr key={a._id}>
                        <td>
                          <div
                            className="rounded-circle d-inline-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "var(--muted)",
                              width: "30px",
                              height: "30px",
                              fontSize: "0.9rem",
                            }}
                          >
                            {i + 1}
                          </div>
                        </td>

                        <td>{a.agreementId}</td>
                        <td>{a.title}</td>

                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {a.client?.profile ? (
                              <img
                                src={a.client.profile}
                                alt={a.client.name}
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "1px solid var(--border)",
                                }}
                              />
                            ) : (
                              <div
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  backgroundColor: "var(--muted)",
                                  color: "var(--text-muted)",
                                  fontSize: "0.8rem",
                                }}
                              >
                                <FaUser />
                              </div>
                            )}

                            <span>{a.client?.name || "N/A"}</span>
                          </div>
                        </td>


                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: statusColor,
                              color: statusTextColor,
                            }}
                          >
                            {statusIcon} {status}
                          </span>
                        </td>

                        <td>{a.uploadedBy?.name || "N/A"}</td>
                        <td>{new Date(a.expiryDate).toLocaleDateString()}</td>

                        <td>
                          {a.extensionRequest?.requested ? (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: "var(--warning)",
                                color: "var(--warning-foreground)",
                              }}
                            >
                              <FaClock className="me-1" />
                              {a.extensionRequest.status}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() =>
                              navigate(`/admin/agreement/track/${a._id}`)
                            }
                          >
                            <FaFileContract />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-3 text-muted">
                      No agreements found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Container>
    </>
  );
}
