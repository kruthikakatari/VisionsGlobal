import { useEffect, useState } from 'react';
import { getAssignmentById, createSubmission, updateSubmission } from './api.js';
import { getCurrentUser } from '../../api/client.js';

function AssignmentDetail({ assignmentId, onChanged }) {
  const user = getCurrentUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const hasQuestions = Array.isArray(assignment.questions) && assignment.questions.length > 0;

  async function handleSubmit(payload) {
    setSubmitting(true);
    setError('');
    try {
      await createSubmission({ assignmentId, ...payload });
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
        {assignment.aiGenerated ? ' · AI-generated' : ''}
      </p>
      {!hasQuestions && <p>{assignment.description}</p>}

      {user?.role === 'student' && (
        <div className="submission-section">
          {mySubmission ? (
            <SubmissionSummary submission={mySubmission} />
          ) : hasQuestions ? (
            <QuestionSubmitForm
              questions={assignment.questions}
              submitting={submitting}
              onSubmit={(answers) => handleSubmit({ answers })}
            />
          ) : (
            <TextSubmitForm submitting={submitting} onSubmit={(responseText) => handleSubmit({ responseText })} />
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

function TextSubmitForm({ submitting, onSubmit }) {
  const [responseText, setResponseText] = useState('');

  return (
    <form
      className="submission-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(responseText);
      }}
    >
      <label>
        Your Answer
        <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} required rows={4} />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Assignment'}
      </button>
    </form>
  );
}

function QuestionSubmitForm({ questions, submitting, onSubmit }) {
  const [answers, setAnswers] = useState(() => questions.map((q) => ({ question: q.question, answer: '' })));

  function setAnswer(index, value) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? { ...a, answer: value } : a)));
  }

  return (
    <form
      className="submission-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(answers);
      }}
    >
      {questions.map((q, i) => (
        <div key={i} className="question-block">
          <p className="question-text">
            {i + 1}. {q.question}
          </p>
          {q.type === 'MCQ' && q.options?.length > 0 ? (
            <div className="mcq-options">
              {q.options.map((opt, j) => (
                <label key={j} className="mcq-option">
                  <input
                    type="radio"
                    name={`q-${i}`}
                    value={opt}
                    checked={answers[i].answer === opt}
                    onChange={(e) => setAnswer(i, e.target.value)}
                    required
                  />
                  {opt}
                </label>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={answers[i].answer}
              onChange={(e) => setAnswer(i, e.target.value)}
              required
            />
          )}
        </div>
      ))}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Assignment'}
      </button>
    </form>
  );
}

function SubmissionSummary({ submission }) {
  return (
    <div className="submission-status">
      <p>
        Status: <strong>{submission.status}</strong>
        {submission.grade !== undefined && submission.grade !== null ? ` · Grade: ${submission.grade}` : ''}
      </p>
      {submission.feedback && <p>Feedback: {submission.feedback}</p>}
      {submission.answers?.length > 0 ? (
        <ol className="answer-list">
          {submission.answers.map((a, i) => (
            <li key={i}>
              <span>{a.question}</span> — <strong>{a.answer}</strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className="assignment-item-meta">Your answer: {submission.responseText}</p>
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
      {submission.answers?.length > 0 ? (
        <ol className="answer-list">
          {submission.answers.map((a, i) => (
            <li key={i}>
              <span>{a.question}</span> — <strong>{a.answer}</strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className="assignment-item-meta">{submission.responseText}</p>
      )}
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
