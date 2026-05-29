import Groq from 'groq-sdk';
import { QUESTION_GENERATION_PROMPT } from './prompts';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateQuestions(initialInput: string): Promise<string[]> {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
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
    throw new Error('Failed to parse questions from Groq response');
  }

  if (!Array.isArray(questions) || questions.length !== 5) {
    throw new Error('Groq did not return exactly 5 questions');
  }

  return questions;
}
