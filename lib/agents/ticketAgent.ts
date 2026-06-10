import { callAgent, parseJSON } from './groqClient';
import type { TicketEpic } from '@/types/agent';

const SYSTEM = `You are a technical project manager. Given a PRD, break it into a structured backlog of epics, user stories, and tasks. Be specific and actionable.
Respond ONLY with valid JSON, no markdown, no preamble.
Schema: {
  "epics": [{
    "title": "string",
    "description": "string",
    "stories": [{
      "title": "string",
      "description": "string",
      "priority": "high|medium|low",
      "estimate": "string (e.g. '3 days')",
      "tasks": ["string"]
    }]
  }]
}`;

export async function ticketAgent(prdJson: string): Promise<{ epics: TicketEpic[] }> {
  const raw = await callAgent(SYSTEM, `PRD to break down:\n${prdJson}`);
  return parseJSON<{ epics: TicketEpic[] }>(raw);
}
