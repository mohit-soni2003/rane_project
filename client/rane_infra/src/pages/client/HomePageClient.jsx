import React, { useState, useEffect } from "react";
import { FiFileText, FiClock, FiCheckCircle, FiDollarSign, FiFile, FiUpload, FiCreditCard, FiFolder } from "react-icons/fi";
import ClientHeader from "../../component/header/ClientHeader";
import { backend_url } from "../../store/keyStore";
import { getRecentActivity } from "../../services/generalService";
import { getClientOverview, getClientBillOverview } from "../../services/dashboardService";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import RecentActivityModal from "../../component/models/RecentActivityModel";

/* ── Shared token set — same accent family used across the app's other
   dashboards, so this page reads as part of the same product rather
   than its own one-off style. ── */
const PALETTE = ['#225b31', '#3b7dd8', '#b95a52', '#6b3e2b', '#d8a13a', '#8b7b74'];
const ACCENT = '#225b31'; // matches the Client portal's header accent

/* ── Small presentational helpers (no state, no side effects) ───────── */

function SectionIntro({ title, subtitle }) {
    return (
        <>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-strong)" }}>{title}</div>
            <div style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 16, fontSize: 14 }}>
                {subtitle}
            </div>
        </>
    );
}

function Panel({ children, style }) {
    return (
        <div
            className="p-4 h-100"
            style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                boxShadow: "0 2px 10px var(--shadow-color)",
                ...style,
            }}
        >
            {children}
        </div>
    );
}

function MetricCard({ title, count, desc, icon, accent }) {
    return (
        <div
            style={{
                background: "var(--card)",
                borderRadius: 12,
                border: "1px solid var(--border)",
                borderTop: `3px solid ${accent}`,
                boxShadow: "0 2px 6px var(--shadow-color)",
                padding: 16,
                height: 122,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px var(--shadow-color)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 6px var(--shadow-color)";
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontWeight: 600, color: "var(--text-strong)", fontSize: 13 }}>{title}</div>
                <div
                    style={{
                        width: 30, height: 30, borderRadius: 8, background: accent,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", flexShrink: 0,
                    }}
                >
                    {icon}
                </div>
            </div>
            <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.1 }}>
                    {count}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>
            </div>
        </div>
    );
}

