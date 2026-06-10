'use client';

import { useState } from 'react';
import type { PRDScore } from '@/types/agent';

interface ScoringWidgetProps {
  score: PRDScore;
}

function scoreColor(n: number) {
  if (n >= 71) return 'bg-green-500';
  if (n >= 41) return 'bg-amber-400';
  return 'bg-red-500';
}

function scoreLabelColor(n: number) {
  if (n >= 71) return 'text-green-700';
  if (n >= 41) return 'text-amber-700';
  return 'text-red-700';
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className={`text-xs font-bold ${scoreLabelColor(value)}`}>{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${scoreColor(value)} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function ScoringWidget({ score }: ScoringWidgetProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white ${scoreColor(score.overall)}`}>
            {score.overall}
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 text-sm">PRD Health Score</p>
            <p className="text-xs text-gray-500">
              {score.overall >= 71 ? 'Good quality' : score.overall >= 41 ? 'Needs improvement' : 'Significant gaps found'}
            </p>
          </div>
        </div>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="mb-4">
            <Bar label="Clarity" value={score.clarity} />
            <Bar label="Completeness" value={score.completeness} />
            <Bar label="Testability" value={score.testability} />
            <Bar label="Measurability" value={score.measurability} />
          </div>

          {score.gaps.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Gaps Found</p>
              <ul className="space-y-1">
                {score.gaps.map((gap, i) => (
                  <li key={i} className="flex gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                    <span>⚠</span><span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {score.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Suggestions</p>
              <ul className="space-y-1">
                {score.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2 text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2">
                    <span>→</span><span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
