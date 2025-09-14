import React, { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Spinner, Row, Col } from 'react-bootstrap';
import { FaFileAlt, FaEye, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getDocumentsByUserId, updateDocumentStatus } from '../services/documentService';
import { getMyUploadedFiles } from '../services/dfsService';

const PendingDocumentsTable = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState([]);
  const [dfsDocuments, setDfsDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Document categories from DocumentCategory.jsx
  const documentCategories = [
    'LOA', 'SalesOrder', 'PurchaseOrder', 'PayIn', 'PayOut',
    'Estimate', 'DeliveryChallan', 'Expense', 'BankReference', 'Other'
  ];

  useEffect(() => {
    const fetchAllPendingDocuments = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        const allDocuments = [];
        const dfsDocs = [];

        // Fetch documents from all categories
        for (const category of documentCategories) {
          try {
            const categoryDocs = await getDocumentsByUserId(user._id, category);
            const pendingDocs = categoryDocs.filter(doc => doc.status === 'pending');
            allDocuments.push(...pendingDocs.map(doc => ({ ...doc, source: 'documents', category })));
          } catch (err) {
            console.error(`Error fetching ${category} documents:`, err);
          }
        }

        // Fetch DFS documents
        try {
          const dfsResult = await getMyUploadedFiles();
          const dfsArray = Array.isArray(dfsResult) ? dfsResult : [];
          const pendingDfsDocs = dfsArray.filter(doc =>
            doc.status === 'pending' || doc.status === 'in-review'
          );
          dfsDocs.push(...pendingDfsDocs.map(doc => ({ ...doc, source: 'dfs' })));
        } catch (err) {
          console.error('Error fetching DFS documents:', err);
        }

        setDocuments(allDocuments);
        setDfsDocuments(dfsDocs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPendingDocuments();
  }, [user]);

  const handleDocumentClick = (doc) => {
    if (doc.source === 'documents') {
      // Navigate to the specific document category page
      navigate(`/client/document/category/${doc.category}`);
    } else if (doc.source === 'dfs') {
      // Navigate to DFS tracking page
      navigate('/client/track-dfs/all');
    }
  };

  const handleAccept = async (doc) => {
    try {
      if (doc.source === 'documents') {
        await updateDocumentStatus(doc._id, 'accepted');
        setDocuments(prev =>
          prev.filter(d => d._id !== doc._id)
        );
      }
    } catch (err) {
      console.error('Error accepting document:', err);
    }
  };

  const handleReject = async (docId) => {
    try {
      await updateDocumentStatus(docId, 'rejected');
      setDocuments(prev =>
        prev.filter(d => d._id !== docId)
      );
    } catch (err) {
      console.error('Error rejecting document:', err);
    }
  };

  const getStatusBadge = (status, source) => {
    if (source === 'dfs') {
      switch (status) {
        case 'pending':
          return <Badge bg="secondary">Pending</Badge>;
        case 'in-review':
          return <Badge bg="warning" text="dark">In Review</Badge>;
        case 'approved':
          return <Badge bg="success">Approved</Badge>;
        case 'rejected':
          return <Badge bg="danger">Rejected</Badge>;
        default:
          return <Badge bg="info">{status}</Badge>;
      }
    } else {
      switch (status) {
        case 'accepted':
          return <Badge bg="success">Accepted</Badge>;
        case 'rejected':
          return <Badge bg="danger">Rejected</Badge>;
        case 'pending':
        default:
          return <Badge bg="warning" text="dark">Pending</Badge>;
      }
    }
  };

  const allPendingDocuments = [...documents, ...dfsDocuments];
  const totalPending = allPendingDocuments.length;

  if (loading) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
        <Card.Body className="text-center py-4">
          <Spinner animation="border" variant="primary" size="sm" />
          <p className="text-muted mt-2 mb-0">Loading pending documents...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
        <Card.Body className="text-center py-4">
          <p className="text-danger mb-0">Error loading documents: {error}</p>
        </Card.Body>
      </Card>
    );
  }

  if (totalPending === 0) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
        <Card.Header className="border-0 bg-white" style={{ borderRadius: '15px 15px 0 0' }}>
          <h6 className="card-title mb-0 text-dark fw-bold">
            <FaCheckCircle className="me-2 text-success" />
            Pending Documents & DFS
          </h6>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <FaCheckCircle size={48} className="text-success mb-3" />
          <h6 className="text-muted mb-1">All Caught Up!</h6>
          <p className="text-muted mb-0">No pending documents or DFS requests</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
      <Card.Header className="border-0 bg-white" style={{ borderRadius: '15px 15px 0 0' }}>
        <Row className="align-items-center">
          <Col>
            <h6 className="card-title mb-0 text-dark fw-bold">
              <FaClock className="me-2 text-warning" />
              Pending Documents & DFS ({totalPending})
            </h6>
          </Col>
          <Col xs="auto">
            <Badge bg="warning" text="dark" className="fs-6">
              {totalPending} pending
            </Badge>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="border-0 ps-3">Type</th>
                <th className="border-0">Title/Code</th>
                <th className="border-0">Category</th>
                <th className="border-0">Date</th>
                <th className="border-0">Status</th>
                <th className="border-0">Source</th>
                <th className="border-0 text-center pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allPendingDocuments.slice(0, 10).map((doc, index) => (
                <tr
                  key={`${doc.source}-${doc._id}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleDocumentClick(doc)}
                  className="table-row-hover"
                >
                  <td className="ps-3">
                    <FaFileAlt className="text-primary me-2" />
                    {doc.source === 'dfs' ? 'DFS' : 'Document'}
                  </td>
                  <td>
                    {doc.source === 'dfs'
                      ? doc.fileTitle
                      : (doc.documentCode || doc.docType)
                    }
                  </td>
                  <td>
                    {doc.source === 'dfs'
                      ? (doc.docType || 'DFS')
                      : doc.category
                    }
                  </td>
                  <td>
                    {doc.source === 'dfs'
                      ? new Date(doc.createdAt).toLocaleDateString()
                      : new Date(doc.uploadDate || doc.dateOfIssue).toLocaleDateString()
                    }
                  </td>
                  <td>
                    {getStatusBadge(doc.status, doc.source)}
                  </td>
                  <td>
                    <Badge bg={doc.source === 'dfs' ? 'info' : 'primary'}>
                      {doc.source === 'dfs' ? 'DFS' : 'Documents'}
                    </Badge>
                  </td>
                  <td className="text-center pe-3">
                    {doc.source === 'documents' && doc.status === 'pending' ? (
                      <div className="d-flex justify-content-center gap-1">
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(doc);
                          }}
                          title="Accept"
                        >
                          <FaCheckCircle size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(doc._id);
                          }}
                          title="Reject"
                        >
                          <FaTimesCircle size={12} />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentClick(doc);
                        }}
                        title="View Details"
                      >
                        <FaEye size={12} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {allPendingDocuments.length > 10 && (
          <div className="p-3 text-center border-top">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate('/client/document/category')}
            >
              View All Pending Documents ({allPendingDocuments.length})
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PendingDocumentsTable;