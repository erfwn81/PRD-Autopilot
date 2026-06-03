'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import PRDDocument from '@/components/prd/PRDDocument';
import ExportBar from '@/components/prd/ExportBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { PRDDocument as PRDDocType } from '@/types';

const LOADING_MESSAGES = [
  'Defining the problem space...',
  'Building user personas...',
  'Writing user stories...',
  'Mapping acceptance criteria...',
  'Drafting your rollout plan...',
  'Finalising the PRD...',
];

export default function ResultPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [prd, setPrd] = useState<PRDDocType | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
        <LoadingSpinner />
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-1">Building your PRD</p>
          <p className="text-gray-500 text-sm animate-pulse">{loadingMsg}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <ExportBar prd={prd} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <PRDDocument prd={prd} onSectionSave={handleSectionSave} />
      </main>
    </div>
  );
}
