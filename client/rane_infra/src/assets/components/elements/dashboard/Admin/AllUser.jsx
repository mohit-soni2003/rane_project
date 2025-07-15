import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { backend_url } from "../../../../../store/keyStore";
import DeleteUserModal from "../../../../cards/models/DeleteUserModal";

export default function AllUser() {
  const [users, setUsers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = () => {
    fetch(`${backend_url}/admin-get-users`)
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.users);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
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
        fetchUsers(); // Refresh the list
      } else {
        alert(result.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="container mt-4">
      <DeleteUserModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        user={selectedUser}
      />
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>_id</th>
              <th>Name</th>
              <th>Email</th>
              <th>Password</th>
              <th>Profile</th>
              <th>User Type</th>
              <th>Client Type</th>
              <th>CID</th>
              <th>Phone No</th>
              <th>Address</th>
              <th>Firm Name</th>
              <th>GST No</th>
              <th>ID Proof</th>
              <th>ID Proof Type</th>
              <th>UPI</th>
              <th>Bank Name</th>
              <th>IFSC</th>
              <th>Account No.</th>
              <th>Last Login</th>
              <th>Verified</th>
              <th>Reset Token</th>
              <th>Reset Expiry</th>
              <th>Verify Token</th>
              <th>Verify Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>{user._id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.password}</td>
                  <td>
                    <img
                      src={user.profile}
                      alt="Profile"
                      width="50"
                      height="50"
                      className="rounded-circle"
                    />
                  </td>
                  <td>{user.usertype || "N/A"}</td>
                  <td>{user.clientType || "N/A"}</td>
                  <td>{user.cid || "N/A"}</td>
                  <td>{user.phoneNo || "N/A"}</td>
                  <td>{user.address || "N/A"}</td>
                  <td>{user.firmName || "N/A"}</td>
                  <td>{user.gstno || "N/A"}</td>
                  <td>{user.idproof || "N/A"}</td>
                  <td>{user.idProofType || "N/A"}</td>
                  <td>{user.upi || "N/A"}</td>
                  <td>{user.bankName || "N/A"}</td>
                  <td>{user.ifscCode || "N/A"}</td>
                  <td>{user.accountNo || "N/A"}</td>
                  <td>{new Date(user.lastlogin).toLocaleString()}</td>
                  <td>
                    {user.isverified ? (
                      <span className="badge bg-success">Verified</span>
                    ) : (
                      <span className="badge bg-danger">Not Verified</span>
                    )}
                  </td>
                  <td>{user.resetPasswordToken || "N/A"}</td>
                  <td>
                    {user.resetPasswordExpiresAt
                      ? new Date(user.resetPasswordExpiresAt).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>{user.VerificationToken || "N/A"}</td>
                  <td>
                    {user.VerificationTokenExpiresAt
                      ? new Date(user.VerificationTokenExpiresAt).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteModal(true);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="26" className="text-center">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
