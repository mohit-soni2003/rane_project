import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { backend_url } from '../components/store/keyStore';

export default function BillShowTable({ userid }) {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const response = await fetch(`${backend_url}/mybill/${userid}`);
                const data = await response.json();
    
                if (response.ok) {
                    if (Array.isArray(data) && data.length > 0) {
                        setBills(data);
                    } else {
                        setBills([]); // Handle empty bills case
                    }
                } else {
                    setError(data.error || 'Unexpected data format');
                }
            } catch (err) {
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };
    
        if (userid) fetchBills();
    }, [userid]);
     
    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="bill-table-container">
            <Table striped bordered hover responsive className="bill-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Firm Name</th>
                        <th>Work Area</th>
                        <th>LOA No.</th>
                        <th>Invoice No</th>
                        <th>Payment Status</th>
                        <th>View Bill</th>
                    </tr>
                </thead>
                <tbody>
                    {bills.length > 0 ? (
                        bills.map((bill, index) => (
                            <tr key={bill._id}>
                                <td>{index + 1}</td>
                                <td>{bill.firmName}</td>
                                <td>{bill.workArea}</td>
                                <td>{bill.loaNo}</td>
                                <td>{bill.invoiceNo}</td>
                                <td>
                                    <span className={`status ${bill.paymentStatus.toLowerCase()}`}>
                                        {bill.paymentStatus}
                                    </span>
                                </td>
                                <td>
                                    <Button
                                        variant="primary"
                                        className="view-btn"
                                        onClick={() => {
                                            if (bill.pdfurl) {
                                                window.open(bill.pdfurl, '_blank', 'noopener,noreferrer');
                                            } else {
                                                alert('PDF URL not available!');
                                            }
                                        }}
                                    >
                                        View
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center">
                                No bills uploaded
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
}
