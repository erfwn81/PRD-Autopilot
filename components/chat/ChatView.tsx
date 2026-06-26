'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ChatWindow from './ChatWindow';
import ChatInput, { type SendParams } from './ChatInput';
import type { ChatMessage, ChatSession } from '@/types/agent';
import type { PRDSession } from '@/types';

interface ChatViewProps {
  sessionId?: string;
  onToggleSidebar?: () => void;
  onSessionCreated?: (sessionId: string) => void;
}

export default function ChatView({ sessionId: propSessionId, onToggleSidebar, onSessionCreated }: ChatViewProps) {
  const router = useRouter();

  // Track current session id via ref (may be created lazily)
  const sessionIdRef = useRef<string | undefined>(propSessionId);

  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(!propSessionId); // no session = immediately initialized
  const [error, setError] = useState('');

  // PRD linking
  const [prdModalOpen, setPrdModalOpen] = useState(false);
  const [prdSessions, setPrdSessions] = useState<PRDSession[]>([]);
  const [linkedPrd, setLinkedPrd] = useState<{ title: string; summary: string } | null>(null);

  // Load existing session
  useEffect(() => {
    if (!propSessionId) return;

    fetch(`/api/chat/sessions/${propSessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          router.push('/dashboard');
          return;
        }
        setSession(data.session);
        setMessages(data.messages ?? []);
        sessionIdRef.current = propSessionId;
        setInitialized(true);
      })
      .catch(() => router.push('/dashboard'));
  }, [propSessionId, router]);

  // D4: Ensure session exists (for file uploads from /chat/new)
  const ensureSession = useCallback(async (): Promise<string> => {
    if (sessionIdRef.current) return sessionIdRef.current;

    const res = await fetch('/api/chat/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Chat' }),
    });
    if (!res.ok) throw new Error('Failed to create session');
    const { session: newSession } = await res.json();
    sessionIdRef.current = newSession.id;
    return newSession.id as string;
  }, []);

  const handleSend = useCallback(async ({ message, attachment_ids, attachments_context }: SendParams) => {
    const trimmed = message.trim();
    if (!trimmed && (!attachment_ids || attachment_ids.length === 0)) return;

    // Optimistic user message
    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      id: tempId,
      role: 'user',
      content: trimmed || '(attachment)',
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    setIsLoading(true);
    setError('');

    try {
      // Create session lazily if this is the first message
      let sid = sessionIdRef.current;
      const wasNew = !sid;

      if (!sid) {
        const res = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Chat' }),
        });
        if (!res.ok) throw new Error('Failed to create session');
        const { session: newSession } = await res.json();
        sid = newSession.id as string;
        sessionIdRef.current = sid;
      }

      const promptMessageId = crypto.randomUUID();
      window.pendo?.trackAgent("prompt", {
        agentId: "89TzTqgmw3HZRZkLOf584JSx47Q",
        conversationId: sid!,
        messageId: promptMessageId,
        content: trimmed,
        suggestedPrompt: false,
        fileUploaded: Array.isArray(attachment_ids) && attachment_ids.length > 0,
      });

      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sid,
          message: trimmed,
          prd_context: linkedPrd?.summary,
          attachment_ids,
          attachments_context,
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');
      const { message: assistantMsg } = await res.json();

      window.pendo?.track('chat_message_sent', {
        session_id: sid,
        message_length: trimmed.length,
        has_prd_context: !!linkedPrd,
        has_attachments: Array.isArray(attachment_ids) && attachment_ids.length > 0,
        attachment_count: attachment_ids?.length ?? 0,
        is_first_message: wasNew,
      });

      window.pendo?.trackAgent("agent_response", {
        agentId: "89TzTqgmw3HZRZkLOf584JSx47Q",
        conversationId: sid!,
        messageId: assistantMsg.id,
        content: assistantMsg.content,
        modelUsed: "llama-3.3-70b-versatile",
      });

      setMessages(prev => {
        const withoutTemp = prev.filter(m => m.id !== tempId);
        return [
          ...withoutTemp,
          { id: tempId.replace('temp-', 'user-'), role: 'user' as const, content: trimmed, created_at: new Date().toISOString() },
          assistantMsg,
        ];
      });

      // Notify parent of new session (D4 / B1 lazy creation)
      if (wasNew && sid) {
        onSessionCreated?.(sid);
        router.replace(`/chat/${sid}`);
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [linkedPrd, onSessionCreated, router]);

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
    window.pendo?.track('chat_prd_linked', {
      chat_session_id: sessionIdRef.current ?? '',
      prd_session_id: prdSession.id,
      prd_title: prdSession.title,
    });
    setPrdModalOpen(false);
  };

  const title = session?.title ?? (propSessionId ? 'Chat' : 'New Chat');

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div
        className="shrink-0 px-4 h-14 flex items-center justify-between"
        style={{ background: 'var(--surface)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-gray-500 hover:text-gray-300 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link
            href="/dashboard"
            className="hidden md:flex items-center gap-1 text-xs text-gray-500 hover:text-gray-200 transition-colors mr-1"
          >
            ← Dashboard
          </Link>
          <span className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {linkedPrd && (
            <span
              className="text-xs px-2 py-1 rounded-full hidden sm:block"
              style={{ background: 'rgba(109,94,245,0.12)', border: '1px solid rgba(109,94,245,0.20)', color: '#8B7CFF' }}
            >
              PRD: {linkedPrd.title.slice(0, 20)}
            </span>
          )}
          <button
            onClick={openPrdModal}
            className="text-xs text-gray-400 hover:text-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {linkedPrd ? 'Change PRD' : 'Link PRD'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-2xl w-full px-4 mt-2">
          <div
            className="rounded-lg px-4 py-2 text-sm text-red-300"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.20)' }}
          >
            {error}
          </div>
        </div>
      )}

      {/* Messages */}
      {!initialized ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <ChatWindow messages={messages} isLoading={isLoading} />
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            ensureSession={!propSessionId ? ensureSession : undefined}
          />
        </div>
      )}

      {/* PRD picker modal */}
      {prdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div
            className="rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[60vh] flex flex-col"
            style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white">Link a PRD</h3>
              <button onClick={() => setPrdModalOpen(false)} className="text-gray-500 hover:text-gray-300 transition-colors">×</button>
            </div>
            <p className="text-sm text-gray-400 mb-4">The AI will use your PRD as context for advice.</p>
            <div className="overflow-y-auto flex-1 space-y-2">
              {prdSessions.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No completed PRDs found.</p>
              )}
              {prdSessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleLinkPrd(s)}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(109,94,245,0.40)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                >
                  {s.title}
                </button>
              ))}
            </div>
            {linkedPrd && (
              <button
                onClick={() => { setLinkedPrd(null); setPrdModalOpen(false); }}
                className="mt-3 text-sm text-red-400 hover:text-red-300 hover:underline text-center w-full transition-colors"
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
