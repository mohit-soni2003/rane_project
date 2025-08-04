import React, { useEffect, useState } from 'react';
import {
  Table, Badge, Container, Card, Row, Col, Spinner, Button
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

  const handleStatusChange = async (docId, newStatus) => {
    try {
      await updateDocumentStatus(docId, newStatus);
      setDocuments(prev =>
        prev.map(doc =>
          doc._id === docId ? { ...doc, status: newStatus, statusUpdatedAt: new Date().toISOString() } : doc
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
        <Card className="p-4 shadow-sm" style={{ backgroundColor: "var(--client-component-bg-color)" }}>
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
                    <td className="text-center">
                      {doc.status === 'pending' ? (
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => handleStatusChange(doc._id, 'accepted')}
                          >
                            <FaCheckCircle />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleStatusChange(doc._id, 'rejected')}
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
    </>
  );
}
