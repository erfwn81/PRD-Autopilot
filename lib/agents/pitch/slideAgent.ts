import { callAgent, parseJSON } from '../groqClient';

const SYSTEM = `You are a pitch deck expert who has helped startups raise funding from top VCs. Create a compelling 10-slide pitch deck. Make it specific, story-driven, and investor-ready. Respond ONLY with valid JSON matching this exact structure:
{"title":"string","slides":[{"number":1,"type":"cover","headline":"string","bullets":["string"],"speaker_notes":"string"},{"number":2,"type":"problem","headline":"string","bullets":["string"],"speaker_notes":"string"},{"number":3,"type":"solution","headline":"string","bullets":["string"],"speaker_notes":"string"},{"number":4,"type":"market","headline":"string","bullets":["string"],"speaker_notes":"string"},{"number":5,"type":"product","headline":"string","bullets":["string"],"speaker_notes":"string"},{"number":6,"type":"business_model","headline":"string","bullets":["string"],"speaker_notes":"string"},{"number":7,"type":"competition","headline":"string","bullets":["string"],"speaker_notes":"string"},{"number":8,"type":"traction","headline":"string","bullets":["string"],"speaker_notes":"string"},{"number":9,"type":"team","headline":"string","bullets":["string"],"speaker_notes":"string"},{"number":10,"type":"ask","headline":"string","bullets":["string"],"speaker_notes":"string"}]}
No markdown, no explanation, just the JSON object.`;

export interface Slide {
  number: number;
  type: string;
  headline: string;
  bullets: string[];
  speaker_notes: string;
}

export interface DeckData {
  title: string;
  slides: Slide[];
}

export async function slideAgent(
  idea: string,
  prdContext?: string,
  validationContext?: string,
): Promise<DeckData> {
  const parts = [`Startup idea: ${idea}`];
  if (prdContext) parts.push(`\nPRD context:\n${prdContext}`);
  if (validationContext) parts.push(`\nValidation context:\n${validationContext}`);
  parts.push('\nCreate a compelling 10-slide pitch deck based on this information.');

  const raw = await callAgent(SYSTEM, parts.join('\n'));
  try {
    const parsed = parseJSON<DeckData>(raw);
    if (!parsed.title || !Array.isArray(parsed.slides)) throw new Error('Invalid structure');
    return parsed;
  } catch {
    return {
      title: idea.slice(0, 60),
      slides: [],
    };
  }
}
