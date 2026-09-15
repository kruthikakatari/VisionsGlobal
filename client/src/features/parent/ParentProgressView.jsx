import { useState } from 'react';
import { getStudentProgress } from './api.js';
import './parent.css';

function ParentProgressView() {
  const [studentId, setStudentId] = useState('');
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLoad(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await getStudentProgress(studentId);
      setProgress(data);
    } catch (err) {
      setError(err.message);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="parent-progress-view">
      <form onSubmit={handleLoad} className="parent-student-form">
        <label>
          Student ID
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            placeholder="650000000000000000000002"
          />
        </label>
        <small>Temporary manual entry until Member 1's parent-child linking is available.</small>
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'View Progress'}
        </button>
      </form>

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
