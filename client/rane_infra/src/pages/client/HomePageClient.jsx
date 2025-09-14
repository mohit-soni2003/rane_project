import React, { useEffect, useState } from 'react';
import ClientHeader from '../../component/header/ClientHeader';
import { Card, Spinner, Button, Badge, Alert } from 'react-bootstrap';
import {
  FaFileAlt, FaCheckCircle, FaTimesCircle, FaRupeeSign, FaMoneyBill,
  FaClock, FaCalendarCheck, FaChartLine, FaChartBar, FaEye,
  FaUpload, FaDownload, FaBell, FaInfoCircle, FaCalendarAlt,
  FaWallet, FaFileInvoiceDollar, FaHandshake, FaCog
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuthStore } from '../../store/authStore';
import { clientService } from '../../services/clientService';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card className="shadow-sm border-0 h-100" style={{
    backgroundColor: '#fff',
    borderRadius: '15px',
    transition: 'transform 0.2s ease-in-out',
    border: '1px solid #e9ecef'
  }}
  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
      <div className="rounded-circle d-flex justify-content-center align-items-center mb-3"
        style={{
          width: '60px',
          height: '60px',
          backgroundColor: color,
          boxShadow: `0 4px 15px ${color}30`
        }}>
        {React.cloneElement(icon, { color: 'white', size: 20 })}
      </div>
      <h4 className="card-title mb-2 text-dark fw-bold">{value}</h4>
      <p className="card-text mb-1 text-muted text-center fw-semibold">{title}</p>
      {subtitle && <small className="text-muted">{subtitle}</small>}
    </Card.Body>
  </Card>
);

