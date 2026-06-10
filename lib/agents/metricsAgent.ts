import { callAgent, parseJSON } from './groqClient';

const SYSTEM = `You are a growth and analytics expert. Define success metrics, out-of-scope items, rollout plan, and open questions.
Respond ONLY with valid JSON object, no markdown, no preamble.
Schema: {
  "success_metrics": [{"metric": "string", "target": "string", "measurement_method": "string", "timeframe": "string"}],
  "out_of_scope": ["string"],
  "rollout_plan": {
    "phase_1": {"name": "string", "duration": "string", "features": ["string"], "success_criteria": "string"},
    "phase_2": {"name": "string", "duration": "string", "features": ["string"], "success_criteria": "string"},
    "phase_3": {"name": "string", "duration": "string", "features": ["string"], "success_criteria": "string"}
  },
  "open_questions": [{"question": "string", "owner": "string", "impact": "string"}]
}`;

export async function metricsAgent(
  initialInput: string,
  qaContext: string,
  userStories: object[]
) {
  const raw = await callAgent(
    SYSTEM,
    `Feature idea: ${initialInput}\n\nQ&A context:\n${qaContext}\n\nUser stories:\n${JSON.stringify(userStories, null, 2)}`
  );
  return parseJSON<{
    success_metrics: Array<{ metric: string; target: string; measurement_method: string; timeframe: string }>;
    out_of_scope: string[];
    rollout_plan: {
      phase_1: { name: string; duration: string; features: string[]; success_criteria: string };
      phase_2: { name: string; duration: string; features: string[]; success_criteria: string };
      phase_3: { name: string; duration: string; features: string[]; success_criteria: string };
    };
    open_questions: Array<{ question: string; owner: string; impact: string }>;
  }>(raw);
}
