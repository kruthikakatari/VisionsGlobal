import express from 'express';
import * as educatorController from '../controllers/educatorController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(restrictTo('leadership'), educatorController.getEducators);

router
  .route('/:id')
  .get(restrictTo('leadership', 'educator'), educatorController.getEducator);

router
  .route('/:id/sessions')
  .get(restrictTo('leadership', 'educator'), educatorController.getSessions)
  .post(restrictTo('educator'), educatorController.createSession);

export default router;
