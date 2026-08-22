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
// CREATE TASK — matches POST /task/create
// Body: { projectId, relatedDocuments, vertical, title, description,
//         priority, allottedTo, startDate, deadline }
// relatedDocuments and allottedTo are arrays of Mongo _ids
// (documents from the project, and users, respectively).
// Returns the created task including its Mongo _id, which is
// required for every subsequent task route below.
// ─────────────────────────────────────────────────────────────────
export async function createTask({
  projectId,
  relatedDocuments,
  vertical,
  title,
  description,
  priority,
  allottedTo,
  startDate,
  deadline,
}) {
  const res = await fetch(`${backend_url}/task/create`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({
      projectId,
      relatedDocuments,
      vertical,
      title,
      description,
      priority,
      allottedTo,
      startDate,
      deadline,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to create task');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// ADD USER TO TASK — matches PATCH /task/add-user/:id/:userId
// taskMongoId is the task's Mongo _id, userId is the user being
// allotted. No request body — both ids are in the URL.
// ─────────────────────────────────────────────────────────────────
export async function addUserToTask(taskMongoId, userId) {
  const res = await fetch(`${backend_url}/task/add-user/${taskMongoId}/${userId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to add user to task');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// REMOVE USER FROM TASK — matches DELETE /task/remove-user/:id/:userId
// Backend rejects this if it's the only user left on the task.
// ─────────────────────────────────────────────────────────────────
export async function removeUserFromTask(taskMongoId, userId) {
  const res = await fetch(`${backend_url}/task/remove-user/${taskMongoId}/${userId}`, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to remove user from task');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// ADD DOCUMENT TO TASK — matches PATCH /task/add-document/:id/:documentId
// documentId must already exist on the task's parent project
// (project.documents[]._id) — the backend validates this.
// ─────────────────────────────────────────────────────────────────
export async function addDocumentToTask(taskMongoId, documentId) {
  const res = await fetch(`${backend_url}/task/add-document/${taskMongoId}/${documentId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to add document to task');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// REMOVE DOCUMENT FROM TASK — matches DELETE /task/remove-document/:id/:documentId
// ─────────────────────────────────────────────────────────────────
export async function removeDocumentFromTask(taskMongoId, documentId) {
  const res = await fetch(`${backend_url}/task/remove-document/${taskMongoId}/${documentId}`, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to remove document from task');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// UPDATE ALLOTTED USER'S OWN STATUS & REMARK — matches
// PATCH /task/update-status/:id/:userId
// Body: { status, remark } — send only what you want to change,
// both are optional on the backend.
// status must be one of: pending, in_progress, submitted,
// completed, rejected
// ─────────────────────────────────────────────────────────────────
export async function updateTaskStatus(taskMongoId, userId, { status, remark } = {}) {
  const res = await fetch(`${backend_url}/task/update-status/${taskMongoId}/${userId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status, remark }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update task status');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// ADD IMAGE(S) TO ALLOTTED USER'S SUBMISSION — matches
// PATCH /task/add-image/:id/:userId
// Body: { images: [{ name, url }, ...] } — required, non-empty.
// Appends to the user's existing images, doesn't overwrite them.
// ─────────────────────────────────────────────────────────────────
export async function addTaskImages(taskMongoId, userId, images) {
  const res = await fetch(`${backend_url}/task/add-image/${taskMongoId}/${userId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ images }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to add image(s) to task');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// VERIFY / UPDATE OVERALL TASK STATUS — matches PATCH /task/verify/:id
// Body: { status, remark } — status is required, must be one of:
// pending, in_progress, submitted, completed, overdue, rejected
// If status is "completed", the backend auto-stamps completedAt,
// verifiedBy (the caller), and verifiedAt.
// ─────────────────────────────────────────────────────────────────
export async function verifyTask(taskMongoId, { status, remark }) {
  const res = await fetch(`${backend_url}/task/verify/${taskMongoId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status, remark }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to verify task');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// GET ALL TASKS FOR A PROJECT — matches GET /task/project/:projectId
// projectId here is the project's Mongo _id.
// Populates allottedTo.user, allottedBy, verifiedBy (name, email).
// ─────────────────────────────────────────────────────────────────
export async function getTasksByProject(projectMongoId) {
  const res = await fetch(`${backend_url}/task/project/${projectMongoId}`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load tasks for project');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// GET ALL TASKS ALLOTTED TO A USER — matches GET /task/user/:userId
// Returns every task where this user appears in allottedTo[],
// sorted by nearest deadline first.
// Populates allottedTo.user, allottedBy, verifiedBy, and project
// (projectId, projectName).
// ─────────────────────────────────────────────────────────────────
export async function getTasksByUser(userId) {
  const res = await fetch(`${backend_url}/task/user/${userId}`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load tasks for user');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// GET SINGLE TASK — matches GET /task/:id
// Populates allottedTo.user, allottedBy, verifiedBy,
// statusHistory.updatedBy, and project (projectId, projectName).
// ─────────────────────────────────────────────────────────────────
export async function getTaskById(taskMongoId) {
  const res = await fetch(`${backend_url}/task/${taskMongoId}`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load task');
  }
  return data.data;
}