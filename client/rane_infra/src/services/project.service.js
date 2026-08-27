import { backend_url } from '../store/keyStore';
import { useAuthStore } from '../store/authStore';

// Centralized headers — sends the bearer token if you have one AND
// keeps credentials:'include' in case your verifyToken middleware
// reads from an httpOnly cookie instead. Safe to keep both.
const authHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─────────────────────────────────────────────────────────────────
// CREATE PROJECT — matches POST /v1/create
// Body: { projectId, projectName, description }
// Returns the created project (status: "draft") including its
// Mongo _id, which is required for every subsequent update route.
// ─────────────────────────────────────────────────────────────────
export async function createProject({ projectId, projectName, description }) {
  const res = await fetch(`${backend_url}/project/v1/create`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ projectId, projectName, description }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to create project');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// UPDATE BASIC PROJECT DETAILS — matches PATCH /v1/basic-details/:projectId
// projectMongoId is the Mongo _id (Project.findById).
// Body: { projectName, description, projectUnder } — send only the
// fields you want to change, all are optional on the backend.
// ─────────────────────────────────────────────────────────────────
export async function updateBasicDetails(projectMongoId, { projectName, description, projectUnder } = {}) {
  const res = await fetch(`${backend_url}/project/v1/basic-details/${projectMongoId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ projectName, description, projectUnder }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update basic details');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// ADD PROJECT DOCUMENT — matches POST /v1/:projectId/document
// :projectId here is the Mongo _id (Project.findById), NOT the
// human-readable projectId field. Call this only after createProject
// has returned, using the returned project's _id.
// Body: { name, url, documentType }
// ─────────────────────────────────────────────────────────────────
export async function addProjectDocument(projectMongoId, { name, url, documentType }) {
  const res = await fetch(`${backend_url}/project/v1/${projectMongoId}/document`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ name, url, documentType }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to add document');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// CREATE / UPDATE ADVANCED PROJECT DETAILS — matches
// PATCH /v1/advance-details/:projectId
// Body may include any of: projectType, tenderType, department,
// contractType, biddingType, expenditureType, rankingOrderForBid,
// zone, subDepartment, circle, division, psuName, clientName,
// tenderNo, loaNo, agreementNo, loaDate, tenderTotalAmount,
// loaAmount, contractorName, contractorCode, tca, taa,
// jointVentureMembers
// Nothing is required on the backend — send only what you have; this
// works both the first time (create) and on later edits (update).
// ─────────────────────────────────────────────────────────────────
export async function updateAdvanceDetails(projectMongoId, advanceDetails = {}) {
  const res = await fetch(`${backend_url}/project/v1/advance-details/${projectMongoId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify(advanceDetails),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update advanced project details');
  }
  return data.data;
}
// ─────────────────────────────────────────────────────────────────
// LIST PROJECTS — matches GET /v1/list
// Optional query params: status, scope ("mine" | "all")
// Populates createdBy, currentAuthority, nextAuthority (name, email, profile)
// ─────────────────────────────────────────────────────────────────
export async function getProjects({ status, scope } = {}) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (scope) params.append('scope', scope);
  const qs = params.toString();

  const res = await fetch(`${backend_url}/project/v1/list${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load projects');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// PROJECTS ASSIGNED TO ME — matches GET /v1/current-authority
// Returns every project where currentAuthority === the logged-in user.
// Populates createdBy, currentAuthority, nextAuthority.
// ─────────────────────────────────────────────────────────────────
export async function getMyActionableProjects() {
  const res = await fetch(`${backend_url}/project/v1/current-authority`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load assigned projects');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// UPDATE PROJECT STATUS — matches PATCH /v1/status/:projectId
// Body: { status } — required on the backend, must be one of:
// in_progress, draft, completed, not_allotted, L2, L3, pending
// ─────────────────────────────────────────────────────────────────
export async function updateProjectStatus(projectMongoId, status) {
  const res = await fetch(`${backend_url}/project/v1/status/${projectMongoId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update project status');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// FORWARD PROJECT — matches PATCH /v1/forward/:projectId
// Actor is derived server-side from the logged-in user's token, so
// it isn't sent from here.
// Body: { action, remark, nextAuthority }
// action must be one of: approved, returned, rejected, pending
// nextAuthority is the userId the project should be forwarded to.
// ─────────────────────────────────────────────────────────────────
export async function forwardProject(projectMongoId, { action, remark, nextAuthority }) {
  const res = await fetch(`${backend_url}/project/v1/forward/${projectMongoId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ action, remark, nextAuthority }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to forward project');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// GET SINGLE PROJECT — matches GET /v1/:projectId
// Populates createdBy, currentAuthority, nextAuthority,
// documents.uploadedBy, approvals.actor.
// ─────────────────────────────────────────────────────────────────
export async function getProjectById(projectMongoId) {
  const res = await fetch(`${backend_url}/project/v1/${projectMongoId}`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load project');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// UPDATE LOCATION — matches PATCH /v1/location/:projectId
// Body: {
//   location: { state, city, district, pincode, siteAddress },
//   headquarterLocation: { state, city, district, pincode, siteAddress }
// }
// Both are optional — send either, both, or neither.
// ─────────────────────────────────────────────────────────────────
export async function updateLocation(projectMongoId, location = {}, headquarterLocation = {}) {
  const res = await fetch(`${backend_url}/project/v1/location/${projectMongoId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ location, headquarterLocation }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update location');
  }
  return data.data;
}
// ─────────────────────────────────────────────────────────────────
// UPDATE FINANCIAL DETAILS — matches PATCH /v1/financials/:projectId
// Body: { financials: { ...top-level fields, recoveryAtContractEnd: {...} } }
// NOTE: this route doesn't exist in your route file yet — add it
// following the same findById + conditional-field pattern as
// basic-details / advance-details before wiring this in production.
// ─────────────────────────────────────────────────────────────────
export async function updateFinancials(projectMongoId, financials = {}) {
  const res = await fetch(`${backend_url}/project/v1/financials/${projectMongoId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ financials }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update financial details');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// UPDATE BIDDING DETAILS — matches PATCH /v1/financials/bidding/:projectId
// Body: { bidding: { emdAmount, advertisedValue, status, biddingPosition,
//         biddingPercentage } }
// All fields optional — send only what you want to change. status must
// be one of: paid, unpaid, exempted. biddingPosition must be one of:
// below, above, at_par. Does NOT touch costEstimation — use
// addCostEstimation for that.
// ─────────────────────────────────────────────────────────────────
export async function updateBiddingDetails(projectMongoId, bidding = {}) {
  const res = await fetch(`${backend_url}/project/v1/financials/bidding/${projectMongoId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ bidding }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update bidding details');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// ADD ONE COST ESTIMATION ENTRY — matches
// POST /v1/financials/bidding/:projectId/cost-estimation
// Body: { name, amount } — both required, accepts exactly one entry
// per call. Returns the full updated costEstimation array.
// ─────────────────────────────────────────────────────────────────
export async function addCostEstimation(projectMongoId, { name, amount }) {
  const res = await fetch(`${backend_url}/project/v1/financials/bidding/${projectMongoId}/cost-estimation`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ name, amount }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to add cost estimation entry');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// UPDATE PG DETAILS — matches PATCH /v1/financials/pg/:projectId
// Body: { pg: { amountRailway, amountSubmitted, createDate, maturityDate,
//         interest, maturityAmount, name, depositAccountNo, bankBranch } }
// All fields optional — send only what you want to change.
// ─────────────────────────────────────────────────────────────────
export async function updatePgDetails(projectMongoId, pg = {}) {
  const res = await fetch(`${backend_url}/project/v1/financials/pg/${projectMongoId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ pg }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update PG details');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// UPDATE PENALTY DETAILS — matches PATCH /v1/financials/penalty/:projectId
// Body: { penaltyDetails: { amount, ticketNo, ticketDate, delayDays } }
// All fields optional — send only what you want to change. Does NOT
// touch the existing flat financials.penalty / penaltyTicketNo fields.
// ─────────────────────────────────────────────────────────────────
export async function updatePenaltyDetails(projectMongoId, penaltyDetails = {}) {
  const res = await fetch(`${backend_url}/project/v1/financials/penalty/${projectMongoId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ penaltyDetails }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update penalty details');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// UPDATE SECURITY DEPOSIT DETAILS (amount, percentage) — matches
// PATCH /v1/financials/security-deposit/:projectId
// Body: { securityDeposit: { amount, percentage } }
// All fields optional — send only what you want to change. Does NOT
// touch security_deposit.cust — use addSecurityDepositCust for that.
// ─────────────────────────────────────────────────────────────────
export async function updateSecurityDepositDetails(projectMongoId, securityDeposit = {}) {
  const res = await fetch(`${backend_url}/project/v1/financials/security-deposit/${projectMongoId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ securityDeposit }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update security deposit details');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// ADD ONE SECURITY DEPOSIT CUST ENTRY — matches
// POST /v1/financials/security-deposit/:projectId/cust
// Body: { billNo, recoveryPercent, amount } — all required, accepts
// exactly one entry per call. Returns the full updated cust array.
// ─────────────────────────────────────────────────────────────────
export async function addSecurityDepositCust(projectMongoId, { billNo, recoveryPercent, amount }) {
  const res = await fetch(`${backend_url}/project/v1/financials/security-deposit/${projectMongoId}/cust`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ billNo, recoveryPercent, amount }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to add security deposit entry');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// LIST USERS (for pickers, e.g. "next authority" in the forward flow)
// Matches GET /users/list
// Returns: [{ _id, name, cid, profile, tag, role }]
// ─────────────────────────────────────────────────────────────────
export async function getUsersList() {
  const res = await fetch(`${backend_url}/project/users/list`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load users');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// ADD ITEMS (BULK) — matches POST /:projectId/items
// NOTE: this route is NOT under /v1 in what you shared (unlike every
// other route here) — double check that's intentional before using
// this as-is; change the path below to /v1/${projectMongoId}/items
// if it should match the rest.
// Body: { items: [{ itemNo, name, description, unit, railwayRate,
//                    ourRate, marketRate, quantity, installation,
//                    profitLossPercent }, ...] }
// itemNo and name are required per item.
// ─────────────────────────────────────────────────────────────────
export async function addItems(projectMongoId, items) {
  const res = await fetch(`${backend_url}/project/${projectMongoId}/items`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ items }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to add items');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// GET ALL ITEMS FOR A PROJECT — matches GET /:projectId/items
// NOTE: same /v1 caveat as addItems above.
// Populates createdBy (name, email, profile).
// ─────────────────────────────────────────────────────────────────
export async function getProjectItems(projectMongoId) {
  const res = await fetch(`${backend_url}/project/${projectMongoId}/items`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load items');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// UPDATE TIMELINE — matches PATCH /v1/timeline/:projectId
// Body: { startDate, estimatedCompletionDate, endDate } — all optional,
// send only the fields you want to change.
// NOTE: this route doesn't exist in your route file yet — add it
// following the same findById + conditional-field pattern as
// basic-details / location before wiring this in production.
// ─────────────────────────────────────────────────────────────────
export async function updateTimeline(projectMongoId, { startDate, estimatedCompletionDate, endDate } = {}) {
  const res = await fetch(`${backend_url}/project/v1/timeline/${projectMongoId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ startDate, estimatedCompletionDate, endDate }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update timeline');
  }
  return data.data;
}