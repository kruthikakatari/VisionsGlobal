import { useEffect, useState } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Gauge,
  AlertCircle,
  Target,
  HeartHandshake,
  MapPin,
  ThumbsUp,
} from 'lucide-react';
import { getAnalytics } from './api.js';

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

  if (loading) return <p className="text-sm text-gray-400 px-1">Loading analytics...</p>;
  if (error) {
    return (
      <p className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {error}
      </p>
    );
  }
  if (!data) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <StatTile icon={Users} label="Total Students" value={data.totalStudents} />
        <StatTile icon={Gauge} label="Average Performance" value={data.averagePerformance ?? 'N/A'} />
        <StatTile icon={TrendingUp} label="Students Improving" value={data.studentsImproving} accent="text-green-600" />
        <StatTile icon={TrendingDown} label="Students At Risk" value={data.studentsAtRisk} accent="text-red-600" />
      </div>

      {data.byRegion?.length > 0 && (
        <section className="flex flex-col gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <MapPin className="w-4 h-4 text-indigo-600" />
            By Region
          </h2>
          <ul className="flex flex-col gap-2">
            {data.byRegion.map((r) => (
              <li
                key={r.district}
                className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{r.district}</p>
                  <p className="text-xs text-gray-500">
                    {r.totalStudents} student{r.totalStudents === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{r.averagePerformance ?? '—'}</p>
                    <p className="text-[11px] text-gray-400">avg. score</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      r.studentsAtRisk > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {r.studentsAtRisk} at risk
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <Target className="w-4 h-4 text-indigo-600" />
          Common Learning Gaps
        </h2>
        {data.commonLearningGaps.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.commonLearningGaps.map((g) => (
              <span
                key={g.topic}
                className="text-sm font-medium px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700"
              >
                {g.topic} · {g.studentCount} student{g.studentCount === 1 ? '' : 's'}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No common gaps identified yet.</p>
        )}
      </section>

      <section
        className={`flex flex-col gap-3 rounded-2xl border shadow-sm p-5 ${
          data.studentsRequiringSupport.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'
        }`}
      >
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <HeartHandshake
            className={`w-4 h-4 ${data.studentsRequiringSupport.length > 0 ? 'text-amber-600' : 'text-indigo-600'}`}
          />
          Students Requiring Additional Support
        </h2>
        {data.studentsRequiringSupport.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {data.studentsRequiringSupport.map((s) => (
              <li
                key={s.studentId}
                className="flex items-center justify-between bg-white rounded-xl px-3 py-2 text-sm border border-amber-100"
              >
                <span className="font-medium text-gray-900">{s.studentName || s.studentId}</span>
                <span className="text-amber-700 font-semibold">Avg {s.averageGrade}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <ThumbsUp className="w-4 h-4 text-green-500" />
            No students currently flagged.
          </p>
        )}
      </section>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, accent = 'text-indigo-600' }) {
  return (
    <div className="flex flex-col gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <Icon className={`w-4 h-4 ${accent}`} />
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

export default LeadershipAnalyticsView;
