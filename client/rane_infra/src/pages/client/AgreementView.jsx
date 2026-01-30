import React, { useEffect, useState } from "react";
import ClientHeader from "../../component/header/ClientHeader";
import { getAgreementById } from "../../services/agreement";
import { useParams } from "react-router-dom";
import AgreementSignModal from "../../assets/cards/models/AgreementSignModal";
import AgreementRejectModal from "../../assets/cards/models/AgreementRejectModal";
import AgreementExtensionRequestModal from "../../assets/cards/models/AgreementExtensionRequestModal";

export default function 
AgreementView() {
    const { id } = useParams();
    const [agreement, setAgreement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSignModal, setShowSignModal] = useState(false); // used to render agreement sign modal
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showExtensionModal, setShowExtensionModal] = useState(false);



    useEffect(() => {
        async function fetchAgreement() {
            try {
                const data = await getAgreementById(id);
                setAgreement(data.agreement);
            } catch (err) {
                console.error("Failed to load agreement:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchAgreement();
    }, [id]);

    // Refresh the agreement data (used after sign/reject/extension)
    async function refreshAgreement() {
        try {
            setLoading(true);
            const data = await getAgreementById(id);
            setAgreement(data.agreement);
        } catch (err) {
            console.error("Failed to refresh agreement:", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <p className="text-center mt-5">Loading Agreement...</p>;
    if (!agreement) return <p className="text-center mt-5">Agreement not found</p>;

    return (
        <>
            <ClientHeader />

            <div
                className="container mt-3 py-3 px-2 px-md-4"
                style={{ background: "var(--background)", minHeight: "100vh" }}
            >

                {/* HEADER */}
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
                    <div>
                        <h3 className="fw-bold" style={{ color: "var(--text-strong)" }}>
                            Agreement Details
                        </h3>
                        <small className="text-muted">
                            Agreement ID: {agreement.agreementId || agreement._id}
                        </small>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="d-flex flex-column flex-sm-row gap-2">
                        {agreement.status === "expired" && (
                            <>
                                <button
                                    className="btn text-white"
                                    style={{
                                        backgroundColor: "var(--primary)",
                                        padding: "6px 14px",
                                        width: "auto",
                                    }}
                                    onClick={() => setShowExtensionModal(true)}
                                >
                                    Request Extension
                                </button>

                            </> 
                        )}


                        {/* SHOW ONLY IF NOT signed OR rejected */}
                        {agreement.status !== "signed" && agreement.status !== "rejected" && agreement.status !== "expired" && (
                            <>
                                <button
                                    className="btn text-white"
                                    style={{
                                        backgroundColor: "var(--success-foreground)",
                                        padding: "6px 14px",
                                        width: "auto"
                                    }}
                                    onClick={() => setShowSignModal(true)}
                                >
                                    Accept Agreement
                                </button>

                                <button
                                    className="btn"
                                    style={{
                                        backgroundColor: "var(--destructive)",
                                        color: "var(--destructive-foreground)",
                                        padding: "6px 14px",
                                        width: "auto"
                                    }}
                                    onClick={() => setShowRejectModal(true)}
                                >
                                    Reject
                                </button>
                            </>
                        )}
                    </div>
                </div>


                {/* LAYOUT */}
                <div className="row g-4">

                    {/* LEFT COLUMN */}
                    <div className="col-lg-8 col-12">

                        {/* SUMMARY */}
                        <div className="p-4 rounded shadow-sm" style={{ background: "var(--card)" }}>
                            <h5 className="fw-semibold mb-3">Agreement Summary</h5>

                            <h6 className="fw-bold">{agreement.title}</h6>
                            <p className="mt-2 text-break">{agreement.description}</p>

                            {/* Bootstrap Button */}
                            <button
                                className="btn mt-3"
                                style={{
                                    backgroundColor: "var(--primary)",
                                    color: "var(--primary-foreground)",
                                    border: "1px solid var(--primary)",
                                    padding: "3px 10px",
                                    fontWeight: "500"
                                }}
                                onMouseEnter={(e) =>
                                    (e.target.style.backgroundColor = "var(--primary-hover)")
                                }
                                onMouseLeave={(e) =>
                                    (e.target.style.backgroundColor = "var(--primary)")
                                }
                                onClick={() => window.open(agreement.fileUrl, "_blank")}
                            >
                                📄 View Agreement
                            </button>
                        </div>


                        {/* STATUS */}
                        <div className="p-4 rounded shadow-sm mt-4" style={{ background: "var(--card)" }}>
                            <h5 className="fw-semibold mb-3">Status</h5>

                            <p className="mb-1">
                                <span className="fw-bold">Current status:</span> {agreement.status}
                            </p>

                            <span
                                className="badge px-3 py-2 mt-2"
                                style={{
                                    background:
                                        agreement.status === "signed"
                                            ? "var(--success)"
                                            : "var(--warning)",
                                    color:
                                        agreement.status === "signed"
                                            ? "var(--success-foreground)"
                                            : "var(--warning-foreground)",
                                    fontWeight: 600,
                                }}
                            >
                                {agreement.status}
                            </span>

                            <div className="row mt-3 text-muted small gy-2">
                                <div className="col-sm-6">Uploaded: {formatDate(agreement.createdAt)}</div>
                                <div className="col-sm-6">Viewed: {formatDate(agreement.viewedAt)}</div>
                                <div className="col-sm-6">Signed: {formatDate(agreement.signedAt)}</div>
                                <div className="col-sm-6">Expiry: {formatDate(agreement.expiryDate)}</div>
                            </div>
                        </div>

                        {/* TIMELINE */}
                        <div className="p-4 rounded shadow-sm mt-4" style={{ background: "var(--card)" }}>
                            <h5 className="fw-semibold mb-3">Timeline</h5>

                            <div className="d-flex align-items-center justify-content-between flex-wrap">

                                <div className="d-flex align-items-center flex-grow-1">

                                    {/* UPLOADED → always green */}
                                    {timelineDot("var(--success-foreground)")}
                                    {timelineLine(agreement.status !== "uploaded" ? "var(--success-foreground)" : "var(--border)")}

                                    {/* VIEWED */}
                                    {timelineDot(
                                        agreement.status === "viewed" ||
                                            agreement.status === "signed" ||
                                            agreement.status === "rejected" ||
                                            agreement.status === "expired"
                                            ? "var(--success-foreground)"
                                            : "var(--border)"
                                    )}
                                    {timelineLine(
                                        agreement.status === "signed" ||
                                            agreement.status === "rejected" ||
                                            agreement.status === "expired"
                                            ? "var(--success-foreground)"
                                            : "var(--border)"
                                    )}

                                    {/* SIGNED */}
                                    {timelineDot(
                                        agreement.status === "signed"
                                            ? "var(--success-foreground)"
                                            : agreement.status === "rejected"
                                                ? "var(--destructive)"
                                                : "var(--border)"
                                    )}

                                    {/* LAST LINE COLOR */}
                                    {timelineLine(
                                        agreement.status === "expired"
                                            ? "var(--destructive)"
                                            : agreement.status === "rejected"
                                                ? "var(--destructive)"
                                                : "var(--border)"
                                    )}

                                    {/* FINAL DOT */}
                                    {timelineDot(
                                        agreement.status === "expired"
                                            ? "var(--destructive)"
                                            : agreement.status === "rejected"
                                                ? "var(--destructive)"
                                                : "var(--border)"
                                    )}
                                </div>
                            </div>

                            {/* TIMELINE LABELS */}
                            <div className="d-flex justify-content-between small mt-2 text-muted">
                                <span>Uploaded</span>
                                <span>Viewed</span>
                                <span>Signed</span>
                                <span>
                                    {agreement.status === "rejected" ? "Rejected" : "Expired"}
                                </span>
                            </div>
                        
                            {/* EXTENSION HISTORY (match admin layout) */}
                            <div className="p-4 rounded shadow-sm mt-4" style={{ background: "var(--card)" }}>
                                <h5 className="fw-semibold mb-3">Extension History</h5>

                                {(!agreement.extensions || agreement.extensions.length === 0) ? (
                                    <div className="d-flex align-items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
                                        <small className="text-muted">No extensions applied</small>
                                    </div>
                                ) : (
                                    agreement.extensions.map((ext, i) => (
                                        <div key={i} className="mb-3 p-3 rounded" style={{ background: "var(--muted)" }}>
                                            <div className="row gy-2">
                                                <div className="col-6">
                                                    <small className="text-muted">Old Expiry</small>
                                                    <div className="fw-semibold">{formatDate(ext.oldExpiryDate)}</div>
                                                </div>

                                                <div className="col-6">
                                                    <small className="text-muted">New Expiry</small>
                                                    <div className="fw-semibold" style={{ color: "var(--success-foreground)" }}>{formatDate(ext.newExpiryDate)}</div>
                                                </div>

                                                <div className="col-6">
                                                    <small className="text-muted">Extended At</small>
                                                    <div>{formatDate(ext.extendedAt)}</div>
                                                </div>

                                                <div className="col-6">
                                                    <small className="text-muted">Reason</small>
                                                    <div style={{ color: "var(--text-muted)" }}>{ext.reason || "—"}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>


                        {/* NOTES */}
                        <div className="p-4 rounded shadow-sm mt-4 mb-4" style={{ background: "var(--card)" }}>
                            <h5 className="fw-semibold mb-3">Notes & Messages</h5>

                            <small className="text-muted">Client message</small>

                            <div className="p-3 rounded mt-2" style={{ background: "var(--muted)" }}>
                                <p className="m-0">{agreement.message || "No message"}</p>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="col-lg-4 col-12 d-flex flex-column gap-4">

                        <div className="p-4 rounded shadow-sm" style={{ background: "var(--card)" }}>
                            <h5 className="fw-semibold mb-3">Participants</h5>

                            {/* Uploaded By */}
                            <div className="mb-3 d-flex align-items-center gap-2">
                                <img
                                    src={agreement.uploadedBy?.profile}
                                    alt="uploaded-by"
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                                <div>
                                    <small className="text-muted d-block">Uploaded by</small>
                                    <p className="fw-medium m-0">{agreement.uploadedBy?.name}</p>
                                </div>
                            </div>

                            {/* Client */}
                            <div className="d-flex align-items-center gap-2">
                                <img
                                    src={agreement.client?.profile}
                                    alt="client"
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                                <div>
                                    <small className="text-muted d-block">Client</small>
                                    <p className="fw-medium m-0">{agreement.client?.name}</p>
                                </div>
                            </div>
                        </div>


                        {/* SIGNATURE */}
                        <div className="p-4 rounded shadow-sm" style={{ background: "var(--card)" }}>
                            <h5 className="fw-semibold mb-3">Client Signature</h5>

                            <small className="text-muted">Signature name</small>
                            <p>{agreement.clientSignature?.name || "—"}</p>

                            <small className="text-muted">Signature date</small>
                            <p>{formatDate(agreement.clientSignature?.date)}</p>

                            <small className="text-muted">IP address</small>
                            <p>{agreement.clientSignature?.ip || "—"}</p>
                        </div>

                    </div>
                </div>
            </div>

            <AgreementExtensionRequestModal
                show={showExtensionModal}
                onClose={() => setShowExtensionModal(false)}
                agreementId={agreement._id}
                onSuccess={(updatedAgreement) => setAgreement(updatedAgreement)}
            />

            <AgreementSignModal
                show={showSignModal}
                onHide={() => setShowSignModal(false)}
                agreement={agreement}
                onSignSuccess={() => refreshAgreement()}
            />

            <AgreementRejectModal
                show={showRejectModal}
                onHide={() => setShowRejectModal(false)}
                agreement={agreement}
                onRejectSuccess={() => refreshAgreement()}
            />



        </>
    );
}

/* Helper Functions */
function formatDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleString();
}

function timelineDot(color) {
    return (
        <div
            style={{
                width: "14px",
                height: "14px",
                background: color,
                borderRadius: "50%",
            }}
        ></div>
    );
}

function timelineLine(color) {
    return (
        <div
            style={{
                flex: 1,
                height: "2px",
                background: color,
                minWidth: "20px",
            }}
        ></div>
    );
}
