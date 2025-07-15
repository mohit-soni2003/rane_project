import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { backend_url } from "../../../../../store/keyStore";

export default function CreateUser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${backend_url}/admin-create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("User created successfully!");
        setFormData({ name: "", email: "", password: "" });
      } else {
        setMessage(data.message || "Failed to create user.");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="card shadow-lg p-4 w-50 m-5">
        <h2 className="text-center mb-4">Create New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
        {message && (
          <div className={`alert mt-3 ${message.includes("success") ? "alert-success" : "alert-danger"}`} role="alert">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
