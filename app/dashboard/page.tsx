'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import PRDCard from '@/components/dashboard/PRDCard';
import ChatCard from '@/components/dashboard/ChatCard';
import ValidationCard from '@/components/founder/ValidationCard';
import PitchCard from '@/components/founder/PitchCard';
import { createClient } from '@/lib/supabase/client';
import type { PRDSession } from '@/types';
import type { ChatSession } from '@/types/agent';

type Tab = 'prds' | 'chats' | 'validation' | 'pitch';

interface ValidationSummary {
  id: string;
  idea_input: string;
  verdict: { score?: number; recommendation?: string } | null;
  created_at: string;
}

interface PitchSummary {
  id: string;
  title: string;
  created_at: string;
}

const QUICK_ACTIONS = [
  { icon: '🔍', label: 'Validate Idea', href: '/validate', color: '#6D5EF5' },
  { icon: '📝', label: 'New PRD', href: '/new', color: '#8B5CF6' },
  { icon: '📊', label: 'Pitch Deck', href: '/pitch', color: '#22D3EE' },
  { icon: '💬', label: 'AI Chat', href: '/chat/new', color: '#22C55E' },
];

function ShimmerCard() {
  return <div className="h-32 rounded-2xl shimmer-bg" style={{ border: '1px solid rgba(255,255,255,0.06)' }} />;
}

function EmptyState({ title, desc, cta, href }: { title: string; desc: string; cta: string; href: string }) {
  return (
    <div
      className="col-span-2 rounded-2xl p-12 text-center"
      style={{ border: '1px dashed rgba(255,255,255,0.10)' }}
    >
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-5">{desc}</p>
      <Link href={href} className="btn-primary text-sm px-5 py-2.5 rounded-xl inline-flex">
        {cta}
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('prds');
  const [prdSessions, setPrdSessions] = useState<PRDSession[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [validations, setValidations] = useState<ValidationSummary[]>([]);
  const [pitchDecks, setPitchDecks] = useState<PitchSummary[]>([]);
  const [prdLoading, setPrdLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [pitchLoading, setPitchLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return; }
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
      .then((data) => { setChatSessions(data.sessions ?? []); setChatLoading(false); })
      .catch(() => setChatLoading(false));
  }, [tab, chatSessions.length]);

  useEffect(() => {
    if (tab !== 'validation' || validations.length > 0) return;
    setValidationLoading(true);
    fetch('/api/validation/list')
      .then((r) => r.json())
      .then((data) => { setValidations(data.reports ?? []); setValidationLoading(false); })
      .catch(() => setValidationLoading(false));
  }, [tab, validations.length]);

  useEffect(() => {
    if (tab !== 'pitch' || pitchDecks.length > 0) return;
    setPitchLoading(true);
    fetch('/api/pitch/list')
      .then((r) => r.json())
      .then((data) => { setPitchDecks(data.decks ?? []); setPitchLoading(false); })
      .catch(() => setPitchLoading(false));
  }, [tab, pitchDecks.length]);

  const handleDeletePrd = async (sessionId: string) => {
    const supabase = createClient();
    await supabase.from('prd_sessions').delete().eq('id', sessionId);
    setPrdSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleDeleteChat = async (sessionId: string) => {
    await fetch(`/api/chat/sessions/${sessionId}`, { method: 'DELETE' });
    setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleDeleteValidation = async (id: string) => {
    await fetch(`/api/validation/${id}`, { method: 'DELETE' });
    setValidations((prev) => prev.filter((v) => v.id !== id));
  };

  const handleDeletePitch = async (id: string) => {
    await fetch(`/api/pitch/${id}`, { method: 'DELETE' });
    setPitchDecks((prev) => prev.filter((d) => d.id !== id));
  };

  const displayName = userEmail.split('@')[0];

  const tabs: { id: Tab; label: string }[] = [
    { id: 'prds', label: 'PRDs' },
    { id: 'chats', label: 'Chats' },
    { id: 'validation', label: 'Validation' },
    { id: 'pitch', label: 'Pitch Decks' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">

        {/* Header row */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--primary)' }}>Dashboard</p>
          <h1 className="text-3xl font-bold text-white">
            Welcome back{displayName ? `, ${displayName}` : ''}
          </h1>
        </div>

        {/* Quick action tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-2xl p-4 flex flex-col items-center gap-2 text-center transition hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `${action.color}15`, border: `1px solid ${action.color}25` }}
              >
                {action.icon}
              </span>
              <span className="text-xs font-medium text-gray-300">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px"
              style={tab === t.id ? {
                borderColor: 'var(--primary)',
                color: '#fff',
              } : {
                borderColor: 'transparent',
                color: '#6b7280',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* PRDs tab */}
        {tab === 'prds' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {prdLoading
              ? [1, 2].map(i => <ShimmerCard key={i} />)
              : prdSessions.length === 0
              ? <EmptyState title="No PRDs yet" desc="Start with a rough idea and let AI build your first PRD." cta="Create your first PRD →" href="/new" />
              : prdSessions.map((session) => (
                <PRDCard key={session.id} session={session} onDelete={() => handleDeletePrd(session.id)} />
              ))
            }
          </div>
        )}

        {/* Chats tab */}
        {tab === 'chats' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {chatLoading
              ? [1, 2].map(i => <ShimmerCard key={i} />)
              : chatSessions.length === 0
              ? <EmptyState title="No chats yet" desc="Chat with your AI PM coach about strategy, roadmaps, and more." cta="Start a chat →" href="/chat/new" />
              : chatSessions.map((session) => (
                <ChatCard key={session.id} session={session} onDelete={() => handleDeleteChat(session.id)} />
              ))
            }
          </div>
        )}

        {/* Validation tab */}
        {tab === 'validation' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {validationLoading
              ? [1, 2].map(i => <ShimmerCard key={i} />)
              : validations.length === 0
              ? <EmptyState title="No validations yet" desc="Validate a startup idea with AI-powered market research and competitor analysis." cta="Validate an idea →" href="/validate" />
              : validations.map((report) => (
                <ValidationCard key={report.id} report={report} onDelete={() => handleDeleteValidation(report.id)} />
              ))
            }
          </div>
        )}

        {/* Pitch Decks tab */}
        {tab === 'pitch' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {pitchLoading
              ? [1, 2].map(i => <ShimmerCard key={i} />)
              : pitchDecks.length === 0
              ? <EmptyState title="No pitch decks yet" desc="Turn your idea or PRD into a structured 10-slide investor deck." cta="Create a deck →" href="/pitch" />
              : pitchDecks.map((deck) => (
                <PitchCard key={deck.id} deck={deck} onDelete={() => handleDeletePitch(deck.id)} />
              ))
            }
          </div>
        )}

      </main>
    </div>
  );
}
