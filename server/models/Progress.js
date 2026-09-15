import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  verbalFluency: {
    type: Number,
    required: true,
  },
  cognitiveAbility: {
    type: Number,
    required: true,
  },
  readingComprehension: {
    type: Number,
    required: true,
  },
  writtenCommunication: {
    type: Number,
    required: true,
  },
  learningGaps: [String],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
