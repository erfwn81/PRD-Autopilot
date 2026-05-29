import { PRDDocument } from '@/types';

export async function toPDF(prd: PRDDocument): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxW = pageW - margin * 2;
  let y = margin;

  const checkPage = (needed = 10) => {
    if (y + needed > pageH - margin) { doc.addPage(); y = margin; }
  };

  const addTitle = (text: string) => {
    checkPage(14);
    doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    const lines = doc.splitTextToSize(text, maxW);
    doc.text(lines, margin, y);
    y += lines.length * 8 + 6;
  };

  const addHeading = (text: string) => {
    checkPage(12);
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    const lines = doc.splitTextToSize(text, maxW);
    doc.text(lines, margin, y);
    y += lines.length * 6 + 4;
  };

  const addBody = (text: string, indent = 0) => {
    checkPage(7);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, maxW - indent);
    lines.forEach((line: string) => { checkPage(6); doc.text(line, margin + indent, y); y += 5; });
    y += 1;
  };

  const addBullet = (text: string) => addBody(`• ${text}`, 4);
  const addSpacer = () => { y += 4; };

  addTitle(prd.title ?? 'Product Requirements Document');
  addSpacer();

  if (prd.problem_statement) {
    addHeading('1. Problem Statement');
    addBody(prd.problem_statement);
    addSpacer();
  }

  if (prd.user_personas?.length) {
    addHeading('2. User Personas');
    prd.user_personas.forEach((p) => {
      addBody(`${p.name} — ${p.role}`, 4);
      addBody(`Context: ${p.context}`, 8);
      addBody(`Pain point: ${p.pain_point}`, 8);
      y += 2;
    });
    addSpacer();
  }

  if (prd.jobs_to_be_done?.length) {
    addHeading('3. Jobs to Be Done');
    prd.jobs_to_be_done.forEach((j) => addBullet(j));
    addSpacer();
  }

  if (prd.user_stories?.length) {
    addHeading('4. User Stories');
    prd.user_stories.forEach((s) => addBullet(`[${s.priority}] ${s.story}`));
    addSpacer();
  }

  if (prd.acceptance_criteria?.length) {
    addHeading('5. Acceptance Criteria');
    prd.acceptance_criteria.forEach((ac) => {
      addBody(ac.story_ref, 4);
      ac.criteria.forEach((c) => addBody(`✓ ${c}`, 8));
      y += 2;
    });
    addSpacer();
  }

  if (prd.edge_cases?.length) {
    addHeading('6. Edge Cases & Error States');
    prd.edge_cases.forEach((ec) => {
      addBody(ec.scenario, 4);
      addBody(`→ ${ec.expected_behavior}`, 8);
      y += 2;
    });
    addSpacer();
  }

  if (prd.out_of_scope?.length) {
    addHeading('7. Out of Scope');
    prd.out_of_scope.forEach((item) => addBullet(item));
    addSpacer();
  }

  if (prd.success_metrics?.length) {
    addHeading('8. Success Metrics');
    prd.success_metrics.forEach((m) => {
      addBody(`${m.metric}: ${m.target}`, 4);
      addBody(`Measured by: ${m.measurement_method} (${m.timeframe})`, 8);
      y += 2;
    });
    addSpacer();
  }

  if (prd.rollout_plan) {
    addHeading('9. Phased Rollout Plan');
    [prd.rollout_plan.phase_1, prd.rollout_plan.phase_2, prd.rollout_plan.phase_3].forEach((phase, i) => {
      addBody(`Phase ${i + 1}: ${phase.name} (${phase.duration})`, 4);
      phase.features.forEach((f) => addBody(`• ${f}`, 10));
      addBody(`Success: ${phase.success_criteria}`, 8);
      y += 2;
    });
    addSpacer();
  }

  if (prd.open_questions?.length) {
    addHeading('10. Open Questions');
    prd.open_questions.forEach((q) => {
      addBody(`Q: ${q.question}`, 4);
      addBody(`Owner: ${q.owner}`, 8);
      addBody(`Impact: ${q.impact}`, 8);
      y += 2;
    });
  }

  const filename = (prd.title ?? 'prd').toLowerCase().replace(/\s+/g, '-');
  doc.save(`${filename}.pdf`);
}
