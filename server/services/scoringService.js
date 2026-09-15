/**
 * Scoring Service for Visions Learn Assessment & Personalized Learning Module
 * Provides deterministic scoring calculation for the four core assessment areas.
 */

/**
 * Calculates a section score based on correct answers and total questions.
 * Formula: score = Math.round((correctAnswers / totalQuestions) * 100)
 *
 * Validation Rules:
 * - totalQuestions must be greater than 0
 * - correctAnswers must be >= 0
 * - correctAnswers must be <= totalQuestions
 * - final score must always be between 0 and 100
 *
 * @param {number} correctAnswers - Number of correct answers (>= 0 and <= totalQuestions)
 * @param {number} totalQuestions - Total number of questions (> 0)
 * @returns {number} Rounded integer score between 0 and 100
 * @throws {Error} If input values are invalid
 */
export const calculateSectionScore = (correctAnswers, totalQuestions) => {
  if (
    typeof totalQuestions !== 'number' ||
    !Number.isFinite(totalQuestions) ||
    totalQuestions <= 0
  ) {
    throw new Error('totalQuestions must be a valid number greater than 0');
  }

  if (
    typeof correctAnswers !== 'number' ||
    !Number.isFinite(correctAnswers) ||
    correctAnswers < 0
  ) {
    throw new Error('correctAnswers must be a valid number greater than or equal to 0');
  }

  if (correctAnswers > totalQuestions) {
    throw new Error('correctAnswers cannot exceed totalQuestions');
  }

  const rawScore = (correctAnswers / totalQuestions) * 100;
  const roundedScore = Math.round(rawScore);

  // Guarantee final score is constrained between 0 and 100
  return Math.min(100, Math.max(0, roundedScore));
};

/**
 * Calculates deterministic scores for all four assessment areas:
 * 1. verbalFluency
 * 2. cognitiveAbility
 * 3. readingComprehension
 * 4. writtenCommunication
 *
 * @param {Object} sections - Object containing input for each section
 * @param {Object} sections.verbalFluency - { correctAnswers, totalQuestions }
 * @param {Object} sections.cognitiveAbility - { correctAnswers, totalQuestions }
 * @param {Object} sections.readingComprehension - { correctAnswers, totalQuestions }
 * @param {Object} sections.writtenCommunication - { correctAnswers, totalQuestions }
 * @returns {Object} Object with rounded integer scores for each section
 * @throws {Error} If sections object or any section inputs are missing or invalid
 */
export const calculateAssessmentScores = (sections) => {
  if (!sections || typeof sections !== 'object') {
    throw new Error('sections object must be provided');
  }

  const requiredSections = [
    'verbalFluency',
    'cognitiveAbility',
    'readingComprehension',
    'writtenCommunication',
  ];

  const scores = {};

  for (const sectionName of requiredSections) {
    const sectionData = sections[sectionName];
    if (!sectionData || typeof sectionData !== 'object') {
      throw new Error(`Section '${sectionName}' is required with { correctAnswers, totalQuestions }`);
    }

    const { correctAnswers, totalQuestions } = sectionData;
    scores[sectionName] = calculateSectionScore(correctAnswers, totalQuestions);
  }

  return scores;
};
