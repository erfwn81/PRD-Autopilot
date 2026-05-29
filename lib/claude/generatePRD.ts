import OpenAI from 'openai';
import { PRD_GENERATION_PROMPT } from './prompts';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function stripFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
}

export async function generatePRD(
  initialInput: string,
  qa: Array<{ question: string; answer: string }>
): Promise<unknown> {
  const attemptParse = async (): Promise<unknown> => {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: PRD_GENERATION_PROMPT(initialInput, qa),
        },
      ],
    });

    const text = response.choices[0]?.message?.content ?? '';
    return JSON.parse(stripFences(text));
  };

  try {
    return await attemptParse();
  } catch {
    return await attemptParse();
  }
}
