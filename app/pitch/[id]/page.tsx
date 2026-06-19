'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Slide {
  number: number;
  type: string;
  headline: string;
  bullets: string[];
  speaker_notes: string;
}

interface PitchDeck {
  id: string;
  title: string;
  slides: Slide[];
  created_at: string;
}

const SLIDE_TYPE_COLORS: Record<string, string> = {
  cover: '#6D5EF5',
  problem: '#EF4444',
  solution: '#22C55E',
  market: '#22D3EE',
  product: '#8B5CF6',
  business_model: '#F59E0B',
  competition: '#EC4899',
  traction: '#10B981',
  team: '#6366F1',
  ask: '#6D5EF5',
};

function SlideCard({ slide, index }: { slide: Slide; index: number }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const color = SLIDE_TYPE_COLORS[slide.type] ?? '#6D5EF5';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Slide header */}
      <div
        className="px-6 py-3 flex items-center gap-3"
        style={{ background: `${color}12`, borderBottom: `1px solid ${color}20` }}
      >
        <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${color}20`, color }}>
          {index + 1}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
          {slide.type.replace('_', ' ')}
        </span>
      </div>

      {/* Slide body — 16:9 feel */}
      <div
        className="px-8 py-8 min-h-[200px] flex flex-col justify-center"
        style={{ background: 'rgba(255,255,255,0.025)' }}
      >
        <h3 className="text-xl font-bold text-white mb-5 leading-snug">{slide.headline}</h3>
        {Array.isArray(slide.bullets) && slide.bullets.length > 0 && (
          <ul className="space-y-2">
            {slide.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Speaker notes */}
      {slide.speaker_notes && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setNotesOpen((o) => !o)}
            className="w-full px-6 py-2.5 text-left text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-2"
          >
            <span>{notesOpen ? '▼' : '▶'}</span>
            Speaker notes
          </button>
          {notesOpen && (
            <div className="px-6 pb-4">
              <p className="text-xs text-gray-500 leading-relaxed italic">{slide.speaker_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PitchDeckPage() {
  const router = useRouter();
  const params = useParams();
  const deckId = params.id as string;
  const [deck, setDeck] = useState<PitchDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchDeck = useCallback(async () => {
    try {
      const res = await fetch(`/api/pitch/${deckId}`);
      if (!res.ok) throw new Error('Deck not found');
      const data = await res.json();
      setDeck(data.deck);
    } catch {
      setError('Failed to load deck');
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return; }
      fetchDeck();
    });
  }, [router, fetchDeck]);

  const handleCopyMarkdown = () => {
    if (!deck) return;
    const md = [`# ${deck.title}\n`];
    for (const slide of deck.slides) {
      md.push(`## Slide ${slide.number}: ${slide.type.replace('_', ' ').toUpperCase()}`);
      md.push(`### ${slide.headline}`);
      for (const b of slide.bullets) md.push(`- ${b}`);
      if (slide.speaker_notes) md.push(`\n> ${slide.speaker_notes}`);
      md.push('');
    }
    navigator.clipboard.writeText(md.join('\n')).then(() => {
      window.pendo?.track('pitch_deck_exported', {
        deck_id: deckId,
        export_format: 'markdown',
        slide_count: deck.slides.length,
        deck_title: deck.title,
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportJSON = () => {
    if (!deck) return;
    const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.pendo?.track('pitch_deck_exported', {
      deck_id: deckId,
      export_format: 'json',
      slide_count: deck.slides.length,
      deck_title: deck.title,
    });
  };

  const handleDelete = async () => {
    if (!confirm('Delete this pitch deck? This cannot be undone.')) return;
    await fetch(`/api/pitch/${deckId}`, { method: 'DELETE' });
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
        <Header />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl shimmer-bg" />)}
        </main>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">{error || 'Deck not found'}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Pitch Deck</p>
          <h1 className="text-2xl font-bold text-white mb-4">{deck.title}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleCopyMarkdown}
              className="btn-ghost px-4 py-2 rounded-xl text-sm"
            >
              {copied ? '✓ Copied!' : 'Copy as Markdown'}
            </button>
            <button
              onClick={handleExportJSON}
              className="btn-ghost px-4 py-2 rounded-xl text-sm"
            >
              Export JSON
            </button>
            <button
              onClick={handleDelete}
              className="ml-auto px-4 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 transition-colors"
              style={{ border: '1px solid rgba(239,68,68,0.20)' }}
            >
              Delete
            </button>
          </div>
        </div>

        {/* Slides */}
        <div className="space-y-4">
          {(deck.slides ?? []).map((slide, i) => (
            <SlideCard key={slide.number ?? i} slide={slide} index={i} />
          ))}
        </div>

      </main>
      <Footer />
    </div>
  );
}
