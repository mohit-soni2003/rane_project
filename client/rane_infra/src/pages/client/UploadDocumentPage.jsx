import React, { useState } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { FaFileAlt, FaCloudUploadAlt, FaRegFileAlt, FaBuilding } from 'react-icons/fa';
import { uploadDocument } from '../../services/dfsService';

import ClientHeader from '../../component/header/ClientHeader';
import { CLOUDINARY_URL, UPLOAD_PRESET } from '../../store/keyStore';

export default function UploadDocumentPage() {
    const [fileTitle, setFileTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [documentType, setDocumentType] = useState('');
    const [department, setDepartment] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        try {
            // 1. Uplo0ad file to Cloudinary
            const fileUrl = await uploadDocumentToCloudinary(file);

            // 2. Send metadata to your backend
            const response = await uploadDocument({
                fileTitle,
                fileUrl,
                docType: documentType,
                Department: department,
                description
            });

            alert("Document uploaded successfully!");
            console.log("Response:", response);

            // 3. Reset form
            setFile(null);
            setFileTitle('');
            setDescription('');
            setDocumentType('');
            setDepartment('');
        } catch (err) {
            alert("Upload failed: " + err.message);
        }
    };

    const uploadDocumentToCloudinary = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);

            const res = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Cloudinary upload failed');

            const data = await res.json();
            return data.secure_url; // File URL
        } catch (err) {
            console.error('Cloudinary Upload Error:', err);
            throw err;
        }
    };

    

    return (
        <>
            <ClientHeader />
            <div className="container-fluid w-100 p-0 my-3 ">
                {/* Upload Card */}
                <Card className="p-3 border-0 w-100" style={{ backgroundColor: 'var(--client-component-bg-color)' }}>
                    <h4 className="mb-4 mt-2" style={{ color: 'var(--client-heading-color)' }}>
                        <FaRegFileAlt className="me-2" />
                        Upload Document
                    </h4>

                    <Form onSubmit={handleUpload}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="text-capitalize fw-bold" style={{ color: 'var(--client-text-color)' }}>
                                        Document Type
                                    </Form.Label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white" style={{ borderColor: 'var(--client-border-color)' }}>
                                            <FaFileAlt style={{ color: 'var(--client-text-color)' }} />
                                        </span>
                                        <Form.Select
                                            value={documentType}
                                            onChange={(e) => setDocumentType(e.target.value)}
                                            required
                                            style={{ borderColor: 'var(--client-border-color)' }}
                                        >
                                            <option value="">Select type</option>
                                            <option value="contract">Contract</option>
                                            <option value="report">Report</option>
                                            <option value="invoice">Invoice</option>
                                            <option value="proposal">Proposal</option>
                                        </Form.Select>
                                    </div>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="text-capitalize fw-bold" style={{ color: 'var(--client-text-color)' }}>
                                        Document Title
                                    </Form.Label>
                                    <div className="input-group">
                                        <span
                                            className="input-group-text bg-white"
                                            style={{
                                                borderColor: 'var(--client-border-color)',
                                                color: 'var(--client-text-color)', // icon color
                                            }}
                                        >
                                            <FaRegFileAlt />
                                        </span>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter document title"
                                            value={fileTitle}
                                            onChange={(e) => setFileTitle(e.target.value)}
                                            required
                                            style={{
                                                borderColor: 'var(--client-border-color)',
                                                color: 'var(--client-text-color)',        // text color
                                                // backgroundColor: 'var(--client-bg-color)', // optional if you have bg color defined
                                            }}
                                        />
                                    </div>
                                </Form.Group>

                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="text-capitalize fw-bold" style={{ color: 'var(--client-text-color)' }}>
                                        Department
                                    </Form.Label>
                                    <div className="input-group">
                                        <span
                                            className="input-group-text bg-white"
                                            style={{
                                                borderColor: 'var(--client-border-color)',
                                                color: 'var(--client-text-color)', // icon color
                                            }}
                                        >
                                            <FaBuilding />
                                        </span>
                                        <Form.Select
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            required
                                            style={{
                                                borderColor: 'var(--client-border-color)',
                                                color: 'var(--client-text-color)',
                                                // backgroundColor: 'var(--client-bg-color)', // optional if defined
                                            }}
                                        >
                                            <option value="">Select department</option>
                                            <option value="finance">Finance</option>
                                            <option value="hr">HR</option>
                                            <option value="legal">Legal</option>
                                            <option value="marketing">Marketing</option>
                                            <option value="operations">Operations</option>
                                        </Form.Select>
                                    </div>
                                </Form.Group>

                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold" style={{ color: 'var(--client-text-color)' }}>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter document description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                style={{ borderColor: 'var(--client-border-color)', resize: 'vertical' }}
                            />
                        </Form.Group>

                        {/* Upload Section */}
                        <div
                            className="border border-2 rounded text-center p-4 mb-4"
                            style={{
                                borderColor: 'var(--client-border-color)',
                                backgroundColor: '#fff',
                                borderStyle: 'dashed',
                            }}
                        >
                            <label htmlFor="fileUpload" style={{ cursor: 'pointer', color: 'var(--client-btn-bg)' }}>
                                <div><FaCloudUploadAlt size={32} /></div>
                                <div className="fw-semibold mt-2">Drag & drop files here or click to browse</div>
                                <div className="text-muted small">PDF format up to 10MB</div>
                            </label>
                            <input
                                type="file"
                                id="fileUpload"
                                accept=".pdf"
                                onChange={handleFileChange}
                                required
                                style={{ display: 'none' }}
                            />
                            {file && <div className="mt-2 text-secondary small">Selected File: {file.name}</div>}
                        </div>

                        {/* Buttons */}
                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="outline-secondary"
                                type="reset"
                                onClick={() => {
                                    setFile(null);
                                    setFileTitle('');
                                    setDescription('');
                                    setDocumentType('');
                                    setDepartment('');
                                }}
                            >
                                Clear Form
                            </Button>
                            <Button
                                type="submit"
                                style={{
                                    backgroundColor: 'var(--client-btn-bg)',
                                    borderColor: 'var(--client-btn-bg)',
                                    color: 'var(--client-btn-text)',
                                }}
                                onMouseOver={(e) => (e.target.style.backgroundColor = 'var(--client-btn-hover)')}
                                onMouseOut={(e) => (e.target.style.backgroundColor = 'var(--client-btn-bg)')}
                            >
                                Upload Document
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>

        </>
    );
}
