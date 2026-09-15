import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Student from '../models/Student.js';

const SUPPORT_GRADE_THRESHOLD = 50;

// GET /api/parent/student-progress?studentId=...
//
// Assignment completion/topics/support flags are built from data P3 owns
// (Assignment/Submission). Member 2's Assessment/Progress models (overall
// performance, assessment-based learning gaps) live on an unmerged branch
// and can't be imported here yet — once that branch merges, this is the
// place to add an "assessments" section rather than reimplementing P2's
// scoring logic. Student name/grade now come from Member 1's real Student
// model (merged in this integration pass).
export async function getStudentProgress(req, res) {
  try {
    const { studentId } = req.query;

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'A valid studentId query parameter is required' });
    }

    const student = await Student.findById(studentId).select('personal');
    if (!student) {
      return res.status(404).json({ message: 'No student found with that id' });
    }

    const assignments = await Assignment.find({ assignedTo: studentId }).select('title subject topic');
    const submissions = await Submission.find({ student: studentId })
      .sort({ submittedAt: -1 })
      .populate('assignment', 'title subject topic');

    const total = assignments.length;
    const completed = submissions.length;
    const pending = Math.max(total - completed, 0);

    const gradedSubmissions = submissions.filter((s) => s.grade !== undefined && s.grade !== null);
    const averageGrade = gradedSubmissions.length
      ? Math.round(gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length)
      : null;

    const recentTopics = [
      ...new Set(submissions.slice(0, 5).map((s) => s.assignment?.topic || s.assignment?.title).filter(Boolean)),
    ];

    const needsSupport = [
      ...new Set(
        gradedSubmissions
          .filter((s) => s.grade < SUPPORT_GRADE_THRESHOLD)
          .map((s) => s.assignment?.topic || s.assignment?.subject || s.assignment?.title)
          .filter(Boolean)
      ),
    ];

    res.json({
      studentId,
      studentName: student.personal?.name,
      grade: student.personal?.grade,
      assignmentCompletion: { total, completed, pending, averageGrade },
      recentTopics,
      needsSupport,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch student progress', error: err.message });
  }
}
