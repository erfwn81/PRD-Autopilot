import { callSearchAgent } from '../searchClient';
import { parseJSON } from '../groqClient';

const SYSTEM = `You are a market research analyst. Research the real market for this startup idea using web search. Respond ONLY with valid JSON matching this exact structure:
{"tam":"string","sam":"string","som":"string","growth_trend":"string","summary":"string"}
No markdown, no explanation, just the JSON object.`;

export interface MarketData {
  tam: string;
  sam: string;
  som: string;
  growth_trend: string;
  summary: string;
}

export async function marketAgent(idea: string): Promise<{ data: MarketData; sources: string[] }> {
  const { content, sources } = await callSearchAgent(SYSTEM, `Research the market for this startup idea: ${idea}`);
  try {
    const data = parseJSON<MarketData>(content);
    return { data, sources };
  } catch {
    return {
      data: {
        tam: 'Could not determine',
        sam: 'Could not determine',
        som: 'Could not determine',
        growth_trend: 'Unknown',
        summary: content.slice(0, 500),
      },
      sources,
    };
  }
}
