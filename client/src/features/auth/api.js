import { apiRequest } from '../../api/client.js';

export function studentLogin(studentId) {
  return apiRequest('/auth/student-login', { method: 'POST', body: { studentId } });
}
