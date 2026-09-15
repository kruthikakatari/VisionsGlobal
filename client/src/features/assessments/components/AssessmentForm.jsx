import { useState } from 'react';

const SUPPORTED_LANGUAGES = [
  'Tamil',
  'English',
  'Hindi',
  'Telugu',
  'Kannada',
  'Malayalam',
];

export const AssessmentForm = ({ onSubmit, isLoading }) => {
  const [studentId, setStudentId] = useState('');
  const [language, setLanguage] = useState('Tamil');
  const [verbalFluency, setVerbalFluency] = useState('');
  const [cognitiveAbility, setCognitiveAbility] = useState('');
  const [readingComprehension, setReadingComprehension] = useState('');
  const [writtenCommunication, setWrittenCommunication] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateScores = () => {
    if (!studentId.trim()) {
      return 'Student ID is required.';
    }

    if (!language.trim()) {
      return 'Language is required.';
    }

    const scores = [
      { name: 'Verbal Fluency', val: verbalFluency },
      { name: 'Cognitive Ability', val: cognitiveAbility },
      { name: 'Reading Comprehension', val: readingComprehension },
      { name: 'Written Communication', val: writtenCommunication },
    ];

    for (const score of scores) {
      if (score.val === '' || score.val === null || score.val === undefined) {
        return `${score.name} score is required.`;
      }
      const num = Number(score.val);
      if (isNaN(num)) {
        return `${score.name} must be a valid number.`;
      }
      if (num < 0 || num > 100) {
        return `${score.name} score must be between 0 and 100.`;
      }
    }

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const error = validateScores();
    if (error) {
      setValidationError(error);
      return;
    }

    const payload = {
      studentId: studentId.trim(),
      language: language.trim(),
      verbalFluency: Number(verbalFluency),
      cognitiveAbility: Number(cognitiveAbility),
      readingComprehension: Number(readingComprehension),
      writtenCommunication: Number(writtenCommunication),
    };

    onSubmit(payload);
  };

  return (
    <div className="card">
      <h3 className="card-title">📝 Enter Student Assessment</h3>

      {validationError && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="studentId">
            Student ID *
          </label>
          <input
            id="studentId"
            type="text"
            className="form-input"
            placeholder="e.g. 64f1b2c3d4e5f67890123456"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="language">
            Assessment Language *
          </label>
          <select
            id="language"
            className="form-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isLoading}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="scores-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="verbalFluency">
              Verbal Fluency (0-100) *
            </label>
            <input
              id="verbalFluency"
              type="number"
              min="0"
              max="100"
              className="form-input"
              placeholder="0-100"
              value={verbalFluency}
              onChange={(e) => setVerbalFluency(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cognitiveAbility">
              Cognitive Ability (0-100) *
            </label>
            <input
              id="cognitiveAbility"
              type="number"
              min="0"
              max="100"
              className="form-input"
              placeholder="0-100"
              value={cognitiveAbility}
              onChange={(e) => setCognitiveAbility(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="readingComprehension">
              Reading Comprehension (0-100) *
            </label>
            <input
              id="readingComprehension"
              type="number"
              min="0"
              max="100"
              className="form-input"
              placeholder="0-100"
              value={readingComprehension}
              onChange={(e) => setReadingComprehension(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="writtenCommunication">
              Written Communication (0-100) *
            </label>
            <input
              id="writtenCommunication"
              type="number"
              min="0"
              max="100"
              className="form-input"
              placeholder="0-100"
              value={writtenCommunication}
              onChange={(e) => setWrittenCommunication(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.5rem' }}
          disabled={isLoading}
        >
          {isLoading ? 'Submitting Assessment...' : 'Submit Assessment'}
        </button>
      </form>
    </div>
  );
};

export default AssessmentForm;
