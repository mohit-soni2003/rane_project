import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import "./Footer.css"; // Create this CSS file for styling

const Footer = () => {
  return (
    <footer className="footer">
      <div className="social-icons">
        <a href="#" aria-label="Facebook">
          <FaFacebookF />
        </a>
        <a href="#" aria-label="Instagram">
          <FaInstagram />
        </a>
        <a href="#" aria-label="Twitter">
          <FaTwitter />
        </a>
      </div>
      <div className="footer-content">
        <h3>RANE & RANE'S SONS</h3>
        <p>
          101, Ranipura Main Road, opp. Bhaiyya Ji Pyao, Jagjivan Ram Mohalla,
          Nayi Bagad, Ranipura, Indore, Madhya Pradesh, India
        </p>
        <p>9425029680</p>
        <p>&copy; 2024 - All Rights Reserved. By RANE AND RANE SONS</p>
      </div>
    </footer>
  );
};

export default Footer;
