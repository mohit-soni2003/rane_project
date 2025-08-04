import React, { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Badge,
    Spinner,
    Form,
    Button,
    Container,
    ListGroup,
} from 'react-bootstrap';
import { FaRupeeSign, FaFileDownload } from 'react-icons/fa';
import { MdOutlinePendingActions, MdOutlineCheckCircle } from 'react-icons/md';
import { getBaseSalary, getMonthlySalary } from '../../services/salaryServices';
import { useAuthStore } from '../../store/authStore';
import ClientHeader from '../../component/header/ClientHeader';

export default function SalaryPage() {
    const { user } = useAuthStore();
    const [baseSalary, setBaseSalary] = useState(null);
    const [monthlySalary, setMonthlySalary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const fetchSalaryData = async (month) => {
        setLoading(true);
        try {
            const [base, monthly] = await Promise.all([
                getBaseSalary(user._id),
                getMonthlySalary(user._id, month),
            ]);
            setBaseSalary(base);
            setMonthlySalary(monthly);
        } catch (error) {
            console.error('Salary fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?._id) fetchSalaryData(selectedMonth);
    }, [user, selectedMonth]);

    const sum = (arr) => arr?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
    const sumObj = (obj) => Object.values(obj || {}).reduce((acc, val) => acc + val, 0);

    const totalOvertime = sum(monthlySalary?.overtime);
    const totalLeaves = sum(monthlySalary?.leaveCuts);
    const totalAdvance = sum(monthlySalary?.advancePay);
    const totalAllowances = sumObj(monthlySalary?.allowances);
    const finalSalary =
        (baseSalary?.amount || 0) +
        (monthlySalary?.bonus || 0) +
        totalOvertime +
        totalAllowances -
        totalLeaves -
        totalAdvance;

    const monthOptions = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const value = date.toISOString().slice(0, 7);
        const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        return { value, label };
    });

    return (
        <>
            <ClientHeader />
            <Container className="py-4">
                <Card className="p-4 shadow-sm mb-4" style={{ backgroundColor: 'var(--client-component-bg-color)' }}>
                    <Row className="align-items-center">
                        <Col>
                            <h4 className="fw-bold" style={{ color: 'var(--client-heading-color)' }}>
                                Salary Details
                            </h4>
                        </Col>
                        <Col className="text-end">
                            <Badge bg={monthlySalary?.finalized ? 'success' : 'warning'}>
                                {monthlySalary?.finalized ? (
                                    <><MdOutlineCheckCircle /> Finalized</>
                                ) : (
                                    <><MdOutlinePendingActions /> Not Finalized</>
                                )}
                            </Badge>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col md={6}>
                            <h2 style={{ color: 'var(--client-text-color)' }}>
                                ₹ {finalSalary.toLocaleString()}
                                <span style={{ fontSize: '16px', color: 'gray' }}> /month</span>
                            </h2>
                        </Col>
                        <Col md={6} className="text-end">
                            <Form.Select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                style={{ maxWidth: 200, backgroundColor: 'white' }}
                            >
                                {monthOptions.map((m) => (
                                    <option value={m.value} key={m.value}>{m.label}</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>
                </Card>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <>
                        <Card className="mb-4 p-4 shadow-sm" style={{ backgroundColor: 'var(--client-component-bg-color)' }}>
                            <h5 className="mb-4" style={{ color: 'var(--client-heading-color)' }}>Salary Breakdown</h5>
                            <Row className="g-4">
                                <Col md={4}><Card body style={{ backgroundColor: '#fff' }}>💰 Base Salary: ₹{baseSalary?.amount}</Card></Col>
                                <Col md={4}><Card body style={{ backgroundColor: '#fff' }}>🎁 Bonus: +₹{monthlySalary?.bonus}</Card></Col>
                                <Col md={4}><Card body style={{ backgroundColor: '#fff' }}>🏥 Allowances: +₹{totalAllowances}</Card></Col>

                                <Col md={4}>
                                    <Card body style={{ backgroundColor: '#fff' }}>
                                        ⏱ Overtime: +₹{totalOvertime}
                                        <ListGroup size="sm" className="mt-2">
                                            {monthlySalary?.overtime?.map((o, i) => (
                                                <ListGroup.Item key={i} className="py-1">{new Date(o.date).toLocaleDateString()} — ₹{o.amount}</ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Card>
                                </Col>

                                <Col md={4}>
                                    <Card body style={{ backgroundColor: '#fff' }}>
                                        📅 Leave Cuts: -₹{totalLeaves}
                                        <ListGroup size="sm" className="mt-2">
                                            {monthlySalary?.leaveCuts?.map((l, i) => (
                                                <ListGroup.Item key={i} className="py-1">{new Date(l.date).toLocaleDateString()} — ₹{l.amount}</ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Card>
                                </Col>

                                <Col md={4}>
                                    <Card body style={{ backgroundColor: '#fff' }}>
                                        💳 Advance Pay: -₹{totalAdvance}
                                        <ListGroup size="sm" className="mt-2">
                                            {monthlySalary?.advancePay?.map((a, i) => (
                                                <ListGroup.Item key={i} className="py-1">{new Date(a.date).toLocaleDateString()} — ₹{a.amount}</ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </Card>
                                </Col>
                            </Row>
                        </Card>

                        <Card className="p-4 shadow-sm" style={{ backgroundColor: 'var(--client-component-bg-color)' }}>
                            <h5 className="mb-3" style={{ color: 'var(--client-heading-color)' }}>💡 Salary Calculation</h5>
                            <p style={{ color: 'var(--client-text-color)' }}>
                                Base ₹{baseSalary?.amount} + Bonus ₹{monthlySalary?.bonus} + Allowances ₹{totalAllowances} +
                                Overtime ₹{totalOvertime} - Leaves ₹{totalLeaves} - Advance ₹{totalAdvance} =
                                <strong> ₹{finalSalary}</strong>
                            </p>

                            <div className="text-end">
                                <Button
                                    style={{
                                        backgroundColor: monthlySalary?.finalized ? 'var(--client-btn-bg)' : '#ccc',
                                        color: 'var(--client-btn-text)',
                                        border: 'none',
                                    }}
                                    disabled={!monthlySalary?.finalized}
                                    onClick={() => alert("⚠️ This service is currently unavailable. We're working on it and will make it available soon. Thank you for your patience!")}
                                >
                                    <FaFileDownload className="me-2" /> Download Salary PDF
                                </Button>
                            </div>
                        </Card>
                    </>
                )}
            </Container>
        </>
    );
}
