// Small shared fetch wrapper used by every feature. Not owned by any one
// member's feature — safe for anyone on the team to import.
const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Request failed with status ${res.status}`);
  }

  return data;
}

// Reads { id, role } out of the JWT payload so the UI can decide what to show
// (e.g. only educators see "create assignment"). No server round-trip needed —
// this is purely for UI branching, the backend still enforces access on every request.
export function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}
