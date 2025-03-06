import { useState } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { backend_url } from "../store/keyStore";

const ResetPass = () => {
  const { id } = useParams(); // Get the id from the URL
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${backend_url}/reset-password/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password:newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong!");
      }

      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Row className="shadow p-4 rounded-4 bg-white" style={{ maxWidth: "400px" }}>
        <Col>
          <h2 className="text-center text-dark fw-bold">Reset Password</h2>
          <p className="text-center text-secondary">
            Enter your new password below.
          </p>

          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleResetPassword}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="rounded-3"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="rounded-3"
              />
            </Form.Group>

            <Button
              variant="dark"
              type="submit"
              className="w-100 rounded-3 fw-bold"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <Button variant="link" className="text-decoration-none text-dark" onClick={() => navigate("/signin")}>
              Back to Sign In
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPass;
