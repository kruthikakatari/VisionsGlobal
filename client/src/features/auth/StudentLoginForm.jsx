import { useState } from 'react';
import { studentLogin, parentLogin } from './api.js';
import { saveToken } from '../../api/client.js';
import './auth.css';

/**
 * StudentLoginForm
 * Tabbed login UI for Students and Parents.
 * Both log in with a human-readable Student ID (e.g. VL-2024-0042) + password.
 * No MongoDB ObjectIds are ever exposed to users.
 */
function StudentLoginForm({ onLoggedIn }) {
  const [tab, setTab]           = useState('student'); // 'student' | 'parent'
  const [studentId, setStudentId] = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loginFn = tab === 'student' ? studentLogin : parentLogin;
      const res = await loginFn(studentId.trim(), password);
      saveToken(res.token);
      if (res.data?.user) {
        localStorage.setItem('vl_user', JSON.stringify(res.data.user));
      }
      onLoggedIn?.(res.data?.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  const isStudent = tab === 'student';

  return (
    <div className="auth-card">
      {/* Header */}
      <div className="auth-header">
        <div className="auth-logo">🎓</div>
        <h1 className="auth-title">Visions Learn</h1>
        <p className="auth-subtitle">
          {isStudent ? 'Student Portal' : 'Parent Portal'}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${tab === 'student' ? 'auth-tab--active' : ''}`}
          onClick={() => { setTab('student'); setError(''); }}
        >
          👤 Student
        </button>
        <button
          type="button"
          className={`auth-tab ${tab === 'parent' ? 'auth-tab--active' : ''}`}
          onClick={() => { setTab('parent'); setError(''); }}
        >
          👨‍👩‍👧 Parent
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="auth-student-id" className="auth-label">
            Student ID
          </label>
          <input
            id="auth-student-id"
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            placeholder="VL-2024-0042"
            className="auth-input"
            autoComplete="username"
          />
          <span className="auth-hint">
            {isStudent
              ? 'Your Student ID — shared by your educator'
              : "Your child's Student ID — shared by the educator"}
          </span>
        </div>

        <div className="auth-field">
          <label htmlFor="auth-password" className="auth-label">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={isStudent ? 'e.g. Aarav2026' : 'Parent password'}
            className="auth-input"
            autoComplete="current-password"
          />
          <span className="auth-hint">
            {isStudent
              ? 'Default: your first name + current year'
              : 'Set by the educator when registering your child'}
          </span>
        </div>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <button type="submit" disabled={loading} className="auth-submit">
          {loading
            ? <span className="auth-spinner">⏳ Signing in…</span>
            : `Sign in as ${isStudent ? 'Student' : 'Parent'}`}
        </button>
      </form>
    </div>
  );
}

export default StudentLoginForm;