const ActivityCard = ({ title, items, icon, color }) => (
  <Card className="shadow-sm border-0 h-100" style={{
    backgroundColor: '#fff',
    borderRadius: '15px',
    border: '1px solid #e9ecef'
  }}>
    <Card.Header className="border-0 bg-white d-flex align-items-center" style={{ borderRadius: '15px 15px 0 0' }}>
      <div className={`rounded-circle p-2 me-3`} style={{ backgroundColor: color }}>
        {React.cloneElement(icon, { color: 'white', size: 16 })}
      </div>
      <h6 className="card-title mb-0 text-dark fw-bold">{title}</h6>
    </Card.Header>
    <Card.Body>
      {items.length > 0 ? (
        <div className="list-group list-group-flush">
          {items.map((item, index) => (
            <div key={index} className="list-group-item border-0 px-0 py-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 text-dark fw-semibold small">{item.title}</p>
                  <small className="text-muted">{item.description}</small>
                </div>
                <Badge bg={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'}>
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className={`rounded-circle p-3 mx-auto mb-3`} style={{ backgroundColor: `${color}20`, width: 'fit-content' }}>
            {React.cloneElement(icon, { color: color, size: 24 })}
          </div>
          <p className="text-muted mb-0">No recent activity</p>
        </div>
      )}
    </Card.Body>
  </Card>
);

export default function HomePageClient() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?._id) return;

    const fetchStats = async () => {
      try {
        console.log('Fetching dashboard stats for user:', user._id);
        const response = await clientService.getDashboardStats(user._id);
        console.log('Dashboard response received:', response);

        if (response.success) {
          console.log('Setting stats data:', response.stats);
          setStats(response.stats);
        } else {
          console.error('Failed to fetch dashboard stats:', response.message);
          // Set default values if API fails
          setStats({
            totalBills: 0,
            totalPayments: 0,
            totalDocuments: 0,
            totalDfsRequests: 0,
            pendingBills: 0,
            approvedBills: 0,
            rejectedBills: 0,
            pendingPayments: 0,
            approvedPayments: 0,
            recentActivity: [],
            monthlyTrends: []
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        // Set default values if API fails
        setStats({
          totalBills: 0,
          totalPayments: 0,
          totalDocuments: 0,
          totalDfsRequests: 0,
          pendingBills: 0,
          approvedBills: 0,
          rejectedBills: 0,
          pendingPayments: 0,
          approvedPayments: 0,
          recentActivity: [],
          monthlyTrends: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <>
        <ClientHeader />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", backgroundColor: '#f8f9fa' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" size="lg" />
            <h5 className="text-muted mt-3">Loading your dashboard...</h5>
          </div>
        </div>
      </>
    );
  }

  const recentBills = stats?.recentActivity?.filter(item => item.type === 'bill').slice(0, 3) || [];
  const recentPayments = stats?.recentActivity?.filter(item => item.type === 'payment').slice(0, 2) || [];

  return (
    <>
      <ClientHeader />
      <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>

        {/* Navigation Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                <div className="d-flex justify-content-center">
                  {[
                    { id: 'overview', label: 'Overview', icon: <FaEye /> },
                    { id: 'analytics', label: 'Analytics', icon: <FaChartLine /> },
                    { id: 'activity', label: 'Activity', icon: <FaFileAlt /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      className={`btn flex-fill py-3 ${activeTab === tab.id ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        borderRadius: '0',
                        border: 'none',
                        fontWeight: '600'
                      }}
                    >
                      {tab.icon} <span className="ms-2">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="row mb-4">
              <div className="col-lg-3 col-md-6 mb-4">
                <StatCard
                  title="Total Bills"
                  value={stats?.totalBills ?? 0}
                  icon={<FaFileInvoiceDollar />}
                  color="#4CAF50"
                  subtitle="All submitted bills"
                />
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <StatCard
                  title="Approved Bills"
                  value={stats?.approvedBills ?? 0}
                  icon={<FaCheckCircle />}
                  color="#22c55e"
                  subtitle="Successfully processed"
                />
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <StatCard
                  title="Rejected Bills"
                  value={stats?.rejectedBills ?? 0}
                  icon={<FaTimesCircle />}
                  color="#ef4444"
                  subtitle="Need revision"
                />
              </div>
              <div className="col-lg-3 col-md-6 mb-4">
                <StatCard
                  title="Pending Bills"
                  value={stats?.pendingBills ?? 0}
                  icon={<FaClock />}
                  color="#f59e0b"
                  subtitle="Awaiting approval"
                />
              </div>
            </div>

            {/* Payment Stats */}
            <div className="row mb-4">
              <div className="col-lg-4 col-md-6 mb-4">
                <StatCard
                  title="Payment Requests"
                  value={stats?.totalPayments ?? 0}
                  icon={<FaMoneyBill />}
                  color="#7e5bef"
                  subtitle="Total requests made"
                />
              </div>
              <div className="col-lg-4 col-md-6 mb-4">
                <StatCard
                  title="Approved Payments"
                  value={stats?.approvedPayments ?? 0}
                  icon={<FaWallet />}
                  color="#10b981"
                  subtitle="Successfully processed"
                />
              </div>
              <div className="col-lg-4 col-md-12 mb-4">
                <StatCard
                  title="Pending Payments"
                  value={stats?.pendingPayments ?? 0}
                  icon={<FaClock />}
                  color="#f59e0b"
                  subtitle="Awaiting processing"
                />
              </div>
            </div>

            {/* Salary Overview */}
            <div className="row mb-4">
              <div className="col-12">
                <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
                  <Card.Header className="border-0 bg-white d-flex align-items-center" style={{ borderRadius: '15px 15px 0 0' }}>
                    <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#4CAF50' }}>
                      <FaRupeeSign color="white" size={16} />
                    </div>
                    <h6 className="card-title mb-0 text-dark fw-bold">Documents Overview</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <div className="text-center p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                          <FaFileAlt size={24} className="text-success mb-2" />
                          <h5 className="text-success mb-1">{stats?.totalDocuments ?? 0}</h5>
                          <small className="text-muted">Total Documents</small>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="text-center p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                          <FaFileAlt size={24} className="text-warning mb-2" />
                          <h5 className="text-warning mb-1">{stats?.totalDfsRequests ?? 0}</h5>
                          <small className="text-muted">DFS Requests</small>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="text-center p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                          <FaCalendarCheck size={24} className="text-info mb-2" />
                          <h5 className="text-info mb-1">{new Date().toLocaleDateString()}</h5>
                          <small className="text-muted">Last Updated</small>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="row mb-4">
              <div className="col-12">
                <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
                  <Card.Header className="border-0 bg-white" style={{ borderRadius: '15px 15px 0 0' }}>
                    <h6 className="card-title mb-0 text-dark fw-bold">
                      <FaHandshake className="me-2 text-primary" />
                      Quick Actions
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="row g-3">
                      <div className="col-md-3">
                        <Button
                          variant="outline-primary"
                          className="w-100 d-flex align-items-center justify-content-center p-3"
                          onClick={() => navigate('/client/upload-bill')}
                          style={{ borderRadius: '10px', height: 'auto' }}
                        >
                          <FaUpload className="me-2" />
                          <div className="text-start">
                            <div className="fw-bold">Upload Bill</div>
                            <small>Submit new bill</small>
                          </div>
                        </Button>
                      </div>
                      <div className="col-md-3">
                        <Button
                          variant="outline-success"
                          className="w-100 d-flex align-items-center justify-content-center p-3"
                          onClick={() => navigate('/client/my-bill')}
                          style={{ borderRadius: '10px', height: 'auto' }}
                        >
                          <FaFileAlt className="me-2" />
                          <div className="text-start">
                            <div className="fw-bold">My Bills</div>
                            <small>View all bills</small>
                          </div>
                        </Button>
                      </div>
                      <div className="col-md-3">
                        <Button
                          variant="outline-info"
                          className="w-100 d-flex align-items-center justify-content-center p-3"
                          onClick={() => navigate('/client/payment-request')}
                          style={{ borderRadius: '10px', height: 'auto' }}
                        >
                          <FaMoneyBill className="me-2" />
                          <div className="text-start">
                            <div className="fw-bold">Payment Request</div>
                            <small>Request payment</small>
                          </div>
                        </Button>
                      </div>
                      <div className="col-md-3">
                        <Button
                          variant="outline-warning"
                          className="w-100 d-flex align-items-center justify-content-center p-3"
                          onClick={() => navigate('/client/my-payment-request')}
                          style={{ borderRadius: '10px', height: 'auto' }}
                        >
                          <FaDownload className="me-2" />
                          <div className="text-start">
                            <div className="fw-bold">My Payments</div>
                            <small>View payment history</small>
                          </div>
                        </Button>
                      </div>
                    </div>
                    <div className="row g-3 mt-2">
                      <div className="col-md-3">
                        <Button
                          variant="outline-secondary"
                          className="w-100 d-flex align-items-center justify-content-center p-3"
                          onClick={() => navigate('/client/upload-document')}
                          style={{ borderRadius: '10px', height: 'auto' }}
                        >
                          <FaUpload className="me-2" />
                          <div className="text-start">
                            <div className="fw-bold">Upload Document</div>
                            <small>DFS document upload</small>
                          </div>
                        </Button>
                      </div>
                      <div className="col-md-3">
                        <Button
                          variant="outline-dark"
                          className="w-100 d-flex align-items-center justify-content-center p-3"
                          onClick={() => navigate('/client/track-dfs/all')}
                          style={{ borderRadius: '10px', height: 'auto' }}
                        >
                          <FaEye className="me-2" />
                          <div className="text-start">
                            <div className="fw-bold">Track DFS</div>
                            <small>Track documents</small>
                          </div>
                        </Button>
                      </div>
                      <div className="col-md-3">
                        <Button
                          variant="outline-primary"
                          className="w-100 d-flex align-items-center justify-content-center p-3"
                          onClick={() => navigate('/client/transaction')}
                          style={{ borderRadius: '10px', height: 'auto' }}
                        >
                          <FaRupeeSign className="me-2" />
                          <div className="text-start">
                            <div className="fw-bold">Transactions</div>
                            <small>View transactions</small>
                          </div>
                        </Button>
                      </div>
                      <div className="col-md-3">
                        <Button
                          variant="outline-success"
                          className="w-100 d-flex align-items-center justify-content-center p-3"
                          onClick={() => navigate('/client/document/category')}
                          style={{ borderRadius: '10px', height: 'auto' }}
                        >
                          <FaFileAlt className="me-2" />
                          <div className="text-start">
                            <div className="fw-bold">My Documents</div>
                            <small>View documents</small>
                          </div>
                        </Button>
                      </div>
                    </div>
                    <div className="row g-3 mt-2">
                      <div className="col-md-3">
                        <Button
                          variant="outline-info"
                          className="w-100 d-flex align-items-center justify-content-center p-3"
                          onClick={() => navigate('/client/salary')}
                          style={{ borderRadius: '10px', height: 'auto' }}
                        >
                          <FaWallet className="me-2" />
                          <div className="text-start">
                            <div className="fw-bold">Salary</div>
                            <small>View salary info</small>
                          </div>
                        </Button>
                      </div>
                      <div className="col-md-3">
                        <Button
                          variant="outline-secondary"
                          className="w-100 d-flex align-items-center justify-content-center p-3"
                          onClick={() => navigate('/client/setting')}
                          style={{ borderRadius: '10px', height: 'auto' }}
                        >
                          <FaCog className="me-2" />
                          <div className="text-start">
                            <div className="fw-bold">Settings</div>
                            <small>Account settings</small>
                          </div>
                        </Button>
                      </div>
                      <div className="col-md-3">
                        <Button
                          variant="outline-warning"
                          className="w-100 d-flex align-items-center justify-content-center p-3"
                          onClick={() => navigate('/client/support')}
                          style={{ borderRadius: '10px', height: 'auto' }}
                        >
                          <FaBell className="me-2" />
                          <div className="text-start">
                            <div className="fw-bold">Support</div>
                            <small>Get help</small>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="row">
            <div className="col-lg-6 mb-4">
              <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
                <Card.Header className="border-0 bg-white">
                  <h6 className="card-title mb-0 text-dark fw-bold">
                    <FaChartLine className="me-2 text-primary" />
                    Bill Status Distribution
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="p-3 rounded mb-2" style={{ backgroundColor: '#d4edda' }}>
                        <FaCheckCircle size={24} className="text-success mb-2" />
                        <h5 className="text-success mb-1">{stats?.approvedBills ?? 0}</h5>
                        <small className="text-muted">Approved</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-3 rounded mb-2" style={{ backgroundColor: '#fff3cd' }}>
                        <FaClock size={24} className="text-warning mb-2" />
                        <h5 className="text-warning mb-1">{stats?.pendingBills ?? 0}</h5>
                        <small className="text-muted">Pending</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-3 rounded mb-2" style={{ backgroundColor: '#f8d7da' }}>
                        <FaTimesCircle size={24} className="text-danger mb-2" />
                        <h5 className="text-danger mb-1">{stats?.rejectedBills ?? 0}</h5>
                        <small className="text-muted">Rejected</small>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className="col-lg-6 mb-4">
              <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
                <Card.Header className="border-0 bg-white">
                  <h6 className="card-title mb-0 text-dark fw-bold">
                    <FaChartBar className="me-2 text-primary" />
                    Payment Analytics
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="row text-center">
                    <div className="col-6">
                      <div className="p-3 rounded mb-2" style={{ backgroundColor: '#e7f3ff' }}>
                        <FaMoneyBill size={24} className="text-primary mb-2" />
                        <h5 className="text-primary mb-1">{stats?.totalPayments ?? 0}</h5>
                        <small className="text-muted">Total Requests</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 rounded mb-2" style={{ backgroundColor: '#d1ecf1' }}>
                        <FaCheckCircle size={24} className="text-info mb-2" />
                        <h5 className="text-info mb-1">{stats?.approvedPayments ?? 0}</h5>
                        <small className="text-muted">Approved</small>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">Approval Rate</span>
                      <span className="small fw-bold">
                        {stats?.totalPayments > 0
                          ? Math.round(((stats?.approvedPayments ?? 0) / stats?.totalPayments) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-success"
                        style={{
                          width: `${stats?.totalPayments > 0
                            ? ((stats?.approvedPayments ?? 0) / stats?.totalPayments) * 100
                            : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="row">
            <div className="col-lg-6 mb-4">
              <ActivityCard
                title="Recent Bills"
                items={recentBills.map(item => ({
                  title: item.title || 'Bill Activity',
                  description: item.description || 'Bill submission activity',
                  status: item.status || 'pending'
                }))}
                icon={<FaFileAlt />}
                color="#4CAF50"
              />
            </div>
            <div className="col-lg-6 mb-4">
              <ActivityCard
                title="Payment Requests"
                items={recentPayments.map(item => ({
                  title: item.title || 'Payment Activity',
                  description: item.description || 'Payment request activity',
                  status: item.status || 'pending'
                }))}
                icon={<FaMoneyBill />}
                color="#2196F3"
              />
            </div>
          </div>
        )}

        {/* Company Info */}
        <div className="row">
          <div className="col-12">
            <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#667eea' }}>
                    <FaInfoCircle color="white" size={16} />
                  </div>
                  <h6 className="card-title mb-0 text-dark fw-bold">About RS-WMS</h6>
                </div>
                <p className="text-muted mb-0">
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






// <Card className="shadow-sm border-light"
//             style={{ backgroundColor: "var(--client-dashboard-bg-color)" }}>
//             <Card.Header className="d-flex justify-content-between align-items-center bg-white">
//               <span className="fw-bold text-dark">
//                 <FaFileAlt className="me-2 text-primary" /> Notification Updates
//               </span>
//               <Button variant="link" size="sm">View All</Button>
//             </Card.Header>
//             <Card.Body>
//               {[{
//                 title: 'Bill ID #2458 Uploaded',
//                 desc: 'Bill uploaded and is awaiting approval.',
//                 icon: <FaFileAlt className="text-primary me-3 mt-1" size={20} />,
//                 time: '10 minutes ago'
//               }, {
//                 title: 'Payment #3892 Approved',
//                 desc: 'Payment request has been approved and processed.',
//                 icon: <FaCheckCircle className="text-success me-3 mt-1" size={20} />,
//                 time: '2 hours ago'
//               }, {
//                 title: 'Bill ID #2456 Rejected',
//                 desc: 'Rejected. Please check comments and resubmit.',
//                 icon: <FaTimesCircle className="text-danger me-3 mt-1" size={20} />,
//                 time: '1 day ago'
//               }].map((item, idx) => (
//                 <div className="d-flex align-items-start mb-3 p-2 rounded bg-white shadow-sm" key={idx}>
//                   {item.icon}
//                   <div>
//                     <strong>{item.title}</strong>
//                     <p className="mb-1 text-muted small">{item.desc}</p>
//                     <small className="text-secondary"><FaClock className="me-1" />{item.time}</small>
//                   </div>
//                 </div>
//               ))}
//             </Card.Body>
//           </Card>