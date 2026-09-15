import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import contentRoutes from './routes/contentRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import parentRoutes from './routes/parentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use('/api/content', contentRoutes);
app.use('/api', assignmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/parent', parentRoutes);

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
