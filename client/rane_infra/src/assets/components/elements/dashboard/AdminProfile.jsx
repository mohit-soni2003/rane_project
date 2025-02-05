import React from 'react'
import "./AdminProfile.css"
import Button from 'react-bootstrap/Button';




const AdminDashboardProfile = () => {
    return (
        <>
        <div className="admin-profile-main">

            <div className="admin-profile-container">
                <div className="profile-container-left">

                    <div className="admin-profile-left-card">
                        <div>
                            <h3>Total Clients</h3>
                            <h1>25</h1>
                        </div>
                        <div>
                            <img src="/client.png" alt="" />
                        </div>
                    </div>
                    <div className="admin-profile-left-card">
                        <div>
                            <h3>Total Bills</h3>
                            <h1>25</h1>
                        </div>
                        <div>
                            <img src="/billIcon.png" alt="" />
                        </div>
                    </div>
                    <div className="admin-profile-left-card">
                        <div>
                            <h3>Bills Sanctioned</h3>
                            <h1>14</h1>
                        </div>
                        <div>
                            <img src="/billSanctioned.png" alt="" />
                        </div>
                    </div>

                </div>


                <div className="profile-container-right">
                    <div className='profile-right-head-container'>
                        <h1 className="admin-dash-recent-bills">Recent Bills</h1>
                        <div className='bill-view-all-btn'>View All</div>
                    </div>

                    <div className="recent-bill-card">
                        <div>
                            <img src="/rane.webp" alt="" />
                            <div style={{fontWeight:"500"}}>CID : MOH123</div>
                        </div>

                        <div className='recent-bill-card-name'>
                            Mohit Soni
                            <div style={{fontSize:"1rem" ,fontWeight:"400"}}>
                                12 NOV 2024 12:45
                            </div>
                        </div>
                        <div>
                            <h6>Firm Name</h6>
                            <h6>Work Area</h6>
                        </div>
                        <div>
                        <Button variant="secondary" style={{fontSize:"0.9rem"}}>VIEW</Button>

                        </div>

                    </div>
                    <div className="recent-bill-card">
                        <div>
                            <img src="/rane.webp" alt="" />
                            <div style={{fontWeight:"500"}}>CID : MOH123</div>
                        </div>

                        <div className='recent-bill-card-name'>
                            Mohit Soni
                            <div style={{fontSize:"1rem" ,fontWeight:"400"}}>
                                12 NOV 2024 12:45
                            </div>
                        </div>
                        <div>
                            <h6>Firm Name</h6>
                            <h6>Work Area</h6>
                        </div>
                        <div>
                        <Button variant="secondary" style={{fontSize:"0.9rem"}}>VIEW</Button>

                        </div>

                    </div>
                    <div className="recent-bill-card">
                        <div>
                            <img src="/rane.webp" alt="" />
                            <div style={{fontWeight:"500"}}>CID : MOH123</div>
                        </div>

                        <div className='recent-bill-card-name'>
                            Mohit Soni
                            <div style={{fontSize:"1rem" ,fontWeight:"400"}}>
                                12 NOV 2024 12:45
                            </div>
                        </div>
                        <div>
                            <h6>Firm Name</h6>
                            <h6>Work Area</h6>
                        </div>
                        <div>
                        <Button variant="secondary" style={{fontSize:"0.9rem"}}>VIEW</Button>

                        </div>

                    </div>
                  
                </div>
            </div>
            <div className="profile-container-bottom">
                <h3>Meeting Request</h3>
                <div className="meeeting-card-container">
                </div>
            </div>
            </div>

        </>
    );
};

export default AdminDashboardProfile;

