import React, { useState, useEffect } from "react";
import { FiFileText, FiClock, FiCheckCircle,FiDollarSign,FiFile,     FiUpload, FiCreditCard, FiFolder } from "react-icons/fi";
import ClientHeader from "../../component/header/ClientHeader";
import { backend_url } from "../../store/keyStore";
import { getRecentActivity } from "../../services/generalService";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import RecentActivityModal from "../../component/models/RecentActivityModel";


export default function ClientDashboard() {
    const [recentActivity, setRecentActivity] = useState([]);
    const [fullRecentActivity, setFullRecentActivity] = useState([]);
    const [showActivityModal, setShowActivityModal] = useState(false);//modal to show all recent activity 

    const { user } = useAuthStore()
    const navigate = useNavigate();

    const overview = [
        {
            title: "Submitted Bills",
            count: 38,
            desc: "This fiscal year",
            icon: <FiUpload size={20} />,
            bg: "linear-gradient(135deg, #e6f4ff 0%, #f3faff 100%)",
        },
        {
            title: "Payment Requests",
            count: 11,
            desc: "In various stages",
            icon: <FiCreditCard size={20} />,
            bg: "linear-gradient(135deg, #e4faf8 0%, #f3fdfc 100%)",
        },
        {
            title: "Signed Agreements",
            count: 92,
            desc: "Fully executed",
            icon: <FiCheckCircle size={20} />,
            bg: "linear-gradient(135deg, #d9f2e4 0%, #eefaf2 100%)",
        },
        {
            title: "Paid Bills",
            count: 64,
            desc: "Full Payment Done",
            icon: <FiDollarSign size={20} />,
            bg: "linear-gradient(135deg, #f2edf7 0%, #faf7ff 100%)",
        },
        {
            title: "Completed PR",
            count: 128,
            desc: "All active and historical",
            icon: <FiFileText size={20} />,
            bg: "linear-gradient(135deg, #e8e7ff 0%, #f7f6ff 100%)",
        },
        {
            title: "Total Agreements",
            count: 14,
            desc: "Awaiting your action",
            icon: <FiFile size={20} />,
            bg: "linear-gradient(135deg, #ffe9d6 0%, #fff4ea 100%)",
        },
    ];
    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getRecentActivity(user._id);


                // Store only top 3
                const topThree = data.activities.slice(0, 2);
                const topTen = data.activities.slice(0, 10);

                setRecentActivity(topThree);
                setFullRecentActivity(topTen);

                console.log(topThree);
            } catch (error) {
                console.log("Failed to load activity", error);
            }

        }
        fetchData();
    }, [user._id]);


    return (
        <>
            <ClientHeader />
            {/* overview and recent activuty */}
            <div className="row mt-3">

                {/* ===================== LEFT SIDE : OVERVIEW ===================== */}

                <div className="col-lg-8 col-md-7 col-12">
                    <div
                        className="p-4"
                        style={{
                            backgroundColor: "var(--background)",
                            boxShadow: "0px 2px 10px var(--shadow-color)",
                            borderRadius: "14px",
                            height: "100%",
                        }}
                    >
                        {/* Title */}
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-strong)" }}>
                            Overview
                        </div>
                        <div
                            style={{
                                color: "var(--text-muted)",
                                marginBottom: "14px",
                                marginTop: "4px",
                                fontSize: "14px",
                            }}
                        >
                            High-level metrics across agreements, bills, and documents.
                        </div>

                        {/* Cards Grid – 2 rows */}
                        <div className="row g-3">
                            {overview.map((item, index) => (
                                <div
                                    key={index}
                                    className="col-6 col-sm-4 col-md-4 col-lg-4"
                                >
                                    <div
                                        style={{
                                            background: item.bg,
                                            borderRadius: "14px",
                                            padding: "14px",
                                            boxShadow: "0 2px 5px var(--shadow-color)",
                                            border: "1px solid var(--border)",
                                            height: "120px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        {/* Title + Icon */}
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                fontWeight: 600,
                                                color: "var(--text-strong)",
                                                fontSize: "13px",
                                            }}
                                        >
                                            <div>{item.title}</div>
                                            <div
                                                style={{
                                                    background: "var(--card)",
                                                    padding: "5px",
                                                    borderRadius: "8px",
                                                    border: "1px solid var(--border)",
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                {item.icon}
                                            </div>
                                        </div>

                                        {/* Count */}
                                        <div
                                            style={{
                                                fontSize: "24px",
                                                fontWeight: 700,
                                                color: "var(--text-strong)",
                                                marginTop: "6px",
                                            }}
                                        >
                                            {item.count}
                                        </div>

                                        {/* Description */}
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                            {item.desc}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ===================== RIGHT SIDE : RECENT ACTIVITY ===================== */}
                <div className="col-lg-4 col-md-5 col-12 mt-3 mt-md-0">
                    <div
                        className="p-4"
                        style={{
                            backgroundColor: "var(--background)",
                            boxShadow: "0px 2px 10px var(--shadow-color)",
                            borderRadius: "14px",
                            height: "100%",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "16px",
                                fontWeight: 700,
                                color: "var(--text-strong)",
                            }}
                        >
                            Recent Activity
                        </div>

                        <div
                            style={{
                                color: "var(--text-muted)",
                                marginBottom: "16px",
                                marginTop: "4px",
                                fontSize: "14px",
                            }}
                        >
                            Latest events across agreements, bills, and documents.
                        </div>

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
                                        background: "#D1C7B7",
                                    }}
                                ></div>

                                {/* Bullet Dot */}
                                <div
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        background: "#7B3F00",
                                        borderRadius: "50%",
                                        marginRight: "12px",
                                        position: "relative",
                                        zIndex: 2,
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
                                            marginTop: "8px",
                                            background: "#7B3F00",
                                            color: "#fff",
                                            border: "none",
                                            padding: "6px 14px",
                                            fontSize: "12px",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            transition: "0.2s",
                                        }}
                                        onMouseOver={(e) => (e.target.style.opacity = "0.8")}
                                        onMouseOut={(e) => (e.target.style.opacity = "1")}
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



                    </div>
                </div>


            </div>



            {/* AGREEMENT + BILLS CHART WRAPPER */}
            <div
                className="mt-4"
                style={{
                }}
            >
                <div className="row align-items-stretch">

                    {/* ================= LEFT CARD – DONUT CHART ================= */}
                    <div className="col-12 col-lg-6 mb-4 h-100 d-flex">
                        <div
                            className="p-4 h-100 w-100"
                            style={{
                                backgroundColor: "var(--background)",
                                borderRadius: "14px",
                                border: "1px solid var(--border)",
                                boxShadow: "0px 1px 5px var(--shadow-color)",
                            }}
                        >
                            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-strong)" }}>
                                Agreements Status Breakdown
                            </div>

                            <div
                                style={{
                                    color: "var(--text-muted)",
                                    marginBottom: "20px",
                                    marginTop: "4px",
                                    fontSize: "14px",
                                }}
                            >
                                Distribution across your agreement lifecycle.
                            </div>

                            <div className="row">
                                {/* Donut Chart */}
                                <div className="col-12 col-md-5 d-flex justify-content-center">
                                    <div
                                        style={{
                                            width: "180px",
                                            height: "180px",
                                            borderRadius: "50%",
                                            background: `conic-gradient(
                                                #2d7cfa 0 25%, 
                                                #ff9f01 25% 36%, 
                                                #1bb55c 36% 74%, 
                                                #a1a4aa 74% 100%
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
                                                background: "var(--background)",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 700,
                                                color: "var(--text-strong)",
                                            }}
                                        >
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total</div>
                                            128
                                        </div>
                                    </div>
                                </div>

                                {/* Legends */}
                                <div className="col-12 col-md-7 d-flex flex-column justify-content-center mt-4 mt-md-0">
                                    {[
                                        { color: "#2d7cfa", label: "Active", value: 54 },
                                        { color: "#ff9f01", label: "Pending", value: 14 },
                                        { color: "#1bb55c", label: "Signed / Closed", value: 48 },
                                        { color: "#a1a4aa", label: "Rejected / Expired", value: 12 },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                                            <div
                                                style={{
                                                    width: "12px",
                                                    height: "12px",
                                                    borderRadius: "3px",
                                                    background: item.color,
                                                    marginRight: "10px",
                                                }}
                                            ></div>
                                            <span style={{ width: "140px", fontSize: "14px", color: "var(--text-strong)" }}>
                                                {item.label}
                                            </span>
                                            <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ================= RIGHT CARD – BILLS SUMMARY ================= */}
                    <div className="col-12 col-lg-6 h-100 d-flex">
                        <div
                            className="p-4 h-100 w-100"
                            style={{
                                backgroundColor: "var(--background)",
                                borderRadius: "14px",
                                border: "1px solid var(--border)",
                                boxShadow: "0px 1px 5px var(--shadow-color)",
                            }}
                        >
                            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-strong)" }}>
                                Bills Summary
                            </div>

                            <div style={{ color: "var(--text-muted)", marginBottom: "10px", marginTop: "4px" }}>
                                Overview of your billing performance.
                            </div>

                            {/* Total Submitted */}
                            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-strong)" }}>
                                ₹ 1,84,500
                            </div>
                            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Total submitted</div>

                            {/* Progress bar */}
                            <div
                                style={{
                                    width: "100%",
                                    height: "10px",
                                    background: "#e6e6e6",
                                    borderRadius: "8px",
                                    marginTop: "12px",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        width: "72%",
                                        height: "100%",
                                        background: "linear-gradient(90deg, #2d7cfa, #1bb55c)",
                                    }}
                                />
                            </div>

                            {/* Paid / Pending / Overdue */}
                            <div className="row mt-4">
                                <div className="col-4">
                                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Paid</div>
                                    <div style={{ fontWeight: 700, fontSize: "16px" }}>₹ 1,32,000</div>
                                </div>

                                <div className="col-4">
                                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Pending</div>
                                    <div style={{ fontWeight: 700, fontSize: "16px" }}>₹ 38,500</div>
                                </div>

                                <div className="col-4">
                                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Overdue</div>
                                    <div style={{ fontWeight: 700, fontSize: "16px", opacity: 0.4 }}>₹ 14,000</div>
                                </div>
                            </div>

                            <div style={{ marginTop: "20px", fontSize: "14px", color: "var(--text-muted)" }}>
                                Last bill submitted on 12 Oct 2025.
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            {/* AGREEMENT + BILLS CHART WRAPPER */}



            {/* QUICK ACCESS SECTION */}
            <div
                className="mt-4 p-4"
                style={{
                    backgroundColor: "var(--background)",
                    boxShadow: "0px 2px 10px var(--shadow-color)",
                    borderRadius: "14px",
                }}
            >
                {/* Title */}
                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-strong)" }}>
                    Quick Access
                </div>
                <div
                    style={{
                        color: "var(--text-muted)",
                        marginBottom: "16px",
                        marginTop: "4px",
                        fontSize: "14px",
                    }}
                >
                    Jump directly into frequently used modules.
                </div>

                <div className="row g-3">
                    {/* My Agreements */}
                    <div className="col-12 col-sm-6 col-md-3">
                        <div
                            style={{
                                background: "linear-gradient(135deg, #e8e7ff 0%, #f7f6ff 100%)",
                                borderRadius: "14px",
                                padding: "18px",
                                height: "110px",
                                border: "1px solid var(--border)",
                                boxShadow: "0 2px 5px var(--shadow-color)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div style={{ fontWeight: 600, fontSize: "14px" }}>My Agreements</div>
                                <div
                                    style={{
                                        background: "var(--card)",
                                        padding: "6px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                    }}
                                >
                                    <FiFileText size={18} />
                                </div>
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                View, track and manage all your agreements.
                            </div>
                        </div>
                    </div>

                    {/* My Bills */}
                    <div className="col-12 col-sm-6 col-md-3">
                        <div
                            style={{
                                background: "linear-gradient(135deg, #e6f4ff 0%, #f3faff 100%)",
                                borderRadius: "14px",
                                padding: "18px",
                                height: "110px",
                                border: "1px solid var(--border)",
                                boxShadow: "0 2px 5px var(--shadow-color)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div style={{ fontWeight: 600, fontSize: "14px" }}>My Bills</div>
                                <div
                                    style={{
                                        background: "var(--card)",
                                        padding: "6px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                    }}
                                >
                                    <FiCreditCard size={18} />
                                </div>
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                Submit and monitor billing activity.
                            </div>
                        </div>
                    </div>

                    {/* My Documents */}
                    <div className="col-12 col-sm-6 col-md-3">
                        <div
                            style={{
                                background: "linear-gradient(135deg, #d9f2e4 0%, #eefaf2 100%)",
                                borderRadius: "14px",
                                padding: "18px",
                                height: "110px",
                                border: "1px solid var(--border)",
                                boxShadow: "0 2px 5px var(--shadow-color)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div style={{ fontWeight: 600, fontSize: "14px" }}>My Documents</div>
                                <div
                                    style={{
                                        background: "var(--card)",
                                        padding: "6px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                    }}
                                >
                                    <FiFolder size={18} />
                                </div>
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                Upload and track compliance documents.
                            </div>
                        </div>
                    </div>

                    {/* File Forwarding */}
                    <div className="col-12 col-sm-6 col-md-3">
                        <div
                            style={{
                                background: "linear-gradient(135deg, #e8e7ff 0%, #f7f6ff 100%)",
                                borderRadius: "14px",
                                padding: "18px",
                                height: "110px",
                                border: "1px solid var(--border)",
                                boxShadow: "0 2px 5px var(--shadow-color)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div style={{ fontWeight: 600, fontSize: "14px" }}>File Forwarding</div>
                                <div
                                    style={{
                                        background: "var(--card)",
                                        padding: "6px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                    }}
                                >
                                    <FiUpload size={18} />
                                </div>
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                Track routed files and approvals.
                            </div>
                        </div>
                    </div>
                </div>
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
