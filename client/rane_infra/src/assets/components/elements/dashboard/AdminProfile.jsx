import React, { useEffect, useState } from "react";
import "./AdminProfile.css";
import Button from 'react-bootstrap/Button';
import { backend_url } from "../../store/keyStore"; // Ensure this is the correct import
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
    const [billid, setbillid] = useState("")

    const handleViewMore=(id)=>{
        setbillid(id)
        setModalShow(true)
      }


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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="admin-profile-main">
            <div className="admin-profile-container">
                <div className="profile-container-left">
                    <div className="admin-profile-left-card">
                        <div>
                            <h3>Total Clients</h3>
                            <h1>{counts.totalUsers}</h1>
                        </div>
                        <div>
                            <img src="/client.png" alt="Clients" />
                        </div>
                    </div>
                    <div className="admin-profile-left-card">
                        <div>
                            <h3>Total Bills</h3>
                            <h1>{counts.totalBills}</h1>
                        </div>
                        <div>
                            <img src="/billIcon.png" alt="Bills" />
                        </div>
                    </div>
                    <div className="admin-profile-left-card">
                        <div>
                            <h3>Bills Sanctioned</h3>
                            <h1>{counts.sanctionedBills}</h1>
                        </div>
                        <div>
                            <img src="/billSanctioned.png" alt="Sanctioned Bills" />
                        </div>
                    </div>
                </div>

                <div className="profile-container-right">
                    <div className='profile-right-head-container'>
                        <h1 className="admin-dash-recent-bills">Recent Bills</h1>
                        <div className='bill-view-all-btn'>View All</div>
                    </div>

                    {/* Dynamic Recent Bills */}
                    {recentBills.length > 0 ? (
                        recentBills.map((bill, index) => (
                            <div className="recent-bill-card" key={index}>
                                <div>
                                    <img src={bill.user?.profile} alt="Profile" />
                                    <div style={{ fontWeight: "500" }}>CID: {bill.user?.cid}</div>
                                </div>

                                <div className='recent-bill-card-name'>
                                    {bill.user?.name || "Unknown User"}
                                    <div style={{ fontSize: "1rem", fontWeight: "400" }}>
                                        {new Date(bill.submittedAt).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <h6>{bill.firmName}</h6>
                                    <h6>{bill.workArea}</h6>
                                </div>
                                <div>
                                    <Button variant="secondary" style={{ fontSize: "0.9rem" }} onClick={() => handleViewMore(bill._id)} >VIEW</Button>
                                </div>
                            </div> 
                        ))
                    ) : (
                        <p>No recent bills available</p>
                    )}
                </div>
            </div>
            <BillShowModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                id={billid}
            />
            <div className="profile-container-bottom">
                <h3>Meeting Request</h3>
                <div className="meeeting-card-container"></div>
            </div>
        </div>
    );
};

export default AdminDashboardProfile;
