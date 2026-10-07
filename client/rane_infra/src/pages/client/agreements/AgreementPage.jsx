import React, { useEffect, useState } from "react";
import {
    FiSearch, FiX, FiFilter, FiChevronDown, FiArrowUp, FiArrowDown, FiRotateCcw,
    FiClock, FiEye, FiCheckCircle, FiAlertCircle, FiExternalLink,
} from "react-icons/fi";
import { FaFileSignature } from "react-icons/fa";
import ClientHeader from "../../../components/layout/header/ClientHeader";
import { getClientAgreements } from "../../../services/agreement";
import AgreementSignModal from "../../../components/modals/AgreementSignModal";
import AgreementRejectModal from "../../../components/modals/AgreementRejectModal";
// -------------------------------------------------
//this is the agreement overview section
// -------------------------------------------------

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

const StatusBadge = ({ status }) => {
    const { bg, color, label } = statusMeta(status);
    return (
        <span style={{
            display: "inline-block", padding: "3px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 700, background: bg, color, letterSpacing: "0.03em",
        }}>
            {label}
        </span>
    );
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = {
    fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
    textTransform: "uppercase", letterSpacing: "0.05em",
};

const thStyle = {
    padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700,
    color: "var(--text-muted)", textTransform: "uppercase",
    letterSpacing: "0.05em", whiteSpace: "nowrap",
};

const secondaryBtn = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "6px 12px", borderRadius: 7,
    border: "1px solid var(--border)",
    background: "var(--secondary)", color: "var(--secondary-foreground)",
    fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
};
const primaryBtn = {
    ...secondaryBtn, border: "none",
    background: "var(--primary)", color: "var(--primary-foreground, #fff)",
};
const dangerBtn = {
    ...secondaryBtn, border: "1px solid #f5b8b2",
    background: "#fde8e6", color: C.destructive,
};

const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    });
};

// Expiry text + urgency tone
const expiryInfo = (expiry) => {
    if (!expiry) return { text: "—", color: "var(--text-muted)" };
    const days = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: "Expired", color: C.destructive };
    if (days === 0) return { text: "Expires today", color: C.destructive };
    if (days <= 7) return { text: `${days} day${days === 1 ? "" : "s"} left`, color: C.destructive };
    return { text: `${days} days left`, color: "var(--text-muted)" };
};

