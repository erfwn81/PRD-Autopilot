'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VerdictGauge from '@/components/founder/VerdictGauge';

interface MarketData { tam: string; sam: string; som: string; growth_trend: string; summary: string; error?: boolean }
interface Competitor { name: string; description: string; strengths: string; weaknesses: string; url: string }
interface CompetitorData { competitors: Competitor[]; market_gap: string; error?: boolean }
interface CustomerData { icp: { demographics: string; psychographics: string; where_to_find: string }; early_adopters: string; personas: Array<{ name: string; role: string; motivation: string; objection: string }>; error?: boolean }
interface Risk { category: string; description: string; severity: 'high' | 'medium' | 'low'; mitigation: string }
interface RiskData { risks: Risk[]; error?: boolean }
interface SwotData { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[]; error?: boolean }
interface VerdictData { score: number; recommendation: 'build' | 'pivot' | 'validate-more' | 'avoid'; rationale: string; next_steps: string[]; error?: boolean }

interface ValidationReport {
  id: string;
  idea_input: string;
  market_size: MarketData | null;
  competitors: CompetitorData | null;
  target_customer: CustomerData | null;
  risks: RiskData | null;
  swot: SwotData | null;
  verdict: VerdictData | null;
  sources: string[] | null;
  created_at: string;
}

const severityColor = { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' };

function SectionError() {
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
      style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.20)', color: '#D97706' }}
    >
      <span className="shrink-0">⚠</span>
      <span>This section could not be generated. Try regenerating the report.</span>
    </div>
  );
}

