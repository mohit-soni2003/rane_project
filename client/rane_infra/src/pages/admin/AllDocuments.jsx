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
  Badge,
  Alert
} from "react-bootstrap";
import AdminHeader from "../../component/header/AdminHeader";
import ClientHeader from "../../component/header/ClientHeader";
import StaffHeader from "../../component/header/StaffHeader";
import { backend_url } from "../../store/keyStore";
import { useAuthStore } from "../../store/authStore";
import moment from "moment";

export default function AllDocuments() {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [stats, setStats] = useState({ total: 0, regularCount: 0, dfsCount: 0 });

  // Get the appropriate API endpoint based on user role
  const getApiEndpoint = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin-get-all-documents';
      case 'client':
        return '/client-get-all-documents';
      case 'staff':
        return '/staff-get-all-documents';
      default:
        return '/admin-get-all-documents'; // fallback
    }
  };

  // Get the appropriate header component based on user role
  const getHeaderComponent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminHeader />;
      case 'client':
        return <ClientHeader />;
      case 'staff':
        return <StaffHeader />;
      default:
        return <AdminHeader />; // fallback
    }
  };

  const fetchDocuments = () => {
    if (!user || !user.role) {
      console.log("User not available yet, skipping API call");
      return;
    }
    
    const endpoint = getApiEndpoint();
    console.log("User:", user);
    console.log("User role:", user?.role);
    console.log("API Endpoint:", endpoint);
    console.log("Full URL:", `${backend_url}${endpoint}`);
    
    fetch(`${backend_url}${endpoint}`)
      .then((res) => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("API Response:", data);
        if (data.success) {
          setDocuments(data.documents || []);
          setStats({
            total: data.total || 0,
            regularCount: data.regularCount || 0,
            dfsCount: data.dfsCount || 0
          });
        } else {
          console.error("Error fetching documents:", data.message);
          setDocuments([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching documents:", err);
        setDocuments([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user && user.role) {
      fetchDocuments();
    }
  }, [user]);

  const displayValue = (val) => (val ? val : "-");

  const formatDate = (date) =>
    date ? moment(date).format("DD MMM YYYY, hh:mm A") : "-";

  // Filter documents based on search term and type
  const filteredDocuments = documents.filter((doc) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      doc.title?.toLowerCase().includes(term) ||
      doc.documentType?.toLowerCase().includes(term) ||
      doc.description?.toLowerCase().includes(term) ||
      doc.uploadedBy?.name?.toLowerCase().includes(term) ||
      doc.userId?.name?.toLowerCase().includes(term);

    const matchesType = filterType === "all" || doc.type === filterType;

    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status, type) => {
    let variant = "secondary";
    if (type === "dfs") {
      switch (status) {
        case "pending": variant = "warning"; break;
        case "in-review": variant = "info"; break;
        case "approved": variant = "success"; break;
        case "rejected": variant = "danger"; break;
        default: variant = "secondary";
      }
    } else {
      switch (status) {
        case "pending": variant = "warning"; break;
        case "accepted": variant = "success"; break;
        case "rejected": variant = "danger"; break;
        default: variant = "secondary";
      }
    }
    return <Badge bg={variant}>{status}</Badge>;
  };

  const getTypeBadge = (type) => {
    return (
      <Badge bg={type === "regular" ? "primary" : "info"}>
        {type === "regular" ? "Regular" : "DFS"}
      </Badge>
    );
  };

  return (
    <>
      {getHeaderComponent()}
      <Container fluid className="py-4 px-0">
        <Card className="p-4 shadow border-0" style={{ backgroundColor: "var(--client-component-bg-color)" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0 fw-bold">All Documents</h3>
            <div className="d-flex gap-3">
              <div className="text-center">
                <div className="fw-bold text-primary">{stats.total}</div>
                <small className="text-muted">Total</small>
              </div>
              <div className="text-center">
                <div className="fw-bold text-success">{stats.regularCount}</div>
                <small className="text-muted">Regular</small>
              </div>
              <div className="text-center">
                <div className="fw-bold text-info">{stats.dfsCount}</div>
                <small className="text-muted">DFS</small>
              </div>
            </div>
          </div>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Search by title, type, description, or user name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="regular">Regular Documents</option>
                <option value="dfs">DFS Documents</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button variant="outline-primary" onClick={fetchDocuments} className="w-100">
                Refresh
              </Button>
            </Col>
          </Row>

          {loading || !user ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">
                {loading ? "Loading documents..." : "Waiting for authentication..."}
              </p>
            </div>
          ) : (
            <>
              <Alert variant="info" className="mb-3">
                Showing {filteredDocuments.length} of {documents.length} documents
              </Alert>

              <div className="table-responsive">
                <Table responsive bordered hover className="mb-3 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Type</th>
                      <th>Title</th>
                      <th>Document Type</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Uploaded By</th>
                      <th>Current Owner</th>
                      <th>Upload Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc, index) => (
                        <tr key={doc._id}>
                          <td>{index + 1}</td>
                          <td>{getTypeBadge(doc.type)}</td>
                          <td className="fw-semibold">{doc.title}</td>
                          <td>{displayValue(doc.documentType)}</td>
                          <td>
                            <div style={{
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {doc.description}
                            </div>
                          </td>
                          <td>{getStatusBadge(doc.status, doc.type)}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              {doc.uploadedBy?.profile && (
                                <img
                                  src={doc.uploadedBy.profile}
                                  alt="Profile"
                                  width="30"
                                  height="30"
                                  className="rounded-circle me-2"
                                />
                              )}
                              <div>
                                <div className="fw-semibold">{doc.uploadedBy?.name || "-"}</div>
                                <small className="text-muted">{doc.uploadedBy?.role || ""}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {doc.userId?.profile && (
                                <img
                                  src={doc.userId.profile}
                                  alt="Profile"
                                  width="30"
                                  height="30"
                                  className="rounded-circle me-2"
                                />
                              )}
                              <div>
                                <div className="fw-semibold">{doc.userId?.name || "-"}</div>
                                <small className="text-muted">{doc.userId?.role || ""}</small>
                              </div>
                            </div>
                          </td>
                          <td>{formatDate(doc.uploadDate || doc.createdAt)}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                href={doc.documentLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View
                              </Button>
                              {doc.type === 'dfs' && (
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  href={`/admin/dfsrequest/${doc._id}`}
                                >
                                  Details
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center py-4">
                          <div className="text-muted">
                            {searchTerm || filterType !== "all"
                              ? "No documents match your search criteria."
                              : "No documents found in the database."}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Card>
      </Container>
    </>
  );
}
