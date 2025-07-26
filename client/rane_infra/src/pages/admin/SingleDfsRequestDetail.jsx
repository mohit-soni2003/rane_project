import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getFileById,
  getAllUsers,
  forwardDocument
} from "../../services/dfsService";
import { CLOUDINARY_URL, UPLOAD_PRESET } from "../../store/keyStore";
import {
  Container,
  Spinner,
  Card,
  Row,
  Col,
  Table,
  Image,
  Badge,
  Button,
  Form
} from "react-bootstrap";
import AdminHeader from "../../component/header/AdminHeader";
import moment from "moment";
import { FaPaperPlane, FaFilePdf, FaUserCircle } from "react-icons/fa";
import { MdAttachFile } from "react-icons/md";

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

  return (
    <>
      <AdminHeader />
      <Container fluid className="py-4 w-100">
        <h3 className="mb-4 fw-bold">
          <FaFilePdf className="mb-1 me-2" /> DFS Request Detail
        </h3>

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : !file ? (
          <p className="text-muted">No file found.</p>
        ) : (
          <>
            {/* Document Info */}
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <Row>
                  <Col md={9}>
                    <h5 className="fw-bold">{file.fileTitle}</h5>
                    <p><strong>Type:</strong> {file.docType}</p>
                    <p><strong>Department:</strong> {file.Department}</p>
                    <p><strong>Description:</strong> {file.description}</p>
                    <p>
                      <strong>View Document:</strong>{" "}
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                        <FaFilePdf className="me-1" /> Open PDF
                      </a>
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <Badge bg={file.status === "pending" ? "warning" : "success"}>
                        {file.status}
                      </Badge>
                    </p>
                  </Col>
                  <Col md={3} className="text-md-end text-center">
                    <div className="d-flex justify-content-md-end justify-content-center mb-2">
                      <Image
                        src={file.uploadedBy.profile || ""}
                        roundedCircle
                        width={36}
                        height={36}
                        className="me-2"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <div>
                        <strong>{file.uploadedBy.name}</strong>
                        <br />
                        <small className="text-muted">Uploader</small>
                      </div>
                    </div>
                    <p className="text-muted">
                      <small>Uploaded on: {moment(file.createdAt).format("DD MMM YYYY, hh:mm A")}</small>
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Forwarding Trail */}
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-4 fw-bold">📬 Forwarding Trail</h5>
                {file.forwardingTrail.length === 0 ? (
                  <p className="text-muted">No forwarding history found.</p>
                ) : (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr className="table-secondary">
                        <th>Forwarded By</th>
                        <th>Forwarded To</th>
                        <th>Note</th>
                        <th>Action</th>
                        <th>Date & Time</th>
                        <th>Attachment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {file.forwardingTrail.map((trail, index) => (
                        <tr key={index}>
                          <td>
                            <Image
                              src={trail.forwardedBy?.profile}
                              roundedCircle
                              width={30}
                              height={30}
                              className="me-2"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                            {trail.forwardedBy?.name || "Unknown"}
                          </td>
                          <td>
                            <Image
                              src={trail.forwardedTo?.profile}
                              roundedCircle
                              width={30}
                              height={30}
                              className="me-2"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                            {trail.forwardedTo?.name || "Unknown"}
                          </td>
                          <td>{trail.note}</td>
                          <td>
                            <Badge bg="info" className="text-capitalize">{trail.action}</Badge>
                          </td>
                          <td>{moment(trail.timestamp).format("DD MMM YYYY, hh:mm A")}</td>
                          <td>
                            {trail.attachment ? (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                href={trail.attachment}
                                target="_blank"
                              >
                                <MdAttachFile className="me-1" />
                                View
                              </Button>
                            ) : (
                              <span className="text-muted">No attachment</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </Table>
                )}
              </Card.Body>
            </Card>

            {/* Forwarding Form */}
            <Card className="shadow-sm border-0 mt-4">
              <Card.Body>
                <h5 className="mb-4 fw-bold">📤 Forward This Document</h5>
                <Form onSubmit={handleForward}>
                  <Row className="mb-3">
                    <Col md={4}>
                      <Form.Label className="fw-semibold">Forward To</Form.Label>
                      <Form.Select
                        value={forwardedTo}
                        onChange={(e) => setForwardedTo(e.target.value)}
                        required
                      >

                        <option value="">-- Select User --</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>

                    <Col md={4}>
                      <Form.Label className="fw-semibold">Action <span className="fw-light">(Represent what you done)</span></Form.Label>
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

                    <Col md={4}>
                      <Form.Label className="fw-semibold">Status<span className="fw-light"> (Represent overlall status of file)</span></Form.Label>
                      <Form.Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                      >
                        <option value="">-- Select Status --</option>
                        <option value="pending">Pending</option>
                        <option value="in-review">In-Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </Form.Select>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <Form.Label className="fw-semibold">Note</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Add a note..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        required
                      />
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col>
                      <Form.Label className="fw-semibold">
                        <MdAttachFile className="me-1" /> Attachment (Optional)
                      </Form.Label>
                      <Form.Control
                        type="file"
                        onChange={(e) => setAttachment(e.target.files[0])}
                      />
                    </Col>
                  </Row>

                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? "Forwarding..." : (
                      <>
                        <FaPaperPlane className="me-2" /> Forward Document
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </>
  );
}
