import React from "react";
import "./Downloads.css";


const documents = [
  { name: "Rane GST Certificate", file: "/documents/Rane GST Certificate.pdf" },
  { name: "Drugs Sale Licence", file: "documents/Drugs Sale Licence_.pdf" },
  { name: "Udyam Registration Certificate", file: "/documents/Udyam_Registration_Certificate.pdf" },
  { name: "Business Conditions for Labor Contractors", file: "/documents/Business Conditions for Labor Contractors.pdf" },
  { name: "GUMASTA", file: "/documents/gumasta.pdf" },
  { name: "Business Terms and Conditions for Goods Supply", file: "/documents/Business Terms and Conditions for Goods Supplyr.pdf" },
];

const Downloads = () => {
  return (
    <div className="downloads-container" id="documents" data-aos="zoom-in">
      <h2 className="downloads-heading" >Downloads</h2>
      <p className="downloads-subheading">Important Documents Of Our Firm</p>

      <div className="downloads-grid" >
        {documents.map((doc, index) => (
          <div key={index} className="downloads-card" data-aos="zoom-in">
            <p>{doc.name} (pdf)</p>
            <a href={doc.file} target="_blank" className="downloads-button">
              DOWNLOAD
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Downloads;
