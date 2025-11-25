import React from "react";
import ClientHeader from "../../component/header/ClientHeader";

export default function ClosedAgreement() {
  const closedAgreements = [
    { id: 1, name: "Agreement A", closedOn: "2024-10-15" },
    { id: 2, name: "Agreement B", closedOn: "2024-09-20" },
  ];

  const handleRequestExtension = (id) => {
    console.log("Requesting extension for agreement:", id);
    // You can call API here
  };

  return (
    <>
    <ClientHeader></ClientHeader>
    <div style={{ padding: "20px" }}>
      <h2>Closed Agreements</h2>

      {closedAgreements.length === 0 ? (
        <p>No closed agreements found.</p>
      ) : (
        closedAgreements.map((agreement) => (
          <div
            key={agreement.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h4>{agreement.name}</h4>
              <p>Closed On: {agreement.closedOn}</p>
            </div>

            <button
              onClick={() => handleRequestExtension(agreement.id)}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#007bff",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Request Extension
            </button>
          </div>
        ))
      )}
    </div>
    </>
  );
}
