import { useEffect, useState } from 'react';
import { getAssignmentById, createSubmission, updateSubmission } from './api.js';
import { getCurrentUser } from '../../api/client.js';

function AssignmentDetail({ assignmentId, onChanged }) {
  const user = getCurrentUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    setError('');
    getAssignmentById(assignmentId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (assignmentId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  if (!assignmentId) return <p className="assignment-detail-empty">Select an assignment to see details.</p>;
  if (loading) return <p>Loading assignment...</p>;
  if (error) return <p className="assignment-error">{error}</p>;
  if (!data) return null;

  const { assignment, submissions, mySubmission } = data;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createSubmission({ assignmentId, responseText });
      setResponseText('');
      load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReview(submissionId, status, grade, feedback) {
    try {
      await updateSubmission(submissionId, { status, grade, feedback });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="assignment-detail">
      <h3>{assignment.title}</h3>
      <p className="assignment-item-meta">
        {assignment.subject}
        {assignment.topic ? ` · ${assignment.topic}` : ''}
        {assignment.difficulty ? ` · ${assignment.difficulty}` : ''}
      </p>
      <p>{assignment.description}</p>

      {user?.role === 'student' && (
        <div className="submission-section">
          {mySubmission ? (
            <div className="submission-status">
              <p>
                Status: <strong>{mySubmission.status}</strong>
                {mySubmission.grade !== undefined && mySubmission.grade !== null
                  ? ` · Grade: ${mySubmission.grade}`
                  : ''}
              </p>
              {mySubmission.feedback && <p>Feedback: {mySubmission.feedback}</p>}
              <p className="assignment-item-meta">Your answer: {mySubmission.responseText}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="submission-form">
              <label>
                Your Answer
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  required
                  rows={4}
                />
              </label>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </form>
          )}
        </div>
      )}

      {user?.role === 'educator' && (
        <div className="submissions-review">
          <h4>Submissions ({submissions?.length || 0})</h4>
          {(!submissions || submissions.length === 0) && <p>No submissions yet.</p>}
          <ul className="submission-list">
            {submissions?.map((s) => (
              <SubmissionRow key={s._id} submission={s} onReview={handleReview} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SubmissionRow({ submission, onReview }) {
  const [grade, setGrade] = useState(submission.grade ?? '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');

  return (
    <li className="submission-row">
      <p>
        Student: {submission.student} · Status: <strong>{submission.status}</strong>
      </p>
      <p className="assignment-item-meta">{submission.responseText}</p>
      <div className="review-controls">
        <input
          type="number"
          min="0"
          max="100"
          placeholder="Grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />
        <input
          type="text"
          placeholder="Feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <button
          type="button"
          onClick={() => onReview(submission._id, 'Reviewed', grade === '' ? undefined : Number(grade), feedback)}
        >
          Save Review
        </button>
      </div>
    </li>
  );
}

export default AssignmentDetail;
