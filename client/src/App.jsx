import { useState, useEffect } from 'react';
import EducatorDashboard from './pages/EducatorDashboard.jsx';
import ParentDashboard from './pages/ParentDashboard.jsx';
import LeadershipDashboard from './pages/LeadershipDashboard.jsx';
import { StudentLoginForm } from './features/auth/index.js';
import { getCurrentUser } from './api/client.js';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking backend connection...');
  const [authVersion, setAuthVersion] = useState(0);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setBackendStatus(data.message || 'Connected to backend');
      })
      .catch((err) => {
        setBackendStatus('Backend not connected (run server to connect)');
      });
  }, []);

  // Re-read on every authVersion bump so a successful login re-renders
  // (localStorage writes don't trigger React updates on their own).
  const user = getCurrentUser();
  void authVersion;

  return (
    <div className="card">
      <h1>Visions Learn</h1>
      <p>Frontend is running</p>
      <div className="status-badge">
        Server status: {backendStatus}
      </div>

      {/*
        TEMPORARY: minimal login gate + role switch so every dashboard is
        reachable for local testing before the team wires up full routing.
        Educators and students share EducatorDashboard (its Content/Assignment
        widgets already adapt per role internally); parents and leadership
        get their own dashboards. Member 1's real email+password login (now
        merged to main via feature/student-educator-core) isn't merged into
        THIS branch yet — for now, testing educator/parent/leadership means
        setting vl_token/vl_user in localStorage directly. Students log in
        via StudentLoginForm, a P3 placeholder (see
        server/controllers/studentAuthController.js) — note it won't survive
        a merge with the real authMiddleware.js as-is; see Phase 8.
        Replace all of this with proper routing once branches merge.
      */}
      {!user ? (
        <StudentLoginForm onLoggedIn={() => setAuthVersion((v) => v + 1)} />
      ) : user.role === 'parent' ? (
        <ParentDashboard />
      ) : user.role === 'leadership' ? (
        <LeadershipDashboard />
      ) : (
        <EducatorDashboard />
      )}
    </div>
  );
}

export default App;
