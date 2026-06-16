import { callAgent, parseJSON } from '../groqClient';

const SYSTEM = `You are a seasoned founder and angel investor who has seen thousands of startup pitches. Given the full validation analysis below, give a clear and honest go/no-go verdict. Be direct and honest — not a cheerleader. Score the idea 0-100 based on its viability. Respond ONLY with valid JSON matching this exact structure:
{"score":number,"recommendation":"build"|"pivot"|"validate-more"|"avoid","rationale":"string","next_steps":["string"]}
No markdown, no explanation, just the JSON object.`;

export interface VerdictData {
  score: number;
  recommendation: 'build' | 'pivot' | 'validate-more' | 'avoid';
  rationale: string;
  next_steps: string[];
}

export async function verdictAgent(
  idea: string,
  context: {
    market: unknown;
    competitors: unknown;
    customer: unknown;
    risks: unknown;
    swot: unknown;
  }
): Promise<VerdictData> {
  const userPrompt = `Startup idea: ${idea}

Full validation analysis:
${JSON.stringify(context, null, 2)}

Give your honest verdict.`;

  const raw = await callAgent(SYSTEM, userPrompt);
  try {
    const parsed = parseJSON<VerdictData>(raw);
    parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score)));
    return parsed;
  } catch {
    return {
      score: 50,
      recommendation: 'validate-more',
      rationale: raw.slice(0, 500),
      next_steps: ['Gather more customer data', 'Run a small experiment'],
    };
  }
}
