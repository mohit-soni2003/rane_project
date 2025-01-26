import React, { useEffect, useState } from 'react';
import "./BillShowTable.css";
import Button from 'react-bootstrap/Button';

export default function BillShowTable({ userid }) {
    const [bills, setBills] = useState([]); // State to store the bills
    const [loading, setLoading] = useState(true); // State to handle loading
    const [error, setError] = useState(null); // State to handle errors
    console.log(userid)
    useEffect(() => {
        const fetchBills = async () => {
            try {
                const response = await fetch(`http://localhost:3000/mybill/${userid}`);
                const data = await response.json();
                console.log("Fetched data:", data); // Inspect the structure of the response
    
                if (response.ok && Array.isArray(data)) {
                    setBills(data); // Only set if `data` is an array
                } else {
                    setError(data.error || 'Unexpected data format');
                }
            } catch (err) {
                console.error("Error:", err);
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };
    
        if (userid) fetchBills();
    }, [userid]);
    
    if (loading) {
        return <div>Loading...</div>; // Show loading message
    }

    if (error) {
        return <div>Error: {error}</div>; // Show error message
    }

    return (
        <div className="bill-table">
            <table border="1">
                <thead>
                    <tr>
                        <th>Firm Name</th>
                        <th>Work Area</th>
                        <th>LOA No.</th>
                        <th>Invoice No</th>
                        <th>Payment Status</th>
                        <th>View Bill</th>
                    </tr>
                </thead>
                <tbody>
                    {bills.map((bill) => (
                        <tr key={bill._id}>
                            <td>{bill.firmName}</td>
                            <td>{bill.workArea}</td>
                            <td>{bill.loaNo}</td>
                            <td>{bill.invoiceNo}</td>
                            <td>{bill.paymentStatus ? 'Paid' : 'Unpaid'}</td>
                            <td>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        if (bill.pdfUrl) {
                                            window.open(bill.pdfUrl, '_blank', 'noopener,noreferrer');
                                        } else {
                                            alert('PDF URL not available!');
                                        }
                                    }}
                                >
                                    View Bill
                                </Button>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
