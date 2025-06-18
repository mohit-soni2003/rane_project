import React, { useEffect, useState } from 'react';
import { Table, Button, Collapse, Spinner, Card } from 'react-bootstrap';
import { backend_url } from '../../../store/keyStore';

const AllDFSRequests = () => {
  const [files, setFiles] = useState([]);
  const [expandedFileId, setExpandedFileId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${backend_url}/dfs/files`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      setFiles(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching files:', err);
      setLoading(false);
    }
  };

  const toggleCollapse = (fileId) => {
    setExpandedFileId(expandedFileId === fileId ? null : fileId);
  };

  if (loading) return <Spinner animation="border" variant="primary" className="m-4" />;

  return (
    <div className="p-4">
      <h3>All Files and Communication Trail</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Uploaded By</th>
            <th>Current Owner</th>
            <th>Status</th>
            <th>File</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => (
            <React.Fragment key={file._id}>
              <tr>
                <td>{index + 1}</td>
                <td>{file.fileTitle}</td>
                <td>{file.uploadedBy?.name || 'N/A'}</td>
                <td>{file.currentOwner?.name || 'N/A'}</td>
                <td>{file.status}</td>
                <td><a href={file.fileUrl} target="_blank" rel="noopener noreferrer">View</a></td>
                <td>
                  <Button variant="info" size="sm" onClick={() => toggleCollapse(file._id)}>
                    {expandedFileId === file._id ? 'Hide Trail' : 'View Trail'}
                  </Button>
                </td>
              </tr>
              <tr>
                <td colSpan={7}>
                  <Collapse in={expandedFileId === file._id}>
                    <div>
                      <Card className="p-3 mt-2">
                        <h5>Communication Trail</h5>
                        {file.forwardingTrail.length === 0 ? (
                          <p>No communication trail available.</p>
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
                              </tr>
                            </thead>
                            <tbody>
                              {file.forwardingTrail.map((entry, idx) => (
                                <tr key={idx}>
                                  <td>{idx + 1}</td>
                                  <td>{entry.forwardedBy?.name || 'N/A'}</td>
                                  <td>{entry.forwardedTo?.name || 'N/A'}</td>
                                  <td>{entry.note}</td>
                                  <td>{entry.action}</td>
                                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
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
    </div>
  );
};

export default AllDFSRequests;
