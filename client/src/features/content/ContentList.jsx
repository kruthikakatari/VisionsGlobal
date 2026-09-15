import { useEffect, useState } from 'react';
import { getContent } from './api.js';

function ContentList({ refreshKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getContent()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <p>Loading content...</p>;
  if (error) return <p className="content-error">{error}</p>;
  if (items.length === 0) return <p>No learning content yet.</p>;

  return (
    <ul className="content-list">
      {items.map((item) => (
        <li key={item._id} className="content-item">
          <div className="content-item-header">
            <strong>{item.subject}</strong> · {item.topic}
            <span className={`difficulty-badge difficulty-${item.difficulty.toLowerCase()}`}>
              {item.difficulty}
            </span>
          </div>
          <div className="content-item-meta">
            Grade {item.grade} · {item.language}
          </div>
          <p className="content-item-body">{item.content}</p>
        </li>
      ))}
    </ul>
  );
}

export default ContentList;
