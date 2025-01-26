import React, { useEffect, useState } from 'react';
import './AdminTable.css';

export default function AdminTable() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await fetch('http://localhost:3000/allbill'); // Adjust the API URL if necessary
        const data = await response.json();
        console.log

        if (response.ok) {
          setBills(data);
        } else {
          setError(data.error || 'Failed to fetch bills');
        }
      } catch (err) {
        setError('Server error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className="admin-bill-table">
        <table border="1">
          <thead>
            <tr>
              <th>Uploaded By</th>
              <th>Firm Name</th>
              <th>Work Area</th>
              <th>Phone No</th>
              <th>Email</th>
              <th>LOA No.</th>
              <th>Invoice No</th>
              <th>Payment Status</th>
              <th>View Bill</th>
              <th>Upload Date</th>
            </tr>
          </thead>
          <tbody>
          {bills.map((bill, index) => (
  <tr key={index}>
    <td>{bill.user?.name || 'N/A'}</td> {/* Safe access using ?. */}
    <td>{bill.firmName || 'N/A'}</td>
    <td>{bill.workArea || 'N/A'}</td>
    <td>{bill.user?.phone || 'N/A'}</td> {/* Safe access using ?. */}
    <td>{bill.user?.email || 'N/A'}</td> {/* Safe access using ?. */}
    <td>{bill.loaNo || 'N/A'}</td>
    <td>{bill.invoiceNo || 'N/A'}</td>
    <td>{bill.paymentStatus ? "Completed" : "Pending"}</td>
    <td>
      {bill.pdfurl ? (
        <a href={bill.pdfurl} target="_blank" rel="noopener noreferrer">
          View
        </a>
      ) : (
        'N/A'
      )}
    </td>
    <td>{bill.submittedAt ? new Date(bill.submittedAt).toLocaleDateString() : 'N/A'}</td>
  </tr>
))}

          </tbody>
        </table>
      </div>
    </div>
  );
}
