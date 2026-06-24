import React, { useEffect, useState } from "react";
import AdminHeader from "../../component/header/AdminHeader";
import { backend_url } from "../../store/keyStore";
import DeleteUserModal from "../../assets/cards/models/DeleteUserModal";
import SafeKeyGuard from '../../component/models/SafeKeyGuard';
import { FaUser, FaUsers, FaTrash } from "react-icons/fa";
import { FiSearch, FiX } from "react-icons/fi";

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelCellStyle = {
  padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
};
const cellStyle = { padding: '10px 12px', whiteSpace: 'nowrap', color: 'var(--foreground)' };
const controlStyle = {
  border: '1px solid var(--border)', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, color: 'var(--foreground)',
  background: 'var(--input)', outline: 'none', boxSizing: 'border-box',
};

// Truncated cell with native tooltip
const Trunc = ({ text, max = 30, width = 180 }) => {
  if (!text && text !== 0) return <span style={{ color: 'var(--text-muted)' }}>-</span>;
  const str = String(text);
  if (str.length <= max) return <span>{str}</span>;
  return (
    <span title={str} style={{ maxWidth: width, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', verticalAlign: 'bottom' }}>
      {str}
    </span>
  );
};

export default function AllUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = () => {
    fetch(`${backend_url}/admin-get-users`)
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${backend_url}/admin-delete-user/${selectedUser._id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (res.ok) {
        setShowDeleteModal(false);
        fetchUsers();
      } else {
        alert(result.message || "Failed to delete user");
      }
    } catch (error) {
      alert("Something went wrong while deleting user.");
    }
  };

  const displayValue = (val) => (val ? val : "-");
  const formatDate = (date) => (date ? new Date(date).toLocaleString() : "-");

  // Filter users by name, email, phoneNo, or firmName
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.phoneNo?.toLowerCase().includes(term) ||
      user.firmName?.toLowerCase().includes(term)
    );
  });

  const link = (href) => href
    ? <a href={href} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>View</a>
    : <span style={{ color: 'var(--text-muted)' }}>-</span>;

  const headers = [
    '#', 'Name', 'Email', 'Phone', 'Firm', 'GST No', 'Address', 'User Type', 'Client Type',
    'Verified', 'Profile', 'Aadhar No', 'Aadhar Link', 'Aadhar Updated', 'PAN No', 'PAN Link',
    'PAN Updated', 'UPI', 'Bank Name', 'IFSC', 'Account No', 'Last Login', 'Role', 'User ID',
    'Password', 'Reset Token', 'Reset Expiry', 'Verify Token', 'Verify Expiry', 'Actions',
  ];

  return (
    <>
      <AdminHeader />
      <SafeKeyGuard>
        <DeleteUserModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          user={selectedUser}
        />

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
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8, background: 'var(--warning)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <FaUsers size={16} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                    All Users
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                    Complete records of every user in the system
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                background: 'var(--muted)', padding: '4px 12px', borderRadius: 20,
              }}>
                {users.length} total
              </span>
            </div>

            <div style={{ padding: '16px 20px' }}>

              {/* ── Search ── */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 420, minWidth: 220 }}>
                  <FiSearch size={14} color="var(--muted-foreground)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or firm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ ...controlStyle, width: '100%', paddingLeft: 33, paddingRight: searchTerm ? 32 : 12 }}
                  />
                  {searchTerm && (
                    <FiX size={14} color="var(--muted-foreground)" onClick={() => setSearchTerm('')}
                      style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} />
                  )}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Showing <strong style={{ color: 'var(--text-strong)' }}>{filteredUsers.length}</strong> of{' '}
                  <strong style={{ color: 'var(--text-strong)' }}>{users.length}</strong> users
                </span>
              </div>

              {/* ── Loading ── */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <span style={{
                    display: 'inline-block', width: 32, height: 32,
                    border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
                    borderRadius: '50%', animation: 'spin 1s linear infinite',
                  }} />
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>Loading users…</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: 1900, borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'var(--muted)', borderBottom: '2px solid var(--border)' }}>
                        {headers.map(h => <th key={h} style={labelCellStyle}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                          <tr key={user._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {/* # */}
                            <td style={cellStyle}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 26, height: 26, borderRadius: '50%',
                                background: 'var(--secondary)', color: 'var(--secondary-foreground)',
                                fontWeight: 700, fontSize: 11,
                              }}>{index + 1}</span>
                            </td>

                            {/* Name (avatar + name (role)) */}
                            <td style={cellStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {user.profile ? (
                                  <img src={user.profile} alt={user.name || 'Profile'} width="28" height="28"
                                    className="rounded-circle" style={{ objectFit: 'cover', border: '1px solid var(--border)' }} />
                                ) : (
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: 28, height: 28, borderRadius: '50%', background: 'var(--muted)',
                                    color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: '0.75rem',
                                  }}>
                                    <FaUser size={12} color="var(--muted-foreground)" />
                                  </span>
                                )}
                                <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{`${user.name} (${user.role})`}</span>
                              </div>
                            </td>

                            <td style={cellStyle}>{displayValue(user.email)}</td>
                            <td style={cellStyle}>{displayValue(user.phoneNo)}</td>
                            <td style={cellStyle}>{displayValue(user.firmName)}</td>
                            <td style={cellStyle}>{displayValue(user.gstno)}</td>
                            <td style={cellStyle}><Trunc text={user.address} max={30} width={180} /></td>
                            <td style={cellStyle}>{displayValue(user.usertype)}</td>
                            <td style={cellStyle}>{displayValue(user.clientType)}</td>

                            {/* Verified */}
                            <td style={cellStyle}>
                              {user.isverified ? (
                                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'var(--success)', color: 'var(--success-foreground)' }}>Yes</span>
                              ) : (
                                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#fde8e6', color: 'var(--destructive)' }}>No</span>
                              )}
                            </td>

                            {/* Profile image */}
                            <td style={cellStyle}>
                              {user.profile ? (
                                <img src={user.profile} alt="Profile" width="40" height="40" className="rounded-circle" style={{ objectFit: 'cover', border: '1px solid var(--border)' }} />
                              ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                            </td>

                            <td style={cellStyle}>{displayValue(user.idproof?.aadhar?.number)}</td>
                            <td style={cellStyle}>{link(user.idproof?.aadhar?.link)}</td>
                            <td style={cellStyle}>{formatDate(user.idproof?.aadhar?.lastUpdate)}</td>
                            <td style={cellStyle}>{displayValue(user.idproof?.pan?.number)}</td>
                            <td style={cellStyle}>{link(user.idproof?.pan?.link)}</td>
                            <td style={cellStyle}>{formatDate(user.idproof?.pan?.lastUpdate)}</td>
                            <td style={cellStyle}>{displayValue(user.upi)}</td>
                            <td style={cellStyle}>{displayValue(user.bankName)}</td>
                            <td style={cellStyle}>{displayValue(user.ifscCode)}</td>
                            <td style={cellStyle}>{displayValue(user.accountNo)}</td>
                            <td style={cellStyle}>{formatDate(user.lastlogin)}</td>
                            <td style={cellStyle}>{displayValue(user.role)}</td>
                            <td style={cellStyle}><Trunc text={user._id} max={14} width={120} /></td>
                            <td style={cellStyle}><Trunc text={user.password} max={14} width={120} /></td>
                            <td style={cellStyle}><Trunc text={user.resetPasswordToken} max={14} width={120} /></td>
                            <td style={cellStyle}>{formatDate(user.resetPasswordExpiresAt)}</td>
                            <td style={cellStyle}><Trunc text={user.VerificationToken} max={14} width={120} /></td>
                            <td style={cellStyle}>{formatDate(user.VerificationTokenExpiresAt)}</td>

                            {/* Actions */}
                            <td style={cellStyle}>
                              <button
                                onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 5,
                                  padding: '6px 12px', borderRadius: 7, border: 'none',
                                  background: 'var(--destructive)', color: 'var(--destructive-foreground)',
                                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                }}
                              >
                                <FaTrash size={11} color="var(--destructive-foreground)" /> Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={headers.length} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </SafeKeyGuard>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}