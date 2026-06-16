'use client';

import { useState } from 'react';
import type { TicketEpic } from '@/types/agent';

interface TicketBreakdownProps {
  tickets: { epics: TicketEpic[] };
  onClose: () => void;
}

const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  high:   { bg: 'rgba(248,113,113,0.15)', color: '#F87171' },
  medium: { bg: 'rgba(251,191,36,0.15)',  color: '#FBBF24' },
  low:    { bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF' },
};

function toMarkdownTickets(epics: TicketEpic[]): string {
  const lines = ['# Ticket Breakdown\n'];
  epics.forEach((epic, ei) => {
    lines.push(`## Epic ${ei + 1}: ${epic.title}`, epic.description, '');
    epic.stories.forEach((story, si) => {
      lines.push(
        `### Story ${ei + 1}.${si + 1}: ${story.title}`,
        `**Priority:** ${story.priority} | **Estimate:** ${story.estimate}`,
        '', story.description, '', '**Tasks:**',
        ...story.tasks.map(t => `- ${t}`), ''
      );
    });
  });
  return lines.join('\n');
}

export default function TicketBreakdown({ tickets, onClose }: TicketBreakdownProps) {
  const [openEpics, setOpenEpics] = useState<Set<number>>(new Set([0]));
  const [copiedMd, setCopiedMd] = useState(false);

  const toggleEpic = (i: number) =>
    setOpenEpics(prev => {
      const next = new Set(prev);
      if (next.has(i)) { next.delete(i); } else { next.add(i); }
      return next;
    });

  const handleCopyMarkdown = async () => {
    await navigator.clipboard.writeText(toMarkdownTickets(tickets.epics));
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(tickets, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'tickets.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      style={{ backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl"
        style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <h2 className="text-base font-semibold text-white">Ticket Breakdown</h2>
          <div className="flex items-center gap-2">
            {[
              { label: copiedMd ? '✓ Copied' : 'Copy Markdown', action: handleCopyMarkdown },
              { label: 'Export JSON', action: handleExportJSON },
            ].map(({ label, action }) => (
              <button key={label} onClick={action}
                className="text-xs px-3 py-1.5 rounded-lg text-gray-400 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                {label}
              </button>
            ))}
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl ml-1">×</button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
          {tickets.epics.map((epic, ei) => (
            <div key={ei} className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={() => toggleEpic(ei)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors">
                <span className="text-sm font-semibold text-white">Epic {ei + 1}: {epic.title}</span>
                <span className="text-gray-500 text-xs">{openEpics.has(ei) ? '▲' : '▼'}</span>
              </button>

              {openEpics.has(ei) && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-xs text-gray-500 mt-3 mb-3">{epic.description}</p>
                  {epic.stories.map((story, si) => {
                    const ps = PRIORITY_STYLE[story.priority] ?? PRIORITY_STYLE.low;
                    return (
                      <div key={si} className="rounded-lg p-3 mb-2"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-sm font-medium text-gray-200">{story.title}</p>
                          <div className="flex gap-1.5 shrink-0">
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: ps.bg, color: ps.color }}>{story.priority}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: 'rgba(34,211,238,0.10)', color: '#22D3EE' }}>{story.estimate}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{story.description}</p>
                        <ul className="space-y-0.5">
                          {story.tasks.map((task, ti) => (
                            <li key={ti} className="text-xs text-gray-500 flex gap-1.5">
                              <span className="text-gray-600">•</span><span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
