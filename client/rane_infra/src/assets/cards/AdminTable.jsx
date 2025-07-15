import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import BillShowModal from './models/BillShowModal';
import BillTransactionModal from './models/BillTransactionModal';
import { backend_url } from '../../store/keyStore';

export default function AdminTable() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [TmodalShow, setTModalShow] = useState(false);
  const [billid, setbillid] = useState("");

  const handleViewMore = (id) => {
    setbillid(id);
    setModalShow(true);
  };

  const handleTransaction = (id) => {
    setbillid(id);
    setTModalShow(true);
  };

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await fetch(`${backend_url}/allbill`);
        const data = await response.json();

        if (response.ok) {
          setBills(Array.isArray(data) ? data : data.bills || []);
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
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary" />
        <p className="mt-2 text-muted">Loading bills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-danger py-4">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="admin-bill-table ">
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
            <th style={{ padding: "12px" }}>S.No</th>
            <th style={{ padding: "12px" }}>CID</th>
            <th style={{ padding: "12px" }}>Uploaded By</th>
            <th style={{ padding: "12px" }}>Firm Name</th>
            <th style={{ padding: "12px" }}>Work Area</th>
            <th style={{ padding: "12px" }}>Phone No</th>
            <th style={{ padding: "12px" }}>Email</th>
            <th style={{ padding: "12px" }}>Payment Status</th>
            <th style={{ padding: "12px" }}>View Bill</th>
            <th style={{ padding: "12px" }}>Upload Date</th>
            <th style={{ padding: "12px" }}>More</th>
            <th style={{ padding: "12px" }}>Transaction</th>
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
              <td style={{ padding: "12px" }}>{index + 1}</td>
              <td style={{ padding: "12px" }}>{bill.user?.cid || "N/A"}</td>
              <td style={{ padding: "12px" }}>{bill.user?.name || "N/A"}</td>
              <td style={{ padding: "12px" }}>{bill.firmName || "N/A"}</td>
              <td style={{ padding: "12px" }}>{bill.workArea || "N/A"}</td>
              <td style={{ padding: "12px" }}>{bill.user?.phoneNo || "N/A"}</td>
              <td style={{ padding: "12px" }}>{bill.user?.email || "N/A"}</td>
              <td style={{ padding: "12px" }}>{bill.paymentStatus || "Pending"}</td>
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
              <td style={{ padding: "12px" }}>
                <Button
                  variant="secondary"
                  onClick={() => handleViewMore(bill._id)}
                >
                  More
                </Button>
              </td>
              <td style={{ padding: "12px" }}>
                <Button
                  variant="warning"
                  onClick={() => handleTransaction(bill._id)}
                >
                  Pay
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modals */}
      <BillShowModal show={modalShow} onHide={() => setModalShow(false)} id={billid} />
      <BillTransactionModal show={TmodalShow} onHide={() => setTModalShow(false)} billId={billid} />
    </div>
  );
}
