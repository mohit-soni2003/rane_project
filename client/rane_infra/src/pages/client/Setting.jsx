import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaBuilding, FaIdCard, FaUniversity, FaKey,
  FaUpload, FaFilePdf, FaEye, FaEyeSlash
} from 'react-icons/fa';
import AdminHeader from "../../component/header/AdminHeader";
import ClientHeader from "../../component/header/ClientHeader";
import StaffHeader from "../../component/header/StaffHeader";
import dummyUser from "../../assets/images/dummyUser.jpeg";
import { updateUser, changePassword, updateIdProof } from '../../services/userServices';
import { CLOUDINARY_URL_IMAGE, CLOUDINARY_URL } from '../../store/keyStore';
import { CLOUD_NAME } from '../../store/keyStore';
import MaintainencePage from '../MaintainencePage';

import { UPLOAD_PRESET } from '../../store/keyStore'; // ← Replace with actual value from Cloudinary


export default function SettingPage() {
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [profileFile, setProfileFile] = useState(null);

  const { user } = useAuthStore();

  const getHeaderComponent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminHeader />;
      case 'client':
        return <ClientHeader />;
      case 'staff':
        return <StaffHeader />;
      default:
        return <AdminHeader />; // fallback
    }
  };

  const [formData, setFormData] = useState({
    id: user._id,
    name: user.name || '',
    email: user.email || '',
    phoneNo: user.phoneNo || '',
    firmName: user.firmName || '',
    gstno: user.gstno || '',
    address: user.address || '',
    bankName: user.bankName || '',
    ifscCode: user.ifscCode || '',
    accountNo: user.accountNo || '',
    upi: user.upi || '',
    accountType: user.accountType || 'saving', // Default to saving
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [safePasswords, setSafePasswords] = useState({
    oldSafeKey: "",
    newSafeKey: "",
  });

  const [documents, setDocuments] = useState({
    aadhar: { number: user?.idproof?.aadhar?.number || "", link: user?.idproof?.aadhar?.link || "" },
    pan: { number: user?.idproof?.pan?.number || "", link: user?.idproof?.pan?.link || "" },
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const result = await updateUser(formData);
      alert("User updated successfully!");
    } catch (err) {
      alert("Failed to update user.");
    }
  };

  // PROFILE UPLOAD - use uploadData variable name to avoid shadowing `formData`
  const handleProfileUpload = async () => {
    if (!profileFile) return alert("Please select an image first.");

    const uploadData = new FormData();
    uploadData.append("file", profileFile);
    uploadData.append("upload_preset", UPLOAD_PRESET);

    try {
      // Use same Cloudinary URL you used successfully for profile images
      const cloudRes = await fetch(CLOUDINARY_URL_IMAGE, {
        method: "POST",
        body: uploadData,
      });
      const cloudData = await cloudRes.json();

      if (!cloudData?.secure_url) throw new Error("Cloudinary upload failed");

      // Prepare update payload and call updateUser
      const updatedUserData = { id: user._id, profile: cloudData.secure_url };
      await updateUser(updatedUserData);

      alert("Profile picture updated!");
      // optionally reload or update user in store
      window.location.reload();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to update profile picture.");
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }
    try {
      const res = await changePassword(passwords.currentPassword, passwords.newPassword);
      alert(res.message || "Password updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert(err.message || "Failed to change password");
    }
  };

// DOCUMENT UPLOAD (aadhar / pan)
const handleDocUpload = async (type, file) => {
  if (!file) return alert("Please select a file first");

  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("upload_preset", UPLOAD_PRESET);

  try {
    // Upload to Cloudinary (use the same working URL constant)
    const cloudRes = await fetch(CLOUDINARY_URL_IMAGE, {
      method: "POST",
      body: uploadData,
    });
    const cloudData = await cloudRes.json();
    if (!cloudData?.secure_url) throw new Error("Cloudinary upload failed");

    // Build payload expected by backend: { aadhar: {...} } or { pan: {...} }
    const payload = {
      [type]: {
        number: documents[type].number || "", // use whatever user entered
        link: cloudData.secure_url,
      },
    };

    // Call backend and pass id + payload via service
    const res = await updateIdProof(user._id, payload);
    console.log("updateIdProof response:", res);

    if (res?.idproof) {
      // backend returns idproof object -> keep UI in sync
      setDocuments({
        aadhar: {
          number: res.idproof?.aadhar?.number || "",
          link: res.idproof?.aadhar?.link || "",
        },
        pan: {
          number: res.idproof?.pan?.number || "",
          link: res.idproof?.pan?.link || "",
        },
      });
      alert(`${type.toUpperCase()} updated successfully!`);
    } else {
      alert("Document updated, but server didn't return updated data.");
    }
  } catch (err) {
    console.error("Document upload failed:", err);
    alert("Failed to upload document");
  }
};




  useEffect(() => {
    if (profileFile) handleProfileUpload();
  }, [profileFile]);


  return (
    <>
      {getHeaderComponent()}
      <div className="container-fluid mt-3  p-4" style={{
        backgroundColor: 'var(--background)',
        borderRadius:"15px"
      }}>
        <h5 className="mb-4 fw-bold" style={{ color: 'var(--client-heading-color)' }}>
          <FaKey className="me-2" /> Settings{' '}
          <span className="fw-normal" style={{ color: 'var(--client-muted-color)' }}>
            | Manage your profile, security, and documents with ease
          </span>
        </h5>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          {['Profile', 'Personal Details', 'Bank Details', 'Document Upload', 'Security'].map((tab, i) => (
            <li className="nav-item" key={i}>
              <a
                className={`nav-link ${i === 0 ? 'active' : ''}`}
                data-bs-toggle="tab"
                href={`#${tab.toLowerCase().replace(/ /g, '')}`}
                style={{ color: 'var(--client-text-color)' }}
              >
                {tab}
              </a>
            </li>
          ))}
        </ul>

        <div className="tab-content">
          {/* PROFILE */}
          <div className="tab-pane fade show active" id="profile">
            <div className="text-center mb-4">
              <img
                src={user.profile ? user.profile : dummyUser}
                className="rounded-circle shadow-sm object-cover"
                alt="Profile"
                style={{ width: "280px", height: "280px" }}
              />

              <h6 className="mt-2 fw-semibold">{formData.name}</h6>
              <p className="text-muted">{user.cid}</p>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="profileUpload"
                onChange={(e) => setProfileFile(e.target.files[0])}
              />
              <label htmlFor="profileUpload" className="btn btn-sm" style={{
                border: '1px solid var(--client-btn-bg)',
                color: 'var(--client-btn-bg)',
                cursor: 'pointer'
              }}>
                <FaUpload className="me-2" /> Update Profile Picture
              </label>

            </div>
          </div>

          {/* PERSONAL DETAILS */}
          <div className="tab-pane fade" id="personaldetails">
            <div className="card p-4 mb-4 shadow-sm" style={{ border: 'none' }}>
              <h6 className="mb-3 fw-semibold text-primary">Personal Details</h6>
              <div className="row g-3">
                {[
                  ['Full Name', FaUser, 'name'],
                  ['Email', FaEnvelope, 'email'],
                  ['Phone', FaPhone, 'phoneNo'],
                  ['Firm Name', FaBuilding, 'firmName'],
                  ['GST Number', FaIdCard, 'gstno'],
                ].map(([label, Icon, key], i) => (
                  <div className="col-md-6" key={i}>
                    <label className="form-label">
                      <Icon className="me-1" /> {label}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData[key]}
                      onChange={handleChange(key)}
                    />
                  </div>
                ))}
                <div className="col-12">
                  <label className="form-label">
                    <FaMapMarkerAlt className="me-1" /> Address
                  </label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.address}
                    onChange={handleChange('address')}
                  ></textarea>
                </div>
              </div>
              <button className="btn mt-3" onClick={handleSave} style={{
                backgroundColor: 'var(--client-btn-bg)',
                color: 'var(--client-btn-text)',
              }}>
                Save Changes
              </button>
            </div>
          </div>

          {/* BANK DETAILS */}
          <div className="tab-pane fade" id="bankdetails">
            <div className="card p-4 mb-4 shadow-sm" style={{ border: 'none' }}>
              <h6 className="mb-3 fw-semibold text-primary">Bank Details</h6>
              <div className="row g-3">
                {[
                  ['Bank Name', FaUniversity, 'bankName'],
                  ['IFSC Code', FaKey, 'ifscCode'],
                  ['Account Number', FaIdCard, 'accountNo'],
                  ['UPI ID', FaEnvelope, 'upi'],
                ].map(([label, Icon, key], i) => (
                  <div className="col-md-6" key={i}>
                    <label className="form-label">
                      <Icon className="me-1" /> {label}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData[key]}
                      onChange={handleChange(key)}
                    />
                  </div>
                ))}
                <div className="col-md-6">
                  <label className="form-label">
                    <FaIdCard className="me-1" /> Account Type
                  </label>
                  <select
                    className="form-control"
                    value={formData.accountType}
                    onChange={handleChange('accountType')}
                  >
                    <option value="saving">Saving Account</option>
                    <option value="current">Current Account</option>
                  </select>
                </div>
              </div>
              <button className="btn mt-3" onClick={handleSave} style={{
                backgroundColor: 'var(--client-btn-bg)',
                color: 'var(--client-btn-text)',
              }}>
                Update Bank Details
              </button>
            </div>
          </div>

          {/* DOCUMENTS (Static) */}

          <div className="tab-pane fade" id="documentupload">
            <div className="card p-4 mb-4 shadow-sm" style={{ border: 'none' }}>
              <h6 className="mb-3 fw-semibold text-primary">Document Upload</h6>
              <div className="row g-4">

                {/* Aadhaar */}
                <div className="col-md-6">
                  <div className="card p-3 shadow-sm">
                    <h6><FaIdCard className="me-2 text-danger" /> Aadhar Card</h6>
                    <input
                      type="text"
                      className="form-control my-2"
                      value={documents.aadhar.number}
                      onChange={(e) =>
                        setDocuments({ ...documents, aadhar: { ...documents.aadhar, number: e.target.value } })
                      }
                      placeholder="Enter Aadhar Number"
                    />
                    {documents.aadhar.link ? (
                      <div className="bg-light text-center p-3 border rounded">
                        <FaFilePdf size={40} className="text-danger mb-2" />
                        <p className="mb-0">Aadhar.pdf</p>
                        <a href={documents.aadhar.link} target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-sm mt-2">
                          View Document
                        </a>
                      </div>
                    ) : <small className="text-muted">No document uploaded</small>}

                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      style={{ display: "none" }}
                      id="aadharUpload"
                      onChange={(e) => handleDocUpload("aadhar", e.target.files[0])}
                    />
                    <label htmlFor="aadharUpload" className="btn btn-outline-primary btn-sm mt-3">
                      <FaUpload className="me-1" /> Upload / Update
                    </label>
                  </div>
                </div>

                {/* PAN */}
                <div className="col-md-6">
                  <div className="card p-3 shadow-sm">
                    <h6><FaIdCard className="me-2 text-danger" /> PAN Card</h6>
                    <input
                      type="text"
                      className="form-control my-2"
                      value={documents.pan.number}
                      onChange={(e) =>
                        setDocuments({ ...documents, pan: { ...documents.pan, number: e.target.value } })
                      }
                      placeholder="Enter PAN Number"
                    />
                    {documents.pan.link ? (
                      <div className="bg-light text-center p-3 border rounded">
                        <FaFilePdf size={40} className="text-danger mb-2" />
                        <p className="mb-0">PAN.pdf</p>
                        <a href={documents.pan.link} target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-sm mt-2">
                          View Document
                        </a>
                      </div>
                    ) : <small className="text-muted">No document uploaded</small>}

                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      style={{ display: "none" }}
                      id="panUpload"
                      onChange={(e) => handleDocUpload("pan", e.target.files[0])}
                    />
                    <label htmlFor="panUpload" className="btn btn-outline-primary btn-sm mt-3">
                      <FaUpload className="me-1" /> Upload / Update
                    </label>
                  </div>
                </div>

              </div>
            </div>
          </div>


          {/* SECURITY (Static) */}

          <div className="tab-pane fade" id="security">
            <div className="card p-4 shadow-sm" style={{ border: 'none' }}>
              <h6 className="mb-3 fw-semibold text-warning"><FaKey className="me-2" /> Security</h6>
              {/* Current Password */}
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <div className="input-group">
                  <input
                    type={showPass ? "text" : "password"}
                    className="form-control"
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, currentPassword: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <div className="input-group">
                  <input
                    type={showNewPass ? "text" : "password"}
                    className="form-control"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, newPassword: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowNewPass(!showNewPass)}
                  >
                    {showNewPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <div className="input-group">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    className="form-control"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirmPassword: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                  >
                    {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Update Password Button */}
              <button
                className="btn mt-2"
                style={{ backgroundColor: 'var(--client-btn-bg)', color: 'var(--client-btn-text)' }}
                onClick={handlePasswordUpdate}
              >
                Update Password
              </button>

              {/* Safe Password Section - Admin Only */}
              {user.role === 'admin' && (
                <>
                  <hr className="my-4" />
                  <h6 className="mb-3 fw-semibold text-danger"><FaKey className="me-2" /> Safe Password</h6>
                  
                  {/* Old Safe Key */}
                  <div className="mb-3">
                    <label className="form-label">Old Safe Key</label>
                    <input
                      type="password"
                      className="form-control"
                      value={safePasswords.oldSafeKey}
                      onChange={(e) =>
                        setSafePasswords({ ...safePasswords, oldSafeKey: e.target.value })
                      }
                      placeholder="Enter current safe key"
                    />
                  </div>

                  {/* New Safe Key */}
                  <div className="mb-3">
                    <label className="form-label">New Safe Key</label>
                    <input
                      type="password"
                      className="form-control"
                      value={safePasswords.newSafeKey}
                      onChange={(e) =>
                        setSafePasswords({ ...safePasswords, newSafeKey: e.target.value })
                      }
                      placeholder="Enter new safe key"
                    />
                  </div>

                  {/* Update Safe Key Button */}
                  <button
                    className="btn mt-2"
                    style={{ backgroundColor: 'var(--client-btn-bg)', color: 'var(--client-btn-text)' }}
                    onClick={() => alert('Safe key update functionality will be implemented later')}
                  >
                    Update Safe Key
                  </button>
                </>
              )}

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
