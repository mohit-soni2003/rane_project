import React from "react";
import "./MeetingCard"; // Importing CSS file

const MeetingCard = () => {
  return (
    <div className="meeting-container">
      <h1 className="meeting-title">Set Meeting Time</h1>
      <hr className="meeting-divider" />

      <h2 className="meeting-subtitle">CONSTRUCTION RELATED</h2>

      <div className="meeting-card">
        {/* Image Section */}
        <div className="meeting-image">
          <img src="/your-image-url.png" alt="Rane Infrastructure" />
        </div>

        {/* Details Section */}
        <div className="meeting-info">
          <h3>RANE INFRASTRUCTURE</h3>
          <p>1 hr | Free</p>
        </div>

        {/* Button */}
        <button className="meeting-button">BOOK</button>
      </div>
    </div>
  );
};

export default MeetingCard;
