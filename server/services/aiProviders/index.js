import * as stubProvider from './stubProvider.js';
import * as openaiProvider from './openaiProvider.js';

const providers = {
  stub: stubProvider,
  openai: openaiProvider,
};

// Reads AI_PROVIDER from env; defaults to the offline stub so the whole
// pipeline works with zero setup. Switching providers is purely a config
// change — no code in aiAssignmentService.js or the AI route needs to change.
export function getAIProvider() {
  const name = process.env.AI_PROVIDER || 'stub';
  const provider = providers[name];

  if (!provider) {
    throw new Error(`Unknown AI_PROVIDER "${name}". Available: ${Object.keys(providers).join(', ')}`);
  }

  return provider;
}
