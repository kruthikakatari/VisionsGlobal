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
