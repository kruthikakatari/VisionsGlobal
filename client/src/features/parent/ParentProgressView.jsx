import { useEffect, useState } from 'react';
import {
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  Award,
  BookMarked,
  HeartHandshake,
  ThumbsUp,
} from 'lucide-react';
import { getStudentProgress } from './api.js';
import { getCurrentUser } from '../../api/auth.js';

const inputClass =
  'w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[48px]';

function ParentProgressView() {
  const user = getCurrentUser();
  const linkedStudentId = user?.studentProfile || null;

  const [studentId, setStudentId] = useState('');
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load(id) {
    setError('');
    setLoading(true);
    try {
      const data = await getStudentProgress(id);
      setProgress(data);
    } catch (err) {
      setError(err.message);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }

  // A parent who logged in via the real Parent tab (studentId + parent
  // password) is linked to exactly one student — load it automatically,
  // no manual entry needed.
  useEffect(() => {
    if (linkedStudentId) load(linkedStudentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedStudentId]);

  function handleManualSubmit(e) {
    e.preventDefault();
    load(studentId);
  }

  return (
    <div className="flex flex-col gap-5">
      {!linkedStudentId && (
        <form
          onSubmit={handleManualSubmit}
          className="flex flex-col gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
            Student ID
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              placeholder="VL-2024-0042"
              className={inputClass}
            />
          </label>
          <p className="text-xs text-gray-400">
            This account isn't linked to a specific student (it used the old email+password login). Log in via
            Student / Parent Login instead to see your child's progress automatically.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="self-start flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-2xl text-base shadow transition-all min-h-[48px]"
          >
            {loading ? 'Loading...' : 'View Progress'}
          </button>
        </form>
      )}

      {loading && linkedStudentId && <p className="text-sm text-gray-400 px-1">Loading...</p>}

      {error && (
        <p className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}

      {progress && (
        <div className="flex flex-col gap-5">
          {progress.studentName && (
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 shrink-0">
                <User className="w-6 h-6 text-indigo-600" />
              </span>
              <div>
                <p className="text-lg font-bold text-gray-900">{progress.studentName}</p>
                {progress.grade && <p className="text-sm text-gray-500">Grade {progress.grade}</p>}
              </div>
            </div>
          )}

          <CompletionCard completion={progress.assignmentCompletion} />

          <section className="flex flex-col gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <BookMarked className="w-4 h-4 text-indigo-600" />
              Recently Learned Topics
            </h2>
            {progress.recentTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {progress.recentTopics.map((t) => (
                  <span
                    key={t}
                    className="text-sm font-medium px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No recent activity yet.</p>
            )}
          </section>

          <section
            className={`flex flex-col gap-3 rounded-2xl border shadow-sm p-5 ${
              progress.needsSupport.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'
            }`}
          >
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <HeartHandshake className={`w-4 h-4 ${progress.needsSupport.length > 0 ? 'text-amber-600' : 'text-indigo-600'}`} />
              Areas Needing Support
            </h2>
            {progress.needsSupport.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {progress.needsSupport.map((t) => (
                  <span
                    key={t}
                    className="text-sm font-medium px-3 py-1.5 rounded-full bg-amber-100 text-amber-800"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-gray-500">
                <ThumbsUp className="w-4 h-4 text-green-500" />
                No flagged areas right now.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function CompletionCard({ completion }) {
  const { total, completed, pending, averageGrade } = completion;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="flex flex-col gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
        Assignment Completion
      </h2>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {completed} of {total} completed
          </span>
          <span className="font-semibold text-gray-900">{pct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
          <div>
            <p className="text-lg font-bold text-gray-900 leading-none">{pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
          <Award className="w-4 h-4 text-gray-400 shrink-0" />
          <div>
            <p className="text-lg font-bold text-gray-900 leading-none">{averageGrade ?? '—'}</p>
            <p className="text-xs text-gray-500">Avg. grade</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ParentProgressView;
