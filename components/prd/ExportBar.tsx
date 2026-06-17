'use client';

import { useState, useRef, useEffect } from 'react';
import { PRDDocument } from '@/types';
import { toMarkdown } from '@/lib/export/toMarkdown';
import { toPDF } from '@/lib/export/toPDF';

interface ExportBarProps {
  prd: PRDDocument;
  onRegenerate?: () => void;
  onScore?: () => void;
  onShare?: () => void;
  onBreakdown?: () => void;
  swarmLoading?: boolean;
  scoreLoading?: boolean;
  shareLoading?: boolean;
  ticketLoading?: boolean;
}

export default function ExportBar({
  prd,
  onRegenerate,
  onScore,
  onShare,
  onBreakdown,
  swarmLoading,
  scoreLoading,
  shareLoading,
  ticketLoading,
}: ExportBarProps) {
  const [copied, setCopied] = useState(false);
  const [notionLoading, setNotionLoading] = useState(false);
  const [notionError, setNotionError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleCopyMarkdown = async () => {
    setMenuOpen(false);
    const markdown = toMarkdown(prd);
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    setMenuOpen(false);
    toPDF(prd);
  };

  const handleExportNotion = async () => {
    setMenuOpen(false);
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
    } catch (error) {
      setNotionError(error instanceof Error ? error.message : 'Failed to export to Notion');
    } finally {
      setNotionLoading(false);
    }
  };

  const dispatch = (fn?: () => void) => {
    setMenuOpen(false);
    fn?.();
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
          {/* Left: title */}
          <div className="min-w-0">
            <p className="max-w-[180px] truncate text-sm font-semibold text-white sm:max-w-xs">
              {prd.title ?? 'Untitled PRD'}
            </p>
            <p className="text-xs text-gray-600">Export your PRD</p>
          </div>

          {/* Right: single Actions dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(o => !o)}
              className={`${btnBase} inline-flex items-center gap-1.5`}
              style={btnStyle}
              aria-expanded={menuOpen}
            >
              {notionLoading ? 'Exporting…' : 'Actions'}
              <svg
                className={`w-3 h-3 transition-transform duration-150 ${menuOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-56 rounded-xl py-1.5 z-30"
                style={{ background: '#1A1A26', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
              >
                {/* EXPORT */}
                <DarkSectionLabel>Export</DarkSectionLabel>
                <DarkMenuItem onClick={handleDownloadPDF} icon={<IconPDF />}>
                  Download PDF
                </DarkMenuItem>
                <DarkMenuItem onClick={handleCopyMarkdown} icon={<IconMD />}>
                  {copied ? 'Copied ✓' : 'Copy Markdown'}
                </DarkMenuItem>
                <DarkMenuItem onClick={handleExportNotion} disabled={notionLoading} icon={<IconNotion />}>
                  {notionLoading ? 'Exporting…' : 'Export to Notion'}
                </DarkMenuItem>

                <DarkDivider />

                {/* GENERATE & ANALYZE */}
                <DarkSectionLabel>Generate & Analyze</DarkSectionLabel>
                <DarkMenuItem
                  onClick={() => dispatch(onRegenerate)}
                  disabled={swarmLoading}
                  icon={<IconRegen />}
                >
                  {swarmLoading ? 'Re-generating…' : 'Re-generate (Multi-Agent)'}
                </DarkMenuItem>
                <DarkMenuItem
                  onClick={() => dispatch(onScore)}
                  disabled={scoreLoading}
                  icon={<IconScore />}
                >
                  {scoreLoading ? 'Scoring…' : 'Score this PRD'}
                </DarkMenuItem>

                <DarkDivider />

                {/* COLLABORATE */}
                <DarkSectionLabel>Collaborate</DarkSectionLabel>
                <DarkMenuItem
                  onClick={() => dispatch(onShare)}
                  disabled={shareLoading}
                  icon={<IconShare />}
                >
                  {shareLoading ? 'Creating link…' : 'Share for Review'}
                </DarkMenuItem>
                <DarkMenuItem
                  onClick={() => dispatch(onBreakdown)}
                  disabled={ticketLoading}
                  icon={<IconTicket />}
                >
                  {ticketLoading ? 'Breaking down…' : 'Break into Tickets'}
                </DarkMenuItem>
              </div>
            )}
          </div>
        </div>

        {notionError && <p className="mt-2 text-xs text-danger">{notionError}</p>}
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

function DarkSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
      {children}
    </p>
  );
}

function DarkDivider() {
  return <div className="my-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />;
}

function DarkMenuItem({
  onClick,
  disabled,
  icon,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2.5 w-full px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
    >
      <span className="text-gray-600 shrink-0 w-3.5">{icon}</span>
      {children}
    </button>
  );
}

/* ── Inline SVG icons (14 × 14) ─────────────────────────────── */

function IconPDF() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function IconMD() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function IconNotion() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function IconRegen() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function IconScore() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function IconTicket() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}
