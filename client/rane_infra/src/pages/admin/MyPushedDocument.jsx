import React, { useState, useEffect } from 'react';
import { Table, Container, Row, Col,Button } from 'react-bootstrap';
import { getMyUploadedDocuments } from '../../services/documentService';
import dummyuser from "../../assets/images/dummyUser.jpeg";
import AdminHeader from '../../component/header/AdminHeader';
import { FaRegFileAlt, FaTrash, FaSearch,FaUser } from "react-icons/fa";


const statusMap = {
    accepted: { color: '#34a853', textColor: '#fff' },
    rejected: { color: '#ea4335', textColor: '#fff' },
    pending: { color: '#f4b400', textColor: '#000' }
};

export default function MyPushedDocument() {
    const [documents, setDocuments] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [docTypeFilter, setDocTypeFilter] = useState("");


    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await getMyUploadedDocuments();
                setDocuments(res);
            } catch (error) {
                console.error("Error fetching my uploaded documents:", error);
            }
        };
        fetchDocs();
    }, []);

    const handleDelete = async (docId) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                // Placeholder for delete functionality - implement when backend is ready
                alert('Delete functionality not implemented yet. Document ID: ' + docId);
                // After implementing delete service, call it here and refresh documents
                // await deleteDocument(docId);
                // const res = await getMyUploadedDocuments();
                // setDocuments(res);
            } catch (err) {
                console.error('Failed to delete document:', err);
                alert('Error deleting document: ' + err.message);
            }
        }
    };

    return (
        <>
            <AdminHeader></AdminHeader>
            <Container
                fluid
                style={{ backgroundColor: 'var(--background)', minHeight: '100vh', borderRadius: "15px" }}
                className="py-4 px-4 my-3"
            >
                <Row className="mb-4 align-items-center">

                    {/* Search and Filters */}
                    <Col md="auto" className="d-flex align-items-center gap-2">

                        {/* Search */}
                        <div
                            className="d-flex align-items-center"
                            style={{
                                backgroundColor: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderRadius: '999px',
                                padding: '6px 12px',
                                boxShadow: '0 4px 12px var(--shadow-color)',
                                minWidth: '240px'
                            }}
                        >
                            <FaSearch
                                style={{
                                    color: 'var(--text-muted)',
                                    fontSize: '0.9rem',
                                    marginRight: '8px'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Search by code or name"
                                className="form-control border-0 p-0 shadow-none"
                                style={{
                                    backgroundColor: 'transparent',
                                    fontSize: '0.85rem'
                                }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                backgroundColor: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderRadius: '999px',
                                padding: '6px 14px',
                                fontSize: '0.85rem',
                                boxShadow: '0 4px 12px var(--shadow-color)',
                                minWidth: '150px'
                            }}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        {/* Document Type Filter */}
                        <select
                            className="form-select"
                            value={docTypeFilter}
                            onChange={(e) => setDocTypeFilter(e.target.value)}
                            style={{
                                backgroundColor: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderRadius: '999px',
                                padding: '6px 14px',
                                fontSize: '0.85rem',
                                boxShadow: '0 4px 12px var(--shadow-color)',
                                minWidth: '170px'
                            }}
                        >
                            <option value="">All Doc Types</option>
                            <option value="aadhaar">Aadhaar</option>
                            <option value="pan">PAN</option>
                            <option value="voter">Voter ID</option>
                            <option value="driving">Driving License</option>
                            <option value="passport">Passport</option>
                        </select>

                    </Col>

                </Row>


                <div className="table-responsive">
                    <Table
                        hover
                        responsive
                        className="shadow-sm small"
                        style={{
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '18px',
                            minWidth: '1200px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <thead
                            style={{
                                backgroundColor: 'var(--card)',
                                color: 'var(--text-strong)'
                            }}
                        >
                            <tr className="small text-uppercase">
                                <th>S.No</th>
                                <th>Doc Type</th>
                                <th>Doc Code</th>
                                <th>Uploaded For</th>
                                <th>Date of Issue</th>
                                <th>Upload Date</th>
                                <th>Document</th>
                                <th>Status</th>
                                <th>Status Change</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {documents.length > 0 ? (
                                documents.map((doc, index) => {
                                    const status = doc.status || 'pending';

                                    return (
                                        <tr key={doc._id}>
                                            {/* S.No */}
                                            <td>
                                                <div
                                                    className="rounded-circle d-inline-flex align-items-center justify-content-center"
                                                    style={{
                                                        backgroundColor: 'var(--muted)',
                                                        color: 'var(--text-strong)',
                                                        width: '30px',
                                                        height: '30px',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {index + 1}
                                                </div>
                                            </td>

                                            <td>{doc.docType || '—'}</td>
                                            <td>{doc.documentCode || '—'}</td>

                                            {/* Uploaded For */}
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    {doc.userId?.profile ? (
                                                        <img
                                                            src={doc.userId.profile}
                                                            alt={doc.userId.name}
                                                            style={{
                                                                width: '28px',
                                                                height: '28px',
                                                                borderRadius: '50%',
                                                                objectFit: 'cover',
                                                                border: '1px solid var(--border)'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: '28px',
                                                                height: '28px',
                                                                borderRadius: '50%',
                                                                backgroundColor: 'var(--muted)',
                                                                color: 'var(--text-muted)',
                                                                fontSize: '0.8rem'
                                                            }}
                                                        >
                                                            <FaUser />
                                                        </div>
                                                    )}
                                                    <span>{doc.userId?.name || '—'}</span>
                                                </div>
                                            </td>

                                            <td>
                                                {doc.dateOfIssue
                                                    ? new Date(doc.dateOfIssue).toLocaleDateString()
                                                    : '—'}
                                            </td>

                                            <td>
                                                {doc.uploadDate
                                                    ? new Date(doc.uploadDate).toLocaleDateString()
                                                    : '—'}
                                            </td>

                                            {/* Document Link */}
                                            <td>
                                                {doc.documentLink ? (
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        href={doc.documentLink}
                                                        target="_blank"
                                                        title="View Document"
                                                        style={{
                                                            borderColor: 'var(--border)',
                                                            color: 'var(--secondary-foreground)'
                                                        }}
                                                    >
                                                        <FaRegFileAlt />
                                                    </Button>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td>
                                                <span
                                                    className="badge"
                                                    style={{
                                                        backgroundColor: statusMap[status]?.color,
                                                        color: statusMap[status]?.textColor
                                                    }}
                                                >
                                                    {status}
                                                </span>
                                            </td>

                                            <td>
                                                {doc.statusUpdatedAt
                                                    ? new Date(doc.statusUpdatedAt).toLocaleString()
                                                    : '—'}
                                            </td>

                                            {/* Action */}
                                            <td>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    title="Delete Document"
                                                    onClick={() => handleDelete(doc._id)}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan="10"
                                        className="text-center py-3"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        No documents uploaded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                </div>
            </Container>
        </>
    );
}
