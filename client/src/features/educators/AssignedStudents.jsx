import React from 'react';
import { User, MapPin, ChevronRight, Users } from 'lucide-react';

// ─── i18n stub ───────────────────────────────────────────────────────────────
const t = {
  title: 'Assigned Students',
  back: '← Back',
  count: (n) => `${n} student${n !== 1 ? 's' : ''}`,
  grade: 'Grade',
  noStudents: 'No students assigned yet.',
  noStudentsHint: 'Students will appear here once your educator profile is set up.',
};
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  Active:    'bg-green-100 text-green-800',
  Inactive:  'bg-yellow-100 text-yellow-800',
  Graduated: 'bg-blue-100 text-blue-800',
};

export default function AssignedStudents({ students = [], onSelectStudent, onBack }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          id="back-btn"
          onClick={onBack}
          className="text-sm text-indigo-600 font-medium hover:underline shrink-0"
        >
          {t.back}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t.count(students.length)}</p>
        </div>
        <div className="p-3 bg-indigo-100 rounded-2xl">
          <Users className="w-6 h-6 text-indigo-600" />
        </div>
      </div>

      {/* ── List ── */}
      {students.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-400 gap-3">
          <Users className="w-14 h-14 opacity-20" />
          <p className="text-xl font-medium text-center">{t.noStudents}</p>
          <p className="text-sm text-center px-6">{t.noStudentsHint}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {students.map((student) => (
            <li key={student._id}>
              <button
                id={`assigned-student-${student._id}`}
                onClick={() => onSelectStudent?.(student)}
                className="w-full flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 hover:border-indigo-300 hover:shadow-md active:scale-[.98] transition-all text-left min-h-[76px]"
              >
                {/* Avatar */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 shrink-0">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-gray-900 truncate">
                    {student.personal?.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      {t.grade} {student.personal?.grade}
                    </span>
                    {student.location?.villageArea && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {student.location.villageArea}
                        </span>
                      </>
                    )}
                    {student.academic?.enrollmentStatus && (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          STATUS_COLORS[student.academic.enrollmentStatus] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {student.academic.enrollmentStatus}
                      </span>
                    )}
                  </div>
                  {student.academic?.currentLevel && (
                    <p className="text-xs text-gray-400 mt-1">
                      Level: {student.academic.currentLevel}
                    </p>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
