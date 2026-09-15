/**
 * Assessment API Client for Person 2 Module
 * Handles all backend communication for assessments, progress, history, and recommendations.
 */

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('token') || localStorage.getItem('jwt')
      : null;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Creates a new assessment for a student
 * POST /api/assessments
 */
export const createAssessmentApi = async (assessmentData) => {
  const response = await fetch('/api/assessments', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(assessmentData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to submit assessment (HTTP ${response.status})`);
  }

  return data;
};

/**
 * Fetches the current progress record for a student
 * GET /api/students/:id/progress
 */
export const getStudentProgressApi = async (studentId) => {
  const response = await fetch(`/api/students/${encodeURIComponent(studentId)}/progress`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch student progress (HTTP ${response.status})`);
  }

  return data;
};

/**
 * Fetches assessment history for a student
 * GET /api/students/:id/assessments
 */
export const getStudentAssessmentsApi = async (studentId) => {
  const response = await fetch(`/api/students/${encodeURIComponent(studentId)}/assessments`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch assessment history (HTTP ${response.status})`);
  }

  return data;
};

/**
 * Fetches recommendations for a student (gracefully handles 404 if not yet enabled)
 * GET /api/students/:id/recommendations
 */
export const getStudentRecommendationsApi = async (studentId) => {
  try {
    const response = await fetch(`/api/students/${encodeURIComponent(studentId)}/recommendations`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (response.status === 404) {
      return { status: 'not_available', data: null };
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { status: 'not_available', data: null };
    }

    return { status: 'success', data: data.data || data };
  } catch {
    return { status: 'not_available', data: null };
  }
};
