import { post, saveToken, clearToken, hasToken } from './apiClient';

export const login = async (email, password) => {
  const data = await post('/auth/login', { email, password });
  if (data.token) {
    saveToken(data.token);
    if (data.data?.user) {
      localStorage.setItem('vl_user', JSON.stringify(data.data.user));
    }
  }
  return data;
};

export const register = async (userData) => {
  const data = await post('/auth/register', userData);
  if (data.token) {
    saveToken(data.token);
    if (data.data?.user) {
      localStorage.setItem('vl_user', JSON.stringify(data.data.user));
    }
  }
  return data;
};

export const logout = () => {
  clearToken();
  localStorage.removeItem('vl_user');
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('vl_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Ensures there is an active educator session so the frontend can seamlessly
 * perform CRUD operations against the JWT-protected backend.
 */
export const ensureAuth = async () => {
  if (hasToken() && getCurrentUser()) {
    return getCurrentUser();
  }

  const defaultCreds = {
    email: 'priya.educator@visionslearn.org',
    password: 'password123',
  };

  try {
    const res = await login(defaultCreds.email, defaultCreds.password);
    return res.data?.user;
  } catch (err) {
    // If login fails (user doesn't exist yet in this DB instance), register
    try {
      const res = await register({
        name: 'Priya Rajan',
        ...defaultCreds,
        role: 'educator',
      });
      return res.data?.user;
    } catch (regErr) {
      console.warn('Auto-auth warning:', regErr.message);
      return null;
    }
  }
};
