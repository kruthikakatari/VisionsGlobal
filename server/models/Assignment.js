import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description/instructions are required'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
    },
    language: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    // Students this assignment is given to (Member 1's Student._id).
    assignedTo: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Assignment must be assigned to at least one student',
      },
    },
    // Optional link back to the Content Library item this assignment was built from.
    sourceContent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningContent',
    },
    // The educator (User) who created this assignment — see the identical
    // note in models/LearningContent.js on why this is ref: 'User', not 'Educator'.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Set true for assignments produced by the AI Educator Assistant.
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    // Structured questions (used by AI-generated assignments so the frontend
    // can render them directly instead of parsing free text). Optional —
    // manually-created assignments can rely on `description` alone.
    questions: [
      {
        question: { type: String, required: true },
        type: { type: String, enum: ['MCQ', 'Short Answer'], default: 'Short Answer' },
        options: [String],
        answer: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Assignment', assignmentSchema);
