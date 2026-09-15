import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth.js';
import './auth.css';

// Real email+password login — uses Member 1's actual auth (client/src/api/auth.js
// -> POST /api/auth/login). Primarily for educator/leadership accounts now:
// students and parents log in via StudentLoginForm's Student ID + password tabs
// instead (see server/controllers/studentAuthController.js). Kept generic (routes
// by whatever role comes back) since a parent could still exist as a plain
// email+password User from before that flow existed.
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      const role = res.data?.user?.role;
      if (role === 'parent') navigate('/parent');
      else if (role === 'leadership') navigate('/leadership');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <h2>Educator / Leadership Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="priya.educator@visionslearn.org"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="password123"
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
