import { ContentLibrary } from '../features/content/index.js';
import { AssignmentBoard } from '../features/assignments/index.js';
import { getCurrentUser } from '../api/auth.js';

// Shared by both educator and student roles (RoleRoute allows both on
// /dashboard) — ContentLibrary/AssignmentBoard already adapt what they show
// internally per role; this just adjusts the page framing to match.
function EducatorDashboard() {
  const isStudent = getCurrentUser()?.role === 'student';

  return (
    <div className="educator-dashboard">
      <h2>{isStudent ? 'My Learning' : 'Educator Dashboard'}</h2>

      <section>
        <h3>Content Library</h3>
        <ContentLibrary />
      </section>

      <section>
        <h3>{isStudent ? 'My Assignments' : 'Assignments'}</h3>
        <AssignmentBoard />
      </section>
    </div>
  );
}

export default EducatorDashboard;
