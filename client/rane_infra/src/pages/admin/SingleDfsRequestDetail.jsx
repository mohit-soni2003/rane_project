import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getFileById, getAllUsers, forwardDocument,
  deleteDfsFile
} from "../../services/dfsService";
import { CLOUDINARY_URL, UPLOAD_PRESET } from "../../store/keyStore";
import { Container, Spinner, Card, Row, Col, Table, Image, Badge, Button, Form } from "react-bootstrap";
import AdminHeader from "../../component/header/AdminHeader";
import moment from "moment";
// import { FaPaperPlane, FaFilePdf, FaUserCircle, FaTrash } from "react-icons/fa";
import { MdAttachFile } from "react-icons/md";
import { useAuthStore } from "../../store/authStore";
import DeleteConfirmationModal from "../../component/models/DeleteConfirmationModal";
import {
  FaUserPlus,
  FaTasks,
  FaStickyNote,
  FaPaperPlane,
  FaFilePdf,
  FaUserCircle,
  FaTrash,
  FaBuilding,
  FaLayerGroup,
  FaInfoCircle,
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
  FaExternalLinkAlt
} from "react-icons/fa";



export default function SingleDfsRequestDetail() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  // Form state
  const [forwardedTo, setForwardedTo] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fileData, userData] = await Promise.all([
          getFileById(id),
          getAllUsers()
        ]);
        setFile(fileData);
        setUsers(userData);
        setStatus(fileData.status);
      } catch (error) {
        alert("❌ " + error.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleForward = async (e) => {
    e.preventDefault();
    if (!forwardedTo || !action || !note.trim() || !status) {
      alert("⚠️ Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      let attachmentUrl = null;
      if (attachment) {
        const formData = new FormData();
        formData.append("file", attachment);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(CLOUDINARY_URL, {
          method: "POST",
          body: formData
        });

        const uploadData = await res.json();
        if (!uploadData.secure_url) throw new Error("Cloud upload failed.");
        attachmentUrl = uploadData.secure_url;
      }

      const forwardData = {
        forwardedTo,
        action,
        note,
        status,
        attachment: attachmentUrl || undefined
      };

      await forwardDocument(id, forwardData);
      alert("✅ Document forwarded successfully.");

      const updated = await getFileById(id);
      setFile(updated);
      setForwardedTo("");
      setAction("");
      setNote("");
      setAttachment(null);
    } catch (err) {
      alert("❌ Failed to forward: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setShowDeleteModal(false);
      await deleteDfsFile(file._id);
      alert("✅ File deleted successfully.");
      // Navigate back to the DFS requests page
      window.history.back();
    } catch (err) {
      alert("❌ Failed to delete file: " + err.message);
    }
  };

  return (
    <>
      <AdminHeader />
      <Container
        fluid
        className="py-4 w-100 my-3"
        style={{ backgroundColor: "var(--background)", borderRadius: "15px" }}
      >
        <h5
          className="d-flex align-items-center gap-2 mb-4 fw-semibold"
          style={{ color: "var(--text-strong)" }}
        >
          <span
            className="d-inline-flex align-items-center justify-content-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              backgroundColor: "var(--secondary)",
              color: "var(--accent)"
            }}
          >
            <FaFilePdf size={18} />
          </span>

          <span>
            DFS Request Details
            <div
              className="small fw-normal"
              style={{ color: "var(--text-muted)" }}
            >
              Document File System • Review & Forward
            </div>
          </span>
        </h5>


        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : !file ? (
          <p className="text-muted">No file found.</p>
        ) : (
          <>
            {/* Document Info */}
            <Card
              className="mb-4 border-0 shadow-sm"
              style={{
                backgroundColor: "var(--card)",
                borderRadius: "14px"
              }}
            >
              <Card.Body>
                <Row className="align-items-start">
                  {/* Left Content */}
                  <Col md={9}>
                    {/* Title */}
                    <h5
                      className="fw-semibold d-flex align-items-center gap-2 mb-2"
                      style={{ color: "var(--text-strong)" }}
                    >
                      <FaFilePdf style={{ color: "var(--accent)" }} />
                      {file.fileTitle}
                    </h5>

                    {/* Meta Info */}
                    <div className="d-flex flex-wrap gap-3 small mb-3">
                      <span className="d-flex align-items-center gap-1 text-muted">
                        <FaLayerGroup /> {file.docType}
                      </span>
                      <span className="d-flex align-items-center gap-1 text-muted">
                        <FaBuilding /> {file.Department}
                      </span>
                    </div>

                    {/* Description */}
                    <p
                      className="mb-3"
                      style={{ color: "var(--foreground)" }}
                    >
                      <FaInfoCircle className="me-1 text-muted" />
                      {file.description || "No description provided"}
                    </p>

                    {/* Actions */}
                    <div className="d-flex align-items-center gap-3">
                      <Button
                        size="sm"
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: "var(--secondary)",
                          color: "var(--secondary-foreground)",
                          border: "1px solid var(--border)"
                        }}
                      >
                        <FaExternalLinkAlt className="me-1" /> View PDF
                      </Button>

                      <span
                        className="px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1 small"
                        style={{
                          backgroundColor:
                            file.status === "pending"
                              ? "var(--warning)"
                              : "var(--success)",
                          color:
                            file.status === "pending"
                              ? "var(--warning-foreground)"
                              : "var(--success-foreground)"
                        }}
                      >
                        {file.status === "pending"
                          ? <FaHourglassHalf />
                          : <FaCheckCircle />}
                        {file.status}
                      </span>
                    </div>
                  </Col>

                  {/* Right Sidebar */}
                  <Col md={3} className="text-md-end text-center">
                    {/* Uploader */}
                    <div className="d-flex justify-content-md-end justify-content-center align-items-center gap-2 mb-2">
                      <Image
                        src={file.uploadedBy.profile || ""}
                        roundedCircle
                        width={38}
                        height={38}
                        style={{
                          border: "1px solid var(--border)",
                          objectFit: "cover"
                        }}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <div className="text-start">
                        <div className="fw-semibold small">
                          <FaUserCircle className="me-1 text-muted" />
                          {file.uploadedBy.name}
                        </div>
                        <small className="text-muted">Uploader</small>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-muted small mb-2">
                      <FaClock className="me-1" />
                      {moment(file.createdAt).format("DD MMM YYYY, hh:mm A")}
                    </div>

                    {/* Delete */}
                    {(user?.role === "admin" ||
                      user?._id === file.uploadedBy._id) && (
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="mt-2"
                          onClick={handleDeleteClick}
                        >
                          <FaTrash className="me-1" />
                          Delete
                        </Button>
                      )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>


            {/* Forwarding Trail */}
            <Card className="shadow-sm border-0" style={{ backgroundColor: "var(--card)" }}>
              <Card.Body>
                <h5
                  className="mb-4 fw-semibold d-flex align-items-center gap-2"
                  style={{ color: "var(--text-strong)" }}
                >
                  <FaPaperPlane
                    size={18}
                    style={{ color: "var(--primary)" }}   // dark brown icon
                  />
                  Forwarding Trail
                </h5>
                {file.forwardingTrail.length === 0 ? (
                  <p className="text-muted">No forwarding history found.</p>
                ) : (
                  <Table
                    hover
                    responsive
                    className="shadow-sm small"
                    style={{
                      backgroundColor: "var(--card)",
                      borderRadius: "16px",
                      minWidth: "1100px",
                      whiteSpace: "nowrap",
                      overflow: "hidden"
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
                        <th>Forwarded By</th>
                        <th>Forwarded To</th>
                        <th>Note</th>
                        <th>Action</th>
                        <th>Date & Time</th>
                        <th>Attachment</th>
                      </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                      {file.forwardingTrail.length > 0 ? (
                        file.forwardingTrail.map((trail, i) => {
                          /* Action badge colors */
                          const actionColor =
                            trail.action === "approved"
                              ? "var(--success)"
                              : trail.action === "rejected"
                                ? "var(--destructive)"
                                : "var(--warning)";

                          const actionTextColor =
                            trail.action === "approved"
                              ? "var(--success-foreground)"
                              : trail.action === "rejected"
                                ? "var(--destructive-foreground)"
                                : "var(--warning-foreground)";

                          return (
                            <tr key={i}>
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

                              {/* Forwarded By */}
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  {trail.forwardedBy?.profile ? (
                                    <img
                                      src={trail.forwardedBy.profile}
                                      alt={trail.forwardedBy.name}
                                      style={{
                                        width: "28px",
                                        height: "28px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: "1px solid var(--border)"
                                      }}
                                    />
                                  ) : (
                                    <FaUserCircle
                                      style={{
                                        fontSize: "26px",
                                        color: "var(--text-muted)"
                                      }}
                                    />
                                  )}
                                  <span>{trail.forwardedBy?.name || "Unknown"}</span>
                                </div>
                              </td>

                              {/* Forwarded To */}
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  {trail.forwardedTo?.profile ? (
                                    <img
                                      src={trail.forwardedTo.profile}
                                      alt={trail.forwardedTo.name}
                                      style={{
                                        width: "28px",
                                        height: "28px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: "1px solid var(--border)"
                                      }}
                                    />
                                  ) : (
                                    <FaUserCircle
                                      style={{
                                        fontSize: "26px",
                                        color: "var(--text-muted)"
                                      }}
                                    />
                                  )}
                                  <span>{trail.forwardedTo?.name || "Unknown"}</span>
                                </div>
                              </td>

                              {/* Note */}
                              <td
                                style={{
                                  maxWidth: "260px",
                                  whiteSpace: "normal",
                                  color: "var(--foreground)"
                                }}
                              >
                                {trail.note}
                              </td>

                              {/* Action */}
                              <td>
                                <span
                                  className="badge text-capitalize"
                                  style={{
                                    backgroundColor: actionColor,
                                    color: actionTextColor
                                  }}
                                >
                                  {trail.action}
                                </span>
                              </td>

                              {/* Date */}
                              <td>
                                <FaClock className="me-1 text-muted" />
                                {moment(trail.timestamp).format("DD MMM YYYY, hh:mm A")}
                              </td>

                              {/* Attachment */}
                              <td>
                                {trail.attachment ? (
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    href={trail.attachment}
                                    target="_blank"
                                    style={{
                                      borderColor: "var(--border)",
                                      color: "var(--secondary-foreground)"
                                    }}
                                  >
                                    <MdAttachFile className="me-1" />
                                    View
                                  </Button>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-4"
                            style={{ color: "var(--text-muted)" }}
                          >
                            No forwarding history found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

                )}
              </Card.Body>
            </Card>

            {/* Forwarding Form */}
            <Card className="shadow-sm border-0 mt-4" style={{ borderRadius: "14px", backgroundColor: "var(--card)" }}>
              <Card.Body>
                {/* Header */}
                <div className="d-flex align-items-center gap-2 mb-4">
                  <FaPaperPlane size={20} style={{ color: "var(--accent)" }} />
                  <h5 className="mb-0 fw-semibold" style={{ color: "var(--text-strong)" }}>
                    Forward This Document
                  </h5>
                </div>

                <Form onSubmit={handleForward}>
                  {/* Row 1 */}
                  <Row className="mb-3">
                    {/* Forward To */}
                    <Col md={4}>
                      <Form.Label className="fw-semibold">
                        <FaUserPlus className="me-1 text-muted" /> Forward To
                      </Form.Label>
                      <Form.Select
                        value={forwardedTo}
                        onChange={(e) => setForwardedTo(e.target.value)}
                        required
                      >
                        <option value="">-- Select User --</option>

                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.role})
                          </option>
                        ))}

                        <option value={file.uploadedBy._id}>
                          {file.uploadedBy.name} (File Owner)
                        </option>
                      </Form.Select>
                    </Col>

                    {/* Action */}
                    <Col md={4}>
                      <Form.Label className="fw-semibold">
                        <FaTasks className="me-1 text-muted" /> Action
                        <span className="fw-light"> (what you did)</span>
                      </Form.Label>
                      <Form.Select
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        required
                      >
                        <option value="">-- Select Action --</option>
                        <option value="forwarded">Forwarded</option>
                        <option value="viewed">Viewed</option>
                        <option value="commented">Commented</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </Form.Select>
                    </Col>

                    {/* Status */}
                    <Col md={4}>
                      <Form.Label className="fw-semibold">
                        <FaInfoCircle className="me-1 text-muted" /> File Status
                        <span className="fw-light"> (overall)</span>
                      </Form.Label>
                      <Form.Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                      >
                        <option value="">-- Select Status --</option>
                        <option value="pending">Pending</option>
                        <option value="in-review">In Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </Form.Select>
                    </Col>
                  </Row>

                  {/* Note */}
                  <Row className="mb-3">
                    <Col>
                      <Form.Label className="fw-semibold">
                        <FaStickyNote className="me-1 text-muted" /> Note
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Write a short note for the receiver..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        required
                      />
                    </Col>
                  </Row>

                  {/* Attachment */}
                  <Row className="mb-4">
                    <Col>
                      <Form.Label className="fw-semibold">
                        <MdAttachFile className="me-1 text-muted" />
                        Attachment <span className="fw-light">(Optional)</span>
                      </Form.Label>
                      <Form.Control
                        type="file"
                        onChange={(e) => setAttachment(e.target.files[0])}
                      />
                    </Col>
                  </Row>

                  {/* Submit Button */}
                  <div className="text-end">
                    <Button
                      type="submit"
                      disabled={submitting}
                      style={{
                        backgroundColor: "var(--accent)",
                        borderColor: "var(--accent)",
                        padding: "8px 22px",
                        fontWeight: 500,
                      }}
                    >
                      {submitting ? (
                        "Forwarding..."
                      ) : (
                        <>
                          <FaPaperPlane className="me-2" /> Forward Document
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

          </>
        )}
      </Container>

      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}   // ✅ MATCHED
        onConfirm={handleDeleteConfirm}
        itemName={file?.fileTitle || "this file"}
        itemType="DFS file"
      />

    </>
  );
}
