import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import { resolveStudent } from '../utils/resolveStudent.js';

const SUPPORT_GRADE_THRESHOLD = 50;

// GET /api/parent/student-progress?studentId=...
//
// studentId accepts either the internal Mongo _id or the human-readable
// studentId (e.g. "VL-2024-0042") a real parent would actually have — see
// utils/resolveStudent.js.
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
    const { studentId: studentIdParam } = req.query;
    const linkedStudentId = req.user.studentProfile ? String(req.user.studentProfile) : null;

    if (!studentIdParam && !linkedStudentId) {
      return res.status(400).json({ message: 'A studentId query parameter is required' });
    }

    const student = await resolveStudent(studentIdParam || linkedStudentId);
    if (!student) {
      return res.status(404).json({ message: 'No student found with that id' });
    }

    // A parent who logged in via studentId + parent password is linked to
    // exactly one student (req.user.studentProfile) — reject any attempt to
    // view a different one. A parent-role account with no linked student
    // (old email+password flow) isn't restricted, since there's nothing to
    // check against.
    if (linkedStudentId && String(student._id) !== linkedStudentId) {
      return res.status(403).json({ message: 'You can only view your own linked student' });
    }

    const assignments = await Assignment.find({ assignedTo: student._id }).select('title subject topic');
    const submissions = await Submission.find({ student: student._id })
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
      studentId: student.studentId || String(student._id),
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
