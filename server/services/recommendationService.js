/**
 * Recommendation Service for Visions Learn Assessment & Personalized Learning Module
 * Generates deterministic recommendation metadata based on detected learning gaps for Person 3.
 */

export const RECOMMENDATION_RULES = {
  verbalFluency: {
    area: 'verbalFluency',
    priority: 'high',
    suggestedActivity: 'speaking, vocabulary and verbal expression exercises',
    suggestedDifficulty: 'easy',
  },
  cognitiveAbility: {
    area: 'cognitiveAbility',
    priority: 'high',
    suggestedActivity: 'logical reasoning and pattern-based exercises',
    suggestedDifficulty: 'easy',
  },
  readingComprehension: {
    area: 'readingComprehension',
    priority: 'high',
    suggestedActivity: 'reading passages and comprehension questions',
    suggestedDifficulty: 'easy',
  },
  writtenCommunication: {
    area: 'writtenCommunication',
    priority: 'high',
    suggestedActivity: 'guided writing and sentence construction exercises',
    suggestedDifficulty: 'easy',
  },
};

export const VALID_GAP_AREAS = Object.keys(RECOMMENDATION_RULES);

/**
 * Generates recommendation metadata based on an array of learning gaps.
 *
 * @param {string[]} learningGaps - Array of learning gap area names
 * @returns {Array<Object>} Deterministic list of recommendation metadata objects
 * @throws {Error} If learningGaps is not an array or contains invalid area names
 */
export const getRecommendations = (learningGaps) => {
  if (!Array.isArray(learningGaps)) {
    throw new Error('learningGaps must be an array');
  }

  if (learningGaps.length === 0) {
    return [];
  }

  const recommendations = [];
  const seenGaps = new Set();

  for (const gap of learningGaps) {
    if (typeof gap !== 'string' || !RECOMMENDATION_RULES[gap]) {
      throw new Error(
        `Invalid learning gap '${gap}'. Must be one of: ${VALID_GAP_AREAS.join(', ')}`
      );
    }

    // Preserve order while deduplicating
    if (!seenGaps.has(gap)) {
      seenGaps.add(gap);
      recommendations.push({ ...RECOMMENDATION_RULES[gap] });
    }
  }

  return recommendations;
};
