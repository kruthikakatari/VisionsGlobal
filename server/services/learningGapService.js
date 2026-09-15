/**
 * Learning Gap Detection Service for Visions Learn Assessment & Personalized Learning Module
 * Identifies learning gaps deterministically based on assessment scores.
 *
 * Frozen Business Rule:
 * - score < 50  -> learning gap
 * - score >= 50 -> no learning gap (score of exactly 50 is NOT a learning gap)
 */

export const GAP_THRESHOLD = 50;

export const ASSESSMENT_AREAS = [
  'verbalFluency',
  'cognitiveAbility',
  'readingComprehension',
  'writtenCommunication',
];

/**
 * Detects learning gaps across the four core assessment areas.
 *
 * @param {Object} scores - Object containing scores for all four areas
 * @param {number} scores.verbalFluency - Score between 0 and 100
 * @param {number} scores.cognitiveAbility - Score between 0 and 100
 * @param {number} scores.readingComprehension - Score between 0 and 100
 * @param {number} scores.writtenCommunication - Score between 0 and 100
 * @returns {string[]} Array of assessment area names whose score is below 50
 * @throws {Error} If scores object is missing or any score is not a finite number between 0 and 100
 */
export const detectLearningGaps = (scores) => {
  if (!scores || typeof scores !== 'object') {
    throw new Error('scores object is required');
  }

  const learningGaps = [];

  for (const area of ASSESSMENT_AREAS) {
    const score = scores[area];

    if (
      typeof score !== 'number' ||
      !Number.isFinite(score) ||
      score < 0 ||
      score > 100
    ) {
      throw new Error(
        `Invalid score for '${area}': must be a finite number between 0 and 100 (received: ${score})`
      );
    }

    // Frozen Rule: score strictly less than 50 indicates a learning gap
    if (score < GAP_THRESHOLD) {
      learningGaps.push(area);
    }
  }

  return learningGaps;
};
