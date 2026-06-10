import { callAgent } from './groqClient';

const SYSTEM = `You are a product strategist. Given a feature idea and Q&A, write a compelling problem statement.
Respond ONLY with a plain text string, 2-3 paragraphs, no JSON, no markdown.`;

export async function problemAgent(initialInput: string, qaContext: string): Promise<string> {
  const raw = await callAgent(SYSTEM, `Feature idea: ${initialInput}\n\nQ&A context:\n${qaContext}`);
  return raw.trim();
}
