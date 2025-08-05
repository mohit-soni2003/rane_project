import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin, FaHardHat  ,FaPhoneAlt 
} from "react-icons/fa";
import { backend_url } from "../../../store/keyStore";
import { Link } from "react-router-dom";

const setCookieTest = async () => {
  await fetch(`${backend_url}/test-cookie`, {
    method: "GET",
    credentials: "include",
    referrerPolicy: "no-referrer-when-downgrade"
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
};

const Footer = () => {
  return (
    <footer className="bg-dark text-center text-light py-4 pb-0">
      <div className="container">
        {/* Brand & tagline */}
        <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
          <FaHardHat color="var(--primary-orange)" size={20} />
          <h5 className="fw-bold mb-0">RANE & RANE'S SONS</h5>
        </div>

        <p className="text-light small mb-3">
          Building India's railway infrastructure with trust and excellence
        </p>

        {/* Social Icons */}
        <div className="d-flex justify-content-center gap-4 mb-3">
          <a href="https://www.facebook.com/tejprakash.rane/" target="_blank" rel="noopener noreferrer" className="text-light fs-5">
            <FaFacebookF />
          </a>
          <a href="https://x.com/tejprakashrane?s=11" target="_blank" rel="noopener noreferrer" className="text-light fs-5">
            <FaTwitter />
          </a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-light fs-5">
            <FaLinkedin />
          </a>
          <a href="https://www.instagram.com/raneandranessons/?igsh=YXg2aGh2dXBpaGRi#" target="_blank" rel="noopener noreferrer" className="text-light fs-5">
            <FaInstagram />
          </a>
        </div>

        {/* Contact Details */}
        <p className="text-light small mb-1">
          101, Ranipura Main Road, Opp. Bhaiyya Ji Pyao, Jagjivan Ram Mohalla, Indore, MP, India
        </p>
        <p className="text-light small mb-2">Phone: 9425029680</p>

        {/* Copyright */}
        <div className="mt-3 text-light small">
          &copy; 2024 Rane & Rane's Sons. All rights reserved.
        </div>

        {/* Admin login */}
        <div className="mt-2">
          <Link to="/admin-login" className="text-warning text-decoration-none small fw-medium">
            Admin Login
          </Link>
        </div>
      </div>
       {/* Developer Credit */}
      <div className="bg-black py-1">
        <small className="">
          Designed & Maintained by @Mohit Soni{" "}
          <a
            href="https://mohitsoni.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-warning text-decoration-none fw-semibold"
          >
            Contact Developer
          </a>
         {"  "} <FaPhoneAlt></FaPhoneAlt> Phone {"   "} +91 9589571577
        </small>
      </div>
    </footer>
  );
};

export default Footer;
