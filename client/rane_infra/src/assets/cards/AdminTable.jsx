import React, { useEffect, useState } from 'react';

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
      <table
      className="table table-bordered table-striped table-hover"
      style={{
        width: "100%",
        margin: "20px 0",
        fontSize: "16px",
        textAlign: "left",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <thead
        style={{
          backgroundColor: "#007BFF",
          color: "#fff",
          textTransform: "uppercase",
        }}
      >
        <tr>
          <th style={{ padding: "12px" }}>Uploaded By</th>
          <th style={{ padding: "12px" }}>Firm Name</th>
          <th style={{ padding: "12px" }}>Work Area</th>
          <th style={{ padding: "12px" }}>Phone No</th>
          <th style={{ padding: "12px" }}>Email</th>
          <th style={{ padding: "12px" }}>LOA No.</th>
          <th style={{ padding: "12px" }}>Invoice No</th>
          <th style={{ padding: "12px" }}>Payment Status</th>
          <th style={{ padding: "12px" }}>View Bill</th>
          <th style={{ padding: "12px" }}>Upload Date</th>
        </tr>
      </thead>
      <tbody>
        {bills.map((bill, index) => (
          <tr
            key={index}
            className={index % 2 === 0 ? "table-light" : ""}
            style={{
              borderBottom: "1px solid #ddd",
              transition: "background-color 0.3s ease",
            }}
          >
            <td style={{ padding: "12px" }}>{bill.user?.name || "N/A"}</td>
            <td style={{ padding: "12px" }}>{bill.firmName || "N/A"}</td>
            <td style={{ padding: "12px" }}>{bill.workArea || "N/A"}</td>
            <td style={{ padding: "12px" }}>{bill.user?.phone || "N/A"}</td>
            <td style={{ padding: "12px" }}>{bill.user?.email || "N/A"}</td>
            <td style={{ padding: "12px" }}>{bill.loaNo || "N/A"}</td>
            <td style={{ padding: "12px" }}>{bill.invoiceNo || "N/A"}</td>
            <td style={{ padding: "12px" }}>
              {bill.paymentStatus ? "Completed" : "Pending"}
            </td>
            <td style={{ padding: "12px" }}>
              {bill.pdfurl ? (
                <a
                  href={bill.pdfurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                  style={{ fontWeight: "bold" }}
                >
                  View
                </a>
              ) : (
                "N/A"
              )}
            </td>
            <td style={{ padding: "12px" }}>
              {bill.submittedAt
                ? new Date(bill.submittedAt).toLocaleDateString()
                : "N/A"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
      </div>
    </div>
  );
}
