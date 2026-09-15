import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  durationMinutes: { type: Number, required: true },
  topic: { type: String, required: true },
  studentsAttended: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  notes: { type: String }
});

const educatorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    // Array of cluster names this educator is responsible for
    assignedClusters: {
      type: [String],
      default: []
    },
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      }
    ],
    sessions: [sessionSchema]
  },
  {
    timestamps: true
  }
);

const Educator = mongoose.model('Educator', educatorSchema);
export default Educator;
