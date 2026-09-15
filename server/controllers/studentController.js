import * as studentService from '../services/studentService.js';

export const getStudents = async (req, res) => {
  try {
    const students = await studentService.getAllStudents(req.query);
    res.status(200).json({
      status: 'success',
      results: students.length,
      data: { students }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { student, credentials } = await studentService.createStudent(req.body);
    res.status(201).json({
      status: 'success',
      data: { student, credentials }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

export const getStudent = async (req, res) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({
        status: 'fail',
        message: 'No student found with that ID'
      });
    }
    res.status(200).json({
      status: 'success',
      data: { student }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    if (!student) {
      return res.status(404).json({
        status: 'fail',
        message: 'No student found with that ID'
      });
    }
    res.status(200).json({
      status: 'success',
      data: { student }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
