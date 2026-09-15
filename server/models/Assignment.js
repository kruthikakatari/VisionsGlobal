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
    // Students this assignment is given to. Soft reference to Member 1's
    // Student model (ObjectId only — model does not need to exist to store this).
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Educator',
      required: true,
    },
    // Set true for assignments produced by the AI Educator Assistant (Phase 5).
    aiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Assignment', assignmentSchema);
