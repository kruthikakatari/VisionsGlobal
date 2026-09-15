import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret-for-dev-only-change-in-prod', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });

/**
 * Find-or-create a User record for the given student, then issue a JWT.
 * This keeps the rest of the app's auth middleware (protect / restrictTo)
 * working without changes — they all resolve role from the User collection.
 */
async function issueTokenForStudent(student, role) {
  let user = await User.findOne({ studentProfile: student._id, role });

  if (!user) {
    user = await User.create({
      name: student.personal?.name || student.studentId,
      // Synthetic email — never used to log in
      email: `${role}-${student.studentId}@visionslearn.local`,
      // Random throwaway password (bcrypt hashed internally by User pre-save)
      password: Math.random().toString(36).slice(-12) + 'Aa1!',
      role,
      studentProfile: student._id,
    });
  }

  const token = signToken(user._id);
  user.password = undefined;
  return { token, user };
}

/**
 * POST /api/auth/student-login
 * Body: { studentId, password }
 *
 * Replaces the old ObjectId-only login. Students log in with their
 * human-readable studentId (e.g. VL-2024-0042) and their password
 * (default: FirstName + year, e.g. Aarav2024).
 */
export async function studentLogin(req, res) {
  try {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      return res.status(400).json({ message: 'Student ID and password are required.' });
    }

    // Fetch student + credentials (select: false by default)
    const student = await Student.findOne({ studentId })
      .select('+credentials.studentPassword');

    if (!student || !student.credentials?.studentPassword) {
      return res.status(401).json({ message: 'Invalid Student ID or password.' });
    }

    const isValid = await student.verifyStudentPassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid Student ID or password.' });
    }

    const { token, user } = await issueTokenForStudent(student, 'student');

    res.status(200).json({ status: 'success', token, data: { user } });
  } catch (err) {
    res.status(500).json({ message: 'Student login failed.', error: err.message });
  }
}

/**
 * POST /api/auth/parent-login
 * Body: { studentId, password }
 *
 * Parents log in using the same studentId as their child plus the
 * parent password that the educator set when registering the student.
 */
export async function parentLogin(req, res) {
  try {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      return res.status(400).json({ message: 'Student ID and password are required.' });
    }

    const student = await Student.findOne({ studentId })
      .select('+credentials.parentPassword');

    if (!student || !student.credentials?.parentPassword) {
      return res.status(401).json({ message: 'Invalid Student ID or password.' });
    }

    const isValid = await student.verifyParentPassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid Student ID or password.' });
    }

    const { token, user } = await issueTokenForStudent(student, 'parent');

    res.status(200).json({ status: 'success', token, data: { user } });
  } catch (err) {
    res.status(500).json({ message: 'Parent login failed.', error: err.message });
  }
}
