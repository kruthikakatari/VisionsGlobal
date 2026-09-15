import mongoose from 'mongoose';
import Assessment from '../models/Assessment.js';
import Progress from '../models/Progress.js';

/**
 * Helper to retrieve Student model instance registered with Mongoose
 */
const getStudentModel = () => {
  if (mongoose.models.Student) {
    return mongoose.models.Student;
  }
  return mongoose.model('Student');
};

/**
 * Service to create a new Assessment and update/create student's Progress
 * @param {Object} assessmentData
 * @returns {Promise<Object>} Created assessment and updated progress
 */
export const createAssessmentService = async (assessmentData) => {
  const {
    studentId,
    language,
    verbalFluency,
    cognitiveAbility,
    readingComprehension,
    writtenCommunication,
  } = assessmentData;

  // Validate studentId ObjectId format
  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    const error = new Error('Invalid student ID format');
    error.statusCode = 400;
    throw error;
  }

  // Verify that the Student exists
  const Student = getStudentModel();
  const student = await Student.findById(studentId);
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  // 1. Create and save Assessment document adhering to frozen schema
  const assessment = new Assessment({
    student: studentId,
    language,
    verbalFluency,
    cognitiveAbility,
    readingComprehension,
    writtenCommunication,
    // assessedAt uses schema default (Date.now)
  });

  const savedAssessment = await assessment.save();

  // 2. Find and update or create Progress document for this student
  let progress = await Progress.findOne({ student: studentId });

  if (!progress) {
    progress = new Progress({
      student: studentId,
      verbalFluency,
      cognitiveAbility,
      readingComprehension,
      writtenCommunication,
      learningGaps: [],
      updatedAt: new Date(),
    });
  } else {
    progress.verbalFluency = verbalFluency;
    progress.cognitiveAbility = cognitiveAbility;
    progress.readingComprehension = readingComprehension;
    progress.writtenCommunication = writtenCommunication;
    progress.learningGaps = [];
    progress.updatedAt = new Date();
  }

  const savedProgress = await progress.save();

  return {
    assessment: savedAssessment,
    progress: savedProgress,
  };
};

/**
 * Service to retrieve assessment history for a student
 * @param {string} studentId
 * @returns {Promise<Array>} List of assessment documents
 */
export const getStudentAssessmentsService = async (studentId) => {
  // Validate studentId ObjectId format
  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    const error = new Error('Invalid student ID');
    error.statusCode = 400;
    throw error;
  }

  // Verify Student exists
  const Student = getStudentModel();
  const student = await Student.findById(studentId);
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  const assessments = await Assessment.find({ student: studentId }).sort({ assessedAt: -1 });
  return assessments;
};

/**
 * Service to retrieve the current Progress record for a student
 * @param {string} studentId
 * @returns {Promise<Object|null>} Progress document or null
 */
export const getStudentProgressService = async (studentId) => {
  // Validate studentId ObjectId format
  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    const error = new Error('Invalid student ID');
    error.statusCode = 400;
    throw error;
  }

  // Verify Student exists
  const Student = getStudentModel();
  const student = await Student.findById(studentId);
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  const progress = await Progress.findOne({ student: studentId });
  return progress;
};
