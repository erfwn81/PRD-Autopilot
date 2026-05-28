'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { PRDDocument } from '@/types';

interface ExportBarProps {
  prd: PRDDocument;
  sessionId: string;
}

export default function ExportBar({ prd, sessionId }: ExportBarProps) {
  const [notionLoading, setNotionLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyMarkdown = async () => {
    const { toMarkdown } = await import('@/lib/export/toMarkdown');
    await navigator.clipboard.writeText(toMarkdown(prd));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      const { toPDF } = await import('@/lib/export/toPDF');
      await toPDF(prd);
    } finally {
      setPdfLoading(false);
    }
  };

  const exportNotion = async () => {
    setNotionLoading(true);
    try {
      const res = await fetch('/api/prd/export/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error('Notion export failed');
      const { url } = await res.json();
      if (url) window.open(url, '_blank');
    } catch {
      alert('Notion export failed. Check your Notion API key.');
    } finally {
      setNotionLoading(false);
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900 truncate max-w-xs">
          {prd.title ?? 'Product Requirements Document'}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={copyMarkdown}>
            {copied ? 'Copied ✓' : 'Copy Markdown'}
          </Button>
          <Button variant="secondary" size="sm" onClick={downloadPDF} loading={pdfLoading}>
            Download PDF
          </Button>
          <Button size="sm" onClick={exportNotion} loading={notionLoading}>
            Export to Notion
          </Button>
        </div>
      </div>
    </div>
  );
}
