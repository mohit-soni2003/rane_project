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
import { FiUser, FiMail, FiLock, FiUserPlus } from "react-icons/fi";
import "animate.css";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
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
    try {
      console.log(formData.email, formData.password, formData.name);
      await signup(formData.email, formData.password, formData.name);
      navigate("/verify-email");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={styles.wrapper}>
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center px-3">
        <Row className="w-100" style={{ maxWidth: "960px" }}>
          <Col md={6} className="d-none d-md-flex align-items-center justify-content-center">
            <div className="text-center animate__animated animate__fadeInLeft">
              <img src="/images/signup-illustration.png" alt="Signup Illustration" style={{ maxWidth: "100%", height: "auto" }} />
              <h5 className="mt-4" style={{ color: "var(--client-heading-color)" }}>
                Join the future of infrastructure.
              </h5>
              <p className="text-muted px-4">
                Create your RS-WMS account and start managing smarter today.
              </p>
            </div>
          </Col>

          <Col md={6}>
            <Card className="p-4 shadow-lg animate__animated animate__fadeInUp" style={styles.card}>
              <div className="text-center mb-4">
                <FiUserPlus size={28} className="text-primary mb-2" />
                <h4 className="fw-bold" style={styles.heading}>Create Your <span style={{ color: 'var(--client-btn-bg)' }}>RS-WMS</span> Account</h4>
                <p className="text-muted" style={styles.subheading}>
                  Join to access your dashboard, history, and team tools.
                </p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formName" className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <div className="d-flex align-items-center border rounded px-2">
                    <FiUser className="me-2 text-muted" />
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="border-0 shadow-none"
                      required
                    />
                  </div>
                </Form.Group>

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
                      placeholder="Create a password"
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
                  {isLoading ? <Loader size={20} className="spinner-border-sm" /> : "Sign Up"}
                </Button>

                <div className="text-center mt-3 text-muted">
                  Already have an account? {" "}
                  <Link to="/signin" style={styles.link}>Sign In</Link>
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

export default Signup;