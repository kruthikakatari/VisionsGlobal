import { apiRequest } from '../../api/client.js';

export function generateAiAssignment(payload) {
  return apiRequest('/ai/generate-assignment', { method: 'POST', body: payload });
}
