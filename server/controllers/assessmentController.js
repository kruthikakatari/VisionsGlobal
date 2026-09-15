import mongoose from 'mongoose';
import {
  createAssessmentService,
  getStudentAssessmentsService,
  getStudentProgressService,
} from '../services/assessmentService.js';

/**
 * Controller to handle POST /api/assessments
 */
export const createAssessment = async (req, res) => {
  try {
    const {
      studentId,
      language,
      verbalFluency,
      cognitiveAbility,
      readingComprehension,
      writtenCommunication,
    } = req.body;

    // Validate studentId
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'Invalid student ID format' });
    }

    // Validate language
    if (!language || typeof language !== 'string' || language.trim() === '') {
      return res.status(400).json({ message: 'language is required' });
    }

    // Helper to validate score fields
    const isScoreValid = (val) => typeof val === 'number' && Number.isFinite(val);

    if (verbalFluency === undefined || verbalFluency === null || !isScoreValid(verbalFluency)) {
      return res.status(400).json({ message: 'verbalFluency must be a valid number' });
    }
    if (cognitiveAbility === undefined || cognitiveAbility === null || !isScoreValid(cognitiveAbility)) {
      return res.status(400).json({ message: 'cognitiveAbility must be a valid number' });
    }
    if (readingComprehension === undefined || readingComprehension === null || !isScoreValid(readingComprehension)) {
      return res.status(400).json({ message: 'readingComprehension must be a valid number' });
    }
    if (writtenCommunication === undefined || writtenCommunication === null || !isScoreValid(writtenCommunication)) {
      return res.status(400).json({ message: 'writtenCommunication must be a valid number' });
    }

    const { assessment } = await createAssessmentService({
      studentId,
      language: language.trim(),
      verbalFluency,
      cognitiveAbility,
      readingComprehension,
      writtenCommunication,
    });

    return res.status(201).json({
      status: 'success',
      data: {
        assessment,
      },
    });
  } catch (error) {
    if (error.statusCode === 400 || error.statusCode === 404) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Controller to handle GET /api/students/:id/assessments
 */
export const getStudentAssessments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const assessments = await getStudentAssessmentsService(id);

    return res.status(200).json({
      status: 'success',
      data: {
        assessments,
      },
    });
  } catch (error) {
    if (error.statusCode === 400 || error.statusCode === 404) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Controller to handle GET /api/students/:id/progress
 */
export const getStudentProgress = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const progress = await getStudentProgressService(id);

    return res.status(200).json({
      status: 'success',
      data: {
        progress: progress || null,
      },
    });
  } catch (error) {
    if (error.statusCode === 400 || error.statusCode === 404) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};
