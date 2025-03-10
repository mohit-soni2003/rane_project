import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { backend_url } from "../store/keyStore";
import { Link } from "react-router-dom";
import "./Footer.css"; // Create this CSS file for styling
const setCookieTest = async () => {
  await fetch(`${backend_url}/test-cookie`, {
    method: "GET",
    credentials: "include",  // Ensure cookies are sent and received
    referrerPolicy: "no-referrer-when-downgrade"

  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

}
const Footer = () => {
  return (
    <footer className="footer">
      <div className="social-icons">
        <a href="https://www.facebook.com/tejprakash.rane/" target="blank" aria-label="Facebook">
          <FaFacebookF />
        </a>
        <a href="https://www.instagram.com/raneandranessons/?igsh=YXg2aGh2dXBpaGRi#" target="blank" aria-label="Instagram">
          <FaInstagram />
        </a>
        <a href="https://x.com/tejprakashrane?s=11" aria-label="Twitter " target="blank">
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
      {/* <div onClick={setCookieTest}>Setcookit</div> */}
      
        <div className="admin-login-btn" ><Link to="/admin-login">Admin Login</Link></div>
      
    </footer>
  );
};

export default Footer;
