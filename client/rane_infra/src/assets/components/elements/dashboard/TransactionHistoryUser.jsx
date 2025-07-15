import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../../../store/authStore";
import { backend_url } from "../../../../store/keyStore";
import { Card, Col, Row, Container } from "react-bootstrap";
import { FaMoneyBillWave, FaExchangeAlt } from "react-icons/fa";

export default function TransactionHistoryUser() {
  const [billTransactions, setBillTransactions] = useState([]);
  const [payReqTransactions, setPayReqTransactions] = useState([]);
  const { user } = useAuthStore();
  const userId = user._id;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const billRes = await axios.get(`${backend_url}/transaction-of-bill/${userId}`);
        setBillTransactions(billRes.data.transactions);

        const payReqRes = await axios.get(`${backend_url}/transaction-of-payreq/${userId}`);
        setPayReqTransactions(payReqRes.data.transactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [userId]);

  return (
    <Container className="mt-4">
      {/* Bill Payment History */}
      <h3 className="text-primary mb-3 d-flex align-items-center">
        <FaMoneyBillWave className="me-2" /> Bill Payment History
      </h3>
      <Row className="mb-4">
        {billTransactions.length > 0 ? (
          billTransactions.map((txn) => (
            <Col key={txn._id} md={6} lg={4} className="mb-3">
              <Card className="shadow-sm border-info" style={{ borderLeft: "5px solid #0d6efd" }}>
                <Card.Body>
                  <Card.Title className="text-info fw-bold">Invoice No: {txn.billId?.invoiceNo || "N/A"}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    <strong>Bill Date:</strong> {new Date(txn.billId?.submittedAt).toLocaleString() || "N/A"}
                  </Card.Subtitle>
                  <Card.Text>
                    <strong>Amount:</strong> <span className="text-success fw-bold">₹{txn.amount?.toFixed(2) || "0.00"}</span> <br />
                    <strong>Bank:</strong> {txn.bankName || "-"} <br />
                    <strong>Account No:</strong> {txn.accNo || "-"} <br />
                    <strong>IFSC Code:</strong> {txn.ifscCode || "-"} <br />
                    <strong>Transaction Date:</strong> {new Date(txn.transactionDate).toLocaleString()}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-center text-muted">No Bill Payment Transactions Found.</p>
        )}
      </Row>

      {/* PayRequest History */}
      <h3 className="text-success mb-3 d-flex align-items-center">
        <FaExchangeAlt className="me-2" /> Immediate Payment & Payment Request History
      </h3>
      <Row>
        {payReqTransactions.length > 0 ? (
          payReqTransactions.map((txn) => (
            <Col key={txn._id} md={6} lg={4} className="mb-3">
              <Card className="shadow-sm border-success" style={{ borderLeft: "5px solid #198754" }}>
                <Card.Body>
                  <Card.Title className="text-success fw-bold">PayReq ID: {txn.paymentId?._id || "N/A"}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    <strong>Transaction Date:</strong> {new Date(txn.transactionDate).toLocaleString()}
                  </Card.Subtitle>
                  <Card.Text>
                    <strong>Amount:</strong> <span className="text-primary fw-bold">₹{txn.amount?.toFixed(2) || "0.00"}</span> <br />
                    <strong>UPI ID:</strong> {txn.upiId || "-"}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-center text-muted">No PayRequest Transactions Found.</p>
        )}
      </Row>
    </Container>
  );
}
