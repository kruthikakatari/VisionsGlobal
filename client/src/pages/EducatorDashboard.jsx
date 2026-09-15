import { ContentLibrary } from '../features/content/index.js';

function EducatorDashboard() {
  return (
    <div className="educator-dashboard">
      <h2>Educator Dashboard</h2>

      <section>
        <h3>Content Library</h3>
        <ContentLibrary />
      </section>

      {/* Assignments and AI Assistant sections will be added in later phases */}
    </div>
  );
}

export default EducatorDashboard;
