import { backend_url } from '../store/keyStore';
import { useAuthStore } from '../store/authStore';

// Same centralized headers helper used across project.service.js
const authHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─────────────────────────────────────────────────────────────────
// PROJECT BILL SERVICE
// Mounted as: app.use("/projects/bill", require("./src/routes/project.billroutes"))
// So every route below is prefixed with /projects/bill on top of its
// own path (e.g. POST /v1/:projectId/bill -> /projects/bill/v1/:projectId/bill).
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// CREATE BILL FOR A PROJECT — matches POST /v1/:projectId/bill
// Body may include: billNo, loaNo, agrNo, loaDate, bnsAmt, adsAmt,
// totalAmt, rebate, billAmtInclusiveGST, tax, grossAmount, tdsAmt,
// items, recovery — billNo is required on the backend.
// items: [{ item, qty, rate }] — item is the Item _id
// recovery: [{ recoveryType, code, desc, recoveryAmt }]
// ─────────────────────────────────────────────────────────────────
export async function createProjectBill(projectId, billData = {}) {
  const res = await fetch(`${backend_url}/projects/bill/v1/${projectId}/bill`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify(billData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to create bill');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// GET ALL BILLS FOR A PROJECT — matches GET /v1/:projectId/bill
// ─────────────────────────────────────────────────────────────────
export async function getProjectBills(projectId) {
  const res = await fetch(`${backend_url}/projects/bill/v1/${projectId}/bill`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch bills');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// GET A SINGLE BILL BY ITS ID — matches GET /v1/bill/:billId
// ─────────────────────────────────────────────────────────────────
export async function getProjectBillById(billId) {
  const res = await fetch(`${backend_url}/projects/bill/v1/bill/${billId}`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to fetch bill');
  }
  return data.data;
}