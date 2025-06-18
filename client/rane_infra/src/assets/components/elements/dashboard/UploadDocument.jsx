import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  CLOUDINARY_URL,
  CLOUD_NAME,
  UPLOAD_PRESET,
  backend_url,
} from "../../store/keyStore";

const UploadDocument = () => {
  const [fileTitle, setFileTitle] = useState("");
  const [file, setFile] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchMyFiles();
  }, []);

  const fetchMyFiles = async () => {
    try {
      const response = await fetch(`${backend_url}/dfs/my-files`, {
        method: "GET",
        credentials: "include", // for cookie-based auth
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to fetch documents");
      setDocuments(result.files);
    } catch (err) {
      console.error("Failed to load documents:", err);
      alert("Could not load your documents ❌");
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("cloud_name", CLOUD_NAME);
    formData.append("resource_type", "auto");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Cloudinary upload failed");
    const data = await res.json();
    return data.secure_url;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileTitle || !file) return alert("All fields are required");

    try {
      setLoading(true);
      const fileUrl = await uploadToCloudinary(file);
      const response = await fetch(`${backend_url}/dfs/upload-document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ fileTitle, fileUrl }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");

      setDocuments([result.file, ...documents]);
      setFile(null);
      setFileTitle("");
      alert("File uploaded successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (doc) => {
    setSelectedDoc(doc);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedDoc(null);
    setShowModal(false);
  };

  return (
    <div className="container py-4">
      {/* Upload Form */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">📤 Upload New Document</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleUpload}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Document Title</label>
              <input
                type="text"
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
                className="form-control"
                placeholder="Enter document title"
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Choose File</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.png,.jpg"
                className="form-control"
              />
            </div>
            <button
              className="btn btn-success w-100 mt-2"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
      </div>

      {/* Document List */}
      <h4 className="mb-3">📑 View And Track Documents</h4>
      <div className="row">
  {documents.map((doc) => (
    <div key={doc._id} className="col-lg-6 col-md-6 col-sm-12 mb-4">
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body d-flex flex-column justify-content-between">
          <div>
            <h5 className="card-title fw-bold text-primary mb-3">
              📄 {doc.fileTitle}
            </h5>

            <div className="mb-2">
              <span className="fw-semibold me-2">Status:</span>
              <span
                className={`badge rounded-pill bg-${getStatusColor(
                  doc.status
                )} text-uppercase`}
              >
                {doc.status}
              </span>
            </div>

            <div className="mb-1">
              <strong>Responsible Officer:</strong>{" "}
              {doc.currentOwner?.name || doc.currentOwner || "N/A"}
            </div>

            <div className="mb-3 text-muted small">
              <strong>Created:</strong>{" "}
              {new Date(doc.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 mt-auto">
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
            >
              <i className="bi bi-eye"></i> View
            </a>
            <button
              onClick={() => openModal(doc)}
              className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
            >
              <i className="bi bi-chat-left-text"></i> Open
            </button>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>


      {/* Modal */}
      {showModal && selectedDoc && (
        <div
          className="modal show fade"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-scrollable modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  📬 Communication Trail - {selectedDoc.fileTitle}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {selectedDoc.forwardingTrail.length === 0 ? (
                  <p>No communication trail available.</p>
                ) : (
                  selectedDoc.forwardingTrail.map((entry, idx) => (
                    <div key={idx} className="p-3 border rounded mb-3 bg-light">
                      <p className="mb-1"><strong>By:</strong> {entry.forwardedBy?.name || entry.forwardedBy}</p>
                      <p className="mb-1"><strong>To:</strong> {entry.forwardedTo?.name || entry.forwardedTo}</p>
                      <p className="mb-1"><strong>Action:</strong> {entry.action}</p>
                      <p className="mb-1"><strong>Note:</strong> {entry.note}</p>
                      <p className="mb-0 text-muted small"><strong>Time:</strong> {new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Status badge color helper
const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "in-review":
      return "info";
    default:
      return "secondary";
  }
};

export default UploadDocument;
