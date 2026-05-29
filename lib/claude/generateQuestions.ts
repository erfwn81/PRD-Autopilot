import OpenAI from 'openai';
import { QUESTION_GENERATION_PROMPT } from './prompts';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateQuestions(initialInput: string): Promise<string[]> {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: QUESTION_GENERATION_PROMPT(initialInput),
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? '';

  const clean = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  let questions: string[];
  try {
    questions = JSON.parse(clean) as string[];
  } catch {
    throw new Error('Failed to parse questions from OpenAI response');
  }

  if (!Array.isArray(questions) || questions.length !== 5) {
    throw new Error('OpenAI did not return exactly 5 questions');
  }

  return questions;
}
