import { callAgent, parseJSON } from './groqClient';

const SYSTEM = `You are a product manager expert in writing user stories and jobs-to-be-done.
Respond ONLY with valid JSON object, no markdown, no preamble.
Schema: {"jobs_to_be_done": ["string"], "user_stories": [{"story": "string", "priority": "must-have|should-have|nice-to-have"}]}`;

export async function storiesAgent(
  initialInput: string,
  qaContext: string,
  personas: object[]
) {
  const raw = await callAgent(
    SYSTEM,
    `Feature idea: ${initialInput}\n\nQ&A context:\n${qaContext}\n\nUser personas:\n${JSON.stringify(personas, null, 2)}`
  );
  return parseJSON<{ jobs_to_be_done: string[]; user_stories: Array<{ story: string; priority: string }> }>(raw);
}
