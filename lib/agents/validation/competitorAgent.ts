import { callSearchAgent } from '../searchClient';
import { parseJSON } from '../groqClient';

const SYSTEM = `You are a competitive intelligence analyst. Find real existing competitors for this startup idea via web search. Respond ONLY with valid JSON matching this exact structure:
{"competitors":[{"name":"string","description":"string","strengths":"string","weaknesses":"string","url":"string"}],"market_gap":"string"}
No markdown, no explanation, just the JSON object. Include 3-6 real competitors.`;

export interface Competitor {
  name: string;
  description: string;
  strengths: string;
  weaknesses: string;
  url: string;
}

export interface CompetitorData {
  competitors: Competitor[];
  market_gap: string;
}

export async function competitorAgent(idea: string): Promise<{ data: CompetitorData; sources: string[] }> {
  const { content, sources } = await callSearchAgent(SYSTEM, `Find competitors for this startup idea: ${idea}`);
  try {
    const data = parseJSON<CompetitorData>(content);
    return { data, sources };
  } catch {
    return {
      data: {
        competitors: [],
        market_gap: content.slice(0, 300),
      },
      sources,
    };
  }
}
