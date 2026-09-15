import { get, post, put } from './apiClient';

/**
 * Fetch list of students with optional cluster and district filters
 * @param {Object} [filters] - { cluster, district }
 */
export const getStudents = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.cluster && filters.cluster !== 'All Clusters') {
    params.append('cluster', filters.cluster);
  }
  if (filters.district && filters.district !== 'All Districts') {
    params.append('district', filters.district);
  }
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await get(`/students${queryString}`);
  return res.data?.students || [];
};

/**
 * Fetch single student details by ID
 * @param {string} id
 */
export const getStudentById = async (id) => {
  const res = await get(`/students/${id}`);
  return res.data?.student;
};

/**
 * Create a new student record
 * Returns { student, credentials } where credentials contains
 * { studentId, studentPassword, parentPassword } for the educator to share.
 * @param {Object} studentData
 */
export const createStudent = async (studentData) => {
  const res = await post('/students', studentData);
  // res.data has { student, credentials }
  return res.data || {};
};

/**
 * Update an existing student record
 * @param {string} id
 * @param {Object} updateData
 */
export const updateStudent = async (id, updateData) => {
  const res = await put(`/students/${id}`, updateData);
  return res.data?.student;
};
