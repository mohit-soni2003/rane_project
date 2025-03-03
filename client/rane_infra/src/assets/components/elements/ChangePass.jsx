import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Icons for password visibility
import { Form, Button, Card, Container, Alert, InputGroup } from "react-bootstrap";
import { backend_url } from "../store/keyStore";

const ChangePass = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState("");

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await fetch(`${backend_url}/change-password`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json();
            if (data.success) {
                setMessage("✅ Password changed successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setPasswordStrength("");
            } else {
                setError(data.message || "❌ Failed to change password.");
            }
        } catch (error) {
            setError("❌ Something went wrong. Try again!");
        }
    };

    const handlePasswordChange = (value) => {
        setNewPassword(value);
        if (value.length < 6) {
            setPasswordStrength("Weak ❌");
        } else if (value.length < 10) {
            setPasswordStrength("Medium ⚠️");
        } else {
            setPasswordStrength("Strong ✅");
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center">
            <Card className="shadow-lg p-4 mt-4" style={{  maxWidth: "500px" }}>
                <Card.Body>
                    <h2 className="text-center fw-bold mb-3">🔒 Change Password</h2>

                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleChangePassword}>
                        {/* Current Password Field */}
                        <Form.Group className="mb-3">
                            <Form.Label>Current Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/* New Password Field with Toggle */}
                        <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    required
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </Button>
                            </InputGroup>
                            {newPassword && (
                                <Form.Text className="text-muted">Strength: {passwordStrength}</Form.Text>
                            )}
                        </Form.Group>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-100 fw-bold"
                            variant="warning"
                        >
                            🔄 Change Password
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ChangePass;
