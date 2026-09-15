import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../api/auth.js';

// Where each role lands by default (used here and by RootRedirect in App.jsx).
export const ROLE_HOME = {
  educator: '/dashboard',
  leadership: '/leadership',
  parent: '/parent',
  student: '/dashboard',
};

// Gates a route to a set of roles. Not logged in -> the login chooser.
// Logged in but wrong role -> that user's own home, not an error page,
// since the nav bar already only shows links relevant to their role.
function RoleRoute({ roles, children }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/welcome'} replace />;
  }

  return children;
}

export default RoleRoute;
