import React, { useState } from 'react';
import {
    FaTachometerAlt, FaFileInvoice, FaUserTie, FaChevronDown, FaChevronUp,
    FaTools, FaQuestionCircle, FaBell, FaSignOutAlt, FaLayerGroup, FaFileAlt
} from 'react-icons/fa';
import dummyUser from '../../assets/images/dummyUser.jpeg';

const AdminSidebar = () => {
    const [openMenu, setOpenMenu] = useState(null);

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const submenuStyle = (isOpen) => ({
        maxHeight: isOpen ? '500px' : '0',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        marginLeft: '20px',
        fontSize: '0.9rem',
        color: '#ccc'
    });

    return (
        <div className="d-flex flex-column vh-100 p-3" style={{ width: '260px', backgroundColor: '#1e1e2f', color: '#f1f1f1' }}>

            {/* Profile Section */}
            <div className="text-center mb-3">
                <img
                    src={dummyUser}
                    alt="Admin"
                    className="rounded-circle mb-2"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
                <h6>Admin Panel</h6>
                <hr className="text-light" />
            </div>

            {/* Home  */}
            <div className="mb-2 d-flex align-items-center cursor-pointer">
                <FaTachometerAlt className="me-2" />
                Home
            </div>

            {/* Bills */}
            <div className="mb-2 d-flex align-items-center cursor-pointer">
                <FaFileInvoice className="me-2" />
                Bills
            </div>

            {/* Client */}
            <div className="mb-2" onClick={() => toggleMenu('client')}>
                <div className="d-flex justify-content-between align-items-center cursor-pointer">
                    <span><FaUserTie className="me-2" /> Client</span>
                    {openMenu === 'client' ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                <div style={submenuStyle(openMenu === 'client')}>
                    <div className="py-1">All Clients</div>
                    <div className="py-1">Client Details</div>
                    <div className="py-1">Add Client</div>
                </div>
            </div>

            {/* DFS Request */}
            <div className="mb-2" onClick={() => toggleMenu('dfs')}>
                <div className="d-flex justify-content-between align-items-center cursor-pointer">
                    <span><FaFileAlt className="me-2" /> Forward Document</span>
                    {openMenu === 'dfs' ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                <div style={submenuStyle(openMenu === 'dfs')}>
                    <div className="py-1">Past Document</div>
                    <div className="py-1">Current Document</div>
                </div>
            </div>

            {/* Push Document */}
            <div className="mb-2" onClick={() => toggleMenu('push')}>
                <div className="d-flex justify-content-between align-items-center cursor-pointer">
                    <span><FaFileAlt className="me-2" /> Push Document</span>
                    {openMenu === 'push' ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                <div style={submenuStyle(openMenu === 'push')}>
                    <div className="py-1">LOA</div>
                    <div className="py-1">Purchase order</div>
                </div>
            </div>
            {/* Notification */}
            <div className="mb-2 d-flex align-items-center cursor-pointer">
                <FaBell className="me-2" />
                Notification
            </div>
            {/* Important Routes */}
            <div className="mb-2" onClick={() => toggleMenu('important')}>
                <div className="d-flex justify-content-between align-items-center cursor-pointer">
                    <span><FaLayerGroup className="me-2" /> Important Routes</span>
                    {openMenu === 'important' ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                <div style={submenuStyle(openMenu === 'important')}>
                    <div className="py-1">All User Details</div>
                    <div className="py-1">All DFS Request</div>
                </div>
            </div>
            {/* Settings */}
            <div className="mb-2 d-flex align-items-center cursor-pointer">
                <FaTools className="me-2" />
                Setting
            </div>

            {/* Help */}
            <div className="mb-2 d-flex align-items-center cursor-pointer">
                <FaQuestionCircle className="me-2" />
                Help
            </div>





            {/* Logout */}
            <div className="mt-auto d-flex align-items-center cursor-pointer">
                <FaSignOutAlt className="me-2" />
                Logout
            </div>
        </div>
    );
};

export default AdminSidebar;
