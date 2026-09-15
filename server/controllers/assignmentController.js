import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';

// GET /api/assignments
// Educators see assignments they created; students see assignments given to them.
export async function getAssignments(req, res) {
  try {
    let assignments;
    if (req.user.role === 'educator') {
      assignments = await Assignment.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    } else if (req.user.role === 'student') {
      assignments = await Assignment.find({ assignedTo: req.user.id }).sort({ createdAt: -1 });
    } else {
      assignments = [];
    }
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch assignments', error: err.message });
  }
}

// POST /api/assignments (educator only)
export async function createAssignment(req, res) {
  try {
    const {
      title,
      subject,
      topic,
      description,
      difficulty,
      language,
      dueDate,
      assignedTo,
      sourceContent,
      questions,
      aiGenerated,
    } = req.body;

    const hasQuestions = Array.isArray(questions) && questions.length > 0;

    if (!title || !subject || (!description && !hasQuestions) || !Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({
        message:
          'title, subject, assignedTo (at least one student id), and either description or questions are required',
      });
    }

    const assignment = await Assignment.create({
      title,
      subject,
      topic,
      description: description || `AI-generated assignment with ${questions.length} question(s).`,
      difficulty,
      language,
      dueDate,
      assignedTo,
      sourceContent: sourceContent || undefined,
      questions: hasQuestions ? questions : undefined,
      aiGenerated: Boolean(aiGenerated),
      createdBy: req.user.id,
    });

    res.status(201).json(assignment);
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to create assignment', error: err.message });
  }
}

// GET /api/assignments/:id
// Returns the assignment plus role-appropriate submission info:
//   - the owning educator gets every submission for review
//   - an assigned student gets only their own submission (if any)
export async function getAssignmentById(req, res) {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const isOwnerEducator = req.user.role === 'educator' && String(assignment.createdBy) === req.user.id;
    const isAssignedStudent =
      req.user.role === 'student' && assignment.assignedTo.some((id) => String(id) === req.user.id);

    if (!isOwnerEducator && !isAssignedStudent) {
      return res.status(403).json({ message: 'Not authorized to view this assignment' });
    }

    if (isOwnerEducator) {
      const submissions = await Submission.find({ assignment: assignment._id }).sort({ submittedAt: -1 });
      return res.json({ assignment, submissions });
    }

    const mySubmission = await Submission.findOne({ assignment: assignment._id, student: req.user.id });
    return res.json({ assignment, mySubmission });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid assignment id' });
    }
    res.status(500).json({ message: 'Failed to fetch assignment', error: err.message });
  }
}
