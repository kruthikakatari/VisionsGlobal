import { useState } from 'react';
import { studentLogin } from './api.js';
import { saveToken } from '../../api/client.js';
import './auth.css';

// TEMPORARY — see server/controllers/studentAuthController.js for why this
// exists (Member 1's real auth has no student role/credential yet). Once
// they add one, replace this with their login screen.
function StudentLoginForm({ onLoggedIn }) {
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await studentLogin(studentId);
      saveToken(token);
      localStorage.setItem('vl_user', JSON.stringify(user));
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
          Temporary: educator/parent login uses Member 1's real login screen once merged. This is a
          stand-in just for students, who don't have accounts in the current system yet.
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
