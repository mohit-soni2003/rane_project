import React, { useState, useEffect } from 'react';
import { Container, Table, Form, InputGroup, Image, Spinner, Button } from 'react-bootstrap';
import { BsSearch } from 'react-icons/bs';
import AdminHeader from '../../component/header/AdminHeader';
import { getAllClients } from '../../services/userServices';
import { getBaseSalary, uploadBaseSalary, initMonthlySalary } from '../../services/salaryServices';
import dummyUser from "../../assets/images/dummyUser.jpeg";
import { useNavigate } from 'react-router-dom';

export default function ClientSalaryAll() {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [salaries, setSalaries] = useState({});
    const [newSalaries, setNewSalaries] = useState({});
    const [updating, setUpdating] = useState(null);

    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const [initializing, setInitializing] = useState(null); // to track which button is in progress
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchClients() {
            setLoading(true);
            const data = await getAllClients();
            setClients(data || []);
            setLoading(false);

            // Fetch base salaries for each client
            const salaryMap = {};
            for (const client of data) {
                try {
                    const salaryData = await getBaseSalary(client._id);
                    salaryMap[client._id] = salaryData.amount;
                } catch (err) {
                    salaryMap[client._id] = 0; // Default if not found
                }
            }
            setSalaries(salaryMap);
        }
        fetchClients();
    }, []);

    const handleSalaryChange = (clientId, value) => {
        setNewSalaries({ ...newSalaries, [clientId]: value });
    };

    const handleUpdate = async (clientId) => {
        const amount = Number(newSalaries[clientId]);
        if (isNaN(amount) || amount < 0) {
            alert("Enter a valid amount");
            return;
        }

        try {
            setUpdating(clientId);
            await uploadBaseSalary(clientId, amount);
            setSalaries({ ...salaries, [clientId]: amount });
            setNewSalaries({ ...newSalaries, [clientId]: "" });
            alert("Base salary updated");
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdating(null);
        }
    };

    const filteredClients = clients.filter(client =>
        (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.cid || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <AdminHeader />
            <Container fluid className="my-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">Client Base Salaries</h4>
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
                                        <th style={{ whiteSpace: "nowrap" }}>S.No</th>
                                        <th style={{ whiteSpace: "nowrap" }}>Profile</th>
                                        <th style={{ whiteSpace: "nowrap" }}>Name</th>
                                        <th style={{ whiteSpace: "nowrap" }}>Email</th>
                                        <th style={{ whiteSpace: "nowrap" }}>Phone No</th>
                                        <th style={{ whiteSpace: "nowrap" }}>CID Code</th>
                                        <th style={{ whiteSpace: "nowrap" }}>Current Base Salary</th>
                                        <th style={{ whiteSpace: "nowrap" }}>New Base Salary</th>
                                        <th style={{ whiteSpace: "nowrap" }}>Update</th>
                                        <th style={{ whiteSpace: "nowrap" }}>Init Salary</th>
                                        <th style={{ whiteSpace: "nowrap" }}>Salary Details</th>
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
                                                <td>{client.cid || `CID-${index + 1}`}</td>
                                                <td>₹{salaries[client._id] || 0}</td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Enter new salary"
                                                        value={newSalaries[client._id] || ''}
                                                        onChange={(e) => handleSalaryChange(client._id, e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        disabled={updating === client._id}
                                                        onClick={() => handleUpdate(client._id)}
                                                    >
                                                        {updating === client._id ? 'Updating...' : 'Update'}
                                                    </Button>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        disabled={initializing === client._id}
                                                        onClick={async () => {
                                                            setInitializing(client._id);
                                                            try {
                                                                await initMonthlySalary(client._id, currentMonth);
                                                                alert("✅ Monthly salary initialized successfully.");
                                                            } catch (err) {
                                                                if (err.message === "Already initialized") {
                                                                    alert("⚠️ Monthly salary already initialized for this user.");
                                                                } else {
                                                                    alert("❌ " + err.message);
                                                                }
                                                            } finally {
                                                                setInitializing(null);
                                                            }
                                                        }}
                                                    >
                                                        {initializing === client._id ? 'Initializing...' : 'Initialize'}
                                                    </Button>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="info"
                                                        size="sm"
                                                        onClick={() => navigate(`/admin/salary-detail/${client._id}/${currentMonth}`)}
                                                    >
                                                        View
                                                    </Button>

                                                </td>

                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="text-center text-muted">
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
