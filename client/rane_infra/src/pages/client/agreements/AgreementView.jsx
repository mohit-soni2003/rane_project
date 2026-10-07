import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaArrowLeft, FaFileSignature, FaFileAlt, FaCalendarAlt, FaUserTie, FaUserCircle,
    FaCheck, FaTimes, FaHistory, FaCommentDots, FaSignature, FaStream, FaClock, FaEye,
} from "react-icons/fa";
import ClientHeader from "../../../components/layout/header/ClientHeader";
import { getAgreementById } from "../../../services/agreement";
import AgreementSignModal from "../../../components/modals/AgreementSignModal";
import AgreementRejectModal from "../../../components/modals/AgreementRejectModal";
import AgreementExtensionRequestModal from "../../../components/modals/AgreementExtensionRequestModal";

// ── Hardcoded icon colors ─────────────────────────────────────────────────────
const C = {
    primary: "#6b3e2b",
    accent: "#b95a52",
    success: "#225b31",
    destructive: "#c94a3a",
    muted: "#8b7b74",
    info: "#1e40af",
    warning: "#4a1f18",
};

// ── Status badge meta ─────────────────────────────────────────────────────────
const statusMeta = (status) => {
    switch (status) {
        case "pending":  return { bg: "var(--warning)", color: "var(--warning-foreground)", label: "Pending" };
        case "viewed":   return { bg: "#dbeafe", color: C.info, label: "Viewed" };
        case "signed":   return { bg: "var(--success)", color: "var(--success-foreground)", label: "Signed" };
        case "rejected": return { bg: "#fde8e6", color: C.destructive, label: "Rejected" };
        case "expired":  return { bg: "var(--secondary)", color: "var(--secondary-foreground)", label: "Expired" };
        default:         return { bg: "var(--secondary)", color: "var(--secondary-foreground)", label: status || "—" };
    }
};

const Badge = ({ meta }) => (
    <span style={{
        display: "inline-block", padding: "3px 10px", borderRadius: 20,
        fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color, letterSpacing: "0.03em",
    }}>
        {meta.label}
    </span>
);

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
    fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
    textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3,
};
const valueStyle = { fontSize: 13.5, fontWeight: 600, color: "var(--text-strong)", wordBreak: "break-word" };

const cardStyle = {
    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
    marginBottom: 16, boxShadow: "0 2px 8px var(--shadow-color)", overflow: "hidden",
};
const cardHeaderStyle = {
    display: "flex", alignItems: "center", gap: 8,
    padding: "12px 16px", borderBottom: "1px solid var(--border)",
};
const cardHeaderTitleStyle = { fontWeight: 700, fontSize: 13.5, color: "var(--text-strong)" };
const cardBodyStyle = { padding: "16px" };
const textBlockStyle = {
    fontSize: 13, color: "var(--foreground)", lineHeight: 1.55,
    background: "var(--muted)", borderRadius: 8, padding: "10px 12px",
    border: "1px solid var(--border)", wordBreak: "break-word",
};
const btnBase = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "8px 16px", borderRadius: 8, border: "none",
    fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap",
};
const primaryBtn = { ...btnBase, background: "var(--primary)", color: "var(--primary-foreground, #fff)" };
const successBtn = { ...btnBase, background: "var(--success)", color: C.success, border: "1px solid var(--border)" };
const dangerBtn = { ...btnBase, background: "#fde8e6", color: C.destructive, border: "1px solid #f5b8b2" };
const outlineBtn = { ...btnBase, background: "var(--card)", color: C.primary, border: "1px solid var(--border)" };

