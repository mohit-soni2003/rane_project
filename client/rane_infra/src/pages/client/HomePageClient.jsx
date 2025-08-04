import React from 'react';
import ClientHeader from '../../component/header/ClientHeader';
import { Card, Button } from 'react-bootstrap';
import {
  FaFileAlt, FaCheckCircle, FaTimesCircle, FaRupeeSign,
  FaMoneyBill, FaClock, FaCalendarCheck
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

// Reusable StatCard component
const StatCard = ({ title, value, icon, color }) => (
  <Card className="shadow-sm border-light text-center"
    style={{ border: '1px solid var(--client-border-color)', borderRadius: '12px', height: '140px' }}>
    <Card.Body className="d-flex flex-column justify-content-center align-items-center gap-1">
      <div className="rounded-circle d-flex justify-content-center align-items-center mb-2"
        style={{ width: '36px', height: '36px', backgroundColor: color }}>
        {React.cloneElement(icon, { color: 'white', size: 14 })}
      </div>
      <div className="fw-semibold">{title}</div>
      <div className="fw-bold">{value}</div>
    </Card.Body>
  </Card>
);

export default function HomePageClient() {
  return (
    <>
      <ClientHeader />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 999999,
        width: '70%',
        pointerEvents: 'none',
        opacity: 0.19,
        whiteSpace: 'normal',
        userSelect: 'none',
        fontSize: '3rem',
        fontWeight: 800,
        color: 'var(--client-text-color)',
        textAlign: 'center',
        lineHeight: '1.8'
      }}>
        Notification and some features on this page are not working
      </div>




      <div className="container-fluid mt-4 w-100" style={{ background: "var(--client-component-bg-color)", minHeight: "100vh" }}>
        <div className="row">
          {/* Left: Stats Section */}
          <div className="col-md-8">
            {/* Bill Statistics */}
            <h6 className="fw-bold mb-3 mt-4" style={{ color: "var(--client-heading-color)" }}>
              <FaFileAlt className="me-2 text-primary" />Bill Statistics
            </h6>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <StatCard title="Total Bills Uploaded" value="145" icon={<FaFileAlt />} color="#7e5bef" />
              </div>
              <div className="col-md-4">
                <StatCard title="Bills Cleared" value="128" icon={<FaCheckCircle />} color="#22c55e" />
              </div>
              <div className="col-md-4">
                <StatCard title="Bills Rejected" value="17" icon={<FaTimesCircle />} color="#ef4444" />
              </div>
            </div>

            {/* Payment Requests */}
            <h6 className="fw-bold mb-3" style={{ color: "var(--client-heading-color)" }}>
              <FaMoneyBill className="me-2 text-primary" />Payment Requests
            </h6>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <StatCard title="Total Requests" value="95" icon={<FaFileAlt />} color="#7e5bef" />
              </div>
              <div className="col-md-4">
                <StatCard title="Approved" value="82" icon={<FaCheckCircle />} color="#22c55e" />
              </div>
              <div className="col-md-4">
                <StatCard title="Rejected" value="13" icon={<FaTimesCircle />} color="#ef4444" />
              </div>
            </div>

            {/* Salary Overview */}
            <h6 className="fw-bold mb-3" style={{ color: "var(--client-heading-color)" }}>
              <FaRupeeSign className="me-2 text-primary" />Salary Overview
            </h6>
            <div className="row g-3 mb-5">
              <div className="col-md-4">
                <StatCard title="Bonus" value="₹12,500" icon={<FaRupeeSign />} color="#7e5bef" />
              </div>
              <div className="col-md-4">
                <StatCard title="Overtime" value="₹8,750" icon={<FaClock />} color="#f59e0b" />
              </div>
              <div className="col-md-4">
                <StatCard title="Salary Status" value="Processed" icon={<FaCalendarCheck />} color="#10b981" />
              </div>
            </div>
          </div>

          {/* Right: Notification Panel */}
          <div className="col-md-4 mt-5">
            <Card className="shadow-sm border-light"
              style={{ backgroundColor: "var(--client-dashboard-bg-color)" }}>
              <Card.Header className="d-flex justify-content-between align-items-center bg-white">
                <span className="fw-bold text-dark">
                  <FaFileAlt className="me-2 text-primary" /> Notification Updates
                </span>
                <Button variant="link" size="sm">View All</Button>
              </Card.Header>
              <Card.Body>
                {[{
                  title: 'Bill ID #2458 Uploaded',
                  desc: 'Bill uploaded and is awaiting approval.',
                  icon: <FaFileAlt className="text-primary me-3 mt-1" size={20} />,
                  time: '10 minutes ago'
                }, {
                  title: 'Payment #3892 Approved',
                  desc: 'Payment request has been approved and processed.',
                  icon: <FaCheckCircle className="text-success me-3 mt-1" size={20} />,
                  time: '2 hours ago'
                }, {
                  title: 'Bill ID #2456 Rejected',
                  desc: 'Rejected. Please check comments and resubmit.',
                  icon: <FaTimesCircle className="text-danger me-3 mt-1" size={20} />,
                  time: '1 day ago'
                }].map((item, idx) => (
                  <div className="d-flex align-items-start mb-3 p-2 rounded bg-white shadow-sm" key={idx}>
                    {item.icon}
                    <div>
                      <strong>{item.title}</strong>
                      <p className="mb-1 text-muted small">{item.desc}</p>
                      <small className="text-secondary"><FaClock className="me-1" />{item.time}</small>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Company Description Section */}
        <div className="row ">
          <div className="col-12">
            <Card className="shadow-sm border-light mb-5" style={{ backgroundColor: "var(--client-dashboard-bg-color)" }}>
              <Card.Body>
                <h6 className="fw-bold mb-3 text-uppercase" style={{ color: "var(--client-heading-color)" }}>About RS-WMS</h6>
                <p style={{ fontSize: '14px', color: "var(--client-text-color)" }}>
                  RS-WMS stands for <strong>RANE & SONS - WORK MANAGEMENT SYSTEM</strong>, a robust digital platform based in Indore, Madhya Pradesh. It is developed to manage and streamline <strong>construction project workflows</strong>, with a special focus on <strong>railway sector</strong> projects.
                  <br /><br />
                  This system was created by <strong>RANE & SONS PVT. LTD.</strong> to assist with execution, planning, resource management, progress tracking, and overall project supervision.
                </p>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
