import express from 'express';
import {
  createAssessment,
  getStudentAssessments,
  getStudentProgress,
} from '../controllers/assessmentController.js';

// Resolve Person 1's auth middleware adhering to the contract
let protect = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

let restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  next();
};

try {
  const authModule = await import('../middleware/authMiddleware.js');
  if (authModule.protect) protect = authModule.protect;
  if (authModule.restrictTo) restrictTo = authModule.restrictTo;
} catch {
  // Person 1's authMiddleware will be loaded seamlessly upon branch merge
}

const router = express.Router();

// 1. POST /api/assessments (Restricted to educators)
router.post('/assessments', protect, restrictTo('educator'), createAssessment);
router.post('/', protect, restrictTo('educator'), createAssessment);

// 2. GET /api/students/:id/assessments (Authenticated users)
router.get('/students/:id/assessments', protect, getStudentAssessments);
router.get('/:id/assessments', protect, getStudentAssessments);

// 3. GET /api/students/:id/progress (Authenticated users)
router.get('/students/:id/progress', protect, getStudentProgress);
router.get('/:id/progress', protect, getStudentProgress);

export default router;
