import React, { useEffect, useState } from "react";
import "./AdminProfile.css";
import Button from 'react-bootstrap/Button';
import { backend_url } from "../../store/keyStore"; 
import BillShowModal from "../../../cards/models/BillShowModal";

const AdminDashboardProfile = () => {
    const [counts, setCounts] = useState({
        totalUsers: 0,
        totalBills: 0,
        sanctionedBills: 0
    });

    const [recentBills, setRecentBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalShow, setModalShow] = useState(false);
    const [billid, setBillId] = useState("");

    const handleViewMore = (id) => {
        setBillId(id);
        setModalShow(true);
    };

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const response = await fetch(`${backend_url}/count-client-bill`);
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const data = await response.json();
                setCounts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCounts();
    }, []);

    useEffect(() => {
        const fetchRecentBills = async () => {
            try {
                const response = await fetch(`${backend_url}/recent-bills`);
                if (!response.ok) {
                    throw new Error("Failed to fetch recent bills");
                }
                const data = await response.json();
                setRecentBills(data);
            } catch (error) {
                console.error("Error fetching recent bills:", error);
            }
        };

        fetchRecentBills();
    }, []);

    if (loading) return <p className="text-center mt-3">Loading...</p>;
    if (error) return <p className="text-center text-danger mt-3">Error: {error}</p>;

    return (
        <div className="admin-profile-main">
            <div className="admin-profile-container">
                <div className="profile-container-left">
                    {/* Client Count */}
                    <div className="admin-profile-left-card">
                        <div>
                            <h3>Total Clients</h3>
                            <h1>{counts.totalUsers}</h1>
                        </div>
                        <img src="/client.png" alt="Clients" />
                    </div>

                    {/* Total Bills */}
                    <div className="admin-profile-left-card">
                        <div>
                            <h3>Total Bills</h3>
                            <h1>{counts.totalBills}</h1>
                        </div>
                        <img src="/billIcon.png" alt="Bills" />
                    </div>

                    {/* Sanctioned Bills */}
                    <div className="admin-profile-left-card">
                        <div>
                            <h3>Bills Sanctioned</h3>
                            <h1>{counts.sanctionedBills}</h1>
                        </div>
                        <img src="/billSanctioned.png" alt="Sanctioned Bills" />
                    </div>
                </div>

                <div className="profile-container-right">
                    <div className="profile-right-head-container">
                        <h1 className="admin-dash-recent-bills">Recent Bills</h1>
                        <div className="bill-view-all-btn">View All</div>
                    </div>

                    {/* Dynamic Recent Bills */}
                    {recentBills.length > 0 ? (
                        recentBills.map((bill, index) => (
                            <div className="recent-bill-card" key={index}>
                                <div className="d-flex align-items-center">
                                    <img src={bill.user?.profile} alt="Profile" />
                                    <div className="ms-3">
                                        <div style={{ fontWeight: "500" }}>CID: {bill.user?.cid}</div>
                                        <div className="text-muted">{bill.user?.name || "Unknown User"}</div>
                                    </div>
                                </div>
                                <div>
                                    <h6 className="text-primary">{bill.firmName}</h6>
                                    <h6 className="text-secondary">{bill.workArea}</h6>
                                </div>
                                <Button variant="outline-primary" onClick={() => handleViewMore(bill._id)}>VIEW</Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted">No recent bills available</p>
                    )}
                </div>
            </div>

            <BillShowModal show={modalShow} onHide={() => setModalShow(false)} id={billid} />
        </div>
    );
};

export default AdminDashboardProfile;
