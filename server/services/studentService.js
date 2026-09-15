import Student from '../models/Student.js';

// Generate a sequential, human-readable student ID: VL-<YEAR>-<4-digit-seq>
// e.g. VL-2024-0001, VL-2024-0042
async function generateStudentId() {
  const year = new Date().getFullYear();
  const prefix = `VL-${year}-`;
  // Find the highest existing ID for this year to compute next sequence
  const latest = await Student.findOne(
    { studentId: { $regex: `^${prefix}` } },
    { studentId: 1 },
    { sort: { studentId: -1 } }
  );
  let seq = 1;
  if (latest?.studentId) {
    const parts = latest.studentId.split('-');
    seq = parseInt(parts[2], 10) + 1;
  }
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

export const getAllStudents = async (query) => {
  // Allow filtering by cluster or district
  const filter = {};
  if (query.cluster) filter['location.cluster'] = query.cluster;
  if (query.district) filter['location.district'] = query.district;

  return await Student.find(filter);
};

export const createStudent = async (studentData) => {
  const { parentPassword, ...rest } = studentData;

  // Auto-generate student ID
  const studentId = await generateStudentId();

  // Default student password: FirstName (trimmed) + current year
  const firstName = (rest.personal?.name || 'Student').trim().split(' ')[0];
  const year = new Date().getFullYear();
  const defaultStudentPassword = `${firstName}${year}`;

  const student = await Student.create({
    ...rest,
    studentId,
    credentials: {
      studentPassword: defaultStudentPassword,
      parentPassword: parentPassword || undefined,
    },
  });

  // Return credentials in plaintext so the educator can see and share them.
  // These are NOT stored in plaintext — the pre-save hook hashes them.
  return {
    student,
    credentials: {
      studentId,
      studentPassword: defaultStudentPassword,
      parentPassword: parentPassword || null,
    },
  };
};

export const getStudentById = async (id) => {
  return await Student.findById(id);
};

export const updateStudent = async (id, updateData) => {
  return await Student.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
};
