import React, { useEffect, useState } from 'react';
import ClientHeader from '../../component/header/ClientHeader';
import { Card, Spinner, Button, Badge, Alert, Row, Col } from 'react-bootstrap';
import {
  FaFileAlt, FaCheckCircle, FaTimesCircle, FaRupeeSign, FaMoneyBill,
  FaClock, FaCalendarCheck, FaChartLine, FaChartBar, FaEye,
  FaUpload, FaDownload, FaBell, FaInfoCircle, FaCalendarAlt,
  FaWallet, FaFileInvoiceDollar, FaHandshake, FaCog, FaMobileAlt
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuthStore } from '../../store/authStore';
import { clientService } from '../../services/clientService';
// Assuming a service that can fetch documents by type exists
import { getDocumentsByUserId } from '../../services/documentService'; 
import { useNavigate } from 'react-router-dom';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import PendingDocumentsTable from '../../component/PendingDocumentsTable';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

// This array is based on your DocumentCategory.jsx file
const documentCategories = [
  'LOA', 'SalesOrder', 'PurchaseOrder', 'PayIn', 'PayOut', 
  'Estimate', 'DeliveryChallan', 'Expense', 'BankReference', 'Other'
];

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

    // --- NEW FUNCTION TO FETCH DOCUMENT COUNTS ---
    // This function demonstrates fetching counts for each document type.
    // NOTE: This makes many API calls. A single backend endpoint returning this data is more efficient.
    const fetchDocumentCounts = async () => {
        try {
            const counts = await Promise.all(
                documentCategories.map(async (docType) => {
                    // We use the service from ViewDocumentPage to get documents of a specific type
                    const documents = await getDocumentsByUserId(user._id, docType);
                    return { type: docType, count: documents.length };
                })
            );
            return counts.filter(item => item.count > 0); // Only include types with documents
        } catch (error) {
            console.error("Failed to fetch document counts:", error);
            return []; // Return empty array on error
        }
    };

    const fetchStats = async () => {
      try {
        console.log('Fetching dashboard stats for user:', user._id);
        // Fetch main stats
        const response = await clientService.getDashboardStats(user._id);
        
        // Fetch detailed document counts separately
        const docTypeCounts = await fetchDocumentCounts();

        let finalStats = {};

        if (response.success) {
          console.log('Setting stats data:', response.stats);
          finalStats = response.stats;
        } else {
          console.error('Failed to fetch dashboard stats:', response.message);
          // Set default values if API fails
          finalStats = {
            totalBills: 0, totalPayments: 0, totalDocuments: 0, totalDfsRequests: 0,
            pendingBills: 0, approvedBills: 0, rejectedBills: 0,
            pendingPayments: 0, approvedPayments: 0,
            recentActivity: [], monthlyTrends: [],
          };
        }

        // Combine the stats with the newly fetched document counts
        setStats({ ...finalStats, documentTypes: docTypeCounts });

      } catch (err) {
        console.error('Error fetching stats:', err);
        // Set default values if API fails
        setStats({
            totalBills: 0, totalPayments: 0, totalDocuments: 0, totalDfsRequests: 0,
            pendingBills: 0, approvedBills: 0, rejectedBills: 0,
            pendingPayments: 0, approvedPayments: 0,
            recentActivity: [], monthlyTrends: [], documentTypes: []
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

  // Data for the new charts
  const monthlyTrendsData = {
      labels: stats?.monthlyTrends?.map(d => d.month) || [],
      datasets: [
          {
              label: 'Bills Submitted',
              data: stats?.monthlyTrends?.map(d => d.bills) || [],
              borderColor: '#22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              fill: true,
              tension: 0.4,
          },
          {
              label: 'Payments Requested',
              data: stats?.monthlyTrends?.map(d => d.payments) || [],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4,
          }
      ]
  };
    
  const documentTypesData = {
      labels: stats?.documentTypes?.map(d => d.type) || [],
      datasets: [{
          label: 'Document Count',
          data: stats?.documentTypes?.map(d => d.count) || [],
          backgroundColor: [
              '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', 
              '#64748b', '#f43f5e', '#d946ef', '#0ea5e9', '#84cc16'
          ],
          borderRadius: 4,
      }]
  };

  return (
    <>
      <ClientHeader />
      <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '100px' }}>

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

            {/* Pending Documents Table */}
            <div className="row mb-4">
              <div className="col-12">
                <PendingDocumentsTable />
              </div>
            </div>
            
            {/* Quick Actions - This section is now below Pending Documents and is hidden on screens smaller than lg */}
            <div className="row mb-4 d-none d-lg-block">
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
            
            <div className="row mb-4 d-none">
                {/* This empty div with d-none replaces the previous mobile message */}
            </div>

          </>
        )}

        {/* Analytics Tab - REVAMPED */}
        {activeTab === 'analytics' && (
            <div className="row">
                {/* Monthly Activity */}
                <div className="col-lg-12 mb-4">
                    <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
                        <Card.Header className="border-0 bg-white"><h6 className="mb-0 fw-bold">Monthly Activity</h6></Card.Header>
                        <Card.Body>
                            <div style={{ height: '300px' }}>
                                <Line data={monthlyTrendsData} options={{ responsive: true, maintainAspectRatio: false }} />
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                {/* Bill Status */}
                <div className="col-lg-6 col-xl-4 mb-4">
                    <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
                        <Card.Header className="border-0 bg-white"><h6 className="mb-0 fw-bold">Bill Status</h6></Card.Header>
                        <Card.Body className="d-flex justify-content-center align-items-center">
                            <div style={{ width: '250px', height: '250px' }}>
                                <Doughnut data={{
                                    labels: ['Approved', 'Pending', 'Rejected'],
                                    datasets: [{
                                        data: [stats?.approvedBills, stats?.pendingBills, stats?.rejectedBills],
                                        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444']
                                    }]
                                }} options={{ responsive: true, maintainAspectRatio: false, cutout: '50%' }} />
                            </div>
                        </Card.Body>
                    </Card>
                </div>
                
                {/* Document Types */}
                <div className="col-lg-6 col-xl-8 mb-4">
                    <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
                        <Card.Header className="border-0 bg-white"><h6 className="mb-0 fw-bold">Document Types Breakdown</h6></Card.Header>
                        <Card.Body>
                             <div style={{ height: '250px' }}>
                                <Bar data={documentTypesData} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y' }} />
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

        {/* Mobile Floating Quick Action Button */}
        <div className="d-lg-none">
          <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4" style={{ zIndex: 1050 }}>
            <div className="dropdown">
              <button
                className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center"
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                type="button"
                id="quickActionsDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <FaHandshake size={24} color="white" />
              </button>
              <ul className="dropdown-menu shadow-lg border-0" aria-labelledby="quickActionsDropdown" style={{ minWidth: '200px' }}>
                <li>
                  <button className="dropdown-item d-flex align-items-center py-3" onClick={() => navigate('/client/upload-bill')}>
                    <FaUpload className="me-3 text-primary" />
                    <div>
                      <div className="fw-bold">Upload Bill</div>
                      <small className="text-muted">Submit new bill</small>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item d-flex align-items-center py-3" onClick={() => navigate('/client/my-bill')}>
                    <FaFileAlt className="me-3 text-success" />
                    <div>
                      <div className="fw-bold">My Bills</div>
                      <small className="text-muted">View all bills</small>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item d-flex align-items-center py-3" onClick={() => navigate('/client/payment-request')}>
                    <FaMoneyBill className="me-3 text-info" />
                    <div>
                      <div className="fw-bold">Payment Request</div>
                      <small className="text-muted">Request payment</small>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item d-flex align-items-center py-3" onClick={() => navigate('/client/my-payment-request')}>
                    <FaDownload className="me-3 text-warning" />
                    <div>
                      <div className="fw-bold">My Payments</div>
                      <small className="text-muted">View payment history</small>
                    </div>
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item d-flex align-items-center py-3" onClick={() => navigate('/client/upload-document')}>
                    <FaUpload className="me-3 text-secondary" />
                    <div>
                      <div className="fw-bold">Upload Document</div>
                      <small className="text-muted">DFS document upload</small>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item d-flex align-items-center py-3" onClick={() => navigate('/client/track-dfs/all')}>
                    <FaEye className="me-3 text-dark" />
                    <div>
                      <div className="fw-bold">Track DFS</div>
                      <small className="text-muted">Track documents</small>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item d-flex align-items-center py-3" onClick={() => navigate('/client/transaction')}>
                    <FaRupeeSign className="me-3 text-primary" />
                    <div>
                      <div className="fw-bold">Transactions</div>
                      <small className="text-muted">View transactions</small>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item d-flex align-items-center py-3" onClick={() => navigate('/client/document/category')}>
                    <FaFileAlt className="me-3 text-success" />
                    <div>
                      <div className="fw-bold">My Documents</div>
                      <small className="text-muted">View documents</small>
                    </div>
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item d-flex align-items-center py-3" onClick={() => navigate('/client/setting')}>
                    <FaCog className="me-3 text-secondary" />
                    <div>
                      <div className="fw-bold">Settings</div>
                      <small className="text-muted">Account settings</small>
                    </div>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item d-flex align-items-center py-3" onClick={() => navigate('/client/support')}>
                    <FaBell className="me-3 text-warning" />
                    <div>
                      <div className="fw-bold">Support</div>
                      <small className="text-muted">Get help</small>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

