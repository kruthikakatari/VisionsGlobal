const AREA_NAMES = {
  verbalFluency: 'Verbal Fluency',
  cognitiveAbility: 'Cognitive Ability',
  readingComprehension: 'Reading Comprehension',
  writtenCommunication: 'Written Communication',
};

export const RecommendationsList = ({ recommendations, isAvailable, isLoading }) => {
  return (
    <div className="card">
      <h3 className="card-title">🎯 Recommended Learning Activities</h3>

      {isLoading ? (
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading recommendations...</p>
      ) : !isAvailable || !recommendations ? (
        <div className="alert alert-info">
          <span>ℹ️</span>
          <span>Recommendations will appear here once enabled.</span>
        </div>
      ) : recommendations.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          No specific interventions needed at this time.
        </p>
      ) : (
        <div className="recommendations-list">
          {recommendations.map((rec, idx) => (
            <div key={`${rec.area}-${idx}`} className="recommendation-item">
              <div className="rec-header">
                <span className="rec-area">{AREA_NAMES[rec.area] || rec.area}</span>
                <div className="rec-badges">
                  {rec.priority && (
                    <span className="badge-priority">{rec.priority} priority</span>
                  )}
                  {rec.suggestedDifficulty && (
                    <span className="badge-difficulty">{rec.suggestedDifficulty}</span>
                  )}
                </div>
              </div>
              <p className="rec-activity">
                👉 <strong>Suggested Activity:</strong> {rec.suggestedActivity}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsList;
