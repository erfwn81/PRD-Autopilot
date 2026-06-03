'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      setMobileMenuOpen(false);
    } catch (error) {
      setNotionError(error instanceof Error ? error.message : 'Failed to export to Notion');
    } finally {
      setNotionLoading(false);
    }
  };

  const handleMobileCopyMarkdown = async () => {
    await handleCopyMarkdown();
    setMobileMenuOpen(false);
  };

  const handleMobileDownloadPDF = () => {
    handleDownloadPDF();
    setMobileMenuOpen(false);
  };

  const buttonBase =
    'rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50';

  return (
    <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-4xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="max-w-[180px] truncate text-sm font-semibold text-gray-900 sm:max-w-xs">
              {prd.title ?? 'Untitled PRD'}
            </p>
            <p className="text-xs text-gray-500">Export or copy your PRD</p>
          </div>

          {/* Desktop buttons */}
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/dashboard" className={buttonBase}>
              ← Dashboard
            </Link>

            <Link href="/new" className={buttonBase}>
              New PRD
            </Link>

            <button type="button" onClick={handleCopyMarkdown} className={buttonBase}>
              {copied ? 'Copied ✓' : 'Copy Markdown'}
            </button>

            <button type="button" onClick={handleDownloadPDF} className={buttonBase}>
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

          {/* Mobile dropdown toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-export-menu"
          >
            Actions
            <span className="text-xs">{mobileMenuOpen ? '▲' : '▼'}</span>
          </button>
        </div>

        {notionError && <p className="mt-2 text-xs text-red-600">{notionError}</p>}

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-export-menu"
            className="mt-3 grid gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:hidden"
          >
            <Link
              href="/dashboard"
              className={buttonBase}
              onClick={() => setMobileMenuOpen(false)}
            >
              ← Dashboard
            </Link>

            <Link href="/new" className={buttonBase} onClick={() => setMobileMenuOpen(false)}>
              New PRD
            </Link>

            <button type="button" onClick={handleMobileCopyMarkdown} className={buttonBase}>
              {copied ? 'Copied ✓' : 'Copy Markdown'}
            </button>

            <button type="button" onClick={handleMobileDownloadPDF} className={buttonBase}>
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
        )}
      </div>
    </div>
  );
}