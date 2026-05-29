import { Client } from '@notionhq/client';
import { PRDDocument } from '@/types';

export function buildNotionBlocks(prd: PRDDocument) {
  const blocks: object[] = [];

  const heading = (text: string, level: 1 | 2 | 3 = 2) => ({
    type: `heading_${level}`,
    [`heading_${level}`]: { rich_text: [{ type: 'text', text: { content: text } }] },
  });
  const paragraph = (text: string) => ({
    type: 'paragraph',
    paragraph: { rich_text: [{ type: 'text', text: { content: text } }] },
  });
  const bullet = (text: string) => ({
    type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: [{ type: 'text', text: { content: text } }] },
  });
  const divider = () => ({ type: 'divider', divider: {} });

  blocks.push(heading(prd.title ?? 'Product Requirements Document', 1));

  if (prd.problem_statement) {
    blocks.push(divider(), heading('1. Problem Statement'), paragraph(prd.problem_statement));
  }

  if (prd.user_personas?.length) {
    blocks.push(divider(), heading('2. User Personas'));
    prd.user_personas.forEach((p) => {
      blocks.push(heading(`${p.name} — ${p.role}`, 3));
      blocks.push(paragraph(`Context: ${p.context}`));
      blocks.push(paragraph(`Pain point: ${p.pain_point}`));
    });
  }

  if (prd.jobs_to_be_done?.length) {
    blocks.push(divider(), heading('3. Jobs to Be Done'));
    prd.jobs_to_be_done.forEach((j) => blocks.push(bullet(j)));
  }

  if (prd.user_stories?.length) {
    blocks.push(divider(), heading('4. User Stories'));
    prd.user_stories.forEach((s) => blocks.push(bullet(`[${s.priority}] ${s.story}`)));
  }

  if (prd.acceptance_criteria?.length) {
    blocks.push(divider(), heading('5. Acceptance Criteria'));
    prd.acceptance_criteria.forEach((ac) => {
      blocks.push(heading(ac.story_ref, 3));
      ac.criteria.forEach((c) => blocks.push(bullet(c)));
    });
  }

  if (prd.edge_cases?.length) {
    blocks.push(divider(), heading('6. Edge Cases & Error States'));
    prd.edge_cases.forEach((ec) => {
      blocks.push(paragraph(`⚠️ ${ec.scenario}`));
      blocks.push(paragraph(`→ ${ec.expected_behavior}`));
    });
  }

  if (prd.out_of_scope?.length) {
    blocks.push(divider(), heading('7. Out of Scope'));
    prd.out_of_scope.forEach((item) => blocks.push(bullet(item)));
  }

  if (prd.success_metrics?.length) {
    blocks.push(divider(), heading('8. Success Metrics'));
    prd.success_metrics.forEach((m) => {
      blocks.push(heading(`${m.metric}: ${m.target}`, 3));
      blocks.push(paragraph(`Measured by: ${m.measurement_method}`));
      blocks.push(paragraph(`Timeframe: ${m.timeframe}`));
    });
  }

  if (prd.rollout_plan) {
    blocks.push(divider(), heading('9. Phased Rollout Plan'));
    [
      { phase: prd.rollout_plan.phase_1, num: 1 },
      { phase: prd.rollout_plan.phase_2, num: 2 },
      { phase: prd.rollout_plan.phase_3, num: 3 },
    ].forEach(({ phase, num }) => {
      blocks.push(heading(`Phase ${num}: ${phase.name} (${phase.duration})`, 3));
      phase.features.forEach((f) => blocks.push(bullet(f)));
      blocks.push(paragraph(`✓ Success criteria: ${phase.success_criteria}`));
    });
  }

  if (prd.open_questions?.length) {
    blocks.push(divider(), heading('10. Open Questions'));
    prd.open_questions.forEach((q) => {
      blocks.push(paragraph(`❓ ${q.question}`));
      blocks.push(paragraph(`Owner: ${q.owner}`));
      blocks.push(paragraph(`Impact if unresolved: ${q.impact}`));
    });
  }

  return blocks;
}

export async function pushToNotion(prd: PRDDocument, parentPageId?: string) {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });

  const page = await notion.pages.create({
    parent: parentPageId
      ? { type: 'page_id', page_id: parentPageId }
      : { type: 'workspace', workspace: true as const },
    properties: {
      title: { title: [{ text: { content: prd.title ?? 'PRD' } }] },
    },
    children: buildNotionBlocks(prd) as Parameters<typeof notion.pages.create>[0]['children'],
  });

  return page;
}
