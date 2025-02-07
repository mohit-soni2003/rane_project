import React, { useState, useEffect } from "react";
import "./BillbookForm.css";
import { useAuthStore } from "../store/authStore";
import { backend_url , CLOUDINARY_URL,UPLOAD_PRESET,CLOUD_NAME} from '../../components/store/keyStore'



function BillbookForm() {

  const { user } = useAuthStore();

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
  // user Setting up 
  useEffect(() => {
    if (user) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        user: user._id,
      }));
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    console.log("isloading set true")
    const selectedFile = e.target.files[0]; // Get the selected file directly
    if (!selectedFile) {
      console.error("No file selected");
      setLoading(false);
      console.log("isloading set false")
      return;
    }

    console.log(selectedFile); // Log the selected file

    const data = new FormData();
    data.append("file", selectedFile); // Attach the selected file
    data.append("upload_preset", UPLOAD_PRESET); // Your Cloudinary upload preset
    data.append("cloud_name", CLOUD_NAME); // Your Cloudinary cloud name

    try {
      const response = await fetch(
        CLOUDINARY_URL,
        {
          method: "POST",
          body: data,
        }
      );

      if (!response.ok) {
        throw new Error("Error: " + response.status + " " + response.statusText);
      }

      const result = await response.json();
      console.log("Uploaded PDF URL:", result.url);

      // Set PDF URL in formData after successful upload
      setFormData({
        ...formData,
        pdfurl: result.url,
      });

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

    // Check if the PDF URL is set and if the form is ready
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

    // Proceed to submit the form data (you can replace this with your actual submission logic)
    try {
      const response = await fetch(`${backend_url}/post-bill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Handle server response
      if (response.ok) {
        const result = await response.json();
        alert("Form submitted successfully!");
        console.log("Server response:", result);

      } else {
        const error = await response.json();
        alert(`Failed to submit form: ${error.message || "Server error"}`);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("An error occurred. Please try again later.");
    }
   
    // Here, you can add your logic to send formData to your backend or API
  };

  return (
    
      <div className="form-container">
        <form>
          <div className="form-grid">
            {/* Form Fields */}
            <div className="form-group">
              <label htmlFor="firmName">Firm Name *</label>
              <input
                type="text"
                id="firmName"
                placeholder="Firm Name"
                required
                value={formData.firmName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="workArea">Work Area *</label>
              <input
                type="text"
                id="workArea"
                placeholder="Work Area"
                required
                value={formData.workArea}
                onChange={handleChange}
              />
            </div>
            {/* phone  */}
            {/* <div className="form-group">
              <label htmlFor="phone">Phone *</label>
              <input
                type="text"
                id="phone"
                placeholder="Phone"
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </div> */}
            {/* email  */}
            {/* <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div> */}

            <div className="form-group">
              <label htmlFor="loaNo">LOA NO. (Issued By Rane and Rane Sons) *</label>
              <input
                type="text"
                id="loaNo"
                placeholder="LOA NO."
                required
                value={formData.loaNo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="invoiceNo">Invoice No.</label>
              <input
                type="text"
                id="invoiceNo"
                placeholder="Invoice No."
                value={formData.invoiceNo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="workDescription">Work Description</label>
            <textarea
              id="workDescription"
              placeholder="Work Description"
              rows="5"
              value={formData.workDescription}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-group file-upload">
            <label htmlFor="fileUpload">Bills Upload</label>
            <input
              type="file"
              accept=".pdf"
              id="fileUpload"
              onChange={handleFileChange}
            />
          </div>

          <p className="recaptcha-text">
            This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
          </p>

          <button onClick={handleSubmit} className="submit-button">
            Submit
          </button>
        </form>
      </div>
    
  );
}

export default BillbookForm;
