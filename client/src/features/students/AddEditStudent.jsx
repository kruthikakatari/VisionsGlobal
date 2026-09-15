import React, { useState, useEffect } from 'react';
import {
  User, BookOpen, Users, MapPin,
  ChevronDown, ChevronUp, Save,
  CheckCircle2, Loader2, WifiOff, AlertTriangle, Copy,
} from 'lucide-react';
import '../../features/auth/auth.css';

// ─── i18n stub ───────────────────────────────────────────────────────────────
const t = {
  addTitle: 'Add Student',
  editTitle: 'Edit Student',
  save: 'Save',
  saving: 'Saving…',
  savedOnline: 'Saved successfully!',
  savedOffline: 'Saved locally · will sync when online',
  cancel: 'Cancel',

  // Sections
  personal: 'Personal Information',
  academic: 'Academic Information',
  familyBg: 'Family Background',
  location: 'Location',
  familyBgNotice:
    "This information is background context only and has no effect on a student's academic level, assessment score, or any ranking.",

  // Personal fields
  name: 'Full Name',
  namePh: 'Enter full name',
  age: 'Age',
  agePh: 'Enter age',
  gender: 'Gender',
  grade: 'Grade',
  language: 'Preferred Language',

  // Academic fields
  school: 'School Name',
  schoolPh: 'Enter school name',
  enrollmentDate: 'Enrollment Date',
  level: 'Current Level',
  status: 'Enrollment Status',

  // Family fields
  parentGuardian: 'Parent / Guardian Name',
  parentGuardianPh: 'Enter name',
  household: 'Household Information',
  householdPh: 'e.g. Joint family, single parent',
  parentOccupation: 'Parent Occupation',
  parentOccupationPh: 'e.g. Farmer, Daily wage worker',
  incomeRange: 'Family Income Range',
  familyMembers: 'Number of Family Members',
  educationBg: 'Education Background',
  educationBgPh: 'e.g. First generation learner',
  otherSupport: 'Other Support Factors',
  otherSupportPh: 'e.g. Requires transport, meals',

  // Location fields
  district: 'District',
  cluster: 'Cluster',
  village: 'Village / Area',
  villagePh: 'Enter village or area name',

  required: 'Required',
};
// ─────────────────────────────────────────────────────────────────────────────

// ── Tap-over-type option sets ─────────────────────────────────────────────────
const GENDER_OPTIONS   = ['Male', 'Female', 'Other', 'Prefer not to say'];
const GRADE_OPTIONS    = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'];
const LANGUAGE_OPTIONS = ['Tamil', 'English', 'Telugu', 'Kannada', 'Hindi'];
const LEVEL_OPTIONS    = ['Beginner', 'Elementary', 'Intermediate', 'Advanced'];
const STATUS_OPTIONS   = ['Active', 'Inactive', 'Graduated'];
const INCOME_OPTIONS   = ['Below ₹10,000', '₹10,000–₹25,000', '₹25,000–₹50,000', 'Above ₹50,000'];
const DISTRICT_OPTIONS = ['Madurai', 'Dindigul', 'Theni', 'Virudhunagar', 'Sivaganga'];
const CLUSTER_OPTIONS  = ['North', 'South', 'East', 'West', 'Central'];
// ─────────────────────────────────────────────────────────────────────────────

// Shallow merge helper for nested state groups
const mergeGroup = (prev, group, key, val) => ({
  ...prev,
  [group]: { ...prev[group], [key]: val },
});

