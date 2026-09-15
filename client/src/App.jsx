import { useState, useEffect } from 'react';
import EducatorDashboard from './pages/EducatorDashboard.jsx';
import ParentDashboard from './pages/ParentDashboard.jsx';
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
        widgets already adapt per role internally); parents get
        ParentDashboard. Educator/parent login is Member 1's real
        email+password flow (feature/student-educator-core, not merged yet)
        — for now, testing those roles means setting vl_token/vl_user in
        localStorage directly. Students log in via StudentLoginForm, a P3
        placeholder (see server/controllers/studentAuthController.js).
        Replace all of this with proper routing once P1's auth UI lands.
      */}
      {!user ? (
        <StudentLoginForm onLoggedIn={() => setAuthVersion((v) => v + 1)} />
      ) : user.role === 'parent' ? (
        <ParentDashboard />
      ) : (
        <EducatorDashboard />
      )}
    </div>
  );
}

export default App;
