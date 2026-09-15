import { useState } from 'react';
import { generateAiAssignment } from './aiApi.js';
import { createAssignment } from './api.js';

const initialForm = {
  studentId: '',
  difficulty: 'Medium',
  learningGaps: '',
};

function AiAssistant({ onAssigned }) {
  const [form, setForm] = useState(initialForm);
  const [generating, setGenerating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { aiInput, assignment }
  const [saved, setSaved] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setSaved(false);
    setGenerating(true);
    try {
      const learningGaps = form.learningGaps
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await generateAiAssignment({
        studentId: form.studentId,
        difficulty: form.difficulty,
        learningGaps,
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleAssign() {
    if (!result) return;
    setError('');
    setAssigning(true);
    try {
      const { assignment } = result;
      await createAssignment({
        title: assignment.title,
        subject: assignment.subject,
        topic: assignment.topic,
        difficulty: assignment.difficulty,
        language: assignment.language,
        assignedTo: [form.studentId],
        questions: assignment.questions,
        aiGenerated: true,
      });
      setSaved(true);
      onAssigned?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  }

  return (
    <div className="ai-assistant">
      <h3>AI Educator Assistant</h3>
      <p className="assignment-item-meta">
        Generates a personalized assignment from the student's grade and preferred language (pulled from
        their Student profile), learning gaps, and what they've previously learned (pulled automatically
        from their assignment history).
      </p>

      <form className="ai-assistant-form" onSubmit={handleGenerate}>
        <label>
          Student ID
          <input
            name="studentId"
            value={form.studentId}
            onChange={handleChange}
            required
            placeholder="VL-2024-0042"
          />
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
          Learning Gaps (comma-separated)
          <input
            name="learningGaps"
            value={form.learningGaps}
            onChange={handleChange}
            placeholder="readingComprehension, writtenCommunication"
          />
          <small>Temporary manual entry until the Assessment module's learning-gaps view is wired in.</small>
        </label>

        {error && <p className="assignment-error">{error}</p>}

        <button type="submit" disabled={generating}>
          {generating ? 'Generating...' : 'Generate Assignment'}
        </button>
      </form>

      {result && (
        <div className="ai-result">
          <h4>{result.assignment.title}</h4>
          <p className="assignment-item-meta">
            {result.assignment.subject} · {result.assignment.topic} · {result.assignment.difficulty} ·{' '}
            {result.assignment.language}
          </p>

          <ol className="ai-question-list">
            {result.assignment.questions.map((q, i) => (
              <li key={i}>
                <p>{q.question}</p>
                {q.type === 'MCQ' && q.options?.length > 0 && (
                  <ul className="ai-options">
                    {q.options.map((opt, j) => (
                      <li key={j}>{opt}</li>
                    ))}
                  </ul>
                )}
                <p className="assignment-item-meta">Answer key: {q.answer}</p>
              </li>
            ))}
          </ol>

          <button type="button" onClick={handleAssign} disabled={assigning || saved}>
            {saved ? 'Assigned ✓' : assigning ? 'Assigning...' : 'Assign to Student'}
          </button>
        </div>
      )}
    </div>
  );
}

export default AiAssistant;
