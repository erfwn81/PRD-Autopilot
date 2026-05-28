import Anthropic from '@anthropic-ai/sdk';
import { PRD_GENERATION_PROMPT } from './prompts';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function stripFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
}

export async function generatePRD(
  initialInput: string,
  qa: Array<{ question: string; answer: string }>
) {
  const attemptParse = async (): Promise<unknown> => {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: PRD_GENERATION_PROMPT(initialInput, qa) }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return JSON.parse(stripFences(text));
  };

  try {
    return await attemptParse();
  } catch {
    // Single retry on parse failure
    return await attemptParse();
  }
}
