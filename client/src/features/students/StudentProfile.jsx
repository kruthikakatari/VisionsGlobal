import React, { useState } from 'react';
import {
  User, BookOpen, Users, MapPin,
  ChevronDown, ChevronUp, Pencil,
  AlertTriangle, WifiOff,
} from 'lucide-react';

// ─── i18n stub ───────────────────────────────────────────────────────────────
const t = {
  backToList: '← Back to List',
  editProfile: 'Edit Profile',
  offlineBadge: 'Saved locally · will sync when online',

  // Section titles
  personal: 'Personal Information',
  academic: 'Academic Information',
  familyBg: 'Family Background',
  location: 'Location',

  // Family background notice
  familyBgNotice:
    "This section is background context only. It has no effect on a student's academic level, assessment score, or any ranking.",

  // Field labels – Personal
  name: 'Name',
  age: 'Age',
  gender: 'Gender',
  grade: 'Grade',
  language: 'Preferred Language',

  // Field labels – Academic
  school: 'School',
  enrollmentDate: 'Enrollment Date',
  level: 'Current Level',
  status: 'Status',

  // Field labels – Family
  parentGuardian: 'Parent / Guardian',
  household: 'Household Information',
  parentOccupation: 'Parent Occupation',
  incomeRange: 'Family Income Range',
  familyMembers: 'Number of Family Members',
  educationBg: 'Education Background',
  otherSupport: 'Other Support Factors',

  // Field labels – Location
  district: 'District',
  cluster: 'Cluster',
  village: 'Village / Area',

  notProvided: 'Not provided',
};
// ─────────────────────────────────────────────────────────────────────────────

/** Single collapsible section card */
function Section({ id, icon: Icon, title, defaultOpen = true, accent, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${
        accent ? 'border-amber-300' : 'border-gray-100'
      }`}
    >
      {/* Header – full-width tap target */}
      <button
        id={`section-toggle-${id}`}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 gap-3 text-left min-h-[60px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${accent ? 'bg-amber-100' : 'bg-indigo-100'}`}>
            <Icon className={`w-5 h-5 ${accent ? 'text-amber-700' : 'text-indigo-600'}`} />
          </div>
          <span className="text-lg font-semibold text-gray-900">{title}</span>
        </div>
        {open
          ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
          : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
        }
      </button>

      {/* Content */}
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}

/** Labeled field row */
function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-base font-medium text-gray-900">
        {value || <span className="text-gray-400 italic">{t.notProvided}</span>}
      </span>
    </div>
  );
}

/** Format ISO date string to a readable format */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

export default function StudentProfile({ student, onEdit, onBack, isOffline = false }) {
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
        <User className="w-16 h-16 opacity-20" />
        <p className="text-xl font-medium">Student not found.</p>
      </div>
    );
  }

  const { personal, academic, familyBackground, location } = student;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

      {/* ── Offline Banner ── */}
      {isOffline && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-300 px-4 py-3 text-sm text-amber-800">
          <WifiOff className="w-4 h-4 shrink-0" />
          {t.offlineBadge}
        </div>
      )}

      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          id="back-to-list-btn"
          onClick={onBack}
          className="text-sm text-indigo-600 font-medium hover:underline"
        >
          {t.backToList}
        </button>
        <button
          id="edit-profile-btn"
          onClick={() => onEdit?.(student)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold px-5 py-3 rounded-2xl text-sm shadow transition-all min-h-[48px]"
        >
          <Pencil className="w-4 h-4" />
          {t.editProfile}
        </button>
      </div>

      {/* ── Student hero ── */}
      <div className="flex items-center gap-4 bg-indigo-600 text-white rounded-2xl px-5 py-5">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20">
          <User className="w-8 h-8" />
        </div>
        <div>
          <p className="text-2xl font-bold leading-tight">{personal?.name}</p>
          <p className="text-indigo-200 text-sm mt-0.5">
            Grade {personal?.grade} · {academic?.enrollmentStatus ?? 'Active'}
          </p>
        </div>
      </div>

      {/* ── 1. Personal Information ── */}
      <Section id="personal" icon={User} title={t.personal} defaultOpen={true}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label={t.name}     value={personal?.name} />
          <Field label={t.age}      value={personal?.age} />
          <Field label={t.gender}   value={personal?.gender} />
          <Field label={t.grade}    value={personal?.grade} />
          <Field label={t.language} value={personal?.preferredLanguage} />
        </div>
      </Section>

      {/* ── 2. Academic Information ── */}
      <Section id="academic" icon={BookOpen} title={t.academic} defaultOpen={true}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label={t.school}         value={academic?.school} />
          <Field label={t.enrollmentDate} value={fmtDate(academic?.enrollmentDate)} />
          <Field label={t.level}          value={academic?.currentLevel} />
          <Field label={t.status}         value={academic?.enrollmentStatus} />
        </div>
      </Section>

      {/* ── 3. Family Background ─ visually distinct / amber callout ── */}
      <Section id="family" icon={Users} title={t.familyBg} defaultOpen={false} accent>
        {/* Hard visual divider / disclaimer – always visible even when expanded */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-snug">{t.familyBgNotice}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label={t.parentGuardian}  value={familyBackground?.parentGuardianName} />
          <Field label={t.household}       value={familyBackground?.householdInformation} />
          <Field label={t.parentOccupation}value={familyBackground?.parentOccupation} />
          <Field label={t.incomeRange}     value={familyBackground?.familyIncomeRange} />
          <Field label={t.familyMembers}   value={familyBackground?.numberOfFamilyMembers} />
          <Field label={t.educationBg}     value={familyBackground?.educationBackground} />
          <Field label={t.otherSupport}    value={familyBackground?.otherSupportFactors} />
        </div>
      </Section>

      {/* ── 4. Location ── */}
      <Section id="location" icon={MapPin} title={t.location} defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field label={t.district} value={location?.district} />
          <Field label={t.cluster}  value={location?.cluster} />
          <Field label={t.village}  value={location?.villageArea} />
        </div>
      </Section>

    </div>
  );
}
