'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Footer from '@/components/layout/Footer';

/* ── Tiny IntersectionObserver hook ───────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, inView]);
  return { ref, inView };
}

/* ── Mock PRD preview card (hero decoration) ───────────────────── */
function MockPRDCard() {
  const sections = [
    { label: 'Problem Statement', w: '90%', color: '#6D5EF5' },
    { label: 'User Personas',     w: '70%', color: '#22D3EE' },
    { label: 'User Stories',      w: '80%', color: '#34D399' },
    { label: 'Acceptance Criteria', w:'60%', color: '#FBBF24' },
    { label: 'Success Metrics',   w: '75%', color: '#F87171' },
  ];
  return (
    <div
      className="rounded-2xl p-6 w-full max-w-sm mx-auto animate-float"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 0 60px rgba(109,94,245,0.25), 0 30px 60px rgba(0,0,0,0.4)',
      }}
    >
      {/* Fake title row */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
        <span className="text-xs font-mono text-gray-400">PRD · User Analytics Dashboard</span>
      </div>
      {/* Section rows */}
      <div className="space-y-3">
        {sections.map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: s.w, background: s.color, opacity: 0.7 }}
              />
            </div>
          </div>
        ))}
      </div>
      {/* Bottom badge */}
      <div className="mt-5 flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success font-medium">Complete</span>
        <span className="text-xs text-gray-600">10 sections · 5 agents</span>
      </div>
    </div>
  );
}

/* ── Feature card ───────────────────────────────────────────────── */
interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
  gradient: string;
}

