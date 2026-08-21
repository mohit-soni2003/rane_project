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
// Body: { projectName, description } — send only the fields you want
// to change, both are optional on the backend.
// ─────────────────────────────────────────────────────────────────
export async function updateBasicDetails(projectMongoId, { projectName, description } = {}) {
  const res = await fetch(`${backend_url}/project/v1/basic-details/${projectMongoId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ projectName, description }),
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
// zone, subDepartment, circle, division, psuName
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
}// ─────────────────────────────────────────────────────────────────
// UPDATE LOCATION — matches PATCH /v1/location/:projectId
// Body: { location: { state, city, district, pincode, siteAddress } }
// NOTE: this route doesn't exist in your route file yet — add it
// following the same findById + conditional-field pattern as
// basic-details / advance-details before wiring this in production.
// ─────────────────────────────────────────────────────────────────
export async function updateLocation(projectMongoId, location = {}) {
  const res = await fetch(`${backend_url}/project/v1/location/${projectMongoId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ location }),
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