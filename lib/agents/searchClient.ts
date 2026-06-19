const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const SEARCH_MODEL = process.env.SEARCH_MODEL || 'compound-beta';
const FALLBACK_MODEL = process.env.AGENT_MODEL || 'llama-3.3-70b-versatile';

type SearchResult = { url?: string; [key: string]: unknown };
type ExecutedTool = { search_results?: SearchResult[]; [key: string]: unknown };

async function callGroq(
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<{ content: string; sources: string[] }> {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_completion_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    const e = new Error(`Groq API ${res.status}: ${errText}`) as Error & { status: number };
    e.status = res.status;
    throw e;
  }

  const data = await res.json();
  const content = (data.choices[0].message.content ?? '') as string;

  const executedTools = data.choices[0].message.executed_tools as ExecutedTool[] | undefined;
  const sources: string[] = [];

  if (Array.isArray(executedTools)) {
    const seen = new Set<string>();
    for (const tool of executedTools) {
      if (Array.isArray(tool.search_results)) {
        for (const result of tool.search_results) {
          if (result.url && !seen.has(result.url)) {
            seen.add(result.url);
            sources.push(result.url);
          }
        }
      }
    }
  }

  return { content, sources };
}

export async function callSearchAgent(
  systemPrompt: string,
  userPrompt: string,
): Promise<{ content: string; sources: string[] }> {
  let lastError: Error = new Error('Unknown error');

  // Try the search-capable model with retries; bail early on 400/404 (model not available)
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 500));
    }
    try {
      return await callGroq(SEARCH_MODEL, systemPrompt, userPrompt);
    } catch (err) {
      const e = err as Error & { status?: number };
      lastError = e;
      if (e.status === 400 || e.status === 404) break; // model unavailable — skip remaining retries
    }
  }

  // Fallback: AGENT_MODEL generates AI-estimated content without live web search
  console.log(`[searchClient] ${SEARCH_MODEL} unavailable, falling back to ${FALLBACK_MODEL} (no web search)`);
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1000));
    try {
      const result = await callGroq(FALLBACK_MODEL, systemPrompt, userPrompt);
      console.log(`[searchClient] fallback to ${FALLBACK_MODEL} succeeded`);
      return result; // sources will be empty — no web search on fallback model
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError;
}
