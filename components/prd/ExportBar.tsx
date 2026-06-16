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

  const handleDownloadPDF = () => toPDF(prd);

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
      if (!res.ok) throw new Error(data.error ?? 'Failed to export to Notion');
      window.open(data.url, '_blank');
      setMobileMenuOpen(false);
    } catch (error) {
      setNotionError(error instanceof Error ? error.message : 'Failed to export');
    } finally {
      setNotionLoading(false);
    }
  };

  const btnBase = 'text-xs px-3 py-2 rounded-lg text-gray-400 hover:text-white transition-colors';
  const btnStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' };

  return (
    <div
      className="sticky top-0 z-20 border-b"
      style={{
        background: 'rgba(10,10,15,0.90)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.07)',
      }}
    >
      <div className="mx-auto max-w-4xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="max-w-[180px] truncate text-sm font-semibold text-white sm:max-w-xs">
              {prd.title ?? 'Untitled PRD'}
            </p>
            <p className="text-xs text-gray-600">Export your PRD</p>
          </div>

          {/* Desktop buttons */}
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/dashboard" className={btnBase} style={btnStyle}>← Dashboard</Link>
            <Link href="/new" className={btnBase} style={btnStyle}>New PRD</Link>
            <button onClick={handleCopyMarkdown} className={btnBase} style={btnStyle}>
              {copied ? '✓ Copied' : 'Copy Markdown'}
            </button>
            <button onClick={handleDownloadPDF} className={btnBase} style={btnStyle}>
              Download PDF
            </button>
            <button
              onClick={handleExportNotion}
              disabled={notionLoading}
              className="text-xs px-3 py-2 rounded-lg text-white font-medium btn-primary disabled:opacity-50"
            >
              {notionLoading ? 'Exporting…' : 'Export to Notion'}
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className={`${btnBase} sm:hidden inline-flex items-center gap-1`}
            style={btnStyle}
          >
            Actions <span className="text-xs">{mobileMenuOpen ? '▲' : '▼'}</span>
          </button>
        </div>

        {notionError && <p className="mt-2 text-xs text-danger">{notionError}</p>}

        {mobileMenuOpen && (
          <div className="mt-3 grid gap-2 rounded-xl p-3 sm:hidden"
            style={{ background: '#1A1A26', border: '1px solid rgba(255,255,255,0.10)' }}>
            <Link href="/dashboard" className={btnBase} style={btnStyle} onClick={() => setMobileMenuOpen(false)}>← Dashboard</Link>
            <Link href="/new" className={btnBase} style={btnStyle} onClick={() => setMobileMenuOpen(false)}>New PRD</Link>
            <button onClick={() => { handleCopyMarkdown(); setMobileMenuOpen(false); }} className={btnBase} style={btnStyle}>
              {copied ? '✓ Copied' : 'Copy Markdown'}
            </button>
            <button onClick={() => { handleDownloadPDF(); setMobileMenuOpen(false); }} className={btnBase} style={btnStyle}>Download PDF</button>
            <button onClick={handleExportNotion} disabled={notionLoading} className="text-xs px-3 py-2 rounded-lg text-white font-medium btn-primary">
              {notionLoading ? 'Exporting…' : 'Export to Notion'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
