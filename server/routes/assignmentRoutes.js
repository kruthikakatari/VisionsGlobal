import express from 'express';
import { getAssignments, createAssignment, getAssignmentById } from '../controllers/assignmentController.js';
import { createSubmission, updateSubmission } from '../controllers/submissionController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

// Mounted at /api in server.js, so these resolve to:
//   GET   /api/assignments
//   POST  /api/assignments
//   GET   /api/assignments/:id
//   POST  /api/submissions
//   PATCH /api/submissions/:id
const router = express.Router();

router.get('/assignments', protect, getAssignments);
router.post('/assignments', protect, restrictTo('educator'), createAssignment);
router.get('/assignments/:id', protect, getAssignmentById);

router.post('/submissions', protect, restrictTo('student'), createSubmission);
router.patch('/submissions/:id', protect, restrictTo('educator'), updateSubmission);

export default router;
