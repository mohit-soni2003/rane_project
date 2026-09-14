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
// ASK THE ADMIN DB CHATBOT — matches POST /admin/chat
// Pass reset: true to start a fresh conversation (server clears the
// per-admin history buffer).
// ─────────────────────────────────────────────────────────────────
export async function askAdminChat(message, { reset = false } = {}) {
  const res = await fetch(`${backend_url}/admin/chat`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ message, reset }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to get a response from the chatbot');
  }
  return data.data; // { answer, toolCallLog }
}