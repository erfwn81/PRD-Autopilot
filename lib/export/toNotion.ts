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

  blocks.push(heading(prd.title ?? 'Product Requirements Document', 1));

  if (prd.problem_statement) {
    blocks.push(heading('1. Problem Statement'));
    blocks.push(paragraph(prd.problem_statement));
  }

  if (prd.user_personas?.length) {
    blocks.push(heading('2. User Personas'));
    prd.user_personas.forEach((p) => {
      blocks.push(heading(`${p.name} — ${p.role}`, 3));
      blocks.push(paragraph(`Context: ${p.context}`));
      blocks.push(paragraph(`Pain point: ${p.pain_point}`));
    });
  }

  if (prd.jobs_to_be_done?.length) {
    blocks.push(heading('3. Jobs to Be Done'));
    prd.jobs_to_be_done.forEach((j) => blocks.push(bullet(j)));
  }

  if (prd.user_stories?.length) {
    blocks.push(heading('4. User Stories'));
    prd.user_stories.forEach((s) => blocks.push(bullet(`[${s.priority}] ${s.story}`)));
  }

  if (prd.out_of_scope?.length) {
    blocks.push(heading('7. Out of Scope'));
    prd.out_of_scope.forEach((item) => blocks.push(bullet(item)));
  }

  if (prd.open_questions?.length) {
    blocks.push(heading('10. Open Questions'));
    prd.open_questions.forEach((q) => {
      blocks.push(paragraph(`Q: ${q.question}`));
      blocks.push(paragraph(`Owner: ${q.owner} | Impact: ${q.impact}`));
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
