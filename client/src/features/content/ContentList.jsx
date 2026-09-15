import { useEffect, useState } from 'react';
import { BookOpen, Layers, AlertCircle } from 'lucide-react';
import { getContent } from './api.js';

const DIFFICULTY_COLORS = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Hard: 'bg-red-100 text-red-800',
};

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

  if (loading) {
    return <p className="text-sm text-gray-400 px-1">Loading content...</p>;
  }

  if (error) {
    return (
      <p className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-gray-400 gap-2">
        <Layers className="w-10 h-10 opacity-30" />
        <p className="text-base font-medium">No learning content yet.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li
          key={item._id}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100 shrink-0">
                <BookOpen className="w-4 h-4 text-indigo-600" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {item.subject} <span className="text-gray-400">·</span> {item.topic}
                </p>
                <p className="text-xs text-gray-500">
                  Grade {item.grade} · {item.language}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                DIFFICULTY_COLORS[item.difficulty] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {item.difficulty}
            </span>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.content}</p>
        </li>
      ))}
    </ul>
  );
}

export default ContentList;
