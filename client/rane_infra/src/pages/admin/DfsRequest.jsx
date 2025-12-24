import React, { useEffect, useState } from "react";
import { getMyRequests, deleteDfsFile } from "../../services/dfsService";
import AdminHeader from "../../component/header/AdminHeader";
import ClientHeader from "../../component/header/ClientHeader";
import StaffHeader from "../../component/header/StaffHeader";
import { Container, Table, Spinner, Button } from "react-bootstrap";
import { FaEye, FaEllipsisV, FaTrash, FaClock, FaTasks } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import DeleteConfirmationModal from "../../component/models/DeleteConfirmationModal";
import NoFilesAssigned from "../../assets/components/unique_component/NoFilesAssigned";

export default function DfsRequest() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

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

  const handleDeleteClick = (document) => {
    setSelectedDocument(document);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDocument) return;

    try {
      await deleteDfsFile(selectedDocument._id);
      // Remove the deleted document from the state
      setDocuments(documents.filter(doc => doc._id !== selectedDocument._id));
      alert("✅ DFS file deleted successfully!");
    } catch (error) {
      alert("❌ Failed to delete DFS file: " + error.message);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      pending: "var(--warning)",
      "in-review": "var(--secondary)",
      approved: "var(--success)",
      rejected: "var(--destructive)",
    };
    return map[status] || "var(--muted)";
  };


  return (
    <>
      {getHeaderComponent()}
      <Container
        fluid
        className="m-0 p-0 my-md-3 p-md-3"
        style={{
          backgroundColor: "var(--background)",
          borderRadius: "15px",
          minHeight: "100vh",
        }}
      >
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" style={{ color: "var(--primary)" }} />
          </div>
        ) : documents.length === 0 ? (
          <NoFilesAssigned />
        ) : (

          <div>

            <h5
              className="d-flex align-items-center gap-3 mb-4 fw-semibold"
              style={{ color: "var(--text-strong)" }}
            >
              {/* Icon Box */}
              <span
                className="d-inline-flex align-items-center justify-content-center rounded border"
                style={{
                  width: 38,
                  height: 38,
                  backgroundColor: "var(--secondary)",
                  color: "var(--accent)",
                  borderColor: "var(--border)",
                }}
              >
                <FaTasks />
              </span>

              {/* Text */}
              <span>
                Documents Assigned to You
                <div
                  className="small fw-normal"
                  style={{ color: "var(--text-muted)" }}
                >
                  Pending actions & review requests
                </div>
              </span>
            </h5>

            {/* 📱 Desktop View – Table Layout */}

            <div
              className="table-responsive rounded d-none d-md-block"
              style={{
                background: "var(--card)",
                boxShadow: "0 6px 18px var(--shadow-color)",
              }}
            >
              <Table
                hover
                responsive
                className="shadow-sm small mb-0"
                style={{
                  backgroundColor: "var(--card)",
                  borderRadius: "16px",
                  minWidth: "1200px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  border: "1px solid var(--border)"
                }}
              >
                {/* Header */}
                <thead
                  style={{
                    backgroundColor: "var(--card)",
                    color: "var(--text-strong)"
                  }}
                >
                  <tr className="text-uppercase small">
                    <th>S.No</th>
                    <th>Document</th>
                    <th>User</th>
                    <th>Forwarded By</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th className="text-center">View</th>
                    <th className="text-center">More</th>
                    {user?.role === "admin" && (
                      <th className="text-center">Delete</th>
                    )}
                  </tr>
                </thead>

                {/* Body */}
                <tbody>
                  {documents.length > 0 ? (
                    documents.map((doc, i) => {
                      const statusBg = getStatusColor(doc.status);

                      return (
                        <tr key={doc._id}>
                          {/* Index */}
                          <td>
                            <div
                              className="rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{
                                backgroundColor: "var(--muted)",
                                color: "var(--text-strong)",
                                width: "30px",
                                height: "30px",
                                fontSize: "0.85rem"
                              }}
                            >
                              {i + 1}
                            </div>
                          </td>

                          {/* Document Name */}
                          <td style={{ fontWeight: 500 }}>
                            {doc.fileTitle}
                          </td>

                          {/* User */}
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {doc.uploadedBy?.profile ? (
                                <img
                                  src={doc.uploadedBy.profile}
                                  alt={doc.uploadedBy.name}
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "1px solid var(--border)"
                                  }}
                                />
                              ) : (
                                <FaUserCircle
                                  style={{
                                    fontSize: "28px",
                                    color: "var(--text-muted)"
                                  }}
                                />
                              )}

                              <span>{doc.uploadedBy?.name || "—"}</span>
                            </div>
                          </td>

                          {/* Forwarded By */}
                          <td>
                            {doc.forwardedBy?.name ? (
                              <span>{doc.forwardedBy.name}</span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td>
                            <span
                              className="badge text-capitalize"
                              style={{
                                backgroundColor: statusBg,
                                color: "var(--foreground)"
                              }}
                            >
                              {doc.status}
                            </span>
                          </td>

                          {/* Created At */}
                          <td>
                            <FaClock className="me-1 text-muted" />
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </td>

                          {/* View */}
                          <td className="text-center">
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              href={doc.fileUrl}
                              target="_blank"
                              title="View Document"
                              style={{
                                borderColor: "var(--border)",
                                color: "var(--secondary-foreground)"
                              }}
                            >
                              <FaEye />
                            </Button>
                          </td>

                          {/* More */}
                          <td className="text-center">
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              title="Details"
                              style={{
                                borderColor: "var(--border)",
                                color: "var(--text-muted)"
                              }}
                              onClick={() =>
                                navigate(`/${user.role}/dfsrequest/${doc._id}`)
                              }
                            >
                              <FaEllipsisV />
                            </Button>
                          </td>

                          {/* Delete (Admin Only) */}
                          {user?.role === "admin" && (
                            <td className="text-center">
                              <Button
                                size="sm"
                                variant="outline-danger"
                                title="Delete"
                                onClick={() => handleDeleteClick(doc)}
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={user?.role === "admin" ? 9 : 8}
                        className="text-center py-4"
                        style={{ color: "var(--text-muted)" }}
                      >
                        No documents found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

            </div>

            {/* 📱 Mobile View – Card Layout */}
            <div className="d-block d-md-none">
              {documents.map((doc, index) => (
                <div
                  key={doc._id}
                  className="mb-3 p-3 rounded"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 4px 12px var(--shadow-color)",
                  }}
                >
                  {/* Top Row: User */}
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <img
                      src={doc.uploadedBy?.profile || "/default-avatar.png"}
                      alt="Profile"
                      className="rounded-circle"
                      width="36"
                      height="36"
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--text-strong)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {doc.uploadedBy?.name || "—"}
                      </div>
                      <small style={{ color: "var(--text-muted)" }}>
                        Forwarded by: {doc.forwardedBy?.name || "—"}
                      </small>
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="mb-2">
                    <strong style={{ color: "var(--text-strong)" }}>
                      {doc.fileTitle}
                    </strong>
                  </div>

                  {/* Status & Date */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: getStatusColor(doc.status),
                        color: "var(--foreground)",
                      }}
                    >
                      {doc.status}
                    </span>

                    <small style={{ color: "var(--text-muted)" }}>
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </small>
                  </div>

                  {/* Actions */}
                  <div className="d-flex justify-content-between">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{
                        borderColor: "var(--primary)",
                        color: "var(--primary)",
                      }}
                    >
                      <FaEye /> View
                    </a>



                    {user?.role === "admin" && (
                      <Button
                        size="sm"
                        style={{
                          borderColor: "var(--destructive)",
                          color: "var(--destructive)",
                          background: "transparent",
                        }}
                        onClick={() => handleDeleteClick(doc)}
                      >
                        <FaTrash />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      style={{
                        borderColor: "var(--secondary)",
                        color: "var(--secondary-foreground)",
                        background: "transparent",
                      }}
                      onClick={() =>
                        navigate(`/${user.role}/dfsrequest/${doc._id}`)
                      }
                    >
                      <FaEllipsisV />
                    </Button>
                  </div>
                </div>
              ))}
            </div>




          </div>
        )}
      </Container>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedDocument?.fileTitle}
        itemType="DFS Document"
      />
    </>
  );
}
