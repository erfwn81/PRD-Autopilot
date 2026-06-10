'use client';

import { useState } from 'react';
import type { TicketEpic } from '@/types/agent';

interface TicketBreakdownProps {
  tickets: { epics: TicketEpic[] };
  onClose: () => void;
}

const PRIORITY_COLOR: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

function toMarkdownTickets(epics: TicketEpic[]): string {
  const lines: string[] = ['# Ticket Breakdown\n'];
  epics.forEach((epic, ei) => {
    lines.push(`## Epic ${ei + 1}: ${epic.title}`);
    lines.push(epic.description);
    lines.push('');
    epic.stories.forEach((story, si) => {
      lines.push(`### Story ${ei + 1}.${si + 1}: ${story.title}`);
      lines.push(`**Priority:** ${story.priority} | **Estimate:** ${story.estimate}`);
      lines.push('');
      lines.push(story.description);
      lines.push('');
      lines.push('**Tasks:**');
      story.tasks.forEach((t) => lines.push(`- ${t}`));
      lines.push('');
    });
  });
  return lines.join('\n');
}

export default function TicketBreakdown({ tickets, onClose }: TicketBreakdownProps) {
  const [openEpics, setOpenEpics] = useState<Set<number>>(new Set([0]));
  const [copiedMd, setCopiedMd] = useState(false);

  const toggleEpic = (i: number) =>
    setOpenEpics((prev) => {
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
    a.href = url;
    a.download = 'tickets.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ticket Breakdown</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              {copiedMd ? 'Copied!' : 'Copy Markdown'}
            </button>
            <button
              onClick={handleExportJSON}
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              Export JSON
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl ml-2">×</button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
          {tickets.epics.map((epic, ei) => (
            <div key={ei} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleEpic(ei)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left"
              >
                <span className="font-semibold text-gray-900 text-sm">Epic {ei + 1}: {epic.title}</span>
                <span className="text-gray-400 text-xs">{openEpics.has(ei) ? '▲' : '▼'}</span>
              </button>

              {openEpics.has(ei) && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-gray-500 mt-3 mb-3">{epic.description}</p>
                  {epic.stories.map((story, si) => (
                    <div key={si} className="border border-gray-100 rounded-lg p-3 mb-2">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{story.title}</p>
                        <div className="flex gap-1.5 shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[story.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                            {story.priority}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                            {story.estimate}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{story.description}</p>
                      <ul className="space-y-0.5">
                        {story.tasks.map((task, ti) => (
                          <li key={ti} className="text-xs text-gray-600 flex gap-1.5">
                            <span className="text-gray-400 shrink-0">•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
