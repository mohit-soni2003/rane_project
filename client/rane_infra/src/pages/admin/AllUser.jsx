import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Spinner,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import AdminHeader from "../../component/header/AdminHeader";
import { backend_url } from "../../store/keyStore";
import DeleteUserModal from "../../assets/cards/models/DeleteUserModal";
import SafeKeyGuard from '../../component/models/SafeKeyGuard';

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
  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : "-";

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
      <Container fluid className="py-4 px-0">
        <Card className="p-4 shadow border-0" style={{ backgroundColor: "var(--client-component-bg-color)" }}>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Search by name, email, phone, or firm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
          </Row>

          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table responsive bordered hover className="mb-3 align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Firm</th>
                  <th>GST No</th>
                  <th>Address</th>
                  <th>User Type</th>
                  <th>Client Type</th>
                  <th>Verified</th>
                  <th>Profile</th>
                  <th>Aadhar No</th>
                  <th>Aadhar Link</th>
                  <th>Aadhar Updated</th>
                  <th>PAN No</th>
                  <th>PAN Link</th>
                  <th>PAN Updated</th>
                  <th>UPI</th>
                  <th>Bank Name</th>
                  <th>IFSC</th>
                  <th>Account No</th>
                  <th>Last Login</th>
                  <th>Role</th>
                  <th>User ID</th>
                  <th>Password</th>
                  <th>Reset Token</th>
                  <th>Reset Expiry</th>
                  <th>Verify Token</th>
                  <th>Verify Expiry</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>{`${user.name} (${user.role})`}</td>
                      <td>{displayValue(user.email)}</td>
                      <td>{displayValue(user.phoneNo)}</td>
                      <td>{displayValue(user.firmName)}</td>
                      <td>{displayValue(user.gstno)}</td>
                      <td>{displayValue(user.address)}</td>
                      <td>{displayValue(user.usertype)}</td>
                      <td>{displayValue(user.clientType)}</td>
                      <td>
                        {user.isverified ? (
                          <span className="badge bg-success">Yes</span>
                        ) : (
                          <span className="badge bg-danger">No</span>
                        )}
                      </td>
                      <td>
                        {user.profile ? (
                          <img
                            src={user.profile}
                            alt="Profile"
                            width="40"
                            height="40"
                            className="rounded-circle"
                          />
                        ) : "-"}
                      </td>
                      <td>{displayValue(user.idproof?.aadhar?.number)}</td>
                      <td>
                        {user.idproof?.aadhar?.link ? (
                          <a href={user.idproof.aadhar.link} target="_blank" rel="noreferrer">View</a>
                        ) : "-"}
                      </td>
                      <td>{formatDate(user.idproof?.aadhar?.lastUpdate)}</td>
                      <td>{displayValue(user.idproof?.pan?.number)}</td>
                      <td>
                        {user.idproof?.pan?.link ? (
                          <a href={user.idproof.pan.link} target="_blank" rel="noreferrer">View</a>
                        ) : "-"}
                      </td>
                      <td>{formatDate(user.idproof?.pan?.lastUpdate)}</td>
                      <td>{displayValue(user.upi)}</td>
                      <td>{displayValue(user.bankName)}</td>
                      <td>{displayValue(user.ifscCode)}</td>
                      <td>{displayValue(user.accountNo)}</td>
                      <td>{formatDate(user.lastlogin)}</td>
                      <td>{displayValue(user.role)}</td>
                      <td>{user._id}</td>
                      <td>{displayValue(user.password)}</td>
                      <td>{displayValue(user.resetPasswordToken)}</td>
                      <td>{formatDate(user.resetPasswordExpiresAt)}</td>
                      <td>{displayValue(user.VerificationToken)}</td>
                      <td>{formatDate(user.VerificationTokenExpiresAt)}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="30" className="text-center">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card>
      </Container>
      </SafeKeyGuard>
    </>
  );
}






















// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Card,
//   Table,
//   Button,
//   Spinner,
// } from "react-bootstrap";
// import AdminHeader from "../../component/header/AdminHeader";
// import { backend_url } from "../../store/keyStore";
// import DeleteUserModal from "../../assets/cards/models/DeleteUserModal";

// export default function AllUser() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);

