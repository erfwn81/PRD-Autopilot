export interface AgentResult {
  section: string;
  content: string | object;
  error?: string;
}

export interface SwarmResult {
  problem_statement: string;
  user_personas: object[];
  jobs_to_be_done: string[];
  user_stories: object[];
  acceptance_criteria: object[];
  edge_cases: object[];
  out_of_scope: string[];
  success_metrics: object[];
  rollout_plan: object;
  open_questions: object[];
}

export interface PRDScore {
  overall: number;
  clarity: number;
  completeness: number;
  testability: number;
  measurability: number;
  gaps: string[];
  suggestions: string[];
}

export interface ChatAttachment {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  attachments?: ChatAttachment[];
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
}

export interface PRDComment {
  id: string;
  share_token: string;
  section_key: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface TicketEpic {
  title: string;
  description: string;
  stories: TicketStory[];
}

export interface TicketStory {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimate: string;
  tasks: string[];
}
