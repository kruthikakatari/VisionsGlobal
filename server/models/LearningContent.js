import mongoose from 'mongoose';

const learningContentSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      trim: true,
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: ['Easy', 'Medium', 'Hard'],
    },
    content: {
      type: String,
      required: [true, 'Content/material is required'],
    },
    // The educator (User) who created this content. controllers/contentController.js
    // sets this from req.user.id (the real User._id, not Member 1's separate
    // Educator._id — Educator.user links to User, they're different ids),
    // so ref: 'User' is what actually resolves correctly on populate.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('LearningContent', learningContentSchema);
