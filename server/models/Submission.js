import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    // Soft reference to Member 1's Student model — Student._id.
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    responseText: {
      type: String,
    },
    // Optional structured answers, useful once AI-generated MCQ assignments (Phase 5)
    // need per-question answers rather than one freeform block of text.
    answers: [
      {
        question: String,
        answer: String,
      },
    ],
    status: {
      type: String,
      enum: ['Submitted', 'Reviewed'],
      default: 'Submitted',
    },
    grade: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One submission per student per assignment.
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);
