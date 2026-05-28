import { PRDDocument } from '@/types';

export async function toPDF(prd: PRDDocument): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxW = pageW - margin * 2;
  let y = margin;

  const checkPage = (needed = 10) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addHeading = (text: string, size = 14) => {
    checkPage(12);
    doc.setFontSize(size);
    doc.setFont('helvetica', 'bold');
    const lines = doc.splitTextToSize(text, maxW);
    doc.text(lines, margin, y);
    y += lines.length * (size * 0.4) + 4;
  };

  const addBody = (text: string) => {
    checkPage(8);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, maxW);
    lines.forEach((line: string) => {
      checkPage(6);
      doc.text(line, margin, y);
      y += 5;
    });
    y += 2;
  };

  addHeading(prd.title ?? 'Product Requirements Document', 18);
  y += 4;

  if (prd.problem_statement) {
    addHeading('1. Problem Statement', 13);
    addBody(prd.problem_statement);
  }

  if (prd.user_stories?.length) {
    addHeading('4. User Stories', 13);
    prd.user_stories.forEach((s) => addBody(`• [${s.priority}] ${s.story}`));
  }

  if (prd.out_of_scope?.length) {
    addHeading('7. Out of Scope', 13);
    prd.out_of_scope.forEach((item) => addBody(`• ${item}`));
  }

  if (prd.open_questions?.length) {
    addHeading('10. Open Questions', 13);
    prd.open_questions.forEach((q) => {
      addBody(`Q: ${q.question}`);
      addBody(`Owner: ${q.owner}`);
    });
  }

  const filename = (prd.title ?? 'prd').toLowerCase().replace(/\s+/g, '-');
  doc.save(`${filename}.pdf`);
}
