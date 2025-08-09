import React from 'react';
import Navpannel from '../assets/components/unique_component/Navpannel';
import { Link } from 'react-router-dom';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { FaFilePdf, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa"; // red PDF icon
import { FaTrain, FaRoad, FaTools, FaBuilding } from "react-icons/fa";
import { GiBridge } from "react-icons/gi";
import Footer from '../assets/components/unique_component/Footer';

const departments = [
    { name: "Rane & Rane's Sons", logo: "/logos/home.jpg" },
    { name: "Rane's Infrastructure", logo: "/logos/infrawebp.jpg" },
    { name: "Rane's Logistic", logo: "/logos/logistics.jpg" },
    { name: "Malwa Agency", logo: "/logos/malwa.jpg" },
    { name: "Rane's Pharmeceuticals", logo: "/logos/pharma.jpg" },
];


export default function LandingPage() {


    const documents = [
        { name: "Rane GST Certificate", file: "/documents/Rane GST Certificate.pdf" },
        { name: "Drugs Sale Licence", file: "/documents/Drugs Sale Licence_.pdf" },
        { name: "Udyam Registration Certificate", file: "/documents/Udyam_Registration_Certificate.pdf" },
        { name: "Business Conditions for Labor Contractors", file: "/documents/Business Conditions for Labor Contractors.pdf" },
        { name: "GUMASTA", file: "/documents/GUMASTA.pdf" },
        { name: "Business Terms and Conditions for Goods Supply", file: "/documents/Business Terms and Conditions for Goods Supply.pdf" },
    ];

    return (
        <>
            <Navpannel />

            <section
                className="d-flex align-items-center text-white position-relative"
                style={{
                    backgroundImage: 'url("/images/hero-bg.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '90vh',
                }}
            >
                {/* Overlay */}
                <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: 1 }}
                ></div>

                <Container style={{ zIndex: 2 }}>
                    ;

                    <Row className="justify-content-start">
                        <Col md={8} lg={6}>
                            <h1
                                className="fw-bold mb-3"
                                style={{
                                    fontSize: '2.8rem',
                                    fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                                    letterSpacing: '4px',
                                    textTransform: 'uppercase',
                                }}
                            >
                                RANE AND RANE'S SONS
                            </h1>

                            <h5
                                className="fw-semibold"
                                style={{
                                    color: 'var(--primary-orange)',
                                    fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                                    letterSpacing: '2px',
                                }}
                            >
                                Indian Railway Contractors
                            </h5>

                            <p className="mt-3 mb-4 text-light" style={{ lineHeight: '1.6', letterSpacing: "2px" }}>
                                Building India’s railway infrastructure with precision, quality, and trust.
                                Your reliable partner for all construction and infrastructure projects.
                            </p>

                            <Link to="/signin">
                                <Button
                                    className="fw-semibold"
                                    style={{
                                        backgroundColor: 'var(--primary-orange)',
                                        border: 'none',
                                        padding: '10px 22px',
                                        borderRadius: '6px',
                                        fontSize: '1rem',
                                        fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                                    }}
                                    onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--primary-orange-hover)')}
                                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--primary-orange)')}
                                >
                                    Get Started
                                </Button>
                            </Link>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section className="py-5 bg-white">
                <Container>
                    <Row className="align-items-center gy-4">
                        <Col md={6}>
                            <h2 className="fw-bold mb-3" style={{ fontSize: "1.8rem", color: "#1e293b" }}>
                                About Our Company
                            </h2>
                            <p className="text-muted" style={{ lineHeight: "1.7", fontSize: "1rem" }}>
                                Rane Infrastructure is a leading construction company specializing in railway and infrastructure
                                projects for state governments. With years of experience and a team of skilled professionals,
                                we provide reliable and high-quality construction services to meet the growing infrastructure
                                needs of our clients.
                                <br />
                                <br />
                                From planning and design to execution and maintenance, we handle every aspect of the construction
                                process with utmost efficiency and attention to detail.
                            </p>
                        </Col>
                        <Col md={6}>
                            <img
                                src="/images/landing-page-about.png"
                                alt="About Our Company"
                                className="img-fluid rounded shadow"
                            />
                        </Col>
                    </Row>
                </Container>
            </section>

            <section className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
                <Container>
                    <Row className="align-items-center gy-4 flex-md-row-reverse">
                        <Col md={6}>
                            <h2 className="fw-bold mb-3" style={{ fontSize: "1.8rem", color: "#1e293b" }}>
                                Our Expertise
                            </h2>
                            <p className="text-muted" style={{ lineHeight: "1.7", fontSize: "1rem" }}>
                                With over 5 years of experience in Railway construction, RANE & RANE'S SONS has become a trusted
                                name in the field of construction. Our team of experts has the knowledge, skills, and expertise
                                to handle any project, big or small.
                                <br />
                                <br />
                                We have completed numerous projects ranging from residential homes to commercial buildings,
                                and our clients can attest to our commitment to quality and excellence.
                            </p>
                        </Col>
                        <Col md={6}>
                            <img
                                src="/images/landing-page-expertise.png"
                                alt="Our Expertise"
                                className="img-fluid rounded shadow"
                            />
                        </Col>
                    </Row>
                </Container>
            </section>

            <section className="py-5 text-center bg-white">
                <div className="container">
                    <img
                        src="/images/rane.webp"
                        alt="Tejprakash Rane"
                        className="rounded-circle shadow mb-4"
                        style={{ width: "120px", height: "120px", objectFit: "cover" }}
                    />
                    <h3 className="fw-bold text-dark mb-1" style={{ fontSize: "1.6rem" }}>
                        Tejprakash Rane
                    </h3>
                    <h5 className="fw-semibold" style={{ color: "var(--primary-orange)" }}>
                        Director
                    </h5>
                    <p className="text-dark fw-medium mb-2 mt-1">RANE AND RANE'S SONS</p>
                    <p className="text-muted mb-1" style={{ fontSize: "0.95rem" }}>
                        Former District Coordinator at National Commission for Scheduled Castes
                    </p>
                    <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
                        Former Executive Council Member at Maharishi Panini Sanskrit Evam Vaidik Vishwavidyalaya, Ujjain
                    </p>

                    <button
                        className="btn fw-semibold text-white"
                        style={{
                            backgroundColor: "var(--primary-orange)",
                            padding: "10px 26px",
                            borderRadius: "8px",
                            border: "none",
                            fontSize: "1rem",
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--primary-orange-hover)")}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--primary-orange)")}
                    >
                        Contact
                    </button>
                </div>
            </section>

            <section style={{ backgroundColor: "#f3f4f6", padding: "60px 0" }}>
                <div className="container text-center">
                    <h2 className="fw-bold mb-5" style={{ color: "#1f2937" }}>
                        Our Departments
                    </h2>

                    <div className="row justify-content-center">
                        {departments.map((dept, idx) => (
                            <div className="col-6 col-sm-4 col-md-2 mb-4" key={idx}>
                                <div
                                    className="bg-white shadow-sm rounded py-4 px-3 text-center h-100"
                                    style={{ minWidth: "120px" }}
                                >
                                    <div className="mb-2">
                                        <img
                                            src={dept.logo}
                                            alt={dept.name}
                                            style={{
                                                width: "48px",
                                                height: "48px",
                                                objectFit: "contain",
                                            }}
                                        />
                                    </div>
                                    <div className="fw-semibold text-dark small">{dept.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* ----------CONTACT - US ----------- */}
            <section className="contactus py-5 bg-white " id="contactus">
                <Container>
                    <Row className="align-items-center">
                        {/* Text Content */}
                        <Col md={6} className="mb-4 mb-md-0">
                            <h2 className="fw-bold text-dark mb-2">Contact Us</h2>
                            <h5 className="fw-semibold" style={{ color: "var(--primary-orange)" }}>
                                Better yet, see us in person!
                            </h5>
                            <p className="text-muted mt-3" style={{ maxWidth: "500px", lineHeight: "1.6" }}>
                                We stay in constant communication with our customers until the job is done.
                                To get a free quote, or if you have questions or special requests, just drop us a line.
                            </p>

                            <ul className="list-unstyled mt-4">
                                <li className="mb-2 d-flex align-items-center gap-2">
                                    <FaWhatsapp color="#25D366" size={18} />
                                    <span>WhatsApp Available</span>
                                </li>
                                <li className="mb-2 d-flex align-items-center gap-2">
                                    <FaEnvelope color="#FF5722" size={18} />
                                    <span>
                                        ranendranesons@gmail.com <br />
                                    </span>
                                </li>
                                <li className="mb-2 d-flex align-items-start gap-2">
                                    <FaMapMarkerAlt color="#EF4444" size={18} />
                                    <span>
                                        101, Ranipura Main Road, Opp. Bhaiyya Ji Pyao, Jagjivan Ram Mohalla,
                                        Indore, MP, India
                                    </span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <FaClock color="#F59E0B" size={18} />
                                    <span>Open today 11:45 am – 05:00 pm</span>
                                </li>
                            </ul>
                        </Col>

                        {/* Map Image */}
                        <Col md={6}>
                            <div>
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3330.4597724889527!2d75.85974637476127!3d22.717911877629835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd0930e52db7%3A0xff9cb785d974d83b!2sRanipura%2C%20Indore%2C%20Madhya%20Pradesh%20452007!5e1!3m2!1sen!2sin!4v1754379943797!5m2!1sen!2sin"
                                    width="100%"
                                    height="300"
                                    style={{ border: 0, borderRadius: "8px" }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Rane and Rane's Location"
                                ></iframe>
                            </div>
                        </Col>

                    </Row>
                </Container>
            </section>

            {/* ------------Documents------------------ */}
            <section
                className="py-5 documents"
                style={{ backgroundColor: "#f3f4f6" }}
                id="documents"
            >
                <div className="container">
                    <h2
                        className="text-center fw-bold mb-1"
                        style={{ color: "#1f2937" }}
                    >
                        Important Documents
                    </h2>

                    <div className="row mt-4">
                        {documents.map((doc, index) => (
                            <div className="col-md-6 col-lg-4 mb-4" key={index}>
                                <div className="shadow-sm rounded bg-white p-3 h-100 d-flex flex-column justify-content-between">
                                    <div className="d-flex align-items-center gap-3 mb-2">
                                        <FaFilePdf size={32} color="red" />
                                        <span className="fw-semibold text-dark">{doc.name}</span>
                                    </div>

                                    {/* Center button on mobile, left-align on md+ */}
                                    <div className="text-center text-md-start mt-3">
                                        <a
                                            href={doc.file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn text-white fw-medium"
                                            style={{
                                                backgroundColor: "var(--primary-orange)",
                                                borderRadius: "6px",
                                                fontSize: "0.9rem",
                                                padding: "8px 14px",
                                                width: "fit-content",
                                            }}
                                            onMouseEnter={(e) =>
                                            (e.target.style.backgroundColor =
                                                "var(--primary-orange-hover)")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.target.style.backgroundColor = "var(--primary-orange)")
                                            }
                                        >
                                            Download PDF
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer></Footer>

        </>
    );
}
