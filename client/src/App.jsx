import { useState, useEffect } from 'react';

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
    </div>
  );
}

export default App;
