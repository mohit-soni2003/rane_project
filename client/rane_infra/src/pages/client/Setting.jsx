import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaBuilding, FaIdCard, FaUniversity, FaKey,
  FaUpload, FaFilePdf, FaCog, FaShieldAlt, FaUserCircle,
  FaFileAlt, FaCheckCircle, FaTimes,
} from 'react-icons/fa';
import AdminHeader from "../../component/header/AdminHeader";
import ClientHeader from "../../component/header/ClientHeader";
import StaffHeader from "../../component/header/StaffHeader";
import dummyUser from "../../assets/images/dummyUser.jpeg";
import { updateUser, changePassword, updateIdProof } from '../../services/userServices';
import { CLOUDINARY_URL_IMAGE, CLOUDINARY_URL } from '../../store/keyStore';
import { CLOUD_NAME } from '../../store/keyStore';
import MaintainencePage from '../MaintainencePage';
import { UPLOAD_PRESET } from '../../store/keyStore';

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = {
  primary: '#6b3e2b',
  accent: '#b95a52',
  success: '#225b31',
  destructive: '#c94a3a',
  muted: '#8b7b74',
  warning: '#4a1f18',
};

// Show/hide eye toggle (react-icons FaEye is unreliable in this build — inline text-free toggle)
const EyeToggle = ({ shown }) => (
  <span style={{ fontSize: 12, fontWeight: 600, color: C.primary, userSelect: 'none' }}>
    {shown ? 'Hide' : 'Show'}
  </span>
);

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block',
  marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
};
const controlStyle = {
  width: '100%', border: '1px solid var(--border)', borderRadius: 8,
  padding: '9px 12px', fontSize: 13.5, color: 'var(--foreground)',
  background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
};
const cardStyle = {
  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
  padding: '18px 20px', marginBottom: 14, boxShadow: '0 2px 8px var(--shadow-color)',
};
const sectionTitleStyle = {
  fontWeight: 700, fontSize: 14, color: 'var(--text-strong)', marginBottom: 4,
};
const sectionSubStyle = { fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 };
const gridTwo = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14,
};
const primaryBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '9px 18px', borderRadius: 8, border: 'none',
  background: 'var(--primary)', color: '#fff',
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
const outlineBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '8px 14px', borderRadius: 8, border: '1px solid var(--primary)',
  background: 'var(--secondary)', color: C.primary,
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

const TABS = [
  { key: 'profile', label: 'Profile', icon: FaUserCircle },
  { key: 'personal', label: 'Personal Details', icon: FaUser },
  { key: 'bank', label: 'Bank Details', icon: FaUniversity },
  { key: 'documents', label: 'Documents', icon: FaFileAlt },
  { key: 'security', label: 'Security', icon: FaShieldAlt },
];

// ── Module-level components (defined once → inputs keep focus while typing) ───

const Field = ({ label, Icon, value, onChange, type = 'text' }) => (
  <div>
    <label style={labelStyle}>
      <Icon size={10} color={C.accent} style={{ marginRight: 5, verticalAlign: -1 }} />
      {label}
    </label>
    <input type={type} style={controlStyle} value={value} onChange={onChange} />
  </div>
);

const PasswordField = ({ label, value, onChange, shown, toggle }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={labelStyle}>{label}</label>
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        type={shown ? 'text' : 'password'}
        style={{ ...controlStyle, flex: 1 }}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={toggle}
        style={{
          border: '1px solid var(--border)', borderRadius: 8,
          background: 'var(--secondary)', padding: '0 14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
        }}
      >
        <EyeToggle shown={shown} />
      </button>
    </div>
  </div>
);