function SwotQuadrant({ label, items, color }: { label: string; items: string[]; color: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: `${color}0D`, border: `1px solid ${color}20` }}>
      <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color }}>{label}</h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-gray-300 flex gap-2">
            <span className="shrink-0 mt-0.5" style={{ color }}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ValidationReportPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchReport = useCallback(async () => {
    try {
      const res = await fetch(`/api/validation/${reportId}`);
      if (!res.ok) throw new Error('Report not found');
      const data = await res.json();
      setReport(data.report);
    } catch {
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return; }
      fetchReport();
    });
  }, [router, fetchReport]);

  const handleDelete = async () => {
    if (!confirm('Delete this report? This cannot be undone.')) return;
    await fetch(`/api/validation/${reportId}`, { method: 'DELETE' });
    router.push('/dashboard');
  };

  const handleGeneratePitch = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/pitch/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validation_id: reportId, idea: report?.idea_input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/pitch/${data.deck_id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate pitch deck');
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="space-y-4 w-full max-w-3xl px-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 rounded-2xl shimmer-bg" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">{error || 'Report not found'}</p>
        </main>
      </div>
    );
  }

  const verdict = report.verdict;
  const market = report.market_size;
  const competitors = report.competitors;
  const customer = report.target_customer;
  const risks = report.risks;
  const swot = report.swot;
  const sources = report.sources ?? [];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-10">

        {/* Action bar */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <button
            onClick={() => {
              window.pendo?.track('validation_to_prd_initiated', {
                report_id: reportId,
                idea_input_length: report.idea_input.length,
                verdict_score: report.verdict?.score,
                verdict_recommendation: report.verdict?.recommendation,
              });
              router.push(`/new?idea=${encodeURIComponent(report.idea_input)}`);
            }}
            className="btn-primary px-4 py-2 rounded-xl text-sm"
          >
            Turn into PRD →
          </button>
          <button
            onClick={handleGeneratePitch}
            disabled={generating}
            className="btn-ghost px-4 py-2 rounded-xl text-sm disabled:opacity-40"
          >
            {generating ? 'Generating...' : 'Generate Pitch Deck'}
          </button>
          <button
            onClick={handleDelete}
            className="ml-auto px-4 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 transition-colors"
            style={{ border: '1px solid rgba(239,68,68,0.20)' }}
          >
            Delete
          </button>
        </div>

        {/* Hero: Verdict */}
        {verdict && !verdict.error ? (
          <div
            className="rounded-2xl p-8 mb-6 flex flex-col sm:flex-row items-center gap-8"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="shrink-0">
              <VerdictGauge score={verdict.score} recommendation={verdict.recommendation} size="lg" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Idea Validation</p>
              <h1 className="text-2xl font-bold text-white mb-3 leading-snug">{report.idea_input}</h1>
              <p className="text-gray-300 text-sm leading-relaxed">{verdict.rationale}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h1 className="text-xl font-bold text-white mb-2">{report.idea_input}</h1>
            <SectionError />
          </div>
        )}

        {/* Market Size */}
        <Section title="Market Size" icon="📈">
          {market && !market.error ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'TAM', value: market.tam },
                  { label: 'SAM', value: market.sam },
                  { label: 'SOM', value: market.som },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(109,94,245,0.08)', border: '1px solid rgba(109,94,245,0.15)' }}>
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-500">Growth trend:</span>
                <span className="text-xs text-gray-300">{market.growth_trend}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{market.summary}</p>
            </>
          ) : <SectionError />}
        </Section>

        {/* Competitors */}
        <Section title="Competitors" icon="⚔️">
          {competitors && !competitors.error ? (
            <>
              <div className="space-y-3 mb-4">
                {(competitors.competitors ?? []).map((c, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-sm font-semibold text-white">{c.name}</h4>
                      {c.url && (
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#22D3EE] hover:underline shrink-0">
                          Visit →
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{c.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-green-400 font-medium">+ </span>
                        <span className="text-gray-400">{c.strengths}</span>
                      </div>
                      <div>
                        <span className="text-red-400 font-medium">− </span>
                        <span className="text-gray-400">{c.weaknesses}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {competitors.market_gap && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
                  <p className="text-xs font-semibold text-[#22D3EE] mb-1">Market Gap</p>
                  <p className="text-sm text-gray-300">{competitors.market_gap}</p>
                </div>
              )}
            </>
          ) : <SectionError />}
        </Section>

        {/* Target Customer */}
        <Section title="Target Customer" icon="👥">
          {customer && !customer.error ? (
            <>
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Demographics', value: customer.icp?.demographics },
                  { label: 'Psychographics', value: customer.icp?.psychographics },
                  { label: 'Where to find them', value: customer.icp?.where_to_find },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-xs text-gray-300">{value}</p>
                  </div>
                ))}
              </div>
              {customer.early_adopters && (
                <p className="text-sm text-gray-400 mb-4">
                  <span className="text-gray-300 font-medium">Early adopters: </span>
                  {customer.early_adopters}
                </p>
              )}
              <div className="space-y-3">
                {(customer.personas ?? []).map((p, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-white">{p.name}</span>
                      <span className="text-xs text-gray-500">— {p.role}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1"><span className="text-gray-300">Motivation: </span>{p.motivation}</p>
                    <p className="text-xs text-gray-400"><span className="text-red-400">Objection: </span>{p.objection}</p>
                  </div>
                ))}
              </div>
            </>
          ) : <SectionError />}
        </Section>

        {/* Risks */}
        <Section title="Risks" icon="⚠️">
          {risks && !risks.error ? (
            <div className="space-y-3">
              {(risks.risks ?? []).map((r, i) => (
                <div key={i} className="rounded-xl p-4 flex gap-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="shrink-0">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${severityColor[r.severity]}15`, color: severityColor[r.severity] }}
                    >
                      {r.severity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-300 mb-1">{r.category}</p>
                    <p className="text-xs text-gray-400 mb-2">{r.description}</p>
                    <p className="text-xs text-gray-500"><span className="text-gray-400">Mitigation: </span>{r.mitigation}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <SectionError />}
        </Section>

        {/* SWOT */}
        <Section title="SWOT Analysis" icon="🔲">
          {swot && !swot.error ? (
            <div className="grid grid-cols-2 gap-3">
              <SwotQuadrant label="Strengths" items={swot.strengths ?? []} color="#22C55E" />
              <SwotQuadrant label="Weaknesses" items={swot.weaknesses ?? []} color="#EF4444" />
              <SwotQuadrant label="Opportunities" items={swot.opportunities ?? []} color="#6D5EF5" />
              <SwotQuadrant label="Threats" items={swot.threats ?? []} color="#F59E0B" />
            </div>
          ) : <SectionError />}
        </Section>

        {/* Next Steps */}
        {verdict && !verdict.error && Array.isArray(verdict.next_steps) && verdict.next_steps.length > 0 && (
          <Section title="Next Steps" icon="🚀">
            <ol className="space-y-2">
              {verdict.next_steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: 'rgba(109,94,245,0.15)', color: '#8B7CFF' }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <Section title="Web Sources" icon="🔗">
            <ul className="space-y-1">
              {sources.map((url, i) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#22D3EE] hover:underline truncate block"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

      </main>
      <Footer />
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6 mb-4"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}
