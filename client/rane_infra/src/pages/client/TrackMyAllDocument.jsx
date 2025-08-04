import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  InputGroup,
  FormControl,
  Badge,
  Container,
  Card,
  Row,
  Col,
  Spinner,
  Collapse,
  Alert,
} from 'react-bootstrap';
import { FaSearch, FaFileAlt, FaPlus, FaFileExport } from 'react-icons/fa';
import { getMyUploadedFiles } from '../../services/dfsService';
import ClientHeader from '../../component/header/ClientHeader';

const getStatusBadge = (status) => {
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
};

export default function TrackMyAllDocument() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFileId, setExpandedFileId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const result = await getMyUploadedFiles();
        setFiles(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const toggleCollapse = (fileId) => {
    setExpandedFileId(expandedFileId === fileId ? null : fileId);
  };

  const filteredFiles = files
    .filter(
      (file) =>
        file.fileTitle.toLowerCase().includes(searchText.toLowerCase()) ||
        file.docType?.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === 'asc'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );

  return (
    <>
      <ClientHeader />
      <Container fluid className="py-4 px-0">
        <Card className="p-4 shadow-sm" style={{ backgroundColor: 'var(--client-component-bg-color)' }}>
          <Row className="align-items-center mb-3">
            <Col md={6} className="text-muted">
              Total {filteredFiles.length} documents
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-end gap-2 flex-wrap">
                <InputGroup style={{ maxWidth: '220px' }}>
                  <InputGroup.Text><FaSearch /></InputGroup.Text>
                  <FormControl
                    placeholder="Search title or type..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </InputGroup>

                <FormControl
                  as="select"
                  className="w-auto"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </FormControl>

                <Button variant="primary">
                  Apply
                </Button>
              </div>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : filteredFiles.length === 0 ? (
            <p className="text-muted">No files uploaded yet.</p>
          ) : (
            <Table responsive bordered hover className="mb-3 align-middle">
              <thead className="table-light">
                <tr>
                  <th>S.No.</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Department</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Date</th>
                  <th>File</th>
                  <th>Trail</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file, idx) => (
                  <React.Fragment key={file._id}>
                    <tr>
                      <td>{idx + 1}</td>
                      <td>{file.fileTitle}</td>
                      <td><Badge bg="info">{file.docType}</Badge></td>
                      <td>{file.Department || '—'}</td>
                      <td style={{ maxWidth: '200px' }}>{file.description || '—'}</td>
                      <td>{getStatusBadge(file.status)}</td>
                      <td>{file.currentOwner?.name || '—'}</td>
                      <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                      <td className="text-center">
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                          <FaFileAlt size={18} />
                        </a>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => toggleCollapse(file._id)}
                        >
                          {expandedFileId === file._id ? 'Hide' : 'View'}
                        </Button>
                      </td>
                    </tr>

                    <tr>
                      <td colSpan={10} className="p-0">
                        <Collapse in={expandedFileId === file._id}>
                          <div>
                            <Card className="p-3">
                              <h6 className="fw-bold mb-3">🧾 Communication Trail</h6>
                              {file.forwardingTrail?.length === 0 ? (
                                <p>No trail available.</p>
                              ) : (
                                <Table size="sm" bordered>
                                  <thead>
                                    <tr>
                                      <th>#</th>
                                      <th>From</th>
                                      <th>To</th>
                                      <th>Note</th>
                                      <th>Action</th>
                                      <th>Timestamp</th>
                                      <th>Attachment</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {file.forwardingTrail.map((entry, index) => (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{entry.forwardedBy?.name || '—'}</td>
                                        <td>{entry.forwardedTo?.name || '—'}</td>
                                        <td>{entry.note || '—'}</td>
                                        <td>{entry.action || '—'}</td>
                                        <td>{new Date(entry.timestamp).toLocaleString()}</td>
                                        <td className="text-center">
                                          {entry.attachment ? (
                                            <a
                                              href={entry.attachment}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-decoration-none"
                                            >
                                              <FaFileAlt />
                                            </a>
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
                          </div>
                        </Collapse>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          )}

          {!loading && filteredFiles.length > 0 && (
            <div className="d-flex justify-content-between">
              <div className="text-muted">
                Showing {filteredFiles.length} of {files.length} entries
              </div>
              <div>
                <Button variant="outline-primary" className="me-2">
                  <FaPlus className="me-1" /> Upload New Document
                </Button>
                <Button variant="outline-dark">
                  <FaFileExport className="me-1" /> Export
                </Button>
              </div>
            </div>
          )}
        </Card>
      </Container>
    </>
  );
}
