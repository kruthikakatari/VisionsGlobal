import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Member 1 (Student/Educator/User + auth)
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import educatorRoutes from './routes/educatorRoutes.js';

// Member 2 (Assessment, Progress, learning gaps, recommendations, Sarvam)
import assessmentRoutes from './routes/assessmentRoutes.js';

// Member 3 (Content, Assignments, AI Assistant, Parent, Leadership, student login)
import contentRoutes from './routes/contentRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import studentAuthRoutes from './routes/studentAuthRoutes.js';
import leadershipRoutes from './routes/leadershipRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Member 1's routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/educators', educatorRoutes);

// Member 2's routes
app.use('/api', assessmentRoutes);

// Member 3's routes. studentAuthRoutes shares the /api/auth prefix with
// authRoutes above (adds POST /student-login alongside their /login and
// /register — no path collision).
app.use('/api/content', contentRoutes);
app.use('/api', assignmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/auth', studentAuthRoutes);
app.use('/api/leadership', leadershipRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
