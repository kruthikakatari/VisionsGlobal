import { Heart } from 'lucide-react';
import { ParentProgressView } from '../features/parent/index.js';

function ParentDashboard() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-100 shrink-0">
          <Heart className="w-5 h-5 text-indigo-600" />
        </span>
        <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
      </div>
      <ParentProgressView />
    </div>
  );
}

export default ParentDashboard;
