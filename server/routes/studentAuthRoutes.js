import express from 'express';
import { studentLogin } from '../controllers/studentAuthController.js';

const router = express.Router();

// Mounted at /api/auth in server.js -> POST /api/auth/student-login
// Deliberately does not collide with Member 1's /api/auth/login and
// /api/auth/register (those are their real educator/parent auth and are
// left untouched).
router.post('/student-login', studentLogin);

export default router;
