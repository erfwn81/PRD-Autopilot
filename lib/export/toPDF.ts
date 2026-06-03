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
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addTitle = (text: string) => {
    checkPage(14);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const lines = doc.splitTextToSize(text, maxW);
    doc.text(lines, margin, y);
    y += lines.length * 8 + 6;
  };

  const addHeading = (text: string) => {
    checkPage(12);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    const lines = doc.splitTextToSize(text, maxW);
    doc.text(lines, margin, y);
    y += lines.length * 6 + 4;
  };

  const addSubheading = (text: string) => {
    checkPage(10);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const lines = doc.splitTextToSize(text, maxW - 4);
    doc.text(lines, margin + 4, y);
    y += lines.length * 5 + 3;
  };

  const addBody = (text: string, indent = 0) => {
    if (!text) return;
    checkPage(7);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    // Strip special characters that cause encoding artifacts
    const safe = text
      .replace(/✓/g, '[x]')
      .replace(/⚠️/g, '[!]')
      .replace(/❓/g, '[?]')
      .replace(/→/g, '->')
      .replace(/[^\x00-\x7F]/g, ''); // Remove any remaining non-ASCII
    const lines = doc.splitTextToSize(safe, maxW - indent);
    lines.forEach((line: string) => {
      checkPage(6);
      doc.text(line, margin + indent, y);
      y += 5;
    });
    y += 1;
  };

  const addBullet = (text: string, indent = 4) => {
    if (!text) return;
    addBody(`- ${text}`, indent);
  };

  const addSpacer = () => {
    y += 4;
  };

  const addDivider = () => {
    checkPage(8);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  };

  // ── TITLE ──────────────────────────────────────────────
  addTitle(prd.title ?? 'Product Requirements Document');
  addSpacer();

  // ── 1. PROBLEM STATEMENT ───────────────────────────────
  if (prd.problem_statement) {
    addDivider();
    addHeading('1. Problem Statement');
    addBody(prd.problem_statement);
    addSpacer();
  }

  // ── 2. USER PERSONAS ───────────────────────────────────
  if (prd.user_personas?.length) {
    addDivider();
    addHeading('2. User Personas');
    prd.user_personas.forEach((p) => {
      addSubheading(`${p.name} - ${p.role}`);
      addBody(`Context: ${p.context}`, 8);
      addBody(`Pain point: ${p.pain_point}`, 8);
      y += 2;
    });
    addSpacer();
  }

  // ── 3. JOBS TO BE DONE ─────────────────────────────────
  if (prd.jobs_to_be_done?.length) {
    addDivider();
    addHeading('3. Jobs to Be Done');
    prd.jobs_to_be_done.forEach((j) => addBullet(j));
    addSpacer();
  }

  // ── 4. USER STORIES ────────────────────────────────────
  if (prd.user_stories?.length) {
    addDivider();
    addHeading('4. User Stories');
    prd.user_stories.forEach((s) => {
      addBullet(`[${s.priority}] ${s.story}`);
    });
    addSpacer();
  }

  // ── 5. ACCEPTANCE CRITERIA ─────────────────────────────
  // This section had encoding artifacts — fixed by removing special chars
  if (prd.acceptance_criteria?.length) {
    addDivider();
    addHeading('5. Acceptance Criteria');
    prd.acceptance_criteria.forEach((ac) => {
      addSubheading(ac.story_ref);
      ac.criteria.forEach((c) => {
        // Replace checkmark with plain [x] to avoid PDF encoding issues
        addBody(`  [x] ${c}`, 8);
      });
      y += 2;
    });
    addSpacer();
  }

  // ── 6. EDGE CASES & ERROR STATES ──────────────────────
  // This section had encoding artifacts — fixed by removing special chars
  if (prd.edge_cases?.length) {
    addDivider();
    addHeading('6. Edge Cases & Error States');
    prd.edge_cases.forEach((ec, i) => {
      // Replace warning emoji with plain [!] to avoid PDF encoding issues
      addSubheading(`[${i + 1}] ${ec.scenario}`);
      addBody(`Expected: ${ec.expected_behavior}`, 8);
      y += 2;
    });
    addSpacer();
  }

  // ── 7. OUT OF SCOPE ────────────────────────────────────
  if (prd.out_of_scope?.length) {
    addDivider();
    addHeading('7. Out of Scope');
    prd.out_of_scope.forEach((item) => addBullet(item));
    addSpacer();
  }

  // ── 8. SUCCESS METRICS ─────────────────────────────────
  if (prd.success_metrics?.length) {
    addDivider();
    addHeading('8. Success Metrics');
    prd.success_metrics.forEach((m) => {
      addSubheading(`${m.metric}: ${m.target}`);
      addBody(`Measured by: ${m.measurement_method}`, 8);
      addBody(`Timeframe: ${m.timeframe}`, 8);
      y += 2;
    });
    addSpacer();
  }

  // ── 9. PHASED ROLLOUT PLAN ─────────────────────────────
  if (prd.rollout_plan) {
    addDivider();
    addHeading('9. Phased Rollout Plan');
    const phases = [
      { data: prd.rollout_plan.phase_1, num: 1 },
      { data: prd.rollout_plan.phase_2, num: 2 },
      { data: prd.rollout_plan.phase_3, num: 3 },
    ];
    phases.forEach(({ data: phase, num }) => {
      addSubheading(`Phase ${num}: ${phase.name} (${phase.duration})`);
      phase.features.forEach((f) => addBullet(f, 10));
      addBody(`Success: ${phase.success_criteria}`, 8);
      y += 2;
    });
    addSpacer();
  }

  // ── 10. OPEN QUESTIONS ─────────────────────────────────
  if (prd.open_questions?.length) {
    addDivider();
    addHeading('10. Open Questions');
    prd.open_questions.forEach((q) => {
      addSubheading(`Q: ${q.question}`);
      addBody(`Owner: ${q.owner}`, 8);
      addBody(`Impact if unresolved: ${q.impact}`, 8);
      y += 2;
    });
  }

  const filename = (prd.title ?? 'prd')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  doc.save(`${filename}.pdf`);
}
