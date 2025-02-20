import React, { useState, useEffect } from "react";
import "./BillbookForm.css";
import { useAuthStore } from "../store/authStore";
import { backend_url, CLOUDINARY_URL, UPLOAD_PRESET, CLOUD_NAME } from '../../components/store/keyStore';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Spinner from 'react-bootstrap/Spinner';
import WarningModal from "../../cards/models/WarningModal";



function BillbookForm() {
  const { user } = useAuthStore();
  const [warningModalShow, warningsetModalShow] = useState(false);


  const [formData, setFormData] = useState({
    firmName: "",
    workArea: "",
    phone: user.phoneNo,
    loaNo: "",
    email: user.email,
    invoiceNo: "",
    workDescription: "",
    pdfurl: "",
    user: ""
  });

  const [fileName, setFileName] = useState(""); // New state for file name
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setisSubmitting] = useState(false)

  // Set user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        user: user._id,
      }));
    }
  }, [user]);

  // Handle input change
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handle file change
  const handleFileChange = async (e) => {
    setLoading(true);
    console.log("isloading set true");

    const selectedFile = e.target.files[0]; // Get the selected file
    if (!selectedFile) {
      console.error("No file selected");
      setLoading(false);
      return;
    }

    setFileName(selectedFile.name); // Set the file name in state

    console.log(selectedFile);

    const data = new FormData();
    data.append("file", selectedFile);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("cloud_name", CLOUD_NAME);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error("Error: " + response.status + " " + response.statusText);
      }

      const result = await response.json();
      console.log("Uploaded PDF URL:", result.url);

      setFormData((prevData) => ({
        ...prevData,
        pdfurl: result.url,
      }));

      setLoading(false);
    } catch (err) {
      console.error("Error uploading PDF:", err);
      setError("Error uploading the file. Please try again.");
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) {
      alert("Please wait while the file is uploading...");
      return;
    }
    
    if (!formData.firmName || !formData.phone || !formData.email || !formData.loaNo || !formData.invoiceNo) {
      alert("Please fill in all required fields.");
      return;
    }
    
    if (!formData.pdfurl) {
      alert("Please select the bill (PDF file).");
      return;
    }
    
    try {
      setisSubmitting(true)
      const response = await fetch(`${backend_url}/post-bill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          firmName: "",
          workArea: "",
          phone: user.phoneNo,
          loaNo: "",
          email: user.email,
          invoiceNo: "",
          workDescription: "",
          pdfurl: "",
          user: user._id
        });
        setisSubmitting(false)

        setFileName(""); // Clear file name after submission
        warningsetModalShow(true)
      } else {
        const error = await response.json();
        setisSubmitting(false)
        alert(`Failed to submit form: ${error.message || "Server error"}`);

      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("An error occurred. Please try again later.");
      setisSubmitting(false)

    }
  };

  return (
    <div className="form-container">
      <form>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="firmName">Firm Name *</label>
            <input type="text" id="firmName" placeholder="Firm Name" required value={formData.firmName} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="workArea">Work Area *</label>
            <input type="text" id="workArea" placeholder="Work Area" required value={formData.workArea} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="loaNo">LOA NO. (Issued By Rane and Rane Sons) *</label>
            <input type="text" id="loaNo" placeholder="LOA NO." required value={formData.loaNo} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="invoiceNo">Invoice No.</label>
            <input type="text" id="invoiceNo" placeholder="Invoice No." value={formData.invoiceNo} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="workDescription">Work Description</label>
          <textarea id="workDescription" placeholder="Work Description" rows="5" value={formData.workDescription} onChange={handleChange}></textarea>
        </div>

        <div className="form-group file-upload">
          <label htmlFor="fileUpload">Bills Upload</label>
          <input type="file" accept=".pdf" id="fileUpload" onChange={handleFileChange} />
          {fileName && <p className="file-name">Selected File: {fileName}</p>} {/* Display selected file name */}
        </div>
        {loading ? <ProgressBar animated  now={100} /> : ""}

        <p className="recaptcha-text">
          Please Dont Submit bill multiple times.
        </p>

        <button onClick={handleSubmit} className="submit-button" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Spinner
        as="span"
        animation="grow"
        size="sm"
        role="status"
        aria-hidden="true"
      />{" "}
      Wait...
    </>
  ) : (
    "Submit"
  )}
</button>

      </form>
      {warningModalShow && <WarningModal show={warningModalShow} onClose={() => warningsetModalShow(false)} />}

    </div>
  );
}

export default BillbookForm;
