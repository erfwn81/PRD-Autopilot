'use client';

import Link from 'next/link';
import type { PRDSession } from '@/types';

interface PRDCardProps {
  session: PRDSession;
  onDelete: () => void;
}

function statusClasses(status: PRDSession['status']) {
  if (status === 'complete') return 'bg-green-100 text-green-700';
  if (status === 'generating') return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-700';
}

function relativeDate(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PRDCard({ session, onDelete }: PRDCardProps) {
  const href = session.status === 'complete' ? `/prd/${session.id}/result` : `/prd/${session.id}`;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Delete this PRD? This cannot be undone.')) {
      onDelete();
    }
  };

  return (
    <div className="relative group">
      <Link
        href={href}
        className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="mb-3 flex items-start justify-between gap-3 pr-6">
          <h2 className="line-clamp-2 text-base font-semibold text-gray-900">
            {session.title || 'Untitled PRD'}
          </h2>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(session.status)}`}>
            {session.status}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-gray-500 mb-4">{session.initial_input}</p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{relativeDate(session.created_at)}</span>
          <span className="font-medium text-indigo-600">
            {session.status === 'complete' ? 'View PRD →' : 'Continue →'}
          </span>
        </div>
      </Link>
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 text-sm w-6 h-6 flex items-center justify-center rounded"
        title="Delete PRD"
      >
        ✕
      </button>
    </div>
  );
}