export default function AgreementPage() {

    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");
    const [showSignModal, setShowSignModal] = useState(false);
    const [showRejectModal, setRejectModal] = useState(false);
    const [currentSignAgreement, setCurrentSignAgreement] = useState();
    const [summary, setSummary] = useState({
        pending: 0,
        viewed: 0,
        signed: 0,
        expired: 0
    });

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
        load();
    }, []);

    const q = search.toLowerCase();
    const filteredAgreements = agreements
        .filter(a =>
            (statusFilter === "all" || a.status === statusFilter) &&
            (a.title?.toLowerCase().includes(q) || a.agreementId?.toLowerCase().includes(q))
        )
        .sort((a, b) => {
            const diff = new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
            return sortOrder === "newest" ? diff : -diff;
        });

    const hasActiveFilters = search !== "" || statusFilter !== "all" || sortOrder !== "newest";
    const resetFilters = () => { setSearch(""); setStatusFilter("all"); setSortOrder("newest"); };

    const openAgreement = (item) => window.open(`/client/agreement/view/${item._id}`, "_blank");
    const openSign = (item) => { setCurrentSignAgreement(item); setShowSignModal(true); };
    const openReject = (item) => { setCurrentSignAgreement(item); setRejectModal(true); };
    const canAct = (item) => item.status === "pending" || item.status === "viewed";

    const renderActions = (item, stretch = false) => (
        <div style={{
            display: "flex", gap: 8, flexWrap: "wrap",
            justifyContent: stretch ? "stretch" : "flex-end",
        }}>
            <button style={{ ...secondaryBtn, flex: stretch ? 1 : "none", justifyContent: "center" }} onClick={() => openAgreement(item)}>
                View <FiExternalLink size={12} />
            </button>
            {canAct(item) && (
                <>
                    <button style={{ ...primaryBtn, flex: stretch ? 1 : "none", justifyContent: "center" }} onClick={() => openSign(item)}>
                        Sign
                    </button>
                    <button style={{ ...dangerBtn, flex: stretch ? 1 : "none", justifyContent: "center" }} onClick={() => openReject(item)}>
                        Reject
                    </button>
                </>
            )}
        </div>
    );

    return (
        <>
            <ClientHeader />

            <div style={{
                padding: "0 2px",
                fontFamily: "system-ui, -apple-system, sans-serif",
                color: "var(--foreground)",
                background: "var(--background)",
                minHeight: "100vh",
            }}>

                {/* ── Page card ── */}
                <div style={{
                    background: "var(--card)",
                    borderRadius: 14,
                    border: "1px solid var(--border)",
                    boxShadow: "0 2px 10px var(--shadow-color)",
                    overflow: "hidden",
                    marginBottom: 16,
                }}>

                    {/* ── Title bar ── */}
                    <div style={{
                        borderBottom: "1px solid var(--border)",
                        padding: "14px 20px",
                        display: "flex", alignItems: "center", gap: 10,
                    }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 8,
                            background: "var(--warning)",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                            <FaFileSignature size={16} color={C.primary} />
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>
                                My Agreements
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                                Agreements assigned to you that need your review or signature
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: "16px 20px" }}>

                        {/* ── Summary cards ── */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                            gap: 12, marginBottom: 16,
                        }}>
                            {[
                                { label: "Pending", value: summary.pending, Icon: FiClock, color: "#b58a00", bg: "var(--warning)" },
                                { label: "Viewed, not signed", value: summary.viewed, Icon: FiEye, color: C.info, bg: "#dbeafe" },
                                { label: "Signed", value: summary.signed, Icon: FiCheckCircle, color: C.success, bg: "var(--success)" },
                                { label: "Expired", value: summary.expired, Icon: FiAlertCircle, color: C.muted, bg: "var(--secondary)" },
                            ].map(({ label, value, Icon, color, bg }) => (
                                <div key={label} style={{
                                    background: bg, borderRadius: 10,
                                    padding: "12px 14px", border: "1px solid var(--border)",
                                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                                }}>
                                    <div>
                                        <div style={{ ...labelStyle, color }}>{label}</div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color, marginTop: 4, lineHeight: 1 }}>
                                            {value}
                                        </div>
                                    </div>
                                    <span style={{
                                        width: 36, height: 36, borderRadius: "50%",
                                        background: "rgba(255,255,255,0.55)",
                                        display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                    }}>
                                        <Icon size={17} color={color} />
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* ── Search / filter bar ── */}
                        <div className="ag-toolbar">
                            {/* Search */}
                            <div className="ag-search">
                                <FiSearch size={15} color={C.muted} className="ag-icon-left" />
                                <input
                                    type="text"
                                    placeholder="Search by agreement ID or title…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="ag-ctl"
                                    style={{ paddingLeft: 36, paddingRight: search ? 34 : 12 }}
                                />
                                {search && (
                                    <button type="button" aria-label="Clear search" className="ag-clear" onClick={() => setSearch("")}>
                                        <FiX size={14} color={C.muted} />
                                    </button>
                                )}
                            </div>

                            {/* Status filter */}
                            <div className="ag-select">
                                <FiFilter size={14} color={C.muted} className="ag-icon-left" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="ag-ctl"
                                    aria-label="Filter by status"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="viewed">Viewed</option>
                                    <option value="signed">Signed</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="expired">Expired</option>
                                </select>
                                <FiChevronDown size={14} color={C.muted} className="ag-icon-right" />
                            </div>

                            {/* Sort */}
                            <div className="ag-select">
                                {sortOrder === "newest"
                                    ? <FiArrowDown size={14} color={C.muted} className="ag-icon-left" />
                                    : <FiArrowUp size={14} color={C.muted} className="ag-icon-left" />}
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="ag-ctl"
                                    aria-label="Sort by upload date"
                                >
                                    <option value="newest">Uploaded: Newest</option>
                                    <option value="oldest">Uploaded: Oldest</option>
                                </select>
                                <FiChevronDown size={14} color={C.muted} className="ag-icon-right" />
                            </div>

                            {hasActiveFilters && (
                                <button type="button" className="ag-reset" onClick={resetFilters}>
                                    <FiRotateCcw size={13} /> Reset
                                </button>
                            )}

                            <div className="ag-count">
                                Showing <strong>{filteredAgreements.length}</strong> of <strong>{agreements.length}</strong> agreements
                            </div>
                        </div>

                        {/* ── Loading spinner ── */}
                        {loading && (
                            <div style={{ textAlign: "center", padding: "40px 0" }}>
                                <span style={{
                                    display: "inline-block", width: 32, height: 32,
                                    border: "3px solid var(--border)",
                                    borderTopColor: C.accent, borderRadius: "50%",
                                    animation: "spin 1s linear infinite",
                                }} />
                                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10 }}>Loading agreements…</div>
                            </div>
                        )}

                        {/* ── Empty state ── */}
                        {!loading && filteredAgreements.length === 0 && (
                            <div style={{
                                textAlign: "center", padding: "48px 20px",
                                background: "var(--muted)", borderRadius: 12,
                                border: "1px solid var(--border)",
                            }}>
                                <FaFileSignature size={32} color={C.muted} style={{ marginBottom: 12 }} />
                                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>No agreements found</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                    {search || statusFilter !== "all"
                                        ? "Try adjusting your search or filters."
                                        : "No agreements have been assigned to you yet."}
                                </div>
                            </div>
                        )}

                        {/* ── Desktop table ── */}
                        {!loading && filteredAgreements.length > 0 && (
                            <div className="d-none d-md-block" style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", minWidth: 820, borderCollapse: "collapse", fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: "var(--muted)", borderBottom: "2px solid var(--border)" }}>
                                            {["#", "Title", "Uploaded By", "Uploaded", "Expiry", "Status", "Actions"].map((h, i) => (
                                                <th key={h} style={{ ...thStyle, textAlign: i === 6 ? "right" : "left" }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAgreements.map((item, idx) => {
                                            const expiry = expiryInfo(item.expiryDate);
                                            return (
                                                <tr key={item._id || idx}
                                                    style={{ borderBottom: "1px solid var(--border)", transition: "background .15s" }}
                                                    onMouseEnter={e => e.currentTarget.style.background = "var(--muted)"}
                                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                                >
                                                    <td style={{ padding: "11px 14px" }}>
                                                        <span style={{
                                                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                            width: 26, height: 26, borderRadius: "50%",
                                                            background: "var(--secondary)", color: "var(--secondary-foreground)",
                                                            fontWeight: 700, fontSize: 11,
                                                        }}>{idx + 1}</span>
                                                    </td>
                                                    <td style={{ padding: "11px 14px", maxWidth: 260 }}>
                                                        <div style={{ fontWeight: 600, color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.title}>
                                                            {item.title || "—"}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                                                            {item.agreementId || "—"}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "11px 14px" }}>
                                                        <div style={{ fontWeight: 600, color: "var(--text-strong)" }}>{item.uploadedBy?.name || "—"}</div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Staff</div>
                                                    </td>
                                                    <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontSize: 12, whiteSpace: "nowrap" }}>
                                                        {formatDate(item.uploadedAt)}
                                                    </td>
                                                    <td style={{ padding: "11px 14px", fontSize: 12, fontWeight: 600, color: expiry.color, whiteSpace: "nowrap" }}>
                                                        {expiry.text}
                                                    </td>
                                                    <td style={{ padding: "11px 14px" }}>
                                                        <StatusBadge status={item.status} />
                                                    </td>
                                                    <td style={{ padding: "11px 14px" }}>
                                                        {renderActions(item)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* ── Mobile cards ── */}
                        {!loading && filteredAgreements.length > 0 && (
                            <div className="d-md-none">
                                {filteredAgreements.map((item, idx) => {
                                    const expiry = expiryInfo(item.expiryDate);
                                    return (
                                        <div key={item._id || idx} style={{
                                            background: "var(--card)",
                                            border: "1px solid var(--border)",
                                            borderRadius: 12, padding: "14px 16px",
                                            marginBottom: 12,
                                            boxShadow: "0 2px 8px var(--shadow-color)",
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                                    <span style={{
                                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                                        width: 26, height: 26, borderRadius: "50%",
                                                        background: "var(--secondary)", color: "var(--secondary-foreground)",
                                                        fontWeight: 700, fontSize: 11, flexShrink: 0,
                                                    }}>{idx + 1}</span>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-strong)", lineHeight: 1.2, wordBreak: "break-word" }}>
                                                            {item.title || "—"}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                                                            {item.agreementId || "—"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <StatusBadge status={item.status} />
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", marginBottom: 12 }}>
                                                <div>
                                                    <div style={{ ...labelStyle, marginBottom: 2 }}>Uploaded by</div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-strong)" }}>{item.uploadedBy?.name || "—"}</div>
                                                </div>
                                                <div>
                                                    <div style={{ ...labelStyle, marginBottom: 2 }}>Uploaded</div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-strong)" }}>{formatDate(item.uploadedAt)}</div>
                                                </div>
                                                <div>
                                                    <div style={{ ...labelStyle, marginBottom: 2 }}>Expiry</div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: expiry.color }}>{expiry.text}</div>
                                                </div>
                                            </div>

                                            {renderActions(item, true)}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* SIGN MODAL */}
            <AgreementSignModal
                show={showSignModal}
                onHide={() => setShowSignModal(false)}
                agreement={currentSignAgreement}
                onSignSuccess={() => load()}   // 🔄 refresh page
            />

            <AgreementRejectModal
                show={showRejectModal}
                onHide={() => setRejectModal(false)}
                agreement={currentSignAgreement}
                onRejectSuccess={() => load()}   // 🔄 refresh page
            />

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                select option { background: var(--input); color: var(--foreground); }
                .ag-toolbar {
                    display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
                    padding: 10px 0 14px; margin-bottom: 6px;
                    border-bottom: 1px solid var(--border);
                }
                .ag-search { position: relative; flex: 1 1 260px; min-width: 200px; }
                .ag-select { position: relative; flex: 0 1 190px; min-width: 160px; }
                .ag-ctl {
                    width: 100%; height: 38px; box-sizing: border-box;
                    border: 1px solid var(--border); border-radius: 10px;
                    background: var(--input); color: var(--foreground);
                    font-size: 13px; outline: none;
                    transition: border-color .15s, box-shadow .15s;
                }
                .ag-select .ag-ctl {
                    appearance: none; -webkit-appearance: none; cursor: pointer;
                    padding: 0 32px 0 34px;
                }
                .ag-ctl:hover { border-color: var(--muted-foreground, #8b7b74); }
                .ag-ctl:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(107, 62, 43, 0.14); }
                .ag-icon-left, .ag-icon-right {
                    position: absolute; top: 50%; transform: translateY(-50%); pointer-events: none;
                }
                .ag-icon-left { left: 12px; }
                .ag-icon-right { right: 11px; }
                .ag-clear {
                    position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
                    width: 24px; height: 24px; border: none; border-radius: 50%;
                    background: transparent; display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                }
                .ag-clear:hover { background: var(--muted); }
                .ag-reset {
                    display: inline-flex; align-items: center; gap: 6px;
                    height: 38px; padding: 0 12px; border-radius: 10px;
                    border: 1px dashed var(--border); background: transparent;
                    color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer;
                    white-space: nowrap; transition: background .15s, color .15s;
                }
                .ag-reset:hover { background: var(--secondary); color: var(--secondary-foreground); }
                .ag-count { margin-left: auto; font-size: 12px; color: var(--text-muted); white-space: nowrap; }
                .ag-count strong { color: var(--text-strong); }
                @media (max-width: 640px) {
                    .ag-search, .ag-select { flex: 1 1 100%; }
                    .ag-count { margin-left: 0; width: 100%; }
                }
            `}</style>
        </>
    );
}
