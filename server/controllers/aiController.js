import mongoose from 'mongoose';
import Submission from '../models/Submission.js';
import { generateAssignment } from '../services/aiAssignmentService.js';

// "previouslyLearned" is a P3-owned field, and P3 already has the data for
// it (the student's own submission/assignment history) — so it's derived
// here rather than fetched over HTTP from another member's branch.
//
// grade/language (P1's domain) and learningGaps (P2's domain) are NOT
// re-derived here: by the time an educator opens the AI Assistant for a
// student, the frontend has already loaded that student's profile and
// learning gaps from P1/P2's screens, so it passes them straight through.
async function getPreviouslyLearned(studentId) {
  const submissions = await Submission.find({ student: studentId })
    .sort({ submittedAt: -1 })
    .limit(10)
    .populate('assignment', 'subject topic title');

  const topics = submissions.map((s) => s.assignment?.topic || s.assignment?.title).filter(Boolean);

  return [...new Set(topics)];
}

// POST /api/ai/generate-assignment (educator only)
export async function generateAiAssignment(req, res) {
  try {
    const { studentId, learningGaps, grade, language, difficulty } = req.body;

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'A valid studentId is required' });
    }
    if (!grade || !language || !difficulty) {
      return res.status(400).json({ message: 'grade, language and difficulty are required' });
    }

    const previouslyLearned = await getPreviouslyLearned(studentId);

    const aiInput = {
      studentId,
      previouslyLearned,
      learningGaps: Array.isArray(learningGaps) ? learningGaps : [],
      grade,
      language,
      difficulty,
    };

    const assignment = await generateAssignment(aiInput);

    res.status(200).json({ aiInput, assignment });
  } catch (err) {
    res.status(502).json({ message: 'Failed to generate AI assignment', error: err.message });
  }
}
