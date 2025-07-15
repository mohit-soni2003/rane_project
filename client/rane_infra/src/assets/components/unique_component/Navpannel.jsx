import React ,{useEffect}from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import "./Navpannel.css";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { backend_url } from '../../../store/keyStore';
import { HashLink } from 'react-router-hash-link';
// import { useEffect } from "react";



function Navpannel() {
  const navigate = useNavigate();



  // Access the auth store values
  const { checkAuth, isAuthenticated, user, role } = useAuthStore();

  useEffect(() => {
  checkuserLoggedin(); // This should hit your /check-auth backend API
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
    // Not logged in
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      role: null,
    });
  }
};


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
        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
          role: null,
        });
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
const getDashboardPath = (role) => {
  if (role === 'admin') {
    return "/admin-dashboard";
  } else if (role === 'client') {
    return "/user-dashboard";
  } else if (role === 'staff') {
    return "/staff-dashboard";
    // return "/admin-dashboard";
  } else {
    return "/";
  }
};



  return (
    <Navbar collapseOnSelect expand="lg" bg="transparent" className="navbar-custom  ">
      <Container>
        <Navbar.Brand href="/">
          <img src="/logo.webp" style={{ width: "80px" }} alt="Logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Item>
              <Link to="/" className="nav-link">Home</Link>
            </Nav.Item>

            <Nav.Item>
              <Link to="/maintain" className="nav-link">Tenders</Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/upload-bill" className="nav-link">Bill Uploads</Link>
            </Nav.Item>
            <Nav.Item>
              <a href="#documents" className="nav-link">Documents</a>
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
                  <Link to={getDashboardPath(user.role)} className="nav-link">
                    <img src={user.profile} className="nav-profile-link-img" alt="Profile" />
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
