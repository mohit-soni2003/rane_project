import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { FaRupeeSign, FaUpload, FaUniversity, FaQrcode, FaFileInvoiceDollar, FaCheck, FaTimes } from 'react-icons/fa';
import ClientHeader from '../../component/header/ClientHeader';

export default function PaymentRequestPage() {
    const [paymentType, setPaymentType] = useState('IP');
    const [paymentMode, setPaymentMode] = useState('Bank');
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Submit logic here
        alert('Payment request submitted');
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
                                <Form.Select required>
                                    <option value="tender1">tender1</option>
                                    <option value="tender2">tender2</option>
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
                                    <Col md={6}><strong>Account Holder:</strong> Mohit Soni</Col>
                                    <Col md={6}><strong>Account Number:</strong> XXXX1234</Col>
                                    <Col md={6}><strong>IFSC:</strong> SBIN0001234</Col>
                                    <Col md={6}><strong>Bank:</strong> State Bank of India</Col>
                                </Row>
                            </Card>
                        )}

                        {/* UPI Info */}
                        {paymentMode === 'UPI' && (
                            <Card className="bg-light p-3 mb-4 border border-primary-subtle">
                                <h6 className="text-brown fw-semibold mb-3"><FaQrcode className="me-2" /> UPI Details</h6>
                                <Row>
                                    <Col md={6}><strong>UPI ID:</strong> mohitsoni@upi</Col>
                                    <Col md={6}><strong>Linked Bank:</strong> HDFC Bank</Col>
                                </Row>
                                <div className="mt-3 text-muted" style={{ fontSize: '0.875rem' }}>
                                    Please ensure your UPI ID is correct and linked to the receiving account.
                                </div>
                            </Card>
                        )}

                        {/* Submit/Cancel */}
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="outline-secondary">Cancel</Button>
                            <Button type="submit" variant="primary">
                                <FaFileInvoiceDollar className="me-2" />
                                Submit Payment Request
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
      `}</style>
        </>
    );
}
