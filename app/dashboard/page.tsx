'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import PRDCard from '@/components/dashboard/PRDCard';
import ChatCard from '@/components/dashboard/ChatCard';
import { createClient } from '@/lib/supabase/client';
import type { PRDSession } from '@/types';
import type { ChatSession } from '@/types/agent';

type Tab = 'prds' | 'chats';

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('prds');
  const [prdSessions, setPrdSessions] = useState<PRDSession[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [prdLoading, setPrdLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUserEmail(user.email ?? '');

      supabase
        .from('prd_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setPrdSessions((data as PRDSession[]) ?? []);
          setPrdLoading(false);
        });
    });
  }, [router]);

  useEffect(() => {
    if (tab !== 'chats' || chatSessions.length > 0) return;
    setChatLoading(true);
    fetch('/api/chat/sessions')
      .then((r) => r.json())
      .then((data) => {
        setChatSessions(data.sessions ?? []);
        setChatLoading(false);
      })
      .catch(() => setChatLoading(false));
  }, [tab, chatSessions.length]);

  const handleDeletePrd = async (sessionId: string) => {
    const supabase = createClient();
    await supabase.from('prd_sessions').delete().eq('id', sessionId);
    setPrdSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleDeleteChat = async (sessionId: string) => {
    await fetch(`/api/chat/sessions/${sessionId}`, { method: 'DELETE' });
    setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleNewChat = async () => {
    router.push('/chat/new');
  };

  const displayName = userEmail.split('@')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {/* Header row */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Dashboard</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Welcome back{displayName ? `, ${displayName}` : ''}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleNewChat}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              New Chat
            </button>
            <Link
              href="/new"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              New PRD →
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-6 border-b border-gray-200">
          {(['prds', 'chats'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'prds' ? 'PRDs' : 'Chats'}
            </button>
          ))}
        </div>

        {/* PRDs tab */}
        {tab === 'prds' && (
          <>
            {prdLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-36 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : prdSessions.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">No PRDs yet</h2>
                <p className="mt-2 text-sm text-gray-500">Start with a rough feature idea and PRD Autopilot will interview you.</p>
                <Link href="/new" className="mt-5 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                  Start your first PRD →
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {prdSessions.map((session) => (
                  <PRDCard key={session.id} session={session} onDelete={() => handleDeletePrd(session.id)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Chats tab */}
        {tab === 'chats' && (
          <>
            {chatLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : chatSessions.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">No chats yet</h2>
                <p className="mt-2 text-sm text-gray-500">Chat with your AI PM coach about product strategy, PRDs, and more.</p>
                <button
                  onClick={handleNewChat}
                  className="mt-5 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Start a chat →
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {chatSessions.map((session) => (
                  <ChatCard key={session.id} session={session} onDelete={() => handleDeleteChat(session.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
