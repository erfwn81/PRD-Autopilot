const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const AGENT_MODEL = process.env.AGENT_MODEL || 'llama-3.3-70b-versatile';

type GroqMessage = { role: 'system' | 'user' | 'assistant'; content: string };

async function fetchGroq(messages: GroqMessage[], maxTokens = 2048): Promise<string> {
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
          model: AGENT_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: maxTokens,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Groq API ${res.status}: ${err}`);
      }

      const data = await res.json();
      return data.choices[0].message.content as string;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError;
}

export async function callAgent(systemPrompt: string, userPrompt: string): Promise<string> {
  return fetchGroq([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
}

export async function callChatMessages(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const groqMessages: GroqMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];
  return fetchGroq(groqMessages, 1024);
}

function stripFences(raw: string): string {
  return raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

export function parseJSON<T>(raw: string): T {
  return JSON.parse(stripFences(raw)) as T;
}
