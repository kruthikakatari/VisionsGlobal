import React from 'react';
import {
  User, Mail, MapPin, Users,
  CalendarDays, ClipboardList, ChevronRight,
} from 'lucide-react';

// ─── i18n stub ───────────────────────────────────────────────────────────────
const t = {
  profile: 'Educator Profile',
  name: 'Name',
  email: 'Email',
  role: 'Role',
  assignedClusters: 'Assigned Clusters',
  noClusters: 'No clusters assigned',
  quickActions: 'Quick Actions',
  viewStudents: 'Assigned Students',
  viewStudentsDesc: 'View and manage your student list',
  logSession: 'Log Session',
  logSessionDesc: 'Record today\'s attendance and session notes',
  viewSessions: 'Session History',
  viewSessionsDesc: 'Browse past sessions and records',
  memberSince: 'Member since',
  notProvided: 'Not provided',
};
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_LABEL = {
  educator:   'Educator',
  leadership: 'Leadership',
  parent:     'Parent',
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-gray-50 last:border-0">
      <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-base font-medium text-gray-900">{value || <span className="text-gray-400 italic">{t.notProvided}</span>}</p>
      </div>
    </div>
  );
}

function ActionCard({ id, icon: Icon, title, description, onClick, highlight }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all active:scale-[.98] min-h-[72px]
        ${highlight
          ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
          : 'bg-white border-gray-100 text-gray-900 hover:border-indigo-300 hover:shadow-sm'
        }`}
    >
      <div className={`p-2 rounded-xl shrink-0 ${highlight ? 'bg-white/20' : 'bg-indigo-100'}`}>
        <Icon className={`w-6 h-6 ${highlight ? 'text-white' : 'text-indigo-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-base font-semibold ${highlight ? 'text-white' : 'text-gray-900'}`}>{title}</p>
        <p className={`text-sm mt-0.5 truncate ${highlight ? 'text-indigo-200' : 'text-gray-500'}`}>{description}</p>
      </div>
      <ChevronRight className={`w-5 h-5 shrink-0 ${highlight ? 'text-indigo-200' : 'text-gray-400'}`} />
    </button>
  );
}

export default function EducatorProfile({
  educator,
  onViewStudents,
  onLogSession,
  onViewSessions,
}) {
  if (!educator) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
        <User className="w-16 h-16 opacity-20" />
        <p className="text-xl font-medium">Educator not found.</p>
      </div>
    );
  }

  const { user, assignedClusters = [], assignedStudents = [], createdAt } = educator;

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

      {/* ── Hero ── */}
      <div className="flex items-center gap-4 bg-indigo-600 text-white rounded-2xl px-5 py-5">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 shrink-0">
          <User className="w-8 h-8" />
        </div>
        <div>
          <p className="text-2xl font-bold leading-tight">{user?.name}</p>
          <p className="text-indigo-200 text-sm mt-0.5">
            {ROLE_LABEL[user?.role] ?? user?.role}
            {memberSince && ` · ${t.memberSince} ${memberSince}`}
          </p>
        </div>
      </div>

      {/* ── Profile details card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-2">
        <p className="text-xs text-gray-400 uppercase tracking-widest py-3 border-b border-gray-50">
          {t.profile}
        </p>
        <InfoRow icon={User}   label={t.name}  value={user?.name} />
        <InfoRow icon={Mail}   label={t.email} value={user?.email} />

        {/* Assigned Clusters */}
        <div className="flex items-start gap-4 py-3">
          <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
            <MapPin className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t.assignedClusters}</p>
            {assignedClusters.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {assignedClusters.map((c) => (
                  <span key={c} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-gray-400 italic text-sm">{t.noClusters}</span>
            )}
          </div>
        </div>

        {/* Student count */}
        <div className="flex items-center gap-4 py-3 border-t border-gray-50">
          <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Students</p>
            <p className="text-base font-medium text-gray-900">{assignedStudents.length} assigned</p>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">{t.quickActions}</p>
        <div className="flex flex-col gap-3">
          <ActionCard
            id="action-log-session"
            icon={CalendarDays}
            title={t.logSession}
            description={t.logSessionDesc}
            onClick={onLogSession}
            highlight
          />
          <ActionCard
            id="action-view-students"
            icon={Users}
            title={t.viewStudents}
            description={t.viewStudentsDesc}
            onClick={onViewStudents}
          />
          <ActionCard
            id="action-view-sessions"
            icon={ClipboardList}
            title={t.viewSessions}
            description={t.viewSessionsDesc}
            onClick={onViewSessions}
          />
        </div>
      </div>

    </div>
  );
}
