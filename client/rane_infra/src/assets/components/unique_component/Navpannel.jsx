import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import "./Navpannel.css";

function Navpannel() {
  return (
    <Navbar collapseOnSelect expand="lg" bg="transparent" className="navbar-custom">
      <Container>
        <Navbar.Brand href="#home">
          <img src="/logo.webp" alt="" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#features">Home</Nav.Link>
            <Nav.Link href="#pricing">Tenders</Nav.Link>
            <Nav.Link href="#pricing">Bill Uploads</Nav.Link>
            <Nav.Link href="#pricing">Documents</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link href="#deets">Login</Nav.Link>
            <Nav.Link eventKey={2} href="#memes">
              Sign-Up
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navpannel;
