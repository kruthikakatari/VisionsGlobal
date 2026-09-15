import mongoose from 'mongoose';
import Educator from '../models/Educator.js';
import Student from '../models/Student.js';

export const getAllEducators = async () => {
  return await Educator.find().populate('user', 'name email role');
};

export const getEducatorById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;

  let educator = await Educator.findOne({
    $or: [{ _id: id }, { user: id }]
  })
    .populate('user', 'name email role')
    .populate('assignedStudents');

  // If educator profile doesn't exist yet for this user, auto-create one
  if (!educator) {
    try {
      const students = await Student.find().limit(10);
      educator = await Educator.create({
        user: id,
        assignedClusters: ['North', 'Central'],
        assignedStudents: students.map((s) => s._id)
      });
      educator = await Educator.findById(educator._id)
        .populate('user', 'name email role')
        .populate('assignedStudents');
    } catch {
      // If user is not found or already created concurrently
      educator = await Educator.findOne({ user: id })
        ?.populate('user', 'name email role')
        ?.populate('assignedStudents');
    }
  }

  return educator;
};

export const addSession = async (educatorId, sessionData) => {
  const educator = await Educator.findOne({
    $or: [{ _id: educatorId }, { user: educatorId }]
  });
  if (!educator) throw new Error('Educator not found');

  educator.sessions.push(sessionData);
  await educator.save();
  return educator;
};

export const getSessions = async (educatorId) => {
  const educator = await Educator.findOne({
    $or: [{ _id: educatorId }, { user: educatorId }]
  }).populate('sessions.studentsAttended', 'personal.name');
  if (!educator) throw new Error('Educator not found');
  return educator.sessions;
};
