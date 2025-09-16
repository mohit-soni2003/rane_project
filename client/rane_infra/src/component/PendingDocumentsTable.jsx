import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, Table, Badge, Button, Spinner, Row, Col } from 'react-bootstrap';
import { FaFileAlt, FaEye, FaClock, FaCheckCircle, FaTimesCircle, FaSync } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getDocumentsByUserId, updateDocumentStatus } from '../services/documentService';
import { getMyUploadedFiles } from '../services/dfsService';
import { clientService } from '../services/clientService';

const PendingDocumentsTable = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState([]);
  const [dfsDocuments, setDfsDocuments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Document categories from DocumentCategory.jsx
  const documentCategories = [
    'LOA', 'SalesOrder', 'PurchaseOrder', 'PayIn', 'PayOut',
    'Estimate', 'DeliveryChallan', 'Expense', 'BankReference', 'Other'
  ];

  // Cache for performance optimization
  const [cache, setCache] = useState(new Map());
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes cache

  const refreshData = useCallback(async () => {
    if (!user?._id) return;

    try {
      setRefreshing(true);
      setError(null);
      
      // Clear cache for this user
      const cacheKey = `pending-docs-${user._id}`;
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(cacheKey);
        return newCache;
      });

      await fetchAllPendingDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }, [user?._id]);

  const fetchAllPendingDocuments = useCallback(async () => {
    if (!user?._id) return;

    const cacheKey = `pending-docs-${user._id}`;
    const now = Date.now();

    // Check cache first for performance
    if (cache.has(cacheKey) && (now - lastFetchTime) < CACHE_DURATION) {
      const cachedData = cache.get(cacheKey);
      setDocuments(cachedData.documents || []);
      setDfsDocuments(cachedData.dfsDocuments || []);
      setBills(cachedData.bills || []);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // **PERFORMANCE OPTIMIZATION**: Use Promise.all for parallel API calls
      const documentPromises = documentCategories.map(async (category) => {
        try {
          // Add timeout to prevent hanging in deployed environment
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout: ${category}`)), 15000)
          );
          
          const fetchPromise = getDocumentsByUserId(user._id, category);
          const categoryDocs = await Promise.race([fetchPromise, timeoutPromise]);
          
          const pendingDocs = categoryDocs.filter(doc => doc.status === 'pending');
          return pendingDocs.map(doc => ({ ...doc, source: 'documents', category }));
        } catch (err) {
          console.error(`Error fetching ${category} documents:`, err.message);
          return []; // Return empty array on error to continue with other categories
        }
      });

      // Fetch DFS documents in parallel
      const dfsPromise = (async () => {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout: DFS')), 15000)
          );
          
          const fetchPromise = getMyUploadedFiles();
          const dfsResult = await Promise.race([fetchPromise, timeoutPromise]);
          
          const dfsArray = Array.isArray(dfsResult) ? dfsResult : [];
          const pendingDfsDocs = dfsArray.filter(doc =>
            doc.status === 'pending' || doc.status === 'in-review'
          );
          return pendingDfsDocs.map(doc => ({ ...doc, source: 'dfs' }));
        } catch (err) {
          console.error('Error fetching DFS documents:', err.message);
          return [];
        }
      })();

      // Fetch bills in parallel
      const billsPromise = (async () => {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout: Bills')), 15000)
          );
          
          const fetchPromise = clientService.getMyBills(user._id);
          const billsResult = await Promise.race([fetchPromise, timeoutPromise]);
          
          const billsArray = Array.isArray(billsResult) ? billsResult : [];
          const pendingBills = billsArray.filter(bill =>
            bill.paymentStatus === 'Unpaid' || bill.paymentStatus === 'Pending'
          );
          return pendingBills.map(bill => ({ ...bill, source: 'bills' }));
        } catch (err) {
          console.error('Error fetching bills:', err.message);
          return [];
        }
      })();

      // Execute all requests in parallel for maximum speed
      const [categoryResults, dfsResults, billsResults] = await Promise.all([
        Promise.all(documentPromises),
        dfsPromise,
        billsPromise
      ]);

      // Flatten document results
      const allDocuments = categoryResults.flat();
      const dfsDocs = dfsResults;
      const billsDocs = billsResults;

      // Cache the results for better performance
      setCache(prev => new Map(prev).set(cacheKey, {
        documents: allDocuments,
        dfsDocuments: dfsDocs,
        bills: billsDocs
      }));
      setLastFetchTime(now);

      setDocuments(allDocuments);
      setDfsDocuments(dfsDocs);
      setBills(billsDocs);
    } catch (err) {
      console.error('Error in fetchAllPendingDocuments:', err);
      setError(err.message || 'Failed to load pending documents');
    } finally {
      setLoading(false);
    }
  }, [user?._id, cache, lastFetchTime, CACHE_DURATION]);

  useEffect(() => {
    fetchAllPendingDocuments();
  }, [fetchAllPendingDocuments]);

  const handleDocumentClick = useCallback((doc) => {
    if (doc.source === 'documents') {
      navigate(`/client/document/category/${doc.category}`);
    } else if (doc.source === 'dfs') {
      navigate(`/client/dfsrequest/${doc._id}`);
    } else if (doc.source === 'bills') {
      navigate(`/client/bill/${doc._id}`);
    }
  }, [navigate]);

  const handleAccept = useCallback(async (doc) => {
    try {
      if (doc.source === 'documents') {
        await updateDocumentStatus(doc._id, 'accepted');
        setDocuments(prev => prev.filter(d => d._id !== doc._id));
        
        // Update cache
        const cacheKey = `pending-docs-${user._id}`;
        if (cache.has(cacheKey)) {
          const cached = cache.get(cacheKey);
          cached.documents = cached.documents.filter(d => d._id !== doc._id);
          setCache(prev => new Map(prev).set(cacheKey, cached));
        }
      }
    } catch (err) {
      console.error('Error accepting document:', err);
    }
  }, [user?._id, cache]);

  const handleReject = useCallback(async (docId) => {
    try {
      await updateDocumentStatus(docId, 'rejected');
      setDocuments(prev => prev.filter(d => d._id !== docId));
      
      // Update cache
      const cacheKey = `pending-docs-${user._id}`;
      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        cached.documents = cached.documents.filter(d => d._id !== docId);
        setCache(prev => new Map(prev).set(cacheKey, cached));
      }
    } catch (err) {
      console.error('Error rejecting document:', err);
    }
  }, [user?._id, cache]);

  const getStatusBadge = useCallback((status, source) => {
    if (source === 'dfs') {
      switch (status) {
        case 'pending':
          return <Badge bg="secondary">Pending</Badge>;
        case 'in-review':
          return <Badge bg="warning" text="dark">In Review</Badge>;
        case 'approved':
          return <Badge bg="success">Approved</Badge>;
        case 'rejected':
          return <Badge bg="danger">Rejected</Badge>;
        default:
          return <Badge bg="info">{status}</Badge>;
      }
    } else {
      switch (status) {
        case 'accepted':
          return <Badge bg="success">Accepted</Badge>;
        case 'rejected':
          return <Badge bg="danger">Rejected</Badge>;
        case 'pending':
        default:
          return <Badge bg="warning" text="dark">Pending</Badge>;
      }
    }
  }, []);

  // Memoized calculations for performance
  const allPendingDocuments = useMemo(() => 
    [...documents, ...dfsDocuments, ...bills], 
    [documents, dfsDocuments, bills]
  );
  
  const totalPending = useMemo(() => 
    allPendingDocuments.length, 
    [allPendingDocuments.length]
  );

  if (loading && !refreshing) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
        <Card.Body className="text-center py-4">
          <Spinner animation="border" variant="primary" size="sm" />
          <p className="text-muted mt-2 mb-2">Loading pending documents...</p>
          <small className="text-muted">Fetching from {documentCategories.length + 2} sources in parallel</small>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
        <Card.Body className="text-center py-4">
          <p className="text-danger mb-3">Error loading documents: {error}</p>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={refreshData}
            disabled={refreshing}
          >
            <FaSync className={`me-1 ${refreshing ? 'fa-spin' : ''}`} />
            {refreshing ? 'Retrying...' : 'Retry'}
          </Button>
        </Card.Body>
      </Card>
    );
  }

  if (totalPending === 0) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
        <Card.Header className="border-0 bg-white" style={{ borderRadius: '15px 15px 0 0' }}>
          <h6 className="card-title mb-0 text-dark fw-bold">
            <FaCheckCircle className="me-2 text-success" />
            Pending Documents, DFS & Bills
          </h6>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <FaCheckCircle size={48} className="text-success mb-3" />
          <h6 className="text-muted mb-1">All Caught Up!</h6>
          <p className="text-muted mb-0">No pending documents, DFS requests, or bills</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-0" style={{ borderRadius: '15px', backgroundColor: '#fff' }}>
      <Card.Header className="border-0 bg-white" style={{ borderRadius: '15px 15px 0 0' }}>
        <Row className="align-items-center">
          <Col>
            <h6 className="card-title mb-0 text-dark fw-bold">
              <FaClock className="me-2 text-warning" />
              Pending Documents, DFS & Bills ({totalPending})
            </h6>
          </Col>
          <Col xs="auto" className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={refreshData}
              disabled={refreshing || loading}
              title="Refresh data"
            >
              <FaSync className={`me-1 ${refreshing ? 'fa-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Badge bg="warning" text="dark" className="fs-6">
              {totalPending} pending
            </Badge>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="border-0 ps-3">Type</th>
                <th className="border-0">Title/Code</th>
                <th className="border-0">Category</th>
                <th className="border-0">Date</th>
                <th className="border-0">Status</th>
                <th className="border-0">Source</th>
                <th className="border-0 text-center pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allPendingDocuments.slice(0, 10).map((doc, index) => (
                <tr
                  key={`${doc.source}-${doc._id || index}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleDocumentClick(doc)}
                  className="table-row-hover"
                >
                  <td className="ps-3">
                    <FaFileAlt className="text-primary me-2" />
                    {doc.source === 'dfs' ? 'DFS' : doc.source === 'bills' ? 'Bill' : 'Document'}
                  </td>
                  <td>
                    {doc.source === 'dfs'
                      ? doc.fileTitle
                      : doc.source === 'bills'
                      ? (doc.invoiceNo || doc.loaNo || 'N/A')
                      : (doc.documentCode || doc.docType)
                    }
                  </td>
                  <td>
                    {doc.source === 'dfs'
                      ? (doc.docType || 'DFS')
                      : doc.source === 'bills'
                      ? 'Bill'
                      : doc.category
                    }
                  </td>
                  <td>
                    {doc.source === 'dfs'
                      ? new Date(doc.createdAt).toLocaleDateString()
                      : doc.source === 'bills'
                      ? new Date(doc.submittedAt || doc.createdAt).toLocaleDateString()
                      : new Date(doc.uploadDate || doc.dateOfIssue).toLocaleDateString()
                    }
                  </td>
                  <td>
                    {doc.source === 'bills'
                      ? <Badge bg={doc.paymentStatus === 'Unpaid' ? 'warning' : 'secondary'} text="dark">{doc.paymentStatus}</Badge>
                      : getStatusBadge(doc.status, doc.source)
                    }
                  </td>
                  <td>
                    <Badge bg={doc.source === 'dfs' ? 'info' : doc.source === 'bills' ? 'success' : 'primary'}>
                      {doc.source === 'dfs' ? 'DFS' : doc.source === 'bills' ? 'Bills' : 'Documents'}
                    </Badge>
                  </td>
                  <td className="text-center pe-3">
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDocumentClick(doc);
                      }}
                      title="Open"
                    >
                      <FaCheckCircle size={12} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {allPendingDocuments.length > 10 && (
          <div className="p-3 text-center border-top">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate('/client/document/category')}
            >
              View All Pending Items ({allPendingDocuments.length})
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PendingDocumentsTable;