import express from 'express';
import * as studentController from '../controllers/studentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Require authentication for all student routes
router.use(protect);

router
  .route('/')
  .get(restrictTo('educator', 'leadership'), studentController.getStudents)
  .post(restrictTo('educator'), studentController.createStudent);

router
  .route('/:id')
  // Parent can only view (in a real app we'd check if they own the student record)
  .get(restrictTo('educator', 'leadership', 'parent'), studentController.getStudent)
  .put(restrictTo('educator'), studentController.updateStudent);

export default router;
