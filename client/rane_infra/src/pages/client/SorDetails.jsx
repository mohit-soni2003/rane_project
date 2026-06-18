import { useState, useEffect } from "react";
import { FiFileText, FiRefreshCw, FiBarChart2, FiClock, FiDownload, FiChevronDown, FiChevronUp, FiSearch, FiX, FiAlertCircle } from "react-icons/fi";
import { sorService } from "../../services/sor.service.js";
import ClientHeader from "../../component/header/ClientHeader.jsx";

const scheduleDescriptions = {
    "Fire Extinguishers": "Portable, trolley mounted, and specialty extinguishers with installation labour rate references.",
    "Fire Pipes": "MS, GI, and CPVC pipe routing, supports, cutting, joining, and pressure testing labour rates.",
    "Sprinkler System": "Branch line installation, head mounting, drops, flexible hoses, and commissioning activities.",
    "Fire Alarm System": "Detectors, MCPs, hooters, control panels, loop wiring, testing and integration labour scope.",
    "Pumps & Accessories": "Main, jockey, diesel pump alignment, manifold assembly, vibration pads and ancillary works.",
    "Valves & Accessories": "Butterfly valves, NRVs, pressure gauges, test lines, trims and equipment identification jobs.",
    "Hydrant System": "Landing valves, hose boxes, branch pipes, cabinets, signage and outlet installation works.",
};

function RateDisplay({ low, high }) {
    if (!high) return <span style={{ fontWeight: 600, color: "var(--accent)", fontSize: 13 }}>₹{low}</span>;
    return (
        <span style={{ fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: "var(--accent)" }}>₹{low}</span>
            <span style={{ color: "var(--text-muted)", margin: "0 3px" }}>–</span>
            <span style={{ fontWeight: 600, color: "var(--primary)" }}>₹{high}</span>
        </span>
    );
}

