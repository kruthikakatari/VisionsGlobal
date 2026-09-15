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
    // References the educator (Member 1's Educator/User model) who created this
    // content. Soft reference — the Educator model does not need to exist yet
    // for this to work; it's only resolved if something calls .populate('createdBy').
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Educator',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('LearningContent', learningContentSchema);