function QuickAccessCard({ title, desc, icon, accent, onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                background: "var(--card)",
                borderRadius: 12,
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${accent}`,
                boxShadow: "0 2px 6px var(--shadow-color)",
                padding: 18,
                height: 112,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: "pointer",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px var(--shadow-color)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 6px var(--shadow-color)";
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-strong)" }}>{title}</div>
                <div
                    style={{
                        width: 32, height: 32, borderRadius: 8, background: `${accent}1a`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: accent, flexShrink: 0,
                    }}
                >
                    {icon}
                </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{desc}</div>
        </div>
    );
}

export default function HomePageClient() {
    const [recentActivity, setRecentActivity] = useState([]);
    const [fullRecentActivity, setFullRecentActivity] = useState([]);
    const [showActivityModal, setShowActivityModal] = useState(false);//modal to show all recent activity 
    const [overviewData, setOverviewData] = useState(); // for the overall bill . PR , agreeent data
    const [billOverview, setBillOverview] = useState(null); // for donut chart 
    const {
        totalAmount = 0,
        paidAmount = 0,
        pendingAmount = 0,
        overdueAmount = 0,
        otherAmount = 0
    } = billOverview || {};




    const { user } = useAuthStore()
    const navigate = useNavigate();



    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getRecentActivity(user._id);
                const overview = await getClientOverview();
                const bills = await getClientBillOverview();  // ⬅ NEW

                // recent activity
                const topThree = data.activities.slice(0, 2);
                const topTen = data.activities.slice(0, 10);

                setRecentActivity(topThree);
                setFullRecentActivity(topTen);

                // overview
                if (overview?.success) {
                    setOverviewData(overview.data);
                }

                // bill overview
                if (bills?.success) {
                    setBillOverview(bills.data);   // ⬅ SET HERE
                }

            } catch (error) {
                console.log("Failed to load dashboard", error);
            }
        }

        fetchData();
    }, [user._id]);


    const overview = overviewData ? [
        {
            title: "Submitted Bills",
            count: overviewData.billcnt,
            desc: "This fiscal year",
            icon: <FiUpload size={16} />,
            bg: PALETTE[1],
        },
        {
            title: "Payment Requests",
            count: overviewData.prcnt,
            desc: "In various stages",
            icon: <FiCreditCard size={16} />,
            bg: PALETTE[0],
        },
        {
            title: "Signed Agreements",
            count: overviewData.signedAgreement,
            desc: "Fully executed",
            icon: <FiCheckCircle size={16} />,
            bg: PALETTE[0],
        },
        {
            title: "Paid Bills",
            count: overviewData.paidBillCnt,
            desc: "Full payment done",
            icon: <FiDollarSign size={16} />,
            bg: PALETTE[2],
        },
        {
            title: "Completed PR",
            count: overviewData.paidPrCnt,
            desc: "All active and historical",
            icon: <FiFileText size={16} />,
            bg: PALETTE[1],
        },
        {
            title: "Total Agreements",
            count: overviewData.agreementcnt,
            desc: "Awaiting your action",
            icon: <FiFile size={16} />,
            bg: PALETTE[4],
        },
    ] : [];



    return (
        <>
            <ClientHeader />
            {/* overview and recent activuty */}
            <div className="row mt-3">

                {/* ===================== LEFT SIDE : OVERVIEW ===================== */}

                <div className="col-lg-8 col-md-7 col-12">
                    <Panel>
                        <SectionIntro
                            title="Overview"
                            subtitle="High-level metrics across agreements, bills, and documents."
                        />

                        {/* Cards Grid – 2 rows */}
                        <div className="row g-3">
                            {overview.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 14 }}>
                                    Loading metrics...
                                </div>
                            ) : (
                                overview.map((item, index) => (
                                    <div key={index} className="col-6 col-sm-4 col-md-4 col-lg-4">
                                        <MetricCard
                                            title={item.title}
                                            count={item.count}
                                            desc={item.desc}
                                            icon={item.icon}
                                            accent={item.bg}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </Panel>
                </div>

                {/* ===================== RIGHT SIDE : RECENT ACTIVITY ===================== */}
                <div className="col-lg-4 col-md-5 col-12 mt-3 mt-md-0">
                    <Panel>
                        <SectionIntro
                            title="Recent Activity"
                            subtitle="Latest events across agreements, bills, and documents."
                        />

                        {/* Activity List */}
                        {recentActivity.map((activity, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: "flex",
                                    marginBottom: "22px",
                                    position: "relative",
                                    paddingLeft: "18px",
                                }}
                            >
                                {/* Vertical Line */}
                                <div
                                    style={{
                                        position: "absolute",
                                        left: "4px",
                                        top: "0",
                                        bottom: idx === recentActivity.length - 1 ? "50%" : "0",
                                        width: "2px",
                                        background: "var(--border)",
                                    }}
                                ></div>

                                {/* Bullet Dot */}
                                <div
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        background: ACCENT,
                                        borderRadius: "50%",
                                        marginRight: "12px",
                                        marginTop: "3px",
                                        position: "relative",
                                        zIndex: 2,
                                        flexShrink: 0,
                                    }}
                                ></div>

                                {/* Content */}
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            color: "var(--text-strong)",
                                            fontSize: "14px",
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        {activity.actionType}
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "var(--text-muted)",
                                            marginTop: "2px",
                                        }}
                                    >
                                        {new Date(activity.createdAt).toLocaleString()}
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "13px",
                                            color: "var(--text-muted)",
                                            marginTop: "4px",
                                        }}
                                    >
                                        {activity.description}
                                    </div>

                                    {/* More Button */}
                                    <button
                                        onClick={() => navigate(activity.actionUrl)}
                                        style={{
                                            marginTop: "10px",
                                            background: "transparent",
                                            color: ACCENT,
                                            border: `1px solid ${ACCENT}`,
                                            padding: "5px 14px",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            transition: "background 0.15s ease, color 0.15s ease",
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.background = ACCENT;
                                            e.target.style.color = "#fff";
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.background = "transparent";
                                            e.target.style.color = ACCENT;
                                        }}
                                    >
                                        More
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Small View More Link */}
                        <div className="text-end ">
                            <span
                                role="button"
                                onClick={() => setShowActivityModal(true)}
                                style={{
                                    fontSize: "13px",
                                    color: "var(--link)",
                                    cursor: "pointer",
                                    fontWeight: "500"
                                }}
                                onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
                                onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
                            >
                                View more →
                            </span>
                        </div>



                    </Panel>
                </div>


            </div>



            {/* BILLS + Payment Request CHART WRAPPER */}
            <div className="mt-4">
                <div className="row align-items-stretch">

                    {/* ================= LEFT CARD – DONUT CHART ================= */}
                    <div className="col-12 col-lg-6 mb-4 h-100 d-flex">
                        <Panel style={{ width: "100%" }}>
                            <SectionIntro
                                title="Bills Status Breakdown"
                                subtitle="Overview of your bill statuses."
                            />

                            <div className="row">

                                {/* ================= DONUT CHART ================= */}
                                <div className="col-12 col-md-5 d-flex justify-content-center">
                                    <div
                                        style={{
                                            width: "180px",
                                            height: "180px",
                                            borderRadius: "50%",
                                            background: `conic-gradient(
                #225b31 0 ${(billOverview?.paid / billOverview?.totalBills) * 100 || 0}%,
                #d8a13a ${(billOverview?.paid / billOverview?.totalBills) * 100 || 0}% 
                         ${((billOverview?.paid + billOverview?.pending) / billOverview?.totalBills) * 100 || 0}%,
                #3b7dd8 ${((billOverview?.paid + billOverview?.pending) / billOverview?.totalBills) * 100 || 0}% 
                         ${((billOverview?.paid + billOverview?.pending + billOverview?.unpaid) / billOverview?.totalBills) * 100 || 0}%,
                #8b7b74 ${((billOverview?.paid + billOverview?.pending + billOverview?.unpaid) / billOverview?.totalBills) * 100 || 0}% 
                        100%
            )`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            position: "relative",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "95px",
                                                height: "95px",
                                                borderRadius: "50%",
                                                background: "var(--card)",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 700,
                                                color: "var(--text-strong)",
                                            }}
                                        >
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total</div>
                                            {billOverview?.totalBills || 0}
                                        </div>
                                    </div>
                                </div>

                                {/* ================= LEGENDS ================= */}
                                <div className="col-12 col-md-7 d-flex flex-column justify-content-center mt-4 mt-md-0">
                                    {[
                                        { color: "#225b31", label: "Paid", value: billOverview?.paid || 0 },
                                        { color: "#d8a13a", label: "Pending", value: billOverview?.pending || 0 },
                                        { color: "#3b7dd8", label: "Unpaid", value: billOverview?.unpaid || 0 },
                                        {
                                            color: "#8b7b74", label: "Others (Sanctioned / Rejected / Overdue)",
                                            value: (billOverview?.sanctioned || 0) + (billOverview?.rejected || 0) + (billOverview?.overdue || 0)
                                        }
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                                            <div
                                                style={{
                                                    width: "12px",
                                                    height: "12px",
                                                    borderRadius: "3px",
                                                    background: item.color,
                                                    marginRight: "10px",
                                                    flexShrink: 0,
                                                }}
                                            ></div>
                                            <span style={{ flex: 1, fontSize: "14px", color: "var(--text-strong)" }}>
                                                {item.label}
                                            </span>
                                            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)" }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </Panel>
                    </div>

                    {/* ================= RIGHT CARD – BILLS SUMMARY ================= */}
                    <div className="col-12 col-lg-6 h-100 d-flex">
                        <Panel style={{ width: "100%" }}>
                            <SectionIntro
                                title="Bills Summary"
                                subtitle="Overview of your billing performance."
                            />

                            {/* ===== TOTAL SUBMITTED ===== */}
                            <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-strong)" }}>
                                ₹ {(totalAmount ?? 0).toLocaleString("en-IN")}
                            </div>
                            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                Total submitted
                            </div>

                            {/* ===== PROGRESS BAR (PAID %) ===== */}
                            <div
                                style={{
                                    width: "100%",
                                    height: 10,
                                    background: "var(--border)",
                                    borderRadius: 8,
                                    marginTop: 14,
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        width: `${Math.round(
                                            (paidAmount / Math.max(totalAmount, 1)) * 100
                                        )}%`,
                                        height: "100%",
                                        background: "linear-gradient(90deg, #3b7dd8, #225b31)",
                                        transition: "width 0.4s ease",
                                    }}
                                />
                            </div>

                            {/* ===== PAID / PENDING / OVERDUE / OTHERS ===== */}
                            <div className="row mt-4">
                                <div className="col-3">
                                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Paid</div>
                                    <div style={{ fontWeight: 700, color: "#225b31" }}>
                                        ₹ {(paidAmount ?? 0).toLocaleString("en-IN")}
                                    </div>
                                </div>

                                <div className="col-3">
                                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Pending</div>
                                    <div style={{ fontWeight: 700, color: "#d8a13a" }}>
                                        ₹ {(pendingAmount ?? 0).toLocaleString("en-IN")}
                                    </div>
                                </div>

                                <div className="col-3">
                                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Overdue</div>
                                    <div style={{ fontWeight: 700, color: "#c94a3a" }}>
                                        ₹ {(overdueAmount ?? 0).toLocaleString("en-IN")}
                                    </div>
                                </div>

                                <div className="col-3">
                                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Others</div>
                                    <div style={{ fontWeight: 700, color: "#8b7b74" }}>
                                        ₹ {(otherAmount ?? 0).toLocaleString("en-IN")}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 20, fontSize: 13, color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                                Last bill submitted on —
                            </div>
                        </Panel>
                    </div>



                </div>
            </div>
            {/* AGREEMENT + BILLS CHART WRAPPER */}



            {/* QUICK ACCESS SECTION */}
            <div className="mt-4">
                <Panel>
                    <SectionIntro
                        title="Quick Access"
                        subtitle="Jump directly into frequently used modules."
                    />

                    <div className="row g-3">
                        <div className="col-12 col-sm-6 col-md-3">
                            <QuickAccessCard
                                title="My Agreements"
                                desc="View, track and manage all your agreements."
                                icon={<FiFileText size={16} />}
                                accent={PALETTE[1]}
                                onClick={() => navigate("/client/agreement")}
                            />
                        </div>

                        <div className="col-12 col-sm-6 col-md-3">
                            <QuickAccessCard
                                title="My Bills"
                                desc="Submit and monitor billing activity."
                                icon={<FiCreditCard size={16} />}
                                accent={PALETTE[2]}
                                onClick={() => navigate("/client/my-bill")}
                            />
                        </div>

                        <div className="col-12 col-sm-6 col-md-3">
                            <QuickAccessCard
                                title="My Documents"
                                desc="Upload and track compliance documents."
                                icon={<FiFolder size={16} />}
                                accent={PALETTE[0]}
                                onClick={() => navigate("/client/document/category")}
                            />
                        </div>

                        <div className="col-12 col-sm-6 col-md-3">
                            <QuickAccessCard
                                title="File Forwarding"
                                desc="Track routed files and approvals."
                                icon={<FiUpload size={16} />}
                                accent={PALETTE[3]}
                                onClick={() => navigate("/client/track-dfs/all")}
                            />
                        </div>
                    </div>
                </Panel>
            </div>









            <RecentActivityModal
                show={showActivityModal}
                onHide={() => setShowActivityModal(false)}
                activities={fullRecentActivity}
                navigate={navigate}
            />



        </>
    );
}