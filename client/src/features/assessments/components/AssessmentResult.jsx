const AREA_LABELS = {
  verbalFluency: 'Verbal Fluency',
  cognitiveAbility: 'Cognitive Ability',
  readingComprehension: 'Reading Comprehension',
  writtenCommunication: 'Written Communication',
};

export const AssessmentResult = ({ assessment, progress, isLoadingProgress }) => {
  if (!assessment) return null;

  const getScoreClass = (score) => {
    return score < 50 ? 'score-value score-gap' : 'score-value score-good';
  };

  const learningGaps = progress?.learningGaps || [];

  return (
    <div className="card">
      <h3 className="card-title">📊 Assessment Result & Progress</h3>

      <div className="alert alert-success">
        <span>✅</span>
        <span>Assessment submitted successfully.</span>
      </div>

      <div className="score-display-card">
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#475569' }}>
          Submitted Scores ({assessment.language})
        </h4>
        <div className="score-row">
          <span>Verbal Fluency</span>
          <span className={getScoreClass(assessment.verbalFluency)}>
            {assessment.verbalFluency}/100
          </span>
        </div>
        <div className="score-row">
          <span>Cognitive Ability</span>
          <span className={getScoreClass(assessment.cognitiveAbility)}>
            {assessment.cognitiveAbility}/100
          </span>
        </div>
        <div className="score-row">
          <span>Reading Comprehension</span>
          <span className={getScoreClass(assessment.readingComprehension)}>
            {assessment.readingComprehension}/100
          </span>
        </div>
        <div className="score-row">
          <span>Written Communication</span>
          <span className={getScoreClass(assessment.writtenCommunication)}>
            {assessment.writtenCommunication}/100
          </span>
        </div>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#1e293b' }}>
          Learning Gaps
        </h4>

        {isLoadingProgress ? (
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading current progress...</p>
        ) : learningGaps.length === 0 ? (
          <div className="no-gaps-badge">
            ✅ No learning gaps detected.
          </div>
        ) : (
          <div className="gaps-container">
            {learningGaps.map((gap) => (
              <span key={gap} className="gap-badge">
                <span>🔴</span>
                <span>{AREA_LABELS[gap] || gap}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentResult;
