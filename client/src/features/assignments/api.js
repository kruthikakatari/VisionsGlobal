import { apiRequest } from '../../api/client.js';

export function getAssignments() {
  return apiRequest('/assignments');
}

export function getAssignmentById(id) {
  return apiRequest(`/assignments/${id}`);
}

export function createAssignment(payload) {
  return apiRequest('/assignments', { method: 'POST', body: payload });
}

export function createSubmission(payload) {
  return apiRequest('/submissions', { method: 'POST', body: payload });
}

export function updateSubmission(id, payload) {
  return apiRequest(`/submissions/${id}`, { method: 'PATCH', body: payload });
}
