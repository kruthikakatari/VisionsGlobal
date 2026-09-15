import React, { useState } from 'react';
import { User, MapPin, ChevronRight, PlusCircle, Search, Filter } from 'lucide-react';

// ─── i18n stub – swap this object for a translation file later ───────────────
const t = {
  title: 'Students',
  addStudent: 'Add Student',
  search: 'Search by name…',
  filterDistrict: 'All Districts',
  filterCluster: 'All Clusters',
  grade: 'Grade',
  noStudents: 'No students found.',
  noStudentsHint: 'Add a new student to get started.',
  offlineBadge: 'Saved locally · will sync when online',
};
// ─────────────────────────────────────────────────────────────────────────────

const DISTRICTS = ['All Districts', 'Madurai', 'Dindigul', 'Theni', 'Virudhunagar'];
const CLUSTERS  = ['All Clusters', 'North', 'South', 'East', 'West'];

const STATUS_COLORS = {
  Active:    'bg-green-100 text-green-800',
  Inactive:  'bg-yellow-100 text-yellow-800',
  Graduated: 'bg-blue-100 text-blue-800',
};

export default function StudentList({ students = [], onSelectStudent, onAddStudent, isOffline = false }) {
  const [search,   setSearch]   = useState('');
  const [district, setDistrict] = useState('All Districts');
  const [cluster,  setCluster]  = useState('All Clusters');

  const filtered = students.filter((s) => {
    const name    = s.personal?.name?.toLowerCase() ?? '';
    const matchSearch   = name.includes(search.toLowerCase());
    const matchDistrict = district === 'All Districts' || s.location?.district === district;
    const matchCluster  = cluster  === 'All Clusters'  || s.location?.cluster  === cluster;
    return matchSearch && matchDistrict && matchCluster;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

      {/* ── Offline Banner ── */}
      {isOffline && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-300 px-4 py-3 text-sm text-amber-800">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          {t.offlineBadge}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <button
          id="add-student-btn"
          onClick={onAddStudent}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold px-5 py-3 rounded-2xl text-base shadow transition-all min-h-[52px]"
        >
          <PlusCircle className="w-5 h-5" />
          {t.addStudent}
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            id="student-search"
            type="text"
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[52px]"
          />
        </div>

        {/* District select */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            id="filter-district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="appearance-none pl-10 pr-8 py-3 rounded-2xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[52px] cursor-pointer"
          >
            {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        {/* Cluster select */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            id="filter-cluster"
            value={cluster}
            onChange={(e) => setCluster(e.target.value)}
            className="appearance-none pl-10 pr-8 py-3 rounded-2xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[52px] cursor-pointer"
          >
            {CLUSTERS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* ── Student Cards ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-400 gap-3">
          <User className="w-14 h-14 opacity-30" />
          <p className="text-xl font-medium">{t.noStudents}</p>
          <p className="text-sm">{t.noStudentsHint}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((student) => (
            <li key={student._id}>
              <button
                id={`student-card-${student._id}`}
                onClick={() => onSelectStudent(student)}
                className="w-full flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 hover:border-indigo-300 hover:shadow-md active:scale-[.98] transition-all text-left min-h-[72px]"
              >
                {/* Avatar */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 shrink-0">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-gray-900 truncate">
                    {student.personal?.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      {t.grade} {student.personal?.grade}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {student.location?.villageArea}
                    </span>
                    {student.academic?.enrollmentStatus && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[student.academic.enrollmentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                        {student.academic.enrollmentStatus}
                      </span>
                    )}
                  </div>
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
