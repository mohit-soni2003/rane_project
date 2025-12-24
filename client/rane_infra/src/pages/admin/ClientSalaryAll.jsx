import React, { useState, useEffect } from 'react';
import { Container, Table, Form, InputGroup, Image, Spinner, Button } from 'react-bootstrap';
import { BsSearch } from 'react-icons/bs';
import AdminHeader from '../../component/header/AdminHeader';
import { getAllClients } from '../../services/userServices';
import { getBaseSalary, uploadBaseSalary, initMonthlySalary } from '../../services/salaryServices';
import dummyUser from "../../assets/images/dummyUser.jpeg";
import { useNavigate } from 'react-router-dom';
import { FaMoneyBillWave } from "react-icons/fa";


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
            <Container
                fluid
                className="my-4 p-3"
                style={{ backgroundColor: "var(--background)", borderRadius: "15px" }}
            >
                <div className="d-flex justify-content-between align-items-center mb-4">
                    {/* Title */}
                    <div className="d-flex align-items-center gap-3">
                        <span
                            className="d-inline-flex align-items-center justify-content-center rounded"
                            style={{
                                width: 42,
                                height: 42,
                                backgroundColor: "var(--secondary)",
                                border: "1px solid var(--border)"
                            }}
                        >
                            <FaMoneyBillWave
                                style={{ color: "var(--accent)", fontSize: "1.1rem" }}
                            />
                        </span>

                        <div>
                            <h4
                                className="mb-0 fw-semibold"
                                style={{ color: "var(--text-strong)" }}
                            >
                                Client Base Salaries
                            </h4>
                            <small style={{ color: "var(--text-muted)" }}>
                                Manage and update client salary records
                            </small>
                        </div>
                    </div>

                    {/* Search */}
                    <Form style={{ width: "320px" }}>
                        <InputGroup
                            className="align-items-center rounded-pill px-2"
                            style={{
                                border: "1px solid var(--border)",
                                backgroundColor: "var(--input)",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {/* Search Icon */}
                            <InputGroup.Text
                                className="border-0 bg-transparent"
                                style={{ color: "var(--text-muted)" }}
                            >
                                <BsSearch />
                            </InputGroup.Text>

                            {/* Input */}
                            <Form.Control
                                placeholder="Search by name, email, CID…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-0 bg-transparent"
                                style={{
                                    boxShadow: "none",
                                    color: "var(--foreground)",
                                    paddingLeft: 0,
                                }}
                            />

                            {/* Clear Button (appears only when typing) */}
                            {searchTerm && (
                                <Button
                                    variant="link"
                                    className="text-decoration-none px-2"
                                    onClick={() => setSearchTerm("")}
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    ✕
                                </Button>
                            )}
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
                            <Table
                                hover
                                responsive
                                className="shadow-sm small align-middle"
                                style={{
                                    backgroundColor: "var(--card)",
                                    borderRadius: "16px",
                                    minWidth: "1200px",
                                    whiteSpace: "nowrap",
                                    border: "1px solid var(--border)",
                                }}
                            >
                                {/* Table Head */}
                                <thead
                                    className="text-uppercase small"
                                    style={{
                                        backgroundColor: "var(--secondary)",
                                        color: "var(--text-strong)",
                                    }}
                                >
                                    <tr>
                                        <th>S.No</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>CID</th>
                                        <th>Current Salary</th>
                                        <th>New Salary</th>
                                        <th>Update</th>
                                        <th>Init Salary</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>

                                {/* Table Body */}
                                <tbody>
                                    {filteredClients.length > 0 ? (
                                        filteredClients.map((client, index) => (
                                            <tr key={client._id || index}>
                                                {/* S.No */}
                                                <td>
                                                    <div
                                                        className="rounded-circle d-inline-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: 30,
                                                            height: 30,
                                                            backgroundColor: "var(--muted)",
                                                            color: "var(--text-strong)",
                                                            fontSize: "0.85rem",
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                </td>

                                                {/* Profile */}
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Image
                                                            src={client.profile || dummyUser}
                                                            roundedCircle
                                                            width={36}
                                                            height={36}
                                                            style={{
                                                                objectFit: "cover",
                                                                border: "1px solid var(--border)",
                                                                backgroundColor: "var(--muted)"
                                                            }}
                                                        />

                                                        <div className="d-flex flex-column">
                                                            <span
                                                                style={{
                                                                    color: "var(--text-strong)",
                                                                    fontWeight: 500,
                                                                    lineHeight: 1.2
                                                                }}
                                                            >
                                                                {client.name}
                                                            </span>

                                                            {/* Optional: subtitle (CID / role / email) */}
                                                            <small style={{ color: "var(--text-muted)" }}>
                                                                {client.cid || "—"}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>


                                                {/* Email */}
                                                <td style={{ color: "var(--text-muted)" }}>
                                                    {client.email}
                                                </td>

                                                {/* Phone */}
                                                <td style={{ whiteSpace: "nowrap" }}>
                                                    {client.phoneNo || "—"}
                                                </td>

                                                {/* CID */}
                                                <td>{client.cid || `CID-${index + 1}`}</td>

                                                {/* Current Salary */}
                                                <td style={{ fontWeight: 500 }}>
                                                    ₹{salaries[client._id] || 0}
                                                </td>

                                                {/* New Salary Input */}
                                                <td style={{ minWidth: 160 }}>
                                                    <Form.Control
                                                        type="number"
                                                        size="sm"
                                                        placeholder="Enter amount"
                                                        value={newSalaries[client._id] || ""}
                                                        onChange={(e) =>
                                                            handleSalaryChange(client._id, e.target.value)
                                                        }
                                                        style={{
                                                            backgroundColor: "var(--input)",
                                                            borderColor: "var(--border)",
                                                        }}
                                                    />
                                                </td>

                                                {/* Update */}
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        disabled={updating === client._id}
                                                        onClick={() => handleUpdate(client._id)}
                                                        style={{
                                                            backgroundColor: "var(--primary)",
                                                            borderColor: "var(--primary)",
                                                            color: "var(--primary-foreground)",
                                                        }}
                                                    >
                                                        {updating === client._id ? "Updating..." : "Update"}
                                                    </Button>
                                                </td>

                                                {/* Init Salary */}
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        disabled={initializing === client._id}
                                                        onClick={async () => {
                                                            setInitializing(client._id);
                                                            try {
                                                                await initMonthlySalary(client._id, currentMonth);
                                                                alert("✅ Monthly salary initialized successfully.");
                                                            } catch (err) {
                                                                alert(
                                                                    err.message === "Already initialized"
                                                                        ? "⚠️ Already initialized for this month."
                                                                        : "❌ " + err.message
                                                                );
                                                            } finally {
                                                                setInitializing(null);
                                                            }
                                                        }}
                                                        style={{
                                                            backgroundColor: "var(--success)",
                                                            color: "var(--success-foreground)",
                                                            border: "none",
                                                        }}
                                                    >
                                                        {initializing === client._id
                                                            ? "Initializing..."
                                                            : "Initialize"}
                                                    </Button>
                                                </td>

                                                {/* Salary Details */}
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/salary-detail/${client._id}/${currentMonth}`
                                                            )
                                                        }
                                                        style={{
                                                            backgroundColor: "var(--secondary)",
                                                            color: "var(--secondary-foreground)",
                                                            border: "1px solid var(--border)",
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="11"
                                                className="text-center py-4"
                                                style={{ color: "var(--text-muted)" }}
                                            >
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
