// Deterministic offline AI provider — no API key required. This is the
// DEFAULT provider (see ../aiProviders/index.js) so the whole AI Assistant
// pipeline is demoable/testable before the team has picked or paid for a
// real AI API. Swap it out purely via the AI_PROVIDER env var.

const GAP_SUBJECT_MAP = {
  verbalFluency: 'Language',
  cognitiveAbility: 'Logical Reasoning',
  readingComprehension: 'English',
  writtenCommunication: 'English',
};

export async function generate({ aiInput }) {
  const { learningGaps = [], grade, language, difficulty, previouslyLearned = [] } = aiInput;

  const focusArea = learningGaps[0] || previouslyLearned[0] || 'General Practice';
  const subject = GAP_SUBJECT_MAP[learningGaps[0]] || 'General Studies';

  const assignment = {
    title: `${focusArea} Practice`,
    subject,
    topic: focusArea,
    difficulty: difficulty || 'Medium',
    language: language || 'English',
    questions: [
      {
        question: `[Stub AI] A ${difficulty || 'Medium'} question about ${focusArea} for a grade ${grade || 'N/A'} student.`,
        type: 'Short Answer',
        options: [],
        answer: 'Sample answer — replace stubProvider with a real AI_PROVIDER to generate real content.',
      },
      {
        question: `[Stub AI] A second ${focusArea} question, multiple choice.`,
        type: 'MCQ',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: 'Option A',
      },
    ],
  };

  return JSON.stringify(assignment);
}
