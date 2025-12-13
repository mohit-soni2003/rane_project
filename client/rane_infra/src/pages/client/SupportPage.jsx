import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
} from "react-icons/fa";
import ClientHeader from "../../component/header/ClientHeader";

const teamMembers = [
  { name: "TEJPRAKASH RANE", position: "Director", phone: "+919826040680", email: "tejprakashrane26@gmail.com", whatsapp: "+919826040680" },
  { name: "HARSHVARDHAN RANE", position: "Chief Executive Officer (CEO)", phone: "+916264605007", email: "harshrane@icloud.com", whatsapp: "+916264605007" },
  { name: "ASHA RANE", position: "Chief Finance Officer (CFO)", phone: "+918839094569", email: "usharane680@gmail.com", whatsapp: "+918839094569" },
  { name: "RAJESH RANE", position: "Site In-Charge", phone: "+918878521277", email: "rajeshrane751@gmail.com", whatsapp: "+918878521277" },
  { name: "LALIT DEVHUNS", position: "Supervisor", phone: "+916264295446", email: "lalitdevhans@gmail.com", whatsapp: "+916264295446" },
  { name: "MOHIT SONI", position: "Chief Technology Officer (CTO)", phone: "+919589571577", email: "mohitsonip1847@gmail.com", whatsapp: "+919589571577" },
];

export default function SupportPage() {
  // 🔥 Inline Hover Styles Defined INSIDE Component
  const styles = {
    cardBase: {
      background: "var(--card)",
      borderRadius: "14px",
      transition: "all 0.3s ease",
      border: "1px solid transparent",
      cursor: "pointer",
      boxShadow: "0 4px 10px var(--shadow-color)",
      transform: "translateY(0px)",
    },
    cardHover: {
      transform: "translateY(-6px)",
      boxShadow: "0 12px 28px var(--shadow-color)",
      border: "1px solid var(--accent)",
    },
    cardReset: {
      transform: "translateY(0px)",
      border: "1px solid transparent",
      boxShadow: "0 4px 10px var(--shadow-color)",
    },
    btn: {
      background: "var(--primary)",
      borderColor: "var(--primary)",
      color: "var(--primary-foreground)",
      transition: "0.25s",
      borderRadius: "10px",
    },
    btnHover: {
      transform: "scale(1.05)",
      filter: "brightness(1.12)",
    },
  };


  return (
    <>
      <ClientHeader />

      <Container
        fluid
        className="p-4 mx-0 my-3"
        style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}
      >
        {/* Page Title */}
        <h5 className="fw-semibold" style={{ color: "var(--text-strong)" }}>
          <FaPhoneAlt className="me-2" style={{ color: "var(--accent)" }} />
          Support
        </h5>
        <p className="text-muted mb-4">Contact our team for assistance or inquiries</p>

        {/* Company Contact Details */}
        <Card className="p-3 mb-4 shadow-sm border-0" style={{ background: "var(--card)" }}>
          <Row>
            {/* ADDRESS */}
            <Col md={4}>
              <div className="d-flex align-items-start gap-2">
                <FaMapMarkerAlt className="fs-5 mt-1" style={{ color: "var(--accent)" }} />
                <div>
                  <strong style={{ color: "var(--text-strong)" }}>Address</strong>
                  <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
                    101, Ranipura Main Road, opp. Bhaiyya Ji Pyao, Jagjivan Ram Mohalla,
                    Nayi Bagad, Ranipura, Indore, Madhya Pradesh, India
                  </p>
                </div>
              </div>
            </Col>

            {/* PHONE */}
            <Col md={4}>
              <div className="d-flex align-items-start gap-2">
                <FaPhoneAlt className="fs-5 mt-1" style={{ color: "var(--accent)" }} />
                <div>
                  <strong style={{ color: "var(--text-strong)" }}>Phone</strong>
                  <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
                    +91 94250 29680 <br /> Call Now
                  </p>
                </div>
              </div>
            </Col>

            {/* EMAIL */}
            <Col md={4}>
              <div className="d-flex align-items-start gap-2">
                <FaEnvelope className="fs-5 mt-1" style={{ color: "var(--accent)" }} />
                <div>
                  <strong style={{ color: "var(--text-strong)" }}>Email</strong>
                  <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
                    sales@ranendranesons.site
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Team Members */}
        <h6 className="fw-semibold mb-3" style={{ color: "var(--text-strong)" }}>
          Team Members
        </h6>

        <Row className="g-3">
          {teamMembers.map((member, idx) => (
            <Col md={6} lg={4} key={idx}>
              <Card
                className="p-3 shadow-sm h-100 border-0"
                style={styles.cardBase}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.cardReset)}
              >
                <h6 className="fw-bold text-uppercase mb-1" style={{ color: "var(--text-strong)" }}>
                  {member.name}
                </h6>

                <small style={{ color: "var(--text-muted)" }}>{member.position}</small>

                {/* Phone */}
                <div className="mt-2">
                  <FaPhoneAlt className="me-2" style={{ color: "var(--accent)" }} />
                  <span className="small" style={{ color: "var(--text-muted)" }}>
                    {member.phone}
                  </span>
                </div>

                {/* Email */}
                <div className="mt-2">
                  <FaEnvelope className="me-2" style={{ color: "var(--accent)" }} />
                  <span className="small" style={{ color: "var(--text-muted)" }}>
                    {member.email}
                  </span>
                </div>

                {/* WhatsApp Button */}
                <Button
                  size="sm"
                  className="w-100 mt-3"
                  style={styles.btn}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.btnHover)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.btn)}
                  href={`https://wa.me/${member.whatsapp.replace("+", "")}`}
                  target="_blank"
                >
                  <FaWhatsapp className="me-2" /> Chat on WhatsApp
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Business Hours */}
        <Card className="mt-4 border-0 shadow-sm" style={{ background: "var(--card)" }}>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6 className="fw-semibold mb-2" style={{ color: "var(--text-strong)" }}>
                  Weekdays
                </h6>
                <p className="mb-0" style={{ color: "var(--text-muted)" }}>
                  Monday - Friday: 9:00 AM - 6:00 PM
                </p>
              </Col>

              <Col md={6}>
                <h6 className="fw-semibold mb-2" style={{ color: "var(--text-strong)" }}>
                  Weekends
                </h6>
                <p className="mb-0" style={{ color: "var(--text-muted)" }}>
                  Saturday: 10:00 AM - 4:00 PM <br /> Sunday: Closed
                </p>
              </Col>
            </Row>

            {/* NOTE BOX */}
            <div
              className="p-2 mt-3 rounded"
              style={{
                background: "var(--warning)",
                borderLeft: "4px solid var(--accent)",
              }}
            >
              <small style={{ color: "var(--warning-foreground)", fontWeight: 600 }}>
                <strong>Note:</strong> For urgent matters outside business hours,
                please contact: +91 94250 29680
              </small>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
