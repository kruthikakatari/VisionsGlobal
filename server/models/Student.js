import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const studentSchema = new mongoose.Schema(
  {
    // Human-readable student ID: VL-<YEAR>-<4-digit-seq>, e.g. VL-2024-0042
    // Auto-generated on creation; safe to print and share with students/parents.
    studentId: {
      type: String,
      unique: true,
      sparse: true, // allow existing docs without it
    },

    // Login credentials (hashed). Never returned by default.
    credentials: {
      // Student logs in with: studentId + studentPassword
      // Default: FirstName + enrollmentYear, e.g. "Aarav2024"
      studentPassword: { type: String, select: false },
      // Parent logs in with: studentId + parentPassword (set by educator)
      parentPassword: { type: String, select: false },
    },

    // Personal Information
    personal: {
      name: { type: String, required: true },
      age: { type: Number, required: true },
      gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], required: true },
      grade: { type: String, required: true },
      preferredLanguage: { type: String, default: 'Tamil' }
    },
    // Academic Information
    academic: {
      school: { type: String, required: true },
      enrollmentDate: { type: Date, default: Date.now },
      currentLevel: { type: String, required: true }, // e.g., Beginner, Intermediate
      enrollmentStatus: { type: String, enum: ['Active', 'Inactive', 'Graduated'], default: 'Active' }
    },
    // Family Background (Stored as context only, must not influence scoring)
    familyBackground: {
      parentGuardianName: { type: String, required: true },
      householdInformation: { type: String }, // e.g., single parent, joint family
      parentOccupation: { type: String },
      familyIncomeRange: { type: String },
      numberOfFamilyMembers: { type: Number },
      educationBackground: { type: String }, // e.g., first generation learner
      otherSupportFactors: { type: String }
    },
    // Location
    location: {
      district: { type: String, required: true },
      cluster: { type: String, required: true },
      villageArea: { type: String, required: true }
    }
  },
  {
    timestamps: true
  }
);

// Hash credential passwords whenever they are modified
studentSchema.pre('save', async function () {
  if (this.isModified('credentials.studentPassword') && this.credentials?.studentPassword) {
    this.credentials.studentPassword = await bcrypt.hash(this.credentials.studentPassword, 12);
  }
  if (this.isModified('credentials.parentPassword') && this.credentials?.parentPassword) {
    this.credentials.parentPassword = await bcrypt.hash(this.credentials.parentPassword, 12);
  }
});

// Instance method: verify a candidate password against stored hash
studentSchema.methods.verifyStudentPassword = async function (candidate) {
  return bcrypt.compare(candidate, this.credentials.studentPassword);
};
studentSchema.methods.verifyParentPassword = async function (candidate) {
  return bcrypt.compare(candidate, this.credentials.parentPassword);
};

const Student = mongoose.model('Student', studentSchema);
export default Student;
