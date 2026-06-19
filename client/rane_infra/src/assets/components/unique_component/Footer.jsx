import React from "react";
import Lottie from "lottie-react";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin, FaHardHat, FaPhoneAlt } from "react-icons/fa";
import { backend_url } from "../../../store/keyStore";
import { Link } from "react-router-dom";
import trainAnimation from "../../animation/train.navpannel.json";

const Footer = () => {
  return (
    <footer style={{ color: "#fff", position: "relative", overflow: "hidden" }}>

      {/* Force the Lottie SVG to stretch fully — injected once */}
      <style>{`
        .footer-lottie-bg,
        .footer-lottie-bg > div,
        .footer-lottie-bg svg {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
        }
        .footer-lottie-bg svg {
          preserveAspectRatio: xMidYMid slice;
        }
      `}</style>

      {/* ── Lottie full-bleed background ── */}
      <div
        className="footer-lottie-bg"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
        }}
      >
        <Lottie
          animationData={trainAnimation}
          loop
          style={{ width: "100%", height: "100%" }}
          rendererSettings={{
            preserveAspectRatio: "xMidYMid slice",
            progressiveLoad: true,
          }}
        />
      </div>

      {/* Dark overlay for text readability */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%", height: "100%",
          background: "rgba(10, 10, 28, 0.68)",
          zIndex: 1,
        }}
      />

      {/* ── Footer content ── */}
      <div style={{ position: "relative", zIndex: 2, padding: "44px 20px 0" }}>
        <div className="container">

          {/* Brand */}
          <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
            <FaHardHat color="var(--primary-orange)" size={20} />
            <h5 className="fw-bold mb-0">RANE &amp; RANE'S SONS</h5>
          </div>

          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", textAlign: "center" }} className="mb-3">
            Building India's railway infrastructure with trust and excellence
          </p>

          {/* Social icons */}
          <div className="d-flex justify-content-center gap-4 mb-3">
            {[
              { href: "https://www.facebook.com/tejprakash.rane/",                               icon: <FaFacebookF /> },
              { href: "https://x.com/tejprakashrane?s=11",                                       icon: <FaTwitter /> },
              { href: "https://www.linkedin.com/",                                               icon: <FaLinkedin /> },
              { href: "https://www.instagram.com/raneandranessons/?igsh=YXg2aGh2dXBpaGRi#",     icon: <FaInstagram /> },
            ].map(({ href, icon }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "1.1rem",
                  transition: "color 0.2s, transform 0.2s",
                  display: "inline-block",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--primary-orange)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Contact */}
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", textAlign: "center" }} className="mb-1">
            101, Ranipura Main Road, Opp. Bhaiyya Ji Pyao, Jagjivan Ram Mohalla, Indore, MP, India
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", textAlign: "center" }} className="mb-4">
            Phone: 9425029680
          </p>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.10)", margin: "0 0 14px" }} />

          {/* Copyright + Admin */}
          <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap pb-3">
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>
              &copy; 2024 Rane &amp; Rane's Sons. All rights reserved.
            </span>
            <Link
              to="/admin-login"
              style={{ color: "var(--primary-orange)", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
              onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
            >
              Admin Login
            </Link>
          </div>

        </div>
      </div>

      {/* ── Developer credit bar ── */}
      <div style={{ position: "relative", zIndex: 2, background: "rgba(0,0,0,0.50)", padding: "10px 20px", textAlign: "center" }}>
        <small style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem" }}>
          Designed &amp; Maintained by Mohit Soni
        </small>
        <br />
        <small style={{ fontSize: "0.75rem" }}>
          <a
            href="https://mohitsoni.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--primary-orange)", fontWeight: 600, textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
          >
            Contact Developer
          </a>
          <span style={{ color: "rgba(255,255,255,0.25)", margin: "0 10px" }}>|</span>
          <FaPhoneAlt style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", marginRight: "4px" }} />
          <span style={{ color: "rgba(255,255,255,0.45)" }}>+91 9589571577</span>
        </small>
      </div>

    </footer>
  );
};

export default Footer;