//   const fetchUsers = () => {
//     fetch(`${backend_url}/admin-get-users`)
//       .then((res) => res.json())
//       .then((data) => setUsers(data.users || []))
//       .catch((err) => console.error("Error fetching users:", err))
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleDelete = async () => {
//     if (!selectedUser) return;
//     try {
//       const res = await fetch(`${backend_url}/admin-delete-user/${selectedUser._id}`, {
//         method: "DELETE",
//       });
//       const result = await res.json();
//       if (res.ok) {
//         setShowDeleteModal(false);
//         fetchUsers();
//       } else {
//         alert(result.message || "Failed to delete user");
//       }
//     } catch (error) {
//       alert("Something went wrong while deleting user.");
//     }
//   };

//   const displayValue = (val) => (val ? val : "-");
//   const formatDate = (date) =>
//     date ? new Date(date).toLocaleString() : "-";

//   return (
//     <>
//       <AdminHeader />
//       <DeleteUserModal
//         show={showDeleteModal}
//         onClose={() => setShowDeleteModal(false)}
//         onConfirm={handleDelete}
//         user={selectedUser}
//       />
//       <Container fluid className="py-4 px-0">
//         <Card className="p-4 shadow border-0" style={{ backgroundColor: "var(--client-component-bg-color)" }}>
//           <h5 className="mb-3">All Users</h5>

//           {loading ? (
//             <div className="text-center my-5">
//               <Spinner animation="border" variant="primary" />
//             </div>
//           ) : (
//             <Table responsive bordered hover className="mb-3 align-middle">
//               <thead className="table-light">
//                 <tr>
//                   <th>#</th>
//                   <th>Name</th>
//                   <th>Email</th>
//                   <th>Phone</th>
//                   <th>Firm</th>
//                   <th>GST No</th>
//                   <th>Address</th>
//                   <th>User Type</th>
//                   <th>Client Type</th>
//                   <th>Verified</th>
//                   <th>Profile</th>

//                   <th>Aadhar No</th>
//                   <th>Aadhar Link</th>
//                   <th>Aadhar Updated</th>
//                   <th>PAN No</th>
//                   <th>PAN Link</th>
//                   <th>PAN Updated</th>

//                   <th>UPI</th>
//                   <th>Bank Name</th>
//                   <th>IFSC</th>
//                   <th>Account No</th>

//                   <th>Last Login</th>
//                   <th>Role</th>

//                   {/* Developer/internal info */}
//                   <th>User ID</th>
//                   <th>Password</th>
//                   <th>Reset Token</th>
//                   <th>Reset Expiry</th>
//                   <th>Verify Token</th>
//                   <th>Verify Expiry</th>

//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {users.length > 0 ? (
//                   users.map((user, index) => (
//                     <tr key={user._id}>
//                       <td>{index + 1}</td>
//                       <td>{displayValue(user.name)}</td>
//                       <td>{displayValue(user.email)}</td>
//                       <td>{displayValue(user.phoneNo)}</td>
//                       <td>{displayValue(user.firmName)}</td>
//                       <td>{displayValue(user.gstno)}</td>
//                       <td>{displayValue(user.address)}</td>
//                       <td>{displayValue(user.usertype)}</td>
//                       <td>{displayValue(user.clientType)}</td>
//                       <td>
//                         {user.isverified ? (
//                           <span className="badge bg-success">Yes</span>
//                         ) : (
//                           <span className="badge bg-danger">No</span>
//                         )}
//                       </td>
//                       <td>
//                         {user.profile ? (
//                           <img
//                             src={user.profile}
//                             alt="Profile"
//                             width="40"
//                             height="40"
//                             className="rounded-circle"
//                           />
//                         ) : "-"}
//                       </td>

//                       {/* Aadhar */}
//                       <td>{displayValue(user.idproof?.aadhar?.number)}</td>
//                       <td>
//                         {user.idproof?.aadhar?.link ? (
//                           <a href={user.idproof.aadhar.link} target="_blank" rel="noreferrer">View</a>
//                         ) : "-"}
//                       </td>
//                       <td>{formatDate(user.idproof?.aadhar?.lastUpdate)}</td>

//                       {/* PAN */}
//                       <td>{displayValue(user.idproof?.pan?.number)}</td>
//                       <td>
//                         {user.idproof?.pan?.link ? (
//                           <a href={user.idproof.pan.link} target="_blank" rel="noreferrer">View</a>
//                         ) : "-"}
//                       </td>
//                       <td>{formatDate(user.idproof?.pan?.lastUpdate)}</td>

//                       {/* Bank Details */}
//                       <td>{displayValue(user.upi)}</td>
//                       <td>{displayValue(user.bankName)}</td>
//                       <td>{displayValue(user.ifscCode)}</td>
//                       <td>{displayValue(user.accountNo)}</td>

//                       {/* Auth */}
//                       <td>{formatDate(user.lastlogin)}</td>
//                       <td>{displayValue(user.role)}</td>

//                       {/* Developer Fields */}
//                       <td>{displayValue(user._id)}</td>
//                       <td>{displayValue(user.password)}</td>
//                       <td>{displayValue(user.resetPasswordToken)}</td>
//                       <td>{formatDate(user.resetPasswordExpiresAt)}</td>
//                       <td>{displayValue(user.VerificationToken)}</td>
//                       <td>{formatDate(user.VerificationTokenExpiresAt)}</td>

//                       <td>
//                         <Button
//                           variant="danger"
//                           size="sm"
//                           onClick={() => {
//                             setSelectedUser(user);
//                             setShowDeleteModal(true);
//                           }}
//                         >
//                           Delete
//                         </Button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="30" className="text-center">
//                       No users found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </Table>
//           )}
//         </Card>
//       </Container>
//     </>
//   );
// }
