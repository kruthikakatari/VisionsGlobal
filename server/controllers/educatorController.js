import * as educatorService from '../services/educatorService.js';

export const getEducators = async (req, res) => {
  try {
    const educators = await educatorService.getAllEducators();
    res.status(200).json({
      status: 'success',
      results: educators.length,
      data: { educators }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

export const getEducator = async (req, res) => {
  try {
    const educator = await educatorService.getEducatorById(req.params.id);
    if (!educator) {
      return res.status(404).json({
        status: 'fail',
        message: 'No educator found with that ID'
      });
    }

    // If it's an educator requesting, ensure they are requesting their own profile
    const userId = educator.user?._id ? educator.user._id.toString() : educator.user?.toString();
    if (req.user.role === 'educator' && req.user._id.toString() !== userId && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only view your own profile'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { educator }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

export const createSession = async (req, res) => {
  try {
    const educator = await educatorService.addSession(req.params.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { session: educator.sessions[educator.sessions.length - 1] }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await educatorService.getSessions(req.params.id);
    res.status(200).json({
      status: 'success',
      results: sessions.length,
      data: { sessions }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
