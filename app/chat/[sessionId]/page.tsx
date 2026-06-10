'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatInput from '@/components/chat/ChatInput';
import type { ChatMessage, ChatSession } from '@/types/agent';
import type { PRDSession } from '@/types';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState('');

  // PRD linking
  const [prdModalOpen, setPrdModalOpen] = useState(false);
  const [prdSessions, setPrdSessions] = useState<PRDSession[]>([]);
  const [linkedPrd, setLinkedPrd] = useState<{ title: string; summary: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }
    });

    fetch(`/api/chat/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push('/dashboard');
          return;
        }
        setSession(data.session);
        setMessages(data.messages ?? []);
        setInitialized(true);
      })
      .catch(() => router.push('/dashboard'));
  }, [sessionId, router]);

  const handleSend = useCallback(async (content: string) => {
    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: content,
          prd_context: linkedPrd?.summary,
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');
      const { message: assistantMsg } = await res.json();

      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempMsg.id);
        return [
          ...withoutTemp,
          { id: tempMsg.id.replace('temp-', 'user-'), role: 'user' as const, content, created_at: new Date().toISOString() },
          assistantMsg,
        ];
      });
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, linkedPrd]);

  const openPrdModal = async () => {
    setPrdModalOpen(true);
    if (prdSessions.length > 0) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('prd_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'complete')
      .order('created_at', { ascending: false });
    setPrdSessions((data as PRDSession[]) ?? []);
  };

  const handleLinkPrd = async (prdSession: PRDSession) => {
    const supabase = createClient();
    const { data: prdDoc } = await supabase
      .from('prd_documents')
      .select('problem_statement, user_stories, jobs_to_be_done')
      .eq('session_id', prdSession.id)
      .single();

    const summary = prdDoc
      ? `Title: ${prdSession.title}\nProblem: ${prdDoc.problem_statement ?? ''}\nJobs to be done: ${(prdDoc.jobs_to_be_done ?? []).slice(0, 3).join(', ')}`
      : `Title: ${prdSession.title}`;

    setLinkedPrd({ title: prdSession.title, summary });
    setPrdModalOpen(false);
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
          <span className="text-sm font-semibold text-gray-900 truncate max-w-xs">{session?.title ?? 'Chat'}</span>
        </div>
        <div className="flex items-center gap-2">
          {linkedPrd && (
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              PRD: {linkedPrd.title.slice(0, 20)}
            </span>
          )}
          <button
            onClick={openPrdModal}
            className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
          >
            {linkedPrd ? 'Change PRD' : 'Link PRD'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-2xl w-full px-4 mt-2">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Chat window */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <ChatWindow messages={messages} isLoading={isLoading} />
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>

      {/* PRD picker modal */}
      {prdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[60vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Link a PRD</h3>
              <button onClick={() => setPrdModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">The AI will use your PRD as context for advice.</p>
            <div className="overflow-y-auto flex-1 space-y-2">
              {prdSessions.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No completed PRDs found.</p>
              )}
              {prdSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleLinkPrd(s)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-sm text-gray-900"
                >
                  {s.title}
                </button>
              ))}
            </div>
            {linkedPrd && (
              <button
                onClick={() => { setLinkedPrd(null); setPrdModalOpen(false); }}
                className="mt-3 text-sm text-red-600 hover:underline text-center w-full"
              >
                Remove PRD link
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
