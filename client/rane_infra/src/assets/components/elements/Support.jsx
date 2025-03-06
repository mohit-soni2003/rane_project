import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { MdAddIcCall, MdEmail } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import './Support.css'; // Import CSS for hover effects

const Support = () => {
    const teamMembers = [
        { name: "TEJPRAKASH RANE", position: "Director", phone: "+919826040680", email: "tejprakashrane26@gmail.com", whatsapp: "+919826040680" },
        { name: "HARSHVARDHAN RANE", position: "Chief Executive Officer (CEO)", phone: "+916264605007", email: "harshrane@icloud.com", whatsapp: "+916264605007" },
        { name: "SUNNY DEVHUNS", position: "Coordination", phone: "+916264299401", email: "1986srddevhuns@gmail.com", whatsapp: "+916264299401" },
        { name: "ASHA RANE", position: "Chief Finance Officer (CFO)", phone: "+918839094569", email: "usharane680@gmail.com", whatsapp: "+918839094569" },
        { name: "RAJESH RANE", position: "Site In-Charge", phone: "+918878521277", email: "rajeshrane751@gmail.com", whatsapp: "+918878521277" },
        { name: "LALIT DEVHUNS", position: "Supervisor", phone: "+916264295446", email: "lalitdevhans@gmail.com", whatsapp: "+916264295446" },
        { name: "MOHIT SONI", position: "Chief Technology Officer (CTO)", phone: "+919589571577", email: "mohitsonip1847@gmail.com", whatsapp: "+919589571577" }
    ];

    return (
        <Container className="py-5 text-black">
            <h1 className="text-center fw-bold mb-4">Contact <span style={{ color: "#0d6efd" }}>RANE AND RANE'S SONS</span></h1>
            <p className="text-center text-muted">
                101, Ranipura Main Road, opp. Bhaiyya Ji Pyao, Jagjivan Ram Mohalla, Nayi Bagad, Ranipura, Indore, Madhya Pradesh, India
            </p>
            <p className="text-center text-muted">📞 +91 94250 29680 | ✉️ sales@ranendranesons.site</p>

            <h2 className="text-center mt-5 mb-4">Meet Our Team</h2>

            <Row className="g-4">
                {teamMembers.map((member, index) => (
                    <Col key={index} md={6} lg={4} className="d-flex justify-content-center">
                        <Card className="support-card text-center p-3 rounded-4">
                            <Card.Body>
                                <Card.Title className="fw-bold">{member.name}</Card.Title>
                                <Card.Subtitle className="text-muted mb-3">{member.position}</Card.Subtitle>

                                <div className="d-flex flex-column gap-2">
                                    <Button variant="outline-primary" href={`tel:${member.phone}`} className="d-flex align-items-center gap-2">
                                        <MdAddIcCall /> {member.phone}
                                    </Button>
                                    <Button variant="outline-dark" href={`mailto:${member.email}`} className="d-flex align-items-center gap-2">
                                        <MdEmail /> {member.email}
                                    </Button>
                                    <Button variant="outline-success" href={`https://wa.me/${member.whatsapp}`} className="d-flex align-items-center gap-2">
                                        <FaWhatsapp /> WhatsApp
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <div className="text-center mt-5">
                <h3 style={{ color: "rgb(4, 33, 105)" }}>Better yet, see us in person!</h3>
                <p className="text-muted">We stay in constant communication with our customers until the job is done. If you have questions or special requests, just drop us a line.</p>
            </div>
        </Container>
    );
};

export default Support;
