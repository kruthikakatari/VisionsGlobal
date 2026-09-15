import { useState } from 'react';
import { ClipboardPlus, AlertCircle } from 'lucide-react';
import { createAssignment } from './api.js';

const initialForm = {
  title: '',
  subject: '',
  topic: '',
  description: '',
  difficulty: 'Easy',
  language: '',
  dueDate: '',
  assignedTo: '',
};

const inputClass =
  'w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[48px]';
const labelClass = 'flex flex-col gap-1.5 text-sm font-semibold text-gray-700';

function AssignmentForm({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const assignedTo = form.assignedTo
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const created = await createAssignment({
        ...form,
        assignedTo,
        dueDate: form.dueDate || undefined,
      });
      setForm(initialForm);
      onCreated?.(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
    >
      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
        <ClipboardPlus className="w-5 h-5 text-indigo-600" />
        Create Assignment
      </h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className={labelClass}>
          Title
          <input name="title" value={form.title} onChange={handleChange} required className={inputClass} />
        </label>

        <label className={labelClass}>
          Subject
          <input name="subject" value={form.subject} onChange={handleChange} required className={inputClass} />
        </label>

        <label className={labelClass}>
          Topic
          <input name="topic" value={form.topic} onChange={handleChange} className={inputClass} />
        </label>

        <label className={labelClass}>
          Difficulty
          <select name="difficulty" value={form.difficulty} onChange={handleChange} className={inputClass}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </label>

        <label className={labelClass}>
          Language
          <input
            name="language"
            value={form.language}
            onChange={handleChange}
            placeholder="e.g. English"
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Due Date
          <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={inputClass} />
        </label>
      </div>

      <label className={labelClass}>
        Description / Instructions
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          className={`${inputClass} min-h-0`}
        />
      </label>

      <label className={labelClass}>
        Assign to (Student IDs, comma-separated)
        <input
          name="assignedTo"
          value={form.assignedTo}
          onChange={handleChange}
          required
          placeholder="VL-2024-0042"
          className={inputClass}
        />
        <span className="text-xs font-normal text-gray-400">
          Use the Student ID from the Students page (e.g. VL-2024-0042).
        </span>
      </label>

      {error && (
        <p className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="self-start flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-2xl text-base shadow transition-all min-h-[48px]"
      >
        {submitting ? 'Creating...' : 'Create Assignment'}
      </button>
    </form>
  );
}

export default AssignmentForm;
