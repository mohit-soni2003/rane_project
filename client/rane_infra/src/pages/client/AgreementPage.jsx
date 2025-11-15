import React from "react";
import { FiSearch, FiFilter, FiClock, FiChevronDown } from "react-icons/fi";
import ClientHeader from "../../component/header/ClientHeader";

export default function AgreementPage() {
    return (
        <>
            <ClientHeader />

            {/* Main Page Container */}
            <div
                className="container-fluid py-4 my-3"
                style={{
                    background: "var(--background)",
                    borderRadius: "12px",
                    color: "var(--card-foreground)",
                }}
            >
                {/* Page Title + Search + Filter + Sort */}
                <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
                    <div className="mb-2">
                        <h3 className="fw-bold" style={{ color: "var(--text-strong)" }}>
                            Pending Agreements – Action Required
                        </h3>
                        <p className="m-0" style={{ color: "var(--text-muted)" }}>
                            Agreements assigned to you that need your review or signature.
                        </p>
                    </div>

                    {/* Search + actions */}
                    <div className="d-flex gap-2 mt- mt-md-0 w-100 w-md-auto">
                        <div
                            className="input-group flex-grow-1"
                            style={{ background: "var(--input)", borderRadius: "8px" }}
                        >
                            <div
                                className="input-group mt-1"
                                style={{
                                    border: "2px solid var(--border)",
                                    borderRadius: "10px",
                                    overflow: "hidden", // makes border continuous!
                                    background: "var(--input)",
                                }}
                            >
                                <span
                                    className="input-group-text"
                                    style={{
                                        background: "var(--input)",
                                        color: "var(--text-muted)",
                                        border: "none",
                                    }}
                                >
                                    <FiSearch />
                                </span>

                                <input
                                    type="text"
                                    className="form-control shadow-none border-0"
                                    placeholder="Search: agreementId / title"
                                    style={{
                                        background: "var(--input)",
                                        color: "var(--foreground)",
                                    }}
                                />
                            </div>


                        </div>

                        <button
                            className="btn d-flex align-items-center px-3"
                            style={{
                                background: "var(--secondary)",
                                color: "var(--secondary-foreground)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <FiFilter className="me-2" />
                            Filter
                        </button>

                        <button
                            className="btn d-flex align-items-center px-3"
                            style={{
                                background: "var(--secondary)",
                                color: "var(--secondary-foreground)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Sort: Newest
                            <FiChevronDown className="ms-2" />
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="row gy-4 mb-4">
                    {[
                        { label: "Pending Agreements", value: 12 },
                        { label: "Viewed not signed", value: 5 },
                        { label: "Signed Agreements", value: 38 },
                        { label: "Expired Agreements", value: 3 },
                    ].map((item, idx) => (
                        <div className="col-6 col-md-3" key={idx}>
                            <div
                                className="p-4 h-100"
                                style={{
                                    background: "var(--card)",
                                    borderRadius: "0.75rem",
                                    border: "1px solid var(--border)",
                                    boxShadow: "0 0.25rem 0.5rem var(--shadow-color)",
                                    minHeight: "6.5rem",               // fixed height that looks consistent
                                }}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    {/* Icon Circle */}
                                    <div
                                        className="d-flex justify-content-center align-items-center"
                                        style={{
                                            width: "2.8rem",
                                            height: "2.8rem",
                                            borderRadius: "50%",
                                            background: "var(--muted)",
                                            color: "var(--text-muted)",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <FiClock size="1.3rem" />
                                    </div>

                                    {/* Text Content */}
                                    <div>
                                        <h4
                                            className="fw-bold m-0"
                                            style={{
                                                fontSize: "1.6rem",              // large counter text
                                                color: "var(--text-strong)",
                                            }}
                                        >
                                            {item.value}
                                        </h4>

                                        <p
                                            className="m-0 mt-1"
                                            style={{
                                                fontSize: "0.95rem",
                                                color: "var(--text-muted)",
                                                lineHeight: "1.25rem",
                                            }}
                                        >
                                            {item.label}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


                {/* ------------------------- DESKTOP TABLE ------------------------- */}
                <div
                    className="table-responsive d-none d-md-block"
                    style={{
                        background: "var(--card)",
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
                        boxShadow: "0 2px 4px var(--shadow-color)",
                    }}
                >
                    <table className="table align-middle mb-0">
                        <thead>
                            <tr style={{ color: "var(--text-muted)" }}>
                                <th style={{ width: "60px" }}>#</th>
                                <th>Title</th>
                                <th>Uploaded By</th>
                                <th>Uploaded</th>
                                <th>Expiry</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sampleAgreements.map((item, idx) => (
                                <tr key={idx}>
                                    {/* Circular Serial Number */}
                                    <td>
                                        <div
                                            className="d-flex justify-content-center align-items-center"
                                            style={{
                                                width: "34px",
                                                height: "34px",
                                                borderRadius: "50%",
                                                background: "var(--muted)",
                                                color: "var(--text-strong)",
                                                fontWeight: "600",
                                                fontSize: "14px",
                                            }}
                                        >
                                            {idx + 1}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="fw-semibold" style={{ color: "var(--text-strong)" }}>
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                            {item.id}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="fw-semibold">{item.uploadedBy}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Staff</div>
                                    </td>

                                    <td>{item.uploaded}</td>

                                    <td>
                                        <span
                                            className="badge"
                                            style={{
                                                background: "var(--muted)",
                                                color: "var(--text-muted)",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {item.expiry} left
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className="badge px-3 py-2"
                                            style={{
                                                background: item.statusBg,
                                                color: item.statusColor,
                                                borderRadius: "8px",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {item.status}
                                        </span>
                                    </td>

                                    <td>
                                        <div
                                            className="d-flex justify-content-end gap-2"
                                            style={{ whiteSpace: "nowrap" }}
                                        >
                                            <button
                                                className="btn btn-sm"
                                                style={{
                                                    background: "var(--secondary)",
                                                    color: "var(--secondary-foreground)",
                                                    borderRadius: "6px",
                                                    minWidth: "70px",
                                                }}
                                            >
                                                View
                                            </button>

                                            {(item.status === "Pending" || item.status === "Viewed") && (
                                                <button
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: "var(--primary)",
                                                        color: "var(--primary-foreground)",
                                                        borderRadius: "6px",
                                                        minWidth: "70px",
                                                    }}
                                                >
                                                    Sign
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>

                {/* ------------------------- MOBILE CARD LIST ------------------------- */}
                <div className="d-block d-md-none">
                    {sampleAgreements.map((item, idx) => (
                        <div
                            key={idx}
                            className="p-3 mb-3"
                            style={{
                                background: "var(--card)",
                                borderRadius: "12px",
                                border: "1px solid var(--border)",
                                boxShadow: "0 2px 4px var(--shadow-color)",
                            }}
                        >
                            <div className="fw-bold" style={{ color: "var(--text-strong)" }}>
                                {item.title}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                {item.id}
                            </div>

                            <hr style={{ borderColor: "var(--divider)" }} />

                            <div className="mb-2">
                                <strong>Uploaded By:</strong> {item.uploadedBy}
                            </div>
                            <div className="mb-2">
                                <strong>Uploaded:</strong> {item.uploaded}
                            </div>
                            <div className="mb-2">
                                <strong>Expiry:</strong> {item.expiry} left
                            </div>

                            <span
                                className="badge px-3 py-2 mb-3"
                                style={{
                                    background: item.statusBg,
                                    color: item.statusColor,
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                }}
                            >
                                {item.status}
                            </span>

                            <div className="d-flex gap-2">
                                <button
                                    className="btn w-50"
                                    style={{
                                        background: "var(--secondary)",
                                        color: "var(--secondary-foreground)",
                                        borderRadius: "6px",
                                    }}
                                >
                                    View
                                </button>

                                {(item.status === "Pending" || item.status === "Viewed") && (
                                    <button
                                        className="btn w-50"
                                        style={{
                                            background: "var(--primary)",
                                            color: "var(--primary-foreground)",
                                            borderRadius: "6px",
                                        }}
                                    >
                                        Sign
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

// SAMPLE MOCK DATA
const sampleAgreements = [
    {
        title: "Master Service Agreement",
        id: "AGR-0007",
        uploadedBy: "Sarah Chen",
        uploaded: "2025-11-02",
        expiry: "3 days",
        status: "Pending",
        statusBg: "var(--warning)",
        statusColor: "var(--warning-foreground)",
    },
    {
        title: "Data Processing Addendum",
        id: "AGR-0008",
        uploadedBy: "Michael Patel",
        uploaded: "2025-11-01",
        expiry: "8 days",
        status: "Viewed",
        statusBg: "var(--muted)",
        statusColor: "var(--text-muted)",
    },
    {
        title: "SOW – Q4 Implementation",
        id: "AGR-0009",
        uploadedBy: "Priya Nair",
        uploaded: "2025-10-20",
        expiry: "Expired",
        status: "Expired",
        statusBg: "var(--destructive)",
        statusColor: "var(--destructive-foreground)",
    },
    {
        title: "Security & Compliance Policy",
        id: "AGR-0010",
        uploadedBy: "Daniel Ross",
        uploaded: "2025-10-18",
        expiry: "11 days",
        status: "Signed",
        statusBg: "var(--success)",
        statusColor: "var(--success-foreground)",
    },
];