function ScheduleSection({ name, items, defaultExpanded }) {
    const [open, setOpen] = useState(defaultExpanded);

    return (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
            <div
                onClick={() => setOpen(v => !v)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: "pointer", background: open ? "var(--secondary)" : "var(--card)" }}
            >
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-strong)" }}>{name}</span>
                        <span style={{ background: "var(--warning)", color: "var(--warning-foreground)", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>
                            {items.length} items
                        </span>
                        {open && (
                            <span style={{ background: "var(--success)", color: "var(--success-foreground)", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>
                                Expanded
                            </span>
                        )}
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{scheduleDescriptions[name] || ""}</span>
                </div>
                <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </span>
            </div>

            {open && (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
                        <thead>
                            <tr>
                                {["S.No", "Item No", "Description", "Unit", "Rate"].map((h, i) => (
                                    <th key={h} style={{
                                        padding: "8px 12px",
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: "var(--text-muted)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                        borderBottom: "1px solid var(--border)",
                                        background: "var(--muted)",
                                        textAlign: i === 4 ? "right" : i === 3 ? "center" : "left",
                                        whiteSpace: "nowrap",
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr
                                    key={item._id}
                                    style={{ background: idx % 2 === 0 ? "var(--card)" : "var(--muted)" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--secondary)"}
                                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "var(--card)" : "var(--muted)"}
                                >
                                    <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                                        {String(idx + 1).padStart(2, "0")}
                                    </td>
                                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                                        <span style={{ background: "var(--warning)", color: "var(--warning-foreground)", fontFamily: "monospace", fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 4 }}>
                                            {item.item_number}
                                        </span>
                                    </td>
                                    <td style={{ padding: "10px 12px", fontSize: 13, color: "var(--foreground)", borderBottom: "1px solid var(--border)", lineHeight: 1.5 }}>
                                        {item.description}
                                    </td>
                                    <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-muted)", fontWeight: 500, borderBottom: "1px solid var(--border)", textAlign: "center", whiteSpace: "nowrap" }}>
                                        {item.unit}
                                    </td>
                                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", textAlign: "right", whiteSpace: "nowrap" }}>
                                        <RateDisplay low={item.rate_low} high={item.rate_high} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default function ScheduleOfRates() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedSchedule, setSelectedSchedule] = useState("All");

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
    const totalItems = Object.values(data).reduce((sum, arr) => sum + arr.length, 0);

    const filteredData = Object.entries(data).reduce((acc, [name, items]) => {
        if (selectedSchedule !== "All" && name !== selectedSchedule) return acc;
        const filtered = items.filter(item =>
            !search ||
            item.description.toLowerCase().includes(search.toLowerCase()) ||
            String(item.item_number).toLowerCase().includes(search.toLowerCase())
        );
        if (filtered.length > 0) acc[name] = filtered;
        return acc;
    }, {});

    const btnStyle = {
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)",
        background: "var(--card)", color: "var(--foreground)", fontSize: 12,
        fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
    };

    return (
        <>
            <ClientHeader />

            <div className="shadow-sm border-0 my-3 py-1" style={{
                background: "var(--background)",
                minHeight: "100vh",
                fontFamily: "system-ui, -apple-system, sans-serif",
                color: "var(--foreground)",
            }}>

                {/* Page title bar — full width, flush with content edge */}
                <div style={{
                    background: "var(--background)",
                    borderBottom: "1px solid var(--border)",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <FiFileText size={15} color="var(--primary)" />
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>Schedule Of Rates (SOR)</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Fire Fighting, Fire Alarm and Safety Installation Labour Rates</div>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", padding: "3px 8px", background: "var(--muted)", borderRadius: 5 }}>
                            <FiClock size={11} /> Last updated 14 Jan 2025
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", padding: "3px 8px", background: "var(--muted)", borderRadius: 5 }}>
                            <FiRefreshCw size={11} /> Version v3.2
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", padding: "3px 8px", background: "var(--muted)", borderRadius: 5 }}>
                            <FiBarChart2 size={11} /> {loading ? "..." : totalItems.toLocaleString()} items
                        </span>
                        <button style={{ ...btnStyle, background: "var(--secondary)" }}>
                            <FiDownload size={12} /> Download PDF
                        </button>
                        <button style={{ ...btnStyle, background: "var(--primary)", color: "#fff", border: "none" }}>
                            <FiDownload size={12} /> Export Excel
                        </button>
                    </div>
                </div>

                {/* Main content — padding only, no maxWidth centering */}
                <div style={{ padding: "16px 20px" }}>

                    {/* Stat cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
                        {[
                            { label: "Total SOR Items", value: loading ? "—" : totalItems.toLocaleString(), sub: "Across active fire safety schedules", icon: <FiBarChart2 size={15} /> },
                            { label: "Total Schedules", value: loading ? "—" : scheduleNames.length, sub: "Grouped for faster review", icon: <FiFileText size={15} /> },
                            { label: "Current Version", value: "v3.2", sub: "Approved for ongoing works", icon: <FiRefreshCw size={15} /> },
                            { label: "Last Revision Date", value: "14 Jan 2025", sub: "Published by technical standards team", icon: <FiClock size={15} /> },
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

                    {/* Search & filter */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-strong)", marginBottom: 2 }}>Find SOR records</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Comfortable browsing for large datasets with grouped schedules and quick filtering.</div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                            {/* Search */}
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
                                    {search && (
                                        <FiX size={13} onClick={() => setSearch("")} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", cursor: "pointer" }} />
                                    )}
                                </div>
                            </div>

                            {/* Schedule dropdown */}
                            <div>
                                <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Schedule</label>
                                <select
                                    value={selectedSchedule}
                                    onChange={e => setSelectedSchedule(e.target.value)}
                                    disabled={loading}
                                    style={{ border: "1px solid var(--border)", borderRadius: 7, padding: "7px 10px", fontSize: 13, color: "var(--foreground)", background: "var(--input)", cursor: "pointer", outline: "none", minWidth: 140 }}
                                >
                                    <option value="All">All schedules</option>
                                    {scheduleNames.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>

                            {/* Reset */}
                            <button style={{ ...btnStyle, padding: "7px 12px" }} onClick={() => { setSearch(""); setSelectedSchedule("All"); }}>
                                <FiRefreshCw size={13} /> Reset Filters
                            </button>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                            <FiRefreshCw size={22} color="var(--accent)" style={{ marginBottom: 12, animation: "spin 1s linear infinite" }} />
                            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading schedule data…</div>
                            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                            <FiAlertCircle size={24} color="var(--accent)" style={{ marginBottom: 10 }} />
                            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)", marginBottom: 6 }}>Failed to load data</div>
                            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>{error}</div>
                            <button onClick={fetchData} style={{ ...btnStyle, margin: "0 auto", background: "var(--primary)", color: "#fff", border: "none" }}>
                                <FiRefreshCw size={13} /> Retry
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
                        <ScheduleSection key={name} name={name} items={items} defaultExpanded={i === 0} />
                    ))}
                </div>
            </div>
        </>
    );
}