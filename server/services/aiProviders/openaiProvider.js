// Real-provider TEMPLATE using OpenAI's Chat Completions API in JSON mode.
// Not used unless the team sets AI_PROVIDER=openai and OPENAI_API_KEY in
// server/.env — see server/.env.example. Kept dependency-free (uses the
// built-in fetch, Node 18+) since the team hasn't finalized a provider yet.
//
// To add another provider (Anthropic, Gemini, etc.), copy this file's
// shape — export an async generate({ systemPrompt, userPrompt }) that
// returns a raw string — and register it in ./index.js.
export async function generate({ systemPrompt, userPrompt }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set (required when AI_PROVIDER=openai)');
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI response did not include message content');
  }

  return content;
}
