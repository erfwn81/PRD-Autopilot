'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { PRDSession } from '@/types';

type SourceMode = 'idea' | 'prd' | 'validation';

interface ValidationSummary {
  id: string;
  idea_input: string;
  verdict: { score?: number } | null;
  created_at: string;
}

const PROGRESS_MESSAGES = [
  'Structuring your narrative...',
  'Writing the problem slide...',
  'Crafting the solution story...',
  'Building market slides...',
  'Finishing the deck...',
];

export default function PitchPage() {
  const router = useRouter();
  const [sourceMode, setSourceMode] = useState<SourceMode>('idea');
  const [idea, setIdea] = useState('');
  const [prdSessions, setPrdSessions] = useState<PRDSession[]>([]);
  const [validations, setValidations] = useState<ValidationSummary[]>([]);
  const [selectedPrd, setSelectedPrd] = useState('');
  const [selectedValidation, setSelectedValidation] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressIdx, setProgressIdx] = useState(0);
  const [error, setError] = useState('');
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login?redirectTo=/pitch'); return; }

      setDataLoading(true);
      Promise.all([
        supabase
          .from('prd_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'complete')
          .order('created_at', { ascending: false }),
        fetch('/api/validation/list').then(r => r.json()),
      ]).then(([prdRes, valData]) => {
        setPrdSessions((prdRes.data ?? []) as PRDSession[]);
        setValidations(valData.reports ?? []);
        setDataLoading(false);
      }).catch(() => setDataLoading(false));
    });
  }, [router]);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setProgressIdx((i) => (i + 1) % PROGRESS_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setProgressIdx(0);

    const body: Record<string, string> = {};
    if (sourceMode === 'idea') {
      body.idea = idea.trim();
    } else if (sourceMode === 'prd') {
      body.prd_session_id = selectedPrd;
    } else {
      body.validation_id = selectedValidation;
    }

    try {
      const res = await fetch('/api/pitch/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      router.push(`/pitch/${data.deck_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const canSubmit =
    (sourceMode === 'idea' && idea.trim().length > 0) ||
    (sourceMode === 'prd' && selectedPrd) ||
    (sourceMode === 'validation' && selectedValidation);

  const modes: { id: SourceMode; label: string; icon: string }[] = [
    { id: 'idea', label: 'From an idea', icon: '💡' },
    { id: 'prd', label: 'From a PRD', icon: '📄' },
    { id: 'validation', label: 'From a validation', icon: '🔍' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl mb-4"
              style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.20)' }}
            >
              📊
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Pitch Deck Generator</h1>
            <p className="text-gray-400 max-w-md mx-auto">
              Turn your idea, PRD, or validation report into a structured 10-slide investor deck.
            </p>
          </div>

          <form onSubmit={handleGenerate}>
            <div
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Source mode selector */}
              <div className="flex gap-2 mb-6">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSourceMode(m.id)}
                    className="flex-1 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={sourceMode === m.id ? {
                      background: 'rgba(109,94,245,0.15)',
                      border: '1px solid rgba(109,94,245,0.30)',
                      color: '#fff',
                    } : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: '#9ca3af',
                    }}
                  >
                    <span className="block text-base mb-1">{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Source-specific input */}
              {sourceMode === 'idea' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Describe your startup idea</label>
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="e.g. An AI tool that automatically writes weekly status reports from your team's Slack and Jira..."
                    rows={4}
                    disabled={loading}
                    className="w-full resize-none rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none transition"
                    style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#6D5EF5'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  />
                </div>
              )}

              {sourceMode === 'prd' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select a completed PRD</label>
                  {dataLoading ? (
                    <div className="h-10 rounded-xl shimmer-bg" />
                  ) : prdSessions.length === 0 ? (
                    <p className="text-sm text-gray-500">No completed PRDs found. <a href="/new" className="text-[#6D5EF5] hover:underline">Create one →</a></p>
                  ) : (
                    <select
                      value={selectedPrd}
                      onChange={(e) => setSelectedPrd(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-200 outline-none"
                      style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <option value="">— select a PRD —</option>
                      {prdSessions.map((s) => (
                        <option key={s.id} value={s.id}>{s.title || s.initial_input.slice(0, 60)}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {sourceMode === 'validation' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select a validation report</label>
                  {dataLoading ? (
                    <div className="h-10 rounded-xl shimmer-bg" />
                  ) : validations.length === 0 ? (
                    <p className="text-sm text-gray-500">No validation reports found. <a href="/validate" className="text-[#6D5EF5] hover:underline">Validate an idea →</a></p>
                  ) : (
                    <select
                      value={selectedValidation}
                      onChange={(e) => setSelectedValidation(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-200 outline-none"
                      style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <option value="">— select a validation report —</option>
                      {validations.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.idea_input.slice(0, 60)}{v.idea_input.length > 60 ? '...' : ''}
                          {v.verdict?.score !== undefined ? ` (${v.verdict.score}/100)` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {error && (
                <div
                  className="mb-4 rounded-xl px-4 py-3 text-sm text-red-300"
                  style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}
                >
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-2">
                  <div className="flex justify-center gap-1.5 mb-3">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: '#22D3EE', animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">{PROGRESS_MESSAGES[progressIdx]}</p>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="btn-primary w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none"
                >
                  Generate Deck →
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