const formatDate = (date) => (date
    ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—");
const formatDateTime = (date) => (date ? new Date(date).toLocaleString("en-IN") : "—");

// Field block
const Field = ({ label, children }) => (
    <div>
        <div style={labelStyle}>{label}</div>
        <div style={valueStyle}>{children}</div>
    </div>
);

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ src, name, size = 40 }) => {
    const [err, setErr] = useState(false);
    const initials = typeof name === "string" && name.trim()
        ? name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase()
        : null;
    if (src && !err && !src.includes("placeholder")) {
        return <img src={src} onError={() => setErr(true)} alt={name || "user"}
            style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
    }
    return (
        <span style={{
            width: size, height: size, borderRadius: "50%",
            background: "var(--secondary)", color: "var(--secondary-foreground)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.4, fontWeight: 700, flexShrink: 0,
        }}>
            {initials || <FaUserCircle size={size} color={C.muted} />}
        </span>
    );
};

// ── Progress tracker ──────────────────────────────────────────────────────────
// Steps: Uploaded → Viewed → Signed / Rejected / Expired
const buildSteps = (a) => {
    const viewed = !!a.viewedAt || ["viewed", "signed"].includes(a.status);
    const finalState =
        a.status === "signed" ? { label: "Signed", state: "done", date: a.signedAt || a.clientSignature?.date }
            : a.status === "rejected" ? { label: "Rejected", state: "bad", date: null }
                : a.status === "expired" ? { label: "Expired", state: "bad", date: a.expiryDate }
                    : { label: "Signed", state: "todo", date: null };
    return [
        { label: "Uploaded", state: "done", date: a.uploadedAt || a.createdAt, Icon: FaFileAlt },
        { label: "Viewed", state: viewed ? "done" : "todo", date: a.viewedAt, Icon: FaEye },
        { ...finalState, Icon: finalState.state === "bad" ? FaTimes : FaSignature },
    ];
};

const stepColors = {
    done: { bg: "var(--success)", fg: C.success, line: C.success },
    bad: { bg: "#fde8e6", fg: C.destructive, line: C.destructive },
    todo: { bg: "var(--muted)", fg: C.muted, line: "var(--border)" },
};

