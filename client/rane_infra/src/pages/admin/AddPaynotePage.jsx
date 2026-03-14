import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AdminHeader from '../../component/header/AdminHeader';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Spinner } from 'react-bootstrap';
import { FaFileInvoiceDollar, FaUpload, FaCheck } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { createPayNote } from '../../services/paynoteServices';
import { getBillById } from '../../services/billServices';
import { CLOUDINARY_URL, UPLOAD_PRESET } from '../../store/keyStore';

export default function AddPaynotePage() {
    const [searchParams] = useSearchParams();
    const billId = searchParams.get('billId');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        payNoteNo: 'RS-FOS/PNT-25-26/',
        department: '',
        bankName: '',
        bankAccountNo: '',
        ifscCode: '',
        invoiceNo: '',
        invoiceDate: '',
        purpose: '',
        totalSanctionAmount: '',
        modeOfPayment: '',
        pdfUrl: '',
        user: '', // Will be set from auth or bill
        bill: billId || ''
    });

    const [bill, setBill] = useState(null);
    const [error, setError] = useState('');
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (billId) {
            fetchBill();
        }
    }, [billId]);

    const fetchBill = async () => {
        try {
            const billData = await getBillById(billId);
            setBill(billData);
            setFormData(prev => ({ ...prev, user: billData.user._id }));
        } catch (error) {
            toast.error('Failed to fetch bill details');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const uploadImageToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
        if (!response.ok) throw new Error("Cloudinary upload failed");
        const data = await response.json();
        return data.secure_url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            let pdfUrl = null;
            if (file) pdfUrl = await uploadImageToCloudinary(file);

            await createPayNote({ ...formData, pdfUrl });
            toast.success('Paynote created successfully');
            navigate('/admin/bill');
        } catch (error) {
            setError(error.message || 'Failed to create paynote');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <AdminHeader />
            <Container
                fluid
                className="p-4 my-3 w-100"
                style={{
                    backgroundColor: "var(--background)",
                    minHeight: "100vh",
                    border: "1px solid var(--border)",
                    boxShadow: "0 4px 12px var(--shadow-color)",
                    borderRadius: "12px"
                }}
            >
                <Row className="mb-3">
                    <Col>
                        <h5 className="fw-semibold" style={{ color: "var(--primary)" }}>
                            <FaFileInvoiceDollar className="me-2" style={{ color: "var(--accent)" }} />
                            Add Paynote
                        </h5>
                        <p style={{ color: "var(--text-muted)" }}>Complete the form below to create a paynote</p>
                    </Col>
                </Row>

                <Card className="p-4 shadow-sm custom-card" style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}>
                    {bill && (
                        <Alert variant="info" className="mb-3">
                            Creating paynote for bill: {bill.loaNo} - {bill.firmName}
                        </Alert>
                    )}
                    <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Paynote No *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="payNoteNo"
                                                    value={formData.payNoteNo}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Department *</Form.Label>
                                                <Form.Select
                                                    name="department"
                                                    value={formData.department}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">Select Department</option>
                                                    <option value="Finance">Finance</option>
                                                    <option value="Operations">Operations</option>
                                                    <option value="Executives">Executives</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Bank Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="bankName"
                                                    value={formData.bankName}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Bank Account No</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="bankAccountNo"
                                                    value={formData.bankAccountNo}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>IFSC Code</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="ifscCode"
                                                    value={formData.ifscCode}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Invoice No</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="invoiceNo"
                                                    value={formData.invoiceNo}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Invoice Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="invoiceDate"
                                                    value={formData.invoiceDate}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Total Sanction Amount</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="totalSanctionAmount"
                                                    value={formData.totalSanctionAmount}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Mode of Payment</Form.Label>
                                                <Form.Select
                                                    name="modeOfPayment"
                                                    value={formData.modeOfPayment}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Mode</option>
                                                    <option value="NEFT">NEFT</option>
                                                    <option value="RTGS">RTGS</option>
                                                    <option value="IMPS">IMPS</option>
                                                    <option value="UPI">UPI</option>
                                                    <option value="IBFT">IBFT</option>
                                                    <option value="Cheque">Cheque</option>
                                                    <option value="Cash">Cash</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* File Upload */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold" style={{ color: "var(--primary)" }}>Upload PDF</Form.Label>
                                        <div
                                            className="text-center p-4 rounded"
                                            style={{
                                                borderStyle: "dashed",
                                                borderColor: "var(--accent)",
                                                backgroundColor: "var(--secondary)",
                                                color: "var(--secondary-foreground)"
                                            }}
                                        >
                                            <Form.Label htmlFor="file-upload" style={{ color: "var(--accent)", cursor: "pointer" }}>
                                                <FaUpload className="me-2" /> Drag & drop or click to browse
                                            </Form.Label>
                                            <Form.Control id="file-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={handleFileChange} />
                                            <div className="mt-2" style={{ color: "var(--text-muted)" }}>PDF, JPG, or PNG up to 10MB</div>
                                            {file && (
                                                <div className="mt-2" style={{ color: "var(--success-foreground)" }}>
                                                    <FaCheck className="me-1" /> {file.name}
                                                </div>
                                            )}
                                        </div>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Purpose</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="purpose"
                                            value={formData.purpose}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                    {error && <Alert variant="danger">{error}</Alert>}
                                    <div className="d-flex justify-content-end gap-2">
                                        <Button variant="outline-secondary" style={{
                                            borderColor: "var(--primary)",
                                            color: "var(--primary)",
                                            backgroundColor: "transparent"
                                        }}>Cancel</Button>
                                        <Button type="submit" disabled={submitting} style={{
                                            backgroundColor: "var(--primary)",
                                            color: "var(--primary-foreground)",
                                            border: "none"
                                        }}>
                                            {submitting ? <Spinner size="sm" animation="border" /> : "Create Paynote"}
                                        </Button>
                                    </div>
                                </Form>
                    </Card>
                </Container>
                <ToastContainer />
            </>
        );
    }