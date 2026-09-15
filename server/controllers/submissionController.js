import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';

// POST /api/submissions (student only)
export async function createSubmission(req, res) {
  try {
    const { assignmentId, responseText, answers } = req.body;

    if (!assignmentId || (!responseText && !(Array.isArray(answers) && answers.length > 0))) {
      return res.status(400).json({
        message: 'assignmentId and either responseText or answers are required',
      });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // assignedTo/Submission.student reference Student._id, not the student's
    // User._id — req.user.studentProfile is the link (see models/User.js).
    const studentProfileId = req.user.studentProfile ? String(req.user.studentProfile) : null;
    const isAssigned = assignment.assignedTo.some((id) => String(id) === studentProfileId);
    if (!isAssigned) {
      return res.status(403).json({ message: 'This assignment is not assigned to you' });
    }

    const existing = await Submission.findOne({ assignment: assignmentId, student: studentProfileId });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    const submission = await Submission.create({
      assignment: assignmentId,
      student: studentProfileId,
      responseText,
      answers,
    });

    res.status(201).json(submission);
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to submit assignment', error: err.message });
  }
}

// PATCH /api/submissions/:id (educator only — must own the parent assignment)
export async function updateSubmission(req, res) {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const assignment = await Assignment.findById(submission.assignment);
    if (!assignment || String(assignment.createdBy) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to review this submission' });
    }

    const { status, grade, feedback } = req.body;
    if (status !== undefined) submission.status = status;
    if (grade !== undefined) submission.grade = grade;
    if (feedback !== undefined) submission.feedback = feedback;

    await submission.save();
    res.json(submission);
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to update submission', error: err.message });
  }
}
