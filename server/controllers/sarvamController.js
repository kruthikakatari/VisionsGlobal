import { translateText, speechToText } from '../services/sarvamService.js';

/**
 * Controller to handle POST /api/assessments/translate
 */
export const translateAssessmentText = async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body || {};

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ message: 'text is required and must be a non-empty string' });
    }

    if (!sourceLanguage || typeof sourceLanguage !== 'string' || sourceLanguage.trim() === '') {
      return res.status(400).json({ message: 'sourceLanguage is required' });
    }

    if (!targetLanguage || typeof targetLanguage !== 'string' || targetLanguage.trim() === '') {
      return res.status(400).json({ message: 'targetLanguage is required' });
    }

    const translation = await translateText(
      text.trim(),
      sourceLanguage.trim(),
      targetLanguage.trim()
    );

    return res.status(200).json({
      status: 'success',
      data: {
        translation,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Translation service failed',
    });
  }
};

/**
 * Controller to handle POST /api/assessments/speech-to-text
 */
export const transcribeAssessmentVoice = async (req, res) => {
  try {
    let audioBuffer = null;
    let languageCode = null;

    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      const host = req.headers.host || 'localhost';
      const protocol = req.protocol || 'http';
      const url = `${protocol}://${host}${req.originalUrl || req.url}`;

      const webReq = new Request(url, {
        method: req.method,
        headers: req.headers,
        body: req,
        duplex: 'half',
      });

      const formData = await webReq.formData();
      const file = formData.get('file') || formData.get('audio');
      languageCode = formData.get('languageCode') || formData.get('language');

      if (file && typeof file.arrayBuffer === 'function') {
        const arrayBuffer = await file.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuffer);
      }
    } else if (req.body) {
      if (req.body.audioBase64) {
        audioBuffer = Buffer.from(req.body.audioBase64, 'base64');
      }
      languageCode = req.body.languageCode || req.body.language;
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(400).json({ message: 'Audio file is required and cannot be empty' });
    }

    if (!languageCode || typeof languageCode !== 'string' || languageCode.trim() === '') {
      return res.status(400).json({ message: 'languageCode is required' });
    }

    const transcript = await speechToText(audioBuffer, languageCode.trim());

    return res.status(200).json({
      status: 'success',
      data: {
        transcript,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Speech-to-text transcription service failed',
    });
  }
};
