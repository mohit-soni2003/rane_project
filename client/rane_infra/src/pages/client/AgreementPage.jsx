import React, { useEffect, useState } from "react";
import { FiSearch, FiFilter, FiClock, FiChevronDown } from "react-icons/fi";
import ClientHeader from "../../component/header/ClientHeader";
import { getClientAgreements } from "../../services/agreement";
import { useNavigate } from "react-router-dom";
import AgreementSignModal from "../../assets/cards/models/AgreementSignModal";
import AgreementRejectModal from "../../assets/cards/models/AgreementRejectModal";
// -------------------------------------------------
//this is the agreement overview section 
// -------------------------------------------------

export default function AgreementPage() {

    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showSignModal, setShowSignModal] = useState(false);
    const [showRejectModal, setRejectModal] = useState(false);
    const [currentSignAgreement, setCurrentSignAgreement] = useState();
    const [summary, setSummary] = useState({
        pending: 0,
        viewed: 0,
        signed: 0,
        expired: 0
    });


    const navigate = useNavigate();

    const load = async () => {
        try {
            setLoading(true);
            const data = await getClientAgreements();
            const list = data.agreements || [];

            setAgreements(list);

            // Calculate summary dynamically
            const counts = {
                pending: list.filter(a => a.status === "pending").length,
                viewed: list.filter(a => a.status === "viewed").length,
                signed: list.filter(a => a.status === "signed").length,
                expired: list.filter(a => a.status === "expired").length,
            };

            setSummary(counts);

        } catch (err) {
            console.error("Failed to load agreements:", err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        load();        // now works ✔
    }, []);


    const filteredAgreements = agreements.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.agreementId.toLowerCase().includes(search.toLowerCase())
    );


    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const daysLeft = (expiry) => {
        if (!expiry) return "—";
        const diff = (new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24);
        return Math.ceil(diff) + " days left";
    };
    const statusStyles = {
        pending: {
            background: "#FFF4CC",
            color: "#B58A00",
        },
        viewed: {
            background: "#E6F0FF",
            color: "#2A64D6",
        },
        signed: {
            background: "#D6F5D6",
            color: "#1C7C1C",
        },
        rejected: {
            background: "#FFE4E4",
            color: "#D64545",
        },
        expired: {
            background: "#EAEAEA",
            color: "#666",
        },
    };


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
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ background: "var(--input)", color: "var(--foreground)" }}
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
                        { label: "Pending Agreements", value: summary.pending },
                        { label: "Viewed Not Signed", value: summary.viewed },
                        { label: "Signed Agreements", value: summary.signed },
                        { label: "Expired Agreements", value: summary.expired },
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
                    <table className="table align-middle mb-0" style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}>
                        <thead>
                            <tr style={{ color: "var(--text-muted)", fontSize: "14px" }}>
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
                            {filteredAgreements.map((item, idx) => (
                                <tr key={idx} style={{ background: "var(--card)", borderRadius: "10px" }}>

                                    {/* Serial Number Circle */}
                                    <td>
                                        <div
                                            className="d-flex justify-content-center align-items-center"
                                            style={{
                                                width: "34px",
                                                height: "34px",
                                                borderRadius: "50%",
                                                background: "var(--muted)",
                                                color: "var(--text-strong)",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {idx + 1}
                                        </div>
                                    </td>

                                    {/* Title */}
                                    <td>
                                        <div className="fw-semibold" style={{ color: "var(--text-strong)", fontSize: "15px" }}>
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                            {item.agreementId}
                                        </div>
                                    </td>

                                    {/* Uploaded By */}
                                    <td>
                                        <div className="fw-semibold" style={{ fontSize: "14px" }}>
                                            {item.uploadedBy.name}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Staff</div>
                                    </td>

                                    {/* Uploaded Date */}
                                    <td style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                                        {formatDate(item.uploadedAt)}
                                    </td>

                                    {/* Expiry */}
                                    <td style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                                        {daysLeft(item.expiryDate)}
                                    </td>

                                    {/* Status Badge */}
                                    <td>
                                        <span
                                            className="badge px-3 py-2"
                                            style={{
                                                background: statusStyles[item.status]?.background,
                                                color: statusStyles[item.status]?.color,
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                textTransform: "capitalize",
                                            }}
                                        >
                                            {item.status}
                                        </span>
                                    </td>


                                    {/* Actions */}
                                    <td>
                                        <div className="d-flex justify-content-end gap-2" style={{ whiteSpace: "nowrap" }}>

                                            {/* View Btn */}
                                            <button
                                                className="btn btn-sm"
                                                style={{
                                                    background: "var(--secondary)",
                                                    color: "var(--secondary-foreground)",
                                                    borderRadius: "6px",
                                                    padding: "6px 14px",
                                                    fontSize: "13px",
                                                }}

                                                onClick={() => window.open(`/client/agreement/view/${item._id}`, "_blank")}
                                            >
                                                View
                                            </button>

                                            {/* Sign Button */}
                                            {(item.status === "pending" || item.status === "viewed") && (
                                                <>
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{

                                                            background: "var(--primary)",
                                                            color: "var(--primary-foreground)",
                                                            borderRadius: "6px",
                                                            padding: "6px 14px",
                                                            fontSize: "13px",
                                                        }}
                                                        onClick={() => {
                                                            setShowSignModal(true)
                                                            setCurrentSignAgreement(item)
                                                        }}>
                                                        Sign
                                                    </button>
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{

                                                            background: "var(--primary)",
                                                            color: "var(--primary-foreground)",
                                                            borderRadius: "6px",
                                                            padding: "6px 14px",
                                                            fontSize: "13px",
                                                        }}
                                                        onClick={() => {
                                                            setRejectModal(true)
                                                            setCurrentSignAgreement(item)
                                                        }}>
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>


                </div>

                {/* ------------------------- MOBILE CARD LIST ------------------------- */}
                {/* <div className="d-block d-md-none">
                    {filteredAgreements.map.map((item, idx) => (
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
                </div> */}
            </div>

            {/* SIGN MODAL */}
            <AgreementSignModal
                show={showSignModal}
                onHide={() => setShowSignModal(false)
                }
                agreement={currentSignAgreement}
                onSignSuccess={() => load()}   // 🔄 refresh page

            />

            <AgreementRejectModal
                show={showRejectModal}
                onHide={() => setRejectModal(false)}
                agreement={currentSignAgreement}
                onRejectSuccess={() => load()}   // 🔄 refresh page
            />


        </>
    );
}


