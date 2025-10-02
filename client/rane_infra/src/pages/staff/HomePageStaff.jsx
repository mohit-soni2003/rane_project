import React, { useEffect, useState } from 'react';
import { FaFileInvoice, FaUserTie, FaFileAlt, FaClock, FaCheckCircle, FaExclamationTriangle, FaChartLine, FaChartBar, FaChartPie, FaEye, FaCalendarAlt, FaRupeeSign, FaTasks, FaMoneyBill, FaInfoCircle, FaFileExport } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';
import { staffService } from '../../services/staffService';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale
} from 'chart.js';
import { Pie, Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import { Card, Badge, Table, Button } from 'react-bootstrap';
import PendingDocumentsTableStaff from '../../component/staff/PendingDocumentsTableStaff';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale
);

// Define a common color scheme for statuses
const statusColors = {
  'approved': '#198754', // Green
  'paid': '#198754',     // Green
  'pending': '#ffc107',   // Yellow
  'rejected': '#dc3545', // Red
  'overdue': '#dc3545',  // Red
  'in-review': '#0dcaf0',// Cyan/Info
  'processing': '#0d6efd',// Blue
  'sanctioned': '#0d6efd',// Blue
  'regular': '#8b5cf6',   // Purple
  'dfs': '#64748b'       // Slate
};

