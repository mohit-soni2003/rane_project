import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap';
import { FaRupeeSign, FaUpload, FaUniversity, FaQrcode, FaFileInvoiceDollar, FaCheck } from 'react-icons/fa';
import ClientHeader from '../../component/header/ClientHeader';
import StaffHeader from "../../component/header/StaffHeader";
import { postPaymentRequest } from '../../services/paymentService';
import { CLOUDINARY_URL, UPLOAD_PRESET } from '../../store/keyStore';
import { useAuthStore } from '../../store/authStore';

export default function PaymentRequestPage() {
    const [paymentType, setPaymentType] = useState('IP');
    const [paymentMode, setPaymentMode] = useState('Bank');
    const [file, setFile] = useState(null);
    const [tender, setTender] = useState('RTM-2024-25-69');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { user } = useAuthStore();

    const getHeaderComponent = () => {
        switch (user?.role) {
            case 'client': return <ClientHeader />;
            case 'staff': return <StaffHeader />;
            default: return <ClientHeader />;
        }
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
        try {
            let imageUrl = null;
            if (file) imageUrl = await uploadImageToCloudinary(file);

            const paymentData = {
                tender,
                user: user._id,
                amount: Number(amount),
                description,
                paymentType,
                paymentMode,
                ...(imageUrl && { image_url: imageUrl }),
            };

            await postPaymentRequest(paymentData);
            alert("Payment request submitted successfully!");

            setFile(null);
            setAmount('');
            setDescription('');
            setTender('RTM-2024-25-69');
            setPaymentType('IP');
            setPaymentMode('Bank');
        } catch (error) {
            console.error("Error submitting payment request:", error);
            alert(error.message || "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {getHeaderComponent()}
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
                            Payment Request
                        </h5>
                        <p style={{ color: "var(--text-muted)" }}>Complete the form below to submit your payment request</p>
                    </Col>
                </Row>

                <Card className="p-4 shadow-sm custom-card" style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}>
                    <Form onSubmit={handleSubmit}>
                        {/* Row 1: Payment Type & Tender */}
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Label className="fw-semibold" style={{ color: "var(--primary)" }}>Payment Type</Form.Label>
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
                                </div>
                            </Col>
                            <Col md={6}>
                                <Form.Label className="fw-semibold" style={{ color: "var(--primary)" }}>Select Tender</Form.Label>
                                <Form.Select
                                    required
                                    value={tender}
                                    onChange={(e) => setTender(e.target.value)}
                                    style={{
                                        backgroundColor: "var(--input)",
                                        borderColor: "var(--border)",
                                        color: "var(--foreground)"
                                    }}
                                >
                                    <option value="RTM-2024-25-69">RTM-2024-25-69</option>
                                    <option value="RTM-2024-25-70">RTM-2024-25-70</option>
                                    <option value="RTM-2024-25-71">RTM-2024-25-71</option>
                                    <option value="RTM-2024-25-72">RTM-2024-25-72</option>
                                </Form.Select>
                            </Col>
                        </Row>

                        {/* Amount */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ color: "var(--primary)" }}>
                                <FaRupeeSign className="me-2" style={{ color: "var(--accent)" }} />Amount
                            </Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="₹ 0.00"
                                min="0"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                style={{
                                    backgroundColor: "var(--input)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground)"
                                }}
                            />
                        </Form.Group>

                        {/* Description */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ color: "var(--primary)" }}>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter description..."
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{
                                    backgroundColor: "var(--input)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground)"
                                }}
                            />
                        </Form.Group>

                        {/* File Upload */}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold" style={{ color: "var(--primary)" }}>Upload File</Form.Label>
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

                        {/* Payment Mode */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold" style={{ color: "var(--primary)" }}>Select Payment Request Mode</Form.Label>
                            <div className="d-flex gap-3 flex-wrap">
                                {['UPI', 'Bank', 'Cheque'].map((mode) => (
                                    <div
                                        key={mode}
                                        onClick={() => setPaymentMode(mode)}
                                        className="text-center flex-fill p-3 border rounded"
                                        style={{
                                            cursor: "pointer",
                                            minWidth: "120px",
                                            backgroundColor: paymentMode === mode ? "var(--secondary-hover)" : "var(--card)",
                                            borderColor: paymentMode === mode ? "var(--accent)" : "var(--border)",
                                            color: "var(--foreground)"
                                        }}
                                    >
                                        {mode === 'UPI' && <FaQrcode size={24} className="mb-2" style={{ color: "var(--accent)" }} />}
                                        {mode === 'Bank' && <FaUniversity size={24} className="mb-2" style={{ color: "var(--accent)" }} />}
                                        {mode === 'Cheque' && <FaFileInvoiceDollar size={24} className="mb-2" style={{ color: "var(--accent)" }} />}
                                        <div className="fw-semibold">{mode}</div>
                                    </div>
                                ))}
                            </div>
                        </Form.Group>

                        {/* Bank Info */}
                        {paymentMode === 'Bank' && (
                            <Card className="p-3 mb-4" style={{ backgroundColor: "var(--secondary)", borderColor: "var(--accent)" }}>
                                <h6 className="fw-semibold mb-3" style={{ color: "var(--primary)" }}>
                                    <FaUniversity className="me-2" /> Bank Account Details
                                </h6>
                                <Row>
                                    <Col md={6}><strong>Account Holder:</strong> {user?.name ?? "N/A"}</Col>
                                    <Col md={6}><strong>Account Number:</strong> {user?.accountNo ?? "N/A"}</Col>
                                    <Col md={6}><strong>IFSC:</strong> {user?.ifscCode ?? "N/A"}</Col>
                                    <Col md={6}><strong>Bank:</strong> {user?.bankName ?? "N/A"}</Col>
                                </Row>
                            </Card>
                        )}

                        {/* UPI Info */}
                        {paymentMode === 'UPI' && (
                            <Card className="p-3 mb-4" style={{ backgroundColor: "var(--secondary)", borderColor: "var(--accent)" }}>
                                <h6 className="fw-semibold mb-3" style={{ color: "var(--primary)" }}>
                                    <FaQrcode className="me-2" /> UPI Details
                                </h6>
                                <Row>
                                    <Col md={6}><strong>UPI ID:</strong> {user?.upi ?? "N/A"}</Col>
                                    <Col md={6}><strong>Linked Bank:</strong> {user?.bankName ?? "N/A"}</Col>
                                </Row>
                                <div className="mt-3" style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                                    Please ensure your UPI ID is correct and linked to the receiving account.
                                </div>
                            </Card>
                        )}

                        {/* Submit / Cancel */}
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
                                {submitting ? <Spinner size="sm" animation="border" /> : "Request Payment"}
                            </Button>
                        </div>
                    </Form>
                </Card>
            </Container>
        </>
    );
}
