'use client';

import Link from 'next/link';
import type { ChatSession } from '@/types/agent';

interface ChatCardProps {
  session: ChatSession;
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

export default function ChatCard({ session, onDelete }: ChatCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Delete this chat? This cannot be undone.')) {
      onDelete();
    }
  };

  return (
    <div className="relative group">
      <Link
        href={`/chat/${session.id}`}
        className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="mb-2 pr-6">
          <h2 className="text-base font-semibold text-gray-900 line-clamp-1">{session.title}</h2>
        </div>
        {session.last_message && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            {session.last_message.slice(0, 60)}{session.last_message.length > 60 ? '...' : ''}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{relativeDate(session.updated_at)}</span>
          <span className="font-medium text-indigo-600">Open chat →</span>
        </div>
      </Link>
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 text-sm w-6 h-6 flex items-center justify-center rounded"
        title="Delete chat"
      >
        ✕
      </button>
    </div>
  );
}
