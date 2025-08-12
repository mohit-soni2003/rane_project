import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap';
import { FaRupeeSign, FaUpload, FaUniversity, FaQrcode, FaFileInvoiceDollar, FaCheck, FaTimes } from 'react-icons/fa';
import ClientHeader from '../../component/header/ClientHeader';
import { postPaymentRequest } from '../../services/paymentService'; // adjust the path as needed
import { CLOUDINARY_URL_IMAGE } from '../../store/keyStore';
import { CLOUD_NAME } from '../../store/keyStore';
import { CLOUDINARY_URL } from '../../store/keyStore';

import { UPLOAD_PRESET } from '../../store/keyStore'; // ← Replace with actual value from Cloudinary
import { useAuthStore } from '../../store/authStore';


export default function PaymentRequestPage() {
    const [paymentType, setPaymentType] = useState('IP');
    const [paymentMode, setPaymentMode] = useState('Bank');
    const [file, setFile] = useState(null);
    const [tender, setTender] = useState('tender1');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);


    const { user } = useAuthStore();



    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);


        try {
            let imageUrl = null;

            // Only upload if a file is selected
            if (file) {
                imageUrl = await uploadImageToCloudinary(file);
            }

            const paymentData = {
                tender,
                user: user._id,
                amount: Number(amount),
                description,
                paymentType,
                paymentMode,
            };

            // Add image_url only if it exists
            if (imageUrl) {
                paymentData.image_url = imageUrl;
            }

            const response = await postPaymentRequest(paymentData);

            alert("Payment request submitted successfully!");
            console.log("Response:", response);

            // Reset form if needed
            setFile(null);
            setAmount('');
            setDescription('');
            setTender('tender1');
            setPaymentType('IP');
            setPaymentMode('Bank');

        } catch (error) {
            console.error("Error submitting payment request:", error);
            alert(error.message || "Something went wrong.");
        }
        finally {
            setSubmitting(false);
        }
    };


    const uploadImageToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET); // 'rane_infra'

        const response = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Cloudinary upload failed");
        }

        const data = await response.json();
        return data.secure_url;
    };


    return (
        <>
            <ClientHeader />
            <Container fluid className="p-4 my-3 w-100" style={{ backgroundColor: '#fff6f3', minHeight: '100vh' }}>
                <Row className="mb-3">
                    <Col>
                        <h5 className="fw-semibold text-brown">
                            <FaFileInvoiceDollar className="me-2 text-brown" />
                            Payment Request
                        </h5>
                        <p className="text-muted">Complete the form below to submit your payment request</p>
                    </Col>
                </Row>

                <Card className="p-4 shadow-sm" style={{ margin: '0 auto', borderRadius: '10px' }}>
                    <Form onSubmit={handleSubmit}>
                        {/* Row 1: Payment Type & Tender */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Label className="fw-semibold text-brown">Select Payment Type</Form.Label>
                                <div className="d-flex gap-3">
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="IP"
                                        name="paymentType"
                                        id="ip"
                                        checked={paymentType === 'IP'}
                                        onChange={() => setPaymentType('IP')}
                                    />
                                    <Form.Check
                                        inline
                                        type="radio"
                                        label="IPR"
                                        name="paymentType"
                                        id="ipr"
                                        checked={paymentType === 'IPR'}
                                        onChange={() => setPaymentType('IPR')}
                                    />
                                </div>
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-semibold text-brown">Select Tender</Form.Label>
                                <Form.Select required value={tender} onChange={(e) => setTender(e.target.value)}>
                                    <option value="RTM-2024-25-69">RTM-2024-25-69</option>
                                </Form.Select>

                            </Col>
                        </Row>

                        {/* Amount */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold text-brown">
                                <FaRupeeSign className="me-2" />
                                Amount
                            </Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="₹ 0.00"
                                min="0"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />

                        </Form.Group>

                        {/* Description */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold text-brown">Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter description for this payment request..."
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />

                        </Form.Group>

                        {/* File Upload */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold text-brown">Upload File</Form.Label>
                            <div
                                className="border rounded p-4 text-center"
                                style={{ borderStyle: 'dashed', borderColor: '#efc4b7', background: '#fff1ec' }}
                            >
                                <Form.Label htmlFor="file-upload" className="text-brown" style={{ cursor: 'pointer' }}>
                                    <FaUpload className="me-2" />
                                    Drag & drop files here or click to browse
                                </Form.Label>
                                <Form.Control
                                    id="file-upload"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    hidden
                                    onChange={handleFileChange}
                                />
                                <div className="text-muted mt-2">PDF, JPG, or PNG up to 10MB</div>
                                {file && <div className="mt-2 text-success"><FaCheck className="me-1" /> {file.name}</div>}
                            </div>
                        </Form.Group>

                        {/* Payment Mode */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold text-brown">Select Payment Request Mode</Form.Label>
                            <div className="d-flex gap-3 flex-wrap">
                                {['UPI', 'Bank', 'Cheque'].map(mode => (
                                    <div
                                        key={mode}
                                        className={`p-3 border rounded text-center flex-fill ${paymentMode === mode ? 'bg-light border-2 border-primary' : 'bg-white'}`}
                                        onClick={() => setPaymentMode(mode)}
                                        style={{ cursor: 'pointer', minWidth: '120px' }}
                                    >
                                        {mode === 'UPI' && <FaQrcode size={24} className="mb-2" />}
                                        {mode === 'Bank' && <FaUniversity size={24} className="mb-2" />}
                                        {mode === 'Cheque' && <FaFileInvoiceDollar size={24} className="mb-2" />}
                                        <div className="fw-semibold">{mode}</div>
                                    </div>
                                ))}
                            </div>
                        </Form.Group>

                        {/* Bank Info */}
                        {paymentMode === 'Bank' && (
                            <Card className="bg-light p-3 mb-4 border border-danger-subtle">
                                <h6 className="text-brown fw-semibold mb-3"><FaUniversity className="me-2" /> Bank Account Details</h6>
                                <Row>
                                    <Col md={6}>
                                        <strong>Account Holder:</strong> {user?.name ?? "N/A"}
                                    </Col>
                                    <Col md={6}>
                                        <strong>Account Number:</strong> {user?.accountNo ?? "N/A"}
                                    </Col>
                                    <Col md={6}>
                                        <strong>IFSC:</strong> {user?.ifscCode ?? "N/A"}
                                    </Col>
                                    <Col md={6}>
                                        <strong>Bank:</strong> {user?.bankName ?? "N/A"}
                                    </Col>

                                </Row>
                            </Card>
                        )}

                        {/* UPI Info */}
                        {paymentMode === 'UPI' && (
                            <Card className="bg-light p-3 mb-4 border border-primary-subtle">
                                <h6 className="text-brown fw-semibold mb-3"><FaQrcode className="me-2" /> UPI Details</h6>
                                <Row>
                                    <Col md={6}><strong>UPI ID:</strong> {user?.upi?? "N/A"}</Col>
                                    <Col md={6}><strong>Linked Bank:</strong> {user?.bankName?? "N/A"}</Col>
                                </Row>
                                <div className="mt-3 text-muted" style={{ fontSize: '0.875rem' }}>
                                    Please ensure your UPI ID is correct and linked to the receiving account.
                                </div>
                            </Card>
                        )}

                        {/* Submit/Cancel */}
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="outline-secondary">Cancel</Button>
                            <Button type="submit" disabled={submitting} className="btn-brown px-4">
                                {submitting ? <Spinner size="sm" animation="border" /> : 'Submit Bill'}
                            </Button>
                        </div>
                    </Form>
                </Card>
            </Container>

            <style jsx="true">{`
        .text-brown {
          color: #8c4b32;
        }
        .fw-semibold {
          font-weight: 600;
        }
        .text-brown {
          color: #8c4b32;
        }
        .custom-input {
          border-radius: 8px;
          border-color: #f0d5cb;
        }
        .custom-input:focus {
          border-color: #c2704f;
          box-shadow: 0 0 0 0.15rem rgba(194, 112, 79, 0.25);
        }
        .btn-brown {
          background-color: #8c4b32;
          color: white;
          border: none;
        }
        .btn-brown:hover {
          background-color: #6f3e28;
        }
        .btn-outline-brown {
          border: 1px solid #8c4b32;
          color: #8c4b32;
        }
        .btn-outline-brown:hover {
          background-color: #8c4b32;
          color: white;
        }
      `}</style>
        </>
    );
}
