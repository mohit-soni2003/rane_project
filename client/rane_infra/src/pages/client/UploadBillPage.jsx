import React, { useState, useRef, useEffect } from 'react';
import {
  Form, Button, Container, Row, Col, Card, Spinner, Alert,
} from 'react-bootstrap';
import {
  FaBuilding, FaMapMarkedAlt, FaFileInvoice,
  FaRupeeSign, FaFileUpload, FaFileAlt,
} from 'react-icons/fa';
import { CLOUD_NAME, UPLOAD_PRESET, backend_url } from '../../store/keyStore';
import { useAuthStore } from '../../store/authStore';
import ClientHeader from '../../component/header/ClientHeader';
import { postBill } from '../../services/billServices';

export default function UploadBillPage() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    firmName: '',
    workArea: '',
    loaNo: '',
    invoiceNo: '',
    amount: '',
    workDescription: '',
    pdfurl: '',
    user: ''
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loaOptions, setLoaOptions] = useState([]);
  const [loadingLoa, setLoadingLoa] = useState(false);
  const fileInputRef = useRef();

  // Set user ID in formData
  useEffect(() => {
    if (user?._id) {
      setFormData(prev => ({ ...prev, user: user._id }));
    }
  }, [user]);

  // Fetch LOA list for user
  useEffect(() => {
    if (!user?._id) return;

    const fetchLoas = async () => {
      setLoadingLoa(true);
      try {
        const res = await fetch(`${backend_url}/loa/${user._id}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to fetch LOA documents');
        }
        const data = await res.json();
        setLoaOptions(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, loaNo: data[0].documentCode }));
        }
      } catch (err) {
        setMessage({ type: 'danger', text: err.message });
      } finally {
        setLoadingLoa(false);
      }
    };

    fetchLoas();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return '';
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > 10) throw new Error('File size exceeds 10MB limit');

    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('upload_preset', UPLOAD_PRESET);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

    const res = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: cloudFormData
    });

    if (!res.ok) throw new Error('Failed to upload file to Cloudinary');

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const pdfurl = await handleUpload();
      const payload = { ...formData, pdfurl };
      await postBill(payload);
      setMessage({ type: 'success', text: 'Bill submitted successfully!' });
      handleClear();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Submission failed: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      firmName: '',
      workArea: '',
      loaNo: '',
      invoiceNo: '',
      amount: '',
      workDescription: '',
      pdfurl: '',
      user: user?._id || ''
    });
    setFile(null);
    setMessage({ type: '', text: '' });
  };

  return (
    <>
      <ClientHeader />
      <Container fluid className="my-3 px-0" style={{ backgroundColor: "var(--background)" }}>
        <Card
          className="p-4 shadow-sm w-100"
          style={{
            backgroundColor: "var(--card)",
            color: "var(--card-foreground)",
            borderRadius: "8px",
            boxShadow: "0 2px 6px var(--shadow-color)",
            border:"none"
          }}
        >
          <h5 className="mb-1 fw-semibold" style={{ color: "var(--primary)" }}>
            <FaFileAlt className="me-2" style={{ color: "var(--primary)" }} />
            Upload Your Bill
          </h5>
          <p className="mb-4" style={{ color: "var(--muted-foreground)" }}>
            Complete the form below to submit your bill for processing.
          </p>

          {message.text && <Alert variant={message.type}>{message.text}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Firm Name & Work Area */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ color: "var(--foreground)" }}>
                    <FaBuilding className="me-2" style={{ color: "var(--primary)" }} />
                    Firm Name
                  </Form.Label>
                  <Form.Control
                    name="firmName"
                    value={formData.firmName}
                    onChange={handleChange}
                    placeholder="Enter firm name"
                    required
                    className="custom-input"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ color: "var(--foreground)" }}>
                    <FaMapMarkedAlt className="me-2" style={{ color: "var(--primary)" }} />
                    Work Area
                  </Form.Label>
                  <Form.Control
                    name="workArea"
                    value={formData.workArea}
                    onChange={handleChange}
                    placeholder="Enter work area"
                    required
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* LOA & Invoice No */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ color: "var(--foreground)" }}>
                    <FaFileAlt className="me-2" style={{ color: "var(--primary)" }} />
                    LOA
                  </Form.Label>
                  {loadingLoa ? (
                    <div className="d-flex align-items-center">
                      <Spinner animation="border" size="sm" className="me-2" style={{ color: "var(--primary)" }} /> Loading
                      LOAs...
                    </div>
                  ) : (
                    <Form.Select
                      name="loaNo"
                      value={formData.loaNo}
                      onChange={handleChange}
                      className="custom-input"
                      required
                      style={{
                        backgroundColor: "var(--input)",
                        color: "var(--foreground)",
                        borderColor: "var(--border)",
                      }}
                    >
                      {loaOptions.length > 0 ? (
                        loaOptions.map((loa) => (
                          <option key={loa._id} value={loa.documentCode}>
                            {loa.documentCode}
                          </option>
                        ))
                      ) : (
                        <option value="">No LOA available</option>
                      )}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ color: "var(--foreground)" }}>
                    <FaFileInvoice className="me-2" style={{ color: "var(--primary)" }} />
                    Invoice No.
                  </Form.Label>
                  <Form.Control
                    name="invoiceNo"
                    value={formData.invoiceNo}
                    onChange={handleChange}
                    placeholder="Enter invoice number"
                    required
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Amount */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ color: "var(--foreground)" }}>
                    <FaRupeeSign className="me-2" style={{ color: "var(--primary)" }} />
                    Amount
                  </Form.Label>
                  <Form.Control
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="₹ 0.00"
                    required
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Description */}
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ color: "var(--foreground)" }}>
                    Work Description
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="workDescription"
                    value={formData.workDescription}
                    onChange={handleChange}
                    placeholder="Describe the work details..."
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* File Upload */}
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ color: "var(--foreground)" }}>
                    Upload Bill Document
                  </Form.Label>
                  <div
                    className="border rounded d-flex align-items-center justify-content-center p-4 mb-2"
                    onClick={() => fileInputRef.current.click()}
                    style={{
                      cursor: "pointer",
                      background: "var(--secondary)",
                      borderStyle: "dashed",
                      borderColor: "var(--border)",
                      textAlign: "center",
                      color: "var(--secondary-foreground)",
                    }}
                  >
                    <FaFileUpload className="me-2" style={{ color: "var(--accent)" }} />
                    {file ? file.name : "Click to upload PDF, JPG, or PNG (max 10MB)"}
                  </div>
                  <Form.Control
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    hidden
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Buttons */}
            <div className="d-flex justify-content-end">
              <Button
                variant="outline"
                className="me-2"
                style={{
                  borderColor: "var(--primary)",
                  color: "var(--primary)",
                  backgroundColor: "transparent",
                }}
                onClick={handleClear}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--primary)";
                  e.currentTarget.style.color = "var(--primary-foreground)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--primary)";
                }}
              >
                Clear
              </Button>

              <Button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  border: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--primary-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--primary)")}
                className="px-4"
              >
                {submitting ? <Spinner size="sm" animation="border" /> : "Submit Bill"}
              </Button>
            </div>
          </Form>
        </Card>
      </Container>

      {/* Inline Styles for Inputs */}
      <style jsx="true">{`
      .custom-input {
        border-radius: 8px;
        border-color: var(--border);
        background-color: var(--input);
        color: var(--foreground);
      }
      .custom-input:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 0.15rem rgba(107, 62, 43, 0.25);
      }
    `}</style>
    </>
  );

}