const HomePageStaff = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalBills: 0,
    totalClients: 0,
    pendingPayments: 0,
    totalDocuments: 0,
    pendingDfs: 0,
    recentActivity: [],
    monthlyData: [],
    statusData: {},
    paymentTrends: [],
    totalRegularDocs: 0, 
    totalDfsDocs: 0      
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await staffService.getDashboardStats();

        if (response.success) {
          const data = response.stats;

          setStats({
            totalBills: data.totalBills || 0,
            totalClients: data.totalClients || 0,
            pendingPayments: data.pendingPayments || 0,
            totalDocuments: data.totalDocuments || 0,
            pendingDfs: data.pendingDfs || 0,
            recentActivity: data.recentActivity || [],
            monthlyData: data.monthlyData || [],
            statusData: data.statusData || {
              billStatuses: {},
              paymentStatuses: {},
              dfsStatuses: {}
            },
            paymentTrends: data.monthlyData || [],
            totalRegularDocs: data.totalRegularDocs || 0, 
            totalDfsDocs: data.totalDfsDocs || 0
          });
        } else {
          console.error('Failed to fetch dashboard stats:', response.message);
        }
      } catch (error) {
        console.error('Error fetching staff stats:', error);
        setStats({
          totalBills: 0,
          totalClients: 0,
          pendingPayments: 0,
          totalDocuments: 0,
          pendingDfs: 0,
          recentActivity: [],
          monthlyData: [],
          statusData: {
            billStatuses: { Approved: 80, Pending: 30, Rejected: 10, Processing: 5 },
            paymentStatuses: { Paid: 95, Pending: 8, Rejected: 2 },
            dfsStatuses: { pending: 12, 'in-review': 5, approved: 25, rejected: 3 }
          },
          paymentTrends: [],
          totalRegularDocs: 280,
          totalDfsDocs: 70
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user._id]);
  
  const getStatusBadgeForStaff = (status) => {
    if (!status) return <Badge bg="secondary">Unknown</Badge>;
    const lowerCaseStatus = status.toLowerCase();
    
    if (lowerCaseStatus.includes('approved') || lowerCaseStatus.includes('paid')) {
      return <Badge bg="success">{status}</Badge>;
    }
    if (lowerCaseStatus.includes('rejected')) {
      return <Badge bg="danger">{status}</Badge>;
    }
    if (lowerCaseStatus.includes('pending')) {
      return <Badge bg="warning" text="dark">{status}</Badge>;
    }
    if (lowerCaseStatus.includes('processing') || lowerCaseStatus.includes('in-review') || lowerCaseStatus.includes('in review')) {
      return <Badge bg="info">{status}</Badge>;
    }
    if (lowerCaseStatus.includes('sanctioned')) {
      return <Badge bg="primary">{status}</Badge>;
    }
    return <Badge bg="secondary">{status}</Badge>;
  };

  const renderInfoCard = (tab) => {
    let title = "RS-WMS Staff Portal";
    let content = (
        <p className="text-muted mb-0">
            This is your central hub for managing client activities, processing documents, and overseeing project workflows. Use the tabs above to navigate between a general overview, detailed analytics, and report generation.
        </p>
    );

    if (tab === 'analytics') {
        title = "Understanding System Analytics";
        content = (
            <p className="text-muted mb-0">
                This section provides a high-level view of system-wide data. Analyze bill and payment statuses across all clients, track monthly activity volumes, and monitor overall performance to identify trends and potential bottlenecks.
            </p>
        );
    } else if (tab === 'reports') {
        title = "Generating Reports";
        content = (
            <p className="text-muted mb-0">
                Use this section to view and export detailed reports. The payment trends view provides a month-by-month summary of financial activities, helping you track progress and manage resources effectively.
            </p>
        );
    }

    return (
        <div className="row mt-4">
            <div className="col-12">
                <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
                    <Card.Body className="p-4">
                        <div className="d-flex align-items-center mb-3">
                            <div className="rounded-circle p-2 me-3" style={{ backgroundColor: '#667eea' }}>
                                <FaInfoCircle color="white" size={16} />
                            </div>
                            <h6 className="card-title mb-0 text-dark fw-bold">{title}</h6>
                        </div>
                        {content}
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
  };

  const StatCard = ({ icon, title, value, color, bgColor, subtitle }) => (
    <div className="col-lg-3 col-md-6 mb-4">
      <div className="card shadow-sm border-0 h-100" style={{
        backgroundColor: bgColor,
        borderRadius: '15px',
        transition: 'transform 0.2s ease-in-out'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div className="card-body d-flex flex-column justify-content-center align-items-center p-4">
          <div className="rounded-circle d-flex justify-content-center align-items-center mb-3"
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: color,
              boxShadow: `0 4px 15px ${color}30`
            }}>
            {React.cloneElement(icon, { color: 'white', size: 24 })}
          </div>
          <h4 className="card-title mb-2 text-dark fw-bold">{value}</h4>
          <p className="card-text mb-1 text-muted text-center fw-semibold">{title}</p>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading your dashboard...</h5>
        </div>
      </div>
    );
  }

  // Helper function to create chart data with consistent color mapping
  const prepareChartData = (dataObject, orderedKeys) => {
    const labels = [];
    const data = [];
    const colors = [];

    const lowerCaseDataObject = {};
    for (const key in dataObject) {
        lowerCaseDataObject[key.toLowerCase().replace(/ /g, '-')] = dataObject[key];
    }

    orderedKeys.forEach(key => {
        if (lowerCaseDataObject[key] !== undefined) {
            labels.push(key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())); // Capitalize for display
            data.push(lowerCaseDataObject[key]);
            colors.push(statusColors[key] || '#6c757d');
        }
    });

    return {
        labels,
        datasets: [{ data, backgroundColor: colors }]
    };
  };

  const billChartData = prepareChartData(stats.statusData?.billStatuses, ['approved', 'pending', 'rejected', 'processing']);
  const paymentChartData = prepareChartData(stats.statusData?.paymentStatuses, ['paid', 'pending', 'rejected']);
  const dfsChartData = prepareChartData(stats.statusData?.dfsStatuses, ['approved', 'in-review', 'pending', 'rejected']);
  const docTypeChartData = {
      labels: ['Regular', 'DFS'],
      datasets: [{
          data: [stats.totalRegularDocs, stats.totalDfsDocs],
          backgroundColor: [statusColors['regular'], statusColors['dfs']]
      }]
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Welcome Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '15px',
            color: 'white'
          }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-2">Welcome back, {user.name}! 👋</h2>
                  <p className="mb-0 opacity-75">Here's your comprehensive dashboard overview</p>
                </div>
                <div className="text-end">
                  <h6 className="mb-1">Staff ID: {user?.cid || "Not Assigned"}</h6>
                  <small className="opacity-75">
                    <FaCalendarAlt className="me-1" />
                    {new Date().toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <div className="d-flex justify-content-center">
                {[
                  { id: 'overview', label: 'Overview', icon: <FaEye /> },
                  { id: 'analytics', label: 'Analytics', icon: <FaChartLine /> },
                  { id: 'reports', label: 'Reports', icon: <FaChartBar /> }
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
            <StatCard
              icon={<FaFileInvoice />}
              title="Total Bills"
              value={stats.totalBills}
              color="#4CAF50"
              bgColor="#f8fff8"
              subtitle="All bills in system"
            />
            <StatCard
              icon={<FaUserTie />}
              title="Total Clients"
              value={stats.totalClients}
              color="#2196F3"
              bgColor="#f0f8ff"
              subtitle="Registered clients"
            />
            <StatCard
              icon={<FaClock />}
              title="Pending Payments"
              value={stats.pendingPayments}
              color="#FF9800"
              bgColor="#fff8f0"
              subtitle="Awaiting processing"
            />
            <StatCard
              icon={<FaFileAlt />}
              title="Total Documents"
              value={stats.totalDocuments}
              color="#9C27B0"
              bgColor="#faf0ff"
              subtitle="Uploaded documents"
            />
          </div>

          {/* Additional Stats */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <FaExclamationTriangle className="text-warning me-3" size={24} />
                    <div>
                      <h6 className="card-title mb-1 text-dark fw-bold">Pending DFS Requests</h6>
                      <small className="text-muted">Document forwarding requests</small>
                    </div>
                  </div>
                  <h2 className="text-warning mb-0">{stats.pendingDfs}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <FaTasks className="text-success me-3" size={24} />
                    <div>
                      <h6 className="card-title mb-1 text-dark fw-bold">Active Tasks</h6>
                      <small className="text-muted">Bills and payments in progress</small>
                    </div>
                  </div>
                  <h2 className="text-success mb-0">{stats.totalBills + stats.pendingPayments}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Documents Table */}
          <div className="row mb-4">
            <div className="col-12">
              <PendingDocumentsTableStaff />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
                <div className="card-header border-0 bg-white" style={{ borderRadius: '15px 15px 0 0' }}>
                  <h6 className="card-title mb-0 text-dark fw-bold">
                    <FaClock className="me-2 text-primary" />
                    Recent Activity
                  </h6>
                </div>
                <div className="card-body">
                  {stats.recentActivity.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {stats.recentActivity.map((activity, index) => (
                        <div key={index} className="list-group-item border-0 px-0 py-3">
                          <div className="d-flex align-items-center">
                            <div className={`rounded-circle p-3 me-3 ${
                              activity.type === 'bill' ? 'bg-success' :
                              activity.type === 'payment' ? 'bg-warning' : 'bg-info'
                            }`}>
                              {activity.type === 'bill' && <FaFileInvoice className="text-white" />}
                              {activity.type === 'payment' && <FaRupeeSign className="text-white" />}
                              {activity.type === 'dfs' && <FaFileAlt className="text-white" />}
                            </div>
                            <div className="flex-grow-1">
                              <p className="mb-1 text-dark fw-semibold">{activity.title || 'Activity'}</p>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                  {activity.time ? (
                                    <>
                                      {new Date(activity.time).toLocaleDateString('en-IN')} at {new Date(activity.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </>
                                  ) : (
                                    'Date not available'
                                  )}
                                </small>
                                {activity.description && getStatusBadgeForStaff(activity.description)}
                              </div>
                              <small className="text-muted">by {activity.user || 'System'}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <FaClock size={48} className="text-muted mb-3" />
                      <p className="text-muted mb-0">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </>
      )}

      {/* Analytics Tab - MODIFIED */}
      {activeTab === 'analytics' && (
        <div className="row">
            <div className="col-lg-12 mb-4">
                <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
                    <Card.Header className="border-0 bg-white"><h6 className="mb-0 fw-bold"><FaChartLine className="me-2 text-primary" />Monthly Activity Trends</h6></Card.Header>
                    <Card.Body>
                        <div style={{ height: '300px' }}>
                            <Line data={{
                                labels: stats.monthlyData?.map(item => item.month) || [],
                                datasets: [
                                {
                                    label: 'Bills Processed',
                                    data: stats.monthlyData?.map(item => item.bills || 0) || [],
                                    borderColor: '#22c55e',
                                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                    fill: true,
                                    tension: 0.4,
                                },
                                {
                                    label: 'Payments Processed',
                                    data: stats.monthlyData?.map(item => item.payments || 0) || [],
                                    borderColor: '#7e5bef',
                                    backgroundColor: 'rgba(126, 91, 239, 0.1)',
                                    fill: true,
                                    tension: 0.4,
                                }
                                ]
                            }} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </Card.Body>
                </Card>
            </div>
            <div className="col-md-6 col-xl-3 mb-4">
                <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '15px' }}>
                    <Card.Header className="border-0 bg-white"><h6 className="mb-0 fw-bold"><FaFileInvoice className="me-2 text-success" />Bill Status</h6></Card.Header>
                    <Card.Body className="d-flex justify-content-center align-items-center">
                        <div style={{ width: '220px', height: '220px' }}>
                            <Doughnut data={{
                                labels: Object.keys(stats.statusData?.billStatuses || {}),
                                datasets: [{
                                    data: Object.values(stats.statusData?.billStatuses || {}),
                                    backgroundColor: Object.keys(stats.statusData?.billStatuses || {}).map(key => statusColors[key.toLowerCase()] || '#6c757d')
                                }]
                            }} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </Card.Body>
                </Card>
            </div>
            <div className="col-md-6 col-xl-3 mb-4">
                <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '15px' }}>
                    <Card.Header className="border-0 bg-white"><h6 className="mb-0 fw-bold"><FaMoneyBill className="me-2 text-info" />Payment Status</h6></Card.Header>
                    <Card.Body className="d-flex justify-content-center align-items-center">
                        <div style={{ width: '220px', height: '220px' }}>
                            <Doughnut data={{
                                labels: Object.keys(stats.statusData?.paymentStatuses || {}),
                                datasets: [{
                                    data: Object.values(stats.statusData?.paymentStatuses || {}),
                                    backgroundColor: Object.keys(stats.statusData?.paymentStatuses || {}).map(key => statusColors[key.toLowerCase()] || '#6c757d')
                                }]
                            }} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </Card.Body>
                </Card>
            </div>
            <div className="col-md-6 col-xl-3 mb-4">
                <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '15px' }}>
                    <Card.Header className="border-0 bg-white"><h6 className="mb-0 fw-bold"><FaFileAlt className="me-2 text-warning" />DFS Status</h6></Card.Header>
                    <Card.Body className="d-flex justify-content-center align-items-center">
                        <div style={{ width: '220px', height: '220px' }}>
                            <Doughnut data={{
                                labels: Object.keys(stats.statusData?.dfsStatuses || {}),
                                datasets: [{
                                    data: Object.values(stats.statusData?.dfsStatuses || {}),
                                    backgroundColor: Object.keys(stats.statusData?.dfsStatuses || {}).map(key => statusColors[key.toLowerCase().replace(' ', '-')] || '#6c757d')
                                }]
                            }} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </Card.Body>
                </Card>
            </div>
            <div className="col-md-6 col-xl-3 mb-4">
                <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '15px' }}>
                    <Card.Header className="border-0 bg-white"><h6 className="mb-0 fw-bold"><FaTasks className="me-2 text-secondary" />Document Types</h6></Card.Header>
                    <Card.Body className="d-flex justify-content-center align-items-center">
                        <div style={{ width: '220px', height: '220px' }}>
                            <Doughnut data={{
                                labels: ['Regular', 'DFS'],
                                datasets: [{
                                    data: [stats.totalRegularDocs, stats.totalDfsDocs],
                                    backgroundColor: [statusColors['regular'], statusColors['dfs']]
                                }]
                            }} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
      )}


      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="row">
          <div className="col-12">
            <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
              <Card.Header className="border-0 bg-white d-flex justify-content-between align-items-center">
                <h6 className="card-title mb-0 text-dark fw-bold">
                  <FaChartBar className="me-2 text-primary" />
                  Monthly Activity Report
                </h6>
                <Button variant="outline-primary" size="sm">
                  <FaFileExport className="me-1" /> Export Report
                </Button>
              </Card.Header>
              <Card.Body>
                <Table responsive striped hover>
                  <thead className="table-light">
                    <tr>
                      <th>Month</th>
                      <th>Bills Processed</th>
                      <th>Payments Processed</th>
                      <th>Documents Handled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.monthlyData.length > 0 ? (
                      stats.monthlyData.map((trend, index) => (
                        <tr key={index}>
                          <td><strong>{trend.month}</strong></td>
                          <td>{trend.bills}</td>
                          <td>{trend.payments}</td>
                          <td>{trend.documents}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">No monthly data available to generate a report.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
      
      {renderInfoCard(activeTab)}
    </div>
  );
};

export default HomePageStaff;

