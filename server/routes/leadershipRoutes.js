import express from 'express';
import { getAnalytics } from '../controllers/leadershipController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/analytics', protect, restrictTo('leadership'), getAnalytics);

export default router;
