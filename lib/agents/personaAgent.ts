import { callAgent, parseJSON } from './groqClient';

const SYSTEM = `You are a user research expert. Given a feature idea and Q&A context, generate detailed user personas.
Respond ONLY with valid JSON array, no markdown, no preamble.
Schema: [{"name": "string", "role": "string", "context": "string", "pain_point": "string"}]`;

export async function personaAgent(initialInput: string, qaContext: string) {
  const raw = await callAgent(SYSTEM, `Feature idea: ${initialInput}\n\nQ&A context:\n${qaContext}`);
  return parseJSON<Array<{ name: string; role: string; context: string; pain_point: string }>>(raw);
}
