import { callAgent, parseJSON } from './groqClient';
import type { PRDScore } from '@/types/agent';

const SYSTEM = `You are a senior product manager evaluating a PRD for quality. Score it across dimensions and identify gaps.
Respond ONLY with valid JSON, no markdown, no preamble.
Schema: {
  "clarity": <0-100>,
  "completeness": <0-100>,
  "testability": <0-100>,
  "measurability": <0-100>,
  "overall": <average of all four>,
  "gaps": ["specific missing element"],
  "suggestions": ["concrete improvement action"]
}`;

export async function scoringAgent(prdJson: string): Promise<PRDScore> {
  const raw = await callAgent(SYSTEM, `PRD to evaluate:\n${prdJson}`);
  const parsed = parseJSON<PRDScore>(raw);
  // Ensure overall is calculated correctly even if model returns wrong value
  parsed.overall = Math.round((parsed.clarity + parsed.completeness + parsed.testability + parsed.measurability) / 4);
  return parsed;
}
