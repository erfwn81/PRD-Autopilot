import Anthropic from '@anthropic-ai/sdk';
import { QUESTION_GENERATION_PROMPT } from './prompts';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateQuestions(initialInput: string): Promise<string[]> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: QUESTION_GENERATION_PROMPT(initialInput) }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Strip accidental code fences before parsing
  const clean = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const questions = JSON.parse(clean) as string[];

  if (!Array.isArray(questions) || questions.length !== 5) {
    throw new Error('Claude did not return exactly 5 questions');
  }

  return questions;
}
