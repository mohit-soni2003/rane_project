import React, { useState, useEffect } from "react";
import {
    FiFileText, FiRefreshCw, FiBarChart2, FiClock, FiDownload,
    FiChevronDown, FiChevronUp, FiSearch, FiX, FiAlertCircle,
    FiPlus, FiEdit2, FiTrash2, FiRotateCcw, FiCheck
} from "react-icons/fi";
import { sorService } from "../../services/sor.service.js";
import AdminHeader from "../../component/header/AdminHeader.jsx";

const scheduleDescriptions = {
    "Fire Extinguishers": "Portable, trolley-mounted and specialty extinguisher labour items with active rate references for current works.",
    "Fire Pipes": "MS, GI, and CPVC pipe routing, supports, cutting, joining, and pressure testing labour rates.",
    "Sprinkler System": "Branch line installation, head mounting, drops, flexible hoses, and commissioning activities.",
    "Fire Alarm System": "Detectors, MCPs, hooters, control panels, loop wiring, testing and integration labour scope.",
    "Pumps & Accessories": "Main, jockey, diesel pump alignment, manifold assembly, vibration pads and ancillary works.",
    "Valves & Accessories": "Butterfly valves, NRVs, pressure gauges, test lines, trims and equipment identification jobs.",
    "Hydrant System": "Landing valves, hose boxes, branch pipes, cabinets, signage and outlet installation works.",
};

// ── small helpers ──────────────────────────────────────────────

function ItemBadge({ label }) {
    return (
        <span style={{
            background: "var(--warning)", color: "var(--warning-foreground)",
            fontFamily: "monospace", fontSize: 11, fontWeight: 600,
            padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap",
        }}>{label}</span>
    );
}

function VersionBadge({ v }) {
    return (
        <span style={{
            background: "var(--secondary)", color: "var(--secondary-foreground)",
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
        }}>v{v}</span>
    );
}

function StatusBadge({ active }) {
    return (
        <span style={{
            background: active ? "var(--success)" : "var(--border)",
            color: active ? "var(--success-foreground)" : "var(--text-muted)",
            fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
            whiteSpace: "nowrap",
        }}>{active ? "Active" : "Superseded"}</span>
    );
}

// ── Inline edit row ────────────────────────────────────────────

