import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  language: {
    type: String,
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
  assessedAt: {
    type: Date,
    default: Date.now,
  },
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;
