import { callAgent, parseJSON } from '../groqClient';

const SYSTEM = `You are a startup advisor identifying risks for an early-stage startup idea. Be honest and thorough. Respond ONLY with valid JSON matching this exact structure:
{"risks":[{"category":"string","description":"string","severity":"high"|"medium"|"low","mitigation":"string"}]}
No markdown, no explanation, just the JSON object. Include 4-6 risks across different categories (market, technical, regulatory, competitive, execution, financial).`;

export interface Risk {
  category: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  mitigation: string;
}

export interface RiskData {
  risks: Risk[];
}

export async function riskAgent(idea: string): Promise<RiskData> {
  const raw = await callAgent(SYSTEM, `Identify risks for this startup idea: ${idea}`);
  try {
    return parseJSON<RiskData>(raw);
  } catch {
    return { risks: [] };
  }
}
