import mongoose from 'mongoose';
import Submission from '../models/Submission.js';
import Student from '../models/Student.js';
import { generateAssignment } from '../services/aiAssignmentService.js';

// "previouslyLearned" is a P3-owned field, and P3 already has the data for
// it (the student's own submission/assignment history) — so it's derived
// here rather than fetched over HTTP from another member's branch.
//
// learningGaps (P2's domain) is NOT re-derived here: by the time an educator
// opens the AI Assistant for a student, the frontend has already loaded that
// student's learning gaps from P2's screens, so it passes them straight
// through. grade/language, however, now come from Member 1's real Student
// record (see generateAiAssignment below) now that it's merged in — more
// authoritative than trusting whatever the frontend happens to send.
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
    const { studentId, learningGaps, difficulty } = req.body;

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'A valid studentId is required' });
    }
    if (!difficulty) {
      return res.status(400).json({ message: 'difficulty is required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'No student found with that id' });
    }

    const previouslyLearned = await getPreviouslyLearned(studentId);

    const aiInput = {
      studentId,
      previouslyLearned,
      learningGaps: Array.isArray(learningGaps) ? learningGaps : [],
      grade: student.personal?.grade,
      language: student.personal?.preferredLanguage,
      difficulty,
    };

    const assignment = await generateAssignment(aiInput);

    res.status(200).json({ aiInput, assignment });
  } catch (err) {
    res.status(502).json({ message: 'Failed to generate AI assignment', error: err.message });
  }
}
