import { PRDDocument } from '@/types';

export function toMarkdown(prd: PRDDocument): string {
  const lines: string[] = [];

  lines.push(`# ${prd.title ?? 'Product Requirements Document'}\n`);

  if (prd.problem_statement) {
    lines.push(`## 1. Problem Statement\n\n${prd.problem_statement}\n`);
  }

  if (prd.user_personas?.length) {
    lines.push('## 2. User Personas\n');
    prd.user_personas.forEach((p) => {
      lines.push(`### ${p.name} — ${p.role}\n\n**Context:** ${p.context}\n\n**Pain point:** ${p.pain_point}\n`);
    });
  }

  if (prd.jobs_to_be_done?.length) {
    lines.push('## 3. Jobs to Be Done\n');
    prd.jobs_to_be_done.forEach((j) => lines.push(`- ${j}`));
    lines.push('');
  }

  if (prd.user_stories?.length) {
    lines.push('## 4. User Stories\n');
    prd.user_stories.forEach((s) => lines.push(`- [${s.priority}] ${s.story}`));
    lines.push('');
  }

  if (prd.acceptance_criteria?.length) {
    lines.push('## 5. Acceptance Criteria\n');
    prd.acceptance_criteria.forEach((ac) => {
      lines.push(`### ${ac.story_ref}\n`);
      ac.criteria.forEach((c) => lines.push(`- ${c}`));
      lines.push('');
    });
  }

  if (prd.edge_cases?.length) {
    lines.push('## 6. Edge Cases & Error States\n');
    prd.edge_cases.forEach((ec) => {
      lines.push(`**${ec.scenario}**\n\n${ec.expected_behavior}\n`);
    });
  }

  if (prd.out_of_scope?.length) {
    lines.push('## 7. Out of Scope\n');
    prd.out_of_scope.forEach((item) => lines.push(`- ${item}`));
    lines.push('');
  }

  if (prd.success_metrics?.length) {
    lines.push('## 8. Success Metrics\n');
    prd.success_metrics.forEach((m) => {
      lines.push(`**${m.metric}:** ${m.target} — ${m.measurement_method} (${m.timeframe})`);
    });
    lines.push('');
  }

  if (prd.rollout_plan) {
    lines.push('## 9. Phased Rollout Plan\n');
    const phases = [prd.rollout_plan.phase_1, prd.rollout_plan.phase_2, prd.rollout_plan.phase_3];
    phases.forEach((phase, i) => {
      lines.push(`### Phase ${i + 1}: ${phase.name} (${phase.duration})\n`);
      phase.features.forEach((f) => lines.push(`- ${f}`));
      lines.push(`\n**Success criteria:** ${phase.success_criteria}\n`);
    });
  }

  if (prd.open_questions?.length) {
    lines.push('## 10. Open Questions\n');
    prd.open_questions.forEach((q) => {
      lines.push(`**Q:** ${q.question}\n\n**Owner:** ${q.owner}\n\n**Impact:** ${q.impact}\n`);
    });
  }

  return lines.join('\n');
}
