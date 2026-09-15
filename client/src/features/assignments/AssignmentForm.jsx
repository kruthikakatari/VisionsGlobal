import { useState } from 'react';
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
    <form className="assignment-form" onSubmit={handleSubmit}>
      <h3>Create Assignment</h3>

      <label>
        Title
        <input name="title" value={form.title} onChange={handleChange} required />
      </label>

      <label>
        Subject
        <input name="subject" value={form.subject} onChange={handleChange} required />
      </label>

      <label>
        Topic
        <input name="topic" value={form.topic} onChange={handleChange} />
      </label>

      <label>
        Description / Instructions
        <textarea name="description" value={form.description} onChange={handleChange} required rows={4} />
      </label>

      <label>
        Difficulty
        <select name="difficulty" value={form.difficulty} onChange={handleChange}>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </label>

      <label>
        Language
        <input name="language" value={form.language} onChange={handleChange} placeholder="e.g. English" />
      </label>

      <label>
        Due Date
        <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
      </label>

      <label>
        Assign to (Student IDs, comma-separated)
        <input
          name="assignedTo"
          value={form.assignedTo}
          onChange={handleChange}
          required
          placeholder="VL-2024-0042"
        />
        <small>Use the Student ID from the Students page (e.g. VL-2024-0042). Manual entry for now — an inline picker is a nice future improvement.</small>
      </label>

      {error && <p className="assignment-error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Assignment'}
      </button>
    </form>
  );
}

export default AssignmentForm;
