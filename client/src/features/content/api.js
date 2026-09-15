import { apiRequest } from '../../api/client.js';

export function getContent(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/content${params ? `?${params}` : ''}`);
}

export function createContent(payload) {
  return apiRequest('/content', { method: 'POST', body: payload });
}
