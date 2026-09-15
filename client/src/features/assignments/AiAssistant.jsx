import { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { generateAiAssignment } from './aiApi.js';
import { createAssignment } from './api.js';

const initialForm = {
  studentId: '',
  difficulty: 'Medium',
  learningGaps: '',
};

const inputClass =
  'w-full px-4 py-3 rounded-2xl border border-indigo-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[48px]';
const labelClass = 'flex flex-col gap-1.5 text-sm font-semibold text-gray-700';

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
    <div className="flex flex-col gap-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Educator Assistant
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Generates a personalized assignment from the student's grade and preferred language (pulled from their
          Student profile), learning gaps, and what they've previously learned.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className={labelClass}>
            Student ID
            <input
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              required
              placeholder="VL-2024-0042"
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            Difficulty
            <select name="difficulty" value={form.difficulty} onChange={handleChange} className={inputClass}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </label>
        </div>

        <label className={labelClass}>
          Learning Gaps (comma-separated)
          <input
            name="learningGaps"
            value={form.learningGaps}
            onChange={handleChange}
            placeholder="readingComprehension, writtenCommunication"
            className={inputClass}
          />
          <span className="text-xs font-normal text-gray-400">
            Temporary manual entry until the Assessment module's learning-gaps view is wired in.
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
          disabled={generating}
          className="self-start flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-2xl text-base shadow transition-all min-h-[48px]"
        >
          <Sparkles className="w-4 h-4" />
          {generating ? 'Generating...' : 'Generate Assignment'}
        </button>
      </form>

      {result && (
        <div className="flex flex-col gap-3 bg-white rounded-2xl border border-indigo-100 p-5">
          <div>
            <h4 className="text-lg font-bold text-gray-900">{result.assignment.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {result.assignment.subject} · {result.assignment.topic} · {result.assignment.difficulty} ·{' '}
              {result.assignment.language}
            </p>
          </div>

          <ol className="flex flex-col gap-3">
            {result.assignment.questions.map((q, i) => (
              <li key={i} className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-medium text-gray-900">
                  {i + 1}. {q.question}
                </p>
                {q.type === 'MCQ' && q.options?.length > 0 && (
                  <ul className="mt-1.5 flex flex-col gap-0.5 text-sm text-gray-500 pl-4 list-disc">
                    {q.options.map((opt, j) => (
                      <li key={j}>{opt}</li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-gray-400 mt-1.5">Answer key: {q.answer}</p>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={handleAssign}
            disabled={assigning || saved}
            className="self-start flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-2xl text-base shadow transition-all min-h-[48px]"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Assigned
              </>
            ) : assigning ? (
              'Assigning...'
            ) : (
              'Assign to Student'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default AiAssistant;
