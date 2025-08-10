import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { HashLink } from "react-router-hash-link";
import { useAuthStore } from "../../../store/authStore";
import { backend_url } from "../../../store/keyStore";
import LogoutModal from "../../../component/models/LogoutModal"; // ✅ Import modal

function Navpannel() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    checkuserLoggedin();
  }, []);

  const checkuserLoggedin = async () => {
    try {
      const res = await fetch(`${backend_url}/check-auth`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Authentication check failed");

      const data = await res.json();
      useAuthStore.setState({
        user: data.user,
        isAuthenticated: true,
        role: data.user.role,
      });
    } catch (err) {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        role: null,
      });
    }
  };

  const getDashboardPath = (role) => {
    if (role === "admin") return "/admin";
    if (role === "client") return "/client";
    if (role === "staff") return "/staff";
    return "/";
  };

  return (
    <>
      <Navbar expand="lg" bg="white" className="shadow-sm py-2 px-3 border-bottom">
        <Container fluid className="d-flex align-items-center justify-content-between">
          {/* Brand and Logo */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
            <img src="/logo.webp" alt="Logo" style={{ width: "32px" }} />
            <div className="d-flex flex-column lh-sm">
              <span className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>
                RANE & RANE'S SONS
              </span>
              <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                Construction & Infrastructure
              </small>
            </div>
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="responsive-navbar-nav"
            style={{ padding: "0.15rem 0.35rem", fontSize: "0.7rem" }}
          />
          <Navbar.Collapse id="responsive-navbar-nav">
            {/* Navigation Links */}
            <Nav className="mx-auto text-center">
              <Nav.Item>
                <Link to="/" className="nav-link px-3 text-dark fw-bold">Home</Link>
              </Nav.Item>
              <Nav.Item>
                <Link to="/maintain" className="nav-link px-3 text-dark fw-bold">Tenders</Link>
              </Nav.Item>
              <Nav.Item>
                <Link to="/client/upload-bill" className="nav-link px-3 text-dark fw-bold">Bill Uploads</Link>
              </Nav.Item>
              <Nav.Item>
                <HashLink to="#documents" smooth className="nav-link px-3 text-dark fw-bold">Documents</HashLink>
              </Nav.Item>
              <Nav.Item>
                <HashLink to="#contactus" smooth className="nav-link px-3 text-dark fw-bold">Contact-us</HashLink>
              </Nav.Item>
            </Nav>

            {/* Right Side: Auth / Profile */}
            <Nav className="d-flex align-items-center gap-3 gap-md-4 me-md-5">
              {isAuthenticated && user?.isverified ? (
                <>
                  <button
                    onClick={() => setShowLogoutModal(true)} // ✅ Open modal
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Logout
                  </button>
                  <Link to={getDashboardPath(user.role)} className="d-inline-block">
                    <img
                      src={user.profile}
                      alt="Profile"
                      className="rounded-circle"
                      style={{
                        width: "30px",
                        height: "30px",
                        objectFit: "cover",
                      }}
                    />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="btn text-white fw-medium px-3"
                    style={{
                      backgroundColor: "var(--primary-orange)",
                      border: "1px solid var(--primary-orange)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "var(--primary-orange-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "var(--primary-orange)";
                    }}
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/signup"
                    className="btn fw-medium px-3"
                    style={{
                      color: "var(--primary-orange)",
                      border: "1px solid var(--primary-orange)",
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "var(--primary-orange)";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                      e.target.style.color = "var(--primary-orange)";
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* ✅ Logout Confirmation Modal */}
      <LogoutModal show={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
}

export default Navpannel;
