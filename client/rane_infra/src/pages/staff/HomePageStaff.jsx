import React, { useEffect, useState } from 'react';
import { FaFileInvoice, FaUserTie, FaFileAlt, FaClock, FaCheckCircle, FaExclamationTriangle, FaChartLine, FaChartBar, FaChartPie, FaEye, FaCalendarAlt, FaRupeeSign, FaTasks } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';
import { staffService } from '../../services/staffService';

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
    statusData: [],
    paymentTrends: []
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
            paymentTrends: data.monthlyData || [] // Use monthly data for payment trends
          });
        } else {
          console.error('Failed to fetch dashboard stats:', response.message);
        }
      } catch (error) {
        console.error('Error fetching staff stats:', error);
        // Set default values if API fails
        setStats({
          totalBills: 0,
          totalClients: 0,
          pendingPayments: 0,
          totalDocuments: 0,
          pendingDfs: 0,
          recentActivity: [],
          monthlyData: [],
          statusData: {
            billStatuses: {},
            paymentStatuses: {},
            dfsStatuses: {}
          },
          paymentTrends: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user._id]);

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
                                {activity.description && (
                                  <span className="badge bg-secondary">{activity.description}</span>
                                )}
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

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
              <div className="card-header border-0 bg-white">
                <h6 className="card-title mb-0 text-dark fw-bold">
                  <FaChartLine className="me-2 text-primary" />
                  Monthly Trends
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {stats.monthlyData.map((data, index) => (
                    <div key={index} className="col-6 mb-3">
                      <div className="p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                        <h6 className="mb-2 text-primary">{data.month}</h6>
                        <div className="d-flex justify-content-between">
                          <small className="text-muted">Bills: {data.bills}</small>
                          <small className="text-muted">Payments: {data.payments}</small>
                        </div>
                        <div className="d-flex justify-content-between">
                          <small className="text-muted">Docs: {data.documents}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
              <div className="card-header border-0 bg-white">
                <h6 className="card-title mb-0 text-dark fw-bold">
                  <FaChartPie className="me-2 text-primary" />
                  Status Distribution
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <h6 className="text-success mb-2">Approved Bills</h6>
                    <h4 className="text-success">{stats.statusData.billStatuses?.approved || stats.statusData.billStatuses?.Approved || 0}</h4>
                  </div>
                  <div className="col-6">
                    <h6 className="text-warning mb-2">Pending Bills</h6>
                    <h4 className="text-warning">{stats.statusData.billStatuses?.pending || stats.statusData.billStatuses?.Pending || 0}</h4>
                  </div>
                  <div className="col-6">
                    <h6 className="text-danger mb-2">Rejected Bills</h6>
                    <h4 className="text-danger">{stats.statusData.billStatuses?.rejected || stats.statusData.billStatuses?.Rejected || 0}</h4>
                  </div>
                  <div className="col-6">
                    <h6 className="text-info mb-2">Processing</h6>
                    <h4 className="text-info">{stats.statusData.billStatuses?.processing || stats.statusData.billStatuses?.Processing || 0}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
              <div className="card-header border-0 bg-white">
                <h6 className="card-title mb-0 text-dark fw-bold">
                  <FaChartBar className="me-2 text-primary" />
                  Payment Trends (Last 6 Months)
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {stats.monthlyData.map((trend, index) => (
                    <div key={index} className="col-md-2 mb-3">
                      <div className="card h-100" style={{ borderRadius: '10px' }}>
                        <div className="card-body text-center">
                          <h6 className="card-title text-primary">{trend.month}</h6>
                          <h5 className="text-success mb-1">{trend.payments} payments</h5>
                          <small className="text-muted">{trend.bills} bills, {trend.documents} docs</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePageStaff;
