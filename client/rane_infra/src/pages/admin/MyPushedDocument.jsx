import React, { useState, useEffect } from 'react';
import { Table, Container, Row, Col } from 'react-bootstrap';
import { getMyUploadedDocuments } from '../../services/documentService';
import dummyuser from "../../assets/images/dummyUser.jpeg";
import AdminHeader from '../../component/header/AdminHeader';
import { FaRegFileAlt, FaTrash } from "react-icons/fa";


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
                style={{ backgroundColor: 'var(--admin-dashboard-bg-color)', minHeight: '100vh' }}
                className="py-4 px-4 my-2"
            >
                <Row className="mb-4 align-items-center">

                    {/* Search and Filters */}
                    <Col md="auto" className="d-flex gap-2">
                        {/* Search input */}
                        <input
                            type="text"
                            placeholder="🔍 Search by code or name"
                            className="form-control"
                            style={{ minWidth: "220px" }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        {/* Filter by Status */}
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        {/* Filter by Doc Type */}
                        <select
                            className="form-select"
                            value={docTypeFilter}
                            onChange={(e) => setDocTypeFilter(e.target.value)}
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
                        responsive
                        hover
                        className="shadow-sm"
                        style={{
                            backgroundColor: 'var(--admin-component-bg-color)',
                            border: '1px solid var(--admin-border-color)'
                        }}
                    >
                        <thead style={{ backgroundColor: '#e7edf3' }}>
                            <tr className="text-muted small text-uppercase">
                                <th>S.No</th>
                                <th>Doc Type</th>
                                <th>Doc Code</th>
                                <th>Uploaded For</th>
                                <th>Date of Issue</th>
                                <th>Upload Date</th>
                                <th>Document Link</th>
                                <th>Status</th>
                                <th>Status Change Date</th>
                                <th>Remark</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc, index) => {
                                const status = doc.status || 'pending';
                                const bgColor = index % 2 === 0
                                    ? 'var(--admin-dashboard-bg-color)'
                                    : 'var(--admin-component-bg-color)';

                                return (
                                    <tr key={doc._id} style={{ backgroundColor: bgColor }}>
                                        <td>
                                            <div
                                                className="rounded-circle d-inline-flex align-items-center justify-content-center"
                                                style={{
                                                    backgroundColor: '#fcebea',
                                                    width: '30px',
                                                    height: '30px',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td>{doc.docType || '—'}</td>
                                        <td>{doc.documentCode || '—'}</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <img
                                                    src={doc.userId?.profile || dummyuser}
                                                    alt="profile"
                                                    style={{
                                                        width: "28px",
                                                        height: "28px",
                                                        borderRadius: "50%",
                                                        objectFit: "cover"
                                                    }}
                                                />
                                                <span>{doc.userId?.name || "—"}</span>
                                            </div>
                                        </td>


                                        <td>{doc.dateOfIssue ? new Date(doc.dateOfIssue).toLocaleDateString() : '—'}</td>
                                        <td>{doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : '—'}</td>
                                        <td>
                                            {doc.documentLink ? (
                                                <a
                                                    href={doc.documentLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center"
                                                    title="View Document"
                                                    style={{textDecoration:"none"}}
                                                >
                                                    <FaRegFileAlt className="" size={22} />
                                                </a>
                                            ) : (
                                                '—'
                                            )}
                                        </td>


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
                                        <td>{doc.statusUpdatedAt ? new Date(doc.statusUpdatedAt).toLocaleString() : '—'}</td>
                                        <td title={doc.remark || 'No remark'}>
                                            {doc.remark}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(doc._id)}
                                                title="Delete Document"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {documents.length === 0 && (
                                <tr>
                                    <td className="text-center py-3" colSpan="11">
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
