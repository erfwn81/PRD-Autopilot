'use client';

import Link from 'next/link';
import type { ChatSession } from '@/types/agent';

interface ChatCardProps {
  session: ChatSession;
  onDelete: () => void;
}

function relativeDate(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ChatCard({ session, onDelete }: ChatCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Delete this chat?')) onDelete();
  };

  return (
    <div className="relative group">
      <Link
        href={`/chat/${session.id}`}
        className="block rounded-2xl p-5 transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = 'rgba(34,211,238,0.25)';
          el.style.transform = 'translateY(-2px)';
          el.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = 'rgba(255,255,255,0.07)';
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = 'none';
        }}
      >
        <div className="flex items-center gap-2 mb-2 pr-5">
          <span className="text-accent text-xs">💬</span>
          <h2 className="text-sm font-semibold text-white line-clamp-1">{session.title}</h2>
        </div>
        {session.last_message && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-4">
            {session.last_message.slice(0, 80)}{session.last_message.length > 80 ? '…' : ''}
          </p>
        )}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">{relativeDate(session.updated_at)}</span>
          <span className="text-accent font-medium">Open →</span>
        </div>
      </Link>
      <button onClick={handleDelete}
        className="absolute top-4 right-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-gray-600 hover:text-danger w-5 h-5 flex items-center justify-center rounded text-xs"
        title="Delete">✕</button>
    </div>
  );
}
