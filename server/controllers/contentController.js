import LearningContent from '../models/LearningContent.js';

// GET /api/content
// Supports optional filtering via query params, e.g. /api/content?subject=Math&grade=5
export async function getContent(req, res) {
  try {
    const { subject, topic, grade, language, difficulty } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;
    if (grade) filter.grade = grade;
    if (language) filter.language = language;
    if (difficulty) filter.difficulty = difficulty;

    const content = await LearningContent.find(filter).sort({ createdAt: -1 });
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch learning content', error: err.message });
  }
}

// POST /api/content
export async function createContent(req, res) {
  try {
    const { subject, topic, grade, language, difficulty, content } = req.body;

    if (!subject || !topic || !grade || !language || !difficulty || !content) {
      return res.status(400).json({
        message: 'subject, topic, grade, language, difficulty and content are all required',
      });
    }

    const newContent = await LearningContent.create({
      subject,
      topic,
      grade,
      language,
      difficulty,
      content,
      createdBy: req.user.id,
    });

    res.status(201).json(newContent);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to create learning content', error: err.message });
  }
}
