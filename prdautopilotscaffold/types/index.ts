export interface PRDSession {
  id: string;
  user_id: string;
  title: string;
  initial_input: string;
  status: 'interviewing' | 'generating' | 'complete';
  created_at: string;
  updated_at: string;
}

export interface InterviewQA {
  id: string;
  session_id: string;
  question_number: number;
  question: string;
  answer: string | null;
}

export interface UserPersona {
  name: string;
  role: string;
  context: string;
  pain_point: string;
}

export interface UserStory {
  story: string;
  priority: 'must-have' | 'should-have' | 'nice-to-have';
}

export interface AcceptanceCriteria {
  story_ref: string;
  criteria: string[];
}

export interface EdgeCase {
  scenario: string;
  expected_behavior: string;
}

export interface SuccessMetric {
  metric: string;
  target: string;
  measurement_method: string;
  timeframe: string;
}

export interface RolloutPhase {
  name: string;
  duration: string;
  features: string[];
  success_criteria: string;
}

export interface OpenQuestion {
  question: string;
  owner: string;
  impact: string;
}

export interface PRDDocument {
  id: string;
  session_id: string;
  title?: string;
  problem_statement: string | null;
  user_personas: UserPersona[] | null;
  jobs_to_be_done: string[] | null;
  user_stories: UserStory[] | null;
  acceptance_criteria: AcceptanceCriteria[] | null;
  edge_cases: EdgeCase[] | null;
  out_of_scope: string[] | null;
  success_metrics: SuccessMetric[] | null;
  rollout_plan: {
    phase_1: RolloutPhase;
    phase_2: RolloutPhase;
    phase_3: RolloutPhase;
  } | null;
  open_questions: OpenQuestion[] | null;
  raw_markdown: string | null;
  created_at: string;
  updated_at: string;
}
