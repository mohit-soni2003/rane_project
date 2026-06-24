// services/projectService.js
import { backend_url } from '../store/keyStore';
import { useAuthStore } from '../store/authStore';

export async function createProject(payload) {
  const token = useAuthStore.getState().token; // wherever you keep it
  const res = await fetch(`${backend_url}/project/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create project');
  return data.data;
}