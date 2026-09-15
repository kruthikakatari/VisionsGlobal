import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// ⚠️ TEMPORARY — owned by Member 1 (User/Student/Educator auth).
//
// Member 1's real login (feature/student-educator-core, server/controllers/
// authController.js) only supports educator/leadership/parent accounts via
// email+password — their User.role enum has no 'student' value, and their
// Student model has no credential fields at all (students are profile
// records educators manage, not authenticated users).
//
// This is a minimal stand-in so the Phase 4/5 student submission flow is
// testable through a real login instead of hand-crafted JWTs. It does NOT
// verify the studentId against a real Student record — Member 1's Student
// model isn't merged into this branch — so anyone who knows/guesses a
// studentId can "log in" as that student. That's a deliberate, known
// simplification, not an oversight.
//
// DELETE this once the team adds a real student credential to Member 1's
// User/Student model, and point the frontend at their login endpoint instead.
export function studentLogin(req, res) {
  const { studentId } = req.body;

  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ message: 'A valid studentId is required' });
  }

  const token = jwt.sign({ id: studentId, role: 'student' }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.status(200).json({ token, user: { id: studentId, role: 'student' } });
}