/** Collapsible section wrapper */
function Section({ id, icon: Icon, title, defaultOpen = true, accent, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${accent ? 'border-amber-300' : 'border-gray-100'}`}>
      <button
        type="button"
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
        {open ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">{children}</div>}
    </div>
  );
}

/** Text input */
function TextInput({ id, label, value, onChange, placeholder, required, fullWidth }) {
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[52px]"
      />
    </div>
  );
}

/** Number input */
function NumberInput({ id, label, value, onChange, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[52px]"
      />
    </div>
  );
}

/** Tap-to-select dropdown (native select = large touch target on Android) */
function SelectInput({ id, label, value, onChange, options, required, fullWidth }) {
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[52px] cursor-pointer appearance-none"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

/** Date input */
function DateInput({ id, label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      <input
        id={id}
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[52px]"
      />
    </div>
  );
}

// ─── Save states ──────────────────────────────────────────────────────────────
const SAVE_IDLE    = 'idle';
const SAVE_SAVING  = 'saving';
const SAVE_SUCCESS = 'success';
const SAVE_OFFLINE = 'offline';  // request timed out – saved locally
// ─────────────────────────────────────────────────────────────────────────────

const SYNC_TIMEOUT_MS = 5000; // after 5 s without a response, show "saved locally"

const EMPTY_FORM = {
  personal:       { name: '', age: '', gender: '', grade: '', preferredLanguage: 'Tamil' },
  academic:       { school: '', enrollmentDate: '', currentLevel: '', enrollmentStatus: 'Active' },
  familyBackground: {
    parentGuardianName: '', householdInformation: '', parentOccupation: '',
    familyIncomeRange: '', numberOfFamilyMembers: '', educationBackground: '', otherSupportFactors: '',
  },
  location:       { district: '', cluster: '', villageArea: '' },
  parentPassword: '', // set by educator; used for parent portal login
};

export default function AddEditStudent({ student = null, onSave, onCancel }) {
  const isEdit = !!student;

  // Seed form with existing data when editing
  const [form, setForm] = useState(() =>
    isEdit
      ? {
          personal:         { ...EMPTY_FORM.personal,         ...student.personal },
          academic:         { ...EMPTY_FORM.academic,         ...student.academic },
          familyBackground: { ...EMPTY_FORM.familyBackground, ...student.familyBackground },
          location:         { ...EMPTY_FORM.location,         ...student.location },
          parentPassword:   '',
        }
      : EMPTY_FORM
  );

  const [saveState, setSaveState]     = useState(SAVE_IDLE);
  // Credential card shown after a successful student registration
  const [credentials, setCredentials] = useState(null);

  // Helper to update a nested field
  const set = (group, key) => (val) => setForm((prev) => mergeGroup(prev, group, key, val));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveState(SAVE_SAVING);

    // Timeout guard – if the request takes too long, mark as "saved offline"
    const timeoutId = setTimeout(() => setSaveState(SAVE_OFFLINE), SYNC_TIMEOUT_MS);

    try {
      const result = await onSave?.(form);
      clearTimeout(timeoutId);
      setSaveState(SAVE_SUCCESS);
      // Show credential card if the server returned credentials (new student only)
      if (result?.credentials) {
        setCredentials(result.credentials);
      }
    } catch (_) {
      clearTimeout(timeoutId);
      // Network error – treat as offline save
      setSaveState(SAVE_OFFLINE);
    }
  };

  // Reset to idle if user keeps editing after a save
  useEffect(() => {
    if (saveState === SAVE_SUCCESS || saveState === SAVE_OFFLINE) {
      const id = setTimeout(() => setSaveState(SAVE_IDLE), 4000);
      return () => clearTimeout(id);
    }
  }, [saveState]);

  const isBusy = saveState === SAVE_SAVING;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? t.editTitle : t.addTitle}
        </h1>
        <button
          type="button"
          id="cancel-btn"
          onClick={onCancel}
          className="text-sm text-gray-500 hover:underline"
        >
          {t.cancel}
        </button>
      </div>

      {/* ── Save-state Banner ── */}
      {saveState === SAVE_SUCCESS && !credentials && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-300 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {t.savedOnline}
        </div>
      )}
      {saveState === SAVE_OFFLINE && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-300 px-4 py-3 text-sm text-amber-800">
          <WifiOff className="w-4 h-4 shrink-0" />
          {t.savedOffline}
        </div>
      )}

      {/* ── Credential Card ── shown after successful new student registration */}
      {credentials && (
        <div className="credential-card">
          <p className="credential-card__title"><CheckCircle2 className="w-5 h-5" /> Student Registered Successfully!</p>
          <p className="credential-card__subtitle">Share these credentials with the student and parent. Save them now — passwords are not shown again.</p>

          {[['Student ID', credentials.studentId], ['Student Password', credentials.studentPassword], credentials.parentPassword && ['Parent Password', credentials.parentPassword]].filter(Boolean).map(([key, val]) => (
            <div key={key} className="credential-card__row">
              <span className="credential-card__key">{key}</span>
              <span className="credential-card__val">{val}</span>
              <button
                type="button"
                className="credential-card__copy"
                onClick={() => navigator.clipboard.writeText(val)}
              >Copy</button>
            </div>
          ))}

          <p className="credential-card__warn">⚠️ This is the only time these credentials are shown in plain text. Store them safely before navigating away.</p>
          <button
            type="button"
            id="done-credentials-btn"
            onClick={onCancel}
            className="w-full mt-3 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition cursor-pointer"
          >
            Done &amp; Return to List
          </button>
        </div>
      )}

      <form id="add-edit-student-form" onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* ── 1. Personal Information ── */}
        <Section id="personal" icon={User} title={t.personal} defaultOpen={true}>
          <TextInput   id="f-name"     label={t.name}     value={form.personal.name}              onChange={set('personal','name')}              placeholder={t.namePh} required fullWidth />
          <NumberInput id="f-age"      label={t.age}      value={form.personal.age}               onChange={set('personal','age')}               required />
          <SelectInput id="f-gender"   label={t.gender}   value={form.personal.gender}            onChange={set('personal','gender')}            options={GENDER_OPTIONS}   required />
          <SelectInput id="f-grade"    label={t.grade}    value={form.personal.grade}             onChange={set('personal','grade')}             options={GRADE_OPTIONS}    required />
          <SelectInput id="f-language" label={t.language} value={form.personal.preferredLanguage} onChange={set('personal','preferredLanguage')} options={LANGUAGE_OPTIONS} />
        </Section>

        {/* ── 2. Academic Information ── */}
        <Section id="academic" icon={BookOpen} title={t.academic} defaultOpen={true}>
          <TextInput   id="f-school"   label={t.school}         value={form.academic.school}           onChange={set('academic','school')}           placeholder={t.schoolPh} required fullWidth />
          <DateInput   id="f-enroll"   label={t.enrollmentDate} value={form.academic.enrollmentDate}   onChange={set('academic','enrollmentDate')} />
          <SelectInput id="f-level"    label={t.level}          value={form.academic.currentLevel}     onChange={set('academic','currentLevel')}     options={LEVEL_OPTIONS}  required />
          <SelectInput id="f-status"   label={t.status}         value={form.academic.enrollmentStatus} onChange={set('academic','enrollmentStatus')} options={STATUS_OPTIONS} />
        </Section>

        {/* ── 3. Family Background ─ amber callout ── */}
        <Section id="family" icon={Users} title={t.familyBg} defaultOpen={false} accent>
          {/* Always-visible disclaimer inside the section */}
          <div className="sm:col-span-2 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-snug">{t.familyBgNotice}</p>
          </div>

          <TextInput   id="f-parent"      label={t.parentGuardian}  value={form.familyBackground.parentGuardianName}   onChange={set('familyBackground','parentGuardianName')}   placeholder={t.parentGuardianPh} required fullWidth />
          <TextInput   id="f-household"   label={t.household}       value={form.familyBackground.householdInformation} onChange={set('familyBackground','householdInformation')} placeholder={t.householdPh} />
          <TextInput   id="f-occupation"  label={t.parentOccupation}value={form.familyBackground.parentOccupation}     onChange={set('familyBackground','parentOccupation')}     placeholder={t.parentOccupationPh} />
          <SelectInput id="f-income"      label={t.incomeRange}     value={form.familyBackground.familyIncomeRange}    onChange={set('familyBackground','familyIncomeRange')}    options={INCOME_OPTIONS} />
          <NumberInput id="f-members"     label={t.familyMembers}   value={form.familyBackground.numberOfFamilyMembers}onChange={set('familyBackground','numberOfFamilyMembers')} />
          <TextInput   id="f-education"   label={t.educationBg}     value={form.familyBackground.educationBackground}  onChange={set('familyBackground','educationBackground')}  placeholder={t.educationBgPh} />
          <TextInput   id="f-support"     label={t.otherSupport}    value={form.familyBackground.otherSupportFactors}  onChange={set('familyBackground','otherSupportFactors')}  placeholder={t.otherSupportPh} fullWidth />

          {/* Parent portal password — educator sets this so the parent can log in */}
          {!isEdit && (
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label htmlFor="f-parent-pw" className="text-sm font-medium text-gray-700">
                Parent Portal Password <span className="text-red-500">*</span>
              </label>
              <input
                id="f-parent-pw"
                type="text"
                value={form.parentPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, parentPassword: e.target.value }))}
                placeholder="e.g. Kumar@2024"
                required={!isEdit}
                className="w-full px-4 py-3 rounded-xl border border-amber-300 bg-amber-50 text-base focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[52px]"
              />
              <span className="text-xs text-amber-700">Share this with the parent so they can log in to the Parent Portal.</span>
            </div>
          )}
        </Section>

        {/* ── 4. Location ── */}
        <Section id="location" icon={MapPin} title={t.location} defaultOpen={true}>
          <SelectInput id="f-district" label={t.district} value={form.location.district}   onChange={set('location','district')}   options={DISTRICT_OPTIONS} required />
          <SelectInput id="f-cluster"  label={t.cluster}  value={form.location.cluster}    onChange={set('location','cluster')}    options={CLUSTER_OPTIONS}  required />
          <TextInput   id="f-village"  label={t.village}  value={form.location.villageArea} onChange={set('location','villageArea')} placeholder={t.villagePh} required fullWidth />
        </Section>

        {/* ── Submit ── */}
        <button
          id="submit-student-btn"
          type="submit"
          disabled={isBusy}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 active:scale-95 text-white font-bold text-lg px-6 py-4 rounded-2xl shadow transition-all min-h-[60px] mt-2"
        >
          {isBusy
            ? <><Loader2 className="w-5 h-5 animate-spin" />{t.saving}</>
            : <><Save className="w-5 h-5" />{t.save}</>
          }
        </button>
      </form>
    </div>
  );
}
