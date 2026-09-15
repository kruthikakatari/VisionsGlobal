/**
 * apiClient.js
 * Base HTTP client. All API modules use this instead of raw fetch.
 *
 * - Reads JWT from localStorage and injects it automatically.
 * - Throws a structured ApiError on non-2xx responses so callers
 *   can catch { message } without parsing the response themselves.
 * - Vite proxies /api → http://localhost:5001 (see vite.config.js).
 */

const BASE_URL = '/api';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getToken() {
  return localStorage.getItem('vl_token'); // namespaced key to avoid clashes
}

/**
 * Core request helper.
 * @param {string} path   - e.g. '/students' or '/students/123'
 * @param {object} options - fetch options (method, body, etc.)
 */
async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Parse JSON regardless of status so we can read the error message
  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new ApiError(
      data.message || `Request failed with status ${response.status}`,
      response.status
    );
  }

  return data;
}

// ── Convenience wrappers ──────────────────────────────────────────────────────
export const get    = (path, opts = {})         => request(path, { method: 'GET',    ...opts });
export const post   = (path, body, opts = {})   => request(path, { method: 'POST',   body: JSON.stringify(body), ...opts });
export const put    = (path, body, opts = {})   => request(path, { method: 'PUT',    body: JSON.stringify(body), ...opts });
export const del    = (path, opts = {})         => request(path, { method: 'DELETE', ...opts });

// ── Token helpers (used by authApi after login/register) ─────────────────────
export const saveToken   = (token) => localStorage.setItem('vl_token', token);
export const clearToken  = ()      => localStorage.removeItem('vl_token');
export const hasToken    = ()      => !!getToken();
