import { backend_url } from '../store/keyStore';
import { useAuthStore } from '../store/authStore';

const authHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─────────────────────────────────────────────────────────────────
// MY EFFECTIVE PERMISSIONS FOR A PROJECT — matches
// GET /v1/:projectId/permissions/me
// Every logged-in user can call this for themselves.
// ─────────────────────────────────────────────────────────────────
export async function getMyProjectPermissions(projectId) {
  const res = await fetch(`${backend_url}/project/v1/${projectId}/permissions/me`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load permissions');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// LIST EVERY PROJECT-SPECIFIC PERMISSION ASSIGNMENT — matches
// GET /v1/:projectId/permissions
// Admin only.
// ─────────────────────────────────────────────────────────────────
export async function getProjectPermissionAssignments(projectId) {
  const res = await fetch(`${backend_url}/project/v1/${projectId}/permissions`, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to load permission assignments');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// ASSIGN / UPDATE A USER'S PROJECT-SPECIFIC PERMISSIONS — matches
// PUT /v1/:projectId/permissions/:userId
// Admin only. Send the FULL 12-section permissions object each time.
// ─────────────────────────────────────────────────────────────────
export async function upsertProjectPermission(projectId, userId, permissions) {
  const res = await fetch(`${backend_url}/project/v1/${projectId}/permissions/${userId}`, {
    method: 'PUT',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ permissions }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to update permissions');
  }
  return data.data;
}

// ─────────────────────────────────────────────────────────────────
// REMOVE A USER'S PROJECT-SPECIFIC ACCESS — matches
// DELETE /v1/:projectId/permissions/:userId
// Admin only. There are no tag-based defaults, so this leaves the user
// with no access to any section until re-granted.
// ─────────────────────────────────────────────────────────────────
export async function removeProjectPermission(projectId, userId) {
  const res = await fetch(`${backend_url}/project/v1/${projectId}/permissions/${userId}`, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to remove permission override');
  }
  return data.data;
}