'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const PROGRESS_MESSAGES = [
  'Researching market size...',
  'Scanning competitors...',
  'Profiling your customer...',
  'Assessing risks...',
  'Building SWOT analysis...',
  'Forming the verdict...',
];

export default function ValidatePage() {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressIdx, setProgressIdx] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth/login?redirectTo=/validate');
    });
  }, [router]);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setProgressIdx((i) => (i + 1) % PROGRESS_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || loading) return;
    setLoading(true);
    setError('');
    setProgressIdx(0);

    try {
      const res = await fetch('/api/validation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      window.pendo?.track('validation_report_generated', {
        report_id: data.report_id,
        idea_input_length: idea.trim().length,
      });
      router.push(`/validate/${data.report_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          {/* Hero text */}
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl mb-4"
              style={{ background: 'rgba(109,94,245,0.12)', border: '1px solid rgba(109,94,245,0.20)' }}
            >
              🔍
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Validate Your Idea</h1>
            <p className="text-gray-400 max-w-md mx-auto">
              AI-powered market research, competitor analysis, and a go/no-go verdict in under 60 seconds.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Describe your startup idea
              </label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g. A marketplace for freelance product managers where companies can hire PMs by the sprint rather than full-time..."
                rows={5}
                maxLength={1000}
                disabled={loading}
                className="w-full resize-none rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none transition"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#6D5EF5'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(109,94,245,0.15)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              <div className="flex items-center justify-between mt-1 mb-4">
                <span className="text-xs text-gray-600">{idea.length}/1000</span>
              </div>

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
                        style={{ background: '#6D5EF5', animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 transition-all">{PROGRESS_MESSAGES[progressIdx]}</p>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!idea.trim()}
                  className="btn-primary w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none"
                >
                  Validate Idea →
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
