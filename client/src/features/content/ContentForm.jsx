import { useState } from 'react';
import { BookPlus, AlertCircle } from 'lucide-react';
import { createContent } from './api.js';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const initialForm = {
  subject: '',
  topic: '',
  grade: '',
  language: '',
  difficulty: 'Easy',
  content: '',
};

const inputClass =
  'w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[48px]';
const labelClass = 'flex flex-col gap-1.5 text-sm font-semibold text-gray-700';

function ContentForm({ onCreated }) {
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
      const created = await createContent(form);
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
        <BookPlus className="w-5 h-5 text-indigo-600" />
        Add Learning Content
      </h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className={labelClass}>
          Subject
          <input name="subject" value={form.subject} onChange={handleChange} required className={inputClass} />
        </label>

        <label className={labelClass}>
          Topic
          <input name="topic" value={form.topic} onChange={handleChange} required className={inputClass} />
        </label>

        <label className={labelClass}>
          Grade
          <input
            name="grade"
            value={form.grade}
            onChange={handleChange}
            required
            placeholder="e.g. 5"
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Language
          <input
            name="language"
            value={form.language}
            onChange={handleChange}
            required
            placeholder="e.g. English"
            className={inputClass}
          />
        </label>

        <label className={`${labelClass} sm:col-span-2`}>
          Difficulty
          <select name="difficulty" value={form.difficulty} onChange={handleChange} className={inputClass}>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={labelClass}>
        Content / Material
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          required
          rows={5}
          className={`${inputClass} min-h-0`}
        />
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
        {submitting ? 'Saving...' : 'Add Content'}
      </button>
    </form>
  );
}

export default ContentForm;
