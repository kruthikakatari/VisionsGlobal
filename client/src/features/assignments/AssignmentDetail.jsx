import { useEffect, useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Award,
  MessageSquare,
} from 'lucide-react';
import { getAssignmentById, createSubmission, updateSubmission } from './api.js';
import { getCurrentUser } from '../../api/auth.js';

const DIFFICULTY_COLORS = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Hard: 'bg-red-100 text-red-800',
};

const inputClass =
  'w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[48px]';

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

  if (!assignmentId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2 bg-white rounded-2xl border border-dashed border-gray-200">
        <ClipboardList className="w-10 h-10 opacity-30" />
        <p className="text-base font-medium">Select an assignment to see details.</p>
      </div>
    );
  }

  if (loading) return <p className="text-sm text-gray-400 px-1">Loading assignment...</p>;
  if (error) {
    return (
      <p className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {error}
      </p>
    );
  }
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
    <div className="flex flex-col gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold text-gray-900">{assignment.title}</h3>
          {assignment.difficulty && (
            <span
              className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                DIFFICULTY_COLORS[assignment.difficulty] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {assignment.difficulty}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
          <span>{assignment.subject}</span>
          {assignment.topic && (
            <>
              <span className="text-gray-300">·</span>
              <span>{assignment.topic}</span>
            </>
          )}
          {assignment.aiGenerated && (
            <span className="flex items-center gap-1 text-indigo-600 font-medium">
              <Sparkles className="w-3 h-3" /> AI-generated
            </span>
          )}
        </div>
        {!hasQuestions && <p className="text-sm text-gray-600">{assignment.description}</p>}
      </div>

      {user?.role === 'student' && (
        <div className="pt-2 border-t border-gray-100">
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
        <div className="pt-2 border-t border-gray-100 flex flex-col gap-3">
          <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            Submissions ({submissions?.length || 0})
          </h4>
          {(!submissions || submissions.length === 0) && (
            <p className="text-sm text-gray-400">No submissions yet.</p>
          )}
          <ul className="flex flex-col gap-3">
            {submissions?.map((s) => (
              <SubmissionRow key={s._id} submission={s} onReview={handleReview} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const isReviewed = status === 'Reviewed';
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
        isReviewed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
      }`}
    >
      {isReviewed ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {status}
    </span>
  );
}

function TextSubmitForm({ submitting, onSubmit }) {
  const [responseText, setResponseText] = useState('');

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(responseText);
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
        Your Answer
        <textarea
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          required
          rows={4}
          className={`${inputClass} min-h-0`}
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="self-start flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-2xl text-base shadow transition-all min-h-[48px]"
      >
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
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(answers);
      }}
    >
      {questions.map((q, i) => (
        <div key={i} className="flex flex-col gap-2 bg-gray-50 rounded-2xl p-4">
          <p className="font-semibold text-gray-900">
            {i + 1}. {q.question}
          </p>
          {q.type === 'MCQ' && q.options?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {q.options.map((opt, j) => (
                <label
                  key={j}
                  className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2.5 cursor-pointer has-[:checked]:border-indigo-400 has-[:checked]:bg-indigo-50"
                >
                  <input
                    type="radio"
                    name={`q-${i}`}
                    value={opt}
                    checked={answers[i].answer === opt}
                    onChange={(e) => setAnswer(i, e.target.value)}
                    required
                    className="accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={answers[i].answer}
              onChange={(e) => setAnswer(i, e.target.value)}
              required
              className={inputClass}
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={submitting}
        className="self-start flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-2xl text-base shadow transition-all min-h-[48px]"
      >
        {submitting ? 'Submitting...' : 'Submit Assignment'}
      </button>
    </form>
  );
}

function SubmissionSummary({ submission }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={submission.status} />
        {submission.grade !== undefined && submission.grade !== null && (
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
            <Award className="w-3 h-3" />
            Grade: {submission.grade}
          </span>
        )}
      </div>

      {submission.feedback && (
        <p className="text-sm text-gray-700 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
          <span className="font-semibold">Feedback:</span> {submission.feedback}
        </p>
      )}

      {submission.answers?.length > 0 ? (
        <ol className="flex flex-col gap-2">
          {submission.answers.map((a, i) => (
            <li key={i} className="bg-gray-50 rounded-xl px-3 py-2 text-sm">
              <p className="text-gray-500">{a.question}</p>
              <p className="font-semibold text-gray-900">{a.answer}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">Your answer: {submission.responseText}</p>
      )}
    </div>
  );
}

function SubmissionRow({ submission, onReview }) {
  const [grade, setGrade] = useState(submission.grade ?? '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');

  return (
    <li className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm font-semibold text-gray-900">Student: {submission.student}</span>
        <StatusBadge status={submission.status} />
      </div>

      {submission.answers?.length > 0 ? (
        <ol className="flex flex-col gap-1.5">
          {submission.answers.map((a, i) => (
            <li key={i} className="bg-white rounded-xl px-3 py-2 text-sm border border-gray-100">
              <p className="text-gray-500">{a.question}</p>
              <p className="font-semibold text-gray-900">{a.answer}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-gray-600 bg-white rounded-xl px-3 py-2 border border-gray-100">
          {submission.responseText}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <input
          type="number"
          min="0"
          max="100"
          placeholder="Grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-24 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          placeholder="Feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="button"
          onClick={() => onReview(submission._id, 'Reviewed', grade === '' ? undefined : Number(grade), feedback)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow transition-all"
        >
          Save Review
        </button>
      </div>
    </li>
  );
}

export default AssignmentDetail;
