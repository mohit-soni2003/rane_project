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
  const [cid, setCid] = useState(decodeURIComponent(encodedCid));
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

      const result = await pushDocument(payload);

      setDocType('');
      setDocumentCode('');
      setDateOfIssue('');
      setRemark('');
      setFile(null);
      alert('Document pushed successfully!');
      console.log('Server response:', result);
    } catch (err) {
      console.error('Push failed:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="container mt-4">
        <Card className="p-4 shadow" style={{
          backgroundColor: 'var(--admin-card-bg)',
          borderColor: 'var(--admin-card-border)',
          boxShadow: '0 0.25rem 1rem var(--admin-card-shadow)',
        }}>
          <h4 className="mb-4 text-primary" style={{ color: 'var(--admin-heading-color)' }}>
            <FaPaperPlane className="me-2" />
            Push Document to Client
          </h4>
          <Form onSubmit={handleSubmit} style={{ color: 'var(--admin-text-color)' }}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaIdCard className="me-2 text-info" /> Client CID *
              </Form.Label>
              <Form.Control
                type="text"
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                required
                style={{
                  backgroundColor: 'var(--admin-input-bg)',
                  borderColor: 'var(--admin-input-border)',
                  color: 'var(--admin-input-text)'
                }}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>
                  <FaListAlt className="me-2 text-info" /> Document Type *
                </Form.Label>
                <Form.Select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  required
                  style={{
                    backgroundColor: 'var(--admin-input-bg)',
                    borderColor: 'var(--admin-input-border)',
                    color: 'var(--admin-input-text)'
                  }}
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

              <Col md={6}>
                <Form.Label>
                  <FaFileCode className="me-2 text-info" /> Document Code *
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter document code (e.g., LOA123)"
                  value={documentCode}
                  onChange={(e) => setDocumentCode(e.target.value)}
                  required
                  style={{
                    backgroundColor: 'var(--admin-input-bg)',
                    borderColor: 'var(--admin-input-border)',
                    color: 'var(--admin-input-text)'
                  }}
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>
                  <FaCalendarAlt className="me-2 text-info" /> Date of Issue *
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dateOfIssue}
                  onChange={(e) => setDateOfIssue(e.target.value)}
                  required
                  style={{
                    backgroundColor: 'var(--admin-input-bg)',
                    borderColor: 'var(--admin-input-border)',
                    color: 'var(--admin-input-text)'
                  }}
                />
              </Col>

              <Col md={6}>
                <Form.Label>
                  <FaStickyNote className="me-2 text-muted" /> Remark (optional)
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Any notes or remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  style={{
                    backgroundColor: 'var(--admin-input-bg)',
                    borderColor: 'var(--admin-input-border)',
                    color: 'var(--admin-input-text)'
                  }}
                />
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>
                <FaFileUpload className="me-2 text-danger" /> Upload Document (PDF/Image) *
              </Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
                style={{
                  backgroundColor: 'var(--admin-input-bg)',
                  borderColor: 'var(--admin-input-border)',
                  color: 'var(--admin-input-text)'
                }}
              />
              {file && (
                <div className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>
                  Selected: {file.name}
                </div>
              )}
            </Form.Group>

            <div className="text-end">
              <Button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: 'var(--admin-btn-primary-bg)',
                  borderColor: 'var(--admin-btn-primary-bg)',
                  color: 'var(--admin-btn-primary-text)'
                }}
              >
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
