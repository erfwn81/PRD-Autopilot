'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { PRDDocument } from '@/types';
import type { PRDComment } from '@/types/agent';

interface SectionCommentProps {
  shareToken: string;
  sectionKey: string;
}

function SectionComments({ shareToken, sectionKey }: SectionCommentProps) {
  const [comments, setComments] = useState<PRDComment[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/prd/comments?share_token=${shareToken}&section_key=${sectionKey}`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments ?? []));
  }, [shareToken, sectionKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/prd/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ share_token: shareToken, section_key: sectionKey, author_name: name.trim(), content: content.trim() }),
      });
      const data = await res.json();
      if (data.comment) {
        window.pendo?.track('prd_comment_submitted', {
          share_token: shareToken,
          section_key: sectionKey,
          comment_length: content.trim().length,
        });
        setComments((prev) => [...prev, data.comment]);
        setContent('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Comments ({comments.length})
      </p>
      {comments.map((c) => (
        <div key={c.id} className="mb-2 rounded-lg bg-gray-50 px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-900">{c.author_name}</span>
            <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-gray-700">{c.content}</p>
        </div>
      ))}
      <form onSubmit={handleSubmit} className="mt-3 space-y-2">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
        <textarea
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={submitting || !name.trim() || !content.trim()}
          className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post comment'}
        </button>
      </form>
    </div>
  );
}

interface SectionBlockProps {
  title: string;
  sectionKey: string;
  shareToken: string;
  children: React.ReactNode;
}

function SectionBlock({ title, sectionKey, shareToken, children }: SectionBlockProps) {
  return (
    <div className="py-6 border-b border-gray-100 last:border-0">
      <h2 className="text-base font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="text-sm text-gray-700">{children}</div>
      <SectionComments shareToken={shareToken} sectionKey={sectionKey} />
    </div>
  );
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [prd, setPrd] = useState<PRDDocument | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/prd/share/${token}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setPrd(data.prd);
        setTitle(data.title);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !prd) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold text-gray-900 mb-2">PRD not found</p>
        <p className="text-sm text-gray-500">This PRD has been removed or the link is invalid.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
            Product Requirements Document
          </p>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-8">
          {prd.problem_statement && (
            <SectionBlock title="1. Problem Statement" sectionKey="problem_statement" shareToken={token}>
              <p className="whitespace-pre-wrap">{prd.problem_statement}</p>
            </SectionBlock>
          )}

          {Array.isArray(prd.user_personas) && prd.user_personas.length > 0 && (
            <SectionBlock title="2. User Personas" sectionKey="user_personas" shareToken={token}>
              <div className="grid gap-3 sm:grid-cols-2">
                {prd.user_personas.map((p, i) => (
                  <div key={i} className="rounded-lg bg-gray-50 p-4">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-indigo-600 mb-1">{p.role}</p>
                    <p className="text-sm text-gray-600 mb-1">{p.context}</p>
                    <p className="text-sm text-red-600 italic">&ldquo;{p.pain_point}&rdquo;</p>
                  </div>
                ))}
              </div>
            </SectionBlock>
          )}

          {Array.isArray(prd.jobs_to_be_done) && prd.jobs_to_be_done.length > 0 && (
            <SectionBlock title="3. Jobs to Be Done" sectionKey="jobs_to_be_done" shareToken={token}>
              <ul className="space-y-1">
                {prd.jobs_to_be_done.map((j, i) => <li key={i} className="flex gap-2"><span className="text-indigo-400">›</span><span>{j}</span></li>)}
              </ul>
            </SectionBlock>
          )}

          {Array.isArray(prd.user_stories) && prd.user_stories.length > 0 && (
            <SectionBlock title="4. User Stories" sectionKey="user_stories" shareToken={token}>
              <div className="space-y-2">
                {prd.user_stories.map((s, i) => (
                  <div key={i} className="flex gap-3 items-start py-1.5 border-b border-gray-50 last:border-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${s.priority === 'must-have' ? 'bg-red-100 text-red-700' : s.priority === 'should-have' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      {s.priority}
                    </span>
                    <p>{s.story}</p>
                  </div>
                ))}
              </div>
            </SectionBlock>
          )}

          {Array.isArray(prd.acceptance_criteria) && prd.acceptance_criteria.length > 0 && (
            <SectionBlock title="5. Acceptance Criteria" sectionKey="acceptance_criteria" shareToken={token}>
              <div className="space-y-3">
                {prd.acceptance_criteria.map((ac, i) => (
                  <div key={i}>
                    <p className="font-medium mb-1">{ac.story_ref}</p>
                    <ul className="space-y-0.5">
                      {ac.criteria.map((c: string, j: number) => (
                        <li key={j} className="flex gap-2 text-gray-600"><span className="text-green-500">✓</span><span>{c}</span></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </SectionBlock>
          )}

          {Array.isArray(prd.edge_cases) && prd.edge_cases.length > 0 && (
            <SectionBlock title="6. Edge Cases & Error States" sectionKey="edge_cases" shareToken={token}>
              <div className="space-y-2">
                {prd.edge_cases.map((ec, i) => (
                  <div key={i} className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                    <p className="font-medium text-amber-900">{ec.scenario}</p>
                    <p className="text-amber-700 mt-1">{ec.expected_behavior}</p>
                  </div>
                ))}
              </div>
            </SectionBlock>
          )}

          {Array.isArray(prd.out_of_scope) && prd.out_of_scope.length > 0 && (
            <SectionBlock title="7. Out of Scope" sectionKey="out_of_scope" shareToken={token}>
              <ul className="space-y-1">
                {prd.out_of_scope.map((item, i) => <li key={i} className="flex gap-2 text-gray-600"><span className="text-gray-400">✗</span><span>{item}</span></li>)}
              </ul>
            </SectionBlock>
          )}

          {Array.isArray(prd.success_metrics) && prd.success_metrics.length > 0 && (
            <SectionBlock title="8. Success Metrics" sectionKey="success_metrics" shareToken={token}>
              <div className="grid gap-3 sm:grid-cols-2">
                {prd.success_metrics.map((m, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 p-3">
                    <p className="font-semibold">{m.metric}</p>
                    <p className="text-2xl font-bold text-indigo-600">{m.target}</p>
                    <p className="text-xs text-gray-500">{m.measurement_method} · {m.timeframe}</p>
                  </div>
                ))}
              </div>
            </SectionBlock>
          )}

          {Array.isArray(prd.open_questions) && prd.open_questions.length > 0 && (
            <SectionBlock title="10. Open Questions" sectionKey="open_questions" shareToken={token}>
              <div className="space-y-2">
                {prd.open_questions.map((q, i) => (
                  <div key={i} className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                    <p className="font-medium text-blue-900">{q.question}</p>
                    <p className="text-xs text-blue-600 mt-1">Owner: {q.owner}</p>
                    {q.impact && <p className="text-xs text-blue-700 mt-1 italic">Impact: {q.impact}</p>}
                  </div>
                ))}
              </div>
            </SectionBlock>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Shared via PRD Autopilot — <a href="https://prd-autopilot.vercel.app" className="hover:underline">Create your own at prd-autopilot.vercel.app</a>
        </p>
      </div>
    </div>
  );
}
