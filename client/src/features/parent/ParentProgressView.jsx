import { useEffect, useState } from 'react';
import { getStudentProgress } from './api.js';
import { getCurrentUser } from '../../api/auth.js';
import './parent.css';

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
    <div className="parent-progress-view">
      {!linkedStudentId && (
        <form onSubmit={handleManualSubmit} className="parent-student-form">
          <label>
            Student ID
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              placeholder="VL-2024-0042"
            />
          </label>
          <small>
            This account isn't linked to a specific student (it used the old email+password login).
            Log in via Student / Parent Login instead to see your child's progress automatically.
          </small>
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'View Progress'}
          </button>
        </form>
      )}

      {loading && linkedStudentId && <p>Loading...</p>}
      {error && <p className="parent-error">{error}</p>}

      {progress && (
        <div className="parent-progress">
          {progress.studentName && (
            <h3 className="parent-student-name">
              {progress.studentName}
              {progress.grade ? ` · Grade ${progress.grade}` : ''}
            </h3>
          )}

          <section className="parent-section">
            <h4>Assignment Completion</h4>
            <p>
              {progress.assignmentCompletion.completed} of {progress.assignmentCompletion.total} completed
              {progress.assignmentCompletion.pending > 0 ? ` · ${progress.assignmentCompletion.pending} pending` : ''}
            </p>
            {progress.assignmentCompletion.averageGrade !== null && (
              <p>Average grade: {progress.assignmentCompletion.averageGrade}</p>
            )}
          </section>

          <section className="parent-section">
            <h4>Recently Learned Topics</h4>
            {progress.recentTopics.length > 0 ? (
              <ul>
                {progress.recentTopics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : (
              <p>No recent activity yet.</p>
            )}
          </section>

          <section className="parent-section">
            <h4>Areas Needing Support</h4>
            {progress.needsSupport.length > 0 ? (
              <ul>
                {progress.needsSupport.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : (
              <p>No flagged areas right now.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default ParentProgressView;
