import { callChatMessages } from './groqClient';

const SYSTEM = `You are an expert product manager and PM coach. You help product managers think through problems, review their work, and make better product decisions. You are direct, specific, and actionable. You know about PRDs, user stories, roadmaps, prioritization, stakeholder management, and product strategy. When given context about a user's PRD, use it to give specific advice.`;

export async function chatAgent(
  messages: Array<{ role: string; content: string }>,
  prdContext?: string
): Promise<string> {
  const systemPrompt = prdContext
    ? `${SYSTEM}\n\nLinked PRD context (use this to give specific advice):\n${prdContext}`
    : SYSTEM;

  return callChatMessages(systemPrompt, messages);
}
