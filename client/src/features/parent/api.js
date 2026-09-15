import { apiRequest } from '../../api/client.js';

export function getStudentProgress(studentId) {
  return apiRequest(`/parent/student-progress?studentId=${encodeURIComponent(studentId)}`);
}