export default function AgreementView() {
    const { id } = useParams();
    const navigate = useNavigate();
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

    const wrapStyle = {
        padding: "0 2px", fontFamily: "system-ui, -apple-system, sans-serif",
        color: "var(--foreground)", background: "var(--background)", minHeight: "100vh",
    };

    // ── Loading / not-found states ────────────────────────────────────────────
    if (loading) {
        return (
            <>
                <ClientHeader />
                <div style={wrapStyle}>
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <span style={{
                            display: "inline-block", width: 36, height: 36,
                            border: "3px solid var(--border)", borderTopColor: C.accent,
                            borderRadius: "50%", animation: "spin 1s linear infinite",
                        }} />
                        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 12 }}>Loading agreement…</div>
                    </div>
                    <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                </div>
            </>
        );
    }
    if (!agreement) {
        return (
            <>
                <ClientHeader />
                <div style={wrapStyle}>
                    <div style={{ ...cardStyle, padding: "16px", color: C.warning, background: "var(--warning)" }}>
                        Agreement not found.
                    </div>
                    <button style={outlineBtn} onClick={() => navigate("/client/agreement")}>
                        <FaArrowLeft size={12} color={C.primary} /> Back to agreements
                    </button>
                </div>
            </>
        );
    }

    const status = agreement.status;
    const canRespond = !["signed", "rejected", "expired"].includes(status);
    const pendingExtension = agreement.extensionRequest?.requested && agreement.extensionRequest?.status === "pending";
    const steps = buildSteps(agreement);
    const extensions = agreement.extensions || [];

    return (
        <>
            <ClientHeader />

            <div style={wrapStyle}>

                {/* ── Header card / actions ── */}
                <div style={{
                    ...cardStyle,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 12, padding: "14px 20px", flexWrap: "wrap",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 8, background: "var(--warning)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <FaFileSignature size={16} color={C.primary} />
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>
                                    Agreement Details
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                                    ID {agreement.agreementId || agreement._id}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {status === "expired" && (
                            <button style={primaryBtn} onClick={() => setShowExtensionModal(true)}>
                                <FaClock size={12} color="#fff" /> Request Extension
                            </button>
                        )}
                        {canRespond && (
                            <>
                                <button style={successBtn} onClick={() => setShowSignModal(true)}>
                                    <FaCheck size={12} color={C.success} /> Accept Agreement
                                </button>
                                <button style={dangerBtn} onClick={() => setShowRejectModal(true)}>
                                    <FaTimes size={12} color={C.destructive} /> Reject
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {pendingExtension && (
                    <div style={{
                        ...cardStyle, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                        background: "var(--warning)", color: "var(--warning-foreground)",
                    }}>
                        <FaClock size={14} color={C.warning} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>
                            Your extension request
                            {agreement.extensionRequest.requestedExpiryDate
                                ? ` (until ${formatDate(agreement.extensionRequest.requestedExpiryDate)})`
                                : ""} is awaiting review.
                        </span>
                    </div>
                )}

                {/* ── Main grid ── */}
                <div className="av-grid">

                    {/* LEFT COLUMN */}
                    <div style={{ minWidth: 0 }}>

                        {/* Summary */}
                        <div style={cardStyle}>
                            <div style={cardHeaderStyle}>
                                <FaFileSignature size={15} color={C.accent} />
                                <span style={cardHeaderTitleStyle}>Agreement Summary</span>
                                <span style={{ marginLeft: "auto" }}><Badge meta={statusMeta(status)} /></span>
                            </div>
                            <div style={cardBodyStyle}>
                                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-strong)", marginBottom: 8, wordBreak: "break-word" }}>
                                    {agreement.title || "—"}
                                </div>
                                <div style={textBlockStyle}>
                                    {agreement.description || "No description provided."}
                                </div>

                                <div style={{
                                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                                    gap: 14, marginTop: 16,
                                }}>
                                    <Field label="Uploaded">
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                            <FaCalendarAlt size={11} color={C.muted} />{formatDate(agreement.uploadedAt || agreement.createdAt)}
                                        </span>
                                    </Field>
                                    <Field label="Viewed">{formatDate(agreement.viewedAt)}</Field>
                                    <Field label="Signed">{formatDate(agreement.signedAt || agreement.clientSignature?.date)}</Field>
                                    <Field label="Expiry">{formatDate(agreement.expiryDate)}</Field>
                                </div>

                                {agreement.fileUrl && (
                                    <div style={{ textAlign: "right", marginTop: 16 }}>
                                        <a href={agreement.fileUrl} target="_blank" rel="noopener noreferrer" style={primaryBtn}>
                                            <FaFileAlt size={13} color="#fff" /> View Agreement
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Progress */}
                        <div style={cardStyle}>
                            <div style={cardHeaderStyle}>
                                <FaStream size={14} color={C.accent} />
                                <span style={cardHeaderTitleStyle}>Progress</span>
                            </div>
                            <div style={{ ...cardBodyStyle, paddingTop: 22 }}>
                                <div style={{ display: "flex", alignItems: "flex-start" }}>
                                    {steps.map((step, i) => {
                                        const col = stepColors[step.state];
                                        const next = steps[i + 1];
                                        return (
                                            <React.Fragment key={step.label + i}>
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 84, flexShrink: 0 }}>
                                                    <span style={{
                                                        width: 34, height: 34, borderRadius: "50%",
                                                        background: col.bg, border: `2px solid ${col.line}`,
                                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                    }}>
                                                        <step.Icon size={13} color={col.fg} />
                                                    </span>
                                                    <div style={{ fontSize: 12, fontWeight: 700, color: step.state === "todo" ? "var(--text-muted)" : "var(--text-strong)", marginTop: 8, textAlign: "center" }}>
                                                        {step.label}
                                                    </div>
                                                    <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2, textAlign: "center" }}>
                                                        {step.date ? formatDate(step.date) : "—"}
                                                    </div>
                                                </div>
                                                {next && (
                                                    <div style={{
                                                        flex: 1, height: 2, marginTop: 16, minWidth: 20,
                                                        background: next.state === "todo" ? "var(--border)" : stepColors[next.state].line,
                                                    }} />
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Extension history */}
                        <div style={cardStyle}>
                            <div style={cardHeaderStyle}>
                                <FaHistory size={14} color={C.accent} />
                                <span style={cardHeaderTitleStyle}>Extension History</span>
                                <span style={{
                                    marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
                                    background: "var(--muted)", padding: "2px 9px", borderRadius: 20,
                                }}>{extensions.length}</span>
                            </div>
                            <div style={cardBodyStyle}>
                                {extensions.length === 0 ? (
                                    <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
                                        No extensions applied.
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {extensions.map((ext, i) => (
                                            <div key={ext._id || i} style={{
                                                background: "var(--muted)", border: "1px solid var(--border)",
                                                borderRadius: 10, padding: "12px 14px",
                                                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12,
                                            }}>
                                                <Field label="Old expiry">{formatDate(ext.oldExpiryDate)}</Field>
                                                <Field label="New expiry"><span style={{ color: C.success }}>{formatDate(ext.newExpiryDate)}</span></Field>
                                                <Field label="Extended on">{formatDate(ext.extendedAt)}</Field>
                                                <Field label="Reason">{ext.reason || "—"}</Field>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div style={cardStyle}>
                            <div style={cardHeaderStyle}>
                                <FaCommentDots size={15} color={C.accent} />
                                <span style={cardHeaderTitleStyle}>Notes &amp; Messages</span>
                            </div>
                            <div style={cardBodyStyle}>
                                <div style={labelStyle}>Client message</div>
                                <div style={textBlockStyle}>{agreement.message || "No message."}</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ minWidth: 0 }}>

                        {/* Participants */}
                        <div style={cardStyle}>
                            <div style={cardHeaderStyle}>
                                <FaUserTie size={15} color={C.accent} />
                                <span style={cardHeaderTitleStyle}>Participants</span>
                            </div>
                            <div style={{ ...cardBodyStyle, display: "flex", flexDirection: "column", gap: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Avatar src={agreement.uploadedBy?.profile} name={agreement.uploadedBy?.name} />
                                    <div style={{ minWidth: 0 }}>
                                        <div style={labelStyle}>Uploaded by</div>
                                        <div style={valueStyle}>{agreement.uploadedBy?.name || "—"}</div>
                                    </div>
                                </div>
                                <div style={{ height: 1, background: "var(--border)" }} />
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Avatar src={agreement.client?.profile} name={agreement.client?.name} />
                                    <div style={{ minWidth: 0 }}>
                                        <div style={labelStyle}>Client</div>
                                        <div style={valueStyle}>{agreement.client?.name || "—"}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Signature */}
                        <div style={cardStyle}>
                            <div style={cardHeaderStyle}>
                                <FaSignature size={15} color={C.accent} />
                                <span style={cardHeaderTitleStyle}>Client Signature</span>
                            </div>
                            <div style={{ ...cardBodyStyle, display: "flex", flexDirection: "column", gap: 14 }}>
                                <Field label="Signature name">{agreement.clientSignature?.name || "—"}</Field>
                                <Field label="Signature date">{formatDateTime(agreement.clientSignature?.date)}</Field>
                                <Field label="IP address">
                                    <span style={{ fontFamily: "monospace", fontSize: 12.5 }}>{agreement.clientSignature?.ip || "—"}</span>
                                </Field>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AgreementExtensionRequestModal
                show={showExtensionModal}
                onClose={() => setShowExtensionModal(false)}
                agreementId={agreement._id}
                agreement={agreement}
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

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .av-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 16px; align-items: start; }
                @media (max-width: 991px) { .av-grid { grid-template-columns: minmax(0, 1fr); } }
            `}</style>
        </>
    );
}
