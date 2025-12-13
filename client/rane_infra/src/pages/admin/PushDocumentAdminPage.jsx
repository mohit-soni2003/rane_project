import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import { pushDocument } from '../../services/documentService';
import { CLOUDINARY_URL, UPLOAD_PRESET } from '../../store/keyStore';
import AdminHeader from '../../component/header/AdminHeader';
import {
  FaIdCard,
  FaFileUpload,
  FaCalendarAlt,
  FaStickyNote,
  FaListAlt,
  FaFileCode,
  FaPaperPlane
} from 'react-icons/fa';

export default function PushDocumentAdminPage() {
  const { cid: encodedCid } = useParams();
  const [cid, setCid] = useState(decodeURIComponent(encodedCid || ''));
  const [docType, setDocType] = useState('');
  const [documentCode, setDocumentCode] = useState('');
  const [dateOfIssue, setDateOfIssue] = useState('');
  const [remark, setRemark] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Cloudinary upload failed');
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cid || !file || !docType || !documentCode || !dateOfIssue) {
      alert('Please fill all required fields.');
      return;
    }

    setLoading(true);
    try {
      const documentLink = await uploadToCloudinary(file);
      const payload = {
        cid,
        docType,
        documentCode,
        dateOfIssue,
        remark,
        documentLink,
      };

      await pushDocument(payload);

      setDocType('');
      setDocumentCode('');
      setDateOfIssue('');
      setRemark('');
      setFile(null);
      alert('Document pushed successfully!');
    } catch (err) {
      console.error('Push failed:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const iconStyle = { marginRight: '8px', color: '#6c757d' };
  const sectionTitleStyle = { fontWeight: '600', fontSize: '1.1rem', marginBottom: '10px' };

  return (
    <> 
      <AdminHeader />
      <div className="container-fluid w-100 mt-4 ">
        <Card className="p-4 border-0 shadow-sm" style={{backgroundColor:"var(--client-component-bg-color)"}}>
          <div className="d-flex align-items-center mb-4" style={sectionTitleStyle}>
            <FaPaperPlane style={{ marginRight: '10px', color: '#6c757d' }} />
            Push Document to Client
          </div>

          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>
                  <FaIdCard style={iconStyle} />
                  Client CID *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={cid}
                  onChange={(e) => setCid(e.target.value)}
                  placeholder="Enter client ID"
                  required
                />
              </Col>

              <Col md={6}>
                <Form.Label>
                  <FaListAlt style={iconStyle} />
                  Document Type *
                </Form.Label>
                <Form.Select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  required
                >
                  <option value="">Select type</option>
                  <option value="LOA">LOA</option>
                  <option value="SalesOrder">Sales Order</option>
                  <option value="PurchaseOrder">Purchase Order</option>
                  <option value="PayIn">Pay In</option>
                  <option value="PayOut">Pay Out</option>
                  <option value="Estimate">Estimate</option>
                  <option value="DeliveryChallan">Delivery Challan</option>
                  <option value="Expense">Expense</option>
                  <option value="BankReference">Bank Reference</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>
                  <FaFileCode style={iconStyle} />
                  Document Code *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={documentCode}
                  onChange={(e) => setDocumentCode(e.target.value)}
                  placeholder="Enter document code"
                  required
                />
              </Col>

              <Col md={6}>
                <Form.Label>
                  <FaCalendarAlt style={iconStyle} />
                  Date of Issue *
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dateOfIssue}
                  onChange={(e) => setDateOfIssue(e.target.value)}
                  required
                />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                <FaStickyNote style={iconStyle} />
                Remark (optional)
              </Form.Label>
              <Form.Control
                type="text"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Additional notes about this document (optional)"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>
                <FaFileUpload style={iconStyle} />
                Upload Document *
              </Form.Label>

              <div
                className="p-4 text-center rounded position-relative"
                style={{
                  background: '#fef8f6',
                  border: '1px dashed #e4cfc3',
                  color: '#6c4f42',
                }}
              >
                <div className="mb-2">
                  <FaFileUpload size={28} />
                </div>
                <p className="mb-1 fw-medium">Drag & drop files here or click to browse</p>
                <small className="text-muted">PDF, JPG, or PNG up to 10MB</small>

                {/* Hidden Input */}
                <input
                  id="customFileInput"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  required
                  hidden
                />

                {/* Trigger Button */}
                <div className="mt-3">
                  <label htmlFor="customFileInput" style={{ cursor: 'pointer' }}>
                    <div
                      className="px-4 py-2 rounded"
                      style={{
                        backgroundColor: 'var(--client-component-bg-color)',
                        color: 'var(--client-text-color)',
                        fontWeight: 500,
                        display: 'inline-block',
                      }}
                    >
                      <FaFileUpload className="me-2" />
                      Browse Files
                    </div>
                  </label>
                </div>

                {file && (
                  <div className="text-muted mt-2 small">Selected: {file.name}</div>
                )}
              </div>
            </Form.Group>


            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="btn-admin-primary">
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="me-2" />
                    Push Document
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
}