function FeatureCard({ feature, delay }: { feature: Feature; delay: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className="rounded-2xl p-6 transition-all duration-500 cursor-default"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${delay}ms`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(109,94,245,0.35)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: feature.gradient }}
      >
        {feature.icon}
      </div>
      <h3 className="text-sm font-semibold text-white mb-2">{feature.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
    </div>
  );
}

const features: Feature[] = [
  {
    icon: <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
    title: 'Multi-Agent Generation',
    desc: '5 specialized AI agents run in parallel — personas, problem statement, stories, criteria, and metrics — in seconds.',
    gradient: 'linear-gradient(135deg,#6D5EF5,#8B7CFF)',
  },
  {
    icon: <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>,
    title: 'AI Interview',
    desc: 'A conversational interview extracts exactly what a senior PM would ask — no more blank-page paralysis.',
    gradient: 'linear-gradient(135deg,#22D3EE,#6D5EF5)',
  },
  {
    icon: <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
    title: 'PRD Health Scoring',
    desc: 'Instant quality scores across clarity, completeness, testability, and measurability with targeted suggestions.',
    gradient: 'linear-gradient(135deg,#34D399,#22D3EE)',
  },
  {
    icon: <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>,
    title: 'Stakeholder Review',
    desc: 'Share a public link. Anyone can read every section and leave inline threaded comments — no account needed.',
    gradient: 'linear-gradient(135deg,#FBBF24,#F87171)',
  },
  {
    icon: <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>,
    title: 'Ticket Breakdown',
    desc: 'One click turns your PRD into a structured backlog of epics, stories, and tasks with estimates. Export as JSON.',
    gradient: 'linear-gradient(135deg,#F87171,#FBBF24)',
  },
  {
    icon: <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
    title: 'PM Chat',
    desc: 'Chat with an expert PM coach. Link your PRD for context-aware advice on prioritisation, roadmaps, and strategy.',
    gradient: 'linear-gradient(135deg,#6D5EF5,#34D399)',
  },
  {
    icon: <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
    title: 'Idea Validation',
    desc: 'Validate a startup idea with live web research — market size, competitors, target customer, risks, SWOT, and a go/no-go verdict. Know before you build.',
    gradient: 'linear-gradient(135deg,#8B5CF6,#6D5EF5)',
  },
  {
    icon: <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>,
    title: 'Pitch Deck Generator',
    desc: 'Turn your idea or PRD into a structured 10-slide investor pitch deck. Link your validation report for market-grounded slides.',
    gradient: 'linear-gradient(135deg,#22D3EE,#34D399)',
  },
];

/* ── Main page ──────────────────────────────────────────────────── */
export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const featuresRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setUserLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setUserLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'rgba(10,10,15,0.80)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(255,255,255,0.07)',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 1.5L12.2 8H19L13.4 11.9L15.6 18.5L10 14.6L4.4 18.5L6.6 11.9L1 8H7.8L10 1.5Z"
                fill="url(#nav-spark)" />
              <defs>
                <linearGradient id="nav-spark" x1="1" y1="1.5" x2="19" y2="18.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6D5EF5"/><stop offset="1" stopColor="#22D3EE"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="font-semibold text-white text-sm">PRD Autopilot</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#how" className="text-sm text-gray-400 hover:text-white transition-colors">How it works</a>
          </nav>

          <div className="flex items-center gap-2">
            {userLoading ? (
              <div className="h-7 w-24 rounded-lg shimmer-bg" />
            ) : user ? (
              <Link href="/dashboard" className="btn-primary text-sm px-4 py-1.5 rounded-lg">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                  Sign in
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm px-4 py-1.5 rounded-lg">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-16 text-center overflow-hidden bg-grid">
        {/* Radial violet glow behind hero */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(109,94,245,0.18) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
            style={{ background: 'rgba(109,94,245,0.12)', border: '1px solid rgba(109,94,245,0.3)', color: '#8B7CFF' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
            Powered by 5 specialized AI agents
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
            From vague idea to{' '}
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg,#6D5EF5,#22D3EE)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              engineering-ready PRD
            </span>{' '}
            in minutes.
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
            Answer 5 targeted questions. Multi-agent AI writes every section — personas, stories,
            acceptance criteria, rollout plan, success metrics — all in one shot.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link
              href="/new"
              className="btn-primary text-base px-7 py-3.5 rounded-xl inline-flex items-center gap-2"
            >
              Start free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="#how"
              className="btn-ghost text-base px-7 py-3.5 rounded-xl inline-flex items-center gap-2"
            >
              See how it works
            </a>
          </div>

          {/* Mock PRD card */}
          <MockPRDCard />
        </div>
      </section>

      {/* ── TRUST STRIP ─────────────────────────────────────────── */}
      <section className="py-10 border-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-xs text-center text-gray-600 uppercase tracking-widest mb-6">
            Built for product teams that ship
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {['⬡', '◈', '⬟', '◇', '⬠'].map((s, i) => (
              <span key={i} className="text-2xl opacity-20 hover:opacity-40 transition-opacity" style={{ color: '#6D5EF5' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────── */}
      <section id="features" ref={featuresRef as React.RefObject<HTMLElement>} className="py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Platform features</p>
            <h2 className="text-3xl font-bold text-white">Everything a PM team needs</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              One platform from idea to stakeholder-ready specification and beyond.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} feature={f} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how" className="py-24 px-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Process</p>
            <h2 className="text-3xl font-bold text-white">How it works</h2>
          </div>

          <div className="relative">
            {/* Connecting gradient line */}
            <div
              className="hidden sm:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px"
              style={{ background: 'linear-gradient(90deg,#6D5EF5,#22D3EE)' }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  n: '01',
                  title: 'Describe',
                  desc: 'Write 2–3 sentences about the feature you want to build. No structure needed.',
                  color: '#6D5EF5',
                },
                {
                  n: '02',
                  title: 'Interview',
                  desc: 'Answer 5 AI-generated clarifying questions. Takes about 3 minutes.',
                  color: '#8B7CFF',
                },
                {
                  n: '03',
                  title: 'Receive PRD',
                  desc: '10-section PRD generated by 5 parallel AI agents. Export to PDF, Notion, or Markdown.',
                  color: '#22D3EE',
                },
              ].map((step) => (
                <div key={step.n} className="text-center relative">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-lg font-mono font-bold text-white"
                    style={{ background: step.color + '22', border: `1px solid ${step.color}44`, color: step.color }}
                  >
                    {step.n}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-2xl">
          <div
            className="rounded-2xl p-10 text-center relative overflow-hidden"
            style={{
              background: 'rgba(109,94,245,0.07)',
              border: '1px solid rgba(109,94,245,0.25)',
              boxShadow: '0 0 60px rgba(109,94,245,0.12)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 80% 80% at 50% 120%, rgba(109,94,245,0.15) 0%, transparent 70%)',
              }}
            />
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 relative z-10">
              Get started today
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 relative z-10">
              Ready to ship better specs?
            </h2>
            <p className="text-gray-400 mb-8 relative z-10">
              Free to use. No credit card required.
            </p>
            <Link
              href="/auth/signup"
              className="btn-primary text-base px-8 py-3.5 rounded-xl inline-flex items-center gap-2 relative z-10"
            >
              Get started free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
