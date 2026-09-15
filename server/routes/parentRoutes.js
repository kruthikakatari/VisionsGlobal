import express from 'express';
import { getStudentProgress } from '../controllers/parentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// A parent who logged in via the real parent-login (studentId + parent
// password) has req.user.studentProfile set — the controller enforces that
// they can only view their own linked student. A parent-role account
// created the old way (plain email+password, no linked student) falls back
// to trusting the studentId query param, same as before.
router.get('/student-progress', protect, restrictTo('parent'), getStudentProgress);

export default router;
