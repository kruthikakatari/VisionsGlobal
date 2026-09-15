import { apiRequest } from '../../api/client.js';

/**
 * Student login — studentId (e.g. VL-2024-0042) + password
 */
export function studentLogin(studentId, password) {
  return apiRequest('/auth/student-login', { method: 'POST', body: { studentId, password } });
}

/**
 * Parent login — same studentId as their child + parent password set by educator
 */
export function parentLogin(studentId, password) {
  return apiRequest('/auth/parent-login', { method: 'POST', body: { studentId, password } });
}
