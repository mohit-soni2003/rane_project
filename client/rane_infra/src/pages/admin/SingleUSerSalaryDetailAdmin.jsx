import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMonthlySalary, updateMonthlySalary, finalizeMonthlySalary, getBaseSalary } from '../../services/salaryServices';
import { Card, Table, Spinner, Container, Row, Col, Badge, Image, Form, Button } from 'react-bootstrap';
import AdminHeader from '../../component/header/AdminHeader';

export default function SingleUSerSalaryDetailAdmin() {
    const { clientid, currmonth } = useParams();
    const [salaryData, setSalaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        overtime: { date: "", amount: "", note: "" },
        advancePay: { date: "", amount: "", note: "" },
        leaveCuts: { date: "", amount: "", note: "" }
    });

    const [submitting, setSubmitting] = useState({});
    const [editedAllowances, setEditedAllowances] = useState({});
    const [savingAllowances, setSavingAllowances] = useState(false);

    const [baseSalary, setBaseSalary] = useState(0);

    useEffect(() => {
        async function fetchSalary() {
            try {
                setLoading(true);
                const data = await getMonthlySalary(clientid, currmonth);
                const baseData = await getBaseSalary(clientid);

                setSalaryData(data);
                setEditedAllowances(data.allowances || {});
                setBaseSalary(baseData.amount || 0);
            } catch (err) {
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        }
        fetchSalary();
    }, [clientid, currmonth]);

    const handleInput = (section, field, value) => {
        setForm(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const handleAddEntry = async (section) => {
        const entry = form[section];
        if (!entry.date || !entry.amount) {
            alert("Please fill date and amount");
            return;
        }
        try {
            setSubmitting(prev => ({ ...prev, [section]: true }));
            const payload = {
                [section]: [...salaryData[section], entry]
            };
            const updated = await updateMonthlySalary(clientid, currmonth, payload);
            setSalaryData(updated);
            setForm(prev => ({ ...prev, [section]: { date: "", amount: "", note: "" } }));
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(prev => ({ ...prev, [section]: false }));
        }
    };

    const handleAllowanceChange = (key, value) => {
        setEditedAllowances(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSaveAllowances = async () => {
        try {
            setSavingAllowances(true);
            const payload = {
                allowances: editedAllowances,
                bonus: salaryData.bonus,
            };
            const updated = await updateMonthlySalary(clientid, currmonth, payload);
            setSalaryData(updated);
            alert("Allowances and Bonus updated successfully.");
        } catch (err) {
            alert("Error updating data: " + err.message);
        } finally {
            setSavingAllowances(false);
        }
    };

    const handleFinalizeSalary = async () => {
        if (!window.confirm("Are you sure you want to finalize this salary? This action cannot be undone.")) return;
        try {
            const updated = await finalizeMonthlySalary(clientid, currmonth);
            setSalaryData(updated);
            alert("Salary finalized successfully.");
        } catch (err) {
            alert("Error finalizing salary: " + err.message);
        }
    };


    const formatDate = (dateStr) =>
        dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : "-";

    let totalAllowances = 0, totalOvertime = 0, totalAdvancePay = 0, totalLeaveCuts = 0, netPayable = 0;
    if (salaryData) {
        totalAllowances = Object.values(editedAllowances).reduce((sum, val) => sum + Number(val || 0), 0);
        totalOvertime = salaryData.overtime.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        totalAdvancePay = salaryData.advancePay.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        totalLeaveCuts = salaryData.leaveCuts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        netPayable = baseSalary + totalAllowances + totalOvertime + salaryData.bonus - totalAdvancePay - totalLeaveCuts;
    }


    const renderTransactionTable = (data, title, sectionKey) => (
        <Card className="mb-4 shadow-sm">
            <Card.Header className="fw-bold">{title}</Card.Header>
            <Card.Body>
                <Row className="g-2 align-items-end mb-3">
                    <Col md={3}>
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={form[sectionKey].date}
                            onChange={(e) => handleInput(sectionKey, "date", e.target.value)}
                            disabled={salaryData.finalized}
                        />
                    </Col>
                    <Col md={3}>
                        <Form.Label>Amount</Form.Label>
                        <Form.Control
                            type="number"
                            value={form[sectionKey].amount}
                            onChange={(e) => handleInput(sectionKey, "amount", e.target.value)}
                            placeholder="₹"
                            disabled={salaryData.finalized}
                        />
                    </Col>
                    <Col md={4}>
                        <Form.Label>Note</Form.Label>
                        <Form.Control
                            type="text"
                            value={form[sectionKey].note}
                            onChange={(e) => handleInput(sectionKey, "note", e.target.value)}
                            placeholder="Optional"
                            disabled={salaryData.finalized}
                        />
                    </Col>
                    <Col md={2}>
                        <Button
                            variant="primary"
                            onClick={() => handleAddEntry(sectionKey)}
                            disabled={submitting[sectionKey] || salaryData.finalized}
                            className="w-100"
                        >
                            {submitting[sectionKey] ? "Adding..." : "Add Entry"}
                        </Button>
                    </Col>
                </Row>

                {data.length === 0 ? (
                    <div className="text-muted">No records found</div>
                ) : (
                    <Table hover size="sm" className="mb-0">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{formatDate(item.date)}</td>
                                    <td>₹{item.amount}</td>
                                    <td>{item.note || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );

    if (loading) return <div className="text-center my-5"><Spinner animation="border" variant="primary" /> <div className="mt-2">Fetching salary details...</div></div>;
    if (error) return <Container className="my-5 text-danger text-center"><h5>Error:</h5><p>{error}</p></Container>;

    const { user, month, createdAt, finalized, paidOn, bonus, allowances, overtime, advancePay, leaveCuts } = salaryData;

    return (
        <>
            <AdminHeader />
            <Container fluid className="my-2 py-4">
                <h3 className="mb-4">Monthly Salary Details</h3>

                <Card className="mb-4 shadow-sm">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col md={1}><Image src={user?.profile} roundedCircle width={60} height={60} alt="Profile" /></Col>
                            <Col><h5 className="mb-0">{user?.name}</h5><small className="text-muted">{user?.email}</small></Col>
                            <Col className="text-end"><Badge bg={finalized ? "success" : "warning"}>{finalized ? "Finalized" : "Not Finalized"}</Badge></Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Row className="mb-4">
                    <Col md={3}><strong>Month:</strong> {month}</Col>
                    <Col md={3}><strong>Base Salary:</strong> ₹{baseSalary}</Col>
                    <Col md={3}><strong>Bonus:</strong> ₹{bonus}</Col>
                    <Col md={3}><strong>Paid On:</strong> {formatDate(paidOn)}</Col>
                </Row>
                <Row className="mb-4">
                    <Col md={3}><strong>Created At:</strong> {formatDate(createdAt)}</Col>
                </Row>


                <Card className="mb-4 shadow-sm">
                    <Card.Header className="fw-bold d-flex justify-content-between align-items-center">
                        <span>Allowances & Bonus</span>
                        <Button variant="success" size="sm" onClick={handleSaveAllowances} disabled={savingAllowances || salaryData.finalized}>
                            {savingAllowances ? "Saving..." : "Save Changes"}
                        </Button>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            {Object.entries(editedAllowances).map(([key, value]) => (
                                <Col md={3} key={key} className="mb-3">
                                    <Form.Group>
                                        <Form.Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={value}
                                            onChange={(e) => handleAllowanceChange(key, Number(e.target.value))}
                                            disabled={salaryData.finalized}
                                        />
                                    </Form.Group>
                                </Col>
                            ))}

                            <Col md={3} className="mb-3">
                                <Form.Group>
                                    <Form.Label>Bonus</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={salaryData.bonus}
                                        onChange={(e) => setSalaryData((prev) => ({ ...prev, bonus: Number(e.target.value) }))}
                                        disabled={salaryData.finalized}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {renderTransactionTable(overtime, "Overtime Entries", "overtime")}
                {renderTransactionTable(advancePay, "Advance Pay Entries", "advancePay")}
                {renderTransactionTable(leaveCuts, "Leave Cut Entries", "leaveCuts")}

                <Card className="mb-5 shadow-sm">
                    <Card.Header className="fw-bold">Salary Summary</Card.Header>
                    <Card.Body>
                        <Row className="mb-2">
                            <Col md={4}><strong>Base Salary:</strong> ₹{baseSalary}</Col>
                            <Col md={4}><strong>Total Allowances:</strong> ₹{totalAllowances}</Col>
                            <Col md={4}><strong>Total Overtime:</strong> ₹{totalOvertime}</Col>
                        </Row>
                        <Row className="mb-2">
                            <Col md={4}><strong>Bonus:</strong> ₹{salaryData.bonus}</Col>
                            <Col md={4}><strong>Advance Pay:</strong> -₹{totalAdvancePay}</Col>
                            <Col md={4}><strong>Leave Cuts:</strong> -₹{totalLeaveCuts}</Col>
                        </Row>
                        <hr />
                        <Row className="mb-2">
                            <Col md={4}><strong>Net Payable Salary:</strong> ₹{netPayable}</Col>
                        </Row>


                        <hr />

                        <div className="d-flex justify-content-end gap-3">
                            <Button
                                variant="warning"
                                disabled={salaryData.finalized}
                                onClick={handleFinalizeSalary}
                            >
                                {salaryData.finalized ? "Already Finalized" : "Finalize Salary"}
                            </Button>
                            <Button variant="secondary" onClick={() => alert("PDF generation to be implemented")}>View PDF</Button>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
}