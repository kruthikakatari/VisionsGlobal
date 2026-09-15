import { useState } from 'react';
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
    <form className="content-form" onSubmit={handleSubmit}>
      <h3>Add Learning Content</h3>

      <label>
        Subject
        <input name="subject" value={form.subject} onChange={handleChange} required />
      </label>

      <label>
        Topic
        <input name="topic" value={form.topic} onChange={handleChange} required />
      </label>

      <label>
        Grade
        <input name="grade" value={form.grade} onChange={handleChange} required placeholder="e.g. 5" />
      </label>

      <label>
        Language
        <input name="language" value={form.language} onChange={handleChange} required placeholder="e.g. English" />
      </label>

      <label>
        Difficulty
        <select name="difficulty" value={form.difficulty} onChange={handleChange}>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <label>
        Content / Material
        <textarea name="content" value={form.content} onChange={handleChange} required rows={5} />
      </label>

      {error && <p className="content-error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Add Content'}
      </button>
    </form>
  );
}

export default ContentForm;
