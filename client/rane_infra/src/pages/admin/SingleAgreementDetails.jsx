import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAgreementById,
  reviewAgreementExtension,
} from "../../services/agreement";
import AdminHeader from "../../component/header/AdminHeader";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Modal,
  Image,
} from "react-bootstrap";
import {
  FaFileContract, FaCalendarAlt, FaInfoCircle, FaEye, FaPenFancy, FaCheckCircle,
  FaTimesCircle,
  FaHistory, FaClock
} from "react-icons/fa";
import { FaUserTie, FaUserCircle } from "react-icons/fa";




export default function SingleAgreementDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [decision, setDecision] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAgreement();
  }, [id]);

  const fetchAgreement = async () => {
    try {
      setLoading(true);
      const res = await getAgreementById(id);
      setAgreement(res.agreement);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type) => {
    setDecision(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setDecision(null);
  };

  const handleReviewExtension = async () => {
    try {
      setActionLoading(true);
      await reviewAgreementExtension(id, decision);
      closeModal();
      fetchAgreement();
    } catch (err) {
      console.error(err);
      alert(err.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="text-center mt-5">
          <Spinner animation="border" />
          <p>Loading agreement details...</p>
        </div>
      </>
    );
  }

  if (!agreement) {
    return (
      <>
        <AdminHeader />
        <p className="text-center mt-5">Agreement not found</p>
      </>
    );
  }

  const hasExtensionRequest = agreement.extensionRequest?.requested;

  return (
    <>
      <AdminHeader />

      <Container
        fluid
        className="py-4 my-3"
        style={{
          backgroundColor: "var(--background)",
          minHeight: "100vh",
          borderRadius: "20px",
        }}
      >
        {/* AGREEMENT INFO */}
        <Card className="mb-4 shadow-sm border-0"
          style={{
            background: "var(--card)",
            color: "var(--card-foreground)",
            borderRadius: "12px",
          }}
        >
          {/* HEADER */}
          <Card.Header
            className="d-flex justify-content-between align-items-center"
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {/* Left: Title */}
            <div className="d-flex align-items-center gap-2 fw-semibold">
              <FaFileContract
                size={18}
                style={{ color: "var(--accent)" }}
              />
              Agreement Information
            </div>

            {/* Right: Expiry */}
            <div
              className="d-flex align-items-center gap-2 px-3 py-1"
              style={{
                background: "var(--muted)",
                borderRadius: "20px",
                fontSize: "13px",
                color: "var(--text-strong)",
              }}
            >
              <FaCalendarAlt
                size={14}
                style={{ color: "var(--accent)" }}
              />
              <span className="fw-semibold">
                Expiry:
              </span>
              <span>
                {agreement.expiryDate
                  ? new Date(agreement.expiryDate).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </Card.Header>

          {/* BODY */}
          <Card.Body>
            <Row className="gy-3">
              <Col md={6}>
                <small className="text-muted">Agreement ID</small>
                <div className="fw-semibold">{agreement.agreementId}</div>
              </Col>

              <Col md={6}>
                <small className="text-muted">Status</small>
                <div
                  className="fw-semibold"
                  style={{ color: "var(--warning-foreground)" }}
                >
                  {agreement.status}
                </div>
              </Col>

              <Col md={12}>
                <small className="text-muted">Title</small>
                <div className="fw-semibold">{agreement.title}</div>
              </Col>

              <Col md={12}>
                <small className="text-muted">Description</small>
                <div style={{ color: "var(--text-muted)" }}>
                  {agreement.description || "—"}
                </div>
              </Col>

              <Col md={12}>
                <a
                  href={agreement.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm d-inline-flex align-items-center gap-2"
                  style={{
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                    borderRadius: "8px",
                  }}
                >
                  <FaInfoCircle />
                  View Agreement File
                </a>
              </Col>
            </Row>
          </Card.Body>
        </Card>


        {/* PARTICIPANTS */}
        <Card
          className="mb-4 shadow-sm border-0"
          style={{
            background: "var(--card)",
            color: "var(--card-foreground)",
            borderRadius: "12px",
          }}
        >
          {/* HEADER */}
          <Card.Header
            className="d-flex align-items-center gap-2 fw-semibold"
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <FaUserCircle size={18} style={{ color: "var(--accent)" }} />
            Participants
          </Card.Header>

          {/* BODY */}
          <Card.Body>
            <Row className="gy-4">
              {/* UPLOADED BY (ADMIN) */}
              <Col md={6}>
                <small className="text-muted">Uploaded By</small>

                <div className="d-flex align-items-center gap-3 mt-2">
                  {/* Admin Profile */}
                  <Image
                    src={
                      agreement.uploadedBy?.profile ||
                      "https://via.placeholder.com/100"
                    }
                    roundedCircle
                    width={60}
                    height={60}
                    style={{
                      border: "2px solid var(--secondary)",
                      background: "var(--muted)",
                    }}
                  />

                  {/* Admin Info */}
                  <div>
                    <div
                      className="fw-semibold d-flex align-items-center gap-2"
                      style={{ color: "var(--text-strong)" }}
                    >
                      <FaUserTie
                        size={14}
                        style={{ color: "var(--accent)" }}
                      />
                      {agreement.uploadedBy?.name || "—"}
                    </div>

                    <div style={{ color: "var(--text-muted)" }}>
                      {agreement.uploadedBy?.email || "—"}
                    </div>
                  </div>
                </div>
              </Col>

              {/* CLIENT */}
              <Col md={6}>
                <small className="text-muted">Client</small>

                <div
                  className="d-flex align-items-center gap-3 mt-2"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/admin/client-detail/${agreement.client?._id}`)
                  }
                >
                  {/* Client Profile */}
                  <Image
                    src={
                      agreement.client?.profile ||
                      "https://via.placeholder.com/100"
                    }
                    roundedCircle
                    width={60}
                    height={60}
                    style={{
                      border: "2px solid var(--secondary)",
                      background: "var(--muted)",
                    }}
                  />

                  {/* Client Info */}
                  <div>
                    <div
                      className="fw-semibold"
                      style={{ color: "var(--text-strong)" }}
                    >
                      {agreement.client?.name || "—"}
                    </div>

                    <div style={{ color: "var(--text-muted)" }}>
                      {agreement.client?.email || "—"}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>


        {/* DATES */}
        <Card
          className="mb-4 shadow-sm border-0"
          style={{
            background: "var(--card)",
            color: "var(--card-foreground)",
            borderRadius: "12px",
          }}
        >
          {/* HEADER */}
          <Card.Header
            className="d-flex align-items-center gap-2 fw-semibold"
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <FaCalendarAlt size={16} style={{ color: "var(--accent)" }} />
            Agreement Timeline
          </Card.Header>

          {/* BODY */}
          <Card.Body>
            <Row className="gy-4">
              {/* Uploaded */}
              <Col md={3}>
                <small className="text-muted d-flex align-items-center gap-1">
                  <FaClock size={12} /> Uploaded At
                </small>
                <div className="fw-semibold" style={{ color: "var(--text-strong)" }}>
                  {formatDate(agreement.createdAt)}
                </div>
              </Col>

              {/* Viewed */}
              <Col md={3}>
                <small className="text-muted d-flex align-items-center gap-1">
                  <FaEye size={12} /> Viewed At
                </small>
                <div className="fw-semibold" style={{ color: "var(--text-strong)" }}>
                  {formatDate(agreement.viewedAt)}
                </div>
              </Col>

              {/* Signed */}
              <Col md={3}>
                <small className="text-muted d-flex align-items-center gap-1">
                  <FaPenFancy size={12} /> Signed At
                </small>
                <div className="fw-semibold" style={{ color: "var(--text-strong)" }}>
                  {formatDate(agreement.signedAt)}
                </div>
              </Col>

              {/* Expiry */}
              <Col md={3}>
                <small className="text-muted d-flex align-items-center gap-1">
                  <FaCalendarAlt size={12} /> Expiry Date
                </small>
                <div
                  className="fw-bold"
                  style={{
                    color: "var(--destructive)",
                  }}
                >
                  {formatDate(agreement.expiryDate)}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* EXTENSION REQUEST */}
        <Card
          className="mb-4 shadow-sm border-0"
          style={{
            background: "var(--card)",
            color: "var(--card-foreground)",
            borderRadius: "12px",
          }}
        >
          {/* HEADER */}
          <Card.Header
            className="d-flex align-items-center gap-2 fw-semibold"
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <FaClock size={16} style={{ color: "var(--accent)" }} />
            Extension Request
          </Card.Header>

          {/* BODY */}
          <Card.Body>
            {!hasExtensionRequest ? (
              <div
                className="d-flex align-items-center gap-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                <FaInfoCircle />
                No extension requested
              </div>
            ) : (
              <>
                <Row className="gy-4">
                  {/* Requested Expiry */}
                  <Col md={4}>
                    <small className="text-muted d-flex align-items-center gap-1">
                      <FaCalendarAlt size={12} /> Requested Expiry
                    </small>
                    <div className="fw-semibold">
                      {formatDate(
                        agreement.extensionRequest.requestedExpiryDate
                      )}
                    </div>
                  </Col>

                  {/* Status */}
                  <Col md={4}>
                    <small className="text-muted">Status</small>
                    <div
                      className="fw-semibold d-flex align-items-center gap-1"
                      style={{
                        color:
                          agreement.extensionRequest.status === "approved"
                            ? "var(--success-foreground)"
                            : agreement.extensionRequest.status === "rejected"
                              ? "var(--destructive)"
                              : "var(--warning-foreground)",
                      }}
                    >
                      {agreement.extensionRequest.status === "approved" && (
                        <FaCheckCircle />
                      )}
                      {agreement.extensionRequest.status === "rejected" && (
                        <FaTimesCircle />
                      )}
                      {agreement.extensionRequest.status}
                    </div>
                  </Col>

                  {/* Reason */}
                  <Col md={12}>
                    <small className="text-muted">Reason</small>
                    <div style={{ color: "var(--text-muted)" }}>
                      {agreement.extensionRequest.reason || "—"}
                    </div>
                  </Col>
                </Row>

                {/* ACTIONS */}
                <div className="mt-4 d-flex gap-2">
                  <Button
                    size="sm"
                    style={{
                      background: "var(--success)",
                      color: "var(--success-foreground)",
                      border: "none",
                    }}
                    onClick={() => openModal("approved")}
                  >
                    <FaCheckCircle className="me-1" /> Accept
                  </Button>

                  <Button
                    size="sm"
                    style={{
                      background: "var(--destructive)",
                      color: "var(--destructive-foreground)",
                      border: "none",
                    }}
                    onClick={() => openModal("rejected")}
                  >
                    <FaTimesCircle className="me-1" /> Reject
                  </Button>
                </div>
              </>
            )}
          </Card.Body>
        </Card>

        {/* EXTENSION HISTORY */}
        <Card
          className="mb-4 shadow-sm border-0"
          style={{
            background: "var(--card)",
            color: "var(--card-foreground)",
            borderRadius: "12px",
          }}
        >
          {/* HEADER */}
          <Card.Header
            className="d-flex align-items-center gap-2 fw-semibold"
            style={{
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <FaHistory size={16} style={{ color: "var(--accent)" }} />
            Extension History
          </Card.Header>

          {/* BODY */}
          <Card.Body>
            {agreement.extensions.length === 0 ? (
              <div
                className="d-flex align-items-center gap-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                <FaInfoCircle />
                No extensions applied
              </div>
            ) : (
              agreement.extensions.map((ext, i) => (
                <Card
                  key={i}
                  className="mb-3 border-0"
                  style={{
                    background: "var(--muted)",
                    borderRadius: "10px",
                  }}
                >
                  <Card.Body>
                    <Row className="gy-3">
                      <Col md={3}>
                        <small className="text-muted">Old Expiry</small>
                        <div className="fw-semibold">
                          {formatDate(ext.oldExpiryDate)}
                        </div>
                      </Col>

                      <Col md={3}>
                        <small className="text-muted">New Expiry</small>
                        <div
                          className="fw-semibold"
                          style={{ color: "var(--success-foreground)" }}
                        >
                          {formatDate(ext.newExpiryDate)}
                        </div>
                      </Col>

                      <Col md={3}>
                        <small className="text-muted">Extended At</small>
                        <div>{formatDate(ext.extendedAt)}</div>
                      </Col>

                      <Col md={3}>
                        <small className="text-muted">Reason</small>
                        <div style={{ color: "var(--text-muted)" }}>
                          {ext.reason || "—"}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))
            )}
          </Card.Body>
        </Card>




      </Container>

      {/* MODAL */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {decision === "approved"
              ? "Approve Extension"
              : "Reject Extension"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to <strong>{decision}</strong> this request?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            variant={decision === "approved" ? "success" : "danger"}
            onClick={handleReviewExtension}
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

/* HELPERS */
const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString();
};
