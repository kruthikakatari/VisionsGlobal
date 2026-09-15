import { useState, useEffect } from 'react';
import EducatorDashboard from './pages/EducatorDashboard.jsx';
import ParentDashboard from './pages/ParentDashboard.jsx';
import { getCurrentUser } from './api/client.js';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking backend connection...');

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

  const user = getCurrentUser();

  return (
    <div className="card">
      <h1>Visions Learn</h1>
      <p>Frontend is running</p>
      <div className="status-badge">
        Server status: {backendStatus}
      </div>

      {/*
        TEMPORARY: minimal role switch so every dashboard is reachable for
        local testing before the team adds real routing/login. Educators and
        students share EducatorDashboard (its Content/Assignment widgets
        already adapt per role internally); parents get ParentDashboard.
        Replace with proper routing once P1's auth/login UI lands.
      */}
      {user?.role === 'parent' ? <ParentDashboard /> : <EducatorDashboard />}
    </div>
  );
}

export default App;
