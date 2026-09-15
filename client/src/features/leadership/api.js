import { apiRequest } from '../../api/client.js';

export function getAnalytics() {
  return apiRequest('/leadership/analytics');
}
