import React, { useEffect, useState } from "react";
import { backend_url } from "../../../store/keyStore";
import { useAuthStore } from "../../../store/authStore"; 

const DfsRequests = () => {
  const [documents, setDocuments] = useState([]);
  const [forwardData, setForwardData] = useState({});
  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  useEffect(() => {
    fetchDocuments();
    fetchUsers();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${backend_url}/dfs/my-requests`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.files);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${backend_url}/dfs/all-users`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleInputChange = (fileId, field, value) => {
    setForwardData((prev) => ({
      ...prev,
      [fileId]: { ...prev[fileId], [field]: value },
    }));
  };

  const handleForward = async (fileId) => {
    const data = forwardData[fileId];
    if (!data?.note || !data?.action || !data?.forwardedTo || !data?.status) {
      return alert("All fields are required");
    }

    try {
      setLoadingId(fileId);
      const res = await fetch(`${backend_url}/dfs/forward/${fileId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) return alert("Error: " + result.error);

      alert("✅ Document forwarded successfully");
      fetchDocuments();
      setForwardData((prev) => ({ ...prev, [fileId]: {} }));
    } catch (error) {
      console.error("Error forwarding document:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const toggleTrail = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  return (
    <div className="container py-4">
      <h3 className="mb-4">📁 Documents Assigned To Me</h3>
      <div className="row">
        {documents.length === 0 && (
          <p className="text-muted">No documents assigned to you currently.</p>
        )}

        {documents.map((doc) => (
          <div key={doc._id} className="col-md-6 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="fw-bold text-primary mb-2">📄 {doc.fileTitle}</h5>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`badge bg-${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </p>
                <p>
                  <strong>Uploaded By:</strong> {doc.uploadedBy?.name}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(doc.createdAt).toLocaleString()}
                </p>

                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary mb-3"
                >
                  🔍 View Document
                </a>

                <h6>📝 Forward Document</h6>
                <textarea
                  className="form-control mb-2"
                  placeholder="Add a note..."
                  rows={2}
                  value={forwardData[doc._id]?.note || ""}
                  onChange={(e) =>
                    handleInputChange(doc._id, "note", e.target.value)
                  }
                />
                <select
                  className="form-select mb-2"
                  value={forwardData[doc._id]?.action || ""}
                  onChange={(e) =>
                    handleInputChange(doc._id, "action", e.target.value)
                  }
                >
                  <option value="">Select Action</option>
                  <option value="forwarded">Forwarded</option>
                  <option value="viewed">Viewed</option>
                  <option value="commented">Commented</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  className="form-select mb-2"
                  value={forwardData[doc._id]?.forwardedTo || ""}
                  onChange={(e) =>
                    handleInputChange(doc._id, "forwardedTo", e.target.value)
                  }
                >
                  <option value="">Select Next Authority</option>
                  {users
                    .filter((u) => u._id !== doc.currentOwner?._id)
                    .map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.cid})
                      </option>
                    ))}
                    <option key={doc.uploadedBy?._id} value={doc.uploadedBy?._id}>
                        {doc.uploadedBy?.name} ({doc.uploadedBy.cid})
                      </option>
                    
                    
                </select>


                <select
                  className="form-select mb-3"
                  value={forwardData[doc._id]?.status || ""}
                  onChange={(e) =>
                    handleInputChange(doc._id, "status", e.target.value)
                  }
                >
                  <option value="">Change Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button
                  className="btn btn-success w-100 mb-2"
                  onClick={() => handleForward(doc._id)}
                  disabled={
                    !forwardData[doc._id]?.note ||
                    !forwardData[doc._id]?.action ||
                    !forwardData[doc._id]?.forwardedTo ||
                    !forwardData[doc._id]?.status ||
                    loadingId === doc._id
                  }
                >
                  {loadingId === doc._id ? "⏳ Forwarding..." : "Forward & Update"}
                </button>

                <button
                  className="btn btn-sm btn-link"
                  onClick={() => toggleTrail(doc._id)}
                >
                  {expanded[doc._id] ? "Hide" : "Show"} Previous Communication Trail
                </button>

                {expanded[doc._id] && doc.forwardingTrail?.length > 0 && (
                  <div className="mt-3 bg-light p-2 rounded">
                    <strong>📜 Trail:</strong>
                    <ul className="list-unstyled mt-2">
                      {doc.forwardingTrail.map((trail, i) => (
                        <li key={i} className="mb-2">
                          <div>
                            <strong>By:</strong> {trail.forwardedBy?.name}
                          </div>
                          <div>
                            <strong>To:</strong> {trail.forwardedTo?.name}
                          </div>
                          <div>
                            <strong>Action:</strong> {trail.action}
                          </div>
                          <div>
                            <strong>Note:</strong> {trail.note}
                          </div>
                          <div>
                            <strong>Time:</strong>{" "}
                            {new Date(trail.timestamp).toLocaleString()}
                          </div>
                          <hr />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {expanded[doc._id] && doc.forwardingTrail?.length === 0 && (
                  <p className="text-muted mt-2">
                    No communication trail available.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DfsRequests;
