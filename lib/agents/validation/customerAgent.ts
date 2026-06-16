import { callAgent, parseJSON } from '../groqClient';

const SYSTEM = `You are a customer research expert specializing in early-stage startups. Define the ideal customer profile for this startup idea. Respond ONLY with valid JSON matching this exact structure:
{"icp":{"demographics":"string","psychographics":"string","where_to_find":"string"},"early_adopters":"string","personas":[{"name":"string","role":"string","motivation":"string","objection":"string"}]}
No markdown, no explanation, just the JSON object. Include 2-3 personas.`;

export interface ICP {
  demographics: string;
  psychographics: string;
  where_to_find: string;
}

export interface Persona {
  name: string;
  role: string;
  motivation: string;
  objection: string;
}

export interface CustomerData {
  icp: ICP;
  early_adopters: string;
  personas: Persona[];
}

export async function customerAgent(idea: string): Promise<CustomerData> {
  const raw = await callAgent(SYSTEM, `Define the target customer for this startup idea: ${idea}`);
  try {
    return parseJSON<CustomerData>(raw);
  } catch {
    return {
      icp: { demographics: 'Unknown', psychographics: 'Unknown', where_to_find: 'Unknown' },
      early_adopters: raw.slice(0, 200),
      personas: [],
    };
  }
}
