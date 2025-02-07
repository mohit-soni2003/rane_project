import React, { useEffect, useState } from "react";
import { Table, Container, Spinner, Alert, Button } from "react-bootstrap";
import { backend_url } from "../components/store/keyStore";

export default function PaymentStatusTable() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(`${backend_url}/allpayment`); // Adjust backend URL if needed
        const data = await response.json();

        if (response.ok) {
          setPayments(data);
        } else {
          setError(data.error || "Failed to fetch payments");
        }
      } catch (err) {
        setError("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <Container className="mt-4">
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Loading payments...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover className="shadow-sm">
            <thead className="bg-light">
              <tr>
                <th>S.no</th>
                <th>Tender</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Request Date</th>
                <th>Payment Date</th>
                <th>Payment Mode</th>
                <th>Remark</th>
                <th className="text-center">View</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment, index) => (
                  <tr key={payment._id}>
                    <td>{index + 1}</td>
                    <td>{payment.tender}</td>
                    <td>{payment.amount}</td>
                    <td className={payment.status === "Paid" ? "text-success fw-bold" : "text-warning fw-bold"}>
                      {payment.status || "Pending"}
                    </td>
                    <td>{new Date(payment.submittedAt).toLocaleDateString()}</td>
                    <td>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "N/A"}</td>
                    <td>{payment.refMode || "N/A"}</td>
                    <td>{payment.remark || "-"}</td>
                    <td className="text-center">
                      <Button href={payment.image} target="_blank" variant="primary" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center text-muted p-3">No payments found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}
