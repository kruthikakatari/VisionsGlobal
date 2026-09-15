import Student from '../models/Student.js';

// Strict 24-hex-char check. Deliberately NOT mongoose.Types.ObjectId.isValid()
// — that also accepts any 12-character string as "valid" (it's willing to
// build an ObjectId from 12 raw bytes), and studentId codes like
// "VL-2024-0042" are exactly 12 characters. That gotcha would misroute a
// real studentId into findById() below.
const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

// There are now two ways to identify a student:
//   - the internal MongoDB _id (what Assignment.assignedTo/Submission.student
//     actually store, and what P3's original endpoints expected)
//   - the human-readable studentId (e.g. "VL-2024-0042") that Member 1's
//     credential system generates and that real users actually see/type
// Accept either everywhere a caller supplies "a student id", so the
// confusion between the two doesn't leak into the UI.
export async function resolveStudent(idOrCode) {
  if (!idOrCode) return null;

  if (OBJECT_ID_RE.test(idOrCode)) {
    const byId = await Student.findById(idOrCode);
    if (byId) return byId;
  }

  return Student.findOne({ studentId: idOrCode });
}
