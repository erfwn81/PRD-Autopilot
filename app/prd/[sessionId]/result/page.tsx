'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import PRDDocument from '@/components/prd/PRDDocument';
import ExportBar from '@/components/prd/ExportBar';
import ScoringWidget from '@/components/prd/ScoringWidget';
import ShareModal from '@/components/prd/ShareModal';
import TicketBreakdown from '@/components/prd/TicketBreakdown';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { PRDDocument as PRDDocType } from '@/types';
import type { PRDScore, TicketEpic } from '@/types/agent';

const LOADING_MESSAGES = [
  'Defining the problem space...',
  'Building user personas...',
  'Writing user stories...',
  'Mapping acceptance criteria...',
  'Drafting your rollout plan...',
  'Finalising the PRD...',
];

const SWARM_MESSAGES = [
  'Running 5 specialized agents in parallel...',
  'Agent 1: Analyzing user personas...',
  'Agent 2: Defining the problem...',
  'Agent 3: Writing user stories...',
  'Agent 4: Mapping acceptance criteria...',
  'Agent 5: Building metrics and rollout plan...',
];

export default function ResultPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [prd, setPrd] = useState<PRDDocType | null>(null);
  const [livePrd, setLivePrd] = useState<PRDDocType | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState('');

  // New feature states
  const [swarmLoading, setSwarmLoading] = useState(false);
  const [swarmMsg, setSwarmMsg] = useState(SWARM_MESSAGES[0]);
  const [score, setScore] = useState<PRDScore | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [tickets, setTickets] = useState<{ epics: TicketEpic[] } | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  useEffect(() => {
    if (!loading) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!swarmLoading) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % SWARM_MESSAGES.length;
      setSwarmMsg(SWARM_MESSAGES[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [swarmLoading]);

  // Keep livePrd in sync when prd first loads
  useEffect(() => {
    if (prd && !livePrd) {
      setLivePrd(prd);
    }
  }, [prd, livePrd]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/prd/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? 'Failed to generate PRD');
        }
        const { prd: prdData } = await res.json();
        setPrd(prdData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  const handleSectionSave = async (section: string, value: unknown) => {
    const res = await fetch('/api/prd/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, section, value }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? 'Failed to save section');
    }
    window.pendo?.track('prd_section_edited', {
      session_id: sessionId,
      section_name: section,
      section_type: typeof value === 'string' ? 'text' : 'structured',
    });
  };

  const handleRegenerate = async () => {
    setSwarmLoading(true);
    setSwarmMsg(SWARM_MESSAGES[0]);
    try {
      const res = await fetch('/api/prd/generate-swarm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error('Re-generation failed');
      const { prd: newPrd } = await res.json();
      window.pendo?.track('prd_regenerated', {
        session_id: sessionId,
      });
      setPrd(newPrd);
      setLivePrd(newPrd);
      setScore(null);
    } catch {
      setError('Re-generation failed. Please try again.');
    } finally {
      setSwarmLoading(false);
    }
  };

  const handleScore = async () => {
    setScoreLoading(true);
    try {
      const res = await fetch('/api/prd/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.score) {
        window.pendo?.track('prd_scored', {
          session_id: sessionId,
          overall_score: data.score.overall,
          clarity_score: data.score.clarity,
          completeness_score: data.score.completeness,
          testability_score: data.score.testability,
          measurability_score: data.score.measurability,
          gaps_count: Array.isArray(data.score.gaps) ? data.score.gaps.length : 0,
          suggestions_count: Array.isArray(data.score.suggestions) ? data.score.suggestions.length : 0,
        });
        setScore(data.score);
      }
    } catch {
      // silently fail
    } finally {
      setScoreLoading(false);
    }
  };

  const handleShare = async () => {
    if (shareUrl) { setShareModalOpen(true); return; }
    setShareLoading(true);
    try {
      const res = await fetch('/api/prd/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.share_url) {
        const token = data.share_url.split('/').pop() ?? '';
        window.pendo?.track('prd_share_link_created', {
          session_id: sessionId,
          share_token: token,
        });
        setShareUrl(data.share_url);
        setShareModalOpen(true);
      }
    } catch {
      // silently fail
    } finally {
      setShareLoading(false);
    }
  };

  const handleBreakdown = async () => {
    if (tickets) { setTicketModalOpen(true); return; }
    setTicketLoading(true);
    try {
      const res = await fetch('/api/prd/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.tickets) {
        const epics = data.tickets.epics ?? [];
        window.pendo?.track('ticket_breakdown_generated', {
          session_id: sessionId,
          epics_count: epics.length,
          total_stories_count: epics.reduce((sum: number, e: { stories?: unknown[] }) => sum + (e.stories?.length ?? 0), 0),
        });
        setTickets(data.tickets);
        setTicketModalOpen(true);
      }
    } catch {
      // silently fail
    } finally {
      setTicketLoading(false);
    }
  };

  if (loading || swarmLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 40%, rgba(109,94,245,0.10) 0%, transparent 70%), #0A0A0F` }}>
        <LoadingSpinner size="lg" />
        <div className="text-center">
          <p className="text-lg font-semibold text-white mb-2">
            {swarmLoading ? 'Re-generating with AI Agents' : 'Building your PRD'}
          </p>
          <p className="text-sm text-gray-500 animate-pulse">
            {swarmLoading ? swarmMsg : loadingMsg}
          </p>
        </div>
        <div className="flex gap-2 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full animate-pulse-slow"
              style={{ background: '#6D5EF5', animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-16">
          <div className="rounded-2xl px-8 py-10 text-center"
            style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.20)' }}>
            <p className="text-danger font-semibold mb-2">PRD generation failed</p>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <a href="/new" className="btn-primary text-sm px-5 py-2.5 rounded-xl inline-flex">
              Start over
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (!prd) return null;

  const currentPrd = livePrd ?? prd;

  return (
    <div className="min-h-screen bg-background">
      <ExportBar
        prd={currentPrd}
        onRegenerate={handleRegenerate}
        onScore={handleScore}
        onShare={handleShare}
        onBreakdown={handleBreakdown}
        swarmLoading={swarmLoading}
        scoreLoading={scoreLoading}
        shareLoading={shareLoading}
        ticketLoading={ticketLoading}
      />

      {/* Navigation strip — always visible, not inside Actions dropdown */}
      <div className="mx-auto max-w-4xl px-4 pt-5 pb-0 flex items-center gap-2">
        <Link
          href="/dashboard"
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          ← Dashboard
        </Link>
        <Link
          href="/new"
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          New PRD
        </Link>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        {score && <ScoringWidget score={score} />}
        <PRDDocument
          prd={prd}
          onSectionSave={handleSectionSave}
          onPrdChange={setLivePrd}
        />
      </main>

      {shareModalOpen && shareUrl && (
        <ShareModal shareUrl={shareUrl} onClose={() => setShareModalOpen(false)} />
      )}
      {ticketModalOpen && tickets && (
        <TicketBreakdown tickets={tickets} onClose={() => setTicketModalOpen(false)} />
      )}
    </div>
  );
}
