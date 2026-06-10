import { callAgent, parseJSON } from './groqClient';

const SYSTEM = `You are a QA expert. Write acceptance criteria and edge cases for the given user stories.
Respond ONLY with valid JSON object, no markdown, no preamble.
Schema: {"acceptance_criteria": [{"story_ref": "string", "criteria": ["string"]}], "edge_cases": [{"scenario": "string", "expected_behavior": "string"}]}`;

export async function criteriaAgent(userStories: object[], initialInput: string) {
  const raw = await callAgent(
    SYSTEM,
    `Feature: ${initialInput}\n\nUser stories:\n${JSON.stringify(userStories, null, 2)}`
  );
  return parseJSON<{
    acceptance_criteria: Array<{ story_ref: string; criteria: string[] }>;
    edge_cases: Array<{ scenario: string; expected_behavior: string }>;
  }>(raw);
}
