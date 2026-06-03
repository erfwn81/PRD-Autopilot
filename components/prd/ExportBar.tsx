'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PRDDocument } from '@/types';
import { toMarkdown } from '@/lib/export/toMarkdown';
import { toPDF } from '@/lib/export/toPDF';

interface ExportBarProps {
  prd: PRDDocument;
}

export default function ExportBar({ prd }: ExportBarProps) {
  const [copied, setCopied] = useState(false);
  const [notionLoading, setNotionLoading] = useState(false);
  const [notionError, setNotionError] = useState('');

  const handleCopyMarkdown = async () => {
    const markdown = toMarkdown(prd);
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    toPDF(prd);
  };

  const handleExportNotion = async () => {
    setNotionLoading(true);
    setNotionError('');

    try {
      const res = await fetch('/api/prd/export/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: prd.session_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to export to Notion');
      }

      window.open(data.url, '_blank');
    } catch (error) {
      setNotionError(error instanceof Error ? error.message : 'Failed to export to Notion');
    } finally {
      setNotionLoading(false);
    }
  };

  return (
    <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="max-w-full truncate text-sm font-semibold text-gray-900 sm:max-w-xs">
            {prd.title ?? 'Untitled PRD'}
          </p>
          <p className="text-xs text-gray-500">Export or copy your PRD</p>
          {notionError && (
            <p className="mt-1 text-xs text-red-600">{notionError}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center">
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Dashboard
          </Link>

          <Link
            href="/new"
            className="rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            New PRD
          </Link>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {copied ? 'Copied ✓' : 'Copy Markdown'}
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Download PDF
          </button>

          <button
            type="button"
            onClick={handleExportNotion}
            disabled={notionLoading}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {notionLoading ? 'Exporting...' : 'Export to Notion'}
          </button>
        </div>
      </div>
    </div>
  );
}