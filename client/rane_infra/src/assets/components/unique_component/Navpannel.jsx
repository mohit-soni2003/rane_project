import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import "./Navpannel.css";
import { Link } from "react-router-dom";

function Navpannel() {
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
            <Nav.Item>
              <Link to="/signin" className="nav-link">Login</Link>
            </Nav.Item>
            <Nav.Item>
              <Link to="/signup" className="nav-link">Signup</Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navpannel;
