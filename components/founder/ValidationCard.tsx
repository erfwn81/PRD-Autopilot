'use client';

import Link from 'next/link';
import VerdictGauge from './VerdictGauge';

interface ValidationSummary {
  id: string;
  idea_input: string;
  verdict: { score?: number; recommendation?: string } | null;
  created_at: string;
}

interface ValidationCardProps {
  report: ValidationSummary;
  onDelete: () => void;
}

function relativeDate(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ValidationCard({ report, onDelete }: ValidationCardProps) {
  const score = report.verdict?.score ?? 0;
  const recommendation = report.verdict?.recommendation ?? 'validate-more';

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Delete this validation report? This cannot be undone.')) {
      onDelete();
    }
  };

  return (
    <div className="relative group">
      <Link
        href={`/validate/${report.id}`}
        className="flex items-start gap-4 p-5 rounded-2xl transition hover:-translate-y-0.5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="shrink-0">
          <VerdictGauge score={score} recommendation={recommendation} size="sm" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-medium text-white line-clamp-2 mb-1 leading-snug">
            {report.idea_input}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">{relativeDate(report.created_at)}</span>
            <span className="text-xs text-[#6D5EF5]">View report →</span>
          </div>
        </div>
      </Link>
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400 text-sm w-6 h-6 flex items-center justify-center rounded"
        title="Delete report"
      >
        ✕
      </button>
    </div>
  );
}
