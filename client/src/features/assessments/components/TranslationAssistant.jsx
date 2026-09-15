import { useState } from 'react';
import { translateAssessmentTextApi } from '../api/assessmentApi.js';

export const TranslationAssistant = ({ targetLanguage = 'Tamil' }) => {
  const [questionText, setQuestionText] = useState(
    'Read the short passage and summarize the main idea in your own words.'
  );
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTranslate = async () => {
    if (!questionText.trim()) {
      setErrorMsg('Please enter or select a question to translate.');
      return;
    }

    setIsTranslating(true);
    setErrorMsg('');

    try {
      const res = await translateAssessmentTextApi({
        text: questionText.trim(),
        sourceLanguage: 'English',
        targetLanguage: targetLanguage || 'Tamil',
      });

      if (res?.data?.translation) {
        setTranslatedText(res.data.translation);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Translation service is temporarily unavailable. You can continue with the original question.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <h3 className="card-title">🌐 Local-Language Question Translation (Sarvam AI)</h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>
        Translate assessment prompts into <strong>{targetLanguage}</strong> for local-language accessibility.
      </p>

      {errorMsg && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="englishQuestion">
          Assessment Question (English)
        </label>
        <textarea
          id="englishQuestion"
          className="form-input"
          rows={3}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter question to translate..."
          disabled={isTranslating}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
          onClick={() => setQuestionText('Describe your favorite outdoor activity and explain why you enjoy it.')}
          disabled={isTranslating}
        >
          Sample: Verbal Prompt
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
          onClick={() => setQuestionText('Identify the pattern in the sequence: 2, 4, 8, 16, and predict the next two numbers.')}
          disabled={isTranslating}
        >
          Sample: Cognitive Prompt
        </button>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={handleTranslate}
        disabled={isTranslating || !questionText.trim()}
      >
        {isTranslating ? 'Translating...' : `Translate to ${targetLanguage}`}
      </button>

      {translatedText && (
        <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {targetLanguage} Translation
          </span>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', color: '#14532d', fontWeight: 500, lineHeight: 1.6 }}>
            {translatedText}
          </p>
        </div>
      )}
    </div>
  );
};

export default TranslationAssistant;
