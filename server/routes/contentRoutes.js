import express from 'express';
import { getContent, createContent } from '../controllers/contentController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Any authenticated user (student, educator, parent) can browse the content library.
router.get('/', protect, getContent);

// Only educators can add new content.
router.post('/', protect, restrictTo('educator'), createContent);

export default router;
