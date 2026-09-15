import { getAIProvider } from './aiProviders/index.js';

// Fixed AI input contract agreed by the team. Do not add/remove fields here
// without updating the contract everywhere it's referenced.
const REQUIRED_FIELDS = ['studentId', 'previouslyLearned', 'learningGaps', 'grade', 'language', 'difficulty'];

function buildPrompt(aiInput) {
  const { previouslyLearned, learningGaps, grade, language, difficulty } = aiInput;

  const systemPrompt = `You are the AI Educator Assistant for the Visions Learn platform. You generate a single personalized assignment for one student, based only on their grade, preferred language, identified learning gaps, and what they have previously learned. Respond with ONLY valid JSON (no markdown, no prose) matching exactly this shape:
{
  "title": string,
  "subject": string,
  "topic": string,
  "difficulty": "Easy" | "Medium" | "Hard",
  "language": string,
  "questions": [
    { "question": string, "type": "MCQ" | "Short Answer", "options": string[], "answer": string }
  ]
}
"options" should be an empty array for "Short Answer" questions.`;

  const userPrompt = `Student context:
- Grade: ${grade}
- Preferred language: ${language}
- Requested difficulty: ${difficulty}
- Learning gaps to target (weak areas): ${learningGaps.length ? learningGaps.join(', ') : 'none identified'}
- Previously learned topics: ${previouslyLearned.length ? previouslyLearned.join(', ') : 'none on record'}

Generate 3-5 questions that target the learning gaps above, appropriate for this grade and difficulty, written in the student's preferred language. Respond with JSON only.`;

  return { systemPrompt, userPrompt };
}

function validateAiInput(aiInput) {
  for (const field of REQUIRED_FIELDS) {
    if (aiInput[field] === undefined || aiInput[field] === null) {
      throw new Error(`Missing required AI input field: ${field}`);
    }
  }
}

function validateAssignmentShape(assignment) {
  if (!assignment.title || typeof assignment.title !== 'string') {
    throw new Error('AI response is missing a valid "title"');
  }
  if (!Array.isArray(assignment.questions) || assignment.questions.length === 0) {
    throw new Error('AI response is missing a valid "questions" array');
  }
  for (const q of assignment.questions) {
    if (!q.question || !q.type) {
      throw new Error('AI response contains a malformed question (missing question/type)');
    }
  }
}

// React -> Express -> this service -> AI provider -> this service -> Express -> React.
// React never talks to the AI provider directly, and no API key is ever sent to the client.
export async function generateAssignment(aiInput) {
  validateAiInput(aiInput);

  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildPrompt(aiInput);

  let raw;
  try {
    raw = await provider.generate({ systemPrompt, userPrompt, aiInput });
  } catch (err) {
    throw new Error(`AI provider request failed: ${err.message}`);
  }

  let assignment;
  try {
    assignment = JSON.parse(raw);
  } catch (err) {
    throw new Error('AI provider returned a response that was not valid JSON');
  }

  validateAssignmentShape(assignment);

  return assignment;
}
