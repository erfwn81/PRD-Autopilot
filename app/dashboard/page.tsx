'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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
  return (
    <div className="rounded-2xl p-5 h-36 shimmer-bg" style={{ border: '1px solid rgba(255,255,255,0.06)' }} />
  );
}

function EmptyPRDs() {
  return (
    <div className="col-span-2 rounded-2xl p-12 text-center" style={{ border: '1px dashed rgba(255,255,255,0.10)' }}>
      <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 48 48">
        <rect x="8" y="4" width="32" height="40" rx="4" stroke="#6D5EF5" strokeWidth="2"/>
        <line x1="16" y1="16" x2="32" y2="16" stroke="#6D5EF5" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16" y1="22" x2="32" y2="22" stroke="#6D5EF5" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16" y1="28" x2="24" y2="28" stroke="#6D5EF5" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <h3 className="text-base font-semibold text-white mb-2">No PRDs yet</h3>
      <p className="text-sm text-gray-500 mb-5">Start with a rough idea and let AI build your first PRD.</p>
      <Link href="/new" className="btn-primary text-sm px-5 py-2.5 rounded-xl inline-flex">
        Create your first PRD →
      </Link>
    </div>
  );
}

function EmptyChats() {
  return (
    <div className="col-span-2 rounded-2xl p-12 text-center" style={{ border: '1px dashed rgba(255,255,255,0.10)' }}>
      <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 48 48">
        <path d="M8 8h32a4 4 0 014 4v20a4 4 0 01-4 4H28l-8 8v-8H8a4 4 0 01-4-4V12a4 4 0 014-4z" stroke="#22D3EE" strokeWidth="2"/>
        <line x1="16" y1="18" x2="32" y2="18" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16" y1="24" x2="28" y2="24" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <h3 className="text-base font-semibold text-white mb-2">No chats yet</h3>
      <p className="text-sm text-gray-500 mb-5">Chat with your AI PM coach about strategy, roadmaps, and more.</p>
      <Link href="/chat/new" className="btn-ghost text-sm px-5 py-2.5 rounded-xl inline-flex">
        Start a chat →
      </Link>
    </div>
  );
}

function EmptyValidation() {
  return (
    <div className="col-span-2 rounded-2xl p-12 text-center" style={{ border: '1px dashed rgba(255,255,255,0.10)' }}>
      <h3 className="text-base font-semibold text-white mb-2">No validations yet</h3>
      <p className="text-sm text-gray-500 mb-5">Validate a startup idea with AI-powered market research and competitor analysis.</p>
      <Link href="/validate" className="btn-primary text-sm px-5 py-2.5 rounded-xl inline-flex">
        Validate an idea →
      </Link>
    </div>
  );
}

function EmptyPitch() {
  return (
    <div className="col-span-2 rounded-2xl p-12 text-center" style={{ border: '1px dashed rgba(255,255,255,0.10)' }}>
      <h3 className="text-base font-semibold text-white mb-2">No pitch decks yet</h3>
      <p className="text-sm text-gray-500 mb-5">Turn your idea or PRD into a structured 10-slide investor deck.</p>
      <Link href="/pitch" className="btn-primary text-sm px-5 py-2.5 rounded-xl inline-flex">
        Create a deck →
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
      .then(r => r.json())
      .then(d => { setChatSessions(d.sessions ?? []); setChatLoading(false); })
      .catch(() => setChatLoading(false));
  }, [tab, chatSessions.length]);

  useEffect(() => {
    if (tab !== 'validation' || validations.length > 0) return;
    setValidationLoading(true);
    fetch('/api/validation/list')
      .then(r => r.json())
      .then(d => { setValidations(d.reports ?? []); setValidationLoading(false); })
      .catch(() => setValidationLoading(false));
  }, [tab, validations.length]);

  useEffect(() => {
    if (tab !== 'pitch' || pitchDecks.length > 0) return;
    setPitchLoading(true);
    fetch('/api/pitch/list')
      .then(r => r.json())
      .then(d => { setPitchDecks(d.decks ?? []); setPitchLoading(false); })
      .catch(() => setPitchLoading(false));
  }, [tab, pitchDecks.length]);

  const handleDeletePrd = async (id: string) => {
    const supabase = createClient();
    await supabase.from('prd_sessions').delete().eq('id', id);
    setPrdSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleDeleteChat = async (id: string) => {
    await fetch(`/api/chat/sessions/${id}`, { method: 'DELETE' });
    setChatSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleDeleteValidation = async (id: string) => {
    await fetch(`/api/validation/${id}`, { method: 'DELETE' });
    setValidations(prev => prev.filter(v => v.id !== id));
  };

  const handleDeletePitch = async (id: string) => {
    await fetch(`/api/pitch/${id}`, { method: 'DELETE' });
    setPitchDecks(prev => prev.filter(d => d.id !== id));
  };

  const displayName = userEmail.split('@')[0];

  const tabs: { id: Tab; label: string }[] = [
    { id: 'prds', label: 'PRDs' },
    { id: 'chats', label: 'Chats' },
    { id: 'validation', label: 'Validation' },
    { id: 'pitch', label: 'Pitch Decks' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-10">

        {/* Welcome heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Dashboard</p>
            <h1
              className="text-2xl sm:text-3xl font-bold"
              style={{
                background: 'linear-gradient(135deg,#fff 40%,#8B7CFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {displayName ? `Welcome back, ${displayName}` : 'Your workspace'}
            </h1>
          </div>
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
        <div
          className="flex gap-0 mb-6"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all"
              style={tab === t.id
                ? { borderColor: '#6D5EF5', color: '#8B7CFF' }
                : { borderColor: 'transparent', color: '#6b7280' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* PRDs */}
        {tab === 'prds' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {prdLoading
              ? [1, 2].map(i => <ShimmerCard key={i} />)
              : prdSessions.length === 0
              ? <EmptyPRDs />
              : prdSessions.map(s => (
                <PRDCard key={s.id} session={s} onDelete={() => handleDeletePrd(s.id)} />
              ))
            }
          </div>
        )}

        {/* Chats */}
        {tab === 'chats' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {chatLoading
              ? [1, 2].map(i => <ShimmerCard key={i} />)
              : chatSessions.length === 0
              ? <EmptyChats />
              : chatSessions.map(s => (
                <ChatCard key={s.id} session={s} onDelete={() => handleDeleteChat(s.id)} />
              ))
            }
          </div>
        )}

        {/* Validation */}
        {tab === 'validation' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {validationLoading
              ? [1, 2].map(i => <ShimmerCard key={i} />)
              : validations.length === 0
              ? <EmptyValidation />
              : validations.map(r => (
                <ValidationCard key={r.id} report={r} onDelete={() => handleDeleteValidation(r.id)} />
              ))
            }
          </div>
        )}

        {/* Pitch Decks */}
        {tab === 'pitch' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {pitchLoading
              ? [1, 2].map(i => <ShimmerCard key={i} />)
              : pitchDecks.length === 0
              ? <EmptyPitch />
              : pitchDecks.map(d => (
                <PitchCard key={d.id} deck={d} onDelete={() => handleDeletePitch(d.id)} />
              ))
            }
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
