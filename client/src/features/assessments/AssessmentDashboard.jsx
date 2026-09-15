import { useState } from 'react';
import { AssessmentForm } from './components/AssessmentForm.jsx';
import { AssessmentResult } from './components/AssessmentResult.jsx';
import { RecommendationsList } from './components/RecommendationsList.jsx';
import { AssessmentHistory } from './components/AssessmentHistory.jsx';
import { TranslationAssistant } from './components/TranslationAssistant.jsx';
import { VoiceAnswerRecorder } from './components/VoiceAnswerRecorder.jsx';
import {
  createAssessmentApi,
  getStudentProgressApi,
  getStudentAssessmentsApi,
  getStudentRecommendationsApi,
} from './api/assessmentApi.js';
import './assessments.css';

export const AssessmentDashboard = () => {
  const [activeStudentId, setActiveStudentId] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Tamil');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showAccessibilityTools, setShowAccessibilityTools] = useState(false);

  const [submittedAssessment, setSubmittedAssessment] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [recsAvailable, setRecsAvailable] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState(null);
  const [apiError, setApiError] = useState('');

  const handleSubmitAssessment = async (payload) => {
    setIsSubmitting(true);
    setApiError('');
    setActiveStudentId(payload.studentId);
    if (payload.language) setSelectedLanguage(payload.language);

    try {
      // 1. Submit Assessment
      const res = await createAssessmentApi(payload);
      const newAssessment = res?.data?.assessment;
      setSubmittedAssessment(newAssessment);

      // 2. Fetch Progress (latest learning gaps)
      setIsLoadingProgress(true);
      try {
        const progressRes = await getStudentProgressApi(payload.studentId);
        setStudentProgress(progressRes?.data?.progress || null);
      } catch (pErr) {
        console.warn('Could not fetch progress:', pErr.message);
      } finally {
        setIsLoadingProgress(false);
      }

      // 3. Fetch Recommendations (live backend endpoint)
      setIsLoadingRecs(true);
      try {
        const recsRes = await getStudentRecommendationsApi(payload.studentId);
        if (recsRes.status === 'success' && recsRes.data) {
          setRecommendations(recsRes.data.recommendations || []);
          setRecsAvailable(true);
        } else {
          setRecommendations(null);
          setRecsAvailable(false);
        }
      } catch {
        setRecommendations(null);
        setRecsAvailable(false);
      } finally {
        setIsLoadingRecs(false);
      }

      // 4. Update History if already loaded
      if (assessmentHistory !== null) {
        fetchHistory(payload.studentId);
      }
    } catch (err) {
      setApiError(err.message || 'An error occurred while submitting the assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchHistory = async (studentIdToFetch) => {
    const targetId = studentIdToFetch || activeStudentId;
    if (!targetId) return;

    setIsLoadingHistory(true);
    try {
      const historyRes = await getStudentAssessmentsApi(targetId);
      setAssessmentHistory(historyRes?.data?.assessments || []);
    } catch (err) {
      setApiError(err.message || 'Could not load assessment history.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <div className="assessment-container">
      <header className="assessment-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2>🎯 Assessment & Personalized Learning</h2>
            <p>
              Evaluate student competencies, track real-time progress, detect learning gaps, and receive intervention recommendations.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowAccessibilityTools(!showAccessibilityTools)}
          >
            {showAccessibilityTools ? 'Hide Accessibility Tools' : '🌐 Sarvam AI Language & Voice Tools'}
          </button>
        </div>
      </header>

      {apiError && (
        <div className="alert alert-error">
          <span>❌</span>
          <span>{apiError}</span>
        </div>
      )}

      {showAccessibilityTools && (
        <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.15rem' }}>
            ✨ Sarvam AI Local-Language & Voice Accessibility Enhancements
          </h3>
          <div className="assessment-grid">
            <TranslationAssistant targetLanguage={selectedLanguage} />
            <VoiceAnswerRecorder language={selectedLanguage} />
          </div>
        </div>
      )}

      <div className="assessment-grid">
        <div>
          <AssessmentForm
            onSubmit={handleSubmitAssessment}
            isLoading={isSubmitting}
          />
        </div>

        <div>
          {submittedAssessment ? (
            <>
              <AssessmentResult
                assessment={submittedAssessment}
                progress={studentProgress}
                isLoadingProgress={isLoadingProgress}
              />
              <RecommendationsList
                recommendations={recommendations}
                isAvailable={recsAvailable}
                isLoading={isLoadingRecs}
              />
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <span style={{ fontSize: '2.5rem' }}>📋</span>
              <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#334155' }}>No Assessment Selected</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                Fill out the assessment form on the left and click <strong>Submit Assessment</strong> to view real-time score analytics, learning gaps, and recommendations.
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <AssessmentHistory
          assessments={assessmentHistory}
          onFetchHistory={() => fetchHistory(activeStudentId)}
          isLoading={isLoadingHistory}
          studentId={activeStudentId}
        />
      </div>
    </div>
  );
};

export default AssessmentDashboard;
