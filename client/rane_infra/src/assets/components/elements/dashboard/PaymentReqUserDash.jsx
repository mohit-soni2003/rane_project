import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import "./PaymentReqUserDash.css";
import { backend_url, UPLOAD_PRESET, CLOUDINARY_URL_IMAGE, CLOUD_NAME } from "../../store/keyStore";

export default function PaymentReqUserDash() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    tender: "",
    amount: "",
    description: "",
    image: null,
    paymentType:"",
    user: user._id,
    image_url: null, // This should persist across form submissions
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file, image_url: null }); // Reset image_url on new file selection
    }
  };

  // Uploading image to Cloudinary
  const handleImageUpdate = async () => {
    if (!formData.image) {
      return formData.image_url; // Use existing URL if no new image is selected
    }

    const data = new FormData();
    data.append("file", formData.image);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("cloud_name", CLOUD_NAME);

    try {
      const response = await fetch(CLOUDINARY_URL_IMAGE, {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error("Image upload failed: " + response.statusText);
      }

      const result = await response.json();
      return result.secure_url || result.url; // Use secure_url if available
    } catch (err) {
      console.error("Error uploading file:", err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload image if a new one is selected, otherwise use existing image_url
      const uploadedImageUrl = await handleImageUpdate();

      if (!uploadedImageUrl) {
        throw new Error("Failed to get uploaded image URL");
      }

      console.log("Final Image URL:", uploadedImageUrl); // Debug log

      // Now submit form data with the uploaded image URL
      const response = await fetch(`${backend_url}/post-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tender: formData.tender,
          amount: formData.amount,
          description: formData.description,
          user: formData.user,
          paymentType:formData.paymentType,
          image_url: uploadedImageUrl, // Ensure image_url is correctly set
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Payment submitted successfully!");
        setFormData({
          ...formData,
          amount: "",
          description: "",
          image: null, // Reset image field
          image_url: uploadedImageUrl, // Retain last uploaded image URL
        });
      } else {
        setMessage(result.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      setMessage("Server error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="payment-req-user-dash">
      <form className="payment-req-form" onSubmit={handleSubmit}>

        <label>Select Payment Type</label>
        <select name="paymentType" value={formData.paymentType} onChange={handleChange}>
          <option value="">Select</option>
          <option value="IP">Immediate Payment(IP)</option>
          <option value="IPR">Immediate Payment Request(IPR)</option>
        </select>
        <label>Select Tender</label>
        <select name="tender" value={formData.tender} onChange={handleChange}>
          <option value="">Select</option>
          <option value="RTM-2024-25-69">RTM-2024-25-69</option>
        </select>

        <label>Amount</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Enter amount less than 5000"
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter details"
          required
        ></textarea>

        <label>Upload File</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <button className="submit-btn" type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Request"}
        </button>

        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
}
