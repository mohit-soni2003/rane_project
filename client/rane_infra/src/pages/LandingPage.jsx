import React, { useEffect, useRef, useState } from 'react';
import Navpannel from '../assets/components/unique_component/Navpannel';
import { Link } from 'react-router-dom';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { FaFilePdf, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import Footer from '../assets/components/unique_component/Footer';

/* ─────────────────────────────────────────────
   Global animation styles injected once
───────────────────────────────────────────── */
const GLOBAL_STYLES = `
  /* Scroll-reveal base */
  .reveal {
    opacity: 0;
    transform: translateY(32px);
    transition: opacity 0.65s cubic-bezier(.22,.68,0,1.2),
                transform 0.65s cubic-bezier(.22,.68,0,1.2);
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .reveal-left {
    opacity: 0;
    transform: translateX(-40px);
    transition: opacity 0.65s ease, transform 0.65s ease;
  }
  .reveal-left.visible {
    opacity: 1;
    transform: translateX(0);
  }
  .reveal-right {
    opacity: 0;
    transform: translateX(40px);
    transition: opacity 0.65s ease, transform 0.65s ease;
  }
  .reveal-right.visible {
    opacity: 1;
    transform: translateX(0);
  }

  /* Stagger children */
  .stagger > * { transition-delay: calc(var(--i, 0) * 100ms); }

  /* Typewriter cursor */
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .cursor {
    display: inline-block;
    width: 3px;
    background: var(--primary-orange);
    margin-left: 4px;
    vertical-align: text-bottom;
    animation: blink 0.9s step-end infinite;
  }

  /* Railway track divider */
  @keyframes trainMove {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -80; }
  }
  .rail-sleeper {
    animation: trainMove 1.8s linear infinite;
  }

  /* Stat counter pulse */
  @keyframes countPop {
    0%   { transform: scale(1);   }
    50%  { transform: scale(1.08);}
    100% { transform: scale(1);   }
  }
  .stat-pop { animation: countPop 0.4s ease; }

  /* Card lift */
  .dept-card {
    transition: transform 0.28s cubic-bezier(.22,.68,0,1.3),
                box-shadow 0.28s ease !important;
  }
  .dept-card:hover {
    transform: translateY(-8px) scale(1.05) !important;
    box-shadow: 0 12px 30px rgba(0,0,0,0.14) !important;
  }

  /* Doc card */
  .doc-card {
    transition: transform 0.28s ease, box-shadow 0.28s ease, background 0.2s ease;
  }
  .doc-card:hover {
    transform: translateY(-6px) !important;
    box-shadow: 0 10px 28px rgba(0,0,0,0.13) !important;
    background: var(--client-component-bg-color) !important;
  }

  /* Hero button pulse on load */
  @keyframes heroBtnPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(255,120,0,0.45); }
    60%      { box-shadow: 0 0 0 12px rgba(255,120,0,0); }
  }
  .hero-btn {
    animation: heroBtnPulse 2.2s ease infinite;
  }

  /* Contact list item slide */
  .contact-item {
    transition: transform 0.25s ease;
  }
  .contact-item:hover {
    transform: translateX(7px);
  }

  /* Director card */
  .director-photo {
    transition: transform 0.35s cubic-bezier(.22,.68,0,1.4),
                box-shadow 0.35s ease;
  }
  .director-photo:hover {
    transform: scale(1.12);
    box-shadow: 0 8px 24px rgba(255,100,0,0.25) !important;
  }

  /* Smooth scroll */
  html { scroll-behavior: smooth; }
`;

const departments = [
  { name: "Rane & Rane's Sons",      logo: "/logos/home.jpg" },
  { name: "Rane's Infrastructure",   logo: "/logos/infrawebp.jpg" },
  { name: "Rane's Logistic",         logo: "/logos/logistics.jpg" },
  { name: "Malwa Agency",            logo: "/logos/malwa.jpg" },
  { name: "Rane's Pharmeceuticals",  logo: "/logos/pharma.jpg" },
];

const stats = [
  { value: 5,   suffix: "+", label: "Years of Experience" },
  { value: 120, suffix: "+", label: "Projects Completed" },
  { value: 4,   suffix: "",  label: "States Covered" },
  { value: 98,  suffix: "%", label: "Client Satisfaction" },
];

/* ─── Typewriter hook ─── */
function useTypewriter(words, speed = 80, pause = 1600) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const delay = deleting ? speed / 2 : speed;

    const timer = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, charIdx + 1));
        if (charIdx + 1 === current.length) {
          setTimeout(() => setDeleting(true), pause);
        } else {
          setCharIdx(c => c + 1);
        }
      } else {
        setDisplay(current.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) {
          setDeleting(false);
          setWordIdx(i => (i + 1) % words.length);
          setCharIdx(0);
        } else {
          setCharIdx(c => c - 1);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return display;
}

/* ─── Animated stat counter ─── */
function StatCounter({ target, suffix, label, active }) {
  const [count, setCount] = useState(0);
  const [popping, setPopping] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;
    const duration = 1400;
    const steps = 50;
    const step = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(Math.round(current));
      if (current >= target) {
        clearInterval(timer);
        setPopping(true);
        setTimeout(() => setPopping(false), 400);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [active, target]);

  return (
    <div
      ref={ref}
      className="text-center py-4 px-3"
      style={{
        background: "rgba(255,255,255,0.06)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className={popping ? "stat-pop" : ""}
        style={{ fontSize: "2.6rem", fontWeight: 700, color: "var(--primary-orange)", lineHeight: 1 }}
      >
        {count}{suffix}
      </div>
      <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.88rem", marginTop: "6px", letterSpacing: "0.5px" }}>
        {label}
      </div>
    </div>
  );
}

/* ─── Railway track SVG divider ─── */
function TrackDivider({ color = "#e2790020" }) {
  return (
    <div style={{ width: "100%", overflow: "hidden", lineHeight: 0 }}>
      <svg viewBox="0 0 800 30" width="100%" height="30" preserveAspectRatio="none" aria-hidden="true">
        {/* Rails */}
        <line x1="0" y1="8"  x2="800" y2="8"  stroke={color} strokeWidth="2.5" />
        <line x1="0" y1="22" x2="800" y2="22" stroke={color} strokeWidth="2.5" />
        {/* Animated sleepers */}
        <g className="rail-sleeper" strokeDasharray="40 40" strokeWidth="4">
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={i}
              x1={i * 80 + 10} y1="4"
              x2={i * 80 + 10} y2="26"
              stroke={color}
              strokeWidth="5"
              strokeLinecap="round"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ─── Scroll-reveal hook ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

export default function LandingPage() {
  /* Inject global styles once */
  useEffect(() => {
    const el = document.createElement("style");
    el.innerHTML = GLOBAL_STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const typeText = useTypewriter([
    "Railway Contractors",
    "Infrastructure Builders",
    "Trusted since 2019",
    "Building India's Future",
  ]);

  /* Section refs */
  const [aboutRef, aboutVis]   = useReveal();
  const [expertRef, expertVis] = useReveal();
  const [dirRef, dirVis]       = useReveal();
  const [deptRef, deptVis]     = useReveal();
  const [statRef, statVis]     = useReveal(0.3);
  const [contactRef, contactVis] = useReveal();
  const [docRef, docVis]       = useReveal();

  /* Contact form state */
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState("");

  const handleFormChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };
  const handleReset = () => {
    setForm({ name: "", email: "", phone: "", subject: "", description: "" });
    setSubmitted(false);
  };

  const documents = [
    { name: "Rane GST Certificate",                           file: "/documents/Rane GST Certificate.pdf" },
    { name: "Drugs Sale Licence",                             file: "/documents/Drugs Sale Licence_.pdf" },
    { name: "Udyam Registration Certificate",                 file: "/documents/Udyam_Registration_Certificate.pdf" },
    { name: "Business Conditions for Labor Contractors",      file: "/documents/Business Conditions for Labor Contractors.pdf" },
    { name: "GUMASTA",                                        file: "/documents/GUMASTA.pdf" },
    { name: "Business Terms and Conditions for Goods Supply", file: "/documents/Business Terms and Conditions for Goods Supply.pdf" },
  ];

  /* Shared form styles */
  const inputStyle = (isFocused) => ({
    width: "100%",
    padding: "10px 14px",
    fontSize: "0.9rem",
    color: "#1e293b",
    background: isFocused ? "#fff" : "#f8fafc",
    border: `1.5px solid ${isFocused ? "var(--primary-orange)" : "#e2e8f0"}`,
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s ease, background 0.2s ease",
    display: "block",
  });
  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#475569",
    letterSpacing: "0.3px",
  };

  return (
    <>
      <Navpannel />

      {/* ════════ HERO ════════ */}
      <section
        className="d-flex align-items-center text-white position-relative"
        style={{ minHeight: "92vh", overflow: "hidden" }}
      >
        {/* ── Video background with image fallback ── */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/train1.jpg"
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ objectFit: "cover", objectPosition: "center", zIndex: 0 }}
        >
          <source src="/videos/train_hero.webm" type="video/webm" />
          {/* If browser can't play video, poster image shows automatically */}
        </video>

        {/* Overlay — gradient for text readability */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: "linear-gradient(120deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 100%)",
            zIndex: 1,
          }}
        />

        <Container style={{ zIndex: 2 }}>
          <Row className="justify-content-start">
            <Col md={8} lg={6}>
              {/* Eyebrow tag */}
              <span
                style={{
                  display: "inline-block",
                  background: "var(--primary-orange)",
                  color: "#fff",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  padding: "4px 14px",
                  borderRadius: "4px",
                  marginBottom: "18px",
                }}
              >
                Indian Railway Contractors
              </span>

              <h1
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.2rem)",
                  fontWeight: 800,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  lineHeight: 1.1,
                  marginBottom: "16px",
                }}
              >
                RANE AND<br />RANE'S SONS
              </h1>

              {/* Typewriter line */}
              <h5
                style={{
                  color: "#fff",
                  fontWeight: 400,
                  fontSize: "1.15rem",
                  letterSpacing: "1.5px",
                  minHeight: "1.8em",
                  marginBottom: "20px",
                }}
              >
                <span style={{ color: "var(--primary-orange)", fontWeight: 600 }}>{typeText}</span>
                <span className="cursor" style={{ height: "1.1em" }} />
              </h5>

              <p className="text-light mb-4" style={{ lineHeight: "1.7", letterSpacing: "0.5px", maxWidth: "480px", opacity: 0.88 }}>
                Building India's railway infrastructure with precision, quality, and trust.
                Your reliable partner for all construction and infrastructure projects.
              </p>

              <div className="d-flex gap-3 flex-wrap">
                <Link to="/signin">
                  <Button
                    className="hero-btn fw-semibold"
                    style={{
                      background: "var(--primary-orange)",
                      border: "none",
                      padding: "12px 28px",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      letterSpacing: "0.5px",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-orange-hover)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--primary-orange)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    Get Started
                  </Button>
                </Link>
                <a href="#contactus" style={{ textDecoration: "none" }}>
                  <Button
                    variant="outline-light"
                    style={{ padding: "12px 28px", borderRadius: "8px", fontSize: "1rem", letterSpacing: "0.5px" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    Contact Us
                  </Button>
                </a>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Scroll indicator */}
        <div
          className="position-absolute bottom-0 start-50 translate-middle-x mb-3"
          style={{ zIndex: 2, opacity: 0.6 }}
        >
          <div style={{ width: "1.5px", height: "48px", background: "white", margin: "0 auto 4px" }} />
          <div style={{ fontSize: "0.65rem", letterSpacing: "2px", color: "#fff", textAlign: "center" }}>SCROLL</div>
        </div>
      </section>

      {/* ════════ STATS BANNER ════════ */}
      <section
        ref={statRef}
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: "56px 0" }}
      >
        <Container>
          <div
            className={`reveal${statVis ? " visible" : ""}`}
            style={{ textAlign: "center", marginBottom: "36px" }}
          >
            <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "1px" }}>
              Our Track Record
            </h3>
            <div style={{ width: "48px", height: "3px", background: "var(--primary-orange)", margin: "10px auto 0", borderRadius: "2px" }} />
          </div>
          <Row className="g-3">
            {stats.map((s, i) => (
              <Col xs={6} md={3} key={i}>
                <div className={`reveal${statVis ? " visible" : ""}`} style={{ transitionDelay: `${i * 120}ms` }}>
                  <StatCounter target={s.value} suffix={s.suffix} label={s.label} active={statVis} />
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <TrackDivider color="#e2790030" />

      {/* ════════ ABOUT ════════ */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="align-items-center gy-4">
            <Col md={6} ref={aboutRef}>
              <div className={`reveal-left${aboutVis ? " visible" : ""}`}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--primary-orange)" }}>
                  Who We Are
                </span>
                <h2 className="fw-bold mt-2 mb-3" style={{ fontSize: "1.9rem", color: "#1e293b" }}>
                  About Our Company
                </h2>
                <div style={{ width: "40px", height: "3px", background: "var(--primary-orange)", marginBottom: "18px", borderRadius: "2px" }} />
                <p className="text-muted" style={{ lineHeight: "1.8", fontSize: "0.98rem" }}>
                  Rane Infrastructure is a leading construction company specialising in railway and infrastructure
                  projects for state governments. With years of experience and a team of skilled professionals,
                  we provide reliable and high-quality construction services to meet the growing infrastructure
                  needs of our clients.
                </p>
                <p className="text-muted" style={{ lineHeight: "1.8", fontSize: "0.98rem" }}>
                  From planning and design to execution and maintenance, we handle every aspect of the construction
                  process with utmost efficiency and attention to detail.
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div className={`reveal-right${aboutVis ? " visible" : ""}`}>
                <div style={{ position: "relative" }}>
                  <img
                    src="/images/trainphoto.jpg"
                    alt="About Our Company"
                    className="img-fluid rounded shadow"
                    style={{ transition: "transform 0.4s ease", display: "block" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  />
                  {/* Accent block */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-12px",
                      right: "-12px",
                      width: "80px",
                      height: "80px",
                      background: "var(--primary-orange)",
                      borderRadius: "8px",
                      zIndex: -1,
                      opacity: 0.6,
                    }}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <TrackDivider color="#e2790020" />

      {/* ════════ EXPERTISE ════════ */}
      <section className="py-5" style={{ backgroundColor: "var(--staff-dashboard-bg)" }}>
        <Container>
          <Row className="align-items-center gy-4 flex-md-row-reverse">
            <Col md={6} ref={expertRef}>
              <div className={`reveal-right${expertVis ? " visible" : ""}`}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--primary-orange)" }}>
                  What We Do
                </span>
                <h2 className="fw-bold mt-2 mb-3" style={{ fontSize: "1.9rem", color: "#1e293b" }}>
                  Our Expertise
                </h2>
                <div style={{ width: "40px", height: "3px", background: "var(--primary-orange)", marginBottom: "18px", borderRadius: "2px" }} />
                <p className="text-muted" style={{ lineHeight: "1.8", fontSize: "0.98rem" }}>
                  With over 5 years of experience in Railway construction, RANE &amp; RANE'S SONS has become a trusted
                  name in the field of construction. Our team of experts has the knowledge, skills, and expertise
                  to handle any project, big or small.
                </p>
                <p className="text-muted" style={{ lineHeight: "1.8", fontSize: "0.98rem" }}>
                  We have completed numerous projects ranging from track laying to station infrastructure,
                  and our clients can attest to our commitment to quality and excellence.
                </p>
              </div>
            </Col>
            <Col md={6}>
              <div className={`reveal-left${expertVis ? " visible" : ""}`}>
                <div style={{ position: "relative" }}>
                  <img
                    src="/images/trainphoto2.jpg"
                    alt="Our Expertise"
                    className="img-fluid rounded shadow"
                    style={{ transition: "transform 0.4s ease", display: "block" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-12px",
                      left: "-12px",
                      width: "80px",
                      height: "80px",
                      background: "var(--primary-orange)",
                      borderRadius: "8px",
                      zIndex: -1,
                      opacity: 0.5,
                    }}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <TrackDivider color="#e2790020" />

      {/* ════════ DIRECTOR ════════ */}
      <section className="py-5 text-center bg-white" ref={dirRef}>
        <div className={`container reveal${dirVis ? " visible" : ""}`}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--primary-orange)" }}>
            Leadership
          </span>
          <h2 className="fw-bold mt-2 mb-4" style={{ fontSize: "1.7rem", color: "#1e293b" }}>Meet the Director</h2>

          <div
            style={{
              display: "inline-block",
              background: "#fff",
              borderRadius: "16px",
              padding: "40px 48px",
              boxShadow: "0 4px 28px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.06)",
              maxWidth: "440px",
              width: "100%",
            }}
          >
            <img
              src="/images/rane.webp"
              alt="Tejprakash Rane"
              className="rounded-circle shadow director-photo"
              style={{ width: "110px", height: "110px", objectFit: "cover", marginBottom: "20px" }}
            />
            <h3 className="fw-bold text-dark mb-1" style={{ fontSize: "1.4rem" }}>Tejprakash Rane</h3>
            <h5 className="fw-semibold mb-1" style={{ color: "var(--primary-orange)", fontSize: "1rem" }}>Director</h5>
            <p className="text-dark fw-medium mb-2 mt-1" style={{ fontSize: "0.9rem" }}>RANE AND RANE'S SONS</p>

            {/* Divider */}
            <div style={{ width: "40px", height: "2px", background: "var(--primary-orange)", margin: "12px auto", opacity: 0.5, borderRadius: "1px" }} />

            <p className="text-muted mb-1" style={{ fontSize: "0.88rem", lineHeight: "1.6" }}>
              Former District Coordinator, National Commission for Scheduled Castes
            </p>
            <p className="text-muted mb-4" style={{ fontSize: "0.88rem", lineHeight: "1.6" }}>
              Former Executive Council Member, Maharishi Panini Sanskrit Evam Vaidik Vishwavidyalaya, Ujjain
            </p>

            <a href="#contactus" style={{ textDecoration: "none" }}>
              <button
                className="btn fw-semibold text-white"
                style={{
                  background: "var(--primary-orange)",
                  padding: "10px 30px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.95rem",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-orange-hover)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--primary-orange)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Get in Touch
              </button>
            </a>
          </div>
        </div>
      </section>

      <TrackDivider color="#e2790025" />

      {/* ════════ DEPARTMENTS ════════ */}
      <section style={{ backgroundColor: "var(--client-component-bg-color)", padding: "70px 0" }} ref={deptRef}>
        <div className="container text-center">
          <div className={`reveal${deptVis ? " visible" : ""}`}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--primary-orange)" }}>
              Our Portfolio
            </span>
            <h2 className="fw-bold mt-2 mb-5" style={{ color: "#1f2937" }}>Our Departments</h2>
          </div>

          <div className="row justify-content-center stagger">
            {departments.map((dept, idx) => (
              <div
                className="col-6 col-sm-4 col-md-2 mb-4"
                key={idx}
                style={{ "--i": idx }}
              >
                <div
                  className={`dept-card bg-white shadow-sm rounded py-4 px-3 text-center h-100 reveal${deptVis ? " visible" : ""}`}
                  style={{
                    minWidth: "120px",
                    cursor: "pointer",
                    transitionDelay: `${idx * 90}ms`,
                  }}
                >
                  <div className="mb-3">
                    <img
                      src={dept.logo}
                      alt={dept.name}
                      style={{ width: "52px", height: "52px", objectFit: "contain" }}
                    />
                  </div>
                  <div className="fw-semibold text-dark small">{dept.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrackDivider color="#e2790020" />

      {/* ════════ CONTACT ════════ */}
      <section className="py-5 bg-white" id="contactus" ref={contactRef}>
        <Container>
          <div className={`reveal${contactVis ? " visible" : ""}`} style={{ marginBottom: "40px" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--primary-orange)" }}>
              Get In Touch
            </span>
            <h2 className="fw-bold mt-2" style={{ color: "#1e293b" }}>Contact Us</h2>
            <div style={{ width: "40px", height: "3px", background: "var(--primary-orange)", marginTop: "10px", borderRadius: "2px" }} />
          </div>

          <Row className="align-items-center gy-4">
            <Col md={6}>
              <div className={`reveal-left${contactVis ? " visible" : ""}`}>
                <h5 className="fw-semibold mb-3" style={{ color: "var(--primary-orange)" }}>
                  Better yet, see us in person!
                </h5>
                <p className="text-muted" style={{ maxWidth: "500px", lineHeight: "1.7" }}>
                  We stay in constant communication with our customers until the job is done.
                  To get a free quote, or if you have questions or special requests, just drop us a line.
                </p>

                <ul className="list-unstyled mt-4" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {[
                    { icon: <FaWhatsapp color="#25D366" size={18} />, text: "WhatsApp Available" },
                    { icon: <FaEnvelope color="#FF5722" size={18} />, text: "ranendranesons@gmail.com" },
                    {
                      icon: <FaMapMarkerAlt color="#EF4444" size={18} />,
                      text: "101, Ranipura Main Road, Opp. Bhaiyya Ji Pyao, Jagjivan Ram Mohalla, Indore, MP, India",
                    },
                    { icon: <FaClock color="#F59E0B" size={18} />, text: "Open today 11:45 am – 05:00 pm" },
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="contact-item d-flex align-items-start gap-3"
                      style={{ cursor: "pointer" }}
                    >
                      <span style={{ marginTop: "2px", flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ color: "#374151", fontSize: "0.95rem" }}>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            <Col md={6}>
              <div className={`reveal-right${contactVis ? " visible" : ""}`}>

                {/* ── Form card ── */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "36px 32px",
                    boxShadow: "0 4px 28px rgba(0,0,0,0.08)",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  {submitted ? (
                    /* ── Success state ── */
                    <div className="text-center py-3">
                      <div
                        style={{
                          width: "64px", height: "64px", borderRadius: "50%",
                          background: "rgba(34,197,94,0.1)", display: "flex",
                          alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
                        }}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <h5 className="fw-bold mb-2" style={{ color: "#1e293b" }}>Message Sent!</h5>
                      <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                        Thank you for reaching out. We'll get back to you shortly.
                      </p>
                      <button
                        onClick={handleReset}
                        className="btn fw-semibold text-white"
                        style={{
                          background: "var(--primary-orange)", border: "none",
                          borderRadius: "8px", padding: "10px 24px", fontSize: "0.9rem",
                        }}
                      >
                        Send Another
                      </button>
                    </div>
                  ) : (
                    /* ── Form ── */
                    <form onSubmit={handleFormSubmit} noValidate>
                      <h5 className="fw-bold mb-4" style={{ color: "#1e293b", fontSize: "1.1rem" }}>
                        Send us a message
                      </h5>

                      {/* Name + Phone row */}
                      <div className="row g-3 mb-3">
                        <div className="col-sm-6">
                          <label style={labelStyle}>Full Name <span style={{ color: "var(--primary-orange)" }}>*</span></label>
                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleFormChange}
                            onFocus={() => setFocused("name")}
                            onBlur={() => setFocused("")}
                            placeholder="Rajesh Kumar"
                            required
                            style={inputStyle(focused === "name")}
                          />
                        </div>
                        <div className="col-sm-6">
                          <label style={labelStyle}>Phone <span style={{ color: "var(--primary-orange)" }}>*</span></label>
                          <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleFormChange}
                            onFocus={() => setFocused("phone")}
                            onBlur={() => setFocused("")}
                            placeholder="+91 98765 43210"
                            required
                            style={inputStyle(focused === "phone")}
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="mb-3">
                        <label style={labelStyle}>Email Address <span style={{ color: "var(--primary-orange)" }}>*</span></label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleFormChange}
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused("")}
                          placeholder="you@example.com"
                          required
                          style={inputStyle(focused === "email")}
                        />
                      </div>

                      {/* Subject */}
                      <div className="mb-3">
                        <label style={labelStyle}>Subject <span style={{ color: "var(--primary-orange)" }}>*</span></label>
                        <select
                          name="subject"
                          value={form.subject}
                          onChange={handleFormChange}
                          onFocus={() => setFocused("subject")}
                          onBlur={() => setFocused("")}
                          required
                          style={{ ...inputStyle(focused === "subject"), color: form.subject ? "#1e293b" : "#94a3b8" }}
                        >
                          <option value="" disabled>Select a subject</option>
                          <option value="Tender Enquiry">Tender Enquiry</option>
                          <option value="Project Quote">Project Quote</option>
                          <option value="Partnership">Partnership</option>
                          <option value="General Enquiry">General Enquiry</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Description */}
                      <div className="mb-4">
                        <label style={labelStyle}>Message <span style={{ color: "var(--primary-orange)" }}>*</span></label>
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleFormChange}
                          onFocus={() => setFocused("description")}
                          onBlur={() => setFocused("")}
                          placeholder="Tell us about your project or requirement..."
                          required
                          rows={4}
                          style={{ ...inputStyle(focused === "description"), resize: "vertical", minHeight: "110px" }}
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn fw-semibold text-white w-100"
                        style={{
                          background: "var(--primary-orange)",
                          border: "none",
                          borderRadius: "8px",
                          padding: "12px",
                          fontSize: "1rem",
                          letterSpacing: "0.5px",
                          transition: "all 0.25s ease",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-orange-hover)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "var(--primary-orange)"; e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        Send Message →
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <TrackDivider color="#e2790025" />

      {/* ════════ DOCUMENTS ════════ */}
      <section
        className="py-5"
        style={{ backgroundColor: "var(--client-component-bg-color)" }}
        id="documents"
        ref={docRef}
      >
        <div className="container">
          <div className={`reveal${docVis ? " visible" : ""}`} style={{ textAlign: "center", marginBottom: "40px" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--primary-orange)" }}>
              Transparency
            </span>
            <h2 className="fw-bold mt-2" style={{ color: "#1f2937" }}>Important Documents</h2>
            <div style={{ width: "40px", height: "3px", background: "var(--primary-orange)", margin: "10px auto 0", borderRadius: "2px" }} />
          </div>

          <div className="row">
            {documents.map((doc, index) => (
              <div className="col-md-6 col-lg-4 mb-4" key={index}>
                <div
                  className={`doc-card shadow-sm rounded bg-white p-4 h-100 d-flex flex-column justify-content-between reveal${docVis ? " visible" : ""}`}
                  style={{ transitionDelay: `${index * 80}ms`, cursor: "default" }}
                >
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <FaFilePdf size={30} color="red" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span className="fw-semibold text-dark" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                      {doc.name}
                    </span>
                  </div>

                  <div>
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn text-white fw-medium"
                      style={{
                        background: "var(--primary-orange)",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        padding: "8px 18px",
                        transition: "all 0.25s ease",
                        display: "inline-block",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-orange-hover)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "var(--primary-orange)"; e.currentTarget.style.transform = "translateY(0)"; }}
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

      <Footer />
    </>
  );
}