import React, { useEffect, useState } from "react";
import { Table, Container, Spinner, Alert, Button, Image } from "react-bootstrap";
import { backend_url } from "../../components/store/keyStore";

export default function PaymentRequestTable() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(`${backend_url}/allpayment`);
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
          <Table striped bordered hover responsive="md" className="shadow-sm">
            <thead className="bg-light text-center">
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Uploaded By</th>
                <th>Tender</th>
                <th>Amount (₹)</th>
                <th>Expense No.</th>
                <th>Payment Status</th>
                <th>Request Date</th>
                <th>Payment Date</th>
                <th>Payment Mode</th>
                <th>Remark</th>
                <th>View Bill</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment, index) => (
                  <tr key={payment._id}>
                    <td className="text-center">{index + 1}</td>
                    <td className="text-center">
                      {payment.user?.profile ? (
                        <Image
                          src={payment.user.profile}
                          alt="User Profile"
                          roundedCircle
                          width="40"
                          height="40"
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>{payment.user?.name || "Unknown"}</td>
                    <td>{payment.tender || "N/A"}</td>
                    <td>{payment.amount?.toLocaleString() || "0"}</td>
                    <td>{payment.expenseNo || "N/A"}</td>
                    <td className={`fw-bold ${payment.status === "Paid" ? "text-success" : "text-danger"}`}>
                      {payment.status || "Pending"}
                    </td>
                    <td>{payment.submittedAt ? new Date(payment.submittedAt).toLocaleDateString() : "N/A"}</td>
                    <td>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "N/A"}</td>
                    <td>{payment.refMode || "N/A"}</td>
                    <td>{payment.remark || "-"}</td>
                    <td className="text-center">
                      {payment.image ? (
                        <Button href={payment.image} target="_blank" variant="primary" size="sm">
                          View
                        </Button>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center text-muted p-3">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}
