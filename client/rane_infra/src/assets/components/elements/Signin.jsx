import React, { useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { Loader } from "lucide-react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert
} from "react-bootstrap";
import { FiMail, FiLock, FiTool } from "react-icons/fi";
import "animate.css";

const Signin = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const istrue = await login(formData.email, formData.password);
    if (istrue) {
      navigate("/client", { replace: true });
    }
  };

  return (
    <div style={styles.wrapper}>
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center px-0 px-md-3">
        <Row className="w-100 " style={{ maxWidth: "960px" }}>
          <Col md={6} className="d-none d-md-flex align-items-center justify-content-center">
            <div className="text-center animate__animated animate__fadeInLeft">
              <img src="/images/illustration-signin.png" alt="Illustration" style={{ maxWidth: "100%", height: "auto" }} />
              <h5 className="mt-4" style={{ color: "var(--client-heading-color)" }}>
                Smarter Infrastructure. Simplified.
              </h5>
              <p className="text-muted px-4">
                RS-WMS helps teams manage critical infrastructure tasks with ease and security.
              </p>
            </div>
          </Col>

          <Col md={6}>
            <Card className="p-4 shadow-lg animate__animated animate__fadeInUp" style={styles.card}>
              <div className="text-center mb-4">
                <FiTool size={28} className="text-primary mb-2" />
                <h4 className="fw-bold" style={styles.heading}>Welcome Back to <span style={{ color: 'var(--client-btn-bg)' }}>RS-WMS</span></h4>
                <p className="text-muted" style={styles.subheading}>
                  Please sign in to continue managing your infrastructure tasks.
                </p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <div className="d-flex align-items-center border rounded px-2">
                    <FiMail className="me-2 text-muted" />
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="border-0 shadow-none"
                      required
                    />
                  </div>
                </Form.Group>

                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <div className="d-flex align-items-center border rounded px-2">
                    <FiLock className="me-2 text-muted" />
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="border-0 shadow-none"
                      required
                    />
                  </div>
                </Form.Group>

                {error && <Alert variant="danger" className="py-1">{error}</Alert>}

                <Button
                  type="submit"
                  className="w-100 mt-2"
                  style={styles.button}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader size={20} className="spinner-border-sm" /> : "Sign In"}
                </Button>

                <div className="text-end mt-2">
                  <Link to="/reset-password" style={styles.link}>
                    Forgot Password?
                  </Link>
                </div>

                <div className="text-center mt-3 text-muted">
                  Don’t have an account? {" "}
                  <Link to="/create-account" style={styles.link}>Create one</Link>
                </div>

                <div className="text-center mt-4 text-muted small">
                  🔧 Trusted by 100+ infrastructure teams worldwide
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: "var(--client-component-bg-color)",
    minHeight: "100vh",
  },
  card: {
    border: "1px solid var(--client-border-color)",
    borderRadius: "12px",
  },
  heading: {
    color: "var(--client-heading-color)",
  },
  subheading: {
    fontSize: "14px",
    color: "var(--client-muted-color)",
  },
  button: {
    backgroundColor: "var(--client-btn-bg)",
    color: "var(--client-btn-text)",
    border: "none",
  },
  link: {
    color: "var(--client-btn-bg)",
    textDecoration: "none",
    fontWeight: "500",
  },
};

export default Signin;
