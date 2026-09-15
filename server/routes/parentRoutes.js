import express from 'express';
import { getStudentProgress } from '../controllers/parentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// NOTE: does not yet verify the requesting parent is actually linked to this
// student — that relationship lives in Member 1's User/Student model, not
// merged yet. Revisit once it lands (Phase 8 integration).
router.get('/student-progress', protect, restrictTo('parent'), getStudentProgress);

export default router;
