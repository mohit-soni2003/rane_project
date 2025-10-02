import React, { useEffect, useState } from 'react';
import {
  Table, Badge, Container, Card, Row, Col, Spinner, Button, Modal
} from 'react-bootstrap';
import { FaEye, FaCheckCircle, FaTimesCircle, FaFileAlt } from 'react-icons/fa';
import ClientHeader from "../../component/header/ClientHeader";
import { useParams } from 'react-router-dom';
import { getDocumentsByUserId, updateDocumentStatus } from '../../services/documentService';
import { useAuthStore } from '../../store/authStore';

export default function ViewDocumentPage() {
  const { docType } = useParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [acceptTime, setAcceptTime] = useState("");

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const data = await getDocumentsByUserId(user._id, docType);
        setDocuments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user._id) {
      fetchDocs();
    }
  }, [docType, user._id]);

  const handleOpenModal = (doc) => {
    setSelectedDoc(doc);
    setAcceptTime(new Date().toLocaleString());
    setShowModal(true);
  };

  const handleAccept = async () => {
    if (!selectedDoc) return;
    try {
      await updateDocumentStatus(selectedDoc._id, 'accepted');
      setDocuments(prev =>
        prev.map(doc =>
          doc._id === selectedDoc._id
            ? { ...doc, status: 'accepted', statusUpdatedAt: new Date().toISOString() }
            : doc
        )
      );
      setShowModal(false);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleReject = async (docId) => {
    try {
      await updateDocumentStatus(docId, 'rejected');
      setDocuments(prev =>
        prev.map(doc =>
          doc._id === docId
            ? { ...doc, status: 'rejected', statusUpdatedAt: new Date().toISOString() }
            : doc
        )
      );
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <Badge bg="success">Accepted</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge bg="warning" text="dark">Pending</Badge>;
    }
  };

  return (
    <>
      <ClientHeader />
      <Container fluid className="py-4 px-0">
        <Card className="p-4 shadow-sm border-0" style={{ backgroundColor: "var(--client-component-bg-color)" }}>
          <Row className="align-items-center mb-3">
            <Col md={6} className="text-muted">
              {loading ? 'Loading documents...' : `Total ${documents.length} documents found`}
            </Col>
          </Row>

          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : documents.length === 0 ? (
            <p>No documents found.</p>
          ) : (
            <Table responsive bordered hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>S.No.</th>
                  <th>Doc Type</th>
                  <th>Doc Code</th>
                  <th>Date of Issue</th>
                  <th>Upload Date</th>
                  <th>Document</th>
                  <th>Remark</th>
                  <th>Status</th>
                  <th>Uploaded By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr key={doc._id}>
                    <td>{index + 1}</td>
                    <td>{doc.docType}</td>
                    <td>{doc.documentCode}</td>
                    <td>{new Date(doc.dateOfIssue).toLocaleDateString()}</td>
                    <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                    <td className="text-center">
                      <a
                        href={doc.documentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary text-decoration-none"
                      >
                        <FaFileAlt size={20} />
                      </a>
                    </td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'normal' }}>{doc.remark || '-'}</td>
                    <td>{getStatusBadge(doc.status)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={doc.uploadedBy.profile}
                          alt={doc.uploadedBy.name}
                          className="rounded-circle me-2"
                          style={{ width: "32px", height: "32px", objectFit: "cover" }}
                        />
                        <small className=" text-truncate" style={{ maxWidth: "120px" }}>
                          {doc.uploadedBy.name}
                        </small>
                      </div>
                    </td>
                    <td className="text-center">
                      {doc.status === 'pending' ? (
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => handleOpenModal(doc)}
                          >
                            <FaCheckCircle />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleReject(doc._id)}
                          >
                            <FaTimesCircle />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </Container>

      {/* Confirmation Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <div
          className="p-4"
          style={{
            backgroundColor: "#fdf2e9", // light beige
            borderRadius: "15px",
          }}
        >
          {/* Title */}
          <h4 className="text-center text-primary fw-bold mb-3">
            RS-WMS DigiSigner
          </h4>
          <hr className="my-2" style={{ borderTop: "3px solid black", width: "80%", margin: "0 auto" }} />

          {/* Certificate Heading */}
          <h5 className="text-center fw-bold mt-3">DIGITAL SIGNATURE CERTIFICATE</h5>

          {/* Body Content */}
          <div className="mt-4">
            <p className="fst-italic fw-semibold">
              By signing this document, I confirm:
            </p>
            <p>
              By clicking <strong>Accept & Sign</strong>, you acknowledge that you have carefully reviewed the contents of this document and agree to be bound by the terms, conditions, and responsibilities described herein.
            </p>
            <p>
              This acceptance will serve as a record of your consent and may be referenced in the future for verification or compliance purposes.
            </p>

            <p className="fst-italic fw-semibold mt-3">Some Important Points</p>
            <ol className="mb-4 ps-3">
              <li>I understand the document and sign of my own free will.</li>
              <li>I consent to the use of this electronic signature as legal evidence.</li>
              <li>I sign this document in my senses through the RS-WMS DigiSigner.</li>
              <li>I have entered my full legal name without abbreviations or nicknames.</li>
            </ol>

            {/* Signature Block */}
            <p className="fst-italic fw-semibold">I ACKNOWLEDGE</p>
            <p className="mb-1"><strong>NAME:</strong> {user.name}</p>
            <p className="mb-4"><strong>CID:</strong> RS-CTO</p>
          </div>

          {/* Timestamp */}
          <p className="text-center text-muted fst-italic">
            Timestamps: {acceptTime}
          </p>

          {/* Footer Buttons */}
          <div className="d-flex justify-content-center gap-3 mt-3">
            <Button
              variant="danger"
              className="px-4 fw-bold"
              onClick={() => setShowModal(false)}
            >
              <i className="bi bi-x-circle me-1"></i> CANCEL
            </Button>
            <Button
              variant="primary"
              className="px-4 fw-bold"
              onClick={handleAccept}
            >
              <i className="bi bi-check-circle me-1"></i> ACCEPT & SIGN
            </Button>
          </div>
        </div>
      </Modal>



    </>
  );
}
