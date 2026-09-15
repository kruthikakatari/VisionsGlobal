import { useEffect, useState } from 'react';
import { getAssignments } from './api.js';

function AssignmentList({ refreshKey, onSelect, selectedId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getAssignments()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <p>Loading assignments...</p>;
  if (error) return <p className="assignment-error">{error}</p>;
  if (items.length === 0) return <p>No assignments yet.</p>;

  return (
    <ul className="assignment-list">
      {items.map((item) => (
        <li
          key={item._id}
          className={`assignment-item ${selectedId === item._id ? 'selected' : ''}`}
          onClick={() => onSelect(item._id)}
        >
          <strong>{item.title}</strong>
          <div className="assignment-item-meta">
            {item.subject}
            {item.topic ? ` · ${item.topic}` : ''}
            {item.dueDate ? ` · Due ${new Date(item.dueDate).toLocaleDateString()}` : ''}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default AssignmentList;
