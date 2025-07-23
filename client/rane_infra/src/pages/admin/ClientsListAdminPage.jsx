import React, { useState, useEffect } from 'react';
import { Container, Table, Form, InputGroup, Image, Dropdown, Spinner , Button } from 'react-bootstrap';
import { BsThreeDotsVertical, BsSearch } from 'react-icons/bs';
import AdminHeader from '../../component/header/AdminHeader';
import { getAllClients } from '../../services/userServices'; // Adjust path as needed
import dummyUser from "../../assets/images/dummyUser.jpeg"
import { Navigate, useNavigate } from 'react-router-dom';
export default function ClientsListAdminPage() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      const data = await getAllClients();
      setClients(data || []);
      setLoading(false);
    }
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client =>
    (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.cid || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AdminHeader />
      <Container className="my-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">All Clients</h4>
          <Form className="w-25">
            <InputGroup>
              <InputGroup.Text><BsSearch /></InputGroup.Text>
              <Form.Control
                placeholder="Search Clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Form>
        </div>

        <div className="table-responsive bg-white shadow-sm rounded p-3">
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted">Loading clients...</div>
            </div>
          ) : (
            <>
              <Table hover>
                <thead className="table-light">
                  <tr>
                    <th>S.No</th>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone No</th>
                    <th>CID Code</th>
                    <th>More</th>
                    <th>Push Document</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client, index) => (
                      <tr key={client._id || index}>
                        <td>{index + 1}</td>
                        <td>
                          <Image
                            src={client.image || dummyUser}
                            roundedCircle
                            width={40}
                            height={40}
                          />
                        </td>
                        <td>{client.name}</td>
                        <td>{client.email}</td>
                        <td>{client.phone || '-'}</td>
                        <td>
                          
                            {client.cid || `CID-${index + 1}`}
                        </td>
                        <td>
                          <Button type="primary" onClick={()=>navigate(`/admin/client-detail/${client._id}`)}>More</Button>
                        </td>
                        <td>
                          <Button variant="warning" onClick={()=>navigate(`/admin/push-document/${encodeURIComponent(client.cid)}`)}>Push Doc</Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">
                        No clients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <div className="text-muted small ms-2">
                Showing {filteredClients.length} of {clients.length} entries
              </div>
            </>
          )}
        </div>
      </Container>
    </>
  );
}
