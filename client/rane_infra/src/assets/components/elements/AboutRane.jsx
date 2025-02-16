// AboutRaneAndSons.jsx
import React from "react";
import "./AboutRane.css";

const AboutRane = () => {
  return (
    <div className="about-container">
      <h1 className="about-title" data-aos="fade-right">About RANE AND RANE SONS</h1>
      <div className="about-content">
        <div className="profile-image-container"data-aos="fade-right" >
          <img
            src="/rane.webp"
            alt="Tejprakash Rane"
            className="profilee-image"
          />
        </div>
        <div className="about-details" >
          <h2>TEJPRAKASH RANE</h2>
          <p className="role">DIRECTOR</p>
          <p className="company">RANE AND RANES SONS</p>
          <ul className="achievements">
            <li>
              Former District Coordinator at <a href="https://www.facebook.com/NCSC.GoI" className="link">National Commission for Scheduled Castes</a>
            </li>
            <li>
              Former Executive Council Member at <a href="https://www.facebook.com/people/Maharishi-Panini-Sanskrit-Evam-Vaidik-Vishwavidyalaya-Ujjain/100087930481383/" className="link">Maharishi Panini Sanskrit Evam Vaidik Vishwavidyalaya, Ujjain</a>
            </li>
          </ul>
          <button className="contact-button">CONTACT</button>
        </div>
      </div>
    </div>
  );
};

export default AboutRane;
