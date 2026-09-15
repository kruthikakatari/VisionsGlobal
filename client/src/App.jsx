import { useState, useEffect } from 'react';
import EducatorDashboard from './pages/EducatorDashboard.jsx';

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

  return (
    <div className="card">
      <h1>Visions Learn</h1>
      <p>Frontend is running</p>
      <div className="status-badge">
        Server status: {backendStatus}
      </div>

      {/*
        TEMPORARY: rendering EducatorDashboard directly here so the Content
        Library is reachable for local testing before the team adds real
        routing/login. Replace with proper role-based routing once that lands.
      */}
      <EducatorDashboard />
    </div>
  );
}

export default App;
