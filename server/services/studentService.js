import Student from '../models/Student.js';

export const getAllStudents = async (query) => {
  // Allow filtering by cluster or district
  const filter = {};
  if (query.cluster) filter['location.cluster'] = query.cluster;
  if (query.district) filter['location.district'] = query.district;

  return await Student.find(filter);
};

export const createStudent = async (studentData) => {
  return await Student.create(studentData);
};

export const getStudentById = async (id) => {
  return await Student.findById(id);
};

export const updateStudent = async (id, updateData) => {
  return await Student.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
};
