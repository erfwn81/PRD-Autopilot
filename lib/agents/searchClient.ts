const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const SEARCH_MODEL = process.env.SEARCH_MODEL || 'compound-beta';

type SearchResult = { url?: string; [key: string]: unknown };
type ExecutedTool = { search_results?: SearchResult[]; [key: string]: unknown };

export async function callSearchAgent(
  systemPrompt: string,
  userPrompt: string,
): Promise<{ content: string; sources: string[] }> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 500));
    }
    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: SEARCH_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.6,
          max_completion_tokens: 4000,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Groq API ${res.status}: ${err}`);
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
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError;
}
