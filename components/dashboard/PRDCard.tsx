'use client';

import Link from 'next/link';
import type { PRDSession } from '@/types';

interface PRDCardProps {
  session: PRDSession;
  onDelete: () => void;
}

const statusDot: Record<PRDSession['status'], string> = {
  complete:     'bg-success',
  generating:   'bg-warning animate-pulse',
  interviewing: 'bg-primary animate-pulse',
};
const statusLabel: Record<PRDSession['status'], string> = {
  complete:     'Complete',
  generating:   'Generating',
  interviewing: 'Interview',
};

function relativeDate(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PRDCard({ session, onDelete }: PRDCardProps) {
  const href = session.status === 'complete' ? `/prd/${session.id}/result` : `/prd/${session.id}`;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Delete this PRD? This cannot be undone.')) onDelete();
  };

  return (
    <div className="relative group">
      <Link
        href={href}
        className="block rounded-2xl p-5 transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = 'rgba(109,94,245,0.30)';
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
        <div className="flex items-start justify-between gap-3 mb-3 pr-5">
          <h2 className="text-sm font-semibold text-white line-clamp-2 leading-snug">
            {session.title || 'Untitled PRD'}
          </h2>
          <span className="flex items-center gap-1.5 shrink-0 text-xs font-medium"
            style={{ color: session.status === 'complete' ? '#34D399' : session.status === 'generating' ? '#FBBF24' : '#8B7CFF' }}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot[session.status]}`} />
            {statusLabel[session.status]}
          </span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 mb-4">{session.initial_input}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">{relativeDate(session.created_at)}</span>
          <span className="text-primary font-medium">
            {session.status === 'complete' ? 'View PRD →' : 'Continue →'}
          </span>
        </div>
      </Link>
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-gray-600 hover:text-danger w-5 h-5 flex items-center justify-center rounded text-xs"
        title="Delete"
      >
        ✕
      </button>
    </div>
  );
}
