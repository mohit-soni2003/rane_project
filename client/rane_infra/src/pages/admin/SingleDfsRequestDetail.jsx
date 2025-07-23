import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFileById } from "../../services/dfsService";
import { Container, Spinner } from "react-bootstrap";
import AdminHeader from "../../component/header/AdminHeader";

export default function SingleDfsRequestDetail() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFile = async () => {
      try {
        const data = await getFileById(id);
        setFile(data);
      } catch (error) {
        alert("❌ " + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [id]);

  return (
    <>
      <AdminHeader />
      <Container className="py-4">
        <h4 className="mb-4">📄 DFS Request Raw JSON</h4>

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : !file ? (
          <p className="text-muted">No file found.</p>
        ) : (
          <pre
            style={{
              backgroundColor: "#f8f9fa",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
              fontSize: "0.9rem",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(file, null, 2)}
          </pre>
        )}
      </Container>
    </>
  );
}
