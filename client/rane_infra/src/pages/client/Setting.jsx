import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaBuilding, FaIdCard, FaUniversity, FaKey,
  FaUpload, FaFilePdf, FaEye, FaEyeSlash
} from 'react-icons/fa';
import ClientHeader from '../../component/header/ClientHeader';
import dummyUser from "../../assets/images/dummyUser.jpeg";
import { updateUser } from '../../services/userServices';
import { CLOUDINARY_URL_IMAGE } from '../../store/keyStore';
import { CLOUD_NAME } from '../../store/keyStore';
import MaintainencePage from '../MaintainencePage';

import { UPLOAD_PRESET } from '../../store/keyStore'; // ← Replace with actual value from Cloudinary


export default function SettingPage() {
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [profileFile, setProfileFile] = useState(null);

  const { user } = useAuthStore();

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

  const handleProfileUpload = async () => {
    if (!profileFile) return alert("Please select an image first.");

    const formData = new FormData();
    formData.append("file", profileFile);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      // Upload to Cloudinary
      const cloudRes = await fetch(CLOUDINARY_URL_IMAGE, {
        method: "POST",
        body: formData,
      });
      const cloudData = await cloudRes.json();

      // Update backend with new profile image URL
      const updatedData = { ...formData, id: user._id, profile: cloudData.secure_url };
      await updateUser(updatedData);

      alert("Profile picture updated!");
      window.location.reload(); // optional: refresh to reflect new image
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to update profile picture.");
    }
  };

  useEffect(() => {
    if (profileFile) handleProfileUpload();
  }, [profileFile]);


  return (
    <>
      <ClientHeader />
      <div className="container-fluid mt-4 mb-5 p-4" style={{
        backgroundColor: 'var(--client-component-bg-color)',
        color: 'var(--client-text-color)',
        border: '1px solid var(--client-border-color)',
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
            <MaintainencePage></MaintainencePage>
          </div>
          {/* <div className="tab-pane fade" id="documentupload">
            <div className="card p-4 mb-4 shadow-sm" style={{ border: 'none' }}>
              <h6 className="mb-3 fw-semibold text-primary">Document Upload</h6>
              <div className="row g-4">
                {[
                  ['Aadhar Card', 'Not Provided', 'aadhar.pdf'],
                  ['PAN Card', 'ABCDE1234F', 'pan.pdf']
                ].map(([title, number, file], i) => (
                  <div className="col-md-6" key={i}>
                    <div className="card p-3 shadow-sm">
                      <h6><FaIdCard className="me-2 text-danger" /> {title}</h6>
                      <input type="text" className="form-control my-2" defaultValue={number} />
                      <div className="bg-light text-center p-3 border rounded">
                        <FaFilePdf size={40} className="text-danger mb-2" />
                        <p className="mb-0">{file}</p>
                        <small className="text-muted">Uploaded 2 months ago</small>
                      </div>
                      <div className="d-flex justify-content-between mt-3">
                        <button className="btn btn-outline-primary btn-sm">
                          <FaUpload className="me-1" /> Upload / Update
                        </button>
                        <button className="btn btn-outline-secondary btn-sm">View Document</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div> */}

          {/* SECURITY (Static) */}
          <div className="tab-pane fade" id="security">
           <MaintainencePage></MaintainencePage>
          </div>
          {/* <div className="tab-pane fade" id="security">
            <div className="card p-4 shadow-sm" style={{ border: 'none' }}>
              <h6 className="mb-3 fw-semibold text-warning"><FaKey className="me-2" /> Security</h6>
              {[
                ['Current Password', showPass, setShowPass],
                ['New Password', showNewPass, setShowNewPass],
                ['Confirm Password', showConfirmPass, setShowConfirmPass]
              ].map(([label, state, setState], i) => (
                <div className="mb-3" key={i}>
                  <label className="form-label">{label}</label>
                  <div className="input-group">
                    <input type={state ? 'text' : 'password'} className="form-control" />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setState(!state)}
                    >
                      {state ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              ))}
              <button className="btn mt-2" style={{
                backgroundColor: 'var(--client-btn-bg)',
                color: 'var(--client-btn-text)'
              }}>
                Update Password
              </button>
            </div>
          </div> */}

        </div>
      </div>
    </>
  );
}
