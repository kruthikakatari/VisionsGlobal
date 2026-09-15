import { useState, useEffect } from 'react';
import { AssessmentPage } from './pages/AssessmentPage.jsx';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking backend connection...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setBackendStatus(data.message || 'Connected to backend');
      })
      .catch(() => {
        setBackendStatus('Backend not connected (run server to connect)');
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '1.5rem 1rem' }}>
      <header style={{ maxWidth: '1000px', margin: '0 auto 1.5rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Visions Learn
          </h1>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Student Education & Progress Tracking Platform
          </span>
        </div>
        <div className="status-badge" style={{ margin: 0 }}>
          ● {backendStatus}
        </div>
      </header>

      <AssessmentPage />
    </div>
  );
}

export default App;
