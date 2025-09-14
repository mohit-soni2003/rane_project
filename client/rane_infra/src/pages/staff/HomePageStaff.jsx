import React, { useEffect, useState } from 'react';
import { FaFileInvoice, FaUserTie, FaFileAlt, FaClock, FaCheckCircle, FaExclamationTriangle, FaChartLine, FaChartBar, FaChartPie, FaEye, FaCalendarAlt, FaRupeeSign, FaTasks, FaMoneyBill } from 'react-icons/fa';
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
import { Card } from 'react-bootstrap';

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
          {/* Bill Status Distribution - Pie Chart */}
          <div className="col-lg-6 col-xl-4 mb-4">
            <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
              <Card.Header className="border-0 bg-white">
                <h6 className="card-title mb-0 text-dark fw-bold">
                  <FaChartLine className="me-2 text-primary" />
                  Bill Status Distribution
                </h6>
              </Card.Header>
              <Card.Body>
                {(() => {
                  const approved = stats.statusData?.billStatuses?.approved || stats.statusData?.billStatuses?.Approved || 0;
                  const pending = stats.statusData?.billStatuses?.pending || stats.statusData?.billStatuses?.Pending || 0;
                  const rejected = stats.statusData?.billStatuses?.rejected || stats.statusData?.billStatuses?.Rejected || 0;
                  const processing = stats.statusData?.billStatuses?.processing || stats.statusData?.billStatuses?.Processing || 0;
                  const totalBills = approved + pending + rejected + processing;
                  const hasData = totalBills > 0;

                  return (
                    <>
                      <div className="d-flex justify-content-center">
                        <div style={{ width: '200px', height: '200px' }}>
                          {hasData ? (
                            <Pie
                              data={{
                                labels: ['Approved', 'Pending', 'Rejected', 'Processing'],
                                datasets: [{
                                  data: [approved, pending, rejected, processing],
                                  backgroundColor: [
                                    '#22c55e', // Green for approved
                                    '#f59e0b', // Orange for pending
                                    '#ef4444', // Red for rejected
                                    '#7e5bef'  // Purple for processing
                                  ],
                                  borderColor: [
                                    '#16a34a',
                                    '#d97706',
                                    '#dc2626',
                                    '#6d28d9'
                                  ],
                                  borderWidth: 2,
                                  hoverBackgroundColor: [
                                    '#16a34a',
                                    '#d97706',
                                    '#dc2626',
                                    '#6d28d9'
                                  ]
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'bottom',
                                    labels: {
                                      padding: 15,
                                      usePointStyle: true,
                                      font: {
                                        size: 11,
                                        weight: 'bold'
                                      }
                                    }
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function(context) {
                                        const label = context.label || '';
                                        const value = context.parsed || 0;
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                        return `${label}: ${value} (${percentage}%)`;
                                      }
                                    }
                                  }
                                }
                              }}
                            />
                          ) : (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center">
                              <div className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  backgroundColor: '#f8f9fa',
                                  border: '2px dashed #dee2e6'
                                }}>
                                <FaChartLine size={25} color="#6c757d" />
                              </div>
                              <h6 className="text-muted mb-1" style={{ fontSize: '12px' }}>No Bill Data</h6>
                              <p className="text-muted small" style={{ fontSize: '10px' }}>Bills will appear here</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </Card.Body>
            </Card>
          </div>

          {/* Bill Status Comparison - Bar Chart */}
          <div className="col-lg-6 col-xl-4 mb-4">
            <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
              <Card.Header className="border-0 bg-white">
                <h6 className="card-title mb-0 text-dark fw-bold">
                  <FaChartBar className="me-2 text-success" />
                  Bill Status Comparison
                </h6>
              </Card.Header>
              <Card.Body>
                {(() => {
                  const approved = stats.statusData?.billStatuses?.approved || stats.statusData?.billStatuses?.Approved || 0;
                  const pending = stats.statusData?.billStatuses?.pending || stats.statusData?.billStatuses?.Pending || 0;
                  const rejected = stats.statusData?.billStatuses?.rejected || stats.statusData?.billStatuses?.Rejected || 0;
                  const processing = stats.statusData?.billStatuses?.processing || stats.statusData?.billStatuses?.Processing || 0;
                  const totalBills = approved + pending + rejected + processing;
                  const hasData = totalBills > 0;

                  return (
                    <>
                      <div className="d-flex justify-content-center">
                        <div style={{ width: '100%', height: '200px' }}>
                          {hasData ? (
                            <Bar
                              data={{
                                labels: ['Approved', 'Pending', 'Rejected', 'Processing'],
                                datasets: [{
                                  label: 'Bill Count',
                                  data: [approved, pending, rejected, processing],
                                  backgroundColor: [
                                    '#22c55e',
                                    '#f59e0b',
                                    '#ef4444',
                                    '#7e5bef'
                                  ],
                                  borderColor: [
                                    '#16a34a',
                                    '#d97706',
                                    '#dc2626',
                                    '#6d28d9'
                                  ],
                                  borderWidth: 1,
                                  borderRadius: 4,
                                  borderSkipped: false,
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    display: false
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function(context) {
                                        return `${context.label}: ${context.parsed.y}`;
                                      }
                                    }
                                  }
                                },
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    ticks: {
                                      stepSize: 1,
                                      font: {
                                        size: 10
                                      }
                                    },
                                    grid: {
                                      display: false
                                    }
                                  },
                                  x: {
                                    ticks: {
                                      font: {
                                        size: 10
                                      }
                                    },
                                    grid: {
                                      display: false
                                    }
                                  }
                                }
                              }}
                            />
                          ) : (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center">
                              <div className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  backgroundColor: '#f8f9fa',
                                  border: '2px dashed #dee2e6'
                                }}>
                                <FaChartBar size={25} color="#6c757d" />
                              </div>
                              <h6 className="text-muted mb-1" style={{ fontSize: '12px' }}>No Bill Data</h6>
                              <p className="text-muted small" style={{ fontSize: '10px' }}>Bills will appear here</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </Card.Body>
            </Card>
          </div>

          {/* Payment Analytics - Doughnut Chart */}
          <div className="col-lg-6 col-xl-4 mb-4">
            <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
              <Card.Header className="border-0 bg-white">
                <h6 className="card-title mb-0 text-dark fw-bold">
                  <FaMoneyBill className="me-2 text-info" />
                  Payment Analytics
                </h6>
              </Card.Header>
              <Card.Body>
                {(() => {
                  const totalPayments = stats.pendingPayments || 0;
                  const approvedPayments = stats.statusData?.paymentStatuses?.approved || stats.statusData?.paymentStatuses?.Approved || 0;
                  const hasPaymentData = totalPayments > 0 || approvedPayments > 0;

                  return (
                    <>
                      <div className="d-flex justify-content-center">
                        <div style={{ width: '200px', height: '200px' }}>
                          {hasPaymentData ? (
                            <Doughnut
                              data={{
                                labels: ['Pending', 'Approved'],
                                datasets: [{
                                  data: [totalPayments, approvedPayments],
                                  backgroundColor: [
                                    '#f59e0b',
                                    '#10b981'
                                  ],
                                  borderColor: [
                                    '#d97706',
                                    '#059669'
                                  ],
                                  borderWidth: 3,
                                  hoverBackgroundColor: [
                                    '#d97706',
                                    '#059669'
                                  ],
                                  cutout: '60%'
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'bottom',
                                    labels: {
                                      padding: 15,
                                      usePointStyle: true,
                                      font: {
                                        size: 11,
                                        weight: 'bold'
                                      }
                                    }
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function(context) {
                                        const label = context.label || '';
                                        const value = context.parsed || 0;
                                        return `${label}: ₹${value.toLocaleString('en-IN')}`;
                                      }
                                    }
                                  }
                                }
                              }}
                            />
                          ) : (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center">
                              <div className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  backgroundColor: '#f8f9fa',
                                  border: '2px dashed #dee2e6'
                                }}>
                                <FaMoneyBill size={25} color="#6c757d" />
                              </div>
                              <h6 className="text-muted mb-1" style={{ fontSize: '12px' }}>No Payment Data</h6>
                              <p className="text-muted small" style={{ fontSize: '10px' }}>Payments will appear here</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {hasPaymentData && (
                        <div className="text-center mt-2">
                          <small className="text-muted">
                            Approval Rate: {totalPayments + approvedPayments > 0
                              ? Math.round((approvedPayments / (totalPayments + approvedPayments)) * 100)
                              : 0}%
                          </small>
                        </div>
                      )}
                    </>
                  );
                })()}
              </Card.Body>
            </Card>
          </div>

          {/* Monthly Trends - Line Chart */}
          <div className="col-lg-6 col-xl-6 mb-4">
            <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
              <Card.Header className="border-0 bg-white">
                <h6 className="card-title mb-0 text-dark fw-bold">
                  <FaChartLine className="me-2 text-warning" />
                  Monthly Trends
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-center">
                  <div style={{ width: '100%', height: '250px' }}>
                    <Line
                      data={{
                        labels: stats.monthlyData?.length > 0
                          ? stats.monthlyData.map(item => item.month).slice(-6)
                          : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [
                          {
                            label: 'Bills Processed',
                            data: stats.monthlyData?.length > 0
                              ? stats.monthlyData.map(item => item.bills || 0).slice(-6)
                              : [12, 19, 15, 25, 22, 30],
                            borderColor: '#22c55e',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: '#22c55e',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 4
                          },
                          {
                            label: 'Payments Processed',
                            data: stats.monthlyData?.length > 0
                              ? stats.monthlyData.map(item => item.payments || 0).slice(-6)
                              : [8, 15, 12, 20, 18, 25],
                            borderColor: '#7e5bef',
                            backgroundColor: 'rgba(126, 91, 239, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: '#7e5bef',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 4
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: {
                              usePointStyle: true,
                              padding: 20,
                              font: {
                                size: 11,
                                weight: 'bold'
                              }
                            }
                          },
                          tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                              label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 5,
                              font: {
                                size: 10
                              }
                            },
                            grid: {
                              color: 'rgba(0,0,0,0.05)'
                            }
                          },
                          x: {
                            ticks: {
                              font: {
                                size: 10
                              }
                            },
                            grid: {
                              display: false
                            }
                          }
                        },
                        interaction: {
                          mode: 'nearest',
                          axis: 'x',
                          intersect: false
                        }
                      }}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Performance Overview - Radar Chart */}
          <div className="col-lg-6 col-xl-6 mb-4">
            <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
              <Card.Header className="border-0 bg-white">
                <h6 className="card-title mb-0 text-dark fw-bold">
                  <FaChartBar className="me-2 text-danger" />
                  Performance Overview
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-center">
                  <div style={{ width: '100%', height: '250px' }}>
                    <Radar
                      data={{
                        labels: ['Bill Processing', 'Payment Handling', 'Client Support', 'Document Management', 'Task Completion', 'Response Time'],
                        datasets: [{
                          label: 'Current Performance',
                          data: [85, 78, 92, 88, 95, 82],
                          borderColor: '#ef4444',
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          borderWidth: 2,
                          pointBackgroundColor: '#ef4444',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2,
                          pointRadius: 4
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `${context.label}: ${context.parsed.r}%`;
                              }
                            }
                          }
                        },
                        scales: {
                          r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                              stepSize: 20,
                              font: {
                                size: 10
                              }
                            },
                            grid: {
                              color: 'rgba(0,0,0,0.1)'
                            },
                            angleLines: {
                              color: 'rgba(0,0,0,0.1)'
                            },
                            pointLabels: {
                              font: {
                                size: 11,
                                weight: 'bold'
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
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
