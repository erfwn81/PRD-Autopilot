'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
      if (data.score) setScore(data.score);
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
        <LoadingSpinner />
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-1">
            {swarmLoading ? 'Re-generating with AI Agents' : 'Building your PRD'}
          </p>
          <p className="text-gray-500 text-sm animate-pulse">
            {swarmLoading ? swarmMsg : loadingMsg}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-16">
          <div className="rounded-lg bg-red-50 border border-red-200 px-6 py-8 text-center">
            <p className="text-red-700 font-medium mb-2">PRD generation failed</p>
            <p className="text-red-600 text-sm">{error}</p>
            <a href="/new" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
              Start over
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (!prd) return null;

  const currentPrd = livePrd ?? prd;

  const btnBase = 'text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50';

  return (
    <div className="min-h-screen bg-gray-50">
      <ExportBar prd={currentPrd} />

      {/* New actions bar */}
      <div className="sticky top-[57px] z-10 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 py-2 flex items-center gap-2 flex-wrap">
          <button onClick={handleRegenerate} disabled={swarmLoading} className={btnBase}>
            Re-generate (Multi-Agent)
          </button>
          <button onClick={handleScore} disabled={scoreLoading} className={btnBase}>
            {scoreLoading ? 'Scoring...' : score ? 'Rescore PRD' : 'Score this PRD'}
          </button>
          <button onClick={handleShare} disabled={shareLoading} className={btnBase}>
            {shareLoading ? 'Creating link...' : 'Share for Review'}
          </button>
          <button onClick={handleBreakdown} disabled={ticketLoading} className={btnBase}>
            {ticketLoading ? 'Breaking down...' : 'Break into Tickets'}
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-4">
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
