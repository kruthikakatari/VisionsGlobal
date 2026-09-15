import React, { useState, useEffect } from 'react';
import {
  CalendarDays, Clock, FileText,
  CheckCircle2, Circle, Loader2, WifiOff,
  User, CheckCheck,
} from 'lucide-react';

// ─── i18n stub ───────────────────────────────────────────────────────────────
const t = {
  title: 'Log Session',
  back: '← Back',
  stepDate: 'When was the session?',
  stepDuration: 'How long? (minutes)',
  stepTopic: 'What was the topic?',
  topicPh: 'e.g. Reading, Arithmetic, Phonics',
  stepAttendance: 'Who attended?',
  attendanceHint: 'Tap a student to mark them present',
  present: 'Present',
  absent: 'Absent',
  stepNotes: 'Any notes? (optional)',
  notesPh: 'e.g. Students struggled with subtraction, bring visual aids next time',
  submit: 'Save Session',
  saving: 'Saving…',
  savedOnline: 'Session saved!',
  savedOffline: 'Saved locally · will sync when online',
  selectAll: 'Select All',
  deselectAll: 'Deselect All',
  attending: (n) => `${n} attending`,
  noStudents: 'No students assigned. Contact your coordinator.',
};
// ─────────────────────────────────────────────────────────────────────────────

const DURATION_PRESETS = [30, 45, 60, 90, 120];

// ── Save state machine ────────────────────────────────────────────────────────
const IDLE    = 'idle';
const SAVING  = 'saving';
const SUCCESS = 'success';
const OFFLINE = 'offline';
const SYNC_TIMEOUT_MS = 5000;
// ─────────────────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split('T')[0];
}

export default function SessionLogger({ assignedStudents = [], onSave, onBack }) {
  const [date,     setDate]     = useState(today());
  const [duration, setDuration] = useState(60);
  const [topic,    setTopic]    = useState('');
  const [notes,    setNotes]    = useState('');
  const [attended, setAttended] = useState(new Set());
  const [saveState, setSaveState] = useState(IDLE);

  const isBusy = saveState === SAVING;

  // Toggle a single student
  const toggleStudent = (id) => {
    setAttended((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Select / deselect all
  const allSelected = assignedStudents.length > 0 && attended.size === assignedStudents.length;
  const toggleAll   = () =>
    setAttended(allSelected ? new Set() : new Set(assignedStudents.map((s) => s._id)));

  // Auto-reset banner after a few seconds
  useEffect(() => {
    if (saveState === SUCCESS || saveState === OFFLINE) {
      const id = setTimeout(() => setSaveState(IDLE), 4000);
      return () => clearTimeout(id);
    }
  }, [saveState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveState(SAVING);

    // Offline guard: if the API call takes > SYNC_TIMEOUT_MS, show offline state
    const timeoutId = setTimeout(() => setSaveState(OFFLINE), SYNC_TIMEOUT_MS);

    try {
      await onSave?.({
        date,
        durationMinutes: Number(duration),
        topic,
        studentsAttended: [...attended],
        notes,
      });
      clearTimeout(timeoutId);
      setSaveState(SUCCESS);
    } catch (_) {
      clearTimeout(timeoutId);
      setSaveState(OFFLINE);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button id="session-back-btn" onClick={onBack} className="text-sm text-indigo-600 font-medium hover:underline shrink-0">
          {t.back}
        </button>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <CalendarDays className="w-7 h-7 text-indigo-600" />
        {t.title}
      </h1>

      {/* ── Save-state Banner ── */}
      {saveState === SUCCESS && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-300 px-4 py-3 text-sm text-green-800 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {t.savedOnline}
        </div>
      )}
      {saveState === OFFLINE && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-300 px-4 py-3 text-sm text-amber-800 font-medium">
          <WifiOff className="w-4 h-4 shrink-0" />
          {t.savedOffline}
        </div>
      )}

      <form id="session-logger-form" onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* ── Step 1: Date ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            <p className="text-base font-semibold text-gray-900">{t.stepDate}</p>
          </div>
          <input
            id="session-date"
            type="date"
            value={date}
            max={today()}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[52px]"
          />
        </section>

        {/* ── Step 2: Duration ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <p className="text-base font-semibold text-gray-900">{t.stepDuration}</p>
          </div>
          {/* Tap presets */}
          <div className="flex flex-wrap gap-2">
            {DURATION_PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                id={`duration-${d}`}
                onClick={() => setDuration(d)}
                className={`px-5 py-3 rounded-xl border text-base font-medium transition-all min-h-[52px] min-w-[72px] active:scale-95 ${
                  duration === d
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
          {/* Manual entry */}
          <input
            id="session-duration-manual"
            type="number"
            inputMode="numeric"
            min={1}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[52px]"
          />
        </section>

        {/* ── Step 3: Topic ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <p className="text-base font-semibold text-gray-900">{t.stepTopic}</p>
          </div>
          <input
            id="session-topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t.topicPh}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[52px]"
          />
        </section>

        {/* ── Step 4: Attendance ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-indigo-600" />
              <p className="text-base font-semibold text-gray-900">{t.stepAttendance}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-indigo-700 font-medium bg-indigo-50 px-3 py-1 rounded-full">
                {t.attending(attended.size)}
              </span>
              <button
                type="button"
                id="attendance-toggle-all"
                onClick={toggleAll}
                className="text-sm text-indigo-600 font-medium hover:underline"
              >
                {allSelected ? t.deselectAll : t.selectAll}
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-400">{t.attendanceHint}</p>

          {assignedStudents.length === 0 ? (
            <p className="text-sm text-gray-400 italic py-4 text-center">{t.noStudents}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {assignedStudents.map((student) => {
                const isPresent = attended.has(student._id);
                return (
                  <li key={student._id}>
                    <button
                      type="button"
                      id={`attendance-${student._id}`}
                      onClick={() => toggleStudent(student._id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all active:scale-[.98] min-h-[72px] ${
                        isPresent
                          ? 'bg-green-50 border-green-400'
                          : 'bg-white border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {/* Big check icon */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 border-2 transition-colors ${
                        isPresent ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'
                      }`}>
                        {isPresent
                          ? <CheckCircle2 className="w-6 h-6 text-white" />
                          : <Circle className="w-6 h-6 text-gray-300" />
                        }
                      </div>

                      {/* Student avatar + name */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${isPresent ? 'bg-green-200' : 'bg-indigo-100'}`}>
                          <User className={`w-5 h-5 ${isPresent ? 'text-green-700' : 'text-indigo-600'}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-gray-900 truncate">{student.personal?.name}</p>
                          <p className="text-sm text-gray-400">Grade {student.personal?.grade}</p>
                        </div>
                      </div>

                      {/* Status label */}
                      <span className={`text-sm font-medium shrink-0 ${isPresent ? 'text-green-700' : 'text-gray-400'}`}>
                        {isPresent ? t.present : t.absent}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ── Step 5: Notes (optional) ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <p className="text-base font-semibold text-gray-900">{t.stepNotes}</p>
          </div>
          <textarea
            id="session-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.notesPh}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </section>

        {/* ── Submit ── */}
        <button
          id="save-session-btn"
          type="submit"
          disabled={isBusy}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 active:scale-95 text-white font-bold text-lg px-6 py-4 rounded-2xl shadow-md transition-all min-h-[64px]"
        >
          {isBusy
            ? <><Loader2 className="w-5 h-5 animate-spin" />{t.saving}</>
            : <><CalendarDays className="w-5 h-5" />{t.submit}</>
          }
        </button>

      </form>
    </div>
  );
}
