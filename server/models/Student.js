import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
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

const Student = mongoose.model('Student', studentSchema);
export default Student;
