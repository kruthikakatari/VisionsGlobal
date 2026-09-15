import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';

// ⚠️ TEMPORARY — owned by Member 1 (User/Student/Educator auth).
//
// Students have no credentials of their own in Member 1's Student model
// (no email/password — it's a profile record educators manage). This is a
// minimal stand-in login so the Phase 4/5 student submission flow works
// with a real, DB-backed session instead of hand-crafted JWTs:
//   1. Verify the given studentId is a real Student record.
//   2. Find-or-create a User with role 'student' and studentProfile set
//      to that Student's _id (a synthetic email/password satisfy User's
//      schema requirements — nobody ever logs in with them).
//   3. Sign a token the real authMiddleware.js protect() can verify
//      (payload is just { id }, matching authController.js's signToken —
//      role comes from the DB lookup, same as every other login).
//
// There is still no real credential check — anyone who knows/guesses a
// studentId can "log in" as that student. DELETE this once the team adds
// a real student credential, and point the frontend at their login instead.
export async function studentLogin(req, res) {
  try {
    const { studentId } = req.body;

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'A valid studentId is required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'No student found with that id' });
    }

    let user = await User.findOne({ studentProfile: studentId, role: 'student' });

    if (!user) {
      user = await User.create({
        name: student.personal?.name || `Student ${studentId}`,
        email: `student-${studentId}@visionslearn.local`,
        password: new mongoose.Types.ObjectId().toString(), // random, never used to log in
        role: 'student',
        studentProfile: studentId,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '90d',
    });

    // User.create() returns the password field regardless of `select: false`
    // (that only applies to queries) — strip it, matching authController.js's
    // createSendToken().
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: { user },
    });
  } catch (err) {
    res.status(500).json({ message: 'Student login failed', error: err.message });
  }
}
