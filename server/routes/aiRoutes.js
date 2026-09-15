import express from 'express';
import { generateAiAssignment } from '../controllers/aiController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mounted at /api/ai in server.js -> POST /api/ai/generate-assignment
router.post('/generate-assignment', protect, restrictTo('educator'), generateAiAssignment);

export default router;
