import React, { useState,useRef } from "react";
import { FaFileAlt, FaUserTie, FaLink, FaCalendarAlt } from "react-icons/fa";
import { createAgreement } from "../../services/agreement";
import AdminHeader from "../../component/header/AdminHeader";
import { FaFileUpload } from "react-icons/fa";
import { CLOUD_NAME, UPLOAD_PRESET } from "../../store/keyStore";


export default function PushAgreement() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    clientId: "",
    fileUrl: "",
    expiryDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title || !form.clientId || !file) {
      setError("Title, Client ID, and file are required.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Upload file first
      const uploadedFileUrl = await uploadToCloudinary();

      // 2️⃣ Send agreement data with fileUrl
      await createAgreement({
        ...form,
        fileUrl: uploadedFileUrl,
      });

      setSuccess("Agreement pushed successfully.");
      setForm({
        title: "",
        description: "",
        clientId: "",
        fileUrl: "",
        expiryDate: "",
      });
      setFile(null);

    } catch (err) {
      setError(err.message || "Failed to push agreement.");
    } finally {
      setLoading(false);
    }
  };

  const uploadToCloudinary = async () => {
    if (!file) throw new Error("Please select a file");

    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > 10) {
      throw new Error("File size must be under 10MB");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error("File upload failed");
    }

    const data = await res.json();
    return data.secure_url;
  };


  return (
    <>
      <AdminHeader />


      <div className="container-fluid px-0 mx-0">
        <div className="row m-0">
          <div className="col-12 px-0">
            <div
              className="card my-3"
              style={{
                width: "100%",
                background: "var(--background)",
                borderRadius: "20px",
                border: "none",
                boxShadow: "0 8px 24px var(--shadow-color)",
              }}
            >

              <div className="card-body p-3 p-md-4">
                {/* Header */}
                <div className="mb-4">
                  <h5
                    className="fw-semibold mb-1 d-flex align-items-center"
                    style={{ color: "var(--primary)" }}
                  >
                    <FaFileAlt className="me-2" />
                    Push Agreement
                  </h5>
                  <p
                    className="mb-0"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Upload and assign an agreement to a client
                  </p>
                </div>

                {/* Alerts */}
                {error && (
                  <div
                    className="alert"
                    style={{
                      background: "var(--destructive)",
                      color: "var(--destructive-foreground)",
                    }}
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    className="alert"
                    style={{
                      background: "var(--success)",
                      color: "var(--success-foreground)",
                    }}
                  >
                    {success}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {/* Client ID */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FaUserTie className="me-2 text-muted" />
                      Client User ID
                    </label>
                    <input
                      type="text"
                      name="clientId"
                      className="form-control custom-input"
                      placeholder="Enter client user ID"
                      value={form.clientId}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Title */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Agreement Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      className="form-control custom-input"
                      placeholder="Enter agreement title"
                      value={form.title}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows="3"
                      className="form-control custom-input"
                      placeholder="Optional description"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Agreement File Upload */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FaFileUpload className="me-2 text-muted" />
                      Upload Agreement File
                    </label>

                    <div
                      className="border rounded d-flex align-items-center justify-content-center p-4"
                      style={{
                        cursor: "pointer",
                        borderStyle: "dashed",
                        background: "var(--secondary)",
                        color: "var(--muted-foreground)",
                      }}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <FaFileAlt className="me-2" />
                      {file ? file.name : "Click to upload PDF (max 10MB)"}
                    </div>

                    <input
                      type="file"
                      accept=".pdf"
                      ref={fileInputRef}
                      hidden
                      onChange={handleFileChange}
                    />
                  </div>


                  {/* Expiry Date */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <FaCalendarAlt className="me-2 text-muted" />
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      className="form-control custom-input"
                      value={form.expiryDate}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn "
                    disabled={loading}
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      padding: "12px 50px",
                      fontWeight: 500,
                      borderRadius: "8px",
                    }}
                    onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--primary-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "var(--primary)")
                    }
                  >
                    {loading ? "Submitting..." : "Push Agreement"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Styles */}
      <style jsx="true">{`
        .custom-input {
          background-color: var(--input);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--foreground);
        }

        .custom-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 0.15rem rgba(107, 62, 43, 0.25);
        }
      `}</style>
    </>
  );
}
