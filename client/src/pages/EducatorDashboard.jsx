import { Library, ClipboardList, GraduationCap, LayoutDashboard } from 'lucide-react';
import { ContentLibrary } from '../features/content/index.js';
import { AssignmentBoard } from '../features/assignments/index.js';
import { getCurrentUser } from '../api/auth.js';

// Shared by both educator and student roles (RoleRoute allows both on
// /dashboard) — ContentLibrary/AssignmentBoard already adapt what they show
// internally per role; this just adjusts the page framing to match.
function EducatorDashboard() {
  const isStudent = getCurrentUser()?.role === 'student';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-100 shrink-0">
          {isStudent ? (
            <GraduationCap className="w-5 h-5 text-indigo-600" />
          ) : (
            <LayoutDashboard className="w-5 h-5 text-indigo-600" />
          )}
        </span>
        <h1 className="text-3xl font-bold text-gray-900">{isStudent ? 'My Learning' : 'Educator Dashboard'}</h1>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-700">
          <Library className="w-4 h-4 text-gray-400" />
          Content Library
        </h2>
        <ContentLibrary />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-700">
          <ClipboardList className="w-4 h-4 text-gray-400" />
          {isStudent ? 'My Assignments' : 'Assignments'}
        </h2>
        <AssignmentBoard />
      </section>
    </div>
  );
}

export default EducatorDashboard;
