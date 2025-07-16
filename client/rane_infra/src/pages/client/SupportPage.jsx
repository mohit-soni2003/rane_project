import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import ClientHeader from '../../component/header/ClientHeader';

const teamMembers = [
        { name: "TEJPRAKASH RANE", position: "Director", phone: "+919826040680", email: "tejprakashrane26@gmail.com", whatsapp: "+919826040680" },
        { name: "HARSHVARDHAN RANE", position: "Chief Executive Officer (CEO)", phone: "+916264605007", email: "harshrane@icloud.com", whatsapp: "+916264605007" },
        // { name: "SUNNY DEVHUNS", position: "Coordination", phone: "+916264299401", email: "1986srddevhuns@gmail.com", whatsapp: "+916264299401" },
        { name: "ASHA RANE", position: "Chief Finance Officer (CFO)", phone: "+918839094569", email: "usharane680@gmail.com", whatsapp: "+918839094569" },
        { name: "RAJESH RANE", position: "Site In-Charge", phone: "+918878521277", email: "rajeshrane751@gmail.com", whatsapp: "+918878521277" },
        { name: "LALIT DEVHUNS", position: "Supervisor", phone: "+916264295446", email: "lalitdevhans@gmail.com", whatsapp: "+916264295446" },
        { name: "MOHIT SONI", position: "Chief Technology Officer (CTO)", phone: "+919589571577", email: "mohitsonip1847@gmail.com", whatsapp: "+919589571577" }
    ];

export default function SupportPage() {
  return (
    <>
      <ClientHeader />
      <Container fluid className="p-4 mx-0 my-3" style={{ backgroundColor: 'var(--client-component-bg-color)', minHeight: '100vh' }}>
        <h5 className="fw-semibold text-dark">
          <FaPhoneAlt className="me-2 text-danger" />
          Support
        </h5>
        <p className="text-muted mb-4">Contact our team for assistance or inquiries</p>

        {/* Company Contact Details */}
        <Card className="p-3 mb-4 shadow-sm border-0">
          <Row>
            <Col md={4} className="mb-3 mb-md-0">
              <div className="d-flex align-items-start gap-2">
                <FaMapMarkerAlt className="fs-5 mt-1 text-danger" />
                <div>
                  <strong>Address</strong>
                  <p className="mb-0 small text-muted">
                    101, Ranipura Main Road, opp. Bhaiyya Ji Pyao, Jagjivan Ram Mohalla, Nayi Bagad, Ranipura, Indore, Madhya Pradesh, India
                  </p>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex align-items-start gap-2">
                <FaPhoneAlt className="fs-5 mt-1 text-danger" />
                <div>
                  <strong>Phone</strong>
                  <p className="mb-0 small text-muted">+91 94250 29680<br />Call Now</p>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex align-items-start gap-2">
                <FaEnvelope className="fs-5 mt-1 text-danger" />
                <div>
                  <strong>Email</strong>
                  <p className="mb-0 small text-muted">sales@ranendranesons.site</p>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Team Members */}
        <h6 className="fw-semibold text-dark mb-3">Team Members</h6>
        <Row className="g-3">
          {teamMembers.map((member, idx) => (
            <Col md={6} lg={4} key={idx}>
              <Card className="p-3 shadow-sm h-100 border-0">
                <h6 className="fw-bold text-uppercase mb-1">{member.name}</h6>
                <small className="text-muted d-block mb-2">{member.position}</small>
                <div className="mb-2">
                  <FaPhoneAlt className="me-2 text-danger" />
                  <span className="small">{member.phone}</span>
                </div>
                <div className="mb-3">
                  <FaEnvelope className="me-2 text-danger" />
                  <span className="small">{member.email}</span>
                </div>
                <Button
                  variant="success"
                  size="sm"
                  className="w-100"
                  href={`https://wa.me/${member.whatsapp.replace('+', '')}`}
                  target="_blank"
                >
                  <FaWhatsapp className="me-2" />
                  Chat on WhatsApp
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Business Hours */}
        <Card className="mt-4 border-0 shadow-sm">
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6 className="fw-semibold text-dark mb-2">Weekdays</h6>
                <p className="text-muted mb-0">Monday - Friday: 9:00 AM - 6:00 PM</p>
              </Col>
              <Col md={6}>
                <h6 className="fw-semibold text-dark mb-2">Weekends</h6>
                <p className="text-muted mb-0">Saturday: 10:00 AM - 4:00 PM<br />Sunday: Closed</p>
              </Col>
            </Row>
            <div className="bg-light p-2 mt-3 rounded border-start border-4 border-danger">
              <small className="text-danger">
                <strong>Note:</strong> For urgent matters outside business hours, please contact our emergency support line: +91 94250 29680
              </small>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
