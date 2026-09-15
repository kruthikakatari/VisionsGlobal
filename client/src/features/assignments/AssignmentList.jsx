import { useEffect, useState } from 'react';
import { ClipboardList, ChevronRight, CalendarDays, AlertCircle } from 'lucide-react';
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

  if (loading) {
    return <p className="text-sm text-gray-400 px-1">Loading assignments...</p>;
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
        <ClipboardList className="w-10 h-10 opacity-30" />
        <p className="text-base font-medium">No assignments yet.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item._id}>
          <button
            onClick={() => onSelect(item._id)}
            className={`w-full flex items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-all min-h-[64px] ${
              selectedId === item._id
                ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                : 'bg-white border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md'
            }`}
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 shrink-0">
              <ClipboardList className="w-4 h-4 text-indigo-600" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{item.title}</p>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                <span>{item.subject}</span>
                {item.topic && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span>{item.topic}</span>
                  </>
                )}
                {item.dueDate && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      Due {new Date(item.dueDate).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export default AssignmentList;