const DocCard = ({ title, type, placeholder, number, link, onNumberChange, onFileChange }) => (
  <div style={{ ...cardStyle, marginBottom: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <FaIdCard size={14} color={C.accent} />
      <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-strong)' }}>{title}</span>
    </div>

    <label style={labelStyle}>{title} number</label>
    <input
      type="text"
      style={{ ...controlStyle, marginBottom: 12 }}
      value={number}
      placeholder={placeholder}
      onChange={onNumberChange}
    />

    {link ? (
      <div style={{
        background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 10,
        padding: '16px', textAlign: 'center',
      }}>
        <FaFilePdf size={34} color={C.accent} style={{ marginBottom: 8 }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', marginBottom: 10 }}>
          {title} document
        </div>
        <a href={link} target="_blank" rel="noreferrer"
          style={{ ...outlineBtn, textDecoration: 'none', fontSize: 12, padding: '6px 12px' }}>
          View Document
        </a>
      </div>
    ) : (
      <div style={{
        background: 'var(--muted)', border: '1px dashed var(--border)', borderRadius: 10,
        padding: '16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)',
      }}>
        No document uploaded yet
      </div>
    )}

    <input
      type="file"
      accept="application/pdf,image/*"
      style={{ display: 'none' }}
      id={`${type}Upload`}
      onChange={onFileChange}
    />
    <label htmlFor={`${type}Upload`} style={{ ...outlineBtn, marginTop: 12, width: '100%', justifyContent: 'center' }}>
      <FaUpload size={12} color={C.primary} /> Upload / Update
    </label>
  </div>
);

export default function SettingPage() {
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState('profile');
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [profileFile, setProfileFile] = useState(null);
  const [toast, setToast] = useState({ type: '', text: '' });

  const notify = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: '', text: '' }), 3500);
  };

  const getHeaderComponent = () => {
    switch (user?.role) {
      case 'admin': return <AdminHeader />;
      case 'client': return <ClientHeader />;
      case 'staff': return <StaffHeader />;
      default: return <AdminHeader />;
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
    accountType: user.accountType || 'saving',
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
      notify('success', 'Details updated successfully!');
    } catch (err) {
      notify('error', 'Failed to update details.');
    }
  };

  const handleProfileUpload = async () => {
    if (!profileFile) return notify('error', 'Please select an image first.');
    const uploadData = new FormData();
    uploadData.append("file", profileFile);
    uploadData.append("upload_preset", UPLOAD_PRESET);
    try {
      const cloudRes = await fetch(CLOUDINARY_URL_IMAGE, { method: "POST", body: uploadData });
      const cloudData = await cloudRes.json();
      if (!cloudData?.secure_url) throw new Error("Cloudinary upload failed");
      const updatedUserData = { id: user._id, profile: cloudData.secure_url };
      await updateUser(updatedUserData);
      notify('success', 'Profile picture updated!');
      window.location.reload();
    } catch (error) {
      console.error("Upload failed:", error);
      notify('error', 'Failed to update profile picture.');
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      notify('error', 'New password and confirm password do not match!');
      return;
    }
    try {
      const res = await changePassword(passwords.currentPassword, passwords.newPassword);
      notify('success', res.message || 'Password updated successfully!');
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      notify('error', err.message || 'Failed to change password');
    }
  };

  const handleDocUpload = async (type, file) => {
    if (!file) return notify('error', 'Please select a file first');
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", UPLOAD_PRESET);
    try {
      const cloudRes = await fetch(CLOUDINARY_URL_IMAGE, { method: "POST", body: uploadData });
      const cloudData = await cloudRes.json();
      if (!cloudData?.secure_url) throw new Error("Cloudinary upload failed");
      const payload = {
        [type]: {
          number: documents[type].number || "",
          link: cloudData.secure_url,
        },
      };
      const res = await updateIdProof(user._id, payload);
      console.log("updateIdProof response:", res);
      if (res?.idproof) {
        setDocuments({
          aadhar: { number: res.idproof?.aadhar?.number || "", link: res.idproof?.aadhar?.link || "" },
          pan: { number: res.idproof?.pan?.number || "", link: res.idproof?.pan?.link || "" },
        });
        notify('success', `${type.toUpperCase()} updated successfully!`);
      } else {
        notify('success', "Document updated, but server didn't return updated data.");
      }
    } catch (err) {
      console.error("Document upload failed:", err);
      notify('error', 'Failed to upload document');
    }
  };

  useEffect(() => {
    if (profileFile) handleProfileUpload();
  }, [profileFile]);

  return (
    <>
      {getHeaderComponent()}

      <div style={{
        padding: '0 2px', fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--foreground)', background: 'var(--background)', minHeight: '100vh',
      }}>

        {/* ── Page card ── */}
        <div style={{
          background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)',
          boxShadow: '0 2px 10px var(--shadow-color)', overflow: 'hidden', marginBottom: 16,
        }}>

          {/* ── Title bar ── */}
          <div style={{
            borderBottom: '1px solid var(--border)', padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FaCog size={15} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                Settings
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                Manage your profile, security, and documents
              </div>
            </div>
          </div>

          {/* ── Tab nav ── */}
          <div style={{
            display: 'flex', gap: 4, padding: '12px 16px', flexWrap: 'wrap',
            borderBottom: '1px solid var(--border)', background: 'var(--muted)',
          }}>
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '8px 14px', borderRadius: 8, border: 'none',
                    background: active ? 'var(--primary)' : 'transparent',
                    color: active ? '#fff' : 'var(--foreground)',
                    fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                    transition: 'all .15s ease',
                  }}
                >
                  <Icon size={12} color={active ? '#fff' : C.accent} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* ── Tab content ── */}
          <div style={{ padding: '18px 20px' }}>

            {/* PROFILE */}
            {activeTab === 'profile' && (
              <div style={{ ...cardStyle, textAlign: 'center', marginBottom: 0 }}>
                <img
                  src={user.profile ? user.profile : dummyUser}
                  alt="Profile"
                  style={{
                    width: 160, height: 160, borderRadius: '50%', objectFit: 'cover',
                    border: '3px solid var(--secondary)', boxShadow: '0 2px 10px var(--shadow-color)',
                  }}
                />
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-strong)', marginTop: 14 }}>
                  {formData.name || 'Unnamed user'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {user.cid || user.role}
                </div>
                <input type="file" accept="image/*" style={{ display: 'none' }} id="profileUpload"
                  onChange={(e) => setProfileFile(e.target.files[0])} />
                <div style={{ marginTop: 16 }}>
                  <label htmlFor="profileUpload" style={{ ...outlineBtn, cursor: 'pointer' }}>
                    <FaUpload size={12} color={C.primary} /> Update Profile Picture
                  </label>
                </div>
              </div>
            )}

            {/* PERSONAL DETAILS */}
            {activeTab === 'personal' && (
              <div style={{ ...cardStyle, marginBottom: 0 }}>
                <div style={sectionTitleStyle}>Personal Details</div>
                <div style={sectionSubStyle}>Update your contact and firm information.</div>

                <div style={gridTwo}>
                  <Field label="Full Name" Icon={FaUser} value={formData.name} onChange={handleChange('name')} />
                  <Field label="Email" Icon={FaEnvelope} value={formData.email} onChange={handleChange('email')} type="email" />
                  <Field label="Phone" Icon={FaPhone} value={formData.phoneNo} onChange={handleChange('phoneNo')} />
                  <Field label="Firm Name" Icon={FaBuilding} value={formData.firmName} onChange={handleChange('firmName')} />
                  <Field label="GST Number" Icon={FaIdCard} value={formData.gstno} onChange={handleChange('gstno')} />
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={labelStyle}>
                    <FaMapMarkerAlt size={10} color={C.accent} style={{ marginRight: 5, verticalAlign: -1 }} />
                    Address
                  </label>
                  <textarea
                    rows={2}
                    style={{ ...controlStyle, resize: 'vertical', minHeight: 70, lineHeight: 1.5 }}
                    value={formData.address}
                    onChange={handleChange('address')}
                  />
                </div>

                <button style={{ ...primaryBtn, marginTop: 16 }} onClick={handleSave}>Save Changes</button>
              </div>
            )}

            {/* BANK DETAILS */}
            {activeTab === 'bank' && (
              <div style={{ ...cardStyle, marginBottom: 0 }}>
                <div style={sectionTitleStyle}>Bank Details</div>
                <div style={sectionSubStyle}>Used for processing your payments and salary.</div>

                <div style={gridTwo}>
                  <Field label="Bank Name" Icon={FaUniversity} value={formData.bankName} onChange={handleChange('bankName')} />
                  <Field label="IFSC Code" Icon={FaKey} value={formData.ifscCode} onChange={handleChange('ifscCode')} />
                  <Field label="Account Number" Icon={FaIdCard} value={formData.accountNo} onChange={handleChange('accountNo')} />
                  <Field label="UPI ID" Icon={FaEnvelope} value={formData.upi} onChange={handleChange('upi')} />
                  <div>
                    <label style={labelStyle}>
                      <FaIdCard size={10} color={C.accent} style={{ marginRight: 5, verticalAlign: -1 }} />
                      Account Type
                    </label>
                    <select style={{ ...controlStyle, cursor: 'pointer' }} value={formData.accountType} onChange={handleChange('accountType')}>
                      <option value="saving">Saving Account</option>
                      <option value="current">Current Account</option>
                    </select>
                  </div>
                </div>

                <button style={{ ...primaryBtn, marginTop: 16 }} onClick={handleSave}>Update Bank Details</button>
              </div>
            )}

            {/* DOCUMENTS */}
            {activeTab === 'documents' && (
              <div>
                <div style={{ ...sectionTitleStyle, marginBottom: 4 }}>Document Upload</div>
                <div style={sectionSubStyle}>Upload your Aadhar and PAN for verification.</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                  <DocCard
                    title="Aadhar Card" type="aadhar" placeholder="Enter Aadhar number"
                    number={documents.aadhar.number} link={documents.aadhar.link}
                    onNumberChange={(e) => setDocuments({ ...documents, aadhar: { ...documents.aadhar, number: e.target.value } })}
                    onFileChange={(e) => handleDocUpload('aadhar', e.target.files[0])}
                  />
                  <DocCard
                    title="PAN Card" type="pan" placeholder="Enter PAN number"
                    number={documents.pan.number} link={documents.pan.link}
                    onNumberChange={(e) => setDocuments({ ...documents, pan: { ...documents.pan, number: e.target.value } })}
                    onFileChange={(e) => handleDocUpload('pan', e.target.files[0])}
                  />
                </div>
              </div>
            )}

            {/* SECURITY */}
            {activeTab === 'security' && (
              <div style={{ ...cardStyle, marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <FaShieldAlt size={14} color={C.accent} />
                  <span style={sectionTitleStyle}>Change Password</span>
                </div>
                <div style={sectionSubStyle}>Keep your account secure with a strong password.</div>

                <div style={{ maxWidth: 460 }}>
                  <PasswordField
                    label="Current Password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    shown={showPass} toggle={() => setShowPass(!showPass)}
                  />
                  <PasswordField
                    label="New Password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    shown={showNewPass} toggle={() => setShowNewPass(!showNewPass)}
                  />
                  <PasswordField
                    label="Confirm Password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    shown={showConfirmPass} toggle={() => setShowConfirmPass(!showConfirmPass)}
                  />
                  <button style={primaryBtn} onClick={handlePasswordUpdate}>Update Password</button>
                </div>

                {/* Safe Password — Admin only */}
                {user.role === 'admin' && (
                  <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <FaKey size={14} color={C.destructive} />
                      <span style={{ ...sectionTitleStyle, color: C.destructive }}>Safe Password</span>
                    </div>
                    <div style={sectionSubStyle}>Admin-only secure key for sensitive operations.</div>

                    <div style={{ maxWidth: 460 }}>
                      <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Old Safe Key</label>
                        <input
                          type="password" style={controlStyle}
                          value={safePasswords.oldSafeKey}
                          placeholder="Enter current safe key"
                          onChange={(e) => setSafePasswords({ ...safePasswords, oldSafeKey: e.target.value })}
                        />
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>New Safe Key</label>
                        <input
                          type="password" style={controlStyle}
                          value={safePasswords.newSafeKey}
                          placeholder="Enter new safe key"
                          onChange={(e) => setSafePasswords({ ...safePasswords, newSafeKey: e.target.value })}
                        />
                      </div>
                      <button
                        style={primaryBtn}
                        onClick={() => notify('success', 'Safe key update functionality will be implemented later')}
                      >
                        Update Safe Key
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast.text && (
        <div style={{
          position: 'fixed', top: 18, right: 18, zIndex: 1080,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 16px', borderRadius: 10, maxWidth: 360,
          background: toast.type === 'success' ? 'var(--success)' : '#fde8e6',
          border: `1px solid ${toast.type === 'success' ? '#b6dfc4' : '#f5b8b2'}`,
          color: toast.type === 'success' ? C.success : C.destructive,
          fontSize: 13, fontWeight: 500, boxShadow: '0 4px 16px var(--shadow-color)',
        }}>
          {toast.type === 'success'
            ? <FaCheckCircle size={15} color={C.success} style={{ flexShrink: 0 }} />
            : <FaTimes size={15} color={C.destructive} style={{ flexShrink: 0 }} />}
          <span style={{ flex: 1 }}>{toast.text}</span>
          <FaTimes size={12} color={C.muted} style={{ cursor: 'pointer', flexShrink: 0 }}
            onClick={() => setToast({ type: '', text: '' })} />
        </div>
      )}
    </>
  );
}