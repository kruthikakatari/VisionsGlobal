import { useState } from 'react';
import { studentLogin } from './api.js';
import { saveToken } from '../../api/client.js';
import './auth.css';

// TEMPORARY — see server/controllers/studentAuthController.js for why this
// exists (Member 1's real User/Student models have no student credential
// yet). Once they add one, replace this with their login screen.
function StudentLoginForm({ onLoggedIn }) {
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await studentLogin(studentId);
      saveToken(res.token);
      if (res.data?.user) {
        localStorage.setItem('vl_user', JSON.stringify(res.data.user));
      }
      onLoggedIn?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="student-login">
      <h2>Student Login</h2>
      <form onSubmit={handleSubmit} className="student-login-form">
        <label>
          Student ID
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            placeholder="650000000000000000000002"
          />
        </label>
        <small>
          Temporary: educator/parent/leadership login uses Member 1's real email+password screen. This
          is a stand-in just for students, who don't have credentials in the system yet.
        </small>
        {error && <p className="student-login-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}

export default StudentLoginForm;
