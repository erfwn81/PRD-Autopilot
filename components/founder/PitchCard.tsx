'use client';

import Link from 'next/link';

interface PitchSummary {
  id: string;
  title: string;
  created_at: string;
}

interface PitchCardProps {
  deck: PitchSummary;
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

export default function PitchCard({ deck, onDelete }: PitchCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Delete this pitch deck? This cannot be undone.')) {
      onDelete();
    }
  };

  return (
    <div className="relative group">
      <Link
        href={`/pitch/${deck.id}`}
        className="block p-5 rounded-2xl transition hover:-translate-y-0.5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-start justify-between gap-3 pr-4 mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.20)' }}
          >
            📊
          </div>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-1"
            style={{ background: 'rgba(34,211,238,0.10)', color: '#22D3EE' }}
          >
            10 slides
          </span>
        </div>
        <h2 className="text-sm font-semibold text-white line-clamp-2 mb-2">{deck.title}</h2>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{relativeDate(deck.created_at)}</span>
          <span className="text-[#22D3EE]">View deck →</span>
        </div>
      </Link>
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400 text-sm w-6 h-6 flex items-center justify-center rounded"
        title="Delete deck"
      >
        ✕
      </button>
    </div>
  );
}
