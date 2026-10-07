import React, { useEffect, useState } from "react";
import {
  FiSearch, FiX, FiFilter, FiChevronDown, FiArrowUp, FiArrowDown, FiRotateCcw,
  FiExternalLink, FiClock, FiAlertCircle, FiSend,
} from "react-icons/fi";
import { FaArchive } from "react-icons/fa";
import ClientHeader from "../../../components/layout/header/ClientHeader";
import { getClientAgreements } from "../../../services/agreement";
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
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
  padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)",
  background: "var(--secondary)", color: "var(--secondary-foreground)",
  fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
};
const primaryBtn = {
  ...secondaryBtn, border: "none",
  background: "var(--primary)", color: "var(--primary-foreground, #fff)",
};
const disabledBtn = {
  ...secondaryBtn, background: "var(--muted)", color: "var(--text-muted)",
  cursor: "not-allowed", opacity: 0.8,
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// "Expired 12 days ago" style text
const expiredAgo = (expiry) => {
  if (!expiry) return "—";
  const days = Math.floor((new Date() - new Date(expiry)) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Expired today";
  if (days === 1) return "Expired yesterday";
  return `Expired ${days} days ago`;
};

export default function ClosedAgreement() {
  const [closedAgreements, setClosedAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [extFilter, setExtFilter] = useState("all"); // all | can | requested
  const [sortOrder, setSortOrder] = useState("recent"); // recent | oldest
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [currentAgreement, setCurrentAgreement] = useState(null);

  useEffect(() => {
    const fetchClosedAgreements = async () => {
      try {
        const response = await getClientAgreements("expired");
        const agreements = response.agreements || [];
        setClosedAgreements(agreements);
      } catch (error) {
        console.error("Error loading closed agreements", error);
        setClosedAgreements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClosedAgreements();
  }, []);

  const handleRequestExtension = (id) => {
    const agreement = closedAgreements.find(a => a._id === id);
    setCurrentAgreement(agreement);
    setShowExtensionModal(true);
  };

  // After a request is submitted, reflect it in the list straight away
  const handleExtensionSuccess = (updated) => {
    if (updated?._id) {
      setClosedAgreements(prev => prev.map(a =>
        a._id === updated._id ? { ...a, extensionRequest: updated.extensionRequest } : a
      ));
    }
    setShowExtensionModal(false);
  };

  const isRequested = (a) => !!a.extensionRequest?.requested;
  const wasRejected = (a) => !a.extensionRequest?.requested && a.extensionRequest?.status === "rejected";

  const q = search.toLowerCase();
  const filteredAgreements = closedAgreements
    .filter(a =>
      (a.title?.toLowerCase().includes(q) || a.agreementId?.toLowerCase().includes(q)) &&
      (extFilter === "all" || (extFilter === "requested" ? isRequested(a) : !isRequested(a)))
    )
    .sort((a, b) => {
      const diff = new Date(b.expiryDate || 0) - new Date(a.expiryDate || 0);
      return sortOrder === "recent" ? diff : -diff;
    });

  const requestedCount = closedAgreements.filter(isRequested).length;
  const canRequestCount = closedAgreements.length - requestedCount;

  const hasActiveFilters = search !== "" || extFilter !== "all" || sortOrder !== "recent";
  const resetFilters = () => { setSearch(""); setExtFilter("all"); setSortOrder("recent"); };

  const openAgreement = (item) => window.open(`/client/agreement/view/${item._id}`, "_blank");

  // ── Reusable renderers ──
  const renderExtensionState = (item) => {
    if (isRequested(item)) {
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20,
          fontSize: 11, fontWeight: 700, background: "var(--warning)", color: "var(--warning-foreground)",
        }}>
          <FiClock size={11} /> Extension pending
        </span>
      );
    }
    if (wasRejected(item)) {
      return (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20,
          fontSize: 11, fontWeight: 700, background: "#fde8e6", color: C.destructive,
        }}>
          Last request rejected
        </span>
      );
    }
    return <span style={{ fontSize: 12, color: "var(--text-muted)" }}>No request yet</span>;
  };

  const renderActions = (item, stretch) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: stretch ? "stretch" : "flex-end" }}>
      <button style={{ ...secondaryBtn, flex: stretch ? 1 : "none" }} onClick={() => openAgreement(item)}>
        View <FiExternalLink size={12} />
      </button>
      {isRequested(item) ? (
        <button style={{ ...disabledBtn, flex: stretch ? 1 : "none" }} disabled>
          Extension requested
        </button>
      ) : (
        <button style={{ ...primaryBtn, flex: stretch ? 1 : "none" }} onClick={() => handleRequestExtension(item._id)}>
          <FiSend size={11} /> {wasRejected(item) ? "Request again" : "Request extension"}
        </button>
      )}
    </div>
  );

  return (
    <>
      <ClientHeader />

      <div style={{
        padding: "0 2px", fontFamily: "system-ui, -apple-system, sans-serif",
        color: "var(--foreground)", background: "var(--background)", minHeight: "100vh",
      }}>

        {/* ── Page card ── */}
        <div style={{
          background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)",
          boxShadow: "0 2px 10px var(--shadow-color)", overflow: "hidden", marginBottom: 16,
        }}>

          {/* ── Title bar ── */}
          <div style={{
            borderBottom: "1px solid var(--border)", padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: "var(--warning)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <FaArchive size={15} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>
                Closed Agreements
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                Agreements that have expired — request an extension to reopen them
              </div>
            </div>
          </div>

          <div style={{ padding: "16px 20px" }}>

            {/* ── Summary cards ── */}
            {!loading && closedAgreements.length > 0 && (
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12, marginBottom: 16,
              }}>
                {[
                  { label: "Expired agreements", value: closedAgreements.length, Icon: FaArchive, color: C.muted, bg: "var(--secondary)" },
                  { label: "Extension pending", value: requestedCount, Icon: FiClock, color: "#b58a00", bg: "var(--warning)" },
                  { label: "Can request extension", value: canRequestCount, Icon: FiAlertCircle, color: C.info, bg: "#dbeafe" },
                ].map(({ label, value, Icon, color, bg }) => (
                  <div key={label} style={{
                    background: bg, borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                  }}>
                    <div>
                      <div style={{ ...labelStyle, color }}>{label}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color, marginTop: 4, lineHeight: 1 }}>{value}</div>
                    </div>
                    <span style={{
                      width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.55)",
                      display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon size={16} color={color} />
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Search / filter bar ── */}
            {!loading && closedAgreements.length > 0 && (
              <div className="cl-toolbar">
                <div className="cl-search">
                  <FiSearch size={15} color={C.muted} className="cl-icon-left" />
                  <input
                    type="text"
                    placeholder="Search by agreement ID or title…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="cl-ctl"
                    style={{ paddingLeft: 36, paddingRight: search ? 34 : 12 }}
                  />
                  {search && (
                    <button type="button" aria-label="Clear search" className="cl-clear" onClick={() => setSearch("")}>
                      <FiX size={14} color={C.muted} />
                    </button>
                  )}
                </div>

                <div className="cl-select">
                  <FiFilter size={14} color={C.muted} className="cl-icon-left" />
                  <select value={extFilter} onChange={(e) => setExtFilter(e.target.value)} className="cl-ctl" aria-label="Filter by extension status">
                    <option value="all">All agreements</option>
                    <option value="can">Can request extension</option>
                    <option value="requested">Extension pending</option>
                  </select>
                  <FiChevronDown size={14} color={C.muted} className="cl-icon-right" />
                </div>

                <div className="cl-select">
                  {sortOrder === "recent"
                    ? <FiArrowDown size={14} color={C.muted} className="cl-icon-left" />
                    : <FiArrowUp size={14} color={C.muted} className="cl-icon-left" />}
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="cl-ctl" aria-label="Sort by expiry date">
                    <option value="recent">Expired: Most recent</option>
                    <option value="oldest">Expired: Oldest</option>
                  </select>
                  <FiChevronDown size={14} color={C.muted} className="cl-icon-right" />
                </div>

                {hasActiveFilters && (
                  <button type="button" className="cl-reset" onClick={resetFilters}>
                    <FiRotateCcw size={13} /> Reset
                  </button>
                )}

                <div className="cl-count">
                  Showing <strong>{filteredAgreements.length}</strong> of <strong>{closedAgreements.length}</strong> agreements
                </div>
              </div>
            )}

            {/* ── Loading ── */}
            {loading && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <span style={{
                  display: "inline-block", width: 32, height: 32,
                  border: "3px solid var(--border)", borderTopColor: C.accent,
                  borderRadius: "50%", animation: "spin 1s linear infinite",
                }} />
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10 }}>Loading closed agreements…</div>
              </div>
            )}

            {/* ── Empty state ── */}
            {!loading && filteredAgreements.length === 0 && (
              <div style={{
                textAlign: "center", padding: "48px 20px",
                background: "var(--muted)", borderRadius: 12, border: "1px solid var(--border)",
              }}>
                <FaArchive size={32} color={C.muted} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>
                  No closed agreements found
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {hasActiveFilters
                    ? "Try adjusting your search or filters."
                    : "You have no expired agreements — nothing needs an extension."}
                </div>
              </div>
            )}

            {/* ── Desktop table ── */}
            {!loading && filteredAgreements.length > 0 && (
              <div className="d-none d-md-block" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--muted)", borderBottom: "2px solid var(--border)" }}>
                      {["#", "Title", "Uploaded By", "Uploaded", "Expired", "Extension", "Actions"].map((h, i) => (
                        <th key={h} style={{ ...thStyle, textAlign: i === 6 ? "right" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgreements.map((item, idx) => (
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
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{item.agreementId || "—"}</div>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ fontWeight: 600, color: "var(--text-strong)" }}>{item.uploadedBy?.name || "—"}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Staff</div>
                        </td>
                        <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontSize: 12, whiteSpace: "nowrap" }}>
                          {formatDate(item.uploadedAt)}
                        </td>
                        <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-strong)" }}>{formatDate(item.expiryDate)}</div>
                          <div style={{ fontSize: 11, color: C.destructive, marginTop: 2 }}>{expiredAgo(item.expiryDate)}</div>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          {renderExtensionState(item)}
                          {isRequested(item) && item.extensionRequest?.requestedExpiryDate && (
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                              Until {formatDate(item.extensionRequest.requestedExpiryDate)}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "11px 14px" }}>{renderActions(item)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Mobile cards ── */}
            {!loading && filteredAgreements.length > 0 && (
              <div className="d-md-none">
                {filteredAgreements.map((item, idx) => (
                  <div key={item._id || idx} style={{
                    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
                    padding: "14px 16px", marginBottom: 12, boxShadow: "0 2px 8px var(--shadow-color)",
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
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{item.agreementId || "—"}</div>
                        </div>
                      </div>
                      {renderExtensionState(item)}
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
                        <div style={{ ...labelStyle, marginBottom: 2 }}>Expired</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-strong)" }}>{formatDate(item.expiryDate)}</div>
                        <div style={{ fontSize: 11, color: C.destructive, marginTop: 1 }}>{expiredAgo(item.expiryDate)}</div>
                      </div>
                      {isRequested(item) && item.extensionRequest?.requestedExpiryDate && (
                        <div>
                          <div style={{ ...labelStyle, marginBottom: 2 }}>Requested until</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-strong)" }}>
                            {formatDate(item.extensionRequest.requestedExpiryDate)}
                          </div>
                        </div>
                      )}
                    </div>

                    {renderActions(item, true)}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* EXTENSION REQUEST MODAL */}
      <AgreementExtensionRequestModal
        show={showExtensionModal}
        onClose={() => setShowExtensionModal(false)}
        agreementId={currentAgreement?._id}
        agreement={currentAgreement}
        onSuccess={handleExtensionSuccess}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: var(--input); color: var(--foreground); }
        .cl-toolbar {
          display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
          padding: 10px 0 14px; margin-bottom: 6px; border-bottom: 1px solid var(--border);
        }
        .cl-search { position: relative; flex: 1 1 260px; min-width: 200px; }
        .cl-select { position: relative; flex: 0 1 200px; min-width: 170px; }
        .cl-ctl {
          width: 100%; height: 38px; box-sizing: border-box;
          border: 1px solid var(--border); border-radius: 10px;
          background: var(--input); color: var(--foreground);
          font-size: 13px; outline: none; transition: border-color .15s, box-shadow .15s;
        }
        .cl-select .cl-ctl { appearance: none; -webkit-appearance: none; cursor: pointer; padding: 0 32px 0 34px; }
        .cl-ctl:hover { border-color: var(--muted-foreground, #8b7b74); }
        .cl-ctl:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(107, 62, 43, 0.14); }
        .cl-icon-left, .cl-icon-right { position: absolute; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .cl-icon-left { left: 12px; }
        .cl-icon-right { right: 11px; }
        .cl-clear {
          position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
          width: 24px; height: 24px; border: none; border-radius: 50%; background: transparent;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .cl-clear:hover { background: var(--muted); }
        .cl-reset {
          display: inline-flex; align-items: center; gap: 6px;
          height: 38px; padding: 0 12px; border-radius: 10px;
          border: 1px dashed var(--border); background: transparent;
          color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap;
          transition: background .15s, color .15s;
        }
        .cl-reset:hover { background: var(--secondary); color: var(--secondary-foreground); }
        .cl-count { margin-left: auto; font-size: 12px; color: var(--text-muted); white-space: nowrap; }
        .cl-count strong { color: var(--text-strong); }
        @media (max-width: 640px) {
          .cl-search, .cl-select { flex: 1 1 100%; }
          .cl-count { margin-left: 0; width: 100%; }
        }
      `}</style>
    </>
  );
}
