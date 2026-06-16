'use client';

import { useState } from 'react';
import type { PRDScore } from '@/types/agent';

interface ScoringWidgetProps { score: PRDScore }

function scoreGradient(n: number) {
  if (n >= 71) return 'linear-gradient(90deg,#34D399,#22D3EE)';
  if (n >= 41) return 'linear-gradient(90deg,#FBBF24,#F87171)';
  return 'linear-gradient(90deg,#F87171,#ef4444)';
}
function scoreColor(n: number) {
  if (n >= 71) return '#34D399';
  if (n >= 41) return '#FBBF24';
  return '#F87171';
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-semibold" style={{ color: scoreColor(value) }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: scoreGradient(value) }}
        />
      </div>
    </div>
  );
}

export default function ScoringWidget({ score }: ScoringWidgetProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.08)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white"
            style={{ background: scoreGradient(score.overall), boxShadow: `0 0 20px ${scoreColor(score.overall)}40` }}
          >
            {score.overall}
          </div>
          <div className="text-left">
            <p className="font-semibold text-white text-sm">PRD Health Score</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {score.overall >= 71 ? 'Strong quality' : score.overall >= 41 ? 'Needs improvement' : 'Significant gaps'}
            </p>
          </div>
        </div>
        <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="pt-4 mb-4">
            <Bar label="Clarity"         value={score.clarity} />
            <Bar label="Completeness"    value={score.completeness} />
            <Bar label="Testability"     value={score.testability} />
            <Bar label="Measurability"   value={score.measurability} />
          </div>

          {score.gaps.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Gaps Found</p>
              <ul className="space-y-1.5">
                {score.gaps.map((g, i) => (
                  <li key={i} className="flex gap-2 text-xs px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.20)', color: '#FBBF24' }}>
                    <span>⚠</span><span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {score.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Suggestions</p>
              <ul className="space-y-1.5">
                {score.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2 text-xs px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(109,94,245,0.08)', border: '1px solid rgba(109,94,245,0.20)', color: '#8B7CFF' }}>
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