function EditRow({ item, onSave, onCancel, saving }) {
    const [form, setForm] = useState({
        description: item.description,
        unit: item.unit,
        rate_low: item.rate_low,
        rate_high: item.rate_high ?? "",
    });

    const inputStyle = {
        border: "1px solid var(--border)", borderRadius: 6,
        padding: "5px 8px", fontSize: 12, color: "var(--foreground)",
        background: "var(--input)", outline: "none", width: "100%",
    };

    return (
        <tr style={{ background: "#fef3ee" }}>
            <td style={{ padding: "8px 12px", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>—</td>
            <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
                <ItemBadge label={item.item_number} />
            </td>
            <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
                <textarea
                    rows={2}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ ...inputStyle, resize: "none", minWidth: 260 }}
                />
            </td>
            <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
                <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} style={{ ...inputStyle, minWidth: 70 }}>
                    {["Each", "Meter", "Set", "Rmt"].map(u => <option key={u}>{u}</option>)}
                </select>
            </td>
            <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
                <input type="number" value={form.rate_low} onChange={e => setForm(f => ({ ...f, rate_low: e.target.value }))} style={{ ...inputStyle, minWidth: 70 }} />
            </td>
            <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
                <input type="number" value={form.rate_high} placeholder="—" onChange={e => setForm(f => ({ ...f, rate_high: e.target.value }))} style={{ ...inputStyle, minWidth: 70 }} />
            </td>
            <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
                <VersionBadge v={item.version} />
            </td>
            <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
                <StatusBadge active={item.is_latest} />
            </td>
            <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 6 }}>
                    <button
                        onClick={() => onSave(form)}
                        disabled={saving}
                        style={{
                            display: "flex", alignItems: "center", gap: 4,
                            padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                            background: saving ? "var(--muted)" : "var(--primary)",
                            color: saving ? "var(--text-muted)" : "#fff",
                            border: "none", cursor: saving ? "not-allowed" : "pointer",
                        }}
                    >
                        <FiCheck size={12} /> {saving ? "Saving…" : "Save"}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={saving}
                        style={{
                            padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                            background: "transparent", color: "var(--text-muted)",
                            border: "1px solid var(--border)", cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ── Delete confirm row ─────────────────────────────────────────

function DeleteConfirmRow({ item, onConfirm, onCancel, deleting }) {
    return (
        <tr style={{ background: "#fff0ee" }}>
            <td colSpan={9} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <FiAlertCircle size={16} color="#b95a52" />
                    <span style={{ fontSize: 13, color: "var(--foreground)" }}>
                        Are you sure you want to delete item <strong>{item.item_number}</strong>? This cannot be undone.
                    </span>
                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        style={{
                            display: "flex", alignItems: "center", gap: 4,
                            padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                            background: deleting ? "var(--muted)" : "#b95a52",
                            color: deleting ? "var(--text-muted)" : "#fff",
                            border: "none", cursor: deleting ? "not-allowed" : "pointer",
                        }}
                    >
                        <FiTrash2 size={12} /> {deleting ? "Deleting…" : "Yes, Delete"}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={deleting}
                        style={{
                            padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                            background: "transparent", color: "var(--text-muted)",
                            border: "1px solid var(--border)", cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ── Version History side panel ─────────────────────────────────

function HistoryPanel({ item, onClose }) {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await sorService.getItemHistory(item.item_number);
                setVersions(data);
            } catch (err) {
                console.error("Error fetching history:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [item.item_number]);

    return (
        <div style={{
            position: "fixed", top: 0, right: 0, width: 360, height: "100vh",
            background: "var(--card)", borderLeft: "1px solid var(--border)",
            zIndex: 1000, display: "flex", flexDirection: "column",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.1)",
        }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-strong)" }}>Version History</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                        <ItemBadge label={item.item_number} />
                    </div>
                </div>
                <span onClick={onClose} style={{ cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                    <FiX size={18} />
                </span>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
                {loading && (
                    <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 13 }}>
                        <FiRefreshCw size={18} color="#b95a52" style={{ marginBottom: 8, animation: "spin 1s linear infinite" }} />
                        <div>Loading history…</div>
                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: 13 }}>
                        <FiAlertCircle size={18} color="#b95a52" style={{ marginBottom: 8 }} />
                        <div>{error}</div>
                    </div>
                )}

                {!loading && !error && versions.map((ver, i) => (
                    <div key={ver._id} style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                        {/* Timeline dot + line */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                            <div style={{
                                width: 10, height: 10, borderRadius: "50%", marginTop: 4,
                                background: ver.is_latest ? "#6b3e2b" : "var(--border)",
                                border: `2px solid ${ver.is_latest ? "#6b3e2b" : "var(--text-muted)"}`,
                            }} />
                            {i < versions.length - 1 && (
                                <div style={{ width: 1, flex: 1, background: "var(--border)", marginTop: 4 }} />
                            )}
                        </div>

                        {/* Entry */}
                        <div style={{ flex: 1, background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", marginBottom: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                <VersionBadge v={ver.version} />
                                {ver.is_latest && (
                                    <span style={{ background: "var(--success)", color: "var(--success-foreground)", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20 }}>
                                        Current
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                                {ver.updated_at ? new Date(ver.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                {ver.updated_by?.name && ` · ${ver.updated_by.name}`}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--foreground)", marginBottom: 4 }}>
                                Rate: <span style={{ color: "#b95a52", fontWeight: 600 }}>₹{ver.rate_low}</span>
                                {ver.rate_high && <> – <span style={{ color: "#6b3e2b", fontWeight: 600 }}>₹{ver.rate_high}</span></>}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                                {ver.description?.slice(0, 80)}{ver.description?.length > 80 ? "…" : ""}
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && !error && versions.length === 0 && (
                    <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 13 }}>
                        No history found for this item.
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Schedule Section ───────────────────────────────────────────

function ScheduleSection({ name, items, defaultExpanded, onEdit, onDelete, onHistory, onAddItem, savingId, deletingId }) {
    const [open, setOpen] = useState(defaultExpanded);

    const thStyle = {
        padding: "8px 12px", fontSize: 10, fontWeight: 600, color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.06em",
        borderBottom: "1px solid var(--border)", background: "var(--muted)",
        whiteSpace: "nowrap",
    };

    return (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>

            {/* Accordion header */}
            <div style={{
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                padding: "12px 16px", background: open ? "var(--secondary)" : "var(--card)",
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span onClick={() => setOpen(v => !v)} style={{ fontWeight: 700, fontSize: 15, color: "var(--text-strong)", cursor: "pointer" }}>
                            {name}
                        </span>
                        <span style={{ background: "var(--warning)", color: "var(--warning-foreground)", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>
                            {items.length} items
                        </span>
                        <span style={{ background: "var(--secondary)", color: "var(--secondary-foreground)", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4 }}>
                            v3.2
                        </span>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{scheduleDescriptions[name] || ""}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <button
                        onClick={() => onAddItem(name)}
                        style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                            background: "transparent", color: "#6b3e2b",
                            border: "1px solid #6b3e2b", cursor: "pointer",
                        }}
                    >
                        <FiPlus size={13} color="#6b3e2b" /> Add Item
                    </button>
                    <span onClick={() => setOpen(v => !v)} style={{ color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
                        {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </span>
                </div>
            </div>

            {/* Table */}
            {open && (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                        <thead>
                            <tr>
                                <th style={{ ...thStyle, width: 40 }}>S.No</th>
                                <th style={{ ...thStyle, width: 90 }}>Item No</th>
                                <th style={{ ...thStyle }}>Description</th>
                                <th style={{ ...thStyle, width: 70, textAlign: "center" }}>Unit</th>
                                <th style={{ ...thStyle, width: 90, textAlign: "right" }}>Rate Low</th>
                                <th style={{ ...thStyle, width: 90, textAlign: "right" }}>Rate High</th>
                                <th style={{ ...thStyle, width: 70, textAlign: "center" }}>Version</th>
                                <th style={{ ...thStyle, width: 90, textAlign: "center" }}>Status</th>
                                <th style={{ ...thStyle, width: 110, textAlign: "center" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => {
                                const rowState = item._rowState;

                                if (rowState === "edit") {
                                    return (
                                        <EditRow
                                            key={item._id}
                                            item={item}
                                            saving={savingId === item._id}
                                            onSave={(form) => onEdit(item, form)}
                                            onCancel={() => onEdit(item, null)}
                                        />
                                    );
                                }

                                return (
                                    <React.Fragment key={item._id}>
                                        <tr
                                            style={{ background: idx % 2 === 0 ? "var(--card)" : "var(--muted)", opacity: rowState === "delete" ? 0.5 : 1 }}
                                            onMouseEnter={e => { if (rowState !== "delete") e.currentTarget.style.background = "var(--secondary)"; }}
                                            onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "var(--card)" : "var(--muted)"}
                                        >
                                            <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                                                {String(idx + 1).padStart(2, "0")}
                                            </td>
                                            <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                                                <ItemBadge label={item.item_number} />
                                            </td>
                                            <td style={{ padding: "10px 12px", fontSize: 13, color: "var(--foreground)", borderBottom: "1px solid var(--border)", lineHeight: 1.5, maxWidth: 320 }}>
                                                <span title={item.description} style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                    {item.description}
                                                </span>
                                            </td>
                                            <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-muted)", fontWeight: 500, borderBottom: "1px solid var(--border)", textAlign: "center", whiteSpace: "nowrap" }}>
                                                {item.unit}
                                            </td>
                                            <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", textAlign: "right", whiteSpace: "nowrap" }}>
                                                <span style={{ fontWeight: 600, color: "#b95a52", fontSize: 13 }}>₹{item.rate_low}</span>
                                            </td>
                                            <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", textAlign: "right", whiteSpace: "nowrap" }}>
                                                {item.rate_high
                                                    ? <span style={{ fontWeight: 600, color: "#6b3e2b", fontSize: 13 }}>₹{item.rate_high}</span>
                                                    : <span style={{ color: "var(--text-muted)" }}>—</span>
                                                }
                                            </td>
                                            <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
                                                <VersionBadge v={item.version} />
                                            </td>
                                            <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
                                                <StatusBadge active={item.is_latest} />
                                            </td>
                                            <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                                    <span
                                                        title="Edit item"
                                                        onClick={() => onEdit(item, "open")}
                                                        style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                                    >
                                                        <FiEdit2 size={13} color="#6b3e2b" />
                                                    </span>
                                                    <span
                                                        title="Version history"
                                                        onClick={() => onHistory(item)}
                                                        style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                                    >
                                                        <FiRotateCcw size={13} color="#8b7b74" />
                                                    </span>
                                                    <span
                                                        title="Delete item"
                                                        onClick={() => onDelete(item, "open")}
                                                        style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                                    >
                                                        <FiTrash2 size={13} color="#b95a52" />
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>

                                        {rowState === "delete" && (
                                            <DeleteConfirmRow
                                                item={item}
                                                deleting={deletingId === item._id}
                                                onConfirm={() => onDelete(item, "confirm")}
                                                onCancel={() => onDelete(item, "cancel")}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ── Field wrapper (must be outside AddItemPanel to avoid remount on every keystroke) ──

function Field({ label, error, children }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
            </label>
            {children}
            {error && <div style={{ fontSize: 11, color: "#b95a52", marginTop: 3 }}>{error}</div>}
        </div>
    );
}

// ── Add Item side panel ────────────────────────────────────────

function AddItemPanel({ scheduleNames, defaultSchedule, onClose, onSave, saving }) {
    const [form, setForm] = useState({
        schedule: defaultSchedule || scheduleNames[0] || "",
        item_number: "",
        description: "",
        unit: "Each",
        rate_low: "",
        rate_high: "",
    });
    const [errors, setErrors] = useState({});

    const inputStyle = (err) => ({
        width: "100%", border: `1px solid ${err ? "#b95a52" : "var(--border)"}`,
        borderRadius: 7, padding: "8px 10px", fontSize: 13,
        color: "var(--foreground)", background: "var(--input)",
        outline: "none", boxSizing: "border-box",
    });

    const validate = () => {
        const e = {};
        if (!form.schedule) e.schedule = "Required";
        if (!form.item_number.trim()) e.item_number = "Required";
        if (!form.description.trim()) e.description = "Required";
        if (!form.rate_low) e.rate_low = "Required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };



    return (
        <div style={{
            position: "fixed", top: 0, right: 0, width: 400, height: "100vh",
            background: "var(--card)", borderLeft: "1px solid var(--border)",
            zIndex: 1000, display: "flex", flexDirection: "column",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.1)",
        }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-strong)" }}>Add New SOR Item</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>New entry will be versioned automatically</div>
                </div>
                <span onClick={onClose} style={{ cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                    <FiX size={18} />
                </span>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "18px" }}>
                <Field label="Schedule" error={errors.schedule}>
                    <select value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))} style={inputStyle(errors.schedule)}>
                        {scheduleNames.map(n => <option key={n}>{n}</option>)}
                    </select>
                </Field>
                <Field label="Item Number" error={errors.item_number}>
                    <input type="text" placeholder="e.g. FE-101" value={form.item_number} onChange={e => setForm(f => ({ ...f, item_number: e.target.value }))} style={inputStyle(errors.item_number)} />
                </Field>
                <Field label="Description" error={errors.description}>
                    <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle(errors.description), resize: "vertical" }} />
                </Field>
                <Field label="Unit">
                    <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} style={inputStyle(false)}>
                        {["Each", "Meter", "Set", "Rmt"].map(u => <option key={u}>{u}</option>)}
                    </select>
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Rate Low (₹)" error={errors.rate_low}>
                        <input type="number" placeholder="e.g. 100" value={form.rate_low} onChange={e => setForm(f => ({ ...f, rate_low: e.target.value }))} style={inputStyle(errors.rate_low)} />
                    </Field>
                    <Field label="Rate High (₹)">
                        <input type="number" placeholder="Optional" value={form.rate_high} onChange={e => setForm(f => ({ ...f, rate_high: e.target.value }))} style={inputStyle(false)} />
                    </Field>
                </div>
            </div>

            <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
                <button
                    onClick={() => { if (validate()) onSave(form); }}
                    disabled={saving}
                    style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        padding: "9px", borderRadius: 7, fontSize: 13, fontWeight: 600,
                        background: saving ? "var(--muted)" : "#6b3e2b",
                        color: saving ? "var(--text-muted)" : "#fff",
                        border: "none", cursor: saving ? "not-allowed" : "pointer",
                    }}
                >
                    <FiCheck size={14} color={saving ? "var(--text-muted)" : "#fff"} /> {saving ? "Saving…" : "Save Item"}
                </button>
                <button
                    onClick={onClose}
                    disabled={saving}
                    style={{
                        padding: "9px 16px", borderRadius: 7, fontSize: 13, fontWeight: 500,
                        background: "transparent", color: "var(--text-muted)",
                        border: "1px solid var(--border)", cursor: "pointer",
                    }}
                >
                    Discard
                </button>
            </div>
        </div>
    );
}

// ── Main Admin Component ───────────────────────────────────────

export default function SORAdmin() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedSchedule, setSelectedSchedule] = useState("All");

    const [historyItem, setHistoryItem] = useState(null);
    const [addPanel, setAddPanel] = useState(null);

    const [rowStates, setRowStates] = useState({});   // { [_id]: 'edit' | 'delete' }
    const [savingId, setSavingId]   = useState(null); // _id currently being saved
    const [deletingId, setDeletingId] = useState(null); // _id currently being deleted
    const [addSaving, setAddSaving] = useState(false);

    // ── fetch ──
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await sorService.getSORData();
            setData(result);
        } catch (err) {
            console.error("Failed to fetch SOR data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const scheduleNames = Object.keys(data);
    const totalItems    = Object.values(data).reduce((sum, arr) => sum + arr.length, 0);

    // inject _rowState
    const dataWithState = Object.fromEntries(
        Object.entries(data).map(([name, items]) => [
            name,
            items.map(item => ({ ...item, _rowState: rowStates[item._id] || null }))
        ])
    );

    const filteredData = Object.entries(dataWithState).reduce((acc, [name, items]) => {
        if (selectedSchedule !== "All" && name !== selectedSchedule) return acc;
        const filtered = items.filter(item =>
            !search ||
            item.description.toLowerCase().includes(search.toLowerCase()) ||
            String(item.item_number).toLowerCase().includes(search.toLowerCase())
        );
        if (filtered.length > 0) acc[name] = filtered;
        return acc;
    }, {});

    const clearRow = (id) => setRowStates(s => { const n = { ...s }; delete n[id]; return n; });

    // ── Edit handler ──
    const handleEdit = async (item, action) => {
        if (action === "open") {
            setRowStates(s => ({ ...s, [item._id]: "edit" }));
            return;
        }
        if (action === null) {
            clearRow(item._id);
            return;
        }
        // action = form object → call API
        setSavingId(item._id);
        try {
            await sorService.updateItem(item.item_number, action);
            await fetchData(); // refresh to get new version
            clearRow(item._id);
        } catch (err) {
            console.error("Update failed:", err);
            alert(`Failed to update item: ${err.message}`);
        } finally {
            setSavingId(null);
        }
    };

    // ── Delete handler ──
    const handleDelete = async (item, action) => {
        if (action === "open") {
            setRowStates(s => ({ ...s, [item._id]: "delete" }));
            return;
        }
        if (action === "cancel") {
            clearRow(item._id);
            return;
        }
        // action === "confirm"
        setDeletingId(item._id);
        try {
            await sorService.deleteItem(item.item_number);
            await fetchData();
            clearRow(item._id);
        } catch (err) {
            console.error("Delete failed:", err);
            alert(`Failed to delete item: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    // ── Add Item handler ──
    const handleSaveNewItem = async (form) => {
        setAddSaving(true);
        try {
            await sorService.addItem(form);
            await fetchData();
            setAddPanel(null);
        } catch (err) {
            console.error("Add item failed:", err);
            alert(`Failed to add item: ${err.message}`);
        } finally {
            setAddSaving(false);
        }
    };

    const btnStyle = {
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)",
        background: "var(--card)", color: "var(--foreground)", fontSize: 12,
        fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
    };

    return (
        <>
            <AdminHeader />

            {(historyItem || addPanel) && (
                <div
                    onClick={() => { setHistoryItem(null); setAddPanel(null); }}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 999 }}
                />
            )}

            {historyItem && <HistoryPanel item={historyItem} onClose={() => setHistoryItem(null)} />}
            {addPanel && (
                <AddItemPanel
                    scheduleNames={scheduleNames}
                    defaultSchedule={typeof addPanel === "string" ? addPanel : scheduleNames[0]}
                    onClose={() => setAddPanel(null)}
                    onSave={handleSaveNewItem}
                    saving={addSaving}
                />
            )}

            <div style={{ background: "var(--background)", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--foreground)" }}>

                {/* Page title bar */}
                <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <FiFileText size={15} color="#6b3e2b" />
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)" }}>Schedule Of Rates — Admin</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Manage items, rates, versions and schedules</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", padding: "3px 8px", background: "var(--muted)", borderRadius: 5 }}>
                            <FiClock size={11} /> Last updated 14 Jan 2025
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", padding: "3px 8px", background: "var(--muted)", borderRadius: 5 }}>
                            <FiBarChart2 size={11} /> {loading ? "..." : totalItems.toLocaleString()} items
                        </span>
                        <button style={{ ...btnStyle, background: "var(--secondary)" }}><FiDownload size={12} /> Download PDF</button>
                        <button style={{ ...btnStyle, background: "var(--secondary)" }}><FiDownload size={12} /> Export Excel</button>
                        <button onClick={() => setAddPanel(true)} style={{ ...btnStyle, background: "#6b3e2b", color: "#fff", border: "none" }}>
                            <FiPlus size={13} color="#fff" /> Add New Item
                        </button>
                    </div>
                </div>

                <div style={{ padding: "16px 20px" }}>

                    {/* Stat cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
                        {[
                            { label: "Total SOR Items",    value: loading ? "—" : totalItems.toLocaleString(), sub: "Across active fire safety schedules",    icon: <FiBarChart2 size={15} /> },
                            { label: "Total Schedules",    value: loading ? "—" : scheduleNames.length,        sub: "Grouped for faster review",              icon: <FiFileText size={15} /> },
                            { label: "Latest Version",     value: "v3.2",                                      sub: "Approved for ongoing works",             icon: <FiRefreshCw size={15} /> },
                            { label: "Last Updated",       value: "14 Jan 2025",                               sub: "Published by technical standards team",  icon: <FiClock size={15} /> },
                        ].map(s => (
                            <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{s.label}</span>
                                    <span style={{ color: "var(--text-muted)" }}>{s.icon}</span>
                                </div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-strong)", marginBottom: 3 }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filter bar */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-strong)", marginBottom: 2 }}>Find SOR records</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Search, filter and manage items. All edits are versioned automatically.</div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Search</label>
                                <div style={{ position: "relative" }}>
                                    <FiSearch size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                    <input
                                        type="text"
                                        placeholder="Search by item number or description"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 7, padding: "7px 28px 7px 30px", fontSize: 13, color: "var(--foreground)", background: "var(--input)", outline: "none", boxSizing: "border-box" }}
                                    />
                                    {search && <FiX size={13} onClick={() => setSearch("")} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", cursor: "pointer" }} />}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Schedule</label>
                                <select value={selectedSchedule} onChange={e => setSelectedSchedule(e.target.value)} disabled={loading} style={{ border: "1px solid var(--border)", borderRadius: 7, padding: "7px 10px", fontSize: 13, color: "var(--foreground)", background: "var(--input)", cursor: "pointer", outline: "none", minWidth: 140 }}>
                                    <option value="All">All schedules</option>
                                    {scheduleNames.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <button style={{ ...btnStyle, padding: "7px 12px" }} onClick={() => { setSearch(""); setSelectedSchedule("All"); }}>
                                <FiRefreshCw size={13} /> Reset Filters
                            </button>
                        </div>
                        <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
                            {!loading && `Showing ${Object.values(filteredData).reduce((s, a) => s + a.length, 0)} items across ${Object.keys(filteredData).length} schedules · `}
                            <span style={{ color: "#b95a52", fontWeight: 500 }}>Admin mode: edits tracked and versioned</span>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                            <FiRefreshCw size={22} color="#b95a52" style={{ marginBottom: 12, animation: "spin 1s linear infinite" }} />
                            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading schedule data…</div>
                            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                            <FiAlertCircle size={24} color="#b95a52" style={{ marginBottom: 10 }} />
                            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)", marginBottom: 6 }}>Failed to load data</div>
                            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>{error}</div>
                            <button onClick={fetchData} style={{ ...btnStyle, margin: "0 auto", background: "#6b3e2b", color: "#fff", border: "none" }}>
                                <FiRefreshCw size={13} color="#fff" /> Retry
                            </button>
                        </div>
                    )}

                    {/* No results */}
                    {!loading && !error && Object.keys(filteredData).length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                            <FiSearch size={24} style={{ marginBottom: 10, opacity: 0.4 }} />
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No items found</div>
                            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Try adjusting your search or filters.</div>
                        </div>
                    )}

                    {/* Schedule sections */}
                    {!loading && !error && Object.entries(filteredData).map(([name, items], i) => (
                        <ScheduleSection
                            key={name}
                            name={name}
                            items={items}
                            defaultExpanded={i === 0}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onHistory={setHistoryItem}
                            onAddItem={setAddPanel}
                            savingId={savingId}
                            deletingId={deletingId}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}