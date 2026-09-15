import { get, post } from './apiClient';

/**
 * Fetch list of educators (Leadership role only)
 */
export const getEducators = async () => {
  const res = await get('/educators');
  return res.data?.educators || [];
};

/**
 * Fetch educator profile by ID
 * @param {string} id
 */
export const getEducator = async (id) => {
  const res = await get(`/educators/${id}`);
  return res.data?.educator;
};

/**
 * Log a new session for an educator
 * @param {string} educatorId
 * @param {Object} sessionData - { date, durationMinutes, topic, studentsAttended, notes }
 */
export const createSession = async (educatorId, sessionData) => {
  const res = await post(`/educators/${educatorId}/sessions`, sessionData);
  return res.data?.session;
};

/**
 * Fetch session history for an educator
 * @param {string} educatorId
 */
export const getSessions = async (educatorId) => {
  const res = await get(`/educators/${educatorId}/sessions`);
  return res.data?.sessions || [];
};
