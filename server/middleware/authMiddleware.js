// ⚠️ TEMPORARY PLACEHOLDER — owned by Member 1 (Student/Educator/User management).
//
// Member 1 has not yet pushed the real auth middleware, so this minimal stand-in
// unblocks P3's routes (content, assignments, AI, parent, leadership) for local
// development/testing. It implements the JWT contract the team already agreed on:
//   - a Bearer token in the Authorization header
//   - a payload containing { id, role }
//   - req.user = { id, role } set for downstream handlers
//
// Named authMiddleware.js (not auth.js) to match the path Member 2's
// assessmentRoutes.js already expects (`../middleware/authMiddleware.js`),
// so this is a true drop-in slot regardless of who merges first.
//
// When Member 1 pushes the real middleware, DELETE this file and re-point every
// `import { protect, restrictTo } from '../middleware/authMiddleware.js'` at
// theirs (same function names/signatures, so it should be a drop-in swap).
import jwt from 'jsonwebtoken';

export function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
}

export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}
