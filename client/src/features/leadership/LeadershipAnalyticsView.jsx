import { useEffect, useState } from 'react';
import { getAnalytics } from './api.js';
import './leadership.css';

function LeadershipAnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p className="leadership-error">{error}</p>;
  if (!data) return null;

  return (
    <div className="leadership-analytics">
      <div className="stat-grid">
        <StatTile label="Total Students" value={data.totalStudents} />
        <StatTile label="Average Performance" value={data.averagePerformance ?? 'N/A'} />
        <StatTile label="Students Improving" value={data.studentsImproving} />
        <StatTile label="Students At Risk" value={data.studentsAtRisk} />
      </div>

      <section className="leadership-section">
        <h4>Common Learning Gaps</h4>
        {data.commonLearningGaps.length > 0 ? (
          <ul>
            {data.commonLearningGaps.map((g) => (
              <li key={g.topic}>
                {g.topic} — {g.studentCount} student{g.studentCount === 1 ? '' : 's'}
              </li>
            ))}
          </ul>
        ) : (
          <p>No common gaps identified yet.</p>
        )}
      </section>

      <section className="leadership-section">
        <h4>Students Requiring Additional Support</h4>
        {data.studentsRequiringSupport.length > 0 ? (
          <ul>
            {data.studentsRequiringSupport.map((s) => (
              <li key={s.studentId}>
                {s.studentId} — average grade {s.averageGrade}
              </li>
            ))}
          </ul>
        ) : (
          <p>No students currently flagged.</p>
        )}
      </section>
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="stat-tile">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default LeadershipAnalyticsView;
