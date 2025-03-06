import { useState } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { backend_url } from "../store/keyStore";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`${backend_url}/forgot-password` , {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong!");
      }

      setMessage("Password reset link sent to your email.");
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
          <h2 className="text-center text-dark fw-bold">Forgot Password</h2>
          <p className="text-center text-secondary">
            Enter your email address below and we'll send you a link to reset your password.
          </p>

          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleReset}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "Sending..." : "Reset Password"}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <Link to="/signin" className="text-decoration-none text-dark">
              Back to Sign In
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
