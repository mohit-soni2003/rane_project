import React, { useEffect, useState } from "react";
import { getMyRequests } from "../../services/dfsService";
import AdminHeader from "../../component/header/AdminHeader";
import { Container, Table, Spinner, Button } from "react-bootstrap";
import { FaEye, FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function DfsRequest() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {user} = useAuthStore();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await getMyRequests();
      setDocuments(data);
    } catch (error) {
      alert("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      pending: "var(--admin-warning-color)",
      "in-review": "var(--admin-info-color)",
      approved: "var(--admin-success-color)",
      rejected: "var(--admin-danger-color)",
    };
    return map[status] || "var(--admin-muted-color)";
  };

  return (
    <>
      <AdminHeader />
      <Container
        fluid
        className="py-4"
        style={{ backgroundColor: "var(--admin-dashboard-bg-color)", minHeight: "100vh" }}
      >
        <h4 className="mb-4">📁 DFS Requests Assigned To Me</h4>

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-muted">No DFS requests assigned currently.</p>
        ) : (
          <div className="table-responsive shadow-sm rounded">
            <Table
              striped
              hover
              className="align-middle"
              style={{
                backgroundColor: "var(--admin-component-bg-color)",
                border: "1px solid var(--admin-border-color)",
              }}
            >
              <thead style={{ backgroundColor: "#e7edf3" }}>
                <tr className="text-muted small text-uppercase">
                  <th>S.No</th>
                  <th>Document Name</th>
                  <th>User Image</th>
                  <th>Username</th>
                  <th>Forwarded By</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>View</th>
                  <th>More</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr key={doc._id}>
                    <td>
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: "#fcebea",
                          width: "30px",
                          height: "30px",
                          fontSize: "0.9rem",
                        }}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td>{doc.fileTitle}</td>
                    <td>
                      <img
                        src={doc.uploadedBy?.profile || "/default-avatar.png"}
                        alt="Profile"
                        className="rounded-circle"
                        width="36"
                        height="36"
                      />
                    </td>
                    <td>{doc.uploadedBy?.name || "—"}</td>
                    <td>{doc.forwardedBy?.name || "—"}</td>
                    <td>
                      <span
                        className="badge text-white"
                        style={{ backgroundColor: getStatusColor(doc.status) }}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td className="text-center">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                        title="View Document"
                      >
                        <FaEye />
                      </a>
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        title="More Options"
                        onClick={() =>navigate(`/${user.role}/dfsrequest/${doc._id}`)}
                      >
                        <FaEllipsisV />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Container>
    </>
  );
}
