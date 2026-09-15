/**
 * Sarvam Language & Voice Service for Visions Learn
 *
 * Provides backend integration for:
 * 1. Text Translation (e.g. English -> Tamil/Local Languages for accessible assessments)
 * 2. Speech-to-Text (Transcribing student voice responses)
 *
 * Security:
 * - Reads SARVAM_API_KEY strictly server-side from environment variables.
 * - Never returns, exposes, or logs the API key.
 */

const SARVAM_BASE_URL = 'https://api.sarvam.ai';

/**
 * Maps common language names / aliases to standard BCP-47 codes supported by Sarvam
 */
export const LANGUAGE_CODE_MAP = {
  tamil: 'ta-IN',
  hindi: 'hi-IN',
  telugu: 'te-IN',
  kannada: 'kn-IN',
  malayalam: 'ml-IN',
  marathi: 'mr-IN',
  bengali: 'bn-IN',
  gujarati: 'gu-IN',
  punjabi: 'pa-IN',
  odia: 'od-IN',
  english: 'en-IN',
};

/**
 * Normalizes input language name or code into standard BCP-47 format
 * @param {string} lang
 * @returns {string} Normalized language code
 */
export const normalizeLanguageCode = (lang) => {
  if (!lang || typeof lang !== 'string') return 'en-IN';
  const trimmed = lang.trim();
  const lower = trimmed.toLowerCase();
  if (LANGUAGE_CODE_MAP[lower]) {
    return LANGUAGE_CODE_MAP[lower];
  }
  return trimmed;
};

/**
 * Retrieves the Sarvam API key securely from environment variables
 * @returns {string} The API key
 * @throws {Error} If SARVAM_API_KEY is not configured
 */
const getApiKey = () => {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('SARVAM_API_KEY environment variable is not configured');
  }
  return apiKey.trim();
};

/**
 * Translates text from a source language to a target language using Sarvam AI
 *
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language name or code (e.g. 'English', 'en-IN')
 * @param {string} targetLanguage - Target language name or code (e.g. 'Tamil', 'ta-IN')
 * @returns {Promise<string>} Translated text result
 * @throws {Error} If validation fails or Sarvam API returns an error
 */
export const translateText = async (text, sourceLanguage, targetLanguage) => {
  // Input validation
  if (!text || typeof text !== 'string' || text.trim() === '') {
    throw new Error('Text to translate must be a non-empty string');
  }
  if (!sourceLanguage || typeof sourceLanguage !== 'string' || sourceLanguage.trim() === '') {
    throw new Error('sourceLanguage must be a non-empty string');
  }
  if (!targetLanguage || typeof targetLanguage !== 'string' || targetLanguage.trim() === '') {
    throw new Error('targetLanguage must be a non-empty string');
  }

  const apiKey = getApiKey();
  const sourceCode = normalizeLanguageCode(sourceLanguage);
  const targetCode = normalizeLanguageCode(targetLanguage);

  const payload = {
    input: text.trim(),
    source_language_code: sourceCode,
    target_language_code: targetCode,
    model: 'sarvam-translate:v1',
  };

  try {
    const response = await fetch(`${SARVAM_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMsg = `Sarvam translation failed with status ${response.status}`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed.message) errorMsg = parsed.message;
        else if (parsed.error) errorMsg = parsed.error;
      } catch {
        // Use generic status message if body is not JSON
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();

    if (!data || typeof data.translated_text !== 'string') {
      throw new Error('Invalid response structure received from Sarvam translation API');
    }

    return data.translated_text;
  } catch (err) {
    // Sanitize error message to prevent accidental key exposure
    const safeMessage = err.message.replace(apiKey, '[REDACTED]');
    throw new Error(safeMessage);
  }
};

/**
 * Transcribes audio data to text using Sarvam AI Speech-to-Text API
 *
 * @param {Buffer|Uint8Array|Blob} audioBuffer - Audio data buffer
 * @param {string} [languageCode='en-IN'] - Language code of the spoken audio
 * @returns {Promise<string>} Transcribed text result
 * @throws {Error} If validation fails or Sarvam API returns an error
 */
export const speechToText = async (audioBuffer, languageCode = 'en-IN') => {
  // Input validation
  if (!audioBuffer) {
    throw new Error('Audio data is required for speech-to-text transcription');
  }

  const isBuffer = typeof Buffer !== 'undefined' && Buffer.isBuffer(audioBuffer);
  const isUint8Array = audioBuffer instanceof Uint8Array;
  const isBlob = typeof Blob !== 'undefined' && audioBuffer instanceof Blob;

  if (!isBuffer && !isUint8Array && !isBlob) {
    throw new Error('Audio data must be a Buffer, Uint8Array, or Blob');
  }

  const byteLength = isBlob ? audioBuffer.size : audioBuffer.length;
  if (byteLength === 0) {
    throw new Error('Audio data cannot be empty');
  }

  const apiKey = getApiKey();
  const normalizedLang = normalizeLanguageCode(languageCode);

  const formData = new FormData();

  if (isBlob) {
    formData.append('file', audioBuffer, 'audio.wav');
  } else {
    // Convert Buffer/Uint8Array to Blob for standard FormData
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
    formData.append('file', audioBlob, 'audio.wav');
  }

  formData.append('language_code', normalizedLang);
  formData.append('model', 'saaras:v3');

  try {
    const response = await fetch(`${SARVAM_BASE_URL}/speech-to-text`, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMsg = `Sarvam speech-to-text failed with status ${response.status}`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed.message) errorMsg = parsed.message;
        else if (parsed.error) errorMsg = parsed.error;
      } catch {
        // Use generic status message if body is not JSON
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();

    const transcript = data?.transcript || data?.text;
    if (typeof transcript !== 'string') {
      throw new Error('Invalid response structure received from Sarvam speech-to-text API');
    }

    return transcript;
  } catch (err) {
    // Sanitize error message to prevent accidental key exposure
    const safeMessage = err.message.replace(apiKey, '[REDACTED]');
    throw new Error(safeMessage);
  }
};
