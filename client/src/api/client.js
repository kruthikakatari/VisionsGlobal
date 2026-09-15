// Small shared fetch wrapper used by every feature. Not owned by any one
// member's feature — safe for anyone on the team to import.
//
// Uses the 'vl_token' localStorage key to match Member 1's real apiClient.js
// (feature/student-educator-core) so a login from either code path is seen
// by both — no separate reconciliation needed once branches merge.
const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('vl_token');
}

export function saveToken(token) {
  localStorage.setItem('vl_token', token);
}

export function clearToken() {
  localStorage.removeItem('vl_token');
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

// Returns { id, role } so the UI can decide what to show (e.g. only educators
// see "create assignment"). No server round-trip — purely for UI branching,
// the backend still enforces access on every request.
//
// Prefers the 'vl_user' object Member 1's real login stores (matches their
// getCurrentUser() in client/src/api/auth.js), falling back to decoding the
// JWT payload directly — which is what the student login below relies on,
// since there's no full user record to stash for a student.
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('vl_user');
    if (raw) {
      const user = JSON.parse(raw);
      return { id: user.id || user._id, role: user.role };
    }
  } catch {
    // fall through to JWT decode
  }

  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}
