import React from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import "./Navpannel.css";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { backend_url } from '../../components/store/keyStore';


function Navpannel() {
  const navigate = useNavigate();

  // Access the auth store values
  const { checkAuth, isAuthenticated, user } = useAuthStore();

  // Logout handler
  const handleLogout = async () => {
    try {
      const response = await fetch(`${backend_url}/logout`, {
        method: "POST",
        credentials: "include", // Include cookies in the request
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message); // Optional: Display a success message in the console
        alert("Logged out successfully!"); // Optional: Show an aler
        navigate("/", { replace: true }); 
      } else {
        const errorData = await response.json();
        console.error("Logout failed:", errorData.error);
        alert("Failed to logout. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error.message);
      alert("An error occurred while logging out. Please try again.");
    }
  };

  return (
    <Navbar collapseOnSelect expand="lg" bg="transparent" className="navbar-custom">
      <Container>
        <Navbar.Brand href="#home">
          <img src="/logo.webp" alt="Logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Item>
              <Link to="/" className="nav-link">Home</Link>
            </Nav.Item>
            
            <Nav.Item>
              <Link to="/" className="nav-link">Tenders</Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/upload-bill" className="nav-link">Bill Uploads</Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/documents" className="nav-link">Documents</Link>
            </Nav.Item>
            
          </Nav>
          <Nav>
            {isAuthenticated && user?.isverified ? (
              <>
              <Nav.Item>
                <Link onClick={handleLogout} className="nav-link">
                  Logout
                </Link>
              </Nav.Item>
              <Nav.Item>
                <Link to="/admin-dashboard" className="nav-link">
                  <img src="/rane.webp"  className ="nav-profile-link-img" alt="" />
                </Link>
              </Nav.Item>
              </>

            ) : (
              <>
                <Nav.Item>
                  <Link to="/signin" className="nav-link">Login</Link>
                </Nav.Item>
                <Nav.Item>
                  <Link to="/signup" className="nav-link">Signup</Link>
                </Nav.Item>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navpannel;
