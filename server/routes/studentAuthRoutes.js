import express from 'express';
import { studentLogin, parentLogin } from '../controllers/studentAuthController.js';

const router = express.Router();

// Mounted at /api/auth in server.js
// POST /api/auth/student-login  — student logs in with studentId + password
// POST /api/auth/parent-login   — parent logs in with studentId + parentPassword
router.post('/student-login', studentLogin);
router.post('/parent-login', parentLogin);

export default router;
