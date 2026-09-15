import express from 'express';
import {
  createAssessment,
  getStudentAssessments,
  getStudentProgress,
  getStudentRecommendations,
} from '../controllers/assessmentController.js';
import {
  translateAssessmentText,
  transcribeAssessmentVoice,
} from '../controllers/sarvamController.js';

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

// 1. POST /api/assessments/translate (Sarvam Translation - Educators only)
router.post('/assessments/translate', protect, restrictTo('educator'), translateAssessmentText);
router.post('/translate', protect, restrictTo('educator'), translateAssessmentText);

// 2. POST /api/assessments/speech-to-text (Sarvam Speech-to-Text - Educators only)
router.post('/assessments/speech-to-text', protect, restrictTo('educator'), transcribeAssessmentVoice);
router.post('/speech-to-text', protect, restrictTo('educator'), transcribeAssessmentVoice);

// 3. POST /api/assessments (Restricted to educators)
router.post('/assessments', protect, restrictTo('educator'), createAssessment);
router.post('/', protect, restrictTo('educator'), createAssessment);

// 4. GET /api/students/:id/assessments (Authenticated users)
router.get('/students/:id/assessments', protect, getStudentAssessments);
router.get('/:id/assessments', protect, getStudentAssessments);

// 5. GET /api/students/:id/progress (Authenticated users)
router.get('/students/:id/progress', protect, getStudentProgress);
router.get('/:id/progress', protect, getStudentProgress);

// 6. GET /api/students/:id/recommendations (Restricted to educators)
router.get('/students/:id/recommendations', protect, restrictTo('educator'), getStudentRecommendations);
router.get('/:id/recommendations', protect, restrictTo('educator'), getStudentRecommendations);

export default router;
