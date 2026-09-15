/**
 * Assessment API Client for Person 2 Module
 * Handles backend communication for assessments, progress, history, recommendations,
 * and Sarvam translation / voice transcription enhancements.
 */

const getHeaders = (isMultipart = false) => {
  const headers = {};

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

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
 * Fetches recommendations for a student
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

/**
 * Translates assessment text using Sarvam backend service
 * POST /api/assessments/translate
 */
export const translateAssessmentTextApi = async ({ text, sourceLanguage = 'English', targetLanguage = 'Tamil' }) => {
  const response = await fetch('/api/assessments/translate', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      text,
      sourceLanguage,
      targetLanguage,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Translation failed (HTTP ${response.status})`);
  }

  return data;
};

/**
 * Transcribes audio blob using Sarvam backend speech-to-text service
 * POST /api/assessments/speech-to-text
 */
export const transcribeAssessmentVoiceApi = async (audioBlob, languageCode = 'Tamil') => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'voice_answer.wav');
  formData.append('languageCode', languageCode);

  const response = await fetch('/api/assessments/speech-to-text', {
    method: 'POST',
    headers: getHeaders(true),
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Speech-to-text transcription failed (HTTP ${response.status})`);
  }

  return data;
};
