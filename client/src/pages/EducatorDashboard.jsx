import { ContentLibrary } from '../features/content/index.js';
import { AssignmentBoard } from '../features/assignments/index.js';

function EducatorDashboard() {
  return (
    <div className="educator-dashboard">
      <h2>Educator Dashboard</h2>

      <section>
        <h3>Content Library</h3>
        <ContentLibrary />
      </section>

      <section>
        <h3>Assignments</h3>
        <AssignmentBoard />
      </section>

      {/* AI Assistant section will be added in Phase 5 */}
    </div>
  );
}

export default EducatorDashboard;
