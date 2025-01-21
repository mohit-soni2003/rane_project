import React, { useEffect, useRef, useState } from "react";
import "./BillbookForm.css";

const BillbookForm = () => {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();

  const [fileName, setFileName] = useState("Attach File (0)");

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: "dxdyudztf",
        uploadPreset: "raneproject",
      },
      function (error, result) {
        if (!error && result && result.event === "success") {
          console.log("File uploaded successfully:", result.info);
          setFileName(result.info.original_filename); 
        }
      }
    );
  }, []);

  const handleFileClick = (e) => {
    e.preventDefault(); 
    widgetRef.current.open(); 
  };

  return (
    <div className="billbook-container">
      <h1 className="title">Bill Books</h1>
      <p className="subtitle">Labor Contractor & Goods Supplier Bills Section</p>
      <p className="description">
        Only for Local and Labor Contractor, Supplier, Labor They Upload His Work and Goods Bills.
      </p>

      <form className="billbook-form">
        <div className="form-row">
          <input type="text" placeholder="Firm Name *" required />
          <input type="text" placeholder="Work Area *" required />
        </div>
        <div className="form-row">
          <input type="tel" placeholder="Phone *" required />
          <textarea placeholder="Work Description"></textarea>
        </div>
        <div className="form-row">
          <input type="email" placeholder="Email *" required />
          <input
            type="text"
            placeholder="LOA NO. (Issue By Rane and Rane Sons) *"
            required
          />
        </div>
        <div className="form-row">
          <input type="text" placeholder="Invoice No." />
          <label className="file-upload" onClick={handleFileClick}>
            {fileName}
          </label>
        </div>
        <p className="recaptcha-info">
          This site is protected by reCAPTCHA and the Google Privacy Policy and
          Terms of Service apply.
        </p>
        <button type="submit" className="submit-button">
          Submit Bills
        </button>
      </form>
    </div>
  );
};

export default BillbookForm;
