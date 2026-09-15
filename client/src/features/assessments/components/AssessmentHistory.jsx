import { useState } from 'react';

export const AssessmentHistory = ({ assessments, onFetchHistory, isLoading, studentId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    if (!isOpen && (!assessments || assessments.length === 0)) {
      onFetchHistory();
    }
    setIsOpen(!isOpen);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="card-title" style={{ margin: 0 }}>
          📜 Assessment History
        </h3>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleToggle}
          disabled={isLoading || !studentId}
        >
          {isLoading
            ? 'Loading History...'
            : isOpen
            ? 'Hide History'
            : 'View Assessment History'}
        </button>
      </div>

      {!studentId && (
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.75rem', marginBottom: 0 }}>
          Enter a Student ID to view assessment history.
        </p>
      )}

      {isOpen && (
        <div style={{ marginTop: '1rem' }}>
          {isLoading ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading assessment history...</p>
          ) : !assessments || assessments.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              No previous assessments found for this student.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Language</th>
                    <th>Verbal</th>
                    <th>Cognitive</th>
                    <th>Reading</th>
                    <th>Writing</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((item) => (
                    <tr key={item._id || item.assessedAt}>
                      <td>{formatDate(item.assessedAt)}</td>
                      <td>{item.language}</td>
                      <td style={{ color: item.verbalFluency < 50 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                        {item.verbalFluency}
                      </td>
                      <td style={{ color: item.cognitiveAbility < 50 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                        {item.cognitiveAbility}
                      </td>
                      <td style={{ color: item.readingComprehension < 50 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                        {item.readingComprehension}
                      </td>
                      <td style={{ color: item.writtenCommunication < 50 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                        {item.writtenCommunication}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssessmentHistory;
