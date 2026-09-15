import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import assessmentRoutes from './routes/assessmentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Assessment & Progress routes (Person 2)
app.use('/api', assessmentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
