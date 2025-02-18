import React from "react";
import "./ContactUs.css";
import { ImWhatsapp } from "react-icons/im";


const ContactUs = () => {
  return (
    <div className=" contact-us-container">
        {/* Left Section - Contact Details */}
        <div className="contact-us-container-left" data-aos="fade-right">
          <h1 className="contact-us-heading">Contact Us</h1>
          <p className="contact-us-text">Better yet, see us in person!</p>
          <p>
            We stay in constant communication with our customers until the job
            is done. To get a free quote, or if you have questions or special
            requests, just drop us a line.
          </p>

          <button className="contact-us-btn mb-3"  onClick={() => window.open("https://wa.me/9589571577", "_blank")}>
          <ImWhatsapp style={{marginRight:"10px", fontSize:"1.5rem"}}/>
          Message us on WhatsApp
          </button>

          <div>
            <h2 className="fw-semibold">RANE AND RANE'S SONS</h2>
            <p>
              101, Ranipura Main Road, opp. Bhaiyya Ji Pyao, Jagjivan Ram
              Mohalla, Nayi Bagad, Ranipura, Indore, Madhya Pradesh, India
            </p>
            <p>
              <a href="mailto:sales@ranendranesons.site" className="contact-us-link">
                sales@ranendranesons.site
              </a>
            </p>
            <p>
              <a href="mailto:ranendranesons@gmail.com" className="contact-us-link">
                ranendranesons@gmail.com
              </a>
            </p>
            <p>
              <a href="mailto:agencymalwa@gmail.com" className="contact-us-link">
                agencymalwa@gmail.com
              </a>
            </p>
          </div>

          <div className="mt-3">
            <h3 className="fw-semibold">Hours</h3>
            <p>Open today 11:45 am – 05:00 pm</p>
          </div>

          <button className="btn btn-dark">GET A FREE QUOTE!</button>
        </div>

        {/* Right Section - Google Map */}
        <div className="contact-us-container-right" data-aos="fade-left">
        <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.3768934074047!2d75.8577302149666!3d22.71567308510232!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fcf4a5a95c2b%3A0x163f2b6d22a08e4b!2sRanipura%2C%20Indore%2C%20Madhya%20Pradesh%20452001!5e0!3m2!1sen!2sin!4v1646672780995!5m2!1sen!2sin"
            allowFullScreen
            loading="lazy"
          ></iframe>
      </div>
    </div>
  );
};

export default ContactUs;
