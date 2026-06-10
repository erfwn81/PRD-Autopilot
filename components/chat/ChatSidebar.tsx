'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ChatSession } from '@/types/agent';

interface ChatSidebarProps {
  activeSessionId?: string;
  refreshKey?: number;
  isOpen?: boolean;         // mobile: overlay visibility
  onClose?: () => void;     // mobile: close overlay
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ChatSidebar({ activeSessionId, refreshKey, isOpen, onClose }: ChatSidebarProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(() => {
    setLoading(true);
    fetch('/api/chat/sessions')
      .then(r => r.json())
      .then(data => setSessions(data.sessions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions, refreshKey]);

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this chat? This cannot be undone.')) return;

    await fetch(`/api/chat/sessions/${sessionId}`, { method: 'DELETE' });
    setSessions(prev => prev.filter(s => s.id !== sessionId));

    if (sessionId === activeSessionId) {
      router.push('/chat/new');
    }
  };

  const handleSelectSession = () => {
    onClose?.();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
      {/* New chat button */}
      <div className="p-3 border-b border-gray-200">
        <Link
          href="/chat/new"
          onClick={onClose}
          className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <span>+</span>
          <span>New Chat</span>
        </Link>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="px-3 py-4 space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="px-3 py-4 text-xs text-gray-400 text-center">No chats yet</p>
        ) : (
          sessions.map(session => (
            <div key={session.id} className="relative group px-2">
              <Link
                href={`/chat/${session.id}`}
                onClick={handleSelectSession}
                className={`flex flex-col px-3 py-2.5 rounded-lg text-left w-full transition-colors ${
                  session.id === activeSessionId
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xs font-medium truncate leading-snug">
                  {session.title || 'Untitled chat'}
                </span>
                <div className="flex items-center justify-between mt-0.5">
                  {session.last_message && (
                    <span className="text-xs text-gray-400 truncate flex-1 mr-2">
                      {session.last_message}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 shrink-0">
                    {relativeTime(session.updated_at)}
                  </span>
                </div>
              </Link>
              {/* Delete button — revealed on hover */}
              <button
                onClick={(e) => handleDelete(e, session.id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 w-6 h-6 flex items-center justify-center rounded text-xs"
                title="Delete chat"
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>

      {/* Dashboard link */}
      <div className="p-3 border-t border-gray-200">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <span>←</span>
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:shrink-0 md:flex-col h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-72 shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
