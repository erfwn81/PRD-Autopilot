import { callAgent, parseJSON } from '../groqClient';

const SYSTEM = `You are a strategy consultant. Build a SWOT analysis for this startup idea. Be specific and actionable, not generic. Respond ONLY with valid JSON matching this exact structure:
{"strengths":["string"],"weaknesses":["string"],"opportunities":["string"],"threats":["string"]}
No markdown, no explanation, just the JSON object. Include 3-5 items per quadrant.`;

export interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export async function swotAgent(idea: string): Promise<SwotData> {
  const raw = await callAgent(SYSTEM, `Create a SWOT analysis for this startup idea: ${idea}`);
  try {
    return parseJSON<SwotData>(raw);
  } catch {
    return { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  }
}